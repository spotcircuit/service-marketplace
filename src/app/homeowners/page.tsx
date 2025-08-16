'use client';

import React, { useState } from 'react';
import { Home, Trash2, Calendar, Shield, Clock, CheckCircle, ArrowRight, Phone, Calculator, Ruler, AlertTriangle, Package, Download, BookOpen, DollarSign, HelpCircle, Hammer, Brush, Trees } from 'lucide-react';
import Link from 'next/link';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';

export default function HomeownersPage() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState<'size' | 'cost' | null>(null);

  const residentialSizes = [
    {
      size: '10 Yard',
      dimensions: '13\' L × 8\' W × 3.5\' H',
      capacity: '3-4 pickup truck loads',
      weight: '2-3 tons',
      idealFor: 'Small cleanouts, single room renovations',
      projects: ['Garage cleanout', 'Bathroom remodel', 'Small deck removal', 'Basement decluttering'],
      features: ['Fits in driveway', 'Easy loading height'],
      pricing: 'Starting at $295'
    },
    {
      size: '15 Yard',
      dimensions: '16\' L × 8\' W × 4\' H',
      capacity: '4-5 pickup truck loads',
      weight: '2-3 tons',
      idealFor: 'Medium projects, multi-room cleanouts',
      projects: ['Kitchen renovation', 'Flooring removal', 'Moving cleanout', 'Shed demolition'],
      features: ['Most versatile size', 'Good for mixed debris'],
      popular: true,
      pricing: 'Starting at $345'
    },
    {
      size: '20 Yard',
      dimensions: '22\' L × 8\' W × 5\' H',
      capacity: '8-10 pickup truck loads',
      weight: '3-4 tons',
      idealFor: 'Large home projects, whole house cleanouts',
      projects: ['Roof replacement', 'Home addition', 'Estate cleanout', 'Major renovation'],
      features: ['High capacity', 'Walk-in door available'],
      recommended: true,
      pricing: 'Starting at $395'
    }
  ];

  const projectTypes = [
    {
      name: 'Home Renovation',
      icon: Hammer,
      description: 'Kitchen, bathroom, and room remodels',
      commonSize: '15-20 Yard',
      tips: ['Order before demo starts', 'Consider weight limits for tile/concrete', 'Plan for 7-10 day rental']
    },
    {
      name: 'Spring Cleaning',
      icon: Brush,
      description: 'Decluttering and seasonal cleanouts',
      commonSize: '10-15 Yard',
      tips: ['Perfect for garage/attic cleanout', 'Sort items for donation first', '3-5 day rental usually sufficient']
    },
    {
      name: 'Landscaping',
      icon: Trees,
      description: 'Yard waste and outdoor projects',
      commonSize: '10-20 Yard',
      tips: ['Check for yard waste restrictions', 'Consider weight for dirt/sod', 'May need separate container for soil']
    },
    {
      name: 'Moving/Estate',
      icon: Home,
      description: 'Downsizing and estate cleanouts',
      commonSize: '20-30 Yard',
      tips: ['Allow extra time for sorting', 'Consider multiple smaller containers', 'Check for hazardous material restrictions']
    }
  ];

  const homeownerBenefits = [
    {
      title: 'Driveway-Friendly Delivery',
      description: 'Protection boards included to prevent driveway damage',
      icon: Home
    },
    {
      title: 'Flexible Rental Periods',
      description: 'Standard 7-day rental with easy extensions available',
      icon: Calendar
    },
    {
      title: 'Transparent Pricing',
      description: 'All-inclusive pricing with no hidden fees',
      icon: DollarSign
    },
    {
      title: 'Same-Day Service',
      description: 'Quick delivery for urgent projects',
      icon: Clock
    },
    {
      title: 'Eco-Friendly Disposal',
      description: 'Responsible recycling and disposal practices',
      icon: Shield
    },
    {
      title: 'Expert Guidance',
      description: 'Help choosing the right size and permits assistance',
      icon: HelpCircle
    }
  ];

  const prohibitedItems = [
    'Hazardous chemicals & paint',
    'Tires & car batteries',
    'Medical waste',
    'Asbestos materials',
    'Propane tanks',
    'Electronics (check e-waste)',
    'Refrigerators with freon',
    'Hot water tanks'
  ];

  const acceptedItems = [
    'Household furniture',
    'Construction debris',
    'Yard waste & branches',
    'Appliances (freon-free)',
    'Carpet & flooring',
    'Drywall & lumber',
    'Roofing shingles',
    'Concrete (weight limits)'
  ];

  const faqs = [
    {
      question: 'How do I know what size dumpster I need?',
      answer: 'Our size calculator helps you choose based on your project type. Generally: 10-yard for small cleanouts, 15-yard for renovations, 20-yard for large projects.'
    },
    {
      question: 'Do I need a permit for a dumpster?',
      answer: 'Permits are typically only required if placing the dumpster on public property (street). Driveway placement usually doesn\'t require permits.'
    },
    {
      question: 'How much does a dumpster rental cost?',
      answer: 'Prices start at $295 for a 10-yard dumpster with 7-day rental. Final cost depends on size, location, and debris type.'
    },
    {
      question: 'What happens if I need it longer than 7 days?',
      answer: 'Extensions are available for $10-15 per day. Just call us before your rental period ends.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Dumpster Rental for Homeowners
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Simple, affordable waste removal for home projects. From small cleanouts to major renovations, 
              we make it easy to get rid of your debris.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
              >
                Get Instant Quote
              </button>
              <Link
                href="/dumpster-sizes"
                className="px-8 py-4 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition border-2 border-white/50 flex items-center justify-center gap-2"
              >
                <Ruler className="h-5 w-5" />
                Size Calculator
              </Link>
            </div>
            <p className="mt-6 text-white/80 text-sm">
              ⚡ Most deliveries within 24 hours • 📞 7-day support • ✓ No hidden fees
            </p>
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveCalculator(activeCalculator === 'size' ? null : 'size')}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                activeCalculator === 'size' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Calculator className="h-5 w-5" />
              Size Calculator
            </button>
            <button
              onClick={() => setActiveCalculator(activeCalculator === 'cost' ? null : 'cost')}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                activeCalculator === 'cost' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Cost Estimator
            </button>
            <Link
              href="/resources"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5" />
              Rental Guide
            </Link>
            <a
              href="/dumpster-rental-checklist.pdf"
              download
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Free Checklist
            </a>
          </div>

          {/* Calculator Dropdowns */}
          {activeCalculator === 'size' && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Quick Size Calculator</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select className="w-full px-3 py-2 border rounded">
                    <option>Home Renovation</option>
                    <option>Spring Cleaning</option>
                    <option>Landscaping</option>
                    <option>Moving/Estate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rooms/Area</label>
                  <select className="w-full px-3 py-2 border rounded">
                    <option>1-2 rooms</option>
                    <option>3-4 rooms</option>
                    <option>Whole house</option>
                    <option>Garage/Basement</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
                    Recommend Size →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeCalculator === 'cost' && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Quick Cost Estimator</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dumpster Size</label>
                  <select className="w-full px-3 py-2 border rounded">
                    <option>10 Yard - $295</option>
                    <option>15 Yard - $345</option>
                    <option>20 Yard - $395</option>
                    <option>30 Yard - $495</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rental Period</label>
                  <select className="w-full px-3 py-2 border rounded">
                    <option>7 days (included)</option>
                    <option>10 days (+$45)</option>
                    <option>14 days (+$105)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="w-full p-3 bg-white border rounded text-center">
                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                    <p className="text-2xl font-bold text-primary">$345</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Sizes for Homeowners */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Popular Sizes for Homeowners</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We offer the perfect size for every home project. All rentals include delivery, pickup, and 7-day rental period.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {residentialSizes.map((item) => (
              <div 
                key={item.size}
                className={`bg-white border rounded-lg p-6 hover:shadow-lg transition relative ${
                  item.recommended ? 'border-primary shadow-md' : ''
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">{item.size} Dumpster</h3>
                  <p className="text-primary font-semibold text-lg">{item.pricing}</p>
                  <p className="text-muted-foreground text-sm">{item.dimensions}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="font-medium text-sm mb-1">Holds</p>
                    <p className="text-sm text-muted-foreground">{item.capacity} • {item.weight}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Perfect For</p>
                    <p className="text-sm text-muted-foreground">{item.idealFor}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Common Projects</p>
                    <ul className="text-sm text-muted-foreground">
                      {item.projects.map((project, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                          <span>{project}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.features?.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
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
              View All Sizes & Detailed Specs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Common Home Projects */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Common Home Projects</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectTypes.map((project) => {
              const Icon = project.icon;
              return (
                <div key={project.name} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  <p className="text-sm font-medium mb-3">
                    Recommended: <span className="text-primary">{project.commonSize}</span>
                  </p>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium mb-2">Pro Tips:</p>
                    <ul className="space-y-1">
                      {project.tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Can/Can't Go In */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Can & Can't Go In Your Dumpster</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Accepted Items</h3>
              </div>
              <ul className="space-y-2">
                {acceptedItems.map((item) => (
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
                {prohibitedItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-medium">Have prohibited items to dispose?</p>
                  <p className="text-blue-800 text-sm mt-1">
                    We can help you find local recycling centers and proper disposal facilities for hazardous materials, 
                    electronics, and other special items. Just ask when you call!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Homeowners Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Homeowners Choose Us</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We make dumpster rental simple and stress-free for homeowners. No surprises, just reliable service.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeownerBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rental Process */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Choose Your Size</h3>
              <p className="text-sm text-muted-foreground">
                Use our calculator or call for expert sizing advice
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Schedule Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Pick your date, we'll deliver to your driveway
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Fill It Up</h3>
              <p className="text-sm text-muted-foreground">
                Take your time - you have 7 days included
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">We Haul Away</h3>
              <p className="text-sm text-muted-foreground">
                Call for pickup, we handle disposal properly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              View All FAQs & Resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Free Resources */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Free Homeowner Resources</h2>
          <p className="text-xl mb-8 text-gray-300">
            Download our free guides to make your project easier
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <Download className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Project Checklist</h3>
              <p className="text-sm text-gray-400 mb-3">
                Step-by-step guide for your rental
              </p>
              <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium">
                Download PDF →
              </a>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <Calculator className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Size Calculator</h3>
              <p className="text-sm text-gray-400 mb-3">
                Find the perfect size for your project
              </p>
              <Link href="/dumpster-sizes" className="text-primary hover:text-primary/80 text-sm font-medium">
                Use Calculator →
              </Link>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Price Guide</h3>
              <p className="text-sm text-gray-400 mb-3">
                Compare costs and save money
              </p>
              <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium">
                View Guide →
              </a>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            Join 15,000+ homeowners who receive our weekly tips newsletter
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Home Project?</h2>
          <p className="text-xl mb-8 text-white/90">
            Get your dumpster delivered tomorrow. Simple pricing, no hidden fees, friendly service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Instant Quote
            </button>
            <a
              href="tel:1-888-555-0123"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50 flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call 1-888-555-0123
            </a>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            96% customer satisfaction • 3,200+ providers • 150+ cities served
          </p>
        </div>
      </section>

      {/* Quote Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{ customerType: 'residential' }}
        startAtStep={1}
      />
    </div>
  );
}