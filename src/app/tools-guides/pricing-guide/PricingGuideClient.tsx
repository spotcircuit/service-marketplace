'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Info, Calculator, MapPin, Calendar, Weight } from 'lucide-react';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';

interface PricingData {
  size: string;
  dimensions: string;
  basePrice: { low: number; high: number; average: number };
  factors: {
    location: { urban: number; suburban: number; rural: number };
    duration: { week: number; twoWeeks: number; month: number };
    season: { peak: number; offPeak: number };
  };
  additionalFees: {
    name: string;
    range: string;
    description: string;
  }[];
}

const pricingData: PricingData[] = [
  {
    size: '10 Yard',
    dimensions: "12' × 8' × 3.5'",
    basePrice: { low: 250, high: 450, average: 350 },
    factors: {
      location: { urban: 1.3, suburban: 1.0, rural: 0.85 },
      duration: { week: 1.0, twoWeeks: 1.15, month: 1.4 },
      season: { peak: 1.2, offPeak: 0.9 }
    },
    additionalFees: [
      { name: 'Permit Fee', range: '$25-$100', description: 'Required for street placement' },
      { name: 'Overage Fee', range: '$65-$100/ton', description: 'Exceeding weight limit' },
      { name: 'Extended Rental', range: '$5-$15/day', description: 'Keeping beyond rental period' }
    ]
  },
  {
    size: '20 Yard',
    dimensions: "22' × 8' × 4.5'",
    basePrice: { low: 350, high: 600, average: 475 },
    factors: {
      location: { urban: 1.3, suburban: 1.0, rural: 0.85 },
      duration: { week: 1.0, twoWeeks: 1.15, month: 1.4 },
      season: { peak: 1.2, offPeak: 0.9 }
    },
    additionalFees: [
      { name: 'Permit Fee', range: '$25-$100', description: 'Required for street placement' },
      { name: 'Overage Fee', range: '$65-$100/ton', description: 'Exceeding weight limit' },
      { name: 'Extended Rental', range: '$5-$15/day', description: 'Keeping beyond rental period' }
    ]
  },
  {
    size: '30 Yard',
    dimensions: "22' × 8' × 6'",
    basePrice: { low: 450, high: 750, average: 600 },
    factors: {
      location: { urban: 1.3, suburban: 1.0, rural: 0.85 },
      duration: { week: 1.0, twoWeeks: 1.15, month: 1.4 },
      season: { peak: 1.2, offPeak: 0.9 }
    },
    additionalFees: [
      { name: 'Permit Fee', range: '$25-$100', description: 'Required for street placement' },
      { name: 'Overage Fee', range: '$65-$100/ton', description: 'Exceeding weight limit' },
      { name: 'Extended Rental', range: '$5-$15/day', description: 'Keeping beyond rental period' }
    ]
  },
  {
    size: '40 Yard',
    dimensions: "22' × 8' × 8'",
    basePrice: { low: 550, high: 900, average: 725 },
    factors: {
      location: { urban: 1.3, suburban: 1.0, rural: 0.85 },
      duration: { week: 1.0, twoWeeks: 1.15, month: 1.4 },
      season: { peak: 1.2, offPeak: 0.9 }
    },
    additionalFees: [
      { name: 'Permit Fee', range: '$25-$100', description: 'Required for street placement' },
      { name: 'Overage Fee', range: '$65-$100/ton', description: 'Exceeding weight limit' },
      { name: 'Extended Rental', range: '$5-$15/day', description: 'Keeping beyond rental period' }
    ]
  }
];

const cityPricing = [
  { city: 'New York, NY', modifier: 1.45, trend: 'up' },
  { city: 'Los Angeles, CA', modifier: 1.35, trend: 'up' },
  { city: 'Chicago, IL', modifier: 1.25, trend: 'stable' },
  { city: 'Houston, TX', modifier: 1.0, trend: 'down' },
  { city: 'Phoenix, AZ', modifier: 0.95, trend: 'up' },
  { city: 'Philadelphia, PA', modifier: 1.15, trend: 'stable' },
  { city: 'San Antonio, TX', modifier: 0.9, trend: 'down' },
  { city: 'San Diego, CA', modifier: 1.3, trend: 'up' },
  { city: 'Dallas, TX', modifier: 1.05, trend: 'stable' },
  { city: 'Austin, TX', modifier: 1.1, trend: 'up' }
];

export default function PricingGuideClient() {
  const [selectedSize, setSelectedSize] = useState(0);
  const [location, setLocation] = useState('suburban');
  const [duration, setDuration] = useState('week');
  const [season, setSeason] = useState('offPeak');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const calculatePrice = () => {
    const data = pricingData[selectedSize];
    const basePrice = data.basePrice.average;
    const locationMultiplier = data.factors.location[location as keyof typeof data.factors.location];
    const durationMultiplier = data.factors.duration[duration as keyof typeof data.factors.duration];
    const seasonMultiplier = data.factors.season[season as keyof typeof data.factors.season];
    
    return Math.round(basePrice * locationMultiplier * durationMultiplier * seasonMultiplier);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/tools-guides" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools & Guides
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            2025 Dumpster Rental Pricing Guide
          </h1>
          <p className="text-xl text-white/90">
            Estimated market rates and cost factors explained
          </p>
          <p className="text-sm text-white/80 mt-2">
            *All prices are estimates. Actual pricing is set by individual service providers.
          </p>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Estimate Your Cost
          </h2>
          <p className="text-center text-gray-600 mb-6">
            These are estimated ranges based on market averages. Contact providers for actual quotes.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dumpster Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {pricingData.map((data, index) => (
                    <option key={index} value={index}>
                      {data.size} ({data.dimensions})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Type
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="rural">Rural (-15%)</option>
                  <option value="suburban">Suburban (Base)</option>
                  <option value="urban">Urban (+30%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rental Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="week">1 Week (Base)</option>
                  <option value="twoWeeks">2 Weeks (+15%)</option>
                  <option value="month">1 Month (+40%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="offPeak">Off-Peak (Winter) (-10%)</option>
                  <option value="peak">Peak (Summer) (+20%)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary-100 rounded-lg text-center">
              <p className="text-sm text-primary-700 mb-2">Estimated Cost Range</p>
              <p className="text-4xl font-bold text-primary-900">
                ${calculatePrice()}
              </p>
              <p className="text-sm text-primary-600 mt-2">
                Estimated price based on your selections
              </p>
              <p className="text-xs text-primary-600 mt-1">
                *Actual prices vary by provider
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tables */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Estimated Base Pricing by Size
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingData.map((data, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {data.size}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{data.dimensions}</p>
                
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${data.basePrice.average}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${data.basePrice.low} - ${data.basePrice.high} range
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-600 mb-2">Typical weight limit:</p>
                  <p className="font-medium">{2 + index} - {3 + index} tons</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City Pricing */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Estimated Pricing by Major City
          </h2>
          
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Modifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    20-Yard Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cityPricing.map((city, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {city.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {city.modifier > 1 ? '+' : ''}{Math.round((city.modifier - 1) * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${Math.round(475 * city.modifier)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {city.trend === 'up' ? (
                        <span className="flex items-center text-red-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-sm">Rising</span>
                        </span>
                      ) : city.trend === 'down' ? (
                        <span className="flex items-center text-primary-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-sm">Falling</span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">Stable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common Additional Fees (Estimates)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Permit Fees</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">$25-$100</p>
              <p className="text-sm text-gray-600">
                Required when placing dumpster on public property or street
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Overage Charges</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">$65-$100/ton</p>
              <p className="text-sm text-gray-600">
                Applied when exceeding the included weight limit
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Extended Rental</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">$5-$15/day</p>
              <p className="text-sm text-gray-600">
                Daily fee for keeping dumpster beyond rental period
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Trip Charge</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">$75-$150</p>
              <p className="text-sm text-gray-600">
                If driver can't deliver or pickup due to blocked access
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Prohibited Items</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">$100-$500</p>
              <p className="text-sm text-gray-600">
                Disposal fees for hazardous or prohibited materials
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Damage Fees</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">Varies</p>
              <p className="text-sm text-gray-600">
                Repair costs for damage to dumpster or property
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Saving Tips */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  How to Save Money on Dumpster Rental
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      <strong>Book in advance:</strong> Avoid rush delivery fees by scheduling 48+ hours ahead
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      <strong>Choose off-peak times:</strong> Winter months typically have 10-20% lower rates
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      <strong>Avoid overage fees:</strong> Don't exceed weight limits, especially with heavy materials
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      <strong>Share with neighbors:</strong> Split costs for neighborhood cleanups
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">
                      <strong>Get multiple quotes:</strong> Prices can vary between companies and locations
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Actual Pricing for Your Area
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get real quotes from local providers - prices shown are estimates only
          </p>
          <button
            onClick={() => setQuoteModalOpen(true)}
            className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
          >
            Get Free Quotes
          </button>
        </div>
      </section>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{ 
          dumpsterSize: pricingData[selectedSize].size.toLowerCase().replace(' ', '-')
        }}
      />
    </div>
  );
}