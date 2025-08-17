"use client";

import { useState, useEffect, Suspense } from 'react';
import { Business, SearchFilters } from '@/types/business';
import { Star, MapPin, Phone, Globe, Shield, Award, Filter, X, ChevronDown, Search, Clock, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import GoogleLocationSearch from '@/components/GoogleLocationSearch';

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Array<{category: string, count: number}>>([]);
  const [locations, setLocations] = useState<Array<{city: string, state: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    sort_by: 'featured',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const location = searchParams.get('location');

    if (category || city || location) {
      setFilters(prev => ({
        ...prev,
        category: category || undefined,
        city: city || location || undefined,
      }));
      if (city || location) {
        setLocationQuery(city || location || '');
      }
    }

    // Fetch categories and locations stats
    fetchStats();
  }, [searchParams]);

  useEffect(() => {
    fetchBusinesses();
  }, [filters, searchQuery]);

  // Set header to use secondary theme on directory page
  useEffect(() => {
    const root = document.documentElement;
    const previousTone = root.getAttribute('data-header-tone');
    root.setAttribute('data-header-tone', 'secondary');
    return () => {
      if (previousTone) {
        root.setAttribute('data-header-tone', previousTone);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/businesses/stats');
      const data = await response.json();
      
      if (data.categories) {
        setCategories(data.categories);
      }
      if (data.cities) {
        setLocations(data.cities);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.city) params.set('city', filters.city);
      if ((filters as any).state) params.set('state', (filters as any).state);
      if (filters.is_verified) params.set('verified', 'true');

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const data = await response.json();

      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <div className={`bg-white rounded-xl overflow-hidden ${business.is_featured ? 'ring-2 ring-primary shadow-xl' : 'border border-gray-200 shadow-sm'} hover:shadow-xl transition-all`}>
      {business.is_featured && (
        <div className="bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Award className="h-4 w-4" />
          Featured Provider
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : business.category === 'Dumpster Rental' ? (
              <Image 
                src="/images/dumpstersize.png" 
                alt="Dumpster Service" 
                width={80} 
                height={80} 
                className="object-cover"
              />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {business.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/business/${business.id}`} className="hover:text-primary">
                  <h3 className="text-lg font-bold mb-1">{business.name}</h3>
                </Link>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span className="text-foreground">{business.category}</span>
                  {business.is_verified && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Shield className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{business.rating}</span>
                  <span className="text-xs text-muted-foreground">({business.reviews})</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {business.description || `Professional ${business.category?.toLowerCase()} services in ${business.city}, ${business.state}`}
            </p>

            <div className="flex items-center gap-4 text-xs">
              <a href={`tel:${business.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3 w-3" />
                {business.phone}
              </a>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {business.city}, {business.state}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <Link href={`/business/${business.id}`} className="px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90">
                View Details
              </Link>
              {!business.is_claimed && (
                <Link 
                  href={`/claim?businessId=${business.id}`}
                  className="px-3 py-1.5 border border-primary text-primary rounded text-xs font-medium hover:bg-primary/10"
                >
                  Claim
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleLocationChange = (location: { city?: string; state?: string; zipcode?: string; formatted: string }) => {
    if (location.city || location.state) {
      setFilters(prev => ({
        ...prev,
        city: location.city,
        state: location.state
      }));
      setLocationQuery(location.formatted);
    } else if (location.zipcode) {
      setLocationQuery(location.formatted);
      setSearchQuery(location.zipcode);
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.city;
        delete (newFilters as any).state;
        return newFilters;
      });
      setLocationQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Primary Color */}
      <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Find Local Service Providers</h1>
            <p className="text-lg mb-8 text-white/90">
              Connect with trusted professionals in your area
            </p>
          </div>
          
          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <GoogleLocationSearch
                value={locationQuery}
                onChange={handleLocationChange}
                placeholder="City, State or ZIP"
                className="py-3 text-gray-900"
                types={['geocode']}
              />

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              </div>

              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Filters</h3>
              
              {/* Category Pills */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</div>
                <div className="flex flex-col gap-2">
                  {categories.slice(0, 5).map(cat => (
                    <button
                      key={cat.category}
                      onClick={() => setFilters({ ...filters, category: filters.category === cat.category ? undefined : cat.category })}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                        filters.category === cat.category
                          ? 'bg-primary text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.category}
                      <span className="text-xs opacity-70 ml-1">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mt-6 space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</div>
                <div className="flex flex-col gap-2">
                  {[4.5, 4.0, 3.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, rating_min: filters.rating_min === rating ? undefined : rating })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        filters.rating_min === rating
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_verified || false}
                    onChange={(e) => setFilters({ ...filters, is_verified: e.target.checked || undefined })}
                    className="rounded text-primary"
                  />
                  <span className="text-sm text-gray-700">Verified Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              {(filters.category || filters.rating_min || filters.is_verified) && (
                <button
                  onClick={() => setFilters({ sort_by: 'featured' })}
                  className="mt-4 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results - Middle Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${businesses.length} providers found`}
              </p>
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">A-Z</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading businesses...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {businesses.map(business => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {businesses.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600">No businesses found matching your criteria.</p>
                    <button
                      onClick={() => {
                        setFilters({ sort_by: 'featured' });
                        setSearchQuery('');
                      }}
                      className="mt-4 text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Features Sidebar - Right Column */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Why Choose Us */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Why Choose Us</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Verified Businesses</h4>
                      <p className="text-xs text-gray-600 mt-1">All providers are licensed and insured</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Real Reviews</h4>
                      <p className="text-xs text-gray-600 mt-1">From verified customers like you</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Fast Response</h4>
                      <p className="text-xs text-gray-600 mt-1">Get quotes within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Local Experts</h4>
                      <p className="text-xs text-gray-600 mt-1">Serving your neighborhood</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help? */}
              <div className="bg-gradient-to-br from-primary to-orange-500 rounded-lg p-6 text-white">
                <h3 className="font-semibold mb-2">Need Help Choosing?</h3>
                <p className="text-sm mb-4 text-white/90">Our experts can help you find the perfect service provider for your needs.</p>
                <a
                  href="tel:+14342076559"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg font-medium text-sm hover:bg-gray-50 transition"
                >
                  <Phone className="h-4 w-4" />
                  Call (434) 207-6559
                </a>
              </div>

              {/* Popular Locations */}
              {locations.filter(loc => loc.city && loc.city.trim()).length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-gray-900">Popular Locations</h3>
                    </div>
                    <div className="space-y-1">
                      {locations
                        .filter(loc => loc.city && loc.city.trim())
                        .slice(0, 6)
                        .map(loc => (
                          <button
                            key={`${loc.city}-${loc.state}`}
                            onClick={() => {
                              setFilters({ ...filters, city: loc.city });
                              setLocationQuery(`${loc.city}, ${loc.state}`);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/5 transition flex justify-between items-center group"
                          >
                            <span className="text-gray-700 group-hover:text-primary font-medium">
                              {loc.city}, {loc.state}
                            </span>
                            <span className="text-xs bg-gray-100 group-hover:bg-primary/10 px-2 py-1 rounded-full text-gray-600 group-hover:text-primary">
                              {loc.count} {loc.count === 1 ? 'provider' : 'providers'}
                            </span>
                          </button>
                        ))}
                    </div>
                    {locations.filter(loc => loc.city && loc.city.trim()).length > 6 && (
                      <Link 
                        href="/locations"
                        className="block mt-4 text-center text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        View all locations →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Showcase Section */}
      <div className="bg-white py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services in Action</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From residential dumpster rentals to commercial waste management, we connect you with the right service providers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <Image 
                src="/images/dump1.png" 
                alt="Dumpster Delivery" 
                width={400} 
                height={300} 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold">Fast Delivery</h3>
                  <p className="text-sm text-white/80">Same-day service available</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <Image 
                src="/images/dumppickup.png" 
                alt="Dumpster Pickup" 
                width={400} 
                height={300} 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold">Reliable Pickup</h3>
                  <p className="text-sm text-white/80">On-time removal service</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <Image 
                src="/images/house.png" 
                alt="Residential Service" 
                width={400} 
                height={300} 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold">Residential</h3>
                  <p className="text-sm text-white/80">Home renovation projects</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <Image 
                src="/images/dumpquote.png" 
                alt="Get Quote" 
                width={400} 
                height={300} 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold">Free Quotes</h3>
                  <p className="text-sm text-white/80">Compare prices instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading directory...</p>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}