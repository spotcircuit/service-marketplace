import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ businesses: [] });
    }

    // Search for businesses by name or address
    const businesses = await sql`
      SELECT 
        id,
        name,
        category,
        phone,
        email,
        address,
        city,
        state,
        zipcode,
        is_claimed,
        is_verified,
        rating,
        reviews
      FROM businesses
      WHERE 
        (LOWER(name) LIKE ${`%${query.toLowerCase()}%`}
        OR LOWER(address) LIKE ${`%${query.toLowerCase()}%`}
        OR LOWER(CONCAT(address, ' ', city, ' ', state)) LIKE ${`%${query.toLowerCase()}%`}
        OR LOWER(CONCAT(name, ' ', address)) LIKE ${`%${query.toLowerCase()}%`})
        AND name != 'Unnamed Business'
      ORDER BY 
        CASE 
          WHEN LOWER(name) LIKE ${`${query.toLowerCase()}%`} THEN 1
          WHEN LOWER(name) LIKE ${`%${query.toLowerCase()}%`} THEN 2
          WHEN LOWER(address) LIKE ${`${query.toLowerCase()}%`} THEN 3
          ELSE 4
        END,
        is_verified DESC,
        is_claimed DESC,
        rating DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Business search error:', error);
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    );
  }
}