// Simplified script to consolidate duplicate business listings
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function consolidateDuplicates() {
  try {
    console.log('⚠️  CONSOLIDATING DUPLICATE BUSINESSES');
    console.log('='.repeat(80));
    console.log('');

    // Find all duplicate groups by name + location
    console.log('Finding duplicate business groups...');
    
    const duplicateGroups = await sql`
      WITH duplicate_groups AS (
        SELECT 
          name,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count,
          array_agg(id ORDER BY is_claimed DESC, is_featured DESC, reviews DESC, created_at ASC) as business_ids,
          array_agg(email) as emails,
          array_agg(phone) as phones,
          array_agg(website) as websites,
          MAX(rating) as best_rating,
          MAX(reviews) as best_reviews,
          bool_or(is_claimed) as has_claimed,
          bool_or(is_featured) as has_featured
        FROM businesses
        WHERE name IS NOT NULL 
          AND city IS NOT NULL
          AND state IS NOT NULL
        GROUP BY name, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT *
      FROM duplicate_groups
      ORDER BY duplicate_count DESC
    `;

    console.log(`Found ${duplicateGroups.length} groups of duplicate businesses\n`);

    let totalDeleted = 0;
    let totalMerged = 0;

    // Process each duplicate group
    for (const group of duplicateGroups) {
      const keepId = group.business_ids[0]; // First one is the best to keep
      const deleteIds = group.business_ids.slice(1);
      
      console.log(`Processing: ${group.name} in ${group.city}, ${group.state}`);
      console.log(`  Keeping ID: ${keepId}`);
      console.log(`  Deleting ${deleteIds.length} duplicates`);

      // Update the keeper with best data from all duplicates
      const bestEmail = group.emails.find(e => e) || null;
      const bestPhone = group.phones.find(p => p) || null;
      const bestWebsite = group.websites.find(w => w) || null;

      await sql`
        UPDATE businesses
        SET 
          email = COALESCE(${bestEmail}, email),
          phone = COALESCE(${bestPhone}, phone),
          website = COALESCE(${bestWebsite}, website),
          rating = ${group.best_rating},
          reviews = ${group.best_reviews},
          is_featured = ${group.has_featured},
          is_claimed = ${group.has_claimed}
        WHERE id = ${keepId}
      `;

      // Move all claim campaigns to the keeper business
      await sql`
        UPDATE claim_campaigns
        SET business_id = ${keepId}
        WHERE business_id = ANY(${deleteIds}::uuid[])
      `;

      // Move all quotes to the keeper business
      await sql`
        UPDATE quotes
        SET business_id = ${keepId}
        WHERE business_id = ANY(${deleteIds}::uuid[])
      `;

      // Move all lead reveals to the keeper business
      await sql`
        UPDATE lead_reveals
        SET business_id = ${keepId}
        WHERE business_id = ANY(${deleteIds}::uuid[])
      `;

      // Move all lead assignments to the keeper business
      await sql`
        UPDATE lead_assignments
        SET business_id = ${keepId}
        WHERE business_id = ANY(${deleteIds}::uuid[])
      `;

      // Delete the duplicate businesses
      await sql`
        DELETE FROM businesses 
        WHERE id = ANY(${deleteIds}::uuid[])
      `;
      
      totalDeleted += deleteIds.length;
      totalMerged++;
    }

    console.log('\n' + '='.repeat(80));
    console.log('CONSOLIDATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`✅ Processed ${totalMerged} duplicate groups`);
    console.log(`✅ Deleted ${totalDeleted} duplicate businesses`);

    // Show final statistics
    const finalStats = await sql`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(CASE WHEN is_claimed = true THEN 1 END) as claimed_businesses
      FROM businesses
    `;

    console.log('\n' + '='.repeat(80));
    console.log('FINAL DATABASE STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Businesses: ${finalStats[0].total_businesses}`);
    console.log(`Unique Business Emails: ${finalStats[0].unique_emails}`);
    console.log(`Claimed Businesses: ${finalStats[0].claimed_businesses}`);

  } catch (error) {
    console.error('Error consolidating duplicates:', error);
  }
}

// Run immediately
consolidateDuplicates();