'use client';

import { useState, useEffect } from 'react';
import { 
  Ruler, 
  Package, 
  Weight, 
  Home, 
  Building, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Calculator,
  Truck,
  DollarSign,
  Clock,
  MapPin,
  HelpCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';
import SizeCalculator from '@/components/SizeCalculator';
import DumpsterSizeComparison from '@/components/DumpsterSizeComparison';
import { useConfig } from '@/contexts/ConfigContext';

interface DumpsterSize {
  size: string;
  category: 'residential' | 'commercial' | 'both';
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  capacity: {
    cubic: string;
    loads: string;
    bags: string;
  };
  weight: {
    limit: string;
    pounds: string;
    ideal: string;
  };
  bestFor: string[];
  notGoodFor: string[];
  pricing: string;
  visual: string;
  popular?: boolean;
}

interface DumpsterSizesClientProps {
  allSizes: DumpsterSize[];
  comparisonFactors: Array<{
    factor: string;
    description: string;
    requirement: string;
  }>;
}

export default function DumpsterSizesClient({ allSizes, comparisonFactors }: DumpsterSizesClientProps) {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState<'residential' | 'commercial'>('residential');
  const [selectedSize, setSelectedSize] = useState<string>('20 Yard');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Set header to secondary when this page uses a primary-toned hero
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-header-tone');
    root.setAttribute('data-header-tone', 'secondary');
    return () => {
      if (prev) {
        root.setAttribute('data-header-tone', prev);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
  }, []);

  const filteredSizes = allSizes.filter(size => 
    activeTab === 'residential' 
      ? size.category === 'residential' || size.category === 'both'
      : size.category === 'commercial' || size.category === 'both'
  );

  const selectedSizeData = allSizes.find(s => s.size === selectedSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Reimagined */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary to-primary/95">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Ruler className="h-4 w-4" />
              <span className="text-sm font-medium">Complete Size Guide & Calculator</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-secondary mt-2">Dumpster Size</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Choose the right size for your project and save money. Interactive calculator included.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => setShowCalculator(true)}
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg hover:bg-secondary/90 transition shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Calculator className="h-5 w-5" />
                Size Calculator
              </button>
              <button
                onClick={() => {
                  setSelectedSize('20 Yard');
                  setQuoteModalOpen(true);
                }}
                className="px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition"
              >
                Get Quote
              </button>
            </div>

            {/* Quick Size Selector */}
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {['10 Yard', '20 Yard', '30 Yard', '40 Yard'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
                    selectedSize === size
                      ? 'bg-secondary text-secondary-foreground shadow-lg'
                      : 'bg-white/10 backdrop-blur text-white hover:bg-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Size Selection Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Dumpster Size</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Select the right size for your project type and budget
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('residential')}
                className={`px-6 py-3 rounded-md font-medium transition flex items-center gap-2 ${
                  activeTab === 'residential'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="h-4 w-4" />
                Residential
              </button>
              <button
                onClick={() => setActiveTab('commercial')}
                className={`px-6 py-3 rounded-md font-medium transition flex items-center gap-2 ${
                  activeTab === 'commercial'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building className="h-4 w-4" />
                Commercial
              </button>
            </div>
          </div>

          {/* Size Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSizes.map((size) => (
              <div
                key={size.size}
                className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition cursor-pointer ${
                  selectedSize === size.size ? 'border-primary shadow-lg' : 'border-gray-200'
                } ${size.popular ? 'relative' : ''}`}
                onClick={() => setSelectedSize(size.size)}
              >
                {size.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                    Most Popular
                  </span>
                )}

                <h3 className="text-2xl font-bold mb-3">{size.size} Dumpster</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Dimensions</p>
                    <p className="text-sm">{size.dimensions.length} × {size.dimensions.width} × {size.dimensions.height}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Holds</p>
                    <p className="text-sm">{size.capacity.loads}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Best For</p>
                    <ul className="text-sm space-y-1">
                      {size.bestFor.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size.size);
                    setQuoteModalOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  Get Quote
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Size Comparison - MOVED BELOW SIZE CARDS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Understanding the actual size differences helps you choose correctly
          </p>

          {/* Using the new component */}
          <DumpsterSizeComparison 
            selectedSize={selectedSize.toLowerCase().replace(' ', '-')}
            onSizeSelect={(size) => setSelectedSize(size.replace('-yard', ' Yard').replace(/(\d+)/, '$1'))}
            showImage={true}
          />
        </div>
      </section>

      {/* What Can/Can't Section - Better Placement */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Disposal Guidelines</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Know what you can and can't put in your dumpster to avoid additional fees
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Accepted Materials</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'General household junk',
                  'Construction debris',
                  'Yard waste & branches',
                  'Furniture & mattresses',
                  'Appliances (no freon)',
                  'Carpet & flooring',
                  'Drywall & lumber',
                  'Roofing shingles',
                  'Concrete (weight limits)'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Prohibited Items</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Hazardous chemicals',
                  'Paint & solvents',
                  'Asbestos materials',
                  'Tires',
                  'Car batteries',
                  'Medical waste',
                  'Propane tanks',
                  'Electronics (e-waste)',
                  'Refrigerators with freon'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 font-medium">Need help with prohibited items?</p>
                  <p className="text-blue-800 text-sm mt-1">
                    We can guide you to proper disposal facilities for hazardous materials, electronics, and special items. Just ask when you call!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Size Recommendation Tool */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Which Size Do I Need?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">By Room Count</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>1-2 rooms</span>
                  <span className="font-semibold text-primary">10 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>3-4 rooms</span>
                  <span className="font-semibold text-primary">20 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>5+ rooms</span>
                  <span className="font-semibold text-primary">30 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>Whole house</span>
                  <span className="font-semibold text-primary">40 Yard</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">By Project Type</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>Garage cleanout</span>
                  <span className="font-semibold text-primary">10-15 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>Kitchen remodel</span>
                  <span className="font-semibold text-primary">20 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>Roof replacement</span>
                  <span className="font-semibold text-primary">20-30 Yard</span>
                </li>
                <li className="flex justify-between">
                  <span>New construction</span>
                  <span className="font-semibold text-primary">40 Yard</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowCalculator(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              <Calculator className="h-5 w-5" />
              Use Our Size Calculator
            </button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "How do I know what size dumpster I need?",
                answer: "Consider your project scope: 10-yard for small cleanouts, 20-yard for renovations, 30-yard for large projects, and 40-yard for commercial or construction sites. Our calculator can help you choose."
              },
              {
                question: "What happens if I choose the wrong size?",
                answer: "If you fill up your dumpster, we can swap it for an empty one (swap fee applies). If you overload it, there may be additional charges for safe transport."
              },
              {
                question: "Can I put different types of debris in the same dumpster?",
                answer: "Yes, you can mix most types of accepted debris. However, some materials like concrete or dirt may need separate containers due to weight limits."
              },
              {
                question: "How much weight can I put in a dumpster?",
                answer: "Weight limits vary by size: 10-yard (2-3 tons), 20-yard (3-4 tons), 30-yard (4-5 tons), 40-yard (5-6 tons). Heavy materials like concrete have lower volume limits."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Choose your size and get your dumpster delivered tomorrow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSelectedSize('20 Yard');
                setQuoteModalOpen(true);
              }}
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Instant Quote
            </button>
            <a
              href={`tel:${config?.contactPhoneE164 || ''}`}
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50"
            >
              {`Call ${config?.contactPhoneDisplay || ''}`}
            </a>
          </div>
        </div>
      </section>

      {/* Size Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Size Calculator</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <SizeCalculator 
                embedded={true}
                onQuoteClick={(size) => {
                  setSelectedSize(size ? `${size} Yard` : '20 Yard');
                  setShowCalculator(false);
                  setQuoteModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedSize('20 Yard');
        }}
        initialData={{ dumpsterSize: selectedSize.toLowerCase().replace(' ', '-') }}
      />
    </div>
  );
}