import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check Stripe configuration
  const config = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    secretKeyFormat: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 
                     process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'invalid',
    webhookSecretFormat: process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') ? 'valid' : 'invalid'
  };

  const instructions = {
    step1: "Go to https://dashboard.stripe.com/apikeys",
    step2: "Copy your test Secret key (starts with sk_test_)",
    step3: "Copy your test Publishable key (starts with pk_test_)",
    step4: "Add them to your .env.local file",
    step5: "Go to https://dashboard.stripe.com/webhooks",
    step6: "Click 'Add endpoint'",
    step7: "For endpoint URL, enter: " + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + "/api/stripe/webhook",
    step8: "Select events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed",
    step9: "After creating, copy the 'Signing secret' (starts with whsec_)",
    step10: "Add it to .env.local as STRIPE_WEBHOOK_SECRET",
    forLocalTesting: {
      note: "For local testing, use Stripe CLI",
      install: "stripe login",
      forward: "stripe listen --forward-to localhost:3000/api/stripe/webhook",
      copySecret: "Copy the webhook signing secret shown and add to .env.local"
    }
  };

  return NextResponse.json({
    configuration: config,
    setupInstructions: instructions,
    currentValues: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing', 
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'
    }
  });
}

// Test webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate a test credit purchase
    const testEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          customer: 'cus_test_' + Date.now(),
          payment_intent: 'pi_test_' + Date.now(),
          amount_total: 20000, // $200 in cents
          currency: 'usd',
          metadata: {
            type: 'credits',
            credits: '10',
            business_id: body.business_id || 'test_business_id',
            user_id: body.user_id || 'test_user_id'
          }
        }
      }
    };

    return NextResponse.json({
      message: 'Test webhook data',
      testEvent,
      note: 'Use this structure when testing. The real webhook will be signed by Stripe.'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request',
      details: error
    }, { status: 400 });
  }
}