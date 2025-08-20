'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Shield, 
  Award, 
  Filter, 
  ChevronDown,
  CheckCircle,
  Clock,
  Users,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import GoogleLocationSearch from './GoogleLocationSearch';
import DumpsterQuoteModal from './DumpsterQuoteModal';

// Normalize state input to a 2-letter uppercase abbreviation expected by the API
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'District Of Columbia': 'DC',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
};

const VALID_ABBRS = new Set(Object.values(STATE_NAME_TO_ABBR));

const titleCase = (s: string) => s.toLowerCase().split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

const normalizeStateInput = (s: string | undefined | null): string => {
  if (!s) return '';
  const trimmed = s.trim();
  if (!trimmed) return '';
  const upper = trimmed.toUpperCase();
  if (upper === 'STATE' || upper === 'UNKNOWN' || upper === '-') return '';
  // Already a valid 2-letter abbreviation
  if (upper.length === 2 && VALID_ABBRS.has(upper)) return upper;
  // Try to map full name -> abbr
  const tc = titleCase(trimmed);
  if (STATE_NAME_TO_ABBR[tc]) return STATE_NAME_TO_ABBR[tc];
  return '';
};

interface Business {
  id: string;
  name: string;
  category?: string;
  rating: number;
  reviews: number;
  city: string;
  state: string;
  address?: string;
  phone: string;
  is_featured: boolean;
  is_verified: boolean;
  is_claimed?: boolean;
  years_in_business?: number;
  description?: string;
  services?: any[];
  logo_url?: string;
  website?: string;
}

interface BusinessDirectoryProps {
  initialCity?: string;
  initialState?: string;
  initialCategory?: string;
  initialSearchQuery?: string;
  initialSortBy?: string;
  showLocationSearch?: boolean;
  showCategoryFilter?: boolean;
  showSidebar?: boolean;
  limit?: number;
  onCityClick?: (city: string) => void;
}

export default function BusinessDirectory({
  initialCity,
  initialState,
  initialCategory,
  initialSearchQuery,
  initialSortBy,
  showLocationSearch = true,
  showCategoryFilter = true,
  showSidebar = true,
  limit,
  onCityClick
}: BusinessDirectoryProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState(initialSortBy || 'featured');
  const [locationQuery, setLocationQuery] = useState('');
  const [cityFilter, setCityFilter] = useState(initialCity || '');
  const [stateFilter, setStateFilter] = useState(() => normalizeStateInput(initialState || ''));
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalStartStep, setModalStartStep] = useState<number | undefined>(undefined);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    verified: 0,
    avgRating: 0,
    totalReviews: 0
  });

  // Update local state when props change
  useEffect(() => {
    setCityFilter(initialCity || '');
  }, [initialCity]);
  
  useEffect(() => {
    setStateFilter(normalizeStateInput(initialState || ''));
  }, [initialState]);
  
  useEffect(() => {
    setSearchQuery(initialSearchQuery || '');
  }, [initialSearchQuery]);
  
  useEffect(() => {
    setFilter(initialCategory || 'all');
  }, [initialCategory]);
  
  useEffect(() => {
    setSortBy(initialSortBy || 'featured');
  }, [initialSortBy]);

  useEffect(() => {
    fetchBusinesses();
  }, [cityFilter, stateFilter, filter, sortBy, searchQuery]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const debugLabel = `[BusinessDirectory fetch] ${new Date().toISOString()}`;
      console.group(debugLabel);
      
      if (cityFilter) params.set('city', cityFilter);
      const normalizedState = normalizeStateInput(stateFilter);
      if (normalizedState) {
        params.set('state', normalizedState);
      }
      
      if (searchQuery) params.set('search', searchQuery);
      
      if (filter !== 'all' && filter) {
        if (filter === 'featured') params.set('is_featured', 'true');
        else if (filter === 'verified') params.set('is_verified', 'true');
        else params.set('category', filter);
      }

      if (limit && !showAllBusinesses) {
        params.set('limit', limit.toString());
      }

      // Always use the regular businesses endpoint which properly filters by state
      const url = `/api/businesses?${params.toString()}`;
      console.log('Request', {
        cityFilter,
        stateFilterRaw: stateFilter,
        normalizedState,
        filter,
        sortBy,
        limit,
        showAllBusinesses,
        url,
        query: params.toString(),
      });

      const t0 = performance.now();
      const response = await fetch(url);
      console.log('Response status', { ok: response.ok, status: response.status });
      if (!response.ok) {
        const text = await response.text();
        console.error('Response not OK. Body:', text);
        throw new Error(`API ${response.status}: ${text}`);
      }
      const data = await response.json();
      const t1 = performance.now();
      console.log('Timing (ms)', Math.round(t1 - t0));
      console.log('Data summary', {
        total: data?.total,
        count: Array.isArray(data?.businesses) ? data.businesses.length : 0,
        cached: data?.cached,
        sample: Array.isArray(data?.businesses)
          ? data.businesses.slice(0, 3).map((b: Business) => ({ id: b.id, name: b.name, city: b.city, state: b.state }))
          : []
      });
      
      if (data.businesses && data.businesses.length > 0) {
        // Sort businesses based on sortBy
        let sorted = [...data.businesses];
        if (sortBy === 'featured') {
          sorted.sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return b.rating - a.rating;
          });
        } else if (sortBy === 'rating') {
          sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'reviews') {
          sorted.sort((a, b) => b.reviews - a.reviews);
        } else if (sortBy === 'name') {
          sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        setBusinesses(sorted);
        
        // Extract unique categories (typed)
        const cats = data.businesses
          .map((b: Business) => b.category)
          .filter((c: unknown): c is string => typeof c === 'string' && c.length > 0);
        const uniqueCategories = Array.from(new Set<string>(cats));
        setCategories(uniqueCategories);
        
        // Calculate stats
        const totalReviews = data.businesses.reduce((acc: number, b: Business) => acc + b.reviews, 0);
        const avgRating = data.businesses.length > 0 
          ? data.businesses.reduce((acc: number, b: Business) => acc + b.rating, 0) / data.businesses.length 
          : 0;
          
        setStats({
          total: data.total || data.businesses.length,
          featured: data.businesses.filter((b: Business) => b.is_featured).length,
          verified: data.businesses.filter((b: Business) => b.is_verified).length,
          avgRating,
          totalReviews
        });
      } else {
        console.warn('No businesses returned from API.', { url });
        setBusinesses([]);
        setCategories([]);
        setStats({ total: 0, featured: 0, verified: 0, avgRating: 0, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  const handleLocationChange = (location: { 
    city?: string; 
    state?: string; 
    zipcode?: string; 
    formatted: string 
  }) => {
    if (location.city || location.state) {
      setCityFilter(location.city || '');
      setStateFilter(normalizeStateInput(location.state || ''));
      setLocationQuery(location.formatted);
    } else {
      setCityFilter('');
      setStateFilter('');
      setLocationQuery('');
    }
  };

  const handleGetQuotes = (businessId?: string) => {
    const business = businessId ? businesses.find(b => b.id === businessId) : null;
    
    if (business) {
      setSelectedBusiness(business);
    }
    
    // Set initial data for the modal
    const normalizedState = normalizeStateInput(stateFilter);
    const initialData: any = {
      customerType: 'residential',
      state: normalizedState || undefined,
      city: cityFilter || undefined,
    };
    
    setModalInitialData(initialData);
    setModalStartStep(1); // Start at step 1 (skip customer type selection)
    setQuoteModalOpen(true);
  };

  const displayedBusinesses = showAllBusinesses || !limit ? businesses : businesses.slice(0, limit);

  const BusinessCard = ({ business }: { business: Business }) => (
    <div 
      className={`bg-card rounded-lg border ${
        business.is_featured ? 'border-primary shadow-lg' : ''
      } hover:shadow-xl transition-all p-6`}
    >
      {business.is_featured && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
          <Award className="h-3 w-3" />
          Featured
        </div>
      )}

      <div className="flex items-start gap-4">
        {business.logo_url && (
          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <img 
              src={business.logo_url} 
              alt={business.name} 
              className="w-full h-full object-contain rounded-lg" 
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link 
                href={`/business/${business.id}`} 
                className="hover:text-primary"
              >
                <h3 className="text-xl font-bold mb-1">{business.name}</h3>
              </Link>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                {business.category && (
                  <span className="text-foreground">{business.category}</span>
                )}
                {business.is_verified && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Shield className="h-3 w-3" />
                    Verified listing
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
                <span className="font-bold">{business.rating ? Number(business.rating).toFixed(1) : '0.0'}</span>
                <span className="text-sm text-muted-foreground">({business.reviews})</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mb-3 line-clamp-2">
            {business.description || `Professional ${business.category?.toLowerCase() || 'waste management'} services in ${business.city}, ${business.state}`}
          </p>

          <div className="flex items-center gap-4 text-sm mb-4">
            <a 
              href={`tel:${business.phone}`} 
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
            {onCityClick ? (
              <button
                onClick={() => onCityClick(business.city)}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4" />
                {business.city}, {business.state}
              </button>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {business.city}, {business.state}
              </span>
            )}
            {business.website && (
              <a 
                href={business.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleGetQuotes(business.id)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Get Quote
            </button>
            <Link 
              href={`/business/${business.id}`} 
              className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      {(showLocationSearch || showCategoryFilter) && (
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {showLocationSearch && (
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <GoogleLocationSearch
                  value={locationQuery}
                  onChange={handleLocationChange}
                  placeholder="City, State or ZIP"
                  className="w-full"
                  types={['geocode']}
                />
              </div>
            )}

            {showCategoryFilter && (
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="featured">Featured Only</option>
                  <option value="verified">Verified listings only</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-background text-sm"
              >
                <option value="featured">Featured First</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : ''}>
        {/* Main Content */}
        <div className={showSidebar ? 'lg:col-span-3' : ''}>
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {displayedBusinesses.length} of {businesses.length} providers
            </p>
          </div>

          {/* Business Listings */}
          <div className="space-y-4">
            {displayedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          {/* No Results */}
          {businesses.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No providers found</p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search in a different area
              </p>
              <button
                onClick={() => {
                  setFilter('all');
                  setCityFilter('');
                  setStateFilter('');
                  setLocationQuery('');
                }}
                className="px-4 py-2 border rounded hover:bg-muted"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {limit && businesses.length > limit && !showAllBusinesses && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllBusinesses(true)}
                className="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 font-medium"
              >
                Show All {businesses.length} Providers
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && businesses.length > 0 && (
          <div className="space-y-6">
            {/* Get Quotes Box */}
            <div className="bg-primary text-primary-foreground rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-2">Get Free Quotes</h3>
              <p className="text-white/90 text-sm mb-4">
                Compare prices from {businesses.length} providers
              </p>
              <button
                onClick={() => handleGetQuotes()}
                className="w-full px-4 py-2 bg-background text-foreground rounded hover:bg-background/90 font-medium"
              >
                Get Quotes Now
              </button>
              <div className="mt-4 pt-4 border-t border-primary-foreground/20 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Free, no obligation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Takes 60 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{businesses.length} providers</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats.total > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Directory Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Providers</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Verified listings</span>
                    <span className="font-medium">{stats.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{stats.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Reviews</span>
                    <span className="font-medium">{stats.totalReviews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedBusiness(null);
          setModalInitialData(null);
          setModalStartStep(undefined);
        }}
        businessId={selectedBusiness?.id}
        businessName={selectedBusiness?.name}
        initialData={modalInitialData}
        startAtStep={modalStartStep}
      />
    </div>
  );
}