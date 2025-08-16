# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for your service marketplace platform.

## Prerequisites

- A Stripe account (sign up at [stripe.com](https://stripe.com))
- Admin access to your marketplace platform
- Your deployed application URL

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. You'll see two sets of keys:
   - **Test mode** (for development)
   - **Live mode** (for production)

4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

⚠️ **Important**: Never share your secret key or commit it to version control!

## Step 2: Configure Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
   For local testing:
   ```
   https://your-ngrok-url.ngrok.io/api/stripe/webhook
   ```

4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 3: Configure Stripe in Admin Panel

1. Log in to your marketplace admin panel as brian@spotcircuit.com
2. Navigate to **Admin** → **Stripe Configuration**
3. Enter your configuration:

   ### For Testing:
   - **Environment Mode**: Test Mode
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`
   - **Webhook Secret**: `whsec_...`
   - **Trial Period**: 14 days (or your preference)
   - **Enable Stripe**: ✅
   - **Auto-charge for leads**: ✅ (recommended)

   ### For Production:
   - **Environment Mode**: Live Mode
   - **Publishable Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...`
   - **Webhook Secret**: `whsec_...`

4. Click **Save Configuration**

## Step 4: Set Up Subscription Plans

1. In the admin panel, scroll to **Subscription Plans**
2. Review the default plans:
   - **Free**: $0/month, 10 leads
   - **Starter**: $49/month, 50 leads
   - **Professional**: $99/month, 200 leads
   - **Enterprise**: $299/month, Unlimited leads

3. Customize plans as needed:
   - Click **Edit** to modify existing plans
   - Click **Add Plan** to create new ones

4. For each plan, click **Sync with Stripe** to create the products in Stripe

## Step 5: Test the Integration

### Test Mode Testing:

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`

2. Test the flow:
   - Create a business owner account
   - Claim a business listing
   - Go to Dealer Portal → Subscription
   - Click "Upgrade" on a paid plan
   - Complete checkout with test card
   - Verify subscription is active

### Testing Webhooks Locally:

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI will show your webhook signing secret - update it in admin panel

## Step 6: Environment Variables

Add these to your production environment (Netlify/Vercel):

```env
# Optional - for better error tracking
STRIPE_WEBHOOK_ENDPOINT_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 7: Go Live Checklist

Before enabling live mode:

- [ ] Test all subscription flows in test mode
- [ ] Verify webhook events are being received
- [ ] Set up proper error handling and logging
- [ ] Configure email notifications for successful payments
- [ ] Set up customer support process for payment issues
- [ ] Review and comply with Stripe's requirements
- [ ] Enable two-factor authentication on Stripe account
- [ ] Set up payment failure recovery emails

## Subscription Management Features

### For Business Owners:
- View current subscription status
- Upgrade/downgrade plans
- View remaining lead credits
- Access billing history
- Cancel subscription

### For Administrators:
- View all active subscriptions
- Manually adjust lead credits
- Create custom plans
- Monitor payment failures
- Generate revenue reports

## Troubleshooting

### Common Issues:

1. **"Payment system is not configured"**
   - Ensure Stripe is enabled in admin panel
   - Verify API keys are correct
   - Check that plans are synced with Stripe

2. **Webhook failures**
   - Verify webhook endpoint URL is correct
   - Check webhook signing secret
   - Ensure your server can receive POST requests

3. **Subscription not activating**
   - Check webhook logs in Stripe Dashboard
   - Verify `checkout.session.completed` event is handled
   - Check database for subscription status

### Debug Mode:

Enable debug logging by checking Stripe Dashboard:
- **Developers** → **Logs** - View all API requests
- **Developers** → **Events** - View webhook events
- **Payments** - View transaction history

## Revenue Models

### Lead-Based Pricing:
- Charge per lead received
- Monthly subscription for lead credits
- Pay-as-you-go for additional leads

### Feature-Based Pricing:
- Basic listing free
- Premium features (analytics, branding)
- Priority placement in search

### Commission-Based:
- Take percentage of completed jobs
- Requires integration with job completion tracking

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** to prevent fraud
3. **Use HTTPS** for all payment pages
4. **Implement rate limiting** on payment endpoints
5. **Log all payment events** for audit trail
6. **Set up alerts** for unusual payment patterns

## Support

- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Platform Support: support@yourdomain.com

## Next Steps

1. Set up email notifications for payment events
2. Create customer portal for managing subscriptions
3. Implement usage-based billing for lead overages
4. Add promotional codes and discounts
5. Set up automated dunning for failed payments
