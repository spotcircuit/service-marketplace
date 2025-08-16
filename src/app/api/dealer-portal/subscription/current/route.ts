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

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    // Get current subscription
    const subscription = await sql`
      SELECT
        bs.plan,
        bs.status,
        bs.lead_credits,
        bs.leads_received,
        bs.next_billing_date,
        sc.subscription_end_date
      FROM business_subscriptions bs
      LEFT JOIN stripe_customers sc ON sc.business_id = bs.business_id
      WHERE bs.business_id = ${user.business_id}
    `;

    if (subscription.length === 0) {
      // Create default free subscription if none exists
      await sql`
        INSERT INTO business_subscriptions (
          business_id,
          user_id,
          plan,
          status,
          lead_credits,
          leads_received
        ) VALUES (
          ${user.business_id},
          ${user.id},
          'free',
          'active',
          10,
          0
        )
      `;

      return NextResponse.json({
        subscription: {
          plan: 'free',
          status: 'active',
          lead_credits: 10,
          leads_received: 0
        }
      });
    }

    return NextResponse.json({
      subscription: subscription[0]
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
