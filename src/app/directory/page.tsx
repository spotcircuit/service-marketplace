"use client";

import { useState, useEffect, Suspense } from 'react';
import { categories, locations } from '@/data/sample-businesses';
import { Business, SearchFilters } from '@/types/business';
import { Star, MapPin, Phone, Globe, Shield, Award, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    sort_by: 'featured',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

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
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBusinesses();
  }, [filters, searchQuery]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.city) params.set('city', filters.city);
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
            <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 text-sm font-medium">
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Find Local Service Providers</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search businesses, services, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-card border rounded-lg hover:bg-muted flex items-center gap-2 font-medium"
            >
              <Filter className="h-5 w-5" />
              Filters
              {Object.keys(filters).length > 1 && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {Object.keys(filters).length - 1}
                </span>
              )}
            </button>
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

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Location</label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.city} value={loc.city}>
                      {loc.city} ({loc.count})
                    </option>
                  ))}
                </select>
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
