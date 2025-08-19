#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function analyzeImports() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('📊 IMPORT DATA ANALYSIS & DEDUPLICATION');
  console.log('========================================\n');
  
  // Get current businesses for duplicate checking
  const currentBusinesses = await sql`
    SELECT name, phone, email, city, state, website
    FROM businesses
  `;
  
  const existingNames = new Set(currentBusinesses.map(b => b.name?.toLowerCase()));
  const existingPhones = new Set(currentBusinesses.map(b => b.phone?.replace(/\D/g, '')).filter(Boolean));
  
  console.log(`📍 Current database: ${currentBusinesses.length} businesses\n`);
  
  // Analyze each import file
  const importDir = 'imports';
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.json'));
  
  const allImportData = [];
  const importSummary = {};
  
  for (const file of files) {
    const filePath = path.join(importDir, file);
    console.log(`\n📁 Analyzing: ${file}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix common JSON issues
      content = content.replace(/:\s*NaN/g, ': null');
      content = content.replace(/:\s*undefined/g, ': null');
      
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        console.log('  ⚠️ Not an array, skipping');
        continue;
      }
      
      console.log(`  Records: ${data.length}`);
      
      // Analyze quality
      let withPhone = 0, withEmail = 0, withWebsite = 0, withAddress = 0;
      let duplicatesInFile = 0;
      let duplicatesInDB = 0;
      const uniqueInFile = new Set();
      const validRecords = [];
      
      data.forEach(record => {
        // Skip invalid records
        if (!record.name || record.name.includes('Available filters')) return;
        
        // Check for duplicates within file
        const key = `${record.name?.toLowerCase()}_${record.city}_${record.state}`;
        if (uniqueInFile.has(key)) {
          duplicatesInFile++;
          return;
        }
        uniqueInFile.add(key);
        
        // Check for duplicates in DB
        if (existingNames.has(record.name?.toLowerCase())) {
          duplicatesInDB++;
          return;
        }
        
        // Clean phone number
        if (record.phone) {
          record.phone_clean = record.phone.replace(/\D/g, '');
          if (existingPhones.has(record.phone_clean)) {
            duplicatesInDB++;
            return;
          }
        }
        
        // Count field coverage
        if (record.phone && record.phone.trim() && record.phone !== '""') withPhone++;
        if (record.email && record.email.trim()) withEmail++;
        if (record.website && record.website.trim()) withWebsite++;
        if (record.address && record.address.trim()) withAddress++;
        
        // Map to our schema
        const mapped = {
          name: record.name || record.business_name,
          phone: record.phone || record.phone_e164 || '',
          email: record.email || '',
          website: record.website || '',
          address: record.address || record.street || '',
          city: record.city || '',
          state: record.state || '',
          zipcode: record.zipcode || record.postal || record.zip || '',
          category: record.category || 'Dumpster Rental',
          rating: parseFloat(record.rating) || null,
          reviews: parseInt(record.reviews) || parseInt(record.review_count) || 0,
          latitude: parseFloat(record.latitude) || null,
          longitude: parseFloat(record.longitude) || null,
          source_file: file
        };
        
        // Only include if has meaningful data
        if (mapped.name && (mapped.phone || mapped.email || mapped.website)) {
          validRecords.push(mapped);
        }
      });
      
      console.log(`  Valid records: ${validRecords.length}`);
      console.log(`  Duplicates in file: ${duplicatesInFile}`);
      console.log(`  Already in DB: ${duplicatesInDB}`);
      console.log(`  Field coverage:`);
      console.log(`    Phone: ${withPhone}`);
      console.log(`    Email: ${withEmail}`);
      console.log(`    Website: ${withWebsite}`);
      console.log(`    Address: ${withAddress}`);
      
      importSummary[file] = {
        total: data.length,
        valid: validRecords.length,
        duplicatesInFile,
        duplicatesInDB
      };
      
      allImportData.push(...validRecords);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  // Deduplicate across all import files
  console.log('\n📋 OVERALL SUMMARY');
  console.log('==================');
  console.log(`Total records across all files: ${allImportData.length}`);
  
  const finalUnique = new Map();
  allImportData.forEach(record => {
    const key = `${record.name?.toLowerCase()}_${record.city}_${record.state}`;
    if (!finalUnique.has(key)) {
      finalUnique.set(key, record);
    }
  });
  
  console.log(`Unique businesses to import: ${finalUnique.size}`);
  
  // Geographic distribution
  const states = {};
  const cities = new Set();
  finalUnique.forEach(record => {
    if (record.value.state) {
      states[record.value.state] = (states[record.value.state] || 0) + 1;
    }
    if (record.value.city) {
      cities.add(`${record.value.city}, ${record.value.state}`);
    }
  });
  
  console.log('\n📍 Geographic Coverage:');
  Object.entries(states).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([state, count]) => {
    console.log(`  ${state}: ${count} businesses`);
  });
  console.log(`  Total unique cities: ${cities.size}`);
  
  // Field coverage in final set
  let finalWithPhone = 0, finalWithEmail = 0, finalWithWebsite = 0;
  finalUnique.forEach(record => {
    if (record.value.phone) finalWithPhone++;
    if (record.value.email) finalWithEmail++;
    if (record.value.website) finalWithWebsite++;
  });
  
  console.log('\n📊 Data Quality (unique records):');
  console.log(`  With phone: ${finalWithPhone} (${Math.round(finalWithPhone/finalUnique.size*100)}%)`);
  console.log(`  With email: ${finalWithEmail} (${Math.round(finalWithEmail/finalUnique.size*100)}%)`);
  console.log(`  With website: ${finalWithWebsite} (${Math.round(finalWithWebsite/finalUnique.size*100)}%)`);
  
  // Save clean data for import
  const cleanData = Array.from(finalUnique.values()).map(r => r.value);
  fs.writeFileSync('imports/clean_import_data.json', JSON.stringify(cleanData, null, 2));
  
  console.log('\n✅ Clean data saved to: imports/clean_import_data.json');
  console.log(`   Ready to import ${cleanData.length} unique businesses`);
  
  return cleanData;
}

analyzeImports().catch(console.error);