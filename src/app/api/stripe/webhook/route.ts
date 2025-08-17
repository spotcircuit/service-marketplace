import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe';
import { sql } from '@/lib/neon';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = await verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
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
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const metadata = session.metadata || {};

  // Get user and business info from session metadata or customer
  let businessId = metadata.business_id;
  let userId = metadata.user_id;
  
  if (!businessId || !userId) {
    // Try to get from stripe_customers table
    const customer = await sql`
      SELECT business_id, user_id FROM stripe_customers
      WHERE stripe_customer_id = ${customerId}
    `;
    
    if (customer[0]) {
      businessId = businessId || customer[0].business_id;
      userId = userId || customer[0].user_id;
    }
  }

  // Handle credit purchases
  if (metadata.type === 'credits' && metadata.credits) {
    const credits = parseInt(metadata.credits);
    
    if (businessId) {
      // Add credits to business subscription
      await sql`
        UPDATE business_subscriptions
        SET
          lead_credits = COALESCE(lead_credits, 0) + ${credits},
          updated_at = NOW()
        WHERE business_id = ${businessId}
      `;

      // Record transaction
      await sql`
        INSERT INTO payment_transactions (
          business_id, user_id, stripe_payment_intent_id,
          amount, currency, status, type, description
        ) VALUES (
          ${businessId},
          ${userId},
          ${session.payment_intent as string},
          ${(session.amount_total || 0) / 100},
          ${session.currency},
          'succeeded',
          'credits',
          ${`Purchased ${credits} lead credits`}
        )
      `;

      // Create notification
      await sql`
        INSERT INTO business_notifications (business_id, type, title, message)
        VALUES (
          ${businessId},
          'credits',
          'Credits Purchased',
          ${`Successfully added ${credits} lead credits to your account`}
        )
      `;
    }
  }
  // Handle featured listing purchases
  else if (metadata.type === 'featured' && metadata.duration) {
    const durationDays = parseInt(metadata.duration);
    
    if (businessId) {
      // Calculate featured_until date
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + durationDays);
      
      // Update business to be featured
      await sql`
        UPDATE businesses
        SET
          is_featured = true,
          featured_until = ${featuredUntil.toISOString()},
          updated_at = NOW()
        WHERE id = ${businessId}
      `;

      // Record transaction
      await sql`
        INSERT INTO payment_transactions (
          business_id, user_id, stripe_payment_intent_id,
          amount, currency, status, type, description
        ) VALUES (
          ${businessId},
          ${userId},
          ${session.payment_intent as string},
          ${(session.amount_total || 0) / 100},
          ${session.currency},
          'succeeded',
          'featured',
          ${`Featured listing for ${durationDays} days`}
        )
      `;

      // Create notification
      await sql`
        INSERT INTO business_notifications (business_id, type, title, message)
        VALUES (
          ${businessId},
          'featured',
          'Featured Listing Activated',
          ${`Your listing is now featured for ${durationDays} days!`}
        )
      `;
    }
  }
  // Handle regular subscription
  else if (session.subscription) {
    const subscriptionId = session.subscription as string;
    
    // Update stripe_customers table
    if (businessId) {
      await sql`
        UPDATE stripe_customers
        SET
          stripe_subscription_id = ${subscriptionId},
          subscription_status = 'active',
          updated_at = NOW()
        WHERE stripe_customer_id = ${customerId}
      `;

      // Update business subscription
      await sql`
        UPDATE business_subscriptions
        SET
          status = 'active',
          updated_at = NOW()
        WHERE business_id = ${businessId}
      `;

      // Create notification
      await sql`
        INSERT INTO business_notifications (business_id, type, title, message)
        VALUES (
          ${businessId},
          'subscription',
          'Subscription Activated',
          'Your subscription has been activated successfully!'
        )
      `;
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;

  // Update subscription status
  await sql`
    UPDATE stripe_customers
    SET
      subscription_status = ${status},
      subscription_end_date = ${(subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null},
      updated_at = NOW()
    WHERE stripe_customer_id = ${customerId}
  `;

  // Get business_id
  const customer = await sql`
    SELECT business_id FROM stripe_customers
    WHERE stripe_customer_id = ${customerId}
  `;

  if (customer[0]?.business_id) {
    // Update business subscription status
    await sql`
      UPDATE business_subscriptions
      SET
        status = ${status === 'active' ? 'active' : 'paused'},
        updated_at = NOW()
      WHERE business_id = ${customer[0].business_id}
    `;
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Update subscription status
  await sql`
    UPDATE stripe_customers
    SET
      subscription_status = 'canceled',
      subscription_end_date = ${new Date(subscription.canceled_at! * 1000).toISOString()},
      updated_at = NOW()
    WHERE stripe_customer_id = ${customerId}
  `;

  // Get business_id
  const customer = await sql`
    SELECT business_id FROM stripe_customers
    WHERE stripe_customer_id = ${customerId}
  `;

  if (customer[0]?.business_id) {
    // Downgrade to free plan
    await sql`
      UPDATE business_subscriptions
      SET
        plan = 'free',
        status = 'active',
        lead_credits = 10,
        monthly_price = 0,
        featured_listing = false,
        priority_support = false,
        analytics_access = false,
        custom_branding = false,
        unlimited_photos = false,
        updated_at = NOW()
      WHERE business_id = ${customer[0].business_id}
    `;

    // Create notification
    await sql`
      INSERT INTO business_notifications (business_id, type, title, message)
      VALUES (
        ${customer[0].business_id},
        'subscription',
        'Subscription Canceled',
        'Your subscription has been canceled. You have been downgraded to the free plan.'
      )
    `;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const amount = invoice.amount_paid / 100; // Convert from cents

  // Record transaction
  const customer = await sql`
    SELECT business_id, user_id FROM stripe_customers
    WHERE stripe_customer_id = ${customerId}
  `;

  if (customer[0]) {
    await sql`
      INSERT INTO payment_transactions (
        business_id, user_id, stripe_payment_intent_id,
        amount, currency, status, type, description
      ) VALUES (
        ${customer[0].business_id},
        ${customer[0].user_id},
        ${(invoice as any).payment_intent as string},
        ${amount},
        ${invoice.currency},
        'succeeded',
        'subscription',
        'Monthly subscription payment'
      )
    `;

    // Reset monthly lead credits
    const plans = await sql`
      SELECT sp.lead_credits
      FROM business_subscriptions bs
      JOIN subscription_plans sp ON bs.plan = sp.name
      WHERE bs.business_id = ${customer[0].business_id}
    `;

    if (plans[0]) {
      await sql`
        UPDATE business_subscriptions
        SET
          lead_credits = ${plans[0].lead_credits},
          leads_received = 0,
          updated_at = NOW()
        WHERE business_id = ${customer[0].business_id}
      `;
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Get business_id
  const customer = await sql`
    SELECT business_id FROM stripe_customers
    WHERE stripe_customer_id = ${customerId}
  `;

  if (customer[0]?.business_id) {
    // Update subscription status
    await sql`
      UPDATE business_subscriptions
      SET
        status = 'past_due',
        updated_at = NOW()
      WHERE business_id = ${customer[0].business_id}
    `;

    // Create notification
    await sql`
      INSERT INTO business_notifications (business_id, type, title, message)
      VALUES (
        ${customer[0].business_id},
        'subscription',
        'Payment Failed',
        'Your payment failed. Please update your payment method to continue receiving leads.'
      )
    `;
  }
}
