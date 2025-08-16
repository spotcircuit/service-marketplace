'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/contexts/ConfigContext';
import { 
  Search, MapPin, Star, Phone, Shield, Award, ArrowRight, 
  TrendingUp, Users, CheckCircle, Building2, Filter,
  Truck, Hammer, Home, Sparkles, Clock, DollarSign,
  ChevronRight, Tag, Zap, Heart, ThumbsUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuoteRequestModal from '@/components/QuoteRequestModal';

// Service categories with icons
const serviceCategories = [
  { slug: 'dumpster-rental', name: 'Dumpster Rental', icon: Truck, color: 'blue', count: 234 },
  { slug: 'junk-removal', name: 'Junk Removal', icon: Truck, color: 'green', count: 189 },
  { slug: 'demolition', name: 'Demolition', icon: Hammer, color: 'red', count: 156 },
  { slug: 'construction-cleanup', name: 'Construction Cleanup', icon: Home, color: 'purple', count: 143 },
  { slug: 'roofing', name: 'Roofing', icon: Home, color: 'orange', count: 98 },
  { slug: 'landscaping', name: 'Landscaping', icon: Sparkles, color: 'emerald', count: 87 },
];

// Quick filters
const quickFilters = [
  { label: 'Same Day Service', icon: Clock, value: 'same-day' },
  { label: 'Free Estimates', icon: DollarSign, value: 'free-estimate' },
  { label: 'Top Rated', icon: Star, value: 'top-rated' },
  { label: 'Verified', icon: Shield, value: 'verified' },
];

// Top states and cities for SEO
const topStates = [
  { slug: 'texas', name: 'Texas', cities: 85, featured: true },
  { slug: 'california', name: 'California', cities: 92, featured: true },
  { slug: 'florida', name: 'Florida', cities: 67, featured: true },
  { slug: 'new-york', name: 'New York', cities: 54, featured: false },
];

const topCities = [
  { slug: 'houston', state: 'texas', name: 'Houston', providers: 234, featured: true },
  { slug: 'los-angeles', state: 'california', name: 'Los Angeles', providers: 312, featured: true },
  { slug: 'chicago', state: 'illinois', name: 'Chicago', providers: 189, featured: true },
  { slug: 'miami', state: 'florida', name: 'Miami', providers: 198, featured: false },
];

export default function EnhancedHome() {
  const { config } = useConfig();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | undefined>();

  useEffect(() => {
    fetchFeaturedBusinesses();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses?featured=true&limit=6');
      const data = await response.json();
      setFeaturedBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Failed to fetch featured businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedFilters.length > 0) params.set('filters', selectedFilters.join(','));
    router.push(`/directory?${params.toString()}`);
  };

  const handleGetQuote = (businessId?: string, businessName?: string) => {
    setSelectedBusinessId(businessId);
    setSelectedBusinessName(businessName);
    setQuoteModalOpen(true);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <>
      {/* Hero Section with Enhanced Search */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Trusted Local Service Providers
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get instant quotes from verified professionals in your area
            </p>
          </div>

          {/* Enhanced Search Form */}
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Service Category Dropdown */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Services</option>
                    {serviceCategories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* What Input */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">What do you need?</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. 20 yard dumpster"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Location Input */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="City or ZIP"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    Get Quotes
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Quick filters:</span>
                {quickFilters.map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => toggleFilter(filter.value)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                      selectedFilters.includes(filter.value)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area with 3-Column Layout */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar - Service Categories & Location Filters */}
            <div className="lg:col-span-3 space-y-6">
              {/* Service Categories Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  Browse Services
                </h3>
                <div className="space-y-2">
                  {serviceCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/services/${cat.slug}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition group"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 text-${cat.color}-500`} />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {cat.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/services"
                  className="block mt-4 text-sm text-primary hover:underline text-center"
                >
                  View all services →
                </Link>
              </div>

              {/* Popular Locations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Top Cities
                </h3>
                <div className="space-y-2">
                  {topCities.slice(0, 5).map(city => (
                    <Link
                      key={city.slug}
                      href={`/${city.state}/${city.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="text-sm text-gray-700 hover:text-primary">
                        {city.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {city.providers} pros
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/cities"
                  className="block mt-4 text-sm text-primary hover:underline text-center"
                >
                  All locations →
                </Link>
              </div>

              {/* Advertising Space */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Grow Your Business</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Get featured placement and reach more customers
                  </p>
                  <Link
                    href="/dealer-portal/advertise"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Advertise Here
                  </Link>
                </div>
              </div>
            </div>

            {/* Center Content - Featured Businesses & Service Windows */}
            <div className="lg:col-span-6 space-y-8">
              {/* Service Category Windows */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Services Near You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceCategories.slice(0, 4).map(service => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 bg-${service.color}-100 rounded-lg`}>
                            <Icon className={`h-6 w-6 text-${service.color}-600`} />
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {service.count}+ verified providers ready to help
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Same day
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Free quotes
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Featured Businesses Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Providers</h2>
                  <Link href="/directory" className="text-sm text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {featuredBusinesses.slice(0, 3).map(business => (
                    <div key={business.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {business.logo_url ? (
                              <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                {business.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{business.name}</h3>
                            <p className="text-sm text-gray-600">{business.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(business.rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {business.rating} ({business.reviews} reviews)
                              </span>
                              {business.is_verified && (
                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                  <Shield className="h-3 w-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Featured
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {business.description || `Professional ${business.category?.toLowerCase()} services with guaranteed satisfaction`}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {business.city}, {business.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {business.phone}
                          </span>
                        </div>
                        <button
                          onClick={() => handleGetQuote(business.id, business.name)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                        >
                          Get Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-xs text-gray-600">Verified Pros</div>
                  </div>
                  <div>
                    <ThumbsUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                  <div>
                    <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                    <div className="text-xs text-gray-600">Happy Customers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - CTAs & Advertising */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Quote CTA */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white">
                <h3 className="font-semibold mb-2">Need Help Now?</h3>
                <p className="text-sm text-white/90 mb-4">
                  Get free quotes from multiple providers in minutes
                </p>
                <button
                  onClick={() => handleGetQuote()}
                  className="w-full px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Get Started
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">John D.</span> received 3 quotes
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago in Houston</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Sarah M.</span> hired a pro
                    </p>
                    <p className="text-xs text-gray-500">5 minutes ago in Dallas</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Mike R.</span> left a 5-star review
                    </p>
                    <p className="text-xs text-gray-500">12 minutes ago in Austin</p>
                  </div>
                </div>
              </div>

              {/* Premium Ad Space */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-orange-200">
                <div className="text-center">
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Premium Placement</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Be the first provider customers see
                  </p>
                  <Link
                    href="/dealer-portal/advertise"
                    className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Special Offers */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  Special Offers
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">20% Off First Service</p>
                    <p className="text-xs text-green-700">New customers only</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Free Consultation</p>
                    <p className="text-xs text-blue-700">For projects over $500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom SEO Sections */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* States Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by State</h2>
              <div className="grid grid-cols-2 gap-3">
                {topStates.map(state => (
                  <Link
                    key={state.slug}
                    href={`/${state.slug}`}
                    className="bg-white rounded-lg p-4 hover:shadow-md transition border"
                  >
                    <h3 className="font-semibold text-gray-900">{state.name}</h3>
                    <p className="text-sm text-gray-600">{state.cities} cities</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tell us what you need</h3>
                    <p className="text-sm text-gray-600">Answer a few quick questions about your project</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get matched with pros</h3>
                    <p className="text-sm text-gray-600">Receive quotes from verified local professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Compare and hire</h3>
                    <p className="text-sm text-gray-600">Review profiles, compare quotes, and hire the best pro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      />
    </>
  );
}