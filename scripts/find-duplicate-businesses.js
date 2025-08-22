// Script to find duplicate businesses in the database
// Duplicates are identified by same email and same location (city, state, zipcode)

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function findDuplicates() {
  try {
    console.log('Finding duplicate businesses...\n');

    // Find duplicates based on email + location
    const duplicatesByEmailAndLocation = await sql`
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
            ) ORDER BY created_at DESC
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

    console.log(`Found ${duplicatesByEmailAndLocation.length} groups of duplicates (same email + location)\n`);

    if (duplicatesByEmailAndLocation.length > 0) {
      console.log('='.repeat(80));
      console.log('DUPLICATES BY EMAIL AND LOCATION');
      console.log('='.repeat(80));
      
      duplicatesByEmailAndLocation.forEach((group, index) => {
        console.log(`\nGroup ${index + 1}: ${group.email} in ${group.city}, ${group.state} ${group.zipcode}`);
        console.log(`Found ${group.duplicate_count} duplicates:`);
        console.log('-'.repeat(60));
        
        group.businesses.forEach((business, idx) => {
          console.log(`  ${idx + 1}. ${business.name}`);
          console.log(`     ID: ${business.id}`);
          console.log(`     Address: ${business.address || 'N/A'}`);
          console.log(`     Phone: ${business.phone || 'N/A'}`);
          console.log(`     Claimed: ${business.is_claimed ? 'Yes' : 'No'}`);
          console.log(`     Created: ${new Date(business.created_at).toLocaleDateString()}`);
          console.log('');
        });
      });
    }

    // Also find duplicates by just email (regardless of location)
    const duplicatesByEmail = await sql`
      WITH email_groups AS (
        SELECT 
          email,
          COUNT(*) as duplicate_count,
          COUNT(DISTINCT city || '-' || state || '-' || zipcode) as unique_locations,
          array_agg(DISTINCT city || ', ' || state || ' ' || zipcode) as locations
        FROM businesses
        WHERE email IS NOT NULL 
          AND email != ''
        GROUP BY email
        HAVING COUNT(*) > 1
      )
      SELECT *
      FROM email_groups
      ORDER BY duplicate_count DESC
      LIMIT 20
    `;

    console.log('\n' + '='.repeat(80));
    console.log('TOP 20 DUPLICATE EMAILS (regardless of location)');
    console.log('='.repeat(80));
    
    duplicatesByEmail.forEach((group, index) => {
      console.log(`\n${index + 1}. ${group.email}`);
      console.log(`   Count: ${group.duplicate_count} businesses`);
      console.log(`   Unique Locations: ${group.unique_locations}`);
      if (group.unique_locations <= 5) {
        console.log(`   Locations: ${group.locations.join(' | ')}`);
      }
    });

    // Summary statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as businesses_with_email,
        COUNT(CASE WHEN is_claimed = true THEN 1 END) as claimed_businesses
      FROM businesses
    `;

    console.log('\n' + '='.repeat(80));
    console.log('DATABASE STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Businesses: ${stats[0].total_businesses}`);
    console.log(`Unique Emails: ${stats[0].unique_emails}`);
    console.log(`Businesses with Email: ${stats[0].businesses_with_email}`);
    console.log(`Claimed Businesses: ${stats[0].claimed_businesses}`);

  } catch (error) {
    console.error('Error finding duplicates:', error);
  }
}

findDuplicates();