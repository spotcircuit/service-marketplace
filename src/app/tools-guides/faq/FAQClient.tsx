'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Search } from 'lucide-react';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'How does this service work?',
    answer: 'Simply enter your project details and location to receive quotes from verified local service providers. Compare prices, read reviews, and choose the best provider for your needs. It\'s free and takes less than 2 minutes.'
  },
  {
    category: 'General',
    question: 'Is it really free to get quotes?',
    answer: 'Yes! Getting quotes is 100% free for customers. Service providers pay a small fee to receive your lead, but you\'ll never be charged for using our platform to find and compare quotes.'
  },
  {
    category: 'General',
    question: 'How many quotes will I receive?',
    answer: 'Typically, you\'ll receive 3-5 quotes within 24-48 hours. The exact number depends on your location and the type of service you need. We ensure all providers are qualified and available in your area.'
  },
  // Dumpster Rental
  {
    category: 'Dumpster Rental',
    question: 'What size dumpster do I need?',
    answer: 'The size depends on your project. A 10-yard dumpster works for small cleanouts or bathroom remodels. 20-yard is perfect for roof replacements or large room renovations. 30-40 yard dumpsters are for whole-home cleanouts or major construction. Use our size calculator for a personalized recommendation.'
  },
  {
    category: 'Dumpster Rental',
    question: 'Do I need a permit for a dumpster?',
    answer: 'If you place the dumpster on your private property (driveway, yard), you typically don\'t need a permit. However, if it will be on a public street or sidewalk, most cities require a permit. Check with your local municipality or ask your rental provider.'
  },
  {
    category: 'Dumpster Rental',
    question: 'What can\'t I put in a dumpster?',
    answer: 'Prohibited items typically include: hazardous materials (paint, chemicals, oil), tires, batteries, appliances with freon, asbestos, medical waste, and propane tanks. Each company may have additional restrictions, so always confirm before rental.'
  },
  {
    category: 'Dumpster Rental',
    question: 'How long can I keep the dumpster?',
    answer: 'Most rentals include 7-10 days. If you need it longer, you can usually extend for an additional daily fee (typically $5-15/day). Be sure to discuss your timeline when getting quotes.'
  },
  // Pricing
  {
    category: 'Pricing',
    question: 'What factors affect dumpster rental cost?',
    answer: 'Key factors include: dumpster size, rental duration, your location, type of debris, weight of materials, and current demand. Prices typically range from $250-800 depending on these factors.'
  },
  {
    category: 'Pricing',
    question: 'Are there hidden fees?',
    answer: 'Reputable companies are transparent about fees. Always ask about: delivery/pickup fees, overage charges (exceeding weight limits), extended rental fees, and permit costs. Get everything in writing before agreeing to rental.'
  },
  // Service Providers
  {
    category: 'Service Providers',
    question: 'Are the service providers verified?',
    answer: 'Yes! We verify all service providers before they can receive leads. This includes checking business licenses, insurance coverage, and customer reviews. We also monitor performance and remove providers who don\'t meet our standards.'
  },
  {
    category: 'Service Providers',
    question: 'What if I\'m not satisfied with the service?',
    answer: 'While we carefully vet providers, issues can occur. First, communicate directly with the provider to resolve the issue. If that doesn\'t work, contact us and we\'ll help mediate. We also encourage leaving honest reviews to help other customers.'
  },
  {
    category: 'Service Providers',
    question: 'How do I choose between quotes?',
    answer: 'Consider more than just price. Look at: customer reviews and ratings, response time, included services, company experience, and warranty/guarantee offered. The cheapest option isn\'t always the best value.'
  }
];

export default function FAQClient() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/90">
            Find answers to common questions about our services
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => {
                const isOpen = openItems.includes(index);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                          {faq.question}
                        </h3>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-white/90 mb-8">
            Our team is here to help you find the right service provider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-primary/10 transition"
            >
              Contact Support
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