require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Creating quote_business_tracking table...');
    
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS quote_business_tracking (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
          business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'new',
          contacted_at TIMESTAMP,
          response_time_minutes INTEGER,
          notes TEXT,
          quoted_amount DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(quote_id, business_id)
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_quote_business_tracking_quote_id 
      ON quote_business_tracking(quote_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_quote_business_tracking_business_id 
      ON quote_business_tracking(business_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_quote_business_tracking_status 
      ON quote_business_tracking(status)
    `;

    console.log('✅ quote_business_tracking table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

migrate();