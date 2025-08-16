'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Shield,
  Award,
  ArrowRight,
  Filter,
  ChevronDown,
  Building2,
  Users,
  TrendingUp
} from 'lucide-react';
import QuoteRequestModal from '@/components/QuoteRequestModal';

// Service category data with SEO content
const serviceData: Record<string, any> = {
  'dumpster-rental': {
    title: 'Dumpster Rental',
    description: 'Find reliable dumpster rental services near you. Compare prices, sizes, and get free quotes from verified providers.',
    longDescription: 'Whether you\'re renovating your home, cleaning out your garage, or managing a construction site, our network of trusted dumpster rental providers offers the perfect solution for your waste management needs.',
    keywords: ['10 yard dumpster', '20 yard dumpster', '30 yard dumpster', '40 yard dumpster', 'roll off dumpster', 'construction dumpster'],
    benefits: [
      'Same-day and next-day delivery available',
      'Flexible rental periods from 3 to 30 days',
      'All-inclusive pricing with no hidden fees',
      'Eco-friendly disposal and recycling'
    ],
    faqs: [
      {
        question: 'What size dumpster do I need?',
        answer: '10-yard for small cleanouts, 20-yard for medium renovations, 30-yard for large projects, 40-yard for major construction.'
      },
      {
        question: 'How much does dumpster rental cost?',
        answer: 'Prices typically range from $250-$600 depending on size, location, and rental duration.'
      }
    ]
  },
  'junk-removal': {
    title: 'Junk Removal',
    description: 'Professional junk removal services for homes and businesses. Fast, affordable, and eco-friendly disposal.',
    longDescription: 'Our vetted junk removal professionals handle everything from furniture and appliances to yard waste and construction debris. We do all the heavy lifting so you don\'t have to.',
    keywords: ['furniture removal', 'appliance disposal', 'estate cleanout', 'hoarding cleanup', 'yard waste removal', 'office cleanout'],
    benefits: [
      'Full-service removal - we do all the work',
      'Same-day service available',
      'Eco-friendly disposal and donation services',
      'Licensed and insured professionals'
    ],
    faqs: [
      {
        question: 'What items can be removed?',
        answer: 'Almost everything except hazardous materials. This includes furniture, appliances, electronics, yard waste, and construction debris.'
      },
      {
        question: 'How is pricing determined?',
        answer: 'Pricing is typically based on volume (how much space items take in the truck) and starts around $100 for small loads.'
      }
    ]
  },
  'demolition': {
    title: 'Demolition Services',
    description: 'Licensed demolition contractors for residential and commercial projects. Safe, efficient, and fully insured.',
    longDescription: 'From interior demolition to complete structure removal, our network of certified demolition contractors ensures safe, efficient, and compliant project execution.',
    keywords: ['interior demolition', 'selective demolition', 'complete demolition', 'concrete removal', 'pool removal', 'garage demolition'],
    benefits: [
      'Licensed and insured contractors',
      'Proper permits and compliance',
      'Safe asbestos and hazmat handling',
      'Complete debris removal included'
    ],
    faqs: [
      {
        question: 'Do I need permits for demolition?',
        answer: 'Yes, most demolition projects require permits. Our contractors handle the permit process for you.'
      },
      {
        question: 'How long does demolition take?',
        answer: 'Interior demolition: 1-3 days. Complete structure: 1-2 weeks including permits and cleanup.'
      }
    ]
  },
  'construction-cleanup': {
    title: 'Construction Cleanup',
    description: 'Post-construction cleaning services for residential and commercial projects. Leave your site spotless.',
    longDescription: 'Professional construction cleanup services ensure your project site is debris-free, safe, and ready for occupancy or the next phase of work.',
    keywords: ['rough cleanup', 'final cleanup', 'debris removal', 'site cleaning', 'pressure washing', 'window cleaning'],
    benefits: [
      'Phase-based cleanup options',
      'OSHA-compliant safety practices',
      'Recycling and proper disposal',
      'Move-in ready finishing touches'
    ],
    faqs: [
      {
        question: 'What\'s included in construction cleanup?',
        answer: 'Debris removal, sweeping, mopping, window cleaning, fixture cleaning, and final touch-ups.'
      },
      {
        question: 'When should I schedule cleanup?',
        answer: 'Rough cleanup during construction, final cleanup before occupancy or inspection.'
      }
    ]
  }
};

interface Business {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  address: string;
  phone: string;
  is_featured: boolean;
  is_verified: boolean;
  response_time: string;
  price_range: string;
  description: string;
  services: string[];
  years_in_business: number;
  image?: string;
}

export default function ServiceCategoryPage() {
  const params = useParams();
  const serviceSlug = params.service as string;
  const service = serviceData[serviceSlug] || serviceData['dumpster-rental'];
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | undefined>();

  useEffect(() => {
    fetchBusinesses();
  }, [serviceSlug, sortBy, priceFilter]);

  const fetchBusinesses = async () => {
    try {
      // This would be an API call
      // const response = await fetch(`/api/businesses?category=${service.title}&sort=${sortBy}&price=${priceFilter}`);
      // const data = await response.json();
      
      // Mock data for now
      setBusinesses([
        {
          id: '1',
          name: `Premium ${service.title} Co.`,
          rating: 4.9,
          reviews: 234,
          address: '123 Main St, Houston, TX',
          phone: '(555) 123-4567',
          is_featured: true,
          is_verified: true,
          response_time: '1 hour',
          price_range: '$$',
          description: `Leading ${service.title.toLowerCase()} service with 15+ years of experience`,
          services: service.keywords.slice(0, 4),
          years_in_business: 15
        },
        {
          id: '2',
          name: `Quick ${service.title} Solutions`,
          rating: 4.7,
          reviews: 156,
          address: '456 Oak Ave, Dallas, TX',
          phone: '(555) 234-5678',
          is_featured: true,
          is_verified: true,
          response_time: '30 minutes',
          price_range: '$$$',
          description: `Fast and reliable ${service.title.toLowerCase()} for residential and commercial`,
          services: service.keywords.slice(1, 5),
          years_in_business: 8
        },
        {
          id: '3',
          name: `Eco-Friendly ${service.title}`,
          rating: 4.8,
          reviews: 189,
          address: '789 Green Blvd, Austin, TX',
          phone: '(555) 345-6789',
          is_featured: false,
          is_verified: true,
          response_time: '2 hours',
          price_range: '$$',
          description: `Sustainable ${service.title.toLowerCase()} services with environmental focus`,
          services: service.keywords.slice(2, 6),
          years_in_business: 10
        }
      ]);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = (businessId?: string, businessName?: string) => {
    setSelectedBusinessId(businessId);
    setSelectedBusinessName(businessName);
    setQuoteModalOpen(true);
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviews - a.reviews;
      case 'price-low':
        return a.price_range.length - b.price_range.length;
      case 'price-high':
        return b.price_range.length - a.price_range.length;
      default: // featured
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  });

  const filteredBusinesses = sortedBusinesses.filter(business => {
    if (priceFilter === 'all') return true;
    return business.price_range === priceFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {service.title} Services Near You
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {service.description}
            </p>
            
            {/* Quick Quote Button */}
            <button
              onClick={() => handleGetQuote()}
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Get Free Quotes
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Service Benefits */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {service.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 px-4 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredBusinesses.length}+</div>
              <div className="text-sm text-gray-600">Local Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Emergency Service</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Filters:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="$">Budget ($)</option>
                    <option value="$$">Moderate ($$)</option>
                    <option value="$$$">Premium ($$$)</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="featured">Featured First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Listings */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                filteredBusinesses.map((business) => (
                  <div key={business.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                    {business.is_featured && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-sm font-medium">
                        ⭐ FEATURED PROVIDER
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Business Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {business.name}
                              </h2>
                              <div className="flex items-center gap-3 text-sm">
                                {business.is_verified && (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verified
                                  </span>
                                )}
                                <span className="text-gray-600">{business.price_range}</span>
                              </div>
                            </div>
                            {business.years_in_business > 0 && (
                              <div className="text-center">
                                <Award className="h-8 w-8 text-blue-600 mx-auto" />
                                <p className="text-xs text-gray-600 mt-1">
                                  {business.years_in_business} Years
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-4">{business.description}</p>
                          
                          <div className="flex items-center mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(business.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-semibold">{business.rating}</span>
                            <span className="ml-1 text-gray-600">({business.reviews} reviews)</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {business.address}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              Response: {business.response_time}
                            </div>
                          </div>
                          
                          {/* Services */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                            <div className="flex flex-wrap gap-2">
                              {business.services.map((service, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Contact Actions */}
                        <div className="lg:w-48 space-y-3">
                          <a
                            href={`tel:${business.phone}`}
                            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Call Now
                          </a>
                          <button
                            onClick={() => handleGetQuote(business.id, business.name)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Get Free Quote
                          </button>
                          <Link
                            href={`/business/${business.id}`}
                            className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            View Profile
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About {service.title}</h2>
              <p className="text-gray-600 mb-4">{service.longDescription}</p>
              <Link href="/resources" className="text-blue-600 hover:underline text-sm">
                Learn more about {service.title.toLowerCase()} →
              </Link>
            </div>

            {/* Popular Services */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
              <div className="space-y-2">
                {service.keywords.map((keyword: string, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-700">{keyword}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Questions</h3>
              <div className="space-y-4">
                {service.faqs.map((faq: any, index: number) => (
                  <div key={index}>
                    <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need {service.title}?</h3>
              <p className="text-blue-100 mb-4">Get quotes from multiple providers in minutes</p>
              <button
                onClick={() => handleGetQuote()}
                className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-12 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Compare quotes from top-rated {service.title.toLowerCase()} providers
          </p>
          <button
            onClick={() => handleGetQuote()}
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Get Free Quotes Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedBusinessId(undefined);
          setSelectedBusinessName(undefined);
        }}
        businessIds={selectedBusinessId ? [selectedBusinessId] : []}
        businessName={selectedBusinessName}
        category={service.title}
      />
    </div>
  );
}