const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migratePendingClaims() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Creating pending_claims table...');
    
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS pending_claims (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        business_id UUID NOT NULL,
        user_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_notes TEXT,
        reviewed_by UUID,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(business_id, user_id)
      )
    `;
    
    console.log('✓ Table created');
    
    // Add foreign key constraints separately to avoid issues
    try {
      await sql`
        ALTER TABLE pending_claims 
        ADD CONSTRAINT fk_pending_claims_business
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
      `;
      console.log('✓ Business foreign key added');
    } catch (err) {
      console.log('Business foreign key might already exist');
    }
    
    try {
      await sql`
        ALTER TABLE pending_claims
        ADD CONSTRAINT fk_pending_claims_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
      `;
      console.log('✓ User foreign key added');
    } catch (err) {
      console.log('User foreign key might already exist');
    }
    
    try {
      await sql`
        ALTER TABLE pending_claims
        ADD CONSTRAINT fk_pending_claims_reviewer
        FOREIGN KEY (reviewed_by) 
        REFERENCES users(id)
      `;
      console.log('✓ Reviewer foreign key added');
    } catch (err) {
      console.log('Reviewer foreign key might already exist');
    }
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pending_claims_status 
      ON pending_claims(status)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pending_claims_business_id 
      ON pending_claims(business_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pending_claims_user_id 
      ON pending_claims(user_id)
    `;
    
    console.log('✓ Indexes created');
    
    // Enable RLS
    await sql`ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY`;
    console.log('✓ RLS enabled');
    
    console.log('✅ Pending claims table migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migratePendingClaims();