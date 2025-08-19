#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkTokens() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔍 CHECKING CLAIM TOKENS\n');
  
  const stats = await sql`
    SELECT 
      COUNT(*) as total_businesses,
      COUNT(claim_token) as with_tokens,
      COUNT(CASE WHEN claim_token IS NULL OR claim_token = '' THEN 1 END) as without_tokens
    FROM businesses
  `;
  
  console.log(`Total businesses: ${stats[0].total_businesses}`);
  console.log(`With claim tokens: ${stats[0].with_tokens}`);
  console.log(`Without tokens: ${stats[0].without_tokens}`);
  
  // Check some recent businesses
  const recent = await sql`
    SELECT id, name, claim_token, created_at
    FROM businesses
    ORDER BY created_at DESC
    LIMIT 10
  `;
  
  console.log('\n📋 10 Most Recent Businesses:');
  recent.forEach(b => {
    console.log(`  ${b.name}: ${b.claim_token || 'NO TOKEN'}`);
  });
  
  // Check if trigger exists
  const trigger = await sql`
    SELECT COUNT(*) as count
    FROM pg_trigger
    WHERE tgname = 'auto_generate_claim_token_trigger'
  `;
  
  console.log(`\n⚙️ Auto-generate trigger exists: ${trigger[0].count > 0 ? 'YES' : 'NO'}`);
}

checkTokens().catch(console.error);