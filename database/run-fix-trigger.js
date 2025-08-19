#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function fixTrigger() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔧 FIXING CLAIM TOKEN TRIGGER\n');
  
  try {
    // Read and execute the SQL file
    const sqlContent = fs.readFileSync('database/fix-token-trigger.sql', 'utf8');
    const statements = sqlContent.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql(statement);
      }
    }
    
    console.log('✅ Trigger fixed and campaigns generated!\n');
    
    // Check results
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM businesses) as total_businesses,
        (SELECT COUNT(*) FROM claim_campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM businesses b LEFT JOIN claim_campaigns cc ON b.id = cc.business_id WHERE cc.id IS NULL) as businesses_without_campaigns
    `;
    
    console.log('📊 Final Stats:');
    console.log(`  Total businesses: ${stats[0].total_businesses}`);
    console.log(`  Total campaigns: ${stats[0].total_campaigns}`);
    console.log(`  Businesses without campaigns: ${stats[0].businesses_without_campaigns}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixTrigger().catch(console.error);