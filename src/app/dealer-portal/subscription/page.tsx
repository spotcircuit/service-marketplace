'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Check,
  X,
  Coins,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface SubscriptionData {
  subscription_tier: string;
  status: string;
  lead_credits: number;
  monthly_credit_allowance: number;
  credits_used_this_period: number;
  next_credit_refresh: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [buyingCredits, setBuyingCredits] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/dealer-portal/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription', // Proper subscription mode
          priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID || null,
          // Fallback to dynamic pricing if no price ID is set
          lineItems: !process.env.NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID ? [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Lead Credits Subscription',
                description: '10 credits every month - Auto-renews monthly'
              },
              unit_amount: 9900, // $99/month
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }] : undefined,
          metadata: {
            type: 'monthly_subscription',
            credits_per_month: '10',
            plan_name: 'monthly'
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to start subscription');
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleBuyCredits = async (credits: number, price: number) => {
    setBuyingCredits(true);
    try {
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          lineItems: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} Lead Credits`,
                description: `${credits} credits to view customer contact information`
              },
              unit_amount: price * 100
            },
            quantity: 1
          }],
          metadata: {
            type: 'credits',
            credits: credits.toString()
          }
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process payment');
    } finally {
      setBuyingCredits(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will keep your credits until the end of the billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/dealer-portal/subscription/cancel', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Subscription cancelled. You will keep your credits until the end of the billing period.');
        fetchSubscription();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSubscribed = subscription?.subscription_tier === 'monthly' && subscription?.status === 'active';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Subscription & Credits</h1>
        <p className="text-gray-600">Manage your subscription and lead credits</p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Current Status</h2>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{subscription?.lead_credits || 0}</span>
            <span className="text-gray-600">credits available</span>
          </div>
        </div>

        {isSubscribed ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Monthly Subscription Active
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  10 credits added automatically each month
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$99/mo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Next renewal</p>
                <p className="font-medium">
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Credits this period</p>
                <p className="font-medium">
                  {subscription.credits_used_this_period || 0} / {subscription.monthly_credit_allowance} used
                </p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    Subscription will end on {new Date(subscription.current_period_end!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push('/dealer-portal/subscription/manage')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Manage Billing
              </button>
              {!subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to get 10 credits every month at 50% off the regular price
            </p>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              {subscribing ? 'Processing...' : 'Start Monthly Subscription - $99/mo'}
            </button>
          </div>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Options</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Subscription */}
          <div className={`border-2 rounded-lg p-6 ${isSubscribed ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Subscription</h3>
              {isSubscribed && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-bold">
                $99<span className="text-sm font-normal text-gray-600">/month</span>
              </p>
              <p className="text-sm text-gray-600">Save 50% on lead credits</p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                10 credits every month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Automatic renewal
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                $9.90 per lead (50% off)
              </li>
            </ul>

            {!isSubscribed && (
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
              >
                {subscribing ? 'Processing...' : 'Subscribe Now'}
              </button>
            )}
          </div>

          {/* Pay As You Go */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Pay As You Go</h3>
            
            <div className="mb-4">
              <p className="text-3xl font-bold">
                $20<span className="text-sm font-normal text-gray-600">/credit</span>
              </p>
              <p className="text-sm text-gray-600">Buy credits as needed</p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                No commitment
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Credits never expire
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Buy in bulk for discounts
              </li>
              <li className="flex items-center gap-2 text-sm">
                <X className="h-4 w-4 text-red-500" />
                Higher per-lead cost
              </li>
            </ul>

            <div className="space-y-2">
              <button
                onClick={() => handleBuyCredits(10, 200)}
                disabled={buyingCredits}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Buy 10 Credits - $200
              </button>
              <button
                onClick={() => handleBuyCredits(25, 450)}
                disabled={buyingCredits}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Buy 25 Credits - $450 (Save $50)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Credit Usage</h2>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Usage history will appear here</p>
        </div>
      </div>
    </div>
  );
}