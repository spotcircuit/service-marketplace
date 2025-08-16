import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active subscription plans
    const plans = await sql`
      SELECT
        id,
        name,
        description,
        price,
        lead_credits,
        features,
        stripe_price_id,
        is_active
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY sort_order ASC, price ASC
    `;

    return NextResponse.json({
      plans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
