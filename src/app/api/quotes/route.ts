import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET: Fetch quotes for current user or business
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    let userId: string | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch {
        // User not logged in, that's okay for quote fetching
      }
    }

    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('business_id');
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query based on filters
    let query = sql`
      SELECT 
        q.*,
        b.name as business_name,
        b.phone as business_phone,
        b.email as business_email,
        COUNT(qr.id) as response_count
      FROM quotes q
      LEFT JOIN businesses b ON q.business_id = b.id
      LEFT JOIN quote_responses qr ON q.id = qr.quote_id
      WHERE 1=1
    `;

    // Add filters
    if (businessId) {
      query = sql`${query} AND q.business_id = ${businessId}`;
    }
    if (customerId || userId) {
      query = sql`${query} AND q.customer_id = ${customerId || userId}`;
    }
    if (status) {
      query = sql`${query} AND q.status = ${status}`;
    }

    query = sql`
      ${query}
      GROUP BY q.id, b.id
      ORDER BY q.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const quotes = await query;

    // Get total count
    let countQuery = sql`
      SELECT COUNT(*) as total FROM quotes q WHERE 1=1
    `;
    if (businessId) {
      countQuery = sql`${countQuery} AND q.business_id = ${businessId}`;
    }
    if (customerId || userId) {
      countQuery = sql`${countQuery} AND q.customer_id = ${customerId || userId}`;
    }
    if (status) {
      countQuery = sql`${countQuery} AND q.status = ${status}`;
    }

    const countResult = await countQuery;
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      quotes,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST: Create a new quote request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get user ID if logged in
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    let userId: string | null = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch {
        // User not logged in
      }
    }

    // Validate required fields
    const { name, email, phone, service_type } = body;
    if (!name || !email || !service_type) {
      return NextResponse.json(
        { error: 'Name, email, and service type are required' },
        { status: 400 }
      );
    }

    // Extract service address and location details
    const serviceAddress = body.serviceAddress || body.service_address || '';
    const serviceCity = body.city || '';
    const serviceState = body.state || '';
    const serviceArea = [serviceCity, serviceState].filter(Boolean).join(', ') || body.service_area || '';

    // Create quote in database - note: business_id can be null for general quotes
    const result = await sql`
      INSERT INTO quotes (
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_zipcode,
        service_address,
        service_city,
        service_state,
        service_area,
        business_id,
        business_name,
        service_type,
        project_description,
        timeline,
        budget,
        status,
        source,
        referrer,
        ip_address,
        user_agent
      ) VALUES (
        ${userId},
        ${name},
        ${email},
        ${phone || null},
        ${body.zipcode || null},
        ${serviceAddress || null},
        ${serviceCity || null},
        ${serviceState || null},
        ${serviceArea || null},
        ${body.businessId || null},
        ${body.businessName || null},
        ${service_type},
        ${body.project_description || null},
        ${body.timeline || body.deliveryDate || 'flexible'},
        ${body.budget || 'not_sure'},
        'new',
        ${body.source || 'website'},
        ${request.headers.get('referer') || null},
        ${request.headers.get('x-forwarded-for') || null},
        ${request.headers.get('user-agent') || null}
      )
      RETURNING *
    `;

    const quote = result[0];

    // If a specific business was selected, update their new lead count
    if (body.businessId) {
      // In a real app, you'd send email notification here
      console.log(`Quote ${quote.id} sent to business:`, body.businessId);
      
      // Update business's new lead count (for notification badges)
      await sql`
        UPDATE businesses 
        SET new_leads_count = COALESCE(new_leads_count, 0) + 1
        WHERE id = ${body.businessId}
      `;
    } else {
      // General quote - available for all businesses to browse
      console.log(`General quote ${quote.id} created - available for all businesses`);
    }

    // If user is logged in, link this quote to their account
    if (userId && !quote.customer_id) {
      await sql`
        UPDATE quotes 
        SET customer_id = ${userId}
        WHERE id = ${quote.id}
      `;
    }

    return NextResponse.json({
      success: true,
      quote,
      message: 'Quote request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote request' },
      { status: 500 }
    );
  }
}

// PATCH: Update quote status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, response_message } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Quote ID and status are required' },
        { status: 400 }
      );
    }

    // Verify user has permission to update this quote
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user owns this quote or is the business it was sent to
    const quoteCheck = await sql`
      SELECT q.*, b.user_id as business_user_id
      FROM quotes q
      LEFT JOIN businesses b ON q.business_id = b.id
      WHERE q.id = ${id}
    `;

    if (quoteCheck.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quoteCheck[0];
    const canUpdate = quote.customer_id === userId || quote.business_user_id === userId;

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized to update this quote' }, { status: 403 });
    }

    // Update quote
    const updateData: any = {
      status,
      updated_at: new Date()
    };

    if (status === 'viewed' && !quote.viewed_at) {
      updateData.viewed_at = new Date();
    }

    if (status === 'responded' && response_message) {
      updateData.responded_at = new Date();
      updateData.response_message = response_message;
    }

    const result = await sql`
      UPDATE quotes
      SET 
        status = ${status},
        viewed_at = ${updateData.viewed_at || quote.viewed_at},
        responded_at = ${updateData.responded_at || quote.responded_at},
        response_message = ${updateData.response_message || quote.response_message},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      quote: result[0]
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}