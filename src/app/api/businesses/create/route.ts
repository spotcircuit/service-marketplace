import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zipcode,
      phone,
      email,
      website,
      category,
      description
    } = body;

    // Validate required fields
    if (!name || !address || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required business information' },
        { status: 400 }
      );
    }

    // Create the business
    const businesses = await sql`
      INSERT INTO businesses (
        name,
        address,
        city,
        state,
        zipcode,
        phone,
        email,
        website,
        category,
        description,
        is_claimed,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        ${name},
        ${address},
        ${city},
        ${state},
        ${zipcode || ''},
        ${phone || ''},
        ${email || ''},
        ${website || ''},
        ${category || 'Dumpster Rental'},
        ${description || ''},
        false,
        false,
        NOW(),
        NOW()
      )
      RETURNING id, name, address, city, state
    `;

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      business: businesses[0]
    });

  } catch (error) {
    console.error('Business creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}