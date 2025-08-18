'use client';

import { useConfig } from '@/contexts/ConfigContext';
import { Search, Users, MessageSquare, CheckCircle, Star, Shield, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const { config } = useConfig();

  // Niche-specific content
  const getNicheContent = () => {
    const niche = config?.niche || 'general';

    const content: Record<string, any> = {
      'dumpster-rental': {
        title: 'Rent a Dumpster in 4 Simple Steps',
        subtitle: 'From quote to pickup, we make waste management easy',
        steps: [
          {
            icon: Search,
            title: 'Search & Compare',
            description: 'Enter your ZIP code and project details. Compare sizes, prices, and availability from local providers.',
            details: ['10, 20, 30, 40 yard options', 'Same-day availability', 'Transparent pricing']
          },
          {
            icon: MessageSquare,
            title: 'Get Instant Quotes',
            description: 'Receive quotes from multiple providers. No hidden fees, no surprises.',
            details: ['Free quotes', 'Price match guarantee', 'All-inclusive pricing']
          },
          {
            icon: CheckCircle,
            title: 'Book & Schedule',
            description: 'Choose your provider and schedule delivery. Most deliveries within 24 hours.',
            details: ['Flexible rental periods', 'Easy extensions', 'Weekend delivery available']
          },
          {
            icon: Star,
            title: 'Review & Rate',
            description: 'After pickup, rate your experience to help others make informed decisions.',
            details: ['Verified reviews', 'Photo uploads', 'Response from providers']
          }
        ],
        faqs: [
          { q: 'What size dumpster do I need?', a: '10-yard for small cleanouts, 20-yard for renovations, 30-yard for construction, 40-yard for large demolitions.' },
          { q: 'What can I put in a dumpster?', a: 'Most household and construction debris. Restrictions apply for hazardous materials, tires, and electronics.' },
          { q: 'How long can I keep the dumpster?', a: 'Standard rentals are 7-10 days. Extensions available for a daily fee.' }
        ]
      },
      'home-services': {
        title: 'Get Your Home Project Done Right',
        subtitle: 'Connect with trusted professionals in minutes',
        steps: [
          {
            icon: Search,
            title: 'Describe Your Project',
            description: 'Tell us what you need done. Be specific about your requirements and timeline.',
            details: ['Emergency services available', 'All trades covered', 'Licensed professionals only']
          },
          {
            icon: Users,
            title: 'Receive Multiple Bids',
            description: 'Pre-screened professionals review your project and submit competitive bids.',
            details: ['Background checked', 'Insurance verified', 'Customer rated']
          },
          {
            icon: MessageSquare,
            title: 'Compare & Choose',
            description: 'Review profiles, ratings, and prices. Message providers directly with questions.',
            details: ['See past work photos', 'Read verified reviews', 'Check credentials']
          },
          {
            icon: CheckCircle,
            title: 'Get It Done',
            description: 'Hire your chosen professional. Pay securely through the platform when satisfied.',
            details: ['Satisfaction guarantee', 'Secure payments', 'Dispute resolution']
          }
        ],
        faqs: [
          { q: 'Are the professionals licensed?', a: 'Yes, we verify licenses, insurance, and credentials for all service providers.' },
          { q: 'What if I\'m not satisfied?', a: 'We offer a satisfaction guarantee and dispute resolution service.' },
          { q: 'How quickly can someone come?', a: 'Many providers offer same-day or next-day service for urgent needs.' }
        ]
      },
      'general': {
        title: 'How It Works',
        subtitle: 'Finding the right service provider is easy with our platform',
        steps: [
          {
            icon: Search,
            title: 'Search',
            description: 'Find service providers in your area by category, location, or specific needs.',
            details: ['Thousands of providers', 'All service types', 'Near you']
          },
          {
            icon: Users,
            title: 'Compare',
            description: 'Read reviews, compare prices, and check credentials all in one place.',
            details: ['Verified reviews', 'Transparent pricing', 'Quality guaranteed']
          },
          {
            icon: MessageSquare,
            title: 'Connect',
            description: 'Contact providers directly or request quotes from multiple businesses.',
            details: ['Direct messaging', 'Fast responses', 'No middleman fees']
          },
          {
            icon: CheckCircle,
            title: 'Hire',
            description: 'Choose the best provider for your needs and get your project completed.',
            details: ['Secure booking', 'Protected payments', 'Satisfaction guaranteed']
          }
        ],
        faqs: [
          { q: 'Is it free to use?', a: 'Yes, searching and requesting quotes is completely free for customers.' },
          { q: 'How do you verify providers?', a: 'We verify business licenses, insurance, and collect customer reviews.' },
          { q: 'What if something goes wrong?', a: 'We offer customer support and dispute resolution services.' }
        ]
      }
    };

    return content[niche] || content.general;
  };

  const nicheContent = getNicheContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {nicheContent.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {nicheContent.subtitle}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {nicheContent.steps.map((step: any, index: number) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < nicheContent.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-primary/20 -z-10" />
                )}

                <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-1">
                    {step.details.map((detail: string, i: number) => (
                      <li key={i} className="flex items-start text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose {config?.siteName || 'Our Platform'}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All service providers are verified for licenses, insurance, and customer satisfaction
              </p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">
                Get multiple quotes in minutes, not days. Compare everything in one place
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competition drives better pricing. Get the best value for your project
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {nicheContent.faqs.map((faq: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied customers who found their perfect service provider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/directory"
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Find a Provider
            </Link>
            <Link
              href="/for-business"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
