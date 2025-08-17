import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, days = 30 } = body;
    
    const targetBusinessId = businessId || user.business_id;
    
    if (!targetBusinessId) {
      return NextResponse.json({ error: 'No business ID provided' }, { status: 400 });
    }

    // Calculate featured_until date
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + days);

    // Update business to be featured
    const result = await sql`
      UPDATE businesses
      SET
        is_featured = true,
        featured_until = ${featuredUntil.toISOString()},
        updated_at = NOW()
      WHERE id = ${targetBusinessId}::uuid
      RETURNING id, name, is_featured, featured_until
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      business: result[0],
      message: `Business featured for ${days} days until ${featuredUntil.toLocaleDateString()}`
    });

  } catch (error: any) {
    console.error('Error setting featured status:', error);
    return NextResponse.json(
      { error: 'Failed to set featured status', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.business_id) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const result = await sql`
      SELECT id, name, is_featured, featured_until
      FROM businesses
      WHERE id = ${user.business_id}::uuid
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const business = result[0];
    const daysRemaining = business.featured_until 
      ? Math.ceil((new Date(business.featured_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      business: business,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isExpired: daysRemaining <= 0
    });

  } catch (error: any) {
    console.error('Error checking featured status:', error);
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    );
  }
}