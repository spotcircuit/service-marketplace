import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';
import { getStripe } from '@/lib/stripe';

// POST: Update plan price (creates new Stripe price, archives old one)
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

    const body = await request.json();
    const { newPrice, updateExistingSubscriptions = false } = body;

    if (!newPrice || newPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    // Get current plan
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
    const stripe = await getStripe();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    let newPriceId = null;
    let archivedOldPrice = false;

    // If plan has Stripe product, create new price
    if (plan.stripe_product_id) {
      try {
        // Create new price for existing product
        const newStripePrice = await stripe.prices.create({
          product: plan.stripe_product_id,
          unit_amount: Math.round(newPrice * 100), // Convert to cents
          currency: plan.currency.toLowerCase() || 'usd',
          recurring: {
            interval: plan.interval || 'month'
          },
          metadata: {
            plan_name: plan.name,
            updated_from: plan.stripe_price_id || 'initial'
          }
        });

        newPriceId = newStripePrice.id;

        // Archive old price if exists
        if (plan.stripe_price_id) {
          try {
            await stripe.prices.update(plan.stripe_price_id, {
              active: false
            });
            archivedOldPrice = true;
          } catch (archiveError) {
            console.error('Error archiving old price:', archiveError);
          }
        }

        // If requested, update existing subscriptions to new price
        if (updateExistingSubscriptions && plan.stripe_price_id) {
          try {
            // Get all active subscriptions with old price
            const subscriptions = await stripe.subscriptions.list({
              price: plan.stripe_price_id,
              status: 'active',
              limit: 100
            });

            let updatedCount = 0;

            for (const subscription of subscriptions.data) {
              try {
                // Find the subscription item with the old price
                const itemToUpdate = subscription.items.data.find(
                  item => item.price.id === plan.stripe_price_id
                );

                if (itemToUpdate) {
                  // Update subscription to use new price
                  await stripe.subscriptions.update(subscription.id, {
                    items: [{
                      id: itemToUpdate.id,
                      price: newPriceId,
                    }],
                    proration_behavior: 'always_invoice', // Or 'none' to avoid prorations
                  });
                  updatedCount++;
                }
              } catch (subError) {
                console.error(`Error updating subscription ${subscription.id}:`, subError);
              }
            }

            console.log(`Updated ${updatedCount} subscriptions to new price`);
          } catch (subListError) {
            console.error('Error listing subscriptions:', subListError);
          }
        }
      } catch (stripeError: any) {
        return NextResponse.json(
          { error: `Stripe error: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // Update plan in database
    await sql`
      UPDATE subscription_plans
      SET
        price = ${newPrice},
        stripe_price_id = ${newPriceId || plan.stripe_price_id},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // Store price history
    await sql`
      INSERT INTO plan_price_history (
        plan_id,
        old_price,
        new_price,
        old_stripe_price_id,
        new_stripe_price_id,
        changed_by,
        change_reason
      ) VALUES (
        ${id},
        ${plan.price},
        ${newPrice},
        ${plan.stripe_price_id},
        ${newPriceId},
        ${user!.id},
        ${body.reason || 'Price update'}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Price updated successfully',
      oldPrice: plan.price,
      newPrice: newPrice,
      oldPriceId: plan.stripe_price_id,
      newPriceId: newPriceId,
      archivedOldPrice: archivedOldPrice,
      updateExistingSubscriptions: updateExistingSubscriptions
    });

  } catch (error) {
    console.error('Error updating plan price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}
