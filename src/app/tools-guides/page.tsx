import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { Calculator, Home, Trash2, CheckCircle, AlertCircle, ArrowRight, Phone, MessageSquare, DollarSign, Ruler, Package, Info, FileText, HelpCircle, Users, Scale } from 'lucide-react';
import Link from 'next/link';
import CallCta from '@/components/CallCta';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Tools & Guides - Dumpster Rental Resources',
    description: 'Helpful tools and guides for dumpster rental. Find size calculators, cost estimators, rental guides, FAQs, and expert tips for your project.',
    keywords: ['dumpster rental guide', 'waste management resources', 'container rental help', 'size calculator', 'cost estimator']
  });
}

export default function ResourcesPage() {
  // Resource sections for the hub
  const resourceSections = [
    {
      title: 'Planning Tools',
      description: 'Calculate sizes and estimate costs for your project',
      icon: Calculator,
      resources: [
        {
          title: 'Size Calculator',
          description: 'Find the perfect dumpster size for your specific project type and scope',
          href: '/tools-guides/size-calculator',
          icon: Ruler
        },
        {
          title: 'Cost Estimator',
          description: 'Get accurate pricing estimates based on size, location, and project details',
          href: '/tools-guides/cost-estimator', 
          icon: DollarSign
        }
      ]
    },
    {
      title: 'Expert Guides',
      description: 'Comprehensive guides for successful rentals',
      icon: FileText,
      resources: [
        {
          title: 'Rental Guide',
          description: 'Complete step-by-step guide to renting a dumpster for the first time',
          href: '/tools-guides/rental-guide',
          icon: Package
        },
        {
          title: 'Pricing Guide',
          description: 'Understand dumpster rental costs and factors that affect pricing',
          href: '/tools-guides/pricing-guide',
          icon: Scale
        },
        {
          title: 'Prohibited Items',
          description: 'What you can and cannot put in your dumpster rental',
          href: '/tools-guides/prohibited-items',
          icon: AlertCircle
        }
      ]
    },
    {
      title: 'Help & Support',
      description: 'Get answers and expert assistance',
      icon: HelpCircle,
      resources: [
        {
          title: 'Frequently Asked Questions',
          description: 'Quick answers to the most common dumpster rental questions',
          href: '/tools-guides/faq',
          icon: MessageSquare
        }
      ]
    }
  ];

  const quickGuides = [
    {
      title: 'First Time Renter?',
      description: 'Everything you need to know for your first dumpster rental',
      steps: ['Choose size', 'Schedule delivery', 'Load debris', 'We pick up'],
      cta: 'Read Complete Guide',
      href: '/tools-guides/rental-guide'
    },
    {
      title: 'Not Sure What Size?',
      description: 'Use our interactive calculator to find the perfect fit',
      steps: ['Select project type', 'Enter details', 'Get recommendation', 'Book online'],
      cta: 'Calculate Size',
      href: '/tools-guides/size-calculator'
    },
    {
      title: 'Want to Know Cost?',
      description: 'Get accurate pricing for your specific project',
      steps: ['Choose location', 'Select size', 'Add details', 'See pricing'],
      cta: 'Estimate Cost',
      href: '/tools-guides/cost-estimator'
    }
  ];

  const popularQuestions = [
    {
      question: "What size dumpster do I need?",
      answer: "Size depends on your project. Use our size calculator for a personalized recommendation.",
      link: "/tools-guides/size-calculator"
    },
    {
      question: "How much does a dumpster rental cost?",
      answer: "Costs vary by size and location. Our cost estimator provides accurate pricing.",
      link: "/tools-guides/cost-estimator"
    },
    {
      question: "What can't I put in a dumpster?",
      answer: "Hazardous materials, electronics, and certain chemicals are prohibited.",
      link: "/tools-guides/prohibited-items"
    },
    {
      question: "How long can I keep the dumpster?",
      answer: "Standard rental includes 7 days, with flexible extension options available.",
      link: "/tools-guides/rental-guide"
    }
  ];

  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: popularQuestions
  });

  return (
    <>
      <HeaderToneSetter tone="secondary" />
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Tools & Guides
              </h1>
              <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                Everything you need to know about dumpster rentals. Find calculators, guides, FAQs, and expert tips to make your project a success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools-guides/size-calculator"
                  className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
                >
                  Size Calculator
                </Link>
                <Link
                  href="/tools-guides/cost-estimator"
                  className="px-8 py-4 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-5 w-5" />
                  Cost Estimator
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Get Started Quickly</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Jump straight to what you need most
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {quickGuides.map((guide) => (
                <div key={guide.title} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold mb-3">{guide.title}</h3>
                  <p className="text-muted-foreground mb-4">{guide.description}</p>
                  <ol className="space-y-1 mb-6">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={guide.href}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80"
                  >
                    {guide.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resource Sections */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Complete Resource Library</h2>
            
            <div className="space-y-12">
              {resourceSections.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-3 mb-6">
                    <section.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-2xl font-bold">{section.title}</h3>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.resources.map((resource) => (
                      <Link
                        key={resource.title}
                        href={resource.href}
                        className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group"
                      >
                        <div className="flex items-start gap-4">
                          <resource.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold mb-2 group-hover:text-primary transition">
                              {resource.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {resource.description}
                            </p>
                            <span className="text-sm text-primary font-medium group-hover:gap-2 transition-all inline-flex items-center gap-1">
                              Learn More <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links to Dumpster Sizes */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Popular Resources</h2>
              <p className="text-muted-foreground">Quick access to our most helpful guides</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/dumpster-sizes"
                className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <Ruler className="h-8 w-8" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Complete Size Guide</h3>
                    <p className="text-white/90 mb-3">
                      Detailed breakdown of all dumpster sizes with dimensions, capacity, and project recommendations
                    </p>
                    <span className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                      View Size Guide <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
              
              <Link
                href="/tools-guides/faq"
                className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg p-6 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <HelpCircle className="h-8 w-8" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Frequently Asked Questions</h3>
                    <p className="text-white/90 mb-3">
                      Get instant answers to the most common questions about dumpster rentals
                    </p>
                    <span className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                      Browse FAQs <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Questions */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Answers</h2>
            
            <div className="space-y-4">
              {popularQuestions.map((qa) => (
                <div key={qa.question} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="font-bold mb-2">{qa.question}</h3>
                  <p className="text-muted-foreground mb-3">{qa.answer}</p>
                  <Link
                    href={qa.link}
                    className="text-primary font-medium text-sm hover:text-primary/80 inline-flex items-center gap-1"
                  >
                    Learn More <ArrowRight className="h-3 w-3" />
                  </Link>
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
              Use our tools and guides to plan your perfect dumpster rental
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools-guides/size-calculator"
                className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Calculate Size
              </Link>
              <Link
                href="/tools-guides/cost-estimator"
                className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition"
              >
                Get Pricing
              </Link>
              <CallCta variant="dark" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}