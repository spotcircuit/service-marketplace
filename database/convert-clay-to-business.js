#!/usr/bin/env node

const fs = require('fs');
const { parse } = require('csv-parse/sync');

function convertClayToBusiness() {
  console.log('🔄 CONVERTING CLAY EXPORT TO BUSINESS FORMAT\n');
  
  try {
    // Read Clay CSV
    const clayFile = 'imports/Find-people-Table-Default-view-export-1755640746078.csv';
    const csvContent = fs.readFileSync(clayFile, 'utf8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true
    });
    
    console.log(`Found ${records.length} records in Clay export`);
    
    // Parse location to extract city and state
    function parseLocation(location) {
      if (!location) return { city: '', state: '' };
      
      // Handle various location formats
      const parts = location.split(',').map(p => p.trim());
      
      if (parts.length >= 2) {
        // Format: "City, State, Country" or "City, State"
        return {
          city: parts[0],
          state: parts[1]
        };
      } else if (location.includes('Greater ')) {
        // Format: "Greater City Area"
        return {
          city: location.replace('Greater ', '').replace(' Area', ''),
          state: ''
        };
      }
      
      return { city: location, state: '' };
    }
    
    // Convert to our business format
    const businesses = [];
    const seenCompanies = new Set();
    
    records.forEach(record => {
      const companyName = record['Company Name'];
      
      // Skip if no company name or already processed
      if (!companyName || seenCompanies.has(companyName)) {
        return;
      }
      
      seenCompanies.add(companyName);
      
      // Parse location
      const location = parseLocation(record['Location']);
      
      // Get email from the last column "Work Email" or find one in other columns
      let email = record['Work Email'] || '';
      
      // If no work email, check other email columns
      if (!email) {
        // Check all columns for email patterns
        Object.values(record).forEach(value => {
          if (value && value.includes('@') && !value.includes('❌')) {
            // Extract email from strings like "✅ email@domain.com"
            const match = value.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (match) {
              email = match[1];
            }
          }
        });
      }
      
      // Build contact name
      const contactName = record['Full Name'] || 
                          `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim();
      
      // Build description with job title and contact info
      let description = '';
      if (record['Job Title']) {
        description = `${record['Job Title']}`;
        if (contactName) {
          description += ` - ${contactName}`;
        }
      }
      
      // Create business record
      const business = {
        name: companyName,
        phone: '', // Clay export doesn't have phone numbers
        email: email,
        website: record['Company Domain'] ? `https://${record['Company Domain']}` : '',
        address: '',
        city: location.city,
        state: location.state,
        zipcode: '',
        category: 'Waste Management', // All seem to be waste/recycling related
        rating: '',
        reviews: '',
        latitude: '',
        longitude: '',
        hours: '',
        services: '',
        description: description,
        logo_url: '',
        gallery_urls: '',
        // Add LinkedIn as extra info
        linkedin_url: record['LinkedIn Profile'] || ''
      };
      
      businesses.push(business);
    });
    
    console.log(`\nConverted ${businesses.length} unique businesses`);
    
    // Analyze data quality
    const withEmail = businesses.filter(b => b.email).length;
    const withWebsite = businesses.filter(b => b.website).length;
    const withLocation = businesses.filter(b => b.city).length;
    
    console.log('\n📊 Data Quality:');
    console.log(`  With email: ${withEmail} (${Math.round(withEmail/businesses.length*100)}%)`);
    console.log(`  With website: ${withWebsite} (${Math.round(withWebsite/businesses.length*100)}%)`);
    console.log(`  With location: ${withLocation} (${Math.round(withLocation/businesses.length*100)}%)`);
    
    // Create CSV output
    const headers = [
      'name',
      'phone',
      'email',
      'website',
      'address',
      'city',
      'state',
      'zipcode',
      'category',
      'rating',
      'reviews',
      'latitude',
      'longitude',
      'hours',
      'services',
      'description',
      'logo_url',
      'gallery_urls'
    ];
    
    const csvRows = [headers.join(',')];
    
    businesses.forEach(business => {
      const row = headers.map(header => {
        const value = business[header] || '';
        // Escape fields with commas or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(row.join(','));
    });
    
    const outputFile = 'imports/clay-converted-businesses.csv';
    fs.writeFileSync(outputFile, csvRows.join('\n'));
    
    console.log(`\n✅ Converted data saved to: ${outputFile}`);
    console.log('   Ready for import into your business database');
    
    // Show some examples
    console.log('\n📋 Sample businesses:');
    businesses.slice(0, 5).forEach((b, i) => {
      console.log(`\n${i + 1}. ${b.name}`);
      if (b.email) console.log(`   Email: ${b.email}`);
      if (b.website) console.log(`   Website: ${b.website}`);
      if (b.city) console.log(`   Location: ${b.city}, ${b.state}`);
      if (b.description) console.log(`   Contact: ${b.description}`);
    });
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  }
}

convertClayToBusiness();