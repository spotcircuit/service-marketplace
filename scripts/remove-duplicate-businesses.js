// Script to remove duplicate businesses from the database
// Keeps only the oldest (first created) business in each duplicate group
// Preserves any claimed businesses over unclaimed duplicates

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function removeDuplicates(dryRun = true) {
  try {
    console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made' : '⚠️  LIVE MODE - Changes will be made to database');
    console.log('='.repeat(80));
    console.log('');

    // Find duplicates based on email + location
    const duplicateGroups = await sql`
      WITH business_groups AS (
        SELECT 
          email,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count,
          array_agg(
            json_build_object(
              'id', id,
              'name', name,
              'email', email,
              'phone', phone,
              'address', address,
              'city', city,
              'state', state,
              'zipcode', zipcode,
              'is_claimed', is_claimed,
              'created_at', created_at
            ) ORDER BY 
              is_claimed DESC,  -- Keep claimed businesses first
              created_at ASC    -- Then keep oldest
          ) as businesses
        FROM businesses
        WHERE email IS NOT NULL 
          AND email != ''
          AND city IS NOT NULL
          AND state IS NOT NULL
        GROUP BY email, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT *
      FROM business_groups
      ORDER BY duplicate_count DESC, email
    `;

    console.log(`Found ${duplicateGroups.length} groups of duplicates to process\n`);

    let totalToDelete = 0;
    let totalToKeep = 0;
    const businessesToDelete = [];

    for (const group of duplicateGroups) {
      const businesses = group.businesses;
      
      // First business in array is the one to keep (claimed or oldest)
      const businessToKeep = businesses[0];
      const duplicatesToRemove = businesses.slice(1);
      
      console.log(`\n📍 ${group.email} in ${group.city}, ${group.state} ${group.zipcode}`);
      console.log(`   Keeping: ${businessToKeep.name} (ID: ${businessToKeep.id})`);
      console.log(`            Created: ${new Date(businessToKeep.created_at).toLocaleDateString()}, Claimed: ${businessToKeep.is_claimed ? 'Yes' : 'No'}`);
      
      if (duplicatesToRemove.length > 0) {
        console.log(`   Removing ${duplicatesToRemove.length} duplicates:`);
        for (const dup of duplicatesToRemove) {
          console.log(`      - ${dup.name} (ID: ${dup.id})`);
          businessesToDelete.push(dup.id);
        }
      }
      
      totalToKeep++;
      totalToDelete += duplicatesToRemove.length;
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Groups to process: ${duplicateGroups.length}`);
    console.log(`Businesses to keep: ${totalToKeep}`);
    console.log(`Businesses to delete: ${totalToDelete}`);

    if (!dryRun && businessesToDelete.length > 0) {
      console.log('\n⏳ Deleting duplicate businesses...');
      
      // Delete in batches to avoid query size limits
      const batchSize = 100;
      for (let i = 0; i < businessesToDelete.length; i += batchSize) {
        const batch = businessesToDelete.slice(i, i + batchSize);
        
        // First delete any related records
        await sql`
          DELETE FROM claim_campaigns 
          WHERE business_id = ANY(${batch}::uuid[])
        `;
        
        await sql`
          DELETE FROM quotes 
          WHERE business_id = ANY(${batch}::uuid[])
        `;
        
        await sql`
          DELETE FROM lead_reveals 
          WHERE business_id = ANY(${batch}::uuid[])
        `;
        
        await sql`
          DELETE FROM lead_assignments 
          WHERE business_id = ANY(${batch}::uuid[])
        `;
        
        // Then delete the businesses
        const result = await sql`
          DELETE FROM businesses 
          WHERE id = ANY(${batch}::uuid[])
        `;
        
        console.log(`   Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(businessesToDelete.length/batchSize)} (${batch.length} businesses)`);
      }
      
      console.log('\n✅ Duplicate removal complete!');
    } else if (dryRun) {
      console.log('\n💡 To actually remove duplicates, run: node scripts/remove-duplicate-businesses.js --execute');
    } else {
      console.log('\n✅ No duplicates to remove!');
    }

    // Show updated statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as businesses_with_email,
        COUNT(CASE WHEN is_claimed = true THEN 1 END) as claimed_businesses
      FROM businesses
    `;

    console.log('\n' + '='.repeat(80));
    console.log('UPDATED DATABASE STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Businesses: ${stats[0].total_businesses}`);
    console.log(`Unique Emails: ${stats[0].unique_emails}`);
    console.log(`Businesses with Email: ${stats[0].businesses_with_email}`);
    console.log(`Claimed Businesses: ${stats[0].claimed_businesses}`);

  } catch (error) {
    console.error('Error removing duplicates:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldExecute = args.includes('--execute') || args.includes('-e');

removeDuplicates(!shouldExecute);