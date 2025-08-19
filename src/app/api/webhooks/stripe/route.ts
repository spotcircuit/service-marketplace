import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/lib/neon';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Check if this is a subscription or one-time payment
        if (session.mode === 'subscription') {
          // Handle subscription activation
          await handleSubscriptionCreated(session);
        } else if (session.mode === 'payment') {
          // Handle one-time payment (credits purchase)
          await handlePaymentCompleted(session);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle recurring payment (monthly credit refresh)
        // Safely extract subscriptionId without depending on Invoice typing
        const invAny = invoice as unknown as { subscription?: string | { id: string } | null };
        const subscriptionId = typeof invAny.subscription === 'string'
          ? invAny.subscription
          : invAny.subscription?.id;

        if (subscriptionId) {
          await handleRecurringPayment(subscriptionId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const { business_id, user_id } = session.metadata || {};
  
  if (!business_id) {
    console.error('No business_id in session metadata');
    return;
  }

  // Update business subscription
  await sql`
    UPDATE business_subscriptions
    SET 
      subscription_tier = 'monthly',
      stripe_subscription_id = ${session.subscription as string},
      stripe_customer_id = ${session.customer as string},
      status = 'active',
      monthly_credit_allowance = 10,
      lead_credits = lead_credits + 10,
      next_credit_refresh = NOW() + INTERVAL '30 days',
      current_period_start = NOW(),
      current_period_end = NOW() + INTERVAL '30 days',
      updated_at = NOW()
    WHERE business_id = ${business_id}::uuid
  `;

  console.log(`Subscription activated for business ${business_id}`);
}

async function handlePaymentCompleted(session: Stripe.Checkout.Session) {
  const { business_id, type, credits, duration_days, is_trial } = session.metadata || {};
  
  if (!business_id) {
    console.error('No business_id in session metadata');
    return;
  }

  if (type === 'monthly_subscription' && credits && duration_days) {
    // Handle monthly subscription payment
    const creditsToAdd = parseInt(credits);
    const days = parseInt(duration_days);
    
    // Update or create subscription record
    await sql`
      INSERT INTO business_subscriptions (
        business_id,
        user_id,
        subscription_tier,
        status,
        lead_credits,
        monthly_credit_allowance,
        credits_used_this_period,
        next_credit_refresh,
        current_period_start,
        current_period_end,
        stripe_customer_id,
        created_at,
        updated_at
      ) VALUES (
        ${business_id}::uuid,
        (SELECT id FROM users WHERE business_id = ${business_id}::uuid LIMIT 1),
        'monthly',
        'active',
        ${creditsToAdd},
        ${creditsToAdd},
        0,
        NOW() + INTERVAL '${days} days',
        NOW(),
        NOW() + INTERVAL '${days} days',
        ${session.customer as string},
        NOW(),
        NOW()
      )
      ON CONFLICT (business_id)
      DO UPDATE SET
        subscription_tier = 'monthly',
        status = 'active',
        lead_credits = business_subscriptions.lead_credits + ${creditsToAdd},
        monthly_credit_allowance = ${creditsToAdd},
        credits_used_this_period = 0,
        next_credit_refresh = NOW() + INTERVAL '${days} days',
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '${days} days',
        stripe_customer_id = ${session.customer as string},
        updated_at = NOW()
    `;
    
    console.log(`Monthly subscription activated for business ${business_id} with ${creditsToAdd} credits for ${days} days`);
    
  } else if (type === 'credits' && credits) {
    // Add credits to the business
    const creditsToAdd = parseInt(credits);
    await sql`
      UPDATE business_subscriptions
      SET 
        lead_credits = lead_credits + ${creditsToAdd},
        updated_at = NOW()
      WHERE business_id = ${business_id}::uuid
    `;
    
    console.log(`Added ${creditsToAdd} credits to business ${business_id}`);
  } else if (type === 'featured_listing' && duration_days) {
    // Handle featured listing payment
    const days = parseInt(duration_days);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    const isTrial = is_trial === 'true';
    
    // Insert or update featured listing
    await sql`
      INSERT INTO featured_listings (
        business_id,
        expires_at,
        is_trial,
        trial_used,
        auto_renew,
        stripe_payment_intent_id,
        created_at,
        updated_at
      ) VALUES (
        ${business_id}::uuid,
        ${expiresAt.toISOString()},
        ${isTrial},
        ${isTrial},
        false,
        ${session.payment_intent as string},
        NOW(),
        NOW()
      )
      ON CONFLICT (business_id)
      DO UPDATE SET
        expires_at = ${expiresAt.toISOString()},
        is_trial = ${isTrial},
        trial_used = CASE WHEN ${isTrial} THEN true ELSE featured_listings.trial_used END,
        stripe_payment_intent_id = ${session.payment_intent as string},
        updated_at = NOW()
    `;
    
    console.log(`Featured listing ${isTrial ? '(FREE TRIAL)' : ''} activated for business ${business_id} for ${days} days`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Find business by stripe_subscription_id
  const result = await sql`
    SELECT business_id 
    FROM business_subscriptions 
    WHERE stripe_subscription_id = ${subscription.id}
  `;

  if (result.length === 0) {
    console.error('No business found for subscription:', subscription.id);
    return;
  }

  const businessId = result[0].business_id;

  // Update subscription status (access period fields safely due to Stripe type variations)
  const sAny = subscription as any;
  const periodStart = sAny.current_period_start ? Number(sAny.current_period_start) : null;
  const periodEnd = sAny.current_period_end ? Number(sAny.current_period_end) : null;

  await sql`
    UPDATE business_subscriptions
    SET 
      status = ${subscription.status},
      ${periodStart !== null ? sql`current_period_start = to_timestamp(${periodStart}),` : sql``}
      ${periodEnd !== null ? sql`current_period_end = to_timestamp(${periodEnd}),` : sql``}
      cancel_at_period_end = ${subscription.cancel_at_period_end},
      updated_at = NOW()
    WHERE business_id = ${businessId}::uuid
  `;
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Find and update business subscription
  const result = await sql`
    UPDATE business_subscriptions
    SET 
      status = 'cancelled',
      subscription_tier = 'pay_per_lead',
      monthly_credit_allowance = 0,
      canceled_at = NOW(),
      updated_at = NOW()
    WHERE stripe_subscription_id = ${subscription.id}
    RETURNING business_id
  `;

  if (result.length > 0) {
    console.log(`Subscription cancelled for business ${result[0].business_id}`);
  }
}

async function handleRecurringPayment(subscriptionId: string) {
  // This is called on successful recurring payment (monthly renewal)
  // Find business and refresh credits
  const result = await sql`
    UPDATE business_subscriptions
    SET 
      lead_credits = lead_credits + monthly_credit_allowance,
      credits_used_this_period = 0,
      next_credit_refresh = NOW() + INTERVAL '30 days',
      updated_at = NOW()
    WHERE stripe_subscription_id = ${subscriptionId}
    AND subscription_tier = 'monthly'
    RETURNING business_id, monthly_credit_allowance
  `;

  if (result.length > 0) {
    console.log(`Refreshed ${result[0].monthly_credit_allowance} credits for business ${result[0].business_id}`);
  }
}