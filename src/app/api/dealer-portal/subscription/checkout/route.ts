import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrGetStripeCustomer, createCheckoutSession } from '@/lib/stripe';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const { priceId, planName } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
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

    // Create checkout session
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dealer-portal/subscription?success=true`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dealer-portal/subscription`;

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

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
