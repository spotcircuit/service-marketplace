import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, city, state, zipcode } = body;

    if (!address || !city || !state) {
      return NextResponse.json(
        { error: 'Address, city, and state are required' },
        { status: 400 }
      );
    }

    // Check for existing business at this address
    const result = await sql`
      SELECT 
        id, 
        name, 
        address, 
        city, 
        state, 
        zipcode, 
        is_claimed,
        is_verified,
        category,
        phone,
        email
      FROM businesses
      WHERE LOWER(address) = LOWER(${address})
        AND LOWER(city) = LOWER(${city})
        AND LOWER(state) = LOWER(${state})
      LIMIT 1
    `;

    if (result && result.length > 0) {
      return NextResponse.json({
        business: result[0],
        exists: true
      });
    }

    return NextResponse.json({
      business: null,
      exists: false
    });

  } catch (error) {
    console.error('Error checking business address:', error);
    return NextResponse.json(
      { error: 'Failed to check business address' },
      { status: 500 }
    );
  }
}