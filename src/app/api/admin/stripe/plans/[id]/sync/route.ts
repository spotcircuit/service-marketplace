import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';
import { createStripeProduct } from '@/lib/stripe';

// POST: Sync plan with Stripe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get plan details
    const plans = await sql`
      SELECT * FROM subscription_plans
      WHERE id = ${id}
    `;

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const plan = plans[0];

    // Check if already synced
    if (plan.stripe_product_id && plan.stripe_price_id) {
      return NextResponse.json(
        { error: 'Plan is already synced with Stripe' },
        { status: 400 }
      );
    }

    // Create product and price in Stripe
    const stripeResult = await createStripeProduct({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      interval: plan.interval || 'month'
    });

    if (!stripeResult) {
      return NextResponse.json(
        { error: 'Failed to create Stripe product. Check your Stripe configuration.' },
        { status: 500 }
      );
    }

    // Update plan with Stripe IDs
    await sql`
      UPDATE subscription_plans
      SET
        stripe_product_id = ${stripeResult.productId},
        stripe_price_id = ${stripeResult.priceId},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Plan synced with Stripe successfully',
      stripe_product_id: stripeResult.productId,
      stripe_price_id: stripeResult.priceId
    });

  } catch (error) {
    console.error('Error syncing plan with Stripe:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Stripe' },
      { status: 500 }
    );
  }
}
