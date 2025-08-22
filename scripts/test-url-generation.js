// Test script to verify URL generation logic
require('dotenv').config({ path: '.env.local' });

// Simulate the logic from the export route
const productionUrl = process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
const baseUrl = productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`;

console.log('Environment Variables:');
console.log('PRODUCTION_URL:', process.env.PRODUCTION_URL);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('');
console.log('Generated Base URL:', baseUrl);
console.log('');

// Test with a sample token
const sampleToken = 'test-token-123';
const shortUrl = `${baseUrl}/claim/${sampleToken}`;
console.log('Sample Short URL:', shortUrl);
console.log('');

// Test with sample business data
const sampleBusiness = {
  id: 'abc-123',
  name: 'Test Business',
  email: 'test@example.com',
  phone: '555-1234',
  address: '123 Main St',
  city: 'Denver',
  state: 'CO',
  zipcode: '80202',
  category: 'Dumpster Rental',
  website: 'https://example.com'
};

const longUrl = `${baseUrl}/claim?businessId=${sampleBusiness.id}&businessName=${encodeURIComponent(sampleBusiness.name)}&email=${encodeURIComponent(sampleBusiness.email)}&phone=${encodeURIComponent(sampleBusiness.phone)}&address=${encodeURIComponent(sampleBusiness.address)}&city=${encodeURIComponent(sampleBusiness.city)}&state=${encodeURIComponent(sampleBusiness.state)}&zipcode=${encodeURIComponent(sampleBusiness.zipcode)}&category=${encodeURIComponent(sampleBusiness.category)}&website=${encodeURIComponent(sampleBusiness.website)}`;

console.log('Sample Long URL:', longUrl);