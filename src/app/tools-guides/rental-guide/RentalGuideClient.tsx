'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, Info, FileText, Calculator, Phone, Truck, Calendar, MapPin, Shield, Clock } from 'lucide-react';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';

export default function RentalGuideClient() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  
  const rentalSteps = [
  {
    number: 1,
    title: 'Determine Your Needs',
    icon: Calculator,
    description: 'Assess your project scope and debris type',
    details: [
      'Measure the scope of your project',
      'Identify the type of debris you\'ll have',
      'Estimate the volume of waste',
      'Consider weight restrictions for heavy materials'
    ],
    tips: 'Take photos of your project area to share with rental companies for better estimates'
  },
  {
    number: 2,
    title: 'Choose the Right Size',
    icon: Truck,
    description: 'Select appropriate dumpster size for your project',
    details: [
      '10-yard: Small rooms, garage cleanouts',
      '20-yard: Large rooms, roof replacements',
      '30-yard: Whole home renovations',
      '40-yard: Commercial projects, new construction'
    ],
    tips: 'When in doubt, go one size larger - it\'s better to have extra space than to need a second dumpster'
  },
  {
    number: 3,
    title: 'Check Local Regulations',
    icon: FileText,
    description: 'Verify permit requirements and placement rules',
    details: [
      'Contact your city or county permit office',
      'Check HOA regulations if applicable',
      'Verify street placement requirements',
      'Understand prohibited items in your area'
    ],
    tips: 'Most cities require permits for street placement but not for private driveways'
  },
  {
    number: 4,
    title: 'Get Multiple Quotes',
    icon: Phone,
    description: 'Compare prices and services from different providers',
    details: [
      'Request quotes from 3-5 companies',
      'Ask about all fees upfront',
      'Compare included tonnage and rental periods',
      'Check reviews and verify insurance'
    ],
    tips: 'Ask about "all-in" pricing to avoid surprise fees'
  },
  {
    number: 5,
    title: 'Schedule Delivery',
    icon: Calendar,
    description: 'Coordinate delivery timing and placement',
    details: [
      'Schedule 24-48 hours in advance',
      'Clear the delivery area',
      'Ensure adequate space for truck access',
      'Place wood boards to protect driveway if needed'
    ],
    tips: 'Mark the exact placement spot with cones or chalk to ensure proper positioning'
  },
  {
    number: 6,
    title: 'Load Properly',
    icon: Shield,
    description: 'Fill the dumpster safely and efficiently',
    details: [
      'Distribute weight evenly',
      'Break down large items',
      'Don\'t overfill past the top edge',
      'Keep prohibited items separate'
    ],
    tips: 'Load heavy items first and fill gaps with smaller debris to maximize space'
  },
  {
    number: 7,
    title: 'Schedule Pickup',
    icon: Clock,
    description: 'Arrange for timely removal',
    details: [
      'Call 24 hours before you need pickup',
      'Ensure dumpster is accessible',
      'Check that nothing extends above the sides',
      'Remove any prohibited items'
    ],
    tips: 'Take photos before pickup to document the condition and fill level'
  }
];

const commonMistakes = [
  {
    mistake: 'Choosing the wrong size',
    consequence: 'Extra costs for second dumpster or overage fees',
    solution: 'Use our size calculator or consult with rental company'
  },
  {
    mistake: 'Not checking for permits',
    consequence: 'Fines and forced relocation of dumpster',
    solution: 'Call city offices before ordering'
  },
  {
    mistake: 'Placing prohibited items',
    consequence: 'Additional fees and disposal complications',
    solution: 'Review prohibited items list carefully'
  },
  {
    mistake: 'Overfilling the dumpster',
    consequence: 'Driver may refuse pickup or charge extra fees',
    solution: 'Keep debris level with or below the top edge'
  },
  {
    mistake: 'Ignoring weight limits',
    consequence: 'Significant overage charges',
    solution: 'Be mindful of heavy materials like concrete and dirt'
  }
];

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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Complete Dumpster Rental Guide
          </h1>
          <p className="text-xl text-white/90">
            Everything you need to know from start to finish
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Simple Steps</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24-48</div>
              <div className="text-sm text-gray-600">Hour Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">7-10</div>
              <div className="text-sm text-gray-600">Days Included</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">$250+</div>
              <div className="text-sm text-gray-600">Average Cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Step-by-Step Rental Process
          </h2>
          
          <div className="space-y-8">
            {rentalSteps.map((step) => (
              <div key={step.number} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.number}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center mb-2">
                        <step.icon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Actions:</h4>
                        <ul className="space-y-2">
                          {step.details.map((detail, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-start bg-blue-50 rounded-lg p-3">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          <strong>Pro Tip:</strong> {step.tips}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common Mistakes to Avoid
          </h2>
          
          <div className="space-y-4">
            {commonMistakes.map((item, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      {item.mistake}
                    </h3>
                    <p className="text-red-700 text-sm mb-3">
                      <strong>Consequence:</strong> {item.consequence}
                    </p>
                    <p className="text-green-700 text-sm">
                      <strong>Solution:</strong> {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Reference Guide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Before Ordering</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Measure your project area</li>
                <li>✓ Check local permit requirements</li>
                <li>✓ Clear the delivery location</li>
                <li>✓ Get multiple quotes</li>
                <li>✓ Verify insurance coverage</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">During Rental</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Load heavy items first</li>
                <li>✓ Distribute weight evenly</li>
                <li>✓ Keep below fill line</li>
                <li>✓ Separate prohibited items</li>
                <li>✓ Document with photos</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Important Numbers</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>📞 Rental company contact</li>
                <li>📞 Local permit office</li>
                <li>📞 Emergency removal</li>
                <li>📞 Hazardous waste disposal</li>
                <li>📞 Recycling center</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Rent a Dumpster?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Use our tools and get quotes from verified providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools-guides/size-calculator"
              className="px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-primary/10 transition"
            >
              Size Calculator
            </Link>
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition"
            >
              Get Quotes Now
            </button>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{ dumpsterSize: '20-yard' }}
      />
    </div>
  );
}