// Script to consolidate duplicate business listings while preserving all email contacts
// This will merge duplicates into single business listings with multiple claim contacts

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function consolidateDuplicates(dryRun = true) {
  try {
    console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made' : '⚠️  LIVE MODE - Changes will be made to database');
    console.log('='.repeat(80));
    console.log('');

    // Step 1: Create backup tables if in live mode
    if (!dryRun) {
      console.log('Creating backup tables...');
      
      await sql`
        CREATE TABLE IF NOT EXISTS businesses_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')} 
        AS SELECT * FROM businesses
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS claim_campaigns_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')} 
        AS SELECT * FROM claim_campaigns
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS claim_contacts_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')} 
        AS SELECT * FROM claim_contacts
      `;
      
      console.log('✅ Backup tables created\n');
    }

    // Step 2: Find all duplicate groups
    console.log('Finding duplicate business groups...');
    
    const duplicateGroups = await sql`
      WITH duplicate_groups AS (
        SELECT 
          name,
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
              'category', category,
              'website', website,
              'rating', rating,
              'reviews', reviews,
              'is_claimed', is_claimed,
              'is_featured', is_featured,
              'created_at', created_at
            ) ORDER BY 
              is_claimed DESC,     -- Keep claimed businesses first
              is_featured DESC,    -- Then featured businesses
              reviews DESC,        -- Then ones with most reviews
              created_at ASC       -- Then oldest
          ) as businesses
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

    let totalMerged = 0;
    let totalDeleted = 0;
    let totalContactsPreserved = 0;
    let totalCampaignsMerged = 0;

    // Step 3: Process each duplicate group
    for (const group of duplicateGroups) {
      const businesses = group.businesses;
      const keepBusiness = businesses[0]; // First one is the one to keep
      const duplicatesToMerge = businesses.slice(1);
      
      console.log(`\n📍 Processing: ${group.name} in ${group.city}, ${group.state}`);
      console.log(`   Keeping business ID: ${keepBusiness.id}`);
      console.log(`   Merging ${duplicatesToMerge.length} duplicates...`);

      if (!dryRun) {
        // Collect all unique emails from all duplicates
        const allBusinessIds = businesses.map(b => b.id);
        
        // Get all claim campaigns for these businesses
        const allCampaigns = await sql`
          SELECT DISTINCT ON (claim_token) 
            id, business_id, claim_token, email_sent_to, 
            email_sent_at, email_opened_at, link_clicked_at,
            claimed_at, expires_at, campaign_name
          FROM claim_campaigns
          WHERE business_id = ANY(${allBusinessIds}::uuid[])
          ORDER BY claim_token, created_at DESC
        `;

        // Get all unique email contacts from claim_contacts
        const allContacts = await sql`
          SELECT DISTINCT ON (cc.email)
            cc.email,
            cc.is_primary,
            cc.is_selected,
            cc.email_type,
            cc.email_sent_at,
            cc.email_opened_at,
            cc.link_clicked_at
          FROM claim_contacts cc
          JOIN claim_campaigns camp ON cc.claim_campaign_id = camp.id
          WHERE camp.business_id = ANY(${allBusinessIds}::uuid[])
          ORDER BY cc.email, cc.created_at DESC
        `;

        console.log(`   Found ${allCampaigns.length} campaigns and ${allContacts.length} unique email contacts`);

        // Update all claim campaigns to point to the keeper business
        if (allCampaigns.length > 0) {
          const campaignIds = allCampaigns.map(c => c.id);
          await sql`
            UPDATE claim_campaigns
            SET business_id = ${keepBusiness.id}
            WHERE id = ANY(${campaignIds}::uuid[])
          `;
          totalCampaignsMerged += allCampaigns.length;
        }

        // Merge business data (take best values from duplicates)
        const bestData = {
          email: businesses.find(b => b.email)?.email || keepBusiness.email,
          phone: businesses.find(b => b.phone)?.phone || keepBusiness.phone,
          website: businesses.find(b => b.website)?.website || keepBusiness.website,
          rating: Math.max(...businesses.map(b => b.rating || 0)),
          reviews: Math.max(...businesses.map(b => b.reviews || 0)),
          is_featured: businesses.some(b => b.is_featured),
          is_claimed: businesses.some(b => b.is_claimed)
        };

        // Update the keeper business with best data
        await sql`
          UPDATE businesses
          SET 
            email = COALESCE(${bestData.email}, email),
            phone = COALESCE(${bestData.phone}, phone),
            website = COALESCE(${bestData.website}, website),
            rating = GREATEST(${bestData.rating}, rating),
            reviews = GREATEST(${bestData.reviews}, reviews),
            is_featured = ${bestData.is_featured},
            is_claimed = ${bestData.is_claimed}
          WHERE id = ${keepBusiness.id}
        `;

        // Delete the duplicate businesses
        const duplicateIds = duplicatesToMerge.map(d => d.id);
        if (duplicateIds.length > 0) {
          // First delete any orphaned references
          await sql`
            DELETE FROM quotes WHERE business_id = ANY(${duplicateIds}::uuid[])
          `;
          
          await sql`
            DELETE FROM lead_reveals WHERE business_id = ANY(${duplicateIds}::uuid[])
          `;
          
          await sql`
            DELETE FROM lead_assignments WHERE business_id = ANY(${duplicateIds}::uuid[])
          `;

          // Delete the duplicate businesses
          await sql`
            DELETE FROM businesses WHERE id = ANY(${duplicateIds}::uuid[])
          `;
          
          totalDeleted += duplicateIds.length;
        }

        totalContactsPreserved += allContacts.length;
        totalMerged++;
      } else {
        // Dry run - just show what would happen
        console.log(`   Would merge ${duplicatesToMerge.length} duplicates`);
        console.log(`   Would preserve all email contacts from duplicates`);
      }
    }

    // Step 4: Create/ensure claim campaign exists for every business with email
    if (!dryRun) {
      console.log('\nEnsuring all businesses have claim campaigns...');
      
      const businessesNeedingCampaigns = await sql`
        SELECT b.id, b.email
        FROM businesses b
        LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
        WHERE b.email IS NOT NULL 
          AND b.email != ''
          AND cc.id IS NULL
      `;

      if (businessesNeedingCampaigns.length > 0) {
        console.log(`Creating campaigns for ${businessesNeedingCampaigns.length} businesses...`);
        
        for (const business of businessesNeedingCampaigns) {
          // Generate a claim token
          const token = `claim_${business.id.slice(0, 8)}_${Date.now()}`;
          
          // Create claim campaign
          const campaign = await sql`
            INSERT INTO claim_campaigns (
              id,
              business_id,
              claim_token,
              email_sent_to,
              campaign_name,
              expires_at,
              created_at
            ) VALUES (
              gen_random_uuid(),
              ${business.id},
              ${token},
              ${business.email},
              'Auto-generated Campaign',
              NOW() + INTERVAL '90 days',
              NOW()
            )
            RETURNING id
          `;

          // Create claim contact
          await sql`
            INSERT INTO claim_contacts (
              id,
              claim_campaign_id,
              email,
              is_primary,
              is_selected,
              created_at
            ) VALUES (
              gen_random_uuid(),
              ${campaign[0].id},
              ${business.email},
              true,
              true,
              NOW()
            )
          `;
        }
      }
    }

    // Step 5: Show summary
    console.log('\n' + '='.repeat(80));
    console.log('CONSOLIDATION SUMMARY');
    console.log('='.repeat(80));
    
    if (dryRun) {
      console.log(`Would process ${duplicateGroups.length} duplicate groups`);
      console.log(`Would delete approximately ${duplicateGroups.reduce((sum, g) => sum + g.duplicate_count - 1, 0)} duplicate businesses`);
      console.log(`Would preserve all email contacts from duplicates`);
      console.log('\n💡 To actually consolidate duplicates, run: node scripts/consolidate-duplicate-businesses.js --execute');
    } else {
      console.log(`✅ Processed ${totalMerged} duplicate groups`);
      console.log(`✅ Deleted ${totalDeleted} duplicate businesses`);
      console.log(`✅ Preserved ${totalContactsPreserved} email contacts`);
      console.log(`✅ Merged ${totalCampaignsMerged} claim campaigns`);
    }

    // Show final statistics
    const finalStats = await sql`
      SELECT 
        COUNT(DISTINCT b.id) as total_businesses,
        COUNT(DISTINCT b.email) as unique_business_emails,
        COUNT(DISTINCT cc.email) as unique_contact_emails,
        COUNT(DISTINCT camp.id) as total_campaigns,
        COUNT(CASE WHEN b.is_claimed = true THEN 1 END) as claimed_businesses
      FROM businesses b
      LEFT JOIN claim_campaigns camp ON b.id = camp.business_id
      LEFT JOIN claim_contacts cc ON camp.id = cc.claim_campaign_id
    `;

    console.log('\n' + '='.repeat(80));
    console.log('FINAL DATABASE STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Businesses: ${finalStats[0].total_businesses}`);
    console.log(`Unique Business Emails: ${finalStats[0].unique_business_emails}`);
    console.log(`Unique Contact Emails: ${finalStats[0].unique_contact_emails}`);
    console.log(`Total Claim Campaigns: ${finalStats[0].total_campaigns}`);
    console.log(`Claimed Businesses: ${finalStats[0].claimed_businesses}`);

  } catch (error) {
    console.error('Error consolidating duplicates:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldExecute = args.includes('--execute') || args.includes('-e');

consolidateDuplicates(!shouldExecute);