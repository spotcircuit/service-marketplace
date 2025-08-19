'use client';

import { useState } from 'react';
import { Calculator, Home, Building2, Trash2, Info, CheckCircle } from 'lucide-react';
import DumpsterQuoteModalSimple from './DumpsterQuoteModalSimple';

interface SizeCalculatorProps {
  onQuoteClick?: (recommendedSize?: string) => void;
  embedded?: boolean;
}

export default function SizeCalculator({ onQuoteClick, embedded = false }: SizeCalculatorProps) {
  const [projectType, setProjectType] = useState('');
  const [roomCount, setRoomCount] = useState(1);
  const [debrisType, setDebrisType] = useState('mixed');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const dumpsterSizes = [
    {
      size: 10,
      dimensions: "14' × 8' × 3.5'",
      capacity: '3-4 pickup loads',
      ideal_for: ['Small bathroom remodel', 'Garage cleanout', 'Small deck removal'],
      price_range: '$295-$395',
      weight_limit: '2-3 tons',
      description: 'Perfect for small cleanouts and single room renovations'
    },
    {
      size: 20,
      dimensions: "22' × 8' × 5'",
      capacity: '8-10 pickup loads',
      ideal_for: ['Kitchen remodel', 'Large basement cleanout', 'Roof replacement up to 3000 sq ft'],
      price_range: '$395-$495',
      weight_limit: '3-4 tons',
      description: 'Most popular size for home renovations and medium projects'
    },
    {
      size: 30,
      dimensions: "22' × 8' × 6'",
      capacity: '12-15 pickup loads',
      ideal_for: ['Whole home renovation', 'New construction', 'Large commercial cleanout'],
      price_range: '$495-$595',
      weight_limit: '4-5 tons',
      description: 'Great for major home additions and large construction projects'
    },
    {
      size: 40,
      dimensions: "22' × 8' × 8'",
      capacity: '16-20 pickup loads',
      ideal_for: ['Commercial demolition', 'Industrial cleanout', 'Large construction site'],
      price_range: '$595-$795',
      weight_limit: '5-6 tons',
      description: 'Maximum capacity for commercial and industrial projects'
    }
  ];

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

    // Adjust for room count - be more conservative with size increases
    if (roomCount > 2 && roomCount <= 4) {
      baseSize = Math.min(baseSize + 10, 40);
    } else if (roomCount > 4) {
      baseSize = Math.min(baseSize + 20, 40);
    }

    // Adjust for debris type
    if (debrisType === 'heavy') {
      baseSize = Math.max(baseSize - 10, 10); // Heavy materials need smaller size due to weight limits
    } else if (debrisType === 'light') {
      baseSize = Math.min(baseSize + 10, 40); // Light materials can use larger size
    }

    setRecommendedSize(`${baseSize}`);
    setShowResults(true);
  };

  const reset = () => {
    setProjectType('');
    setRoomCount(1);
    setDebrisType('mixed');
    setRecommendedSize(null);
    setShowResults(false);
  };

  const handleGetQuote = () => {
    if (onQuoteClick) {
      onQuoteClick(recommendedSize || undefined);
    } else {
      setQuoteModalOpen(true);
    }
  };

  const getRecommendedData = () => {
    return dumpsterSizes.find(d => d.size === parseInt(recommendedSize || '20')) || dumpsterSizes[1];
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      <div className={embedded ? '' : 'py-12 px-4'}>
        <div className={embedded ? '' : 'max-w-4xl mx-auto'}>
          {!showResults ? (
            <div className={`bg-white rounded-lg ${embedded ? 'p-6' : 'shadow-lg p-8'}`}>
              <h2 className="text-2xl font-bold mb-6">Find Your Perfect Dumpster Size</h2>
              
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
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 mx-auto mb-2 ${
                        projectType === type.value ? 'text-primary' : 'text-gray-400'
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
                          ? 'border-primary bg-primary/10'
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
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Calculator className="h-5 w-5" />
                Calculate Recommended Size
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recommended Size */}
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      Recommended: {recommendedSize} Yard Dumpster
                    </h3>
                    <p className="text-green-800 mb-4">{getRecommendedData().description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dimensions:</span> {getRecommendedData().dimensions}
                      </div>
                      <div>
                        <span className="font-medium">Price Range:</span> {getRecommendedData().price_range}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {getRecommendedData().capacity}
                      </div>
                      <div>
                        <span className="font-medium">Weight Limit:</span> {getRecommendedData().weight_limit}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium mb-2">Ideal for:</p>
                      <ul className="list-disc list-inside text-green-800 space-y-1">
                        {getRecommendedData().ideal_for.map((item, index) => (
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
                    <button
                      key={size.size}
                      onClick={() => {
                        setRecommendedSize(`${size.size}`);
                      }}
                      className={`border-2 rounded-lg p-4 text-left transition hover:shadow-md cursor-pointer ${
                        size.size === parseInt(recommendedSize || '20')
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{size.size} Yard</h4>
                        {size.size === parseInt(recommendedSize || '20') && (
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{size.dimensions}</p>
                      <p className="text-sm font-medium">{size.price_range}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to select</p>
                    </button>
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
                <button
                  onClick={handleGetQuote}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Get Quote for {recommendedSize} Yard
                </button>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!embedded && (
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <Info className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Pro Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• It's better to order slightly larger than you think you need</li>
                    <li>• Heavy materials like concrete may require a smaller dumpster due to weight limits</li>
                    <li>• Check local regulations for permit requirements</li>
                    <li>• Most rentals include 7-10 days; additional days may incur fees</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{dumpsterSize: recommendedSize ? `${recommendedSize}-yard` : "20-yard"}}
      />
    </div>
  );
}