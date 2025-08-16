'use client';

import { useState } from 'react';
import { Building, Building2, Truck, Calendar, Shield, Clock, Package, CheckCircle, ArrowRight, Phone, Users, Briefcase, Award, Calculator, Hammer, Home } from 'lucide-react';
import Link from 'next/link';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';

export default function CommercialPage() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const commercialSizes = [
    {
      size: '20 Yard',
      dimensions: '22\' L × 8\' W × 5\' H',
      capacity: '10 pickup truck loads',
      weight: '3-4 tons',
      idealFor: 'Office cleanouts, retail renovations',
      projects: ['Office remodeling', 'Retail buildouts', 'Restaurant renovations', 'Small construction'],
      features: ['Same-day delivery', 'Flexible scheduling']
    },
    {
      size: '30 Yard',
      dimensions: '22\' L × 8\' W × 6\' H',
      capacity: '15 pickup truck loads',
      weight: '4-5 tons',
      idealFor: 'Construction sites, large renovations',
      projects: ['Commercial construction', 'Multi-office cleanout', 'Warehouse cleanup', 'Demolition'],
      features: ['Extended rental periods', 'Multiple container discounts'],
      popular: true
    },
    {
      size: '40 Yard',
      dimensions: '22\' L × 8\' W × 8\' H',
      capacity: '20 pickup truck loads',
      weight: '5-6 tons',
      idealFor: 'Major construction, industrial projects',
      projects: ['New construction', 'Industrial demolition', 'Large-scale renovations', 'Manufacturing waste'],
      features: ['High-volume capacity', 'Heavy debris approved'],
      recommended: true
    }
  ];

  const industries = [
    {
      name: 'Construction',
      icon: Building,
      description: 'Daily waste removal for active job sites',
      services: ['Multiple containers', 'Scheduled swaps', 'LEED compliance']
    },
    {
      name: 'Property Management',
      icon: Building2,
      description: 'Tenant turnover and property maintenance',
      services: ['On-demand service', 'Volume pricing', 'Multiple properties']
    },
    {
      name: 'Retail & Restaurants',
      icon: Briefcase,
      description: 'Remodeling and ongoing waste management',
      services: ['After-hours service', 'Grease trap disposal', 'Recycling programs']
    },
    {
      name: 'Manufacturing',
      icon: Package,
      description: 'Industrial waste and material disposal',
      services: ['Specialized containers', 'Hazmat certified', 'Custom scheduling']
    }
  ];

  const benefits = [
    {
      title: 'Dedicated Account Management',
      description: 'Single point of contact for all your waste management needs',
      icon: Users
    },
    {
      title: 'Flexible Rental Terms',
      description: 'Short-term, long-term, and permanent placement options',
      icon: Calendar
    },
    {
      title: 'Priority Service',
      description: 'Same-day and next-day delivery for urgent projects',
      icon: Clock
    },
    {
      title: 'Compliance & Documentation',
      description: 'Complete waste tracking and disposal certificates',
      icon: Shield
    },
    {
      title: 'Volume Discounts',
      description: 'Competitive pricing for multiple containers and long-term contracts',
      icon: Award
    },
    {
      title: 'National Coverage',
      description: 'Service available across multiple locations for chain businesses',
      icon: Truck
    }
  ];

  const rentalOptions = [
    {
      type: 'Temporary Rentals',
      duration: '1-30 days',
      best: 'Construction projects, renovations, cleanouts',
      features: ['Flexible pickup', 'Extension options', 'Project-based pricing']
    },
    {
      type: 'Long-Term Rentals',
      duration: '1-12 months',
      best: 'Ongoing construction, seasonal businesses',
      features: ['Monthly billing', 'Scheduled swaps', 'Dedicated containers']
    },
    {
      type: 'Permanent Placement',
      duration: 'Ongoing service',
      best: 'Manufacturing, retail, property management',
      features: ['Regular pickup schedule', 'Account management', 'Custom solutions']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Commercial Dumpster Rental Solutions
            </h1>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Reliable waste management for businesses, contractors, and industrial facilities. 
              Flexible terms, competitive pricing, and dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition shadow-lg"
              >
                Get Commercial Quote
              </button>
              <a
                href="tel:1-888-555-0123"
                className="px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold text-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call for Volume Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Sizes */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Commercial Dumpster Sizes</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From office cleanouts to major construction projects. Multiple containers available for large jobs.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {commercialSizes.map((item) => (
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
                  <h3 className="text-2xl font-bold mb-2">{item.size} Container</h3>
                  <p className="text-muted-foreground text-sm">{item.dimensions}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="font-medium text-sm mb-1">Capacity</p>
                    <p className="text-sm text-muted-foreground">{item.capacity} • {item.weight}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Ideal For</p>
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
                    Request Quote
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
              View Complete Size Guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Industries We Serve</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <div key={industry.name} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2">{industry.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{industry.description}</p>
                  <ul className="space-y-1">
                    {industry.services.map((service, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rental Options */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Flexible Rental Options</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {rentalOptions.map((option) => (
              <div key={option.type} className="border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">{option.type}</h3>
                <p className="text-primary font-semibold mb-3">{option.duration}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">Best for:</span> {option.best}
                </p>
                <ul className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose Us for Commercial Service</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Trusted by thousands of businesses nationwide for reliable, compliant waste management solutions.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
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

      {/* Volume Calculator */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Calculator className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Need Multiple Containers?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Get custom pricing for large projects and ongoing service contracts. 
            Save up to 30% with volume discounts.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">5+</p>
              <p className="text-sm text-gray-400">Containers</p>
              <p className="text-lg font-semibold">10% Discount</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">10+</p>
              <p className="text-sm text-gray-400">Containers</p>
              <p className="text-lg font-semibold">20% Discount</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">20+</p>
              <p className="text-sm text-gray-400">Containers</p>
              <p className="text-lg font-semibold">30% Discount</p>
            </div>
          </div>
          <button
            onClick={() => setQuoteModalOpen(true)}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Get Volume Quote
          </button>
        </div>
      </section>

      {/* Contractor Section */}
      <section id="contractors" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Special Contractor Rates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Contractors get priority service and volume discounts. Same-day delivery available.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-3">Contractor Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>10-20% volume discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>NET 30 payment terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Priority delivery & pickup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Dedicated phone line</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-3">Project Types We Serve</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-primary mt-0.5" />
                  <span>New construction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-primary mt-0.5" />
                  <span>Home renovations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-primary mt-0.5" />
                  <span>Roofing projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Hammer className="h-4 w-4 text-primary mt-0.5" />
                  <span>Demolition work</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-3">Quick Order Hotline</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contractors get priority service on our dedicated line
              </p>
              <a 
                href="tel:1-888-555-0123"
                className="text-2xl font-bold text-primary hover:text-primary/80 transition"
              >
                1-888-555-0123
              </a>
              <p className="text-xs text-muted-foreground mt-2">Press 2 for contractor service</p>
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="w-full mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition text-sm"
              >
                Get Contractor Quote
              </button>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold mb-2">Already working with multiple containers?</p>
            <p className="text-muted-foreground">
              Ask about our high-volume contractor accounts with custom pricing and dedicated account management.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Waste Management?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of businesses and contractors that trust us for reliable, cost-effective dumpster rental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Commercial Quote
            </button>
            <a
              href="tel:1-888-555-0123"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50 flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call for Pricing
            </a>
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