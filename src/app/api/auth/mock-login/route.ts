import { NextResponse } from 'next/server';

// Mock admin login for testing
export async function POST() {
  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    phone: '(555) 123-4567',
    address: '123 Main St',
    city: 'Raleigh',
    state: 'North Carolina',
    zipcode: '27601',
    role: 'admin' as const
  };

  const mockToken = 'mock-admin-token-' + Date.now();

  return NextResponse.json({
    user: mockAdmin,
    token: mockToken
  });
}