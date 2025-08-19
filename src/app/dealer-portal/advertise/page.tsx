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
  const [trialEligible, setTrialEligible] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBusinessProfile();
    checkFeaturedStatus();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch('/api/dealer-portal/business-profile');
      if (response.ok) {
        const data = await response.json();
        setBusiness(data.business);
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const checkFeaturedStatus = async () => {
    try {
      const response = await fetch('/api/dealer-portal/featured');
      if (response.ok) {
        const data = await response.json();
        setTrialEligible(data.trialEligible);
        setIsCurrentlyFeatured(data.isCurrentlyFeatured);
        
        if (data.featuredListing) {
          const expiryDate = new Date(data.featuredListing.expires_at);
          setFeaturedUntil(expiryDate.toLocaleDateString());
          setIsTrial(data.featuredListing.is_trial);
        }
      }
    } catch (error) {
      console.error('Error checking featured status:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Create checkout session (with or without trial)
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'payment',
          lineItems: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: trialEligible ? 'Featured Listing - 30 Day Free Trial' : 'Featured Listing - 30 Days',
                description: trialEligible 
                  ? 'FREE trial - Featured placement in your service area for 30 days'
                  : 'Featured placement in your service area for 30 days'
              },
              unit_amount: trialEligible ? 0 : 4900 // $0 for trial, $49 for regular
            },
            quantity: 1
          }],
          metadata: {
            type: 'featured_listing',
            business_id: business?.id,
            duration_days: '30',
            is_trial: trialEligible ? 'true' : 'false'
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
      console.error('Error:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your featured listing?')) {
      return;
    }

    setCancelLoading(true);
    
    try {
      const response = await fetch('/api/dealer-portal/featured', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Featured listing cancelled');
        await checkFeaturedStatus();
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('Failed to cancel. Please try again.');
    } finally {
      setCancelLoading(false);
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
        <h1 className="text-4xl font-bold mb-4">
          Get More Customers with Featured Listing
        </h1>
        <p className="text-xl opacity-70 max-w-2xl mx-auto">
          Be the first business customers see when searching in {business?.city || 'your area'}
        </p>
      </div>

      {/* Current Status */}
      {isCurrentlyFeatured && (
        <div className="bg-secondary rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-lg">
                <Check className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-foreground">
                  You're Currently Featured!
                  {isTrial && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Free Trial</span>}
                </h3>
                <p className="text-sm text-secondary-foreground/80">Your featured listing is active until {featuredUntil}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="text-secondary-foreground hover:text-secondary-foreground/80 underline text-sm disabled:opacity-50"
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Featured'}
            </button>
          </div>
        </div>
      )}

      {/* Main Featured Listing Card */}
      <div className="bg-primary/10 rounded-2xl shadow-lg overflow-hidden mb-8 border border-primary/20">
        <div className="bg-primary text-primary-foreground p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Listing</h2>
              <p className="text-primary-foreground/90">
                {trialEligible ? '30-day free trial · No credit card required' : '30-day periods · Cancel anytime'}
              </p>
            </div>
            <div className="text-right">
              {trialEligible ? (
                <>
                  <p className="text-4xl font-bold">FREE</p>
                  <p className="text-sm text-primary-foreground/90">for 30 days</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold">$49</p>
                  <p className="text-sm text-primary-foreground/90">per 30 days</p>
                </>
              )}
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
                  {trialEligible ? 'Start Free 30-Day Trial' : 'Get Featured for 30 Days'}
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
          <h3 className="font-semibold mb-2">{trialEligible ? 'Free Trial Available' : 'Flexible Terms'}</h3>
          <p className="text-sm text-gray-600">
            {trialEligible ? 'Try it free for 30 days. Cancel anytime!' : 'Month-to-month payments. Cancel anytime.'}
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
            <h3 className="font-medium mb-2">How much does it cost?</h3>
            <p className="text-sm text-gray-600">
              {trialEligible 
                ? "Your first 30 days are completely FREE! After that, it's $49 per 30-day period if you choose to continue."
                : "Featured listings are $49 per 30-day period. You can cancel anytime."}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes! You can cancel at any time. If you're on the free trial, you can cancel without any charges. For paid periods, you'll remain featured until the end of your current 30-day period.
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