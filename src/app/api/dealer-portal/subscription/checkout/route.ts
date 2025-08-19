import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrGetStripeCustomer, createCheckoutSession, getStripe } from '@/lib/stripe';
import { sql } from '@/lib/neon';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.error('No authenticated user found');
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    if (user.role !== 'business_owner' && user.role !== 'admin') {
      console.error('User role not authorized:', user.role);
      return NextResponse.json(
        { error: 'Only business owners can purchase credits' },
        { status: 403 }
      );
    }

    // If no business_id, create a placeholder business for the user
    let businessId = user.business_id;

    if (!businessId) {
      // Create a basic business entry for this user
      const result = await sql`
        INSERT INTO businesses (
          name,
          category,
          description,
          phone,
          email,
          address,
          city,
          state,
          zipcode,
          is_claimed,
          is_verified,
          owner_name,
          owner_email,
          owner_phone
        ) VALUES (
          ${user.company_name || user.name + "'s Business"},
          'General Service',
          'Business profile pending completion',
          '(000) 000-0000',
          ${user.email},
          'Address pending',
          'City',
          'State',
          '00000',
          true,
          false,
          ${user.name || 'Business Owner'},
          ${user.email},
          ${user.phone || '(000) 000-0000'}
        ) RETURNING id
      `;

      businessId = result[0].id;

      // Update user with business_id
      await sql`
        UPDATE users
        SET business_id = ${businessId}
        WHERE id = ${user.id}
      `;
    }

    const body = await request.json();
    const { priceId, planName, mode, lineItems, metadata } = body;

    // Handle subscription mode with dynamic pricing (when no price ID)
    if (mode === 'subscription' && !priceId && lineItems && lineItems.length > 0) {
      // Create Stripe subscription with dynamic pricing
      const stripeCustomerId = await createOrGetStripeCustomer(
        businessId!,
        user.id,
        user.email,
        user.name || user.email
      );

      if (!stripeCustomerId) {
        return NextResponse.json(
          { error: 'Failed to create customer. Please check Stripe configuration.' },
          { status: 500 }
        );
      }

      const stripe = await getStripe();
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured' },
          { status: 500 }
        );
      }

      try {
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        
        const subParams: Stripe.Checkout.SessionCreateParams = {
          customer: stripeCustomerId as string,
          payment_method_types: ['card'],
          line_items: lineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
          mode: 'subscription',
          success_url: `${baseUrl}/dealer-portal/dashboard?payment=success&type=subscription`,
          cancel_url: `${baseUrl}/dealer-portal/dashboard?payment=cancelled`,
          metadata: {
            ...metadata,
            business_id: String(businessId),
            user_id: String(user.id),
          },
          subscription_data: {
            metadata: {
              business_id: String(businessId),
              user_id: String(user.id),
              type: 'monthly_subscription',
            },
          },
        };
        const session = await stripe.checkout.sessions.create(subParams);

        console.log('Subscription checkout session created:', session.id);

        return NextResponse.json({
          sessionId: session.id,
          url: session.url
        });
      } catch (stripeError: any) {
        console.error('Stripe subscription error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create subscription: ' + (stripeError.message || 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Handle custom line items for one-time payments (credits, featured listings)
    if (mode === 'payment' && lineItems && lineItems.length > 0) {
      // This is a one-time payment, not a subscription
      const stripeCustomerId = await createOrGetStripeCustomer(
        businessId!,
        user.id,
        user.email,
        user.name || user.email
      );

      if (!stripeCustomerId) {
        return NextResponse.json(
          { error: 'Failed to create customer. Please check Stripe configuration.' },
          { status: 500 }
        );
      }

      // Get shared Stripe instance
      const stripe = await getStripe();
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured' },
          { status: 500 }
        );
      }
      
      try {
        // Create checkout session for one-time payment
        // Determine the base URL dynamically
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        
        const payParams: Stripe.Checkout.SessionCreateParams = {
          customer: stripeCustomerId as string,
          payment_method_types: ['card'],
          line_items: lineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
          mode: 'payment',
          success_url: `${baseUrl}/dealer-portal/dashboard?payment=success&type=${metadata?.type || 'purchase'}`,
          cancel_url: `${baseUrl}/dealer-portal/dashboard?payment=cancelled`,
          metadata: {
            ...metadata,
            business_id: String(businessId),
            user_id: String(user.id),
          },
        };
        const session = await stripe.checkout.sessions.create(payParams);

        console.log('Checkout session created:', session.id);

        return NextResponse.json({
          sessionId: session.id,
          url: session.url
        });
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create payment session: ' + (stripeError.message || 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Handle regular subscription flow
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required for subscription' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const stripeCustomerId = await createOrGetStripeCustomer(
      businessId!,
      user.id,
      user.email,
      user.name || user.email
    );

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Failed to create customer. Please check Stripe configuration.' },
        { status: 500 }
      );
    }

    // Create checkout session with dynamic URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const successUrl = `${baseUrl}/dealer-portal/dashboard?success=true`;
    const cancelUrl = `${baseUrl}/dealer-portal/dashboard`;

    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        business_id: businessId!,
        user_id: user.id,
        plan_name: planName
      }
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Create or update subscription plan (will be activated on successful payment)
    await sql`
      INSERT INTO business_subscriptions (business_id, user_id, plan, status, lead_credits)
      VALUES (${businessId}, ${user.id}, ${planName}, 'pending', 0)
      ON CONFLICT (business_id)
      DO UPDATE SET
        plan = ${planName},
        status = 'pending',
        updated_at = NOW()
    `;

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Checkout error details:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          type: error.type,
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY
        } : undefined
      },
      { status: 500 }
    );
  }
}
