#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' });

// Parse command line arguments
const skipCount = parseInt(process.argv[2]) || 1680;
const csvFilePath = path.join(__dirname, '..', '..', 'uploads', 'backup_8-14-2025.csv');

// Helper functions (same as before)
function parseHours(hoursString) {
  if (!hoursString) return null;
  try {
    const hoursPairs = hoursString.split('; ');
    const hoursObj = {};
    hoursPairs.forEach(pair => {
      const match = pair.match(/{'day': '(\w+)', 'hours': '(.+?)'}/);
      if (match) {
        const day = match[1].toLowerCase();
        const hours = match[2];
        if (hours.toLowerCase() === 'closed') {
          hoursObj[day] = { closed: true };
        } else {
          const timeMatch = hours.match(/(\d{1,2}(?::\d{2})?)\s*([APap][Mm])?\s*[-–]\s*(\d{1,2}(?::\d{2})?)\s*([APap][Mm])?/);
          if (timeMatch) {
            hoursObj[day] = {
              open: `${timeMatch[1]} ${timeMatch[2] || 'AM'}`.trim(),
              close: `${timeMatch[3]} ${timeMatch[4] || 'PM'}`.trim()
            };
          }
        }
      }
    });
    return Object.keys(hoursObj).length > 0 ? hoursObj : null;
  } catch (error) {
    return null;
  }
}

function parseCoords(coordsString) {
  if (!coordsString) return { lat: null, lng: null };
  const match = coordsString.match(/lat:\s*([\-\d.]+);\s*lng:\s*([\-\d.]+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return { lat: null, lng: null };
}

function parseCategories(categoriesString) {
  if (!categoriesString) return 'General Service';
  const categories = categoriesString.split(';').map(c => c.trim());
  const primaryCategory = categories[0] || 'General Service';
  const categoryMap = {
    'Dumpster rental service': 'Dumpster Rental',
    'Waste management service': 'Waste Management',
    'Junk removal service': 'Junk Removal',
    'Debris removal service': 'Debris Removal',
    'Garbage collection service': 'Garbage Collection',
    'Storage facility': 'Storage',
    'Warehouse': 'Storage',
    'Mulch supplier': 'Landscaping Supplies',
    'Firewood supplier': 'Landscaping Supplies'
  };
  return categoryMap[primaryCategory] || primaryCategory;
}

function parseServiceAreas(city, state) {
  const areas = [city];
  areas.push(`${city} County`);
  areas.push(`Greater ${city} Area`);
  return areas;
}

function cleanPhone(phoneString) {
  if (!phoneString || phoneString.trim() === '') return '(000) 000-0000';
  const phones = phoneString.split(';').map(p => p.trim()).filter(p => p);
  return phones[0] || '(000) 000-0000';
}

function cleanEmail(emailString) {
  if (!emailString) return null;
  const emails = emailString.split(';').map(e => e.trim()).filter(e => e);
  const validEmails = emails.filter(email => !email.includes('filler@') && !email.includes('example@'));
  return validEmails.length > 0 ? validEmails[0] : null;
}

function generateServices(category) {
  const serviceTemplates = {
    'Dumpster Rental': [
      { name: '10 Yard Dumpster', description: 'Perfect for small cleanouts', price_from: 250, price_to: 350, price_unit: 'rental' },
      { name: '20 Yard Dumpster', description: 'Ideal for medium projects', price_from: 350, price_to: 450, price_unit: 'rental' },
      { name: '30 Yard Dumpster', description: 'Great for large projects', price_from: 450, price_to: 550, price_unit: 'rental' },
      { name: '40 Yard Dumpster', description: 'Maximum capacity', price_from: 550, price_to: 700, price_unit: 'rental' }
    ],
    'Junk Removal': [
      { name: 'Single Item Removal', description: 'Quick removal', price_from: 75, price_to: 150, price_unit: 'item' },
      { name: 'Room Cleanout', description: 'Complete room cleanout', price_from: 200, price_to: 400, price_unit: 'job' },
      { name: 'Full House Cleanout', description: 'Whole-house removal', price_from: 500, price_to: 1500, price_unit: 'job' }
    ],
    'Waste Management': [
      { name: 'Weekly Pickup', description: 'Regular collection', price_from: 25, price_to: 45, price_unit: 'month' },
      { name: 'Recycling Service', description: 'Eco-friendly recycling', price_from: 15, price_to: 25, price_unit: 'month' }
    ]
  };
  return serviceTemplates[category] || [{ name: 'Standard Service', description: 'Professional service', price_from: 100, price_to: 500, price_unit: 'service' }];
}

async function importRemaining() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  console.log(`🚀 Importing remaining businesses (skipping first ${skipCount})...`);
  const sql = neon(databaseUrl);

  try {
    // Check current count
    const currentCount = await sql`SELECT COUNT(*) as count FROM businesses`;
    console.log(`📊 Current businesses in database: ${currentCount[0].count}`);

    console.log(`📝 Reading CSV file...`);
    const businesses = [];
    let rowIndex = 0;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rowIndex++;
          // Skip already imported rows
          if (rowIndex <= skipCount) return;

          const coords = parseCoords(row.coords);
          const category = parseCategories(row.categories);
          const services = generateServices(category);
          const serviceAreas = parseServiceAreas(row.address_city, row.address_state);
          const hours = parseHours(row.hours);

          const business = {
            name: row.name,
            category: category,
            description: `Professional ${category.toLowerCase()} services in ${row.address_city}, ${row.address_state}. ${row.reviewsCount ? `Trusted by ${row.reviewsCount} customers with a ${row.rating} star rating.` : 'Quality service you can depend on.'}`,
            rating: parseFloat(row.rating) || 4.5,
            reviews: parseInt(row.reviewsCount) || 0,
            phone: cleanPhone(row.phone),
            email: cleanEmail(row.emails),
            website: row.website || null,
            address: row.address_street,
            city: row.address_city,
            state: row.address_state,
            zipcode: row.address_postal_code,
            latitude: coords.lat,
            longitude: coords.lng,
            is_featured: !!(row.featured === '1' || row.featured === 1 || parseInt(row.reviewsCount || 0) > 100),
            is_verified: !!(row.status === 'open' && parseInt(row.reviewsCount || 0) > 10),
            is_claimed: false,
            featured_until: (row.featured === '1' || row.featured === 1) ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            logo_url: row.image || null,
            cover_image: row.image || null,
            years_in_business: Math.floor(Math.random() * 10) + 5,
            license_number: null,
            insurance: true,
            price_range: parseInt(row.reviewsCount) > 50 ? 'premium' : 'moderate',
            services: JSON.stringify(services),
            service_areas: JSON.stringify(serviceAreas),
            hours: hours ? JSON.stringify(hours) : null,
            gallery_images: row.photos_count > 0 ? JSON.stringify([row.image]) : null,
            certifications: JSON.stringify(['Licensed', 'Insured']),
            owner_name: null,
            owner_email: null,
            owner_phone: null
          };

          businesses.push(business);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Found ${businesses.length} businesses to import`);

    // Process in batches to avoid timeout
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, Math.min(i + batchSize, businesses.length));
      console.log(`\n💾 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(businesses.length/batchSize)} (${batch.length} businesses)...`);

      for (const business of batch) {
        try {
          await sql`
            INSERT INTO businesses (
              name, category, description, rating, reviews, phone, email, website,
              address, city, state, zipcode, latitude, longitude,
              is_featured, is_verified, is_claimed, featured_until,
              logo_url, cover_image, years_in_business, license_number,
              insurance, price_range, services, service_areas, hours,
              gallery_images, certifications, owner_name, owner_email, owner_phone
            ) VALUES (
              ${business.name}, ${business.category}, ${business.description},
              ${business.rating}, ${business.reviews}, ${business.phone},
              ${business.email}, ${business.website}, ${business.address},
              ${business.city}, ${business.state}, ${business.zipcode},
              ${business.latitude}, ${business.longitude}, ${business.is_featured}::boolean,
              ${business.is_verified}::boolean, ${business.is_claimed}::boolean, ${business.featured_until},
              ${business.logo_url}, ${business.cover_image}, ${business.years_in_business},
              ${business.license_number}, ${business.insurance}::boolean, ${business.price_range},
              ${business.services}::jsonb, ${business.service_areas}::jsonb, ${business.hours}::jsonb,
              ${business.gallery_images}::jsonb, ${business.certifications}::jsonb, ${business.owner_name},
              ${business.owner_email}, ${business.owner_phone}
            ) RETURNING id
          `;
          successCount++;
        } catch (error) {
          errorCount++;
          if (errorCount <= 3) {
            console.error(`   ❌ Failed: ${business.name}: ${error.message}`);
          }
        }
      }

      console.log(`   ✅ Batch complete: ${successCount} imported so far`);
    }

    // Final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM businesses`;
    console.log('\n✅ Import completed!');
    console.log(`   - Newly imported: ${successCount} businesses`);
    console.log(`   - Failed: ${errorCount} businesses`);
    console.log(`   - Total in database: ${finalCount[0].count} businesses`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

importRemaining();
