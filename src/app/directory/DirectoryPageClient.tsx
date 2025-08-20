'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Phone, MapPin, Star, Clock, Filter, ChevronRight, Building2, Tag, Globe, Mail } from 'lucide-react';
import Link from 'next/link';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';
import { useConfig } from '@/contexts/ConfigContext';
import { useRouter } from 'next/navigation';

interface Service {
  name: string;
  price_to?: number;
  price_from?: number;
  price_unit?: string;
  description?: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  rating: number;
  reviews: number; // Changed from reviewCount to match API
  is_verified: boolean; // Changed from verified to match API
  is_claimed?: boolean;
  is_featured?: boolean;
  years_in_business?: number; // Changed from yearsInBusiness to match API
  services?: Service[]; // Updated to match API structure
  hours?: Record<string, { open?: string; close?: string; closed?: boolean }>; // Updated to match API structure
  description?: string;
}


const categories = [
  'All Categories',
  'Dumpster Rental',
  'Waste Management',
  'Commercial Services',
  'Recycling Services',
  'Junk Removal',
  'Construction Debris'
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'name', label: 'Alphabetical' },
  { value: 'distance', label: 'Distance' }
];

export default function DirectoryPageClient() {
  const { config } = useConfig();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('relevance');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]); // Store all businesses for search
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  // New: location filter derived from header-saved default city/state/zip
  const [locationFilter, setLocationFilter] = useState<{ city?: string; state?: string; zipcode?: string } | null>(null);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<Business[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Location autocomplete state (independent of business/services search)
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ label: string; city?: string; state?: string; zipcode?: string }>>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Fetch businesses from API on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        
        // Get user's location from localStorage
        const savedLocation = localStorage.getItem('userLocation');
        let city = '';
        let state = '';
        
        if (savedLocation) {
          try {
            const location = JSON.parse(savedLocation);
            city = location.city || '';
            state = location.state || '';
            
            if (city || state) {
              setLocationFilter({ city, state });
              setLocationQuery([city, state].filter(Boolean).join(', '));
            }
          } catch (e) {
            console.error('Error parsing saved location:', e);
          }
        }
        
        // Build query params (do NOT scope by saved city/state so suggestions cover all locations)
        const params = new URLSearchParams();
        params.append('limit', '500');
        
        // Fetch businesses from API
        const response = await fetch(`/api/businesses?${params.toString()}`);
        const data = await response.json();
        
        if (data.businesses) {
          setBusinesses(data.businesses);
          setAllBusinesses(data.businesses); // Store all for search
          setFilteredBusinesses(data.businesses);
          // If we already set a locationFilter from saved location, apply it now using a location override
          if (city || state) {
            const override = { city: city || undefined, state: state || undefined };
            setTimeout(() => performSearch(undefined, override), 0);
          }
        } else {
          setBusinesses([]);
          setAllBusinesses([]);
          setFilteredBusinesses([]);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
        setAllBusinesses([]);
        setFilteredBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Run search. If a location filter is set, use service-areas API (radius/zip aware).
  const performSearch = async (query?: string, locationOverride?: { city?: string; state?: string; zipcode?: string } | null) => {
    const searchTerm = query ?? searchQuery;
    const effectiveLocation = locationOverride ?? locationFilter;

    // Location-aware path: defer to API that respects service radius and zipcodes
    if (effectiveLocation && (effectiveLocation.city || effectiveLocation.state || effectiveLocation.zipcode)) {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (effectiveLocation.city) params.set('city', effectiveLocation.city);
        if (effectiveLocation.state) params.set('state', effectiveLocation.state);
        if (effectiveLocation.zipcode) params.set('zipcode', effectiveLocation.zipcode);
        if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory);
        if (searchTerm) params.set('search', searchTerm);
        params.set('limit', '500');

        const res = await fetch(`/api/businesses/route-service-areas?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Service-area search failed: ${res.status}`);
        const data = await res.json();
        const svcResults: any[] = Array.isArray(data.businesses) ? data.businesses : [];

        // Client-side sort
        if (sortBy === 'rating') {
          svcResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'reviews') {
          svcResults.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        } else if (sortBy === 'name') {
          svcResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        setFilteredBusinesses(svcResults as Business[]);
      } catch (err) {
        console.error('Service-area API error, falling back to local filter:', err);
        // Fallback: strict city/state/zip filter on local dataset
        let results = [...allBusinesses];
        const city = locationFilter?.city?.toLowerCase();
        const state = locationFilter?.state?.toLowerCase();
        const zip = locationFilter?.zipcode?.toLowerCase();
        results = results.filter((b) => {
          const bCity = (b.city || '').toLowerCase();
          const bState = (b.state || '').toLowerCase();
          const bZip = (b.zipcode || '').toLowerCase();
          if (zip) return bZip === zip;
          if (city && state) return bCity === city && bState === state;
          if (city) return bCity === city;
          if (state) return bState === state;
          return true;
        });
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          results = results.filter((biz) => {
            const nameMatch = biz.name?.toLowerCase().includes(lower);
            const categoryMatch = biz.category?.toLowerCase().includes(lower);
            const descriptionMatch = biz.description?.toLowerCase().includes(lower);
            const servicesMatch = Array.isArray(biz.services)
              ? biz.services.some((s: any) => (typeof s === 'string' ? s.toLowerCase().includes(lower) : s?.name?.toLowerCase().includes(lower)))
              : false;
            return nameMatch || categoryMatch || descriptionMatch || servicesMatch;
          });
        }
        if (selectedCategory && selectedCategory !== 'All Categories') {
          results = results.filter((b) => (b.category || '').toLowerCase() === selectedCategory.toLowerCase());
        }
        if (sortBy === 'rating') {
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'reviews') {
          results.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        } else if (sortBy === 'name') {
          results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        setFilteredBusinesses(results);
      } finally {
        setLoading(false);
      }
      return;
    }

    // No location filter: use local dataset
    let results = [...allBusinesses];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter((biz) => {
        const nameMatch = biz.name?.toLowerCase().includes(lower);
        const categoryMatch = biz.category?.toLowerCase().includes(lower);
        const descriptionMatch = biz.description?.toLowerCase().includes(lower);
        const servicesMatch = Array.isArray(biz.services)
          ? biz.services.some((s: any) => (typeof s === 'string' ? s.toLowerCase().includes(lower) : s?.name?.toLowerCase().includes(lower)))
          : false;
        return nameMatch || categoryMatch || descriptionMatch || servicesMatch;
      });
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      results = results.filter((b) => (b.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }
    if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      results.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (sortBy === 'name') {
      results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    setFilteredBusinesses(results);
  };

  // Parse free-typed location text like "City, ST" or "12345"
  const parseLocationQuery = (q: string): { city?: string; state?: string; zipcode?: string } | null => {
    const val = q.trim();
    if (!val) return null;
    // ZIP: 5 digits
    if (/^\d{5}$/.test(val)) {
      return { zipcode: val };
    }
    // City, ST (two-letter state)
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 2) {
      const city = parts[0];
      const state = parts[1].toUpperCase();
      if (/^[A-Z]{2}$/.test(state)) {
        return { city, state };
      }
    }
    return null;
  };

  const applyLocationFromQuery = () => {
    const parsed = parseLocationQuery(locationQuery);
    if (parsed) {
      setLocationFilter(parsed);
      // Ensure results refresh after state flush
      setTimeout(() => performSearch(), 0);
    }
  };

  // Build location suggestions from loaded businesses (unique City, ST and ZIP matches)
  const updateLocationSuggestions = (q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    const seen = new Set<string>();
    const suggestions: Array<{ label: string; city?: string; state?: string; zipcode?: string }> = [];

    for (const biz of allBusinesses) {
      const city = biz.city || '';
      const state = biz.state || '';
      const zip = biz.zipcode || '';
      const cityState = [city, state].filter(Boolean).join(', ');

      // Match against city/state label and zipcode
      const matchesCityState = cityState.toLowerCase().includes(query);
      const matchesZip = zip.toLowerCase().includes(query);

      if (matchesCityState) {
        const label = cityState;
        if (label && !seen.has(label)) {
          seen.add(label);
          suggestions.push({ label, city, state });
        }
      }

      if (matchesZip) {
        const label = zip;
        if (label && !seen.has(label)) {
          seen.add(label);
          suggestions.push({ label, zipcode: zip });
        }
      }

      if (suggestions.length >= 8) break;
    }

    setLocationSuggestions(suggestions);
    setShowLocationSuggestions(suggestions.length > 0);
  };

  const handleLocationSelect = (item: { label: string; city?: string; state?: string; zipcode?: string }) => {
    setLocationQuery(item.label);
    // Set location filter according to the selected item
    if (item.zipcode) {
      setLocationFilter({ zipcode: item.zipcode });
    } else {
      setLocationFilter({ city: item.city, state: item.state });
    }
    setShowLocationSuggestions(false);
    // Refresh results after state updates flush
    setTimeout(() => performSearch(), 0);
  };
  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      setIsSearching(true);
      
      // Use the search API endpoint
      const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.businesses) {
        setSuggestions(data.businesses);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (business: Business) => {
    // Prefer uuid if present from API, otherwise fall back to id
    const targetId = (business as any).uuid ?? business.id;
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(`/business/${targetId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch();
  };

  useEffect(() => {
    performSearch();
  }, [selectedCategory, sortBy]);

  // Re-run search whenever the location filter changes
  useEffect(() => {
    performSearch();
  }, [locationFilter]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
          <p className="text-xl opacity-90">
            Find and compare local dumpster rental and waste management services
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Search businesses or services..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {suggestions.map((business, index) => (
                      <div
                        key={business.id}
                        onClick={() => handleSuggestionClick(business)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <div className="font-medium">{business.name}</div>
                              {business.is_verified && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {business.address}, {business.city}, {business.state} {business.zipcode}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {business.rating}
                              </span>
                              <span>{business.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {suggestions.length >= 8 && (
                    <div className="p-3 border-t text-center text-sm text-gray-500">
                      Type more to refine your search...
                    </div>
                  )}
                </div>
              )}
              {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !isSearching && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border p-6 text-center">
                  <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    No businesses found matching "{searchQuery}"
                  </p>
                  <Link
                    href="/claim"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                  >
                    Add Your Business
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Search
            </button>
          </form>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Location Autocomplete: City, State or ZIP */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocationQuery(val);
                  updateLocationSuggestions(val);
                  if (val.trim() === '') {
                    // If user manually clears the field, remove filter and refresh results
                    setLocationFilter(null);
                    setTimeout(() => performSearch(), 0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLocationFromQuery();
                  }
                }}
                onFocus={() => {
                  if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                }}
                onBlur={() => {
                  // Hide suggestions and attempt to apply typed location
                  setTimeout(() => setShowLocationSuggestions(false), 150);
                  applyLocationFromQuery();
                }}
                placeholder="City, State or ZIP"
                className="w-64 pl-9 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
              {(locationFilter && (locationFilter.city || locationFilter.state || locationFilter.zipcode)) && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationFilter(null);
                    setLocationQuery('');
                    // Refresh results after state updates flush
                    setTimeout(() => performSearch(), 0);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 border rounded hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {locationSuggestions.map((item, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        className="p-2 rounded cursor-pointer hover:bg-gray-50"
                        onMouseDown={() => handleLocationSelect(item)}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {filteredBusinesses.length} results found
            </div>
          </div>
        </div>
      </div>

      {/* Results & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse by category
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSortBy('relevance');
                    performSearch('');
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBusinesses.map(business => (
                  <div key={business.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{business.name}</h3>
                          {business.is_verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {business.category}
                          </span>
                          {business.years_in_business && (
                            <span>{business.years_in_business} years in business</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(business.rating)}
                        <div className="text-sm text-gray-600 mt-1">
                          {business.rating} ({business.reviews} reviews)
                        </div>
                      </div>
                    </div>

                    {business.description && (
                      <p className="text-gray-700 mb-4">{business.description}</p>
                    )}
                    <div className="space-y-2 mb-4">

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{business.address}, {business.city}, {business.state} {business.zipcode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                          {business.phone}
                        </a>
                      </div>
                      {business.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                            {business.email}
                          </a>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={`https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {business.website}
                          </a>
                        </div>
                      )}
                      {business.hours && typeof business.hours === 'object' && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Open Today</span>
                        </div>
                      )}
                    </div>

                    {business.services && business.services.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Services:</div>
                        <div className="flex flex-wrap gap-2">
                          {business.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {typeof service === 'string' ? service : service.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/business/${business.id}`}
                        className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition text-center font-medium"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => setQuoteModalOpen(true)}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  Get Multiple Quotes
                </button>
                <Link
                  href="/claim"
                  className="block w-full px-4 py-3 border border-gray-300 text-center rounded-lg hover:bg-gray-50 transition"
                >
                  Claim Your Business
                </Link>
                <Link
                  href="/claim"
                  className="block w-full px-4 py-3 border border-gray-300 text-center rounded-lg hover:bg-gray-50 transition"
                >
                  List Your Business
                </Link>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2">
                {categories.slice(1, 6).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === category
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Need Help Choosing?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Our experts can help you find the right service provider for your project.
              </p>
              <div className="space-y-2">
                <a
                  href={`tel:${config?.contactPhoneE164 || config?.contactPhone || ''}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{config?.contactPhoneDisplay || config?.contactPhone || ''}</span>
                </a>
                <div className="text-sm text-gray-600">
                  {config?.supportHours || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={{ dumpsterSize: '20-yard' }}
      />
    </div>
  );
}