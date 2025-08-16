'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  ArrowLeft,
  Check,
  X,
  CreditCard,
  Zap,
  TrendingUp,
  Users,
  Star,
  Loader2
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  lead_credits: number;
  features: string[];
  stripe_price_id?: string;
  is_active: boolean;
}

interface CurrentSubscription {
  plan: string;
  status: string;
  lead_credits: number;
  leads_received: number;
  next_billing_date?: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState('');

  useEffect(() => {
    checkAuth();
    fetchPlans();
    fetchCurrentSubscription();
    fetchStripeConfig();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();

      if (data.user.role !== 'business_owner' && data.user.role !== 'admin') {
        router.push('/dashboard');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/dealer-portal/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/dealer-portal/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeConfig = async () => {
    try {
      const response = await fetch('/api/dealer-portal/subscription/stripe-config');
      if (response.ok) {
        const data = await response.json();
        setStripePublishableKey(data.publishableKey);
      }
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!plan.stripe_price_id) {
      alert('This plan is not available for purchase yet. Please contact support.');
      return;
    }

    setUpgrading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          planName: plan.name
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to start checkout');
        setUpgrading(false);
        return;
      }

      const data = await response.json();
      
      // Check if we got a direct URL (newer approach) or sessionId (legacy)
      if (data.url) {
        // Direct redirect to Stripe Checkout URL
        window.location.href = data.url;
      } else if (data.sessionId && stripePublishableKey) {
        // Legacy approach using sessionId
        const stripe = await loadStripe(stripePublishableKey);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
          if (error) {
            alert('Failed to redirect to checkout: ' + error.message);
          }
        } else {
          alert('Failed to load payment system. Please try again.');
        }
      } else {
        alert('Payment system is not configured. Please contact support.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the free plan at the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/dealer-portal/subscription/cancel', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Your subscription has been canceled. You will retain access until the end of your billing period.');
        await fetchCurrentSubscription();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const defaultFeatures = [
      `${plan.lead_credits === -1 ? 'Unlimited' : plan.lead_credits} leads per month`,
      plan.price === 0 ? 'Basic listing' : 'Featured listing',
      plan.price > 0 ? 'Priority support' : 'Community support',
      plan.price >= 99 ? 'Advanced analytics' : plan.price > 0 ? 'Basic analytics' : 'No analytics',
      plan.price >= 99 ? 'Custom branding' : 'Standard branding'
    ];

    return plan.features.length > 0 ? plan.features : defaultFeatures;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/dealer-portal"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-sm text-gray-600">Choose the best plan for your business</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold capitalize">{currentSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold capitalize ${
                  currentSubscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {currentSubscription.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads This Month</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.leads_received} / {
                    currentSubscription.lead_credits === -1
                      ? 'Unlimited'
                      : currentSubscription.lead_credits
                  }
                </p>
              </div>
              {currentSubscription.next_billing_date && (
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="text-lg font-semibold">
                    {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {currentSubscription.plan !== 'free' && (
              <button
                onClick={handleCancel}
                className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.plan.toLowerCase() === plan.name.toLowerCase();
            const isDowngrade = currentSubscription &&
              plans.findIndex(p => p.name.toLowerCase() === currentSubscription.plan.toLowerCase()) >
              plans.findIndex(p => p.name === plan.name);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  isCurrent ? 'ring-2 ring-orange-600' : ''
                }`}
              >
                {isCurrent && (
                  <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium">
                    Current Plan
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {getPlanFeatures(plan).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading || !!isDowngrade}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                        isDowngrade
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {upgrading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : isDowngrade ? (
                        'Downgrade'
                      ) : (
                        'Upgrade'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Upgrade?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">More Leads</h3>
              <p className="text-sm text-gray-600">Get access to more customer inquiries</p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Priority Placement</h3>
              <p className="text-sm text-gray-600">Appear at the top of search results</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Track your performance and ROI</p>
            </div>
            <div className="text-center">
              <Star className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Premium Support</h3>
              <p className="text-sm text-gray-600">Get help when you need it most</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
