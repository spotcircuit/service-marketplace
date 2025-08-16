'use client';

import { useState } from 'react';
import { Ruler, Package, Weight, Home, Building, Info, CheckCircle, AlertTriangle, ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function DumpsterSizesPage() {
  const [activeTab, setActiveTab] = useState<'residential' | 'commercial'>('residential');

  const allSizes = [
    {
      size: '10 Yard',
      category: 'residential',
      dimensions: {
        length: '13 feet',
        width: '8 feet',
        height: '3.5 feet'
      },
      capacity: {
        cubic: '10 cubic yards',
        loads: '3-4 pickup truck loads',
        bags: '50-70 trash bags'
      },
      weight: {
        limit: '2-3 tons',
        pounds: '4,000-6,000 lbs',
        ideal: 'Heavy materials like concrete, dirt, brick'
      },
      bestFor: [
        'Small bathroom remodel',
        'Single room renovation',
        'Garage cleanout',
        'Small deck removal',
        'Concrete or dirt disposal (small loads)'
      ],
      notGoodFor: [
        'Whole house cleanout',
        'Large renovation projects',
        'Roofing projects over 1,500 sq ft'
      ],
      pricing: 'Starting at $295',
      visual: '🚛'
    },
    {
      size: '15 Yard',
      category: 'residential',
      dimensions: {
        length: '16 feet',
        width: '8 feet',
        height: '4 feet'
      },
      capacity: {
        cubic: '15 cubic yards',
        loads: '4-5 pickup truck loads',
        bags: '75-100 trash bags'
      },
      weight: {
        limit: '2-3 tons',
        pounds: '4,000-6,000 lbs',
        ideal: 'Mixed debris, moderate weight'
      },
      bestFor: [
        'Kitchen renovation',
        'Multiple room cleanout',
        'Small home addition',
        'Basement cleanout',
        'Flooring removal (up to 1,500 sq ft)'
      ],
      notGoodFor: [
        'Large construction projects',
        'Commercial demolition',
        'Heavy material disposal'
      ],
      pricing: 'Starting at $345',
      visual: '🚛🚛'
    },
    {
      size: '20 Yard',
      category: 'both',
      dimensions: {
        length: '22 feet',
        width: '8 feet',
        height: '5 feet'
      },
      capacity: {
        cubic: '20 cubic yards',
        loads: '8-10 pickup truck loads',
        bags: '110-130 trash bags'
      },
      weight: {
        limit: '3-4 tons',
        pounds: '6,000-8,000 lbs',
        ideal: 'General construction debris'
      },
      bestFor: [
        'Large home renovation',
        'Roof replacement (up to 3,000 sq ft)',
        'Whole house cleanout',
        'Office renovation',
        'Retail buildout'
      ],
      notGoodFor: [
        'Major demolition',
        'Industrial waste',
        'Very heavy materials in bulk'
      ],
      pricing: 'Starting at $395',
      popular: true,
      visual: '🚛🚛🚛'
    },
    {
      size: '30 Yard',
      category: 'both',
      dimensions: {
        length: '22 feet',
        width: '8 feet',
        height: '6 feet'
      },
      capacity: {
        cubic: '30 cubic yards',
        loads: '12-15 pickup truck loads',
        bags: '170-190 trash bags'
      },
      weight: {
        limit: '4-5 tons',
        pounds: '8,000-10,000 lbs',
        ideal: 'Large construction projects'
      },
      bestFor: [
        'New home construction',
        'Major home addition',
        'Commercial construction',
        'Multi-story renovation',
        'Large office cleanout'
      ],
      notGoodFor: [
        'Small residential projects',
        'Limited access areas',
        'Extremely heavy materials only'
      ],
      pricing: 'Starting at $495',
      visual: '🚛🚛🚛🚛'
    },
    {
      size: '40 Yard',
      category: 'commercial',
      dimensions: {
        length: '22 feet',
        width: '8 feet',
        height: '8 feet'
      },
      capacity: {
        cubic: '40 cubic yards',
        loads: '16-20 pickup truck loads',
        bags: '230-250 trash bags'
      },
      weight: {
        limit: '5-6 tons',
        pounds: '10,000-12,000 lbs',
        ideal: 'Large-scale demolition'
      },
      bestFor: [
        'Commercial demolition',
        'Industrial cleanout',
        'Large construction site',
        'Warehouse renovation',
        'Multi-unit building project'
      ],
      notGoodFor: [
        'Residential driveways (too large)',
        'Small projects (not cost-effective)',
        'Extremely heavy materials only'
      ],
      pricing: 'Starting at $595',
      visual: '🚛🚛🚛🚛🚛'
    }
  ];

  const filteredSizes = allSizes.filter(size => 
    activeTab === 'residential' 
      ? size.category === 'residential' || size.category === 'both'
      : size.category === 'commercial' || size.category === 'both'
  );

  const comparisonFactors = [
    {
      factor: 'Driveway Space',
      description: 'Ensure you have adequate space for delivery',
      requirement: 'Need 60 ft length × 10.5 ft width for truck access'
    },
    {
      factor: 'Weight Limits',
      description: 'Heavy materials require smaller containers',
      requirement: 'Concrete, dirt, and brick have lower weight limits'
    },
    {
      factor: 'Loading Height',
      description: 'Consider how high you need to lift debris',
      requirement: 'Walk-in loading available for 30 & 40 yard containers'
    },
    {
      factor: 'Permit Requirements',
      description: 'Street placement may require permits',
      requirement: 'Check local regulations for public right-of-way placement'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Dumpster Size Guide & Comparison
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Find the perfect dumpster size for your project. From small home cleanouts to large construction sites.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
          >
            Get Size Recommendation
          </Link>
        </div>
      </section>

      {/* What Can/Can't Go In */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Can & Can't Go In Your Dumpster</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Accepted Items</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Household junk & debris',
                  'Construction & demolition waste',
                  'Yard waste & landscaping debris',
                  'Furniture & appliances',
                  'Carpet & flooring materials',
                  'Drywall & lumber',
                  'Roofing materials (shingles)',
                  'Concrete & brick (weight limits apply)'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-900">Prohibited Items</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Hazardous materials & chemicals',
                  'Paint, oil & automotive fluids',
                  'Asbestos containing materials',
                  'Tires & car batteries',
                  'Medical waste',
                  'Propane tanks',
                  'Refrigerators with freon',
                  'Electronics (check e-waste options)'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-900 font-medium">Need to dispose of prohibited items?</p>
                <p className="text-blue-800 text-sm mt-1">
                  We can help you find proper disposal facilities for hazardous materials, electronics, and other special items.
                  Contact us for local recycling and disposal options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 my-4">
              <button
                onClick={() => setActiveTab('residential')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === 'residential'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="inline h-4 w-4 mr-2" />
                Residential Sizes
              </button>
              <button
                onClick={() => setActiveTab('commercial')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === 'commercial'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building className="inline h-4 w-4 mr-2" />
                Commercial Sizes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Size Comparison */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Visual Size Comparison</h2>
          <div className="flex justify-center items-end gap-4 overflow-x-auto pb-4">
            {filteredSizes.map((size) => (
              <div key={size.size} className="text-center flex-shrink-0">
                <div className="text-4xl mb-2">{size.visual}</div>
                <p className="font-semibold">{size.size}</p>
                <p className="text-xs text-muted-foreground">{size.capacity.cubic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Size Information */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {activeTab === 'residential' ? 'Residential' : 'Commercial'} Dumpster Sizes Detailed
          </h2>
          
          <div className="space-y-8">
            {filteredSizes.map((size) => (
              <div 
                key={size.size} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  size.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {size.popular && (
                  <div className="bg-primary text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR SIZE
                  </div>
                )}
                
                <div className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Basic Info */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        {size.size} Dumpster
                        <span className="text-lg font-normal text-muted-foreground">
                          ({size.capacity.cubic})
                        </span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Ruler className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Dimensions</h4>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>Length: {size.dimensions.length}</li>
                            <li>Width: {size.dimensions.width}</li>
                            <li>Height: {size.dimensions.height}</li>
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Capacity</h4>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>{size.capacity.loads}</li>
                            <li>{size.capacity.bags}</li>
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Weight className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Weight Limit</h4>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>{size.weight.limit}</li>
                            <li>{size.weight.pounds}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column - Best For */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Best For These Projects
                      </h4>
                      <ul className="space-y-2">
                        {size.bestFor.map((use, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column - Not Good For & CTA */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Not Recommended For
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {size.notGoodFor.map((use, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-primary mb-2">{size.pricing}</p>
                        <p className="text-xs text-muted-foreground mb-3">7-day rental included</p>
                        <Link
                          href="/"
                          className="block text-center w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                        >
                          Get Quote for {size.size}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Weight Consideration:</p>
                        <p className="text-blue-800">{size.weight.ideal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Considerations */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Important Sizing Considerations</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {comparisonFactors.map((item) => (
              <div key={item.factor} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{item.factor}</h3>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{item.requirement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Size Calculator CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Calculator className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Still Not Sure What Size You Need?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Our experts can help you choose the perfect size based on your specific project. 
            Avoid overpaying for unused space or getting stuck with a too-small container.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Get Expert Recommendation
            </Link>
            <a
              href="tel:1-888-555-0123"
              className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Call 1-888-555-0123
            </a>
          </div>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/dumpster-sizes"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition"
            >
              <Home className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Homeowners</h3>
              <p className="text-sm text-white/80">Residential projects and home renovations</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium">
                Learn More <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            
            <Link
              href="/commercial"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition"
            >
              <Building className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Businesses</h3>
              <p className="text-sm text-white/80">Commercial and industrial solutions</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium">
                Learn More <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            
            <Link
              href="/contractors"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition"
            >
              <Package className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Contractors</h3>
              <p className="text-sm text-white/80">Priority service for professionals</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium">
                Learn More <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* No modal on this page: informational only */}
    </div>
  );
}