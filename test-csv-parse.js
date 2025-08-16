const csv = require('csv-parser');
const fs = require('fs');

// Copy the helper functions from import script
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

let rowCount = 0;

fs.createReadStream('../uploads/backup_8-14-2025.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (rowCount++ === 0) {  // Just process first row
      console.log('Raw CSV row keys:', Object.keys(row));
      console.log('\nRaw values for key fields:');
      console.log('  featured:', row.featured, 'type:', typeof row.featured);
      console.log('  reviewsCount:', row.reviewsCount, 'type:', typeof row.reviewsCount);
      console.log('  status:', row.status);

      // Create business object as the import script would
      const business = {
        name: row.name,
        category: parseCategories(row.categories),
        is_featured: row.featured === '1' || row.featured === 1 || parseInt(row.reviewsCount || 0) > 100,
        is_verified: row.status === 'open' && parseInt(row.reviewsCount || 0) > 10,
        is_claimed: false,
      };

      console.log('\nGenerated business object:');
      console.log('  is_featured:', business.is_featured, 'type:', typeof business.is_featured);
      console.log('  is_verified:', business.is_verified, 'type:', typeof business.is_verified);

      // Check if 'featured' is accidentally included
      if ('featured' in row) {
        console.log('\n⚠️  Raw row contains "featured" field:', row.featured);
      }

      // Simulate what columns would be sent
      const allKeys = Object.keys({...row, ...business});
      console.log('\nAll possible keys after merge:', allKeys.filter(k => k.includes('featured')));
    }
  });
