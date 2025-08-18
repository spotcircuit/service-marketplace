'use client';

"use client";

import { useState, useEffect, Suspense } from 'react';
import { Business, SearchFilters } from '@/types/business';
import { Star, MapPin, Phone, Globe, Shield, Award, Filter, X, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
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

  // Ensure header uses primary (yellow) theme on directory page
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-header-tone');
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
    <div className={`bg-card rounded-lg border ${business.is_featured ? 'border-primary shadow-lg' : ''} hover:shadow-xl transition-all p-6`}>
      {business.is_featured && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full mb-3">
          <Award className="h-3 w-3" />
          Featured
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-lg" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {business.name.charAt(0)}
            </span>
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
      {/* Search Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Find Local Service Providers</h1>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Location Search with Google Autocomplete (first) */}
            <GoogleLocationSearch
              value={locationQuery}
              onChange={handleLocationChange}
              placeholder="City, State or ZIP"
              className="py-3"
              types={['geocode']}
            />

            {/* Service Search (second) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter (third) */}
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              className="px-4 py-3 border rounded-lg bg-background"
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2 text-sm ${
                showFilters ? 'bg-muted' : 'bg-card'
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
                className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm"
              >
                Clear All
              </button>
            )}
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
    </div>
  );
}

export default function DirectoryPageClient() {
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
