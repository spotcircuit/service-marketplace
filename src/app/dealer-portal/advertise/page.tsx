'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Star,
  TrendingUp,
  MapPin,
  Check,
  X,
  Zap,
  Award,
  BarChart3,
  Users,
  Eye,
  Target,
  Crown,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface AdvertisingPackage {
  name: string;
  price: number;
  duration: string;
  features: string[];
  icon: any;
  color: string;
  popular?: boolean;
  savings?: string;
}

const advertisingPackages: AdvertisingPackage[] = [
  {
    name: 'Featured Listing',
    price: 99,
    duration: 'per month',
    icon: Star,
    color: 'yellow',
    features: [
      'Featured badge on listing',
      '2x visibility in search results',
      'Priority placement in category',
      'Highlighted in email newsletters',
      'Basic performance analytics',
      '50 guaranteed impressions/day'
    ]
  },
  {
    name: 'City Dominator',
    price: 299,
    duration: 'per month',
    icon: MapPin,
    color: 'blue',
    popular: true,
    savings: 'Save $50/month',
    features: [
      'Everything in Featured Listing',
      'Top 3 placement in your city',
      'Exclusive city page banner',
      'No competitor ads on your listing',
      'Advanced analytics dashboard',
      '200 guaranteed impressions/day',
      'Priority lead delivery',
      'Custom business showcase'
    ]
  },
  {
    name: 'Regional Champion',
    price: 599,
    duration: 'per month',
    icon: Crown,
    color: 'purple',
    savings: 'Save $200/month',
    features: [
      'Everything in City Dominator',
      'Top placement in 5 cities',
      'State directory premium position',
      'Homepage featured provider',
      'Competitor analysis reports',
      '500 guaranteed impressions/day',
      'Dedicated account manager',
      'Custom landing page',
      'Social media promotion'
    ]
  }
];

const addonServices = [
  {
    name: 'Boost Campaign',
    price: 49,
    description: 'Get 1000 extra targeted impressions',
    icon: Zap
  },
  {
    name: 'Review Spotlight',
    price: 29,
    description: 'Highlight your best reviews prominently',
    icon: Star
  },
  {
    name: 'Video Showcase',
    price: 79,
    description: 'Add video content to your listing',
    icon: Eye
  },
  {
    name: 'Emergency Priority',
    price: 99,
    description: 'Get emergency/urgent leads first',
    icon: Target
  }
];

export default function AdvertisePage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    let total = 0;
    
    if (selectedPackage !== null) {
      total += advertisingPackages[selectedPackage].price;
    }
    
    selectedAddons.forEach(index => {
      total += addonServices[index].price;
    });
    
    // Apply annual discount
    if (billingCycle === 'annual') {
      total = total * 10; // 2 months free
    }
    
    return total;
  };

  const handlePurchase = async () => {
    if (selectedPackage === null) return;
    
    setLoading(true);
    
    // Here you would integrate with Stripe
    // For now, we'll just show an alert
    setTimeout(() => {
      alert('Redirecting to checkout...');
      setLoading(false);
    }, 1000);
  };

  const toggleAddon = (index: number) => {
    setSelectedAddons(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
          <Megaphone className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Supercharge Your Business Growth
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get premium placement, exclusive territory rights, and guaranteed visibility in your service area
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold">5x</div>
            <div className="text-blue-100">More Visibility</div>
          </div>
          <div>
            <div className="text-3xl font-bold">73%</div>
            <div className="text-blue-100">Higher Conversion</div>
          </div>
          <div>
            <div className="text-3xl font-bold">250+</div>
            <div className="text-blue-100">Leads/Month Avg</div>
          </div>
          <div>
            <div className="text-3xl font-bold">ROI</div>
            <div className="text-blue-100">Guaranteed</div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600'
            }`}
          >
            Annual
            <span className="ml-2 text-xs text-green-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Packages */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {advertisingPackages.map((pkg, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all cursor-pointer ${
              selectedPackage === index
                ? 'ring-4 ring-blue-500 transform scale-105'
                : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedPackage(index)}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
            )}
            
            <div className="p-8">
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-${pkg.color}-100 rounded-lg mb-4`}>
                <pkg.icon className={`h-6 w-6 text-${pkg.color}-600`} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'annual' ? pkg.price * 10 : pkg.price}
                </span>
                <span className="text-gray-600 ml-2">
                  {billingCycle === 'annual' ? '/year' : pkg.duration}
                </span>
                {pkg.savings && billingCycle === 'annual' && (
                  <div className="text-green-600 text-sm mt-1">{pkg.savings}</div>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-3 rounded-lg font-medium transition ${
                  selectedPackage === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPackage === index ? 'Selected' : 'Select Package'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add-on Services */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Boost Your Results</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {addonServices.map((addon, index) => (
            <div
              key={index}
              onClick={() => toggleAddon(index)}
              className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition ${
                selectedAddons.includes(index)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <addon.icon className="h-5 w-5 text-gray-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">+${addon.price}</div>
                  <div className="text-xs text-gray-500">/month</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Territory Map Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Territory Coverage</h2>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Interactive map showing your coverage area will appear here
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Premium packages include exclusive territory rights
          </p>
        </div>
      </div>

      {/* Order Summary */}
      {selectedPackage !== null && (
        <div className="bg-white rounded-2xl shadow-lg p-8 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <p className="text-gray-600 mt-1">
                {advertisingPackages[selectedPackage].name}
                {selectedAddons.length > 0 && ` + ${selectedAddons.length} addon(s)`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${calculateTotal()}
                <span className="text-lg text-gray-600 ml-2">
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600">You save ${calculateTotal() * 0.17} annually</p>
              )}
            </div>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="ml-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Start Advertising'}
              <ArrowRight className="inline-block ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Advertising Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All advertising packages auto-renew unless cancelled</li>
              <li>• Territory exclusivity based on first-come, first-served basis</li>
              <li>• Performance guarantee: Get 2x visibility or money back</li>
              <li>• Cancel anytime with 30 days notice</li>
              <li>• Custom enterprise packages available for 10+ locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}