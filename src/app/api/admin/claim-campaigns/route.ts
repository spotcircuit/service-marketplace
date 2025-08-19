import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET: Fetch unclaimed businesses and their campaign status
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await verifyToken(token.value);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeEmailed = searchParams.get('includeEmailed') === 'true';
    const includeClaimed = searchParams.get('includeClaimed') === 'true';
    const emailFilter = searchParams.get('emailFilter') || 'with-email';
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const conditions = [];
    
    // Claimed/unclaimed filter
    if (!includeClaimed) {
      conditions.push(`b.is_claimed = false`);
    }
    
    // Email filter
    if (emailFilter === 'with-email') {
      conditions.push(`b.email IS NOT NULL`);
      conditions.push(`b.email != ''`);
    } else if (emailFilter === 'without-email') {
      conditions.push(`(b.email IS NULL OR b.email = '')`);
    }
    // 'all' means no email filter
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (!includeEmailed) {
      conditions.push(`cc.email_sent_at IS NULL`);
    }
    
    if (state) {
      paramCount++;
      conditions.push(`b.state = $${paramCount}`);
      params.push(state);
    }
    
    if (city) {
      paramCount++;
      conditions.push(`b.city = $${paramCount}`);
      params.push(city);
    }
    
    // Add limit and offset params
    params.push(limit);
    params.push(offset);
    
    // Fetch unclaimed businesses
    const query = `
      SELECT 
        b.id,
        b.name,
        b.email,
        b.phone,
        b.address,
        b.city,
        b.state,
        b.zipcode,
        b.category,
        b.website,
        b.rating,
        b.reviews,
        b.created_at,
        cc.claim_token,
        cc.email_sent_at,
        cc.email_opened_at,
        cc.link_clicked_at,
        cc.expires_at
      FROM businesses b
      LEFT JOIN LATERAL (
        SELECT * FROM claim_campaigns 
        WHERE business_id = b.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) cc ON true
      WHERE ${conditions.join(' AND ')}
      ORDER BY b.reviews DESC, b.rating DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const businesses = await sql(query, params);

    // Get total count with same filters (exclude limit/offset params)
    const countParams = params.slice(0, -2);
    const countQuery = `
      SELECT COUNT(*) as total
      FROM businesses b
      LEFT JOIN LATERAL (
        SELECT * FROM claim_campaigns 
        WHERE business_id = b.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) cc ON true
      WHERE ${conditions.join(' AND ')}
    `;
    
    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      businesses,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching unclaimed businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unclaimed businesses' },
      { status: 500 }
    );
  }
}

// POST: Generate claim tokens for selected businesses
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await verifyToken(token.value);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessIds, campaignName, expiresInDays = 30 } = body;

    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'Business IDs are required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const businessId of businessIds) {
      try {
        // Check if business exists and is unclaimed
        const business = await sql`
          SELECT id, name, email, is_claimed 
          FROM businesses 
          WHERE id = ${businessId}
        `;

        if (business.length === 0) {
          errors.push({ businessId, error: 'Business not found' });
          continue;
        }

        if (business[0].is_claimed) {
          errors.push({ businessId, error: 'Business already claimed' });
          continue;
        }

        // Generate claim token
        const tokenResult = await sql`
          SELECT generate_claim_token() as token
        `;
        const token = tokenResult[0].token;

        // Create campaign record
        const campaign = await sql`
          INSERT INTO claim_campaigns (
            business_id,
            claim_token,
            email_sent_to,
            expires_at,
            campaign_name
          ) VALUES (
            ${businessId},
            ${token},
            ${business[0].email},
            NOW() + INTERVAL '${expiresInDays} days',
            ${campaignName || 'Manual Campaign'}
          )
          RETURNING *
        `;

        results.push({
          businessId,
          businessName: business[0].name,
          email: business[0].email,
          token,
          claimUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/claim/${token}`,
          expiresAt: campaign[0].expires_at
        });

      } catch (error) {
        console.error(`Error generating token for business ${businessId}:`, error);
        errors.push({ businessId, error: 'Failed to generate token' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: businessIds.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Error generating claim tokens:', error);
    return NextResponse.json(
      { error: 'Failed to generate claim tokens' },
      { status: 500 }
    );
  }
}