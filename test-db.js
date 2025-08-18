const { sql } = require('@neon-serverless/driver');

async function testBusinesses() {
  try {
    // Check what cities and states we have businesses in
    const result = await sql`
      SELECT city, state, COUNT(*) as count 
      FROM businesses 
      GROUP BY city, state 
      ORDER BY count DESC 
      LIMIT 20
    `;
    
    console.log('Cities with businesses:');
    result.forEach(row => {
      console.log(`${row.city}, ${row.state}: ${row.count} businesses`);
    });
    
    // Check Richmond specifically
    const richmond = await sql`
      SELECT * FROM businesses 
      WHERE city ILIKE '%richmond%' 
      LIMIT 5
    `;
    
    console.log('\nRichmond businesses:', richmond.length);
    if (richmond.length > 0) {
      console.log('Sample:', richmond[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBusinesses();