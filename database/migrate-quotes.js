#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    console.error('Please ensure your .env.local file contains DATABASE_URL');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  
  try {
    console.log('Creating quotes table...');
    
    // Create quotes table
    await sql`
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        customer_zipcode VARCHAR(10),
        service_address VARCHAR(255),
        service_city VARCHAR(100),
        service_state VARCHAR(50),
        service_area VARCHAR(255),
        business_id UUID,
        business_name VARCHAR(255),
        service_type VARCHAR(100) NOT NULL,
        project_description TEXT,
        timeline VARCHAR(50),
        budget VARCHAR(50),
        status VARCHAR(20) DEFAULT 'new',
        source VARCHAR(50) DEFAULT 'website',
        referrer VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )
    `;
    
    console.log('✅ Quotes table created successfully!');
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quotes_service_type ON quotes(service_type)`;
    
    console.log('✅ Indexes created successfully!');
    
    // Enable RLS
    console.log('Setting up Row Level Security...');
    await sql`ALTER TABLE quotes ENABLE ROW LEVEL SECURITY`;
    
    // Create policies
    await sql`
      CREATE POLICY "Allow public to create quotes" ON quotes
      FOR INSERT WITH CHECK (true)
    `;
    
    await sql`
      CREATE POLICY "Allow authenticated users to read quotes" ON quotes
      FOR SELECT USING (true)
    `;
    
    await sql`
      CREATE POLICY "Allow authenticated users to update quotes" ON quotes
      FOR UPDATE USING (true)
    `;
    
    console.log('✅ RLS policies created successfully!');
    
    // Create or update trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = TIMEZONE('utc'::text, NOW());
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    // Create trigger
    await sql`
      CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ Trigger created successfully!');
    console.log('✅ All migrations completed successfully!');
    
  } catch (error) {
    if (error.code === '42P07') {
      console.log('✅ Quotes table already exists');
    } else if (error.code === '42710') {
      console.log('Note: Some policies or indexes already exist, continuing...');
    } else {
      console.error('❌ Migration failed:', error.message);
      console.error('Error code:', error.code);
      process.exit(1);
    }
  }
}

migrate();