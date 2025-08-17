'use client';

import { useEffect, useState } from 'react';
import { Calculator, Home, Trash2, CheckCircle, AlertCircle, ArrowRight, Phone, MessageSquare, DollarSign, Ruler, Package, Info } from 'lucide-react';
import Link from 'next/link';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect resources landing to new sizes guide
    router.replace('/dumpster-sizes');
  }, [router]);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const residentialSizes = [
    {
      size: '10 Yard',
      dimensions: '13\' L × 8\' W × 3.5\' H',
      capacity: '3 pickup truck loads',
      weight: '1-2 tons',
      idealFor: 'Small bathroom remodel, garage cleanout',
      projects: ['Bathroom renovation', 'Single room cleanout', 'Small deck removal', 'Yard debris'],
      price: 'Starting at $295'
    },
    {
      size: '15 Yard',
      dimensions: '16\' L × 8\' W × 4\' H',
      capacity: '4.5 pickup truck loads',
      weight: '2-3 tons',
      idealFor: 'Multiple room cleanout, small kitchen remodel',
      projects: ['Kitchen renovation', 'Basement cleanout', 'Flooring removal', 'Multi-room declutter'],
      price: 'Starting at $345',
      popular: true
    },
    {
      size: '20 Yard',
      dimensions: '22\' L × 8\' W × 5\' H',
      capacity: '6 pickup truck loads',
      weight: '2-3 tons',
      idealFor: 'Large renovation, whole house cleanout',
      projects: ['Full home renovation', 'Roof replacement', 'Large deck removal', 'Estate cleanout'],
      price: 'Starting at $395',
      recommended: true
    }
  ];

  const allowedItems = [
    'Household junk & debris',
    'Construction & demolition waste',
    'Yard waste & landscaping debris',
    'Furniture & appliances',
    'Carpet & flooring materials',
    'Drywall & lumber',
    'Roofing materials (shingles)',
    'Concrete & brick (weight limits apply)'
  ];

  const prohibitedItems = [
    'Hazardous materials & chemicals',
    'Paint, oil & automotive fluids',
    'Asbestos containing materials',
    'Tires & car batteries',
    'Medical waste',
    'Propane tanks',
    'Refrigerators with freon',
    'Electronics (check e-waste options)'
  ];

  const projectGuides = [
    {
      title: 'Bathroom Remodel',
      size: '10-15 Yard',
      duration: '3-5 days',
      tips: 'Remove fixtures first, then tile and drywall. Keep heavy items like tubs separate.',
      link: '#bathroom'
    },
    {
      title: 'Kitchen Renovation',
      size: '20 Yard',
      duration: '5-7 days',
      tips: 'Cabinets take more space than expected. Consider appliance recycling separately.',
      link: '#kitchen'
    },
    {
      title: 'Garage Cleanout',
      size: '10 Yard',
      duration: '1-2 days',
      tips: 'Sort items for donation first. Break down large items to maximize space.',
      link: '#garage'
    },
    {
      title: 'Estate Cleanout',
      size: '20-30 Yard',
      duration: '7-14 days',
      tips: 'Work room by room. Consider valuable items for estate sale first.',
      link: '#estate'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Residential Dumpster Rental Made Easy
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Perfect for home renovations, cleanouts, and DIY projects. Get the right size dumpster delivered to your driveway.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
              >
                Get Instant Quote
              </button>
              <a
                href="tel:+14342076559"
                className="px-8 py-4 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call (434) 207-6559
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Size Selector */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Popular Residential Dumpster Sizes</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose the perfect size for your home project. Not sure? Our team can help you decide.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {residentialSizes.map((item) => (
              <div 
                key={item.size}
                className={`border rounded-lg p-6 hover:shadow-lg transition relative ${
                  item.recommended ? 'border-primary shadow-md' : ''
                }`}
              >
                {item.recommended && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-sm rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">{item.size} Dumpster</h3>
                  <p className="text-muted-foreground text-sm">{item.dimensions}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Capacity</p>
                      <p className="text-sm text-muted-foreground">{item.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Ruler className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Weight Limit</p>
                      <p className="text-sm text-muted-foreground">{item.weight}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Best For</p>
                      <p className="text-sm text-muted-foreground">{item.idealFor}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-2xl font-bold text-primary mb-3">{item.price}</p>
                  <button
                    onClick={() => setQuoteModalOpen(true)}
                    className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/dumpster-sizes"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              View All Sizes & Commercial Options
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Guides */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Project-Specific Guides</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {projectGuides.map((guide) => (
              <div key={guide.title} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-3">{guide.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recommended Size:</span>
                    <span className="font-medium">{guide.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical Duration:</span>
                    <span className="font-medium">{guide.duration}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{guide.tips}</p>
                <button className="text-primary font-medium text-sm hover:text-primary/80">
                  Read Full Guide →
                </button>
              </div>
            ))}
          </div>
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
                {allowedItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-900">Prohibited Items</h3>
              </div>
              <ul className="space-y-2">
                {prohibitedItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
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

      {/* Cost Calculator */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Estimate Your Project Cost</h2>
              <p className="text-muted-foreground">Factors that affect your dumpster rental price</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Dumpster Size</h4>
                <p className="text-sm text-muted-foreground">Larger sizes cost more but offer better value per yard</p>
              </div>
              <div className="text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Debris Type</h4>
                <p className="text-sm text-muted-foreground">Heavy materials like concrete may incur additional fees</p>
              </div>
              <div className="text-center">
                <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Location</h4>
                <p className="text-sm text-muted-foreground">Distance from facility affects delivery costs</p>
              </div>
              <div className="text-center">
                <Trash2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Rental Period</h4>
                <p className="text-sm text-muted-foreground">Standard 7-day rental with flexible extensions</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Get Your Custom Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pro Tips for Homeowners</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Measure Your Driveway</h3>
              <p className="text-sm text-gray-300">
                Ensure you have 60 feet of length and 10.5 feet of width for delivery truck access
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Load Heavy Items First</h3>
              <p className="text-sm text-gray-300">
                Place heavy debris at the bottom and break down large items to maximize space
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Check Permit Requirements</h3>
              <p className="text-sm text-gray-300">
                Street placement may require permits. Driveway placement usually doesn't
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Home Project?</h2>
          <p className="text-xl mb-8 text-white/90">
            Get the right dumpster delivered tomorrow. No hassle, transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Instant Quote
            </button>
            <Link
              href="/commercial"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition"
            >
              Need Commercial Service?
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}