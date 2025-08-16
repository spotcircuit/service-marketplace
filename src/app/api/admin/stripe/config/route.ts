import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Fetch Stripe configuration
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configs = await sql`
      SELECT key, value, is_encrypted
      FROM stripe_config
    `;

    const configMap: Record<string, any> = {};

    configs.forEach((item: any) => {
      const key = item.key;
      let value = item.value;

      // Convert string booleans to actual booleans
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // Convert numbers
      else if (key === 'trial_days' && value) value = parseInt(value);

      // Mask sensitive keys for display
      if (item.is_encrypted && value) {
        if (key === 'stripe_secret_key') {
          value = value.substring(0, 7) + '...' + value.substring(value.length - 4);
        } else if (key === 'stripe_webhook_secret') {
          value = value.substring(0, 10) + '...' + value.substring(value.length - 4);
        }
      }

      configMap[key] = value;
    });

    return NextResponse.json({
      config: configMap
    });

  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// POST: Save Stripe configuration
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (body.stripe_enabled && (!body.stripe_publishable_key || !body.stripe_secret_key)) {
      return NextResponse.json(
        { error: 'Publishable and secret keys are required when Stripe is enabled' },
        { status: 400 }
      );
    }

    // Update each configuration
    for (const [key, value] of Object.entries(body)) {
      // Only update if the value has changed (not masked)
      if (typeof value === 'string' && value.includes('...') &&
          (key === 'stripe_secret_key' || key === 'stripe_webhook_secret')) {
        continue; // Skip masked values
      }

      await sql`
        UPDATE stripe_config
        SET value = ${String(value)},
            updated_at = NOW()
        WHERE key = ${key}
      `;
    }

    // Test Stripe connection if enabled
    if (body.stripe_enabled && body.stripe_secret_key && !body.stripe_secret_key.includes('...')) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(body.stripe_secret_key, {
          apiVersion: '2024-12-18.acacia'
        });

        // Test the connection
        await stripe.products.list({ limit: 1 });
      } catch (stripeError: any) {
        return NextResponse.json(
          { error: `Invalid Stripe secret key: ${stripeError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully'
    });

  } catch (error) {
    console.error('Error saving Stripe config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
