#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function generateCampaigns() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🚀 GENERATING CLAIM CAMPAIGNS FOR ALL BUSINESSES\n');
  
  try {
    // Get businesses without campaigns
    const without = await sql`
      SELECT b.id, b.name
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
      WHERE cc.id IS NULL
    `;
    
    console.log(`Found ${without.length} businesses without claim campaigns`);
    
    if (without.length === 0) {
      console.log('All businesses already have campaigns!');
      return;
    }
    
    console.log('Generating campaigns...\n');
    
    let created = 0;
    let errors = 0;
    
    for (const business of without) {
      try {
        // Generate unique token
        const token = Math.random().toString(36).substring(2, 10);
        
        await sql`
          INSERT INTO claim_campaigns (
            business_id,
            claim_token,
            expires_at,
            created_at
          ) VALUES (
            ${business.id},
            ${token},
            NOW() + INTERVAL '30 days',
            NOW()
          )
        `;
        
        created++;
        
        if (created % 100 === 0) {
          console.log(`  Created ${created}/${without.length} campaigns...`);
        }
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.log(`  Error for ${business.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Campaign generation complete!`);
    console.log(`  Successfully created: ${created}`);
    console.log(`  Errors: ${errors}`);
    
    // Final stats
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM businesses) as total_businesses,
        (SELECT COUNT(*) FROM claim_campaigns) as total_campaigns,
        (SELECT COUNT(DISTINCT business_id) FROM claim_campaigns) as unique_campaigns
    `;
    
    console.log('\n📊 Final Database Stats:');
    console.log(`  Total businesses: ${stats[0].total_businesses}`);
    console.log(`  Total campaigns: ${stats[0].total_campaigns}`);
    console.log(`  Unique business campaigns: ${stats[0].unique_campaigns}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateCampaigns().catch(console.error);