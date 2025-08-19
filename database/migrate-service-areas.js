const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateServiceAreas() {
  console.log('Starting service area migration...');
  
  try {
    // Add service area columns
    console.log('Adding service area columns to businesses table...');
    await sql`
      ALTER TABLE businesses
      ADD COLUMN IF NOT EXISTS service_radius_miles INTEGER DEFAULT 25
    `;
    
    await sql`
      ALTER TABLE businesses
      ADD COLUMN IF NOT EXISTS service_zipcodes TEXT[] DEFAULT '{}'
    `;
    
    // Create featured_listings table
    console.log('Creating featured_listings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS featured_listings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        auto_renew BOOLEAN DEFAULT true,
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(business_id)
      )
    `;
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_businesses_service_radius 
      ON businesses(service_radius_miles)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_businesses_service_zipcodes 
      ON businesses USING GIN(service_zipcodes)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_featured_listings_business 
      ON featured_listings(business_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_featured_listings_expires 
      ON featured_listings(expires_at)
    `;
    
    // Create trigger for updated_at
    console.log('Creating updated_at trigger...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    
    await sql`
      DROP TRIGGER IF EXISTS update_featured_listings_updated_at ON featured_listings
    `;
    
    await sql`
      CREATE TRIGGER update_featured_listings_updated_at
      BEFORE UPDATE ON featured_listings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    // Migrate existing featured businesses
    console.log('Migrating existing featured businesses...');
    const featuredBusinesses = await sql`
      SELECT id, featured_until 
      FROM businesses 
      WHERE is_featured = true
    `;
    
    console.log(`Found ${featuredBusinesses.length} featured businesses to migrate`);
    
    for (const business of featuredBusinesses) {
      const expiresAt = business.featured_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await sql`
        INSERT INTO featured_listings (business_id, expires_at, auto_renew)
        VALUES (${business.id}::uuid, ${expiresAt}, true)
        ON CONFLICT (business_id) DO NOTHING
      `;
    }
    
    // Create the service location check function
    console.log('Creating service location check function...');
    await sql`
      CREATE OR REPLACE FUNCTION business_services_location(
        p_business_id UUID,
        p_customer_lat DECIMAL,
        p_customer_lng DECIMAL,
        p_customer_zipcode VARCHAR(10)
      ) RETURNS BOOLEAN AS $$
      DECLARE
        v_business_lat DECIMAL;
        v_business_lng DECIMAL;
        v_service_radius_miles INTEGER;
        v_service_zipcodes TEXT[];
        v_distance_miles DECIMAL;
      BEGIN
        -- Get business details
        SELECT 
          latitude,
          longitude,
          service_radius_miles,
          service_zipcodes
        INTO 
          v_business_lat,
          v_business_lng,
          v_service_radius_miles,
          v_service_zipcodes
        FROM businesses
        WHERE id = p_business_id;

        -- Check if zipcode matches
        IF p_customer_zipcode IS NOT NULL AND v_service_zipcodes IS NOT NULL THEN
          IF p_customer_zipcode = ANY(v_service_zipcodes) THEN
            RETURN TRUE;
          END IF;
        END IF;

        -- Check radius if we have coordinates
        IF v_business_lat IS NOT NULL AND v_business_lng IS NOT NULL 
           AND p_customer_lat IS NOT NULL AND p_customer_lng IS NOT NULL THEN
          -- Calculate distance using Haversine formula (approximation)
          v_distance_miles := (
            3959 * acos(
              GREATEST(-1, LEAST(1,
                cos(radians(p_customer_lat)) * cos(radians(v_business_lat)) *
                cos(radians(v_business_lng) - radians(p_customer_lng)) +
                sin(radians(p_customer_lat)) * sin(radians(v_business_lat))
              ))
            )
          );
          
          IF v_distance_miles <= COALESCE(v_service_radius_miles, 25) THEN
            RETURN TRUE;
          END IF;
        END IF;

        RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql
    `;
    
    // Set default service radius for all businesses
    console.log('Setting default service radius for existing businesses...');
    await sql`
      UPDATE businesses 
      SET service_radius_miles = 25 
      WHERE service_radius_miles IS NULL
    `;
    
    console.log('Migration completed successfully!');
    
    // Show summary
    const businessCount = await sql`SELECT COUNT(*) as count FROM businesses`;
    const featuredCount = await sql`SELECT COUNT(*) as count FROM featured_listings`;
    
    console.log(`\nSummary:`);
    console.log(`- Total businesses: ${businessCount[0].count}`);
    console.log(`- Featured listings: ${featuredCount[0].count}`);
    console.log(`- All businesses now have service_radius_miles field`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateServiceAreas();