import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { businessCache } from '@/lib/cache';

// Map of state names to abbreviations
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'district of columbia': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI',
  'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME',
  'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX',
  'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

// Reverse map: abbreviation -> Title Case full state name
const ABBR_TO_NAME: Record<string, string> = Object.entries(STATE_NAME_TO_ABBR).reduce(
  (acc, [fullLower, abbr]) => {
    const title = fullLower
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
    acc[abbr] = title;
    return acc;
  },
  {} as Record<string, string>
);

// GET: Fetch businesses from cache or database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    let state = searchParams.get('state');
    
    // Convert full state name to abbreviation if needed
    if (state) {
      const stateLower = state.toLowerCase();
      if (STATE_NAME_TO_ABBR[stateLower]) {
        state = STATE_NAME_TO_ABBR[stateLower];
      } else if (state.length === 2) {
        state = state.toUpperCase();
      }
    }
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Try to use cache first - but skip if we have state/city filters (cache filtering is broken)
    if (businessCache.isInitialized() && !state && !city) {
      // Use cache for all queries
      const result = businessCache.getBusinessesWithTotal({
        category: category || undefined,
        city: city || undefined,
        state: state || undefined,
        featured: featured === 'true' ? true : undefined,
        verified: verified === 'true' ? true : undefined,
        search: search || undefined,
        limit,
        offset
      });

      return NextResponse.json({
        businesses: result.businesses,
        total: result.total,
        cached: true,
        lastUpdated: businessCache.getLastUpdated()
      });
    }

    // Check if database is configured
    if (!sql) {
      return NextResponse.json({
        businesses: [],
        total: 0,
        cached: false,
        error: 'Database not configured'
      });
    }

    // Fallback to direct database query if cache not ready
    // Build query conditions dynamically
    const conditions = [];
    const values = [];
    
    if (category) {
      conditions.push(`LOWER(category) = LOWER($${values.length + 1})`);
      values.push(category);
    }
    if (city) {
      conditions.push(`LOWER(city) = LOWER($${values.length + 1})`);
      values.push(city);
    }
    if (state) {
      const fullName = ABBR_TO_NAME[state];
      if (fullName) {
        conditions.push(`(LOWER(state) = LOWER($${values.length + 1}) OR LOWER(state) = LOWER($${values.length + 2}))`);
        values.push(state, fullName);
      } else {
        conditions.push(`LOWER(state) = LOWER($${values.length + 1})`);
        values.push(state);
      }
    }
    if (featured === 'true') {
      conditions.push(`is_featured = true`);
    }
    if (verified === 'true') {
      conditions.push(`is_verified = true`);
    }
    if (search) {
      conditions.push(`(
        LOWER(name) LIKE LOWER($${values.length + 1}) OR
        LOWER(description) LIKE LOWER($${values.length + 2}) OR
        LOWER(category) LIKE LOWER($${values.length + 3})
      )`);
      values.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Add limit and offset to values
    values.push(limit, offset);
    
    const queryText = `
      SELECT * FROM businesses
      ${whereClause}
      ORDER BY is_featured DESC, rating DESC, reviews DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;
    
    const businesses = await sql(queryText, values);

    // Get total count
    const countConditions = [];
    const countValues = [];
    
    if (category) {
      countConditions.push(`LOWER(category) = LOWER($${countValues.length + 1})`);
      countValues.push(category);
    }
    if (city) {
      countConditions.push(`LOWER(city) = LOWER($${countValues.length + 1})`);
      countValues.push(city);
    }
    if (state) {
      const fullName = ABBR_TO_NAME[state];
      if (fullName) {
        countConditions.push(`(LOWER(state) = LOWER($${countValues.length + 1}) OR LOWER(state) = LOWER($${countValues.length + 2}))`);
        countValues.push(state, fullName);
      } else {
        countConditions.push(`LOWER(state) = LOWER($${countValues.length + 1})`);
        countValues.push(state);
      }
    }
    if (featured === 'true') {
      countConditions.push(`is_featured = true`);
    }
    if (verified === 'true') {
      countConditions.push(`is_verified = true`);
    }
    if (search) {
      countConditions.push(`(
        LOWER(name) LIKE LOWER($${countValues.length + 1}) OR
        LOWER(description) LIKE LOWER($${countValues.length + 2}) OR
        LOWER(category) LIKE LOWER($${countValues.length + 3})
      )`);
      countValues.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
    }
    
    const countWhereClause = countConditions.length > 0 ? `WHERE ${countConditions.join(' AND ')}` : '';
    
    const countQueryText = `
      SELECT COUNT(*) as total FROM businesses
      ${countWhereClause}
    `;
    
    const countResult = await sql(countQueryText, countValues);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      businesses,
      total,
      cached: false
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', businesses: [], total: 0 },
      { status: 500 }
    );
  }
}

// POST: Create a new business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, category, phone, address, city, state, zipcode } = body;
    if (!name || !category || !phone || !address || !city || !state || !zipcode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await sql`
      INSERT INTO businesses (
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
        is_featured,
        is_verified,
        is_claimed,
        logo_url,
        cover_image,
        years_in_business,
        license_number,
        insurance,
        price_range,
        services,
        service_areas,
        hours,
        gallery_images,
        certifications,
        owner_name,
        owner_email,
        owner_phone,
        rating,
        reviews
      ) VALUES (
        ${name},
        ${category},
        ${body.description || null},
        ${phone},
        ${body.email || null},
        ${body.website || null},
        ${address},
        ${city},
        ${state},
        ${zipcode},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.is_featured || false},
        ${body.is_verified || false},
        ${body.is_claimed || false},
        ${body.logo_url || null},
        ${body.cover_image || null},
        ${body.years_in_business || null},
        ${body.license_number || null},
        ${body.insurance || false},
        ${body.price_range || null},
        ${JSON.stringify(body.services || [])},
        ${JSON.stringify(body.service_areas || [])},
        ${JSON.stringify(body.hours || {})},
        ${JSON.stringify(body.gallery_images || [])},
        ${JSON.stringify(body.certifications || [])},
        ${body.owner_name || null},
        ${body.owner_email || null},
        ${body.owner_phone || null},
        ${body.rating || 0},
        ${body.reviews || 0}
      )
      RETURNING *
    `;

    const newBusiness = result[0];

    // Add to cache
    if (businessCache.isInitialized()) {
      businessCache.addBusiness(newBusiness);
    }

    return NextResponse.json({
      success: true,
      business: newBusiness
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}

// PATCH: Update a business
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updateFields = Object.keys(updates).map(key => {
      const value = updates[key];
      // Handle JSON fields
      if (['services', 'service_areas', 'hours', 'gallery_images', 'certifications'].includes(key)) {
        return sql`${sql(key)} = ${JSON.stringify(value)}`;
      }
      return sql`${sql(key)} = ${value}`;
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE businesses
      SET ${sql.join(updateFields, sql`, `)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const updatedBusiness = result[0];

    // Update cache
    if (businessCache.isInitialized()) {
      businessCache.updateBusiness(id, updatedBusiness);
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a business
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM businesses
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Remove from cache
    if (businessCache.isInitialized()) {
      businessCache.removeBusiness(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}