import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Please login first' },
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

    // Create a test checkout session directly
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Professional Plan - Test',
              description: '200 leads per month, priority placement, analytics',
            },
            unit_amount: 9900, // $99.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dealer-portal?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dealer-portal/subscription`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_name: 'Professional',
        test_checkout: 'true'
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      message: 'Checkout session created successfully!'
    });

  } catch (error: any) {
    console.error('Test Stripe checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message
      },
      { status: 500 }
    );
  }
}
