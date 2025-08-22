// Script to analyze business duplicates without considering claim status
// Just looking at pure business listing duplicates

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function analyzeBusinessDuplicates() {
  try {
    console.log('Analyzing Business Listing Duplicates...\n');
    console.log('='.repeat(80));

    // Count total businesses
    const totalCount = await sql`
      SELECT COUNT(*) as total FROM businesses
    `;
    console.log(`Total business listings in database: ${totalCount[0].total}\n`);

    // Find exact duplicates (same name, email, address, city, state, zip)
    const exactDuplicates = await sql`
      WITH duplicate_groups AS (
        SELECT 
          name,
          email,
          address,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count,
          array_agg(id) as business_ids
        FROM businesses
        WHERE name IS NOT NULL
        GROUP BY name, email, address, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT 
        COUNT(*) as total_groups,
        SUM(duplicate_count) as total_duplicates,
        SUM(duplicate_count - 1) as duplicates_to_remove,
        MAX(duplicate_count) as max_duplicates,
        AVG(duplicate_count)::numeric(10,2) as avg_duplicates
      FROM duplicate_groups
    `;

    console.log('EXACT DUPLICATES (Same name, email, address, city, state, zip):');
    console.log('-'.repeat(80));
    console.log(`Duplicate groups found: ${exactDuplicates[0].total_groups || 0}`);
    console.log(`Total duplicate listings: ${exactDuplicates[0].total_duplicates || 0}`);
    console.log(`Duplicates that could be removed: ${exactDuplicates[0].duplicates_to_remove || 0}`);
    console.log(`Maximum duplicates of single business: ${exactDuplicates[0].max_duplicates || 0}`);
    console.log(`Average duplicates per group: ${exactDuplicates[0].avg_duplicates || 0}\n`);

    // Find duplicates by email and location only (might have slight name variations)
    const emailLocationDuplicates = await sql`
      WITH duplicate_groups AS (
        SELECT 
          email,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count,
          COUNT(DISTINCT name) as unique_names,
          array_agg(DISTINCT name) as business_names
        FROM businesses
        WHERE email IS NOT NULL AND email != ''
          AND city IS NOT NULL
          AND state IS NOT NULL
        GROUP BY email, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT 
        COUNT(*) as total_groups,
        SUM(duplicate_count) as total_duplicates,
        SUM(duplicate_count - 1) as duplicates_to_remove,
        MAX(duplicate_count) as max_duplicates,
        AVG(duplicate_count)::numeric(10,2) as avg_duplicates
      FROM duplicate_groups
    `;

    console.log('DUPLICATES BY EMAIL + LOCATION (May have name variations):');
    console.log('-'.repeat(80));
    console.log(`Duplicate groups found: ${emailLocationDuplicates[0].total_groups || 0}`);
    console.log(`Total duplicate listings: ${emailLocationDuplicates[0].total_duplicates || 0}`);
    console.log(`Duplicates that could be removed: ${emailLocationDuplicates[0].duplicates_to_remove || 0}`);
    console.log(`Maximum duplicates of single business: ${emailLocationDuplicates[0].max_duplicates || 0}`);
    console.log(`Average duplicates per group: ${emailLocationDuplicates[0].avg_duplicates || 0}\n`);

    // Find duplicates by name and location only (might have different emails)
    const nameLocationDuplicates = await sql`
      WITH duplicate_groups AS (
        SELECT 
          name,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count,
          COUNT(DISTINCT email) as unique_emails
        FROM businesses
        WHERE name IS NOT NULL AND name != ''
          AND city IS NOT NULL
          AND state IS NOT NULL
        GROUP BY name, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT 
        COUNT(*) as total_groups,
        SUM(duplicate_count) as total_duplicates,
        SUM(duplicate_count - 1) as duplicates_to_remove,
        MAX(duplicate_count) as max_duplicates,
        AVG(duplicate_count)::numeric(10,2) as avg_duplicates
      FROM duplicate_groups
    `;

    console.log('DUPLICATES BY NAME + LOCATION (May have different emails):');
    console.log('-'.repeat(80));
    console.log(`Duplicate groups found: ${nameLocationDuplicates[0].total_groups || 0}`);
    console.log(`Total duplicate listings: ${nameLocationDuplicates[0].total_duplicates || 0}`);
    console.log(`Duplicates that could be removed: ${nameLocationDuplicates[0].duplicates_to_remove || 0}`);
    console.log(`Maximum duplicates of single business: ${nameLocationDuplicates[0].max_duplicates || 0}`);
    console.log(`Average duplicates per group: ${nameLocationDuplicates[0].avg_duplicates || 0}\n`);

    // Top duplicate offenders
    console.log('='.repeat(80));
    console.log('TOP 10 MOST DUPLICATED BUSINESSES:');
    console.log('='.repeat(80));

    const topDuplicates = await sql`
      WITH duplicate_groups AS (
        SELECT 
          name,
          email,
          city,
          state,
          zipcode,
          COUNT(*) as duplicate_count
        FROM businesses
        WHERE name IS NOT NULL
        GROUP BY name, email, city, state, zipcode
        HAVING COUNT(*) > 1
      )
      SELECT *
      FROM duplicate_groups
      ORDER BY duplicate_count DESC
      LIMIT 10
    `;

    topDuplicates.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   Location: ${business.city}, ${business.state} ${business.zipcode}`);
      console.log(`   Email: ${business.email || 'No email'}`);
      console.log(`   Copies: ${business.duplicate_count}\n`);
    });

    // Calculate potential database size after cleanup
    console.log('='.repeat(80));
    console.log('CLEANUP IMPACT ANALYSIS:');
    console.log('='.repeat(80));
    
    const uniqueBusinesses = await sql`
      SELECT COUNT(*) as unique_count
      FROM (
        SELECT DISTINCT ON (
          COALESCE(email, '') || '-' || 
          COALESCE(city, '') || '-' || 
          COALESCE(state, '') || '-' || 
          COALESCE(zipcode, '')
        )
        id
        FROM businesses
        WHERE city IS NOT NULL AND state IS NOT NULL
      ) AS unique_businesses
    `;

    console.log(`Current total listings: ${totalCount[0].total}`);
    console.log(`Unique businesses (by email+location): ${uniqueBusinesses[0].unique_count}`);
    console.log(`Potential reduction: ${totalCount[0].total - uniqueBusinesses[0].unique_count} listings`);
    console.log(`Reduction percentage: ${((totalCount[0].total - uniqueBusinesses[0].unique_count) / totalCount[0].total * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error analyzing duplicates:', error);
  }
}

analyzeBusinessDuplicates();