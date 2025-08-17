const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('Creating lead_assignments table...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS lead_assignments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
        notes TEXT,
        quoted_price DECIMAL(10,2),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(lead_id, business_id)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_assignments_business_id ON lead_assignments(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_assignments_status ON lead_assignments(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_assignments_updated_at ON lead_assignments(updated_at)`;
    
    console.log('✅ Lead assignments table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();