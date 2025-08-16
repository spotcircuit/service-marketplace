import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Fetch available quotes that match business services and areas
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    // Get business details including services and service areas
    const businessResult = await sql`
      SELECT 
        services,
        service_areas,
        city,
        state
      FROM businesses
      WHERE id = ${user.business_id}
    `;

    if (!businessResult || businessResult.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = businessResult[0];
    const services: string[] = Array.isArray(business.services) ? (business.services as string[]) : [];
    const serviceAreas: string[] = Array.isArray(business.service_areas) ? (business.service_areas as string[]) : [];

    // Get search params for filtering
    const searchParams = request.nextUrl.searchParams;
    const serviceFilter = searchParams.get('service');
    const areaFilter = searchParams.get('area');
    const statusFilter = searchParams.get('status') || 'new';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the query to get matching quotes
    // Quotes that:
    // 1. Are not assigned to a specific business (business_id IS NULL)
    // 2. Match the business's services (if specified)
    // 3. Match the business's service areas (if specified)
    let query = `
      SELECT 
        q.id,
        q.customer_name,
        q.customer_email,
        q.customer_phone,
        q.customer_zipcode,
        q.service_type,
        q.project_description,
        q.timeline,
        q.budget,
        q.status,
        q.service_address,
        q.service_city,
        q.service_state,
        q.service_area,
        q.created_at,
        q.viewed_at,
        q.responded_at
      FROM quotes q
      WHERE q.business_id IS NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by status
    if (statusFilter !== 'all') {
      query += ` AND q.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    // Filter by service type if business has services configured
    if (services.length > 0 && serviceFilter) {
      query += ` AND q.service_type = $${paramIndex}`;
      params.push(serviceFilter);
      paramIndex++;
    } else if (services.length > 0) {
      // Match any of the business's services
      query += ` AND q.service_type = ANY($${paramIndex}::text[])`;
      params.push(services);
      paramIndex++;
    }

    // Filter by service area if business has areas configured
    if (serviceAreas.length > 0 && areaFilter) {
      query += ` AND (
        q.service_area ILIKE $${paramIndex} 
        OR q.service_city ILIKE $${paramIndex}
        OR q.service_state ILIKE $${paramIndex}
      )`;
      params.push(`%${areaFilter}%`);
      paramIndex++;
    } else if (serviceAreas.length > 0) {
      // Match any of the business's service areas
      const areaConditions = serviceAreas.map(() => {
        const condition = `(
          q.service_area ILIKE $${paramIndex}
          OR q.service_city ILIKE $${paramIndex}
          OR q.service_state ILIKE $${paramIndex}
          OR q.customer_zipcode ILIKE $${paramIndex}
        )`;
        paramIndex++;
        return condition;
      }).join(' OR ');
      
      query += ` AND (${areaConditions})`;
      serviceAreas.forEach((area: string) => params.push(`%${area}%`));
    }

    // Add ordering and pagination
    query += ` ORDER BY q.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute the query
    const quotes = await sql.unsafe(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM quotes q
      WHERE q.business_id IS NULL
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (statusFilter !== 'all') {
      countQuery += ` AND q.status = $${countParamIndex}`;
      countParams.push(statusFilter);
      countParamIndex++;
    }

    if (services.length > 0 && serviceFilter) {
      countQuery += ` AND q.service_type = $${countParamIndex}`;
      countParams.push(serviceFilter);
      countParamIndex++;
    } else if (services.length > 0) {
      countQuery += ` AND q.service_type = ANY($${countParamIndex}::text[])`;
      countParams.push(services);
      countParamIndex++;
    }

    if (serviceAreas.length > 0 && areaFilter) {
      countQuery += ` AND (
        q.service_area ILIKE $${countParamIndex} 
        OR q.service_city ILIKE $${countParamIndex}
        OR q.service_state ILIKE $${countParamIndex}
      )`;
      countParams.push(`%${areaFilter}%`);
      countParamIndex++;
    } else if (serviceAreas.length > 0) {
      const areaConditions = serviceAreas.map(() => {
        const condition = `(
          q.service_area ILIKE $${countParamIndex}
          OR q.service_city ILIKE $${countParamIndex}
          OR q.service_state ILIKE $${countParamIndex}
          OR q.customer_zipcode ILIKE $${countParamIndex}
        )`;
        countParamIndex++;
        return condition;
      }).join(' OR ');
      
      countQuery += ` AND (${areaConditions})`;
      serviceAreas.forEach((area: string) => countParams.push(`%${area}%`));
    }

    const countResult = await sql.unsafe(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      quotes,
      total,
      limit,
      offset,
      business: {
        services,
        service_areas: serviceAreas
      },
      success: true
    });

  } catch (error) {
    console.error('Available quotes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available quotes' },
      { status: 500 }
    );
  }
}

// POST: Claim a quote for the business
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // Check if quote exists and is not already assigned
    const quoteCheck = await sql`
      SELECT id, business_id
      FROM quotes
      WHERE id = ${quoteId}
    `;

    if (!quoteCheck || quoteCheck.length === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quoteCheck[0].business_id) {
      return NextResponse.json(
        { error: 'Quote is already assigned to a business' },
        { status: 400 }
      );
    }

    // Get business name for the quote
    const businessResult = await sql`
      SELECT name FROM businesses WHERE id = ${user.business_id}
    `;

    // Assign the quote to the business
    await sql`
      UPDATE quotes
      SET 
        business_id = ${user.business_id},
        business_name = ${businessResult[0].name},
        status = 'viewed',
        viewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${quoteId}
    `;

    // Update business's new lead count
    await sql`
      UPDATE businesses
      SET new_leads_count = COALESCE(new_leads_count, 0) + 1
      WHERE id = ${user.business_id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Quote claimed successfully'
    });

  } catch (error) {
    console.error('Quote claim error:', error);
    return NextResponse.json(
      { error: 'Failed to claim quote' },
      { status: 500 }
    );
  }
}