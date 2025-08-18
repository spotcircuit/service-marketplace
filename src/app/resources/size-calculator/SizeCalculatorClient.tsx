'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, Home, Building2, Trash2, Package, ArrowLeft, Info, CheckCircle } from 'lucide-react';

interface DumpsterSize {
  size: number;
  dimensions: string;
  capacity: string;
  ideal_for: string[];
  price_range: string;
  weight_limit: string;
  description: string;
}

interface SizeCalculatorClientProps {
  dumpsterSizes: DumpsterSize[];
}

export default function SizeCalculatorClient({ dumpsterSizes }: SizeCalculatorClientProps) {
  const [projectType, setProjectType] = useState('');
  const [roomCount, setRoomCount] = useState(1);
  const [debrisType, setDebrisType] = useState('mixed');
  const [recommendedSize, setRecommendedSize] = useState<DumpsterSize | null>(null);
  const [showResults, setShowResults] = useState(false);

  const calculateSize = () => {
    let baseSize = 10;
    
    // Calculate based on project type
    switch (projectType) {
      case 'bathroom':
        baseSize = 10;
        break;
      case 'kitchen':
        baseSize = 20;
        break;
      case 'whole-home':
        baseSize = 30;
        break;
      case 'construction':
        baseSize = 40;
        break;
      case 'landscaping':
        baseSize = 20;
        break;
      case 'roofing':
        baseSize = 20;
        break;
      default:
        baseSize = 20;
    }

    // Adjust for room count
    if (roomCount > 2) {
      baseSize = Math.min(baseSize + (roomCount - 2) * 10, 40);
    }

    // Adjust for debris type
    if (debrisType === 'heavy') {
      baseSize = Math.max(baseSize - 10, 10); // Heavy materials need smaller size due to weight limits
    } else if (debrisType === 'light') {
      baseSize = Math.min(baseSize + 10, 40); // Light materials can use larger size
    }

    // Find the recommended dumpster
    const recommended = dumpsterSizes.find(d => d.size >= baseSize) || dumpsterSizes[dumpsterSizes.length - 1];
    setRecommendedSize(recommended);
    setShowResults(true);
  };

  const reset = () => {
    setProjectType('');
    setRoomCount(1);
    setDebrisType('mixed');
    setRecommendedSize(null);
    setShowResults(false);
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
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Dumpster Size Calculator
          </h1>
          <p className="text-xl text-orange-100">
            Find the perfect dumpster size for your project in just a few clicks
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!showResults ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Tell Us About Your Project</h2>
              
              {/* Project Type */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of project are you doing?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'bathroom', label: 'Bathroom Remodel', icon: Home },
                    { value: 'kitchen', label: 'Kitchen Remodel', icon: Home },
                    { value: 'whole-home', label: 'Whole Home', icon: Home },
                    { value: 'construction', label: 'Construction', icon: Building2 },
                    { value: 'landscaping', label: 'Landscaping', icon: Trash2 },
                    { value: 'roofing', label: 'Roofing', icon: Home }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setProjectType(type.value)}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        projectType === type.value
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 mx-auto mb-2 ${
                        projectType === type.value ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Count */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How many rooms are involved?
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-2xl font-semibold w-12 text-center">{roomCount}</span>
                  <button
                    onClick={() => setRoomCount(Math.min(10, roomCount + 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Debris Type */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of debris will you have?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light (furniture, cardboard)' },
                    { value: 'mixed', label: 'Mixed Materials' },
                    { value: 'heavy', label: 'Heavy (concrete, dirt)' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setDebrisType(type.value)}
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        debrisType === type.value
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateSize}
                disabled={!projectType}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:bg-gray-300"
              >
                Calculate Recommended Size
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recommended Size */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      Recommended: {recommendedSize?.size} Yard Dumpster
                    </h3>
                    <p className="text-green-700 mb-4">{recommendedSize?.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dimensions:</span> {recommendedSize?.dimensions}
                      </div>
                      <div>
                        <span className="font-medium">Price Range:</span> {recommendedSize?.price_range}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {recommendedSize?.capacity}
                      </div>
                      <div>
                        <span className="font-medium">Weight Limit:</span> {recommendedSize?.weight_limit}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium mb-2">Ideal for:</p>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        {recommendedSize?.ideal_for.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Sizes Comparison */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Compare All Sizes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {dumpsterSizes.map((size) => (
                    <div
                      key={size.size}
                      className={`border-2 rounded-lg p-4 ${
                        size.size === recommendedSize?.size
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{size.size} Yard</h4>
                        {size.size === recommendedSize?.size && (
                          <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{size.dimensions}</p>
                      <p className="text-sm font-medium">{size.price_range}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={reset}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Calculate Again
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition text-center"
                >
                  Get Quotes Now
                </Link>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Pro Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• It's better to order slightly larger than you think you need</li>
                  <li>• Heavy materials like concrete may require a smaller dumpster due to weight limits</li>
                  <li>• Check local regulations for permit requirements</li>
                  <li>• Most rentals include 7-10 days; additional days may incur fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}