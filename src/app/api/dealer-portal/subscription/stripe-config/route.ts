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

    // Get Stripe publishable key (safe for client-side)
    const config = await sql`
      SELECT value
      FROM stripe_config
      WHERE key = 'stripe_publishable_key'
    `;

    const enabled = await sql`
      SELECT value
      FROM stripe_config
      WHERE key = 'stripe_enabled'
    `;

    if (config.length === 0 || enabled[0]?.value !== 'true') {
      return NextResponse.json({
        publishableKey: '',
        enabled: false
      });
    }

    return NextResponse.json({
      publishableKey: config[0].value || '',
      enabled: true
    });

  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
