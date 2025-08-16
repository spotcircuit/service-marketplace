import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { businessCache } from '@/lib/cache';

// GET: Fetch businesses from cache or database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Try to use cache first
    if (businessCache.isInitialized()) {
      const businesses = businessCache.getBusinesses({
        category: category || undefined,
        city: city || undefined,
        state: state || undefined,
        featured: featured === 'true' ? true : undefined,
        verified: verified === 'true' ? true : undefined,
        search: search || undefined,
        limit,
        offset
      });

      const stats = businessCache.getStats();
      
      return NextResponse.json({
        businesses,
        total: stats.total_businesses,
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
    let query = sql`
      SELECT * FROM businesses
      WHERE 1=1
    `;

    if (category) {
      query = sql`${query} AND LOWER(category) = LOWER(${category})`;
    }
    if (city) {
      query = sql`${query} AND LOWER(city) = LOWER(${city})`;
    }
    if (state) {
      query = sql`${query} AND LOWER(state) = LOWER(${state})`;
    }
    if (featured === 'true') {
      query = sql`${query} AND is_featured = true`;
    }
    if (verified === 'true') {
      query = sql`${query} AND is_verified = true`;
    }
    if (search) {
      query = sql`${query} AND (
        LOWER(name) LIKE LOWER(${'%' + search + '%'}) OR
        LOWER(description) LIKE LOWER(${'%' + search + '%'}) OR
        LOWER(category) LIKE LOWER(${'%' + search + '%'})
      )`;
    }

    query = sql`
      ${query}
      ORDER BY is_featured DESC, rating DESC, reviews DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const businesses = await query;

    // Get total count
    let countQuery = sql`SELECT COUNT(*) as total FROM businesses WHERE 1=1`;
    if (category) {
      countQuery = sql`${countQuery} AND LOWER(category) = LOWER(${category})`;
    }
    if (city) {
      countQuery = sql`${countQuery} AND LOWER(city) = LOWER(${city})`;
    }
    if (state) {
      countQuery = sql`${countQuery} AND LOWER(state) = LOWER(${state})`;
    }
    if (featured === 'true') {
      countQuery = sql`${countQuery} AND is_featured = true`;
    }
    if (verified === 'true') {
      countQuery = sql`${countQuery} AND is_verified = true`;
    }
    if (search) {
      countQuery = sql`${countQuery} AND (
        LOWER(name) LIKE LOWER(${'%' + search + '%'}) OR
        LOWER(description) LIKE LOWER(${'%' + search + '%'}) OR
        LOWER(category) LIKE LOWER(${'%' + search + '%'})
      )`;
    }

    const countResult = await countQuery;
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