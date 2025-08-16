'use client';

import { useConfig } from '@/contexts/ConfigContext';
import { BookOpen, Calculator, FileText, HelpCircle, Download, Video, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesPage() {
  const { config } = useConfig();

  // Niche-specific resources
  const getNicheResources = () => {
    const niche = config?.niche || 'general';

    const resources: Record<string, any> = {
      'dumpster-rental': {
        title: 'Dumpster Rental Resources & Guides',
        subtitle: 'Everything you need to know about renting dumpsters and managing waste',
        guides: [
          {
            icon: Calculator,
            title: 'Dumpster Size Calculator',
            description: 'Find the right size dumpster for your project with our interactive calculator',
            link: '/resources/size-calculator',
            tag: 'Interactive Tool'
          },
          {
            icon: FileText,
            title: 'Complete Rental Guide',
            description: 'Step-by-step guide to renting a dumpster, from sizing to permits',
            link: '/resources/rental-guide',
            tag: 'Comprehensive Guide'
          },
          {
            icon: BookOpen,
            title: 'Pricing Guide 2025',
            description: 'Average costs by size, location, and duration. Know what to expect',
            link: '/resources/pricing-guide',
            tag: 'Cost Analysis'
          },
          {
            icon: HelpCircle,
            title: 'What Can I Throw Away?',
            description: 'Complete list of acceptable and prohibited items for dumpster rental',
            link: '/resources/prohibited-items',
            tag: 'Safety Guide'
          }
        ],
        articles: [
          { title: '10 Tips for First-Time Dumpster Renters', category: 'Tips', readTime: '5 min' },
          { title: 'How to Save Money on Dumpster Rental', category: 'Cost Saving', readTime: '7 min' },
          { title: 'Construction Debris Disposal Guide', category: 'Construction', readTime: '10 min' },
          { title: 'Residential vs Commercial Dumpsters', category: 'Comparison', readTime: '6 min' },
          { title: 'Permit Requirements by State', category: 'Legal', readTime: '8 min' },
          { title: 'Eco-Friendly Waste Disposal Tips', category: 'Environment', readTime: '5 min' }
        ],
        tools: [
          { name: 'Weight Estimator', description: 'Estimate debris weight to avoid overage fees' },
          { name: 'Permit Checker', description: 'Check if you need a permit in your area' },
          { name: 'Project Planner', description: 'Plan your renovation with waste management in mind' }
        ],
        stats: [
          { label: 'Average Rental Duration', value: '7 days' },
          { label: 'Most Popular Size', value: '20 yard' },
          { label: 'Average Cost', value: '$380' },
          { label: 'Customer Satisfaction', value: '94%' }
        ]
      },
      'home-services': {
        title: 'Home Services Resources',
        subtitle: 'Guides, tips, and tools for home improvement and maintenance',
        guides: [
          {
            icon: Calculator,
            title: 'Project Cost Estimator',
            description: 'Get accurate estimates for common home improvement projects',
            link: '/resources/cost-estimator',
            tag: 'Interactive Tool'
          },
          {
            icon: FileText,
            title: 'Hiring Guide',
            description: 'How to hire contractors, what to ask, and red flags to avoid',
            link: '/resources/hiring-guide',
            tag: 'Essential Reading'
          },
          {
            icon: Award,
            title: 'Contractor Checklist',
            description: 'Verify licenses, insurance, and credentials before hiring',
            link: '/resources/contractor-checklist',
            tag: 'Safety First'
          },
          {
            icon: BookOpen,
            title: 'Seasonal Maintenance Guide',
            description: 'Year-round home maintenance schedule to prevent costly repairs',
            link: '/resources/maintenance-schedule',
            tag: 'Preventive Care'
          }
        ],
        articles: [
          { title: 'Spring Home Maintenance Checklist', category: 'Seasonal', readTime: '8 min' },
          { title: 'How to Avoid Contractor Scams', category: 'Safety', readTime: '10 min' },
          { title: 'DIY vs Professional: When to Call a Pro', category: 'Decision Guide', readTime: '7 min' },
          { title: 'Understanding Contractor Estimates', category: 'Finance', readTime: '6 min' },
          { title: 'Emergency Home Repairs Guide', category: 'Emergency', readTime: '5 min' },
          { title: 'Energy Efficiency Improvements ROI', category: 'Investment', readTime: '9 min' }
        ],
        tools: [
          { name: 'ROI Calculator', description: 'Calculate return on home improvements' },
          { name: 'Permit Guide', description: 'Which projects need permits in your area' },
          { name: 'Emergency Contacts', description: 'Build your emergency contractor list' }
        ],
        stats: [
          { label: 'Average Project Cost', value: '$3,750' },
          { label: 'ROI on Kitchen Remodel', value: '85%' },
          { label: 'Most Common Service', value: 'Plumbing' },
          { label: 'Customer Savings', value: '20-30%' }
        ]
      },
      'general': {
        title: 'Resources & Guides',
        subtitle: 'Expert advice and tools to help you make informed decisions',
        guides: [
          {
            icon: BookOpen,
            title: 'Service Provider Guide',
            description: 'How to choose the right service provider for your needs',
            link: '/resources/provider-guide',
            tag: 'Getting Started'
          },
          {
            icon: Calculator,
            title: 'Cost Comparison Tool',
            description: 'Compare service costs in your area',
            link: '/resources/cost-comparison',
            tag: 'Save Money'
          },
          {
            icon: FileText,
            title: 'Service Agreements 101',
            description: 'Understanding contracts and service agreements',
            link: '/resources/agreements',
            tag: 'Legal Guide'
          },
          {
            icon: HelpCircle,
            title: 'FAQ Center',
            description: 'Answers to commonly asked questions',
            link: '/resources/faq',
            tag: 'Help Center'
          }
        ],
        articles: [
          { title: 'How to Get the Best Service Quotes', category: 'Tips', readTime: '5 min' },
          { title: 'Understanding Service Guarantees', category: 'Legal', readTime: '7 min' },
          { title: 'Seasonal Service Planning Guide', category: 'Planning', readTime: '6 min' },
          { title: 'Budget-Friendly Service Tips', category: 'Savings', readTime: '5 min' },
          { title: 'Emergency Service Protocol', category: 'Emergency', readTime: '4 min' },
          { title: 'Service Quality Checklist', category: 'Quality', readTime: '6 min' }
        ],
        tools: [
          { name: 'Quote Comparison', description: 'Compare multiple service quotes side-by-side' },
          { name: 'Service Scheduler', description: 'Plan and schedule services efficiently' },
          { name: 'Budget Planner', description: 'Plan your service budget for the year' }
        ],
        stats: [
          { label: 'Providers Listed', value: '3,200+' },
          { label: 'Cities Covered', value: '150+' },
          { label: 'Quotes Requested', value: '15,000+' },
          { label: 'Satisfaction Rate', value: '96%' }
        ]
      }
    };

    return resources[niche] || resources.general;
  };

  const nicheResources = getNicheResources();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {nicheResources.title}
          </h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto">
            {nicheResources.subtitle}
          </p>
        </div>
      </section>

      {/* Main Guides Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Essential Guides & Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {nicheResources.guides.map((guide: any, index: number) => (
              <Link
                key={index}
                href={guide.link}
                className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition">
                    <guide.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold group-hover:text-orange-600 transition">
                        {guide.title}
                      </h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {guide.tag}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {nicheResources.stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Articles & Insights</h2>
            <Link href="/blog" className="text-orange-600 hover:text-orange-700 font-medium">
              View All Articles →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nicheResources.articles.map((article: any, index: number) => (
              <article key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.readTime} read
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 hover:text-orange-600 transition">
                  {article.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Free Tools & Calculators</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {nicheResources.tools.map((tool: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
                <Calculator className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
                <button className="mt-4 text-orange-600 font-medium text-sm hover:text-orange-700">
                  Launch Tool →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <Download className="h-12 w-12 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Free Downloadable Guides
          </h2>
          <p className="text-gray-300 mb-8">
            Get our comprehensive guides delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition">
              Download Buyer's Guide
            </button>
            <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition">
              Download Checklist
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Informed
          </h2>
          <p className="text-orange-100 mb-8">
            Get weekly tips, guides, and industry insights delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg"
            />
            <button className="px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
