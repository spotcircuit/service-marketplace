'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Star,
  Check,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface BusinessInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  service_radius_miles?: number;
  service_zipcodes?: string[];
  is_featured?: boolean;
  featured_until?: string;
}

export default function AdvertisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [isCurrentlyFeatured, setIsCurrentlyFeatured] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch('/api/dealer-portal/business-profile');
      if (response.ok) {
        const data = await response.json();
        setBusiness(data.business);
        
        // Check if currently featured
        if (data.business.is_featured && data.business.featured_until) {
          const expiryDate = new Date(data.business.featured_until);
          if (expiryDate > new Date()) {
            setIsCurrentlyFeatured(true);
            setFeaturedUntil(expiryDate.toLocaleDateString());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Create checkout session for featured listing subscription
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'subscription',
          lineItems: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Featured Listing',
                description: 'Monthly featured placement in your service area'
              },
              unit_amount: 9900, // $99/month
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }],
          metadata: {
            type: 'featured_listing',
            business_id: business?.id
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to start checkout');
        return;
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceAreaDescription = () => {
    if (!business) return 'your service area';
    
    if (business.service_zipcodes && business.service_zipcodes.length > 0) {
      return `${business.service_zipcodes.length} ZIP codes`;
    } else if (business.service_radius_miles) {
      return `${business.service_radius_miles} mile radius from ${business.city}`;
    } else {
      return `${business.city} area`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
          <Megaphone className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get More Customers with Featured Listing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Be the first business customers see when searching in {business?.city || 'your area'}
        </p>
      </div>

      {/* Current Status */}
      {isCurrentlyFeatured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">You're Currently Featured!</h3>
                <p className="text-sm text-green-700">Your featured listing is active until {featuredUntil}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dealer-portal/subscription')}
              className="text-green-700 hover:text-green-800 underline text-sm"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      {/* Main Featured Listing Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Listing</h2>
              <p className="text-white/90">Monthly subscription · Cancel anytime</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">$99</p>
              <p className="text-sm text-white/90">per month</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold mb-6">What You Get:</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Top placement in search results</p>
                <p className="text-sm text-gray-600">
                  Appear first when customers search in {getServiceAreaDescription()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Featured badge on your listing</p>
                <p className="text-sm text-gray-600">
                  Stand out with a prominent "Featured" badge
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Homepage visibility</p>
                <p className="text-sm text-gray-600">
                  Show in the featured providers section on the homepage
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Priority in "Near Me" searches</p>
                <p className="text-sm text-gray-600">
                  Get found first by customers searching nearby
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">No competitor ads on your page</p>
                <p className="text-sm text-gray-600">
                  Your business page shows only your information
                </p>
              </div>
            </div>
          </div>

          {!isCurrentlyFeatured && (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start 30-Day Free Trial
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Value Props */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-3">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-2">3x More Visibility</h3>
          <p className="text-sm text-gray-600">
            Featured businesses get 3 times more views than standard listings
          </p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-2">More Qualified Leads</h3>
          <p className="text-sm text-gray-600">
            Top placement means customers see you first when they're ready to buy
          </p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-2">Risk-Free Trial</h3>
          <p className="text-sm text-gray-600">
            Try it free for 30 days. Cancel anytime if you're not satisfied
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">How does featured listing work?</h3>
            <p className="text-sm text-gray-600">
              Your business appears at the top of search results in your service area. This is based on the service radius or ZIP codes you've configured in your profile.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes! There's no long-term contract. You can cancel your subscription at any time and you'll remain featured until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">How many businesses can be featured?</h3>
            <p className="text-sm text-gray-600">
              We limit featured listings to ensure value. Typically only 3-5 businesses are featured per service area, shown in order of rating and response time.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Do I need to set up my service area first?</h3>
            <p className="text-sm text-gray-600">
              Yes, make sure to configure your service area in your Business Profile settings. This determines where your featured listing will appear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}