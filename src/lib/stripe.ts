import Stripe from 'stripe';
import { sql } from '@/lib/neon';

let stripeInstance: Stripe | null = null;

// Get Stripe configuration from environment variables
export async function getStripeConfig() {
  try {
    // First try environment variables
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (secretKey && publishableKey) {
      return {
        publishableKey,
        secretKey,
        webhookSecret: webhookSecret || '',
        mode: secretKey.includes('sk_test') ? 'test' : 'live',
        enabled: true,
        trialDays: 14,
        autoCharge: false
      };
    }
    
    // Fallback to database config if env vars not set
    try {
      const config = await sql`
        SELECT key, value, is_encrypted
        FROM stripe_config
      `;

      const configMap: Record<string, string> = {};
      config.forEach((item: any) => {
        configMap[item.key] = item.value || '';
      });

      return {
        publishableKey: configMap.stripe_publishable_key || '',
        secretKey: configMap.stripe_secret_key || '',
        webhookSecret: configMap.stripe_webhook_secret || '',
        mode: configMap.stripe_mode || 'test',
        enabled: configMap.stripe_enabled === 'true',
        trialDays: parseInt(configMap.trial_days || '14'),
        autoCharge: configMap.auto_charge === 'true'
      };
    } catch (dbError) {
      console.log('Database config not available, Stripe disabled');
      return {
        publishableKey: '',
        secretKey: '',
        webhookSecret: '',
        mode: 'test',
        enabled: false,
        trialDays: 14,
        autoCharge: false
      };
    }
  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    return null;
  }
}

// Initialize Stripe instance
export async function getStripe(): Promise<Stripe | null> {
  if (stripeInstance) return stripeInstance;

  const config = await getStripeConfig();
  if (!config || !config.secretKey || !config.enabled) {
    console.log('Stripe not configured or disabled');
    return null;
  }

  try {
    stripeInstance = new Stripe(config.secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
    return stripeInstance;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return null;
  }
}

// Create or get Stripe customer
export async function createOrGetStripeCustomer(
  businessId: string,
  userId: string,
  email: string,
  name: string
): Promise<string | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    // Check if customer already exists
    const existing = await sql`
      SELECT stripe_customer_id
      FROM stripe_customers
      WHERE business_id = ${businessId}
    `;

    if (existing.length > 0 && existing[0].stripe_customer_id) {
      return existing[0].stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        business_id: businessId,
        user_id: userId
      }
    });

    // Save to database
    await sql`
      INSERT INTO stripe_customers (business_id, user_id, stripe_customer_id)
      VALUES (${businessId}, ${userId}, ${customer.id})
      ON CONFLICT (business_id)
      DO UPDATE SET stripe_customer_id = ${customer.id}
    `;

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return null;
  }
}

// Create subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
): Promise<Stripe.Subscription | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    };

    if (trialDays && trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return null;
  }
}

// Create payment intent for one-time payment
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId?: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata
    };

    if (customerId) {
      params.customer = customerId;
    }

    return await stripe.paymentIntents.create(params);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

// Create checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

// Create Stripe product and price for a plan
export async function createStripeProduct(
  plan: {
    name: string;
    description: string;
    price: number;
    interval: 'month' | 'year';
  }
): Promise<{ productId: string; priceId: string } | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  try {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100),
      currency: 'usd',
      recurring: {
        interval: plan.interval,
      },
    });

    return {
      productId: product.id,
      priceId: price.id
    };
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return null;
  }
}

// Verify webhook signature
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  const config = await getStripeConfig();
  if (!config || !config.webhookSecret) return null;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}
