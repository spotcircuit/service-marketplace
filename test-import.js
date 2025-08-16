const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function test() {
  // Test inserting a simple business
  const testBusiness = {
    name: 'Test Business',
    category: 'Test Category',
    phone: '(555) 555-5555',
    address: '123 Test St',
    city: 'TestCity',
    state: 'VA',
    zipcode: '12345',
    rating: 4.5,
    reviews: 10,
    is_featured: false,
    is_verified: true,
    is_claimed: false
  };

  console.log('Test business object:', testBusiness);
  console.log('is_featured type:', typeof testBusiness.is_featured);
  console.log('is_verified type:', typeof testBusiness.is_verified);

  const columns = Object.keys(testBusiness).filter(key => testBusiness[key] !== undefined);
  const values = columns.map(key => testBusiness[key]);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

  console.log('\nColumns:', columns);
  console.log('Values:', values);
  console.log('Value types:', values.map(v => typeof v));

  const query = `
    INSERT INTO businesses (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `;

  console.log('\nQuery:', query);

  try {
    const result = await sql(query, values);
    console.log('\n✅ Success! Business ID:', result[0].id);
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    console.log('Error detail:', error.detail);
  }
}

test();
