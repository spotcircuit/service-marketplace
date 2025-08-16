import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stripe = await getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get all active plans except Free
    const plans = await sql`
      SELECT * FROM subscription_plans
      WHERE is_active = true AND price > 0
      ORDER BY sort_order ASC
    `;

    const results = [];

    for (const plan of plans) {
      // Skip if already synced
      if (plan.stripe_product_id && plan.stripe_price_id) {
        results.push({
          plan: plan.name,
          status: 'already_synced',
          product_id: plan.stripe_product_id,
          price_id: plan.stripe_price_id
        });
        continue;
      }

      try {
        // Create product in Stripe
        const product = await stripe.products.create({
          name: plan.name + ' Plan',
          description: plan.description || `${plan.name} subscription plan`,
          metadata: {
            plan_id: plan.id,
            lead_credits: String(plan.lead_credits)
          }
        });

        // Create price in Stripe
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(parseFloat(plan.price) * 100), // Convert to cents
          currency: plan.currency.toLowerCase() || 'usd',
          recurring: {
            interval: plan.interval || 'month'
          },
          metadata: {
            plan_name: plan.name
          }
        });

        // Update plan with Stripe IDs
        await sql`
          UPDATE subscription_plans
          SET
            stripe_product_id = ${product.id},
            stripe_price_id = ${price.id},
            updated_at = NOW()
          WHERE id = ${plan.id}
        `;

        results.push({
          plan: plan.name,
          status: 'synced',
          product_id: product.id,
          price_id: price.id
        });

      } catch (error: any) {
        results.push({
          plan: plan.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Sync all plans error:', error);
    return NextResponse.json(
      { error: 'Failed to sync plans' },
      { status: 500 }
    );
  }
}
