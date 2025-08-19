#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function deleteMockData() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🗑️  MOCK DATA DELETION SCRIPT');
  console.log('==============================\n');
  
  try {
    // First, get counts before deletion
    console.log('📊 Current Status:');
    const before = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email
      FROM businesses
    `;
    console.log(`  Total businesses: ${before[0].total}`);
    console.log(`  With email: ${before[0].with_email}\n`);
    
    // Count what we're about to delete
    console.log('🎯 Identifying Mock Data:');
    const toDeleteCount = await sql`
      SELECT COUNT(*) as count
      FROM businesses
      WHERE 
        -- Has both media files (mock pattern)
        (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
        OR
        -- Claimed businesses (test data)
        is_claimed = true
        OR
        -- Suspiciously complete (all optional fields filled)
        (years_in_business IS NOT NULL 
         AND price_range IS NOT NULL 
         AND services IS NOT NULL 
         AND services::text != '[]'
         AND hours IS NOT NULL)
    `;
    
    console.log(`  Mock businesses to delete: ${toDeleteCount[0].count}`);
    
    // Show what will remain
    const willRemain = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email
      FROM businesses
      WHERE NOT (
        (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
        OR is_claimed = true
        OR (years_in_business IS NOT NULL 
            AND price_range IS NOT NULL 
            AND services IS NOT NULL 
            AND services::text != '[]'
            AND hours IS NOT NULL)
      )
    `;
    
    console.log(`  Real businesses to keep: ${willRemain[0].total}`);
    console.log(`  With email after deletion: ${willRemain[0].with_email}\n`);
    
    // Sample what we're deleting
    console.log('📝 Sample of data to DELETE:');
    const deleteSample = await sql`
      SELECT name, city, state, email
      FROM businesses
      WHERE 
        (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
        OR is_claimed = true
        OR (years_in_business IS NOT NULL 
            AND price_range IS NOT NULL 
            AND services IS NOT NULL 
            AND services::text != '[]'
            AND hours IS NOT NULL)
      LIMIT 5
    `;
    
    deleteSample.forEach(b => {
      console.log(`  - ${b.name} (${b.city}, ${b.state}) - ${b.email || 'no email'}`);
    });
    
    console.log('\n⚠️  WARNING: This will permanently delete mock data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
    
    // Wait 5 seconds before deletion
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔥 Deleting mock data...\n');
    
    // Delete related claim_campaigns first (foreign key constraint)
    const campaignsDeleted = await sql`
      DELETE FROM claim_campaigns
      WHERE business_id IN (
        SELECT id FROM businesses
        WHERE 
          (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
          OR is_claimed = true
          OR (years_in_business IS NOT NULL 
              AND price_range IS NOT NULL 
              AND services IS NOT NULL 
              AND services::text != '[]'
              AND hours IS NOT NULL)
      )
    `;
    console.log(`  Deleted ${campaignsDeleted.count} related claim campaigns`);
    
    // Delete related leads if any
    const leadsDeleted = await sql`
      DELETE FROM leads
      WHERE business_ids::text LIKE '%' || (
        SELECT string_agg(id::text, '%')
        FROM businesses
        WHERE 
          (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
          OR is_claimed = true
          OR (years_in_business IS NOT NULL 
              AND price_range IS NOT NULL 
              AND services IS NOT NULL 
              AND services::text != '[]'
              AND hours IS NOT NULL)
      ) || '%'
    `;
    console.log(`  Deleted ${leadsDeleted.count} related leads`);
    
    // Now delete the mock businesses
    const businessesDeleted = await sql`
      DELETE FROM businesses
      WHERE 
        (logo_url IS NOT NULL AND gallery_images IS NOT NULL)
        OR is_claimed = true
        OR (years_in_business IS NOT NULL 
            AND price_range IS NOT NULL 
            AND services IS NOT NULL 
            AND services::text != '[]'
            AND hours IS NOT NULL)
    `;
    
    console.log(`  Deleted ${businessesDeleted.count} mock businesses\n`);
    
    // Show final status
    console.log('✅ Deletion Complete!\n');
    console.log('📊 Final Status:');
    const after = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN is_claimed = true THEN 1 END) as claimed
      FROM businesses
    `;
    
    console.log(`  Total businesses: ${after[0].total}`);
    console.log(`  With email: ${after[0].with_email}`);
    console.log(`  Claimed: ${after[0].claimed}`);
    
    // Show state distribution
    console.log('\n📍 Geographic Distribution (top 10 states):');
    const states = await sql`
      SELECT state, COUNT(*) as count
      FROM businesses
      WHERE state IS NOT NULL AND state != ''
      GROUP BY state
      ORDER BY count DESC
      LIMIT 10
    `;
    
    states.forEach(s => {
      console.log(`  ${s.state}: ${s.count} businesses`);
    });
    
    console.log('\n🎉 Mock data has been successfully removed!');
    console.log('Your database now contains only real business data.');
    
  } catch (error) {
    console.error('❌ Error during deletion:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the deletion
deleteMockData();