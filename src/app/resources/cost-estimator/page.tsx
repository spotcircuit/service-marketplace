'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, DollarSign, ArrowLeft, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface ServiceCost {
  service: string;
  lowEnd: number;
  average: number;
  highEnd: number;
  factors: string[];
}

const serviceCosts: Record<string, ServiceCost[]> = {
  'home-services': [
    {
      service: 'Plumbing Repair',
      lowEnd: 150,
      average: 350,
      highEnd: 800,
      factors: ['Type of repair', 'Emergency service', 'Part costs', 'Location']
    },
    {
      service: 'HVAC Service',
      lowEnd: 75,
      average: 200,
      highEnd: 500,
      factors: ['Service type', 'System age', 'Part replacement', 'Season']
    },
    {
      service: 'Electrical Work',
      lowEnd: 200,
      average: 500,
      highEnd: 1500,
      factors: ['Job complexity', 'Permit requirements', 'Code updates', 'Materials']
    },
    {
      service: 'Roofing Repair',
      lowEnd: 300,
      average: 750,
      highEnd: 2000,
      factors: ['Damage extent', 'Roof type', 'Accessibility', 'Materials']
    },
    {
      service: 'Kitchen Remodel',
      lowEnd: 5000,
      average: 25000,
      highEnd: 75000,
      factors: ['Kitchen size', 'Material quality', 'Appliances', 'Layout changes']
    },
    {
      service: 'Bathroom Remodel',
      lowEnd: 3000,
      average: 12000,
      highEnd: 35000,
      factors: ['Bathroom size', 'Fixture quality', 'Tile work', 'Plumbing changes']
    }
  ],
  'dumpster-rental': [
    {
      service: '10 Yard Dumpster',
      lowEnd: 250,
      average: 350,
      highEnd: 450,
      factors: ['Rental duration', 'Location', 'Debris type', 'Weight']
    },
    {
      service: '20 Yard Dumpster',
      lowEnd: 350,
      average: 450,
      highEnd: 600,
      factors: ['Rental duration', 'Location', 'Debris type', 'Weight']
    },
    {
      service: '30 Yard Dumpster',
      lowEnd: 450,
      average: 550,
      highEnd: 750,
      factors: ['Rental duration', 'Location', 'Debris type', 'Weight']
    },
    {
      service: '40 Yard Dumpster',
      lowEnd: 550,
      average: 700,
      highEnd: 900,
      factors: ['Rental duration', 'Location', 'Debris type', 'Weight']
    }
  ]
};

export default function CostEstimatorPage() {
  const [serviceType, setServiceType] = useState('home-services');
  const [selectedService, setSelectedService] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [quality, setQuality] = useState('standard');
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimate, setEstimate] = useState({ low: 0, high: 0, average: 0 });

  const calculateEstimate = () => {
    const services = serviceCosts[serviceType];
    const service = services.find(s => s.service === selectedService);
    
    if (!service) return;

    let multiplier = 1;
    
    // Adjust for urgency
    if (urgency === 'emergency') {
      multiplier += 0.5;
    } else if (urgency === 'rush') {
      multiplier += 0.25;
    }
    
    // Adjust for quality
    if (quality === 'premium') {
      multiplier += 0.3;
    } else if (quality === 'budget') {
      multiplier -= 0.2;
    }

    // Regional adjustment (simplified)
    const zipPrefix = zipCode.substring(0, 1);
    if (['9', '1', '0'].includes(zipPrefix)) {
      multiplier += 0.15; // Higher cost areas
    } else if (['3', '4', '5'].includes(zipPrefix)) {
      multiplier -= 0.1; // Lower cost areas
    }

    setEstimate({
      low: Math.round(service.lowEnd * multiplier),
      high: Math.round(service.highEnd * multiplier),
      average: Math.round(service.average * multiplier)
    });
    setShowEstimate(true);
  };

  const reset = () => {
    setSelectedService('');
    setZipCode('');
    setUrgency('standard');
    setQuality('standard');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/resources" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Service Cost Estimator
          </h1>
          <p className="text-xl text-green-100">
            Get accurate cost estimates for home services and rentals
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!showEstimate ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Estimate Your Project Cost</h2>
              
              {/* Service Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setServiceType('home-services');
                      setSelectedService('');
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      serviceType === 'home-services'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Home Services
                  </button>
                  <button
                    onClick={() => {
                      setServiceType('dumpster-rental');
                      setSelectedService('');
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      serviceType === 'dumpster-rental'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Dumpster Rental
                  </button>
                </div>
              </div>

              {/* Service Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a service...</option>
                  {serviceCosts[serviceType].map((service) => (
                    <option key={service.service} value={service.service}>
                      {service.service}
                    </option>
                  ))}
                </select>
              </div>

              {/* ZIP Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter your ZIP code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Urgency */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Timeline
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'rush', label: 'Rush (+25%)' },
                    { value: 'emergency', label: 'Emergency (+50%)' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setUrgency(option.value)}
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        urgency === option.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Level */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quality Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'budget', label: 'Budget (-20%)' },
                    { value: 'standard', label: 'Standard' },
                    { value: 'premium', label: 'Premium (+30%)' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setQuality(option.value)}
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        quality === option.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateEstimate}
                disabled={!selectedService || !zipCode}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-300"
              >
                Calculate Estimate
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estimate Results */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Your Cost Estimate</h2>
                
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Estimated Range</p>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Low</p>
                        <p className="text-2xl font-bold text-gray-700">{formatCurrency(estimate.low)}</p>
                      </div>
                      <div className="text-3xl text-gray-300">-</div>
                      <div>
                        <p className="text-sm text-gray-500">High</p>
                        <p className="text-2xl font-bold text-gray-700">{formatCurrency(estimate.high)}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-600">Average Cost</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(estimate.average)}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Factors */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Factors Affecting Your Cost:</h3>
                  <div className="space-y-2">
                    {serviceCosts[serviceType]
                      .find(s => s.service === selectedService)
                      ?.factors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                          {factor}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Savings Tips */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Ways to Save:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Get multiple quotes to compare prices</li>
                        <li>• Consider off-season timing for better rates</li>
                        <li>• Bundle services when possible</li>
                        <li>• Ask about cash discounts</li>
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
                <Link
                  href="/"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-center"
                >
                  Get Real Quotes
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}