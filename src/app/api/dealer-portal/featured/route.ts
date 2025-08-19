import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { getCurrentUser } from '@/lib/auth';

// GET: Check featured listing status and trial eligibility
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.business_id) {
      return NextResponse.json(
        { error: 'Not authenticated or no business' },
        { status: 401 }
      );
    }

    // Check current featured status
    const featured = await sql`
      SELECT 
        id,
        expires_at,
        is_trial,
        auto_renew,
        created_at
      FROM featured_listings
      WHERE business_id = ${user.business_id}
      AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    // Check if trial has been used
    const trialUsed = await sql`
      SELECT COUNT(*) as count
      FROM featured_listings
      WHERE business_id = ${user.business_id}
      AND is_trial = true
    `;

    return NextResponse.json({
      isCurrentlyFeatured: featured.length > 0,
      featuredListing: featured[0] || null,
      trialEligible: trialUsed[0].count === 0,
      trialUsed: trialUsed[0].count > 0
    });

  } catch (error) {
    console.error('Error checking featured status:', error);
    return NextResponse.json(
      { error: 'Failed to check featured status' },
      { status: 500 }
    );
  }
}

// POST: Activate free trial
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.business_id) {
      return NextResponse.json(
        { error: 'Not authenticated or no business' },
        { status: 401 }
      );
    }

    // Check if already featured
    const existing = await sql`
      SELECT id
      FROM featured_listings
      WHERE business_id = ${user.business_id}
      AND expires_at > NOW()
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Already have an active featured listing' },
        { status: 400 }
      );
    }

    // Check if trial has been used
    const trialUsed = await sql`
      SELECT COUNT(*) as count
      FROM featured_listings
      WHERE business_id = ${user.business_id}
      AND is_trial = true
    `;

    if (trialUsed[0].count > 0) {
      return NextResponse.json(
        { error: 'Free trial has already been used' },
        { status: 400 }
      );
    }

    // Activate 30-day free trial
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await sql`
      INSERT INTO featured_listings (
        business_id,
        expires_at,
        is_trial,
        trial_used,
        auto_renew,
        created_at,
        updated_at
      ) VALUES (
        ${user.business_id},
        ${expiresAt.toISOString()},
        true,
        true,
        false,
        NOW(),
        NOW()
      ) RETURNING *
    `;

    return NextResponse.json({
      success: true,
      featuredListing: result[0],
      message: 'Free trial activated! Your listing will be featured for 30 days.'
    });

  } catch (error) {
    console.error('Error activating trial:', error);
    return NextResponse.json(
      { error: 'Failed to activate trial' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel featured listing
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.business_id) {
      return NextResponse.json(
        { error: 'Not authenticated or no business' },
        { status: 401 }
      );
    }

    // Find active featured listing
    const featured = await sql`
      SELECT id, is_trial, stripe_subscription_id
      FROM featured_listings
      WHERE business_id = ${user.business_id}
      AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    if (featured.length === 0) {
      return NextResponse.json(
        { error: 'No active featured listing found' },
        { status: 404 }
      );
    }

    const listing = featured[0];

    // If it's a paid subscription, cancel with Stripe
    if (listing.stripe_subscription_id) {
      try {
        // Import Stripe
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-07-30.basil'
        });
        
        // Cancel the subscription immediately
        await stripe.subscriptions.cancel(listing.stripe_subscription_id);
        console.log(`Cancelled Stripe subscription: ${listing.stripe_subscription_id}`);
      } catch (stripeError: any) {
        console.error('Failed to cancel Stripe subscription:', stripeError);
        // Continue with database update even if Stripe fails
      }
    }

    // Update the listing to expire immediately
    await sql`
      UPDATE featured_listings
      SET 
        expires_at = NOW(),
        auto_renew = false,
        stripe_subscription_id = NULL,
        updated_at = NOW()
      WHERE id = ${listing.id}
    `;

    return NextResponse.json({
      success: true,
      message: listing.is_trial 
        ? 'Free trial cancelled successfully' 
        : 'Featured listing cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling featured listing:', error);
    return NextResponse.json(
      { error: 'Failed to cancel featured listing' },
      { status: 500 }
    );
  }
}