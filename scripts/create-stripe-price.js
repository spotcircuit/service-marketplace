// Script to create a Stripe Price for monthly subscription
// Run this once to set up the recurring price in Stripe

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

async function createMonthlyPrice() {
  try {
    // First, create a product for the monthly subscription
    const product = await stripe.products.create({
      name: 'Monthly Lead Credits Subscription',
      description: '10 lead credits every month with automatic renewal',
      metadata: {
        type: 'monthly_subscription',
        credits_per_month: '10'
      }
    });
    
    console.log('✅ Created product:', product.id);
    
    // Create a recurring price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: {
        type: 'monthly_subscription',
        credits_per_month: '10'
      }
    });
    
    console.log('✅ Created recurring price:', price.id);
    console.log('\n📝 Add this to your .env.local file:');
    console.log(`STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID=${price.id}`);
    console.log('\nThis price ID will be used for monthly subscriptions.');
    
    return price.id;
    
  } catch (error) {
    console.error('❌ Error creating Stripe price:', error.message);
    process.exit(1);
  }
}

createMonthlyPrice();