#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function importAllData() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('📊 COMPREHENSIVE DATA IMPORT');
  console.log('============================\n');
  
  // Get current businesses for duplicate checking
  const currentBusinesses = await sql`
    SELECT name, phone, email, city, state
    FROM businesses
  `;
  
  console.log(`Current database: ${currentBusinesses.length} businesses\n`);
  
  const existingKeys = new Set(
    currentBusinesses.map(b => `${b.name?.toLowerCase()}_${b.city}_${b.state}`)
  );
  
  const allImportData = [];
  
  // 1. Process CSV file
  console.log('📁 Processing CSV: backup 8-14-2025.csv');
  try {
    const csvContent = fs.readFileSync('imports/backup 8-14-2025.csv', 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`  Total records: ${records.length}`);
    
    let csvValid = 0;
    records.forEach(record => {
      // The 'emails' field seems to contain categories, not emails
      // Check if there's actual email data elsewhere
      const hasRealEmail = record.emails && record.emails.includes('@');
      
      const mapped = {
        name: record.name,
        phone: record.phone,
        email: hasRealEmail ? record.emails : '',
        website: record.website || '',
        address: record.address_street || record.address?.split(',')[0] || '',
        city: record.address_city || '',
        state: record.address_state || '',
        zipcode: record.address_postal_code || '',
        category: record.category || 'Dumpster Rental',
        rating: parseFloat(record.rating) || null,
        reviews: parseInt(record.reviewsCount) || parseInt(record.reviews) || 0,
        latitude: record.coords ? parseFloat(record.coords.split(',')[0]) : null,
        longitude: record.coords ? parseFloat(record.coords.split(',')[1]) : null,
        logo_url: record.image || null,
        source: 'CSV Import'
      };
      
      const key = `${mapped.name?.toLowerCase()}_${mapped.city}_${mapped.state}`;
      if (!existingKeys.has(key) && mapped.name && (mapped.phone || mapped.website)) {
        allImportData.push(mapped);
        csvValid++;
      }
    });
    
    console.log(`  Valid new records: ${csvValid}`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
  
  // 2. Process JSON files
  const jsonFiles = [
    'MASTER-final-with-emails.json',
    'Cleveland-OH-dumpster-rental-google-scrape.json',
    'Denver-CO-dumpster-rental-google-maps.json',
    'Denver-CO-dumpster-rental-google-scrape.json',
    'New_York-NY-dumpster-rental-google-format.json'
  ];
  
  for (const file of jsonFiles) {
    console.log(`\n📁 Processing JSON: ${file}`);
    try {
      let content = fs.readFileSync(`imports/${file}`, 'utf8');
      // Fix NaN values
      content = content.replace(/:\s*NaN/g, ': null');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        console.log('  Not an array, skipping');
        continue;
      }
      
      console.log(`  Total records: ${data.length}`);
      
      let jsonValid = 0;
      data.forEach(record => {
        // Skip invalid records
        if (!record.name || record.name.includes('Available filters')) return;
        
        // Try to extract email from various fields
        let email = record.email || record.owner_email || record.generic_company_emails || '';
        if (Array.isArray(email)) email = email[0] || '';
        
        const mapped = {
          name: record.name,
          phone: record.phone || '',
          email: email,
          website: record.website || '',
          address: record.address || '',
          city: record.city || '',
          state: record.state || '',
          zipcode: record.zipcode || '',
          category: record.category || 'Dumpster Rental',
          rating: parseFloat(record.rating) || null,
          reviews: parseInt(record.reviews) || 0,
          latitude: parseFloat(record.latitude) || null,
          longitude: parseFloat(record.longitude) || null,
          source: file
        };
        
        const key = `${mapped.name?.toLowerCase()}_${mapped.city}_${mapped.state}`;
        if (!existingKeys.has(key) && mapped.name && (mapped.phone || mapped.website || mapped.email)) {
          allImportData.push(mapped);
          existingKeys.add(key); // Prevent duplicates across files
          jsonValid++;
        }
      });
      
      console.log(`  Valid new records: ${jsonValid}`);
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
  
  // 3. Deduplicate final data
  console.log('\n📋 FINAL SUMMARY');
  console.log('================');
  console.log(`Total new records to import: ${allImportData.length}`);
  
  // Analyze data quality
  let withPhone = 0, withEmail = 0, withWebsite = 0, withCoords = 0;
  const states = {};
  
  allImportData.forEach(record => {
    if (record.phone) withPhone++;
    if (record.email) withEmail++;
    if (record.website) withWebsite++;
    if (record.latitude && record.longitude) withCoords++;
    if (record.state) {
      states[record.state] = (states[record.state] || 0) + 1;
    }
  });
  
  console.log('\n📊 Data Quality:');
  console.log(`  With phone: ${withPhone} (${Math.round(withPhone/allImportData.length*100)}%)`);
  console.log(`  With email: ${withEmail} (${Math.round(withEmail/allImportData.length*100)}%)`);
  console.log(`  With website: ${withWebsite} (${Math.round(withWebsite/allImportData.length*100)}%)`);
  console.log(`  With coordinates: ${withCoords} (${Math.round(withCoords/allImportData.length*100)}%)`);
  
  console.log('\n📍 Geographic Distribution:');
  Object.entries(states)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([state, count]) => {
      console.log(`  ${state}: ${count} businesses`);
    });
  
  // Ask for confirmation
  console.log('\n⚠️ Ready to import data. Continue? (y/n)');
  
  process.stdin.once('data', async (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      await performImport(sql, allImportData);
    } else {
      console.log('Import cancelled.');
      process.exit(0);
    }
  });
}

async function performImport(sql, data) {
  console.log('\n🚀 Starting import...');
  
  let imported = 0;
  let errors = 0;
  
  for (const business of data) {
    try {
      await sql`
        INSERT INTO businesses (
          name, phone, email, website, address, city, state, zipcode,
          category, rating, reviews, latitude, longitude,
          is_claimed, is_verified, created_at, updated_at
        ) VALUES (
          ${business.name},
          ${business.phone || null},
          ${business.email || null},
          ${business.website || null},
          ${business.address || null},
          ${business.city || null},
          ${business.state || null},
          ${business.zipcode || null},
          ${business.category || 'Dumpster Rental'},
          ${business.rating || null},
          ${business.reviews || 0},
          ${business.latitude || null},
          ${business.longitude || null},
          false,
          false,
          NOW(),
          NOW()
        )
      `;
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`  Imported ${imported}/${data.length}...`);
      }
    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.log(`  Error importing ${business.name}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`  Successfully imported: ${imported}`);
  console.log(`  Errors: ${errors}`);
  
  // Final database stats
  const finalStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
      COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as with_phone
    FROM businesses
  `;
  
  console.log('\n📊 Final Database Stats:');
  console.log(`  Total businesses: ${finalStats[0].total}`);
  console.log(`  With email: ${finalStats[0].with_email}`);
  console.log(`  With phone: ${finalStats[0].with_phone}`);
  
  process.exit(0);
}

// Check if csv-parse is installed
try {
  require('csv-parse');
} catch (e) {
  console.log('Installing csv-parse...');
  require('child_process').execSync('npm install csv-parse', { stdio: 'inherit' });
}

importAllData().catch(console.error);