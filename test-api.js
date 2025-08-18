async function testAPI() {
  try {
    // Test Richmond, VA
    console.log('Testing Richmond, VA:');
    const richmond = await fetch('http://localhost:3000/api/businesses?city=Richmond&state=VA&featured=true&limit=6');
    const richmondData = await richmond.json();
    console.log('Richmond response:', richmondData);
    
    // Test Ashburn, VA
    console.log('\nTesting Ashburn, VA:');
    const ashburn = await fetch('http://localhost:3000/api/businesses?city=Ashburn&state=VA&featured=true&limit=6');
    const ashburnData = await ashburn.json();
    console.log('Ashburn response:', ashburnData);
    
    // Test all businesses
    console.log('\nTesting all businesses:');
    const all = await fetch('http://localhost:3000/api/businesses?limit=10');
    const allData = await all.json();
    console.log('All businesses count:', allData.businesses?.length);
    if (allData.businesses?.length > 0) {
      console.log('Sample business:', allData.businesses[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();