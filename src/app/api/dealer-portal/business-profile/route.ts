import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's business
    const userResult = await sql`
      SELECT business_id FROM users WHERE id = ${payload.userId}::uuid
    `;

    if (!userResult || userResult.length === 0 || !userResult[0].business_id) {
      return NextResponse.json({ error: 'No business found for user' }, { status: 404 });
    }

    // Get business details
    const businessResult = await sql`
      SELECT 
        id,
        name,
        category,
        description,
        phone,
        email,
        website,
        address,
        city,
        state,
        zipcode,
        latitude,
        longitude,
        price_range,
        years_in_business,
        license_number,
        insurance,
        services,
        service_areas,
        service_radius_miles,
        service_zipcodes,
        hours,
        rating,
        reviews,
        is_verified,
        is_featured,
        featured_until
      FROM businesses
      WHERE id = ${userResult[0].business_id}::uuid
    `;

    if (!businessResult || businessResult.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ business: businessResult[0] });
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's business
    const userResult = await sql`
      SELECT business_id FROM users WHERE id = ${payload.userId}::uuid
    `;

    if (!userResult || userResult.length === 0 || !userResult[0].business_id) {
      return NextResponse.json({ error: 'No business found for user' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      phone,
      email,
      website,
      address,
      city,
      state,
      zipcode,
      price_range,
      years_in_business,
      license_number,
      insurance,
      services,
      service_areas,
      service_radius_miles,
      service_zipcodes
    } = body;

    // Update business
    const result = await sql`
      UPDATE businesses
      SET
        name = ${name},
        category = ${category},
        description = ${description || null},
        phone = ${phone},
        email = ${email},
        website = ${website || null},
        address = ${address},
        city = ${city},
        state = ${state},
        zipcode = ${zipcode},
        price_range = ${price_range || null},
        years_in_business = ${years_in_business || null},
        license_number = ${license_number || null},
        insurance = ${insurance || false},
        services = ${services ? JSON.stringify(services) : null},
        service_areas = ${service_areas ? JSON.stringify(service_areas) : null},
        service_radius_miles = ${service_radius_miles || 25},
        service_zipcodes = ${service_zipcodes && service_zipcodes.length > 0 ? service_zipcodes : null},
        updated_at = NOW()
      WHERE id = ${userResult[0].business_id}::uuid
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating business profile:', error);
    return NextResponse.json(
      { error: 'Failed to update business profile' },
      { status: 500 }
    );
  }
}