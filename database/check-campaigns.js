#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkCampaigns() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔍 CHECKING CLAIM CAMPAIGNS\n');
  
  // Check total businesses vs claim campaigns
  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM businesses) as total_businesses,
      (SELECT COUNT(*) FROM claim_campaigns) as total_campaigns,
      (SELECT COUNT(*) FROM claim_campaigns WHERE claim_token IS NOT NULL) as with_tokens
  `;
  
  console.log(`Total businesses: ${stats[0].total_businesses}`);
  console.log(`Total claim campaigns: ${stats[0].total_campaigns}`);
  console.log(`Campaigns with tokens: ${stats[0].with_tokens}`);
  
  // Check for businesses without campaigns
  const without = await sql`
    SELECT COUNT(*) as count
    FROM businesses b
    LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
    WHERE cc.id IS NULL
  `;
  
  console.log(`Businesses without campaigns: ${without[0].count}`);
  
  // Check recent businesses
  const recent = await sql`
    SELECT b.id, b.name, b.created_at, cc.claim_token
    FROM businesses b
    LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
    ORDER BY b.created_at DESC
    LIMIT 10
  `;
  
  console.log('\n📋 10 Most Recent Businesses:');
  recent.forEach(b => {
    console.log(`  ${b.name}: ${b.claim_token || 'NO CAMPAIGN/TOKEN'}`);
  });
  
  // Check if trigger exists
  const trigger = await sql`
    SELECT COUNT(*) as count
    FROM pg_trigger
    WHERE tgname = 'auto_generate_claim_token_trigger'
  `;
  
  console.log(`\n⚙️ Auto-generate trigger exists: ${trigger[0].count > 0 ? 'YES' : 'NO'}`);
}

checkCampaigns().catch(console.error);