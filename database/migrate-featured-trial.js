const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  console.error('Make sure .env.local file exists with DATABASE_URL');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Starting migration for featured listing trials...');
    
    // Add trial columns
    await sql`
      ALTER TABLE featured_listings
      ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false
    `;
    console.log('✓ Added is_trial column');
    
    await sql`
      ALTER TABLE featured_listings
      ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false
    `;
    console.log('✓ Added trial_used column');
    
    // Update existing records
    const result = await sql`
      UPDATE featured_listings 
      SET is_trial = false, trial_used = true 
      WHERE is_trial IS NULL
      RETURNING id
    `;
    
    console.log(`✓ Updated ${result.length} existing featured listings`);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();