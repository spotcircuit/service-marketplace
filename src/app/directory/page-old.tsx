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
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : business.category === 'Dumpster Rental' ? (
              <Image 
                src="/images/dumpstersize.png" 
                alt="Dumpster Service" 
                width={96} 
                height={96} 
                className="object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-primary">
                {business.name.charAt(0)}
              </div>
            )}
          </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/business/${business.id}`} className="hover:text-primary">
                <h3 className="text-xl font-bold mb-1">{business.name}</h3>
              </Link>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <span className="text-foreground">{business.category}</span>
                {business.is_verified && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {business.years_in_business && (
                  <span>{business.years_in_business} years in business</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{business.rating}</span>
                <span className="text-sm text-muted-foreground">({business.reviews})</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mb-3 line-clamp-2">
            {business.description || `Professional ${business.category.toLowerCase()} services in ${business.city}, ${business.state}`}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <a href={`tel:${business.phone}`} className="flex items-center gap-1 text-primary hover:underline">
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {business.city}, {business.state}
            </span>
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          {business.services && business.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {business.services.slice(0, 3).map((service, index) => (
                <span key={service.id || `service-${index}`} className="px-2 py-1 bg-muted text-xs rounded">
                  {service.name}
                </span>
              ))}
              {business.services.length > 3 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{business.services.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Link href={`/business/${business.id}`} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium">
              View Details
            </Link>
            {business.is_claimed ? (
              business.is_verified ? (
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Verified
                </div>
              ) : (
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                  Claimed
                </div>
              )
            ) : (
              <Link 
                href={`/claim?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}&address=${encodeURIComponent(business.address || '')}&city=${encodeURIComponent(business.city)}&state=${encodeURIComponent(business.state)}&zipcode=${encodeURIComponent(business.zipcode || '')}&phone=${encodeURIComponent(business.phone || '')}&email=${encodeURIComponent(business.email || '')}&category=${encodeURIComponent(business.category)}&website=${encodeURIComponent(business.website || '')}`}
                className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 text-sm font-medium"
              >
                Claim This Business
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
      // For zipcode, we'd need to geocode it to get city/state
      setLocationQuery(location.formatted);
      // For now, just search by the zipcode in the search query
      setSearchQuery(location.zipcode);
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.city;
        delete newFilters.state;
        return newFilters;
      });
      setLocationQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Primary Color */}
      <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Find Local Service Providers</h1>
            <p className="text-xl mb-8 text-white/90">
              Connect with trusted professionals in your area. From dumpster rentals to home services, we've got you covered.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div>
                <div className="text-3xl font-bold">{businesses.length}+</div>
                <div className="text-sm text-white/80">Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm text-white/80">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{locations.length}</div>
                <div className="text-sm text-white/80">Cities</div>
              </div>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Location Search with Google Autocomplete (first) */}
              <GoogleLocationSearch
                value={locationQuery}
                onChange={handleLocationChange}
                placeholder="City, State or ZIP"
                className="py-3 text-gray-900"
                types={['geocode']}
              />

              {/* Service Search (second) */}
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

              {/* Category Filter (third) */}
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
            
            {/* Additional Filters Row */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 ${
                  showFilters ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            
              {filters.is_verified && (
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verified Only
                </span>
              )}
              
              {filters.rating_min && (
                <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {filters.rating_min}+ Stars
                </span>
              )}
              
              {(searchQuery || locationQuery || filters.category || filters.is_verified || filters.rating_min) && (
                <button
                  onClick={() => {
                    setFilters({ sort_by: 'featured' });
                    setSearchQuery('');
                    setLocationQuery('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Verified Businesses</h3>
              <p className="text-sm text-gray-600">All businesses are verified and licensed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Customer Reviews</h3>
              <p className="text-sm text-gray-600">Real reviews from verified customers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Local Services</h3>
              <p className="text-sm text-gray-600">Find providers in your neighborhood</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Direct Contact</h3>
              <p className="text-sm text-gray-600">Connect directly with businesses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <div className="bg-card rounded-lg border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button
                  onClick={() => setFilters({ sort_by: 'featured' })}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>


              {/* Rating Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating_min === rating}
                        onChange={() => setFilters({ ...filters, rating_min: rating })}
                        className="text-primary"
                      />
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{rating}+</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified Only */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_verified || false}
                    onChange={(e) => setFilters({ ...filters, is_verified: e.target.checked || undefined })}
                    className="rounded text-primary"
                  />
                  <span className="text-sm">Verified Businesses Only</span>
                </label>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="featured">Featured First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `Showing ${businesses.length} businesses`}
              </p>
              <button className="md:hidden text-primary" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No businesses found matching your criteria.</p>
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
        </div>
      </div>

      {/* Image Showcase Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services in Action</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From residential dumpster rentals to commercial waste management, we connect you with the right service providers for your needs.
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

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Service Provider?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found reliable local businesses through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup?type=customer" 
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Started
            </Link>
            <Link 
              href="/pros" 
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50"
            >
              List Your Business
            </Link>
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
