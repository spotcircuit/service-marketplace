#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// CSV Template columns
const CSV_COLUMNS = [
  'name',           // Required
  'phone',          // Recommended
  'email',          // Can be semicolon-separated for multiple
  'website',        
  'address',        
  'city',           
  'state',          
  'zipcode',        
  'category',       // Defaults to 'Dumpster Rental'
  'rating',         // Number 0-5
  'reviews',        // Number
  'latitude',       // Decimal
  'longitude',      // Decimal
  'hours',          // Text or semicolon-separated
  'services',       // Semicolon-separated list
  'description',    
  'logo_url',       
  'gallery_urls'    // Semicolon-separated URLs
];

async function exportBusinesses(outputFile = 'businesses-export.csv') {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('📊 EXPORTING BUSINESSES TO CSV\n');
  
  try {
    // Fetch all businesses with their contacts
    const businesses = await sql`
      SELECT 
        b.*,
        STRING_AGG(DISTINCT con.email, '; ' ORDER BY con.email) as contact_emails
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
      LEFT JOIN claim_contacts con ON cc.id = con.claim_campaign_id
      GROUP BY b.id
      ORDER BY b.state, b.city, b.name
    `;
    
    console.log(`Found ${businesses.length} businesses to export`);
    
    // Create CSV content
    const csvRows = [CSV_COLUMNS.join(',')]; // Header
    
    businesses.forEach(business => {
      // Combine business email with contact emails
      let allEmails = [];
      if (business.email) allEmails.push(business.email);
      if (business.contact_emails) {
        allEmails = allEmails.concat(business.contact_emails.split('; '));
      }
      // Remove duplicates
      allEmails = [...new Set(allEmails)];
      
      const row = [
        business.name || '',
        business.phone || '',
        allEmails.join('; '),
        business.website || '',
        business.address || '',
        business.city || '',
        business.state || '',
        business.zipcode || '',
        business.category || 'Dumpster Rental',
        business.rating || '',
        business.reviews || '0',
        business.latitude || '',
        business.longitude || '',
        business.hours || '',
        business.services || '',
        business.description || '',
        business.logo_url || '',
        business.gallery_urls ? (Array.isArray(business.gallery_urls) ? business.gallery_urls.join('; ') : business.gallery_urls) : ''
      ].map(field => {
        // Escape fields that contain commas, quotes, or newlines
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      
      csvRows.push(row.join(','));
    });
    
    // Write to file
    fs.writeFileSync(outputFile, csvRows.join('\n'));
    console.log(`\n✅ Exported to ${outputFile}`);
    console.log(`   Total businesses: ${businesses.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

async function importBusinesses(inputFile) {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log(`📊 IMPORTING BUSINESSES FROM ${inputFile}\n`);
  
  try {
    // Read and parse CSV
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Found ${records.length} records in CSV`);
    
    // Get existing businesses for duplicate checking
    const existing = await sql`
      SELECT name, phone, city, state 
      FROM businesses
    `;
    
    const existingKeys = new Set(
      existing.map(b => `${b.name?.toLowerCase()}_${b.city}_${b.state}`)
    );
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const record of records) {
      try {
        // Check for duplicates
        const key = `${record.name?.toLowerCase()}_${record.city}_${record.state}`;
        if (existingKeys.has(key)) {
          skipped++;
          console.log(`   Skipped duplicate: ${record.name}`);
          continue;
        }
        
        // Validate required fields
        if (!record.name) {
          errors++;
          console.log(`   Error: Missing name for record`);
          continue;
        }
        
        // Parse numeric fields
        const rating = record.rating ? parseFloat(record.rating) : null;
        const reviews = record.reviews ? parseInt(record.reviews) : 0;
        const latitude = record.latitude ? parseFloat(record.latitude) : null;
        const longitude = record.longitude ? parseFloat(record.longitude) : null;
        
        // Insert business
        const business = await sql`
          INSERT INTO businesses (
            name, phone, email, website, address, city, state, zipcode,
            category, rating, reviews, latitude, longitude,
            hours, services, description, logo_url, gallery_urls,
            is_claimed, is_verified, created_at, updated_at
          ) VALUES (
            ${record.name},
            ${record.phone || null},
            ${record.email ? record.email.split(';')[0].trim() : null}, // Take first email for business
            ${record.website || null},
            ${record.address || null},
            ${record.city || null},
            ${record.state || null},
            ${record.zipcode || null},
            ${record.category || 'Dumpster Rental'},
            ${rating},
            ${reviews},
            ${latitude},
            ${longitude},
            ${record.hours || null},
            ${record.services || null},
            ${record.description || null},
            ${record.logo_url || null},
            ${record.gallery_urls || null},
            false,
            false,
            NOW(),
            NOW()
          )
          RETURNING id
        `;
        
        // If there are multiple emails, add them to claim_contacts
        if (record.email && record.email.includes(';')) {
          const emails = record.email.split(';').map(e => e.trim()).filter(e => e && e.includes('@'));
          
          // Create a claim campaign for this business
          const campaign = await sql`
            INSERT INTO claim_campaigns (
              business_id,
              claim_token,
              expires_at,
              created_at
            ) VALUES (
              ${business[0].id},
              ${Math.random().toString(36).substring(2, 10)},
              NOW() + INTERVAL '30 days',
              NOW()
            )
            RETURNING id
          `;
          
          // Add all emails as contacts
          for (let i = 0; i < emails.length; i++) {
            await sql`
              INSERT INTO claim_contacts (
                claim_campaign_id,
                email,
                is_primary,
                is_selected,
                created_at
              ) VALUES (
                ${campaign[0].id},
                ${emails[i]},
                ${i === 0},
                true,
                NOW()
              )
              ON CONFLICT (claim_campaign_id, email) DO NOTHING
            `;
          }
        }
        
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`   Imported ${imported} businesses...`);
        }
        
      } catch (error) {
        errors++;
        console.log(`   Error importing ${record.name}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped (duplicates): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    
    // Show final stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email,
        COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone
      FROM businesses
    `;
    
    console.log(`\n📊 Database Stats:`);
    console.log(`   Total businesses: ${stats[0].total}`);
    console.log(`   With email: ${stats[0].with_email}`);
    console.log(`   With phone: ${stats[0].with_phone}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// CLI handling
const command = process.argv[2];
const file = process.argv[3];

if (command === 'export') {
  exportBusinesses(file || 'businesses-export.csv');
} else if (command === 'import' && file) {
  importBusinesses(file);
} else if (command === 'template') {
  // Copy template to current directory
  const templatePath = path.join(__dirname, 'business-import-template.csv');
  const destPath = file || 'business-import-template.csv';
  fs.copyFileSync(templatePath, destPath);
  console.log(`✅ Template saved to ${destPath}`);
} else {
  console.log('📋 Business CSV Import/Export Tool\n');
  console.log('Usage:');
  console.log('  node business-csv-handler.js export [filename]     - Export all businesses to CSV');
  console.log('  node business-csv-handler.js import <filename>     - Import businesses from CSV');
  console.log('  node business-csv-handler.js template [filename]   - Get CSV template file');
  console.log('\nExamples:');
  console.log('  node business-csv-handler.js export businesses.csv');
  console.log('  node business-csv-handler.js import new-businesses.csv');
  console.log('  node business-csv-handler.js template my-template.csv');
}