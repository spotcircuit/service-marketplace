'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, CheckCircle, Phone, Clock, DollarSign, Shield, Award, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// State names mapping
const stateNames: Record<string, string> = {
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
  'delaware': 'Delaware', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
  'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa',
  'kansas': 'Kansas', 'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine',
  'maryland': 'Maryland', 'massachusetts': 'Massachusetts', 'michigan': 'Michigan',
  'minnesota': 'Minnesota', 'mississippi': 'Mississippi', 'missouri': 'Missouri',
  'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada',
  'new-hampshire': 'New Hampshire', 'new-jersey': 'New Jersey', 'new-mexico': 'New Mexico',
  'new-york': 'New York', 'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota',
  'ohio': 'Ohio', 'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
  'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina', 'south-dakota': 'South Dakota',
  'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah', 'vermont': 'Vermont',
  'virginia': 'Virginia', 'washington': 'Washington', 'west-virginia': 'West Virginia',
  'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming'
};

interface Business {
  id: string;
  name: string;
  category: string;
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
}

export default function CityPage() {
  const params = useParams();
  const stateSlug = params.state as string;
  const citySlug = params.city as string;
  const stateName = stateNames[stateSlug] || stateSlug;
  const cityName = citySlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchBusinesses();
  }, [stateSlug, citySlug, filter, sortBy]);

  const fetchBusinesses = async () => {
    try {
      // This would be an API call
      // const response = await fetch(`/api/businesses?state=${stateSlug}&city=${citySlug}&filter=${filter}&sort=${sortBy}`);
      // const data = await response.json();
      
      // Mock data for now
      setBusinesses([
        {
          id: '1',
          name: `${cityName} Premium Dumpsters`,
          category: 'Dumpster Rental',
          rating: 4.9,
          reviews: 234,
          address: `123 Main St, ${cityName}, ${stateName}`,
          phone: '(555) 123-4567',
          is_featured: true,
          is_verified: true,
          response_time: '1 hour',
          price_range: '$$',
          description: 'Leading dumpster rental service with 15+ years of experience',
          services: ['10 Yard Dumpsters', '20 Yard Dumpsters', '30 Yard Dumpsters', 'Same Day Delivery'],
          years_in_business: 15
        },
        {
          id: '2',
          name: 'Quick Waste Solutions',
          category: 'Junk Removal',
          rating: 4.7,
          reviews: 156,
          address: `456 Oak Ave, ${cityName}, ${stateName}`,
          phone: '(555) 234-5678',
          is_featured: true,
          is_verified: true,
          response_time: '30 minutes',
          price_range: '$$$',
          description: 'Fast and reliable junk removal for residential and commercial',
          services: ['Furniture Removal', 'Appliance Disposal', 'Estate Cleanouts', 'Office Cleanouts'],
          years_in_business: 8
        },
        {
          id: '3',
          name: 'Elite Construction Services',
          category: 'Construction',
          rating: 4.8,
          reviews: 189,
          address: `789 Industrial Blvd, ${cityName}, ${stateName}`,
          phone: '(555) 345-6789',
          is_featured: false,
          is_verified: true,
          response_time: '2 hours',
          price_range: '$$$$',
          description: 'Full-service construction and renovation company',
          services: ['New Construction', 'Renovations', 'Demolition', 'Site Preparation'],
          years_in_business: 20
        },
        {
          id: '4',
          name: 'Green Earth Disposal',
          category: 'Dumpster Rental',
          rating: 4.5,
          reviews: 98,
          address: `321 Eco Way, ${cityName}, ${stateName}`,
          phone: '(555) 456-7890',
          is_featured: false,
          is_verified: false,
          response_time: '3 hours',
          price_range: '$',
          description: 'Eco-friendly waste management solutions',
          services: ['Recycling Services', 'Green Disposal', 'Compost Bins', 'Yard Waste'],
          years_in_business: 5
        }
      ]);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    if (filter === 'all') return true;
    if (filter === 'featured') return business.is_featured;
    if (filter === 'verified') return business.is_verified;
    return business.category === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/${stateSlug}`} className="hover:text-gray-900">{stateName}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{cityName}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Service Providers in {cityName}, {stateName}
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Find trusted local professionals for all your service needs
            </p>
            
            {/* Quick Search */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="flex-1 px-4 py-2 rounded-md focus:outline-none"
                />
                <button className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition">
                  Get Quotes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="py-6 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === 'all' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Services
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === 'featured' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === 'verified' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Verified Only
              </button>
              <button
                onClick={() => setFilter('Dumpster Rental')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === 'Dumpster Rental' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dumpster Rental
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="featured">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Business Listings */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredBusinesses.length} service providers in {cityName}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBusinesses.map((business) => (
                <div key={business.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  {business.is_featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-sm font-medium">
                      ⭐ FEATURED PROVIDER - Premium placement in {cityName}
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
                              <span className="text-gray-600">{business.category}</span>
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
                              <Award className="h-8 w-8 text-orange-600 mx-auto" />
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {business.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            Response: {business.response_time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Shield className="h-4 w-4 mr-2 text-gray-400" />
                            Licensed & Insured
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
                      <div className="lg:w-64 space-y-3">
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center justify-center w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          <Phone className="h-5 w-5 mr-2" />
                          {business.phone}
                        </a>
                        <Link
                          href="/"
                          className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Get Free Quote
                        </Link>
                        <Link
                          href={`/business/${business.id}`}
                          className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          View Full Profile
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Service in {cityName}?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Get multiple quotes from verified providers in minutes
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}