'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, DollarSign, ArrowLeft, Info, TrendingUp, TrendingDown } from 'lucide-react';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';

interface DumpsterCost {
  size: string;
  basePrice: number;
  factors: string[];
}

interface CostEstimatorClientProps {
  dumpsterCosts: DumpsterCost[];
}

export default function CostEstimatorClient({ dumpsterCosts }: CostEstimatorClientProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [duration, setDuration] = useState('7');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [debrisType, setDebrisType] = useState('mixed');
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimate, setEstimate] = useState({ low: 0, high: 0, average: 0 });

  const calculateEstimate = () => {
    const size = dumpsterCosts.find(s => s.size === selectedSize);
    if (!size) return;

    let multiplier = 1;
    let basePrice = size.basePrice;

    // Adjust for duration
    const days = parseInt(duration);
    if (days > 7) {
      multiplier += (days - 7) * 0.05; // 5% per extra day
    }

    // Adjust for debris type
    if (debrisType === 'heavy') {
      multiplier += 0.2; // Heavy materials cost more due to disposal fees
    } else if (debrisType === 'light') {
      multiplier -= 0.1; // Light materials slightly cheaper
    }

    // Regional adjustment based on ZIP code
    const zipPrefix = zipCode.substring(0, 1);
    if (['9', '1', '0'].includes(zipPrefix)) {
      multiplier += 0.25; // West Coast, Northeast higher costs
    } else if (['2', '3'].includes(zipPrefix)) {
      multiplier += 0.1; // Southeast moderate increase
    } else if (['4', '5', '6', '7'].includes(zipPrefix)) {
      multiplier -= 0.05; // Midwest/South slightly lower
    }

    const averagePrice = Math.round(basePrice * multiplier);
    const lowPrice = Math.round(averagePrice * 0.8);
    const highPrice = Math.round(averagePrice * 1.3);

    setEstimate({
      low: lowPrice,
      high: highPrice,
      average: averagePrice
    });
    setShowEstimate(true);
  };

  const reset = () => {
    setSelectedSize('');
    setZipCode('');
    setDuration('7');
    setDebrisType('mixed');
    setShowEstimate(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriceIcon = (size: string) => {
    const index = dumpsterCosts.findIndex(s => s.size === size);
    if (index <= 1) return <TrendingDown className="h-4 w-4 text-primary" />;
    if (index >= 3) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <DollarSign className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/tools-guides" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
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
            Dumpster Rental Cost Calculator
          </h1>
          <p className="text-xl text-white/90">
            Get accurate cost estimates for your dumpster rental based on size, location, and project details
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!showEstimate ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Calculate Your Dumpster Rental Cost</h2>
              
              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dumpster Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dumpsterCosts.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        selectedSize === size.size
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {getPriceIcon(size.size)}
                      </div>
                      <div className="font-medium">{size.size}</div>
                      <div className="text-sm text-gray-600">Starting at ${size.basePrice}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ZIP Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ZIP Code (affects regional pricing)
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter your ZIP code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Rental Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rental Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days (standard)</option>
                  <option value="10">10 days</option>
                  <option value="14">14 days</option>
                  <option value="21">21 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              {/* Debris Type */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type of Debris
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light (furniture, boxes)', desc: 'Lower disposal costs' },
                    { value: 'mixed', label: 'Mixed Materials', desc: 'Standard pricing' },
                    { value: 'heavy', label: 'Heavy (concrete, dirt)', desc: 'Higher disposal fees' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setDebrisType(type.value)}
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        debrisType === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateEstimate}
                disabled={!selectedSize || !zipCode}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:bg-gray-300"
              >
                Calculate Cost Estimate
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estimate Results */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Your Dumpster Rental Cost Estimate</h2>
                
                <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">{selectedSize} Dumpster for {duration} days</span>
                    </div>
                    <div className="flex items-center justify-center space-x-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Low End</p>
                        <p className="text-xl font-bold text-gray-700">{formatCurrency(estimate.low)}</p>
                      </div>
                      <div className="text-2xl text-gray-300">-</div>
                      <div>
                        <p className="text-sm text-gray-500">High End</p>
                        <p className="text-xl font-bold text-gray-700">{formatCurrency(estimate.high)}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-primary/20">
                      <p className="text-sm text-gray-600">Most Likely Cost</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(estimate.average)}</p>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">What's Included in Your Price:</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Delivery to your location
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {duration}-day rental period
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Pickup and disposal
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Weight allowance
                    </div>
                  </div>
                </div>

                {/* Potential Additional Costs */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">Potential Additional Costs:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Overage fees if weight limit exceeded</li>
                    <li>• Extended rental fees beyond {duration} days</li>
                    <li>• Permit fees for street placement</li>
                    <li>• Special disposal fees for certain materials</li>
                  </ul>
                </div>

                {/* Money-Saving Tips */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Money-Saving Tips:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Choose the right size to avoid multiple rentals</li>
                        <li>• Plan your timeline to stay within the rental period</li>
                        <li>• Keep debris separate from prohibited items</li>
                        <li>• Load heavy items first, lighter items on top</li>
                        <li>• Compare quotes from multiple providers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={reset}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Calculate Another
                </button>
                <button
                  onClick={() => {
                    setQuoteModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Get Real Quotes
                </button>
              </div>
            </div>
          )}

          {/* Pricing Transparency Section */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4">Pricing Transparency</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Factors That Increase Cost:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• High-cost regions (West Coast, Northeast)</li>
                  <li>• Heavy debris disposal fees</li>
                  <li>• Extended rental periods</li>
                  <li>• Overweight charges</li>
                  <li>• Rush delivery requests</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ways to Save Money:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Book during off-peak times</li>
                  <li>• Choose standard delivery timeframes</li>
                  <li>• Stay within weight limits</li>
                  <li>• Return on time to avoid late fees</li>
                  <li>• Separate recyclables when possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{
          dumpsterSize: selectedSize ? `${selectedSize.toLowerCase().replace(' yard', '-yard')}` : '20-yard',
          zipcode: zipCode
        }}
      />
    </div>
  );
}