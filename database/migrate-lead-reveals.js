const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Creating lead_reveals table...');
    
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS lead_reveals (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID NOT NULL,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        credits_used INTEGER DEFAULT 1,
        revealed_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(lead_id, business_id)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_reveals_lead_id ON lead_reveals(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_reveals_business_id ON lead_reveals(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_reveals_revealed_at ON lead_reveals(revealed_at)`;
    
    console.log('✅ Lead reveals table created successfully');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
  }
}

migrate();