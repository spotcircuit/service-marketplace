'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  Phone, 
  Clock, 
  Shield, 
  Award, 
  ArrowRight,
  Building2,
  Users,
  AlertCircle,
  ChevronRight,
  Home,
  Info,
  FileText,
  HelpCircle,
  Filter,
  MessageSquare,
  Zap,
  Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';
import { useNiche } from '@/hooks/useNiche';
import { useRouter } from 'next/navigation';

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
  price_range?: string;
  response_time?: string;
  zipcode?: string;
}

interface ServiceStats {
  total_businesses: number;
  avg_rating: number;
  total_reviews: number;
  cities: Array<{ city: string; state: string; count: number }>;
}

type BreadcrumbItem = {
  label: string;
  href: string;
  icon?: React.ElementType;
};

// Service name formatting
const formatServiceName = (slug: string): string => {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Popular cities by state
const popularCitiesData: Record<string, string[]> = {
  'north-carolina': ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Winston-Salem', 'Cary'],
  'texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso'],
  'california': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento'],
  'florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Fort Lauderdale'],
  'new-york': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers']
};

export default function ServicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { niche, terminology, categories } = useNiche();
  
  const serviceSlug = params.service as string;
  const serviceName = formatServiceName(serviceSlug);
  
  // Get location from search params if navigated from a city/state page
  const cityParam = searchParams.get('city');
  const stateParam = searchParams.get('state');
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedState, setSelectedState] = useState(stateParam || '');
  const [selectedCity, setSelectedCity] = useState(cityParam || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{city: string; state: string}>>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalStartStep, setModalStartStep] = useState<number | undefined>(undefined);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [topCities, setTopCities] = useState<Array<{ city: string; state: string; count: number }>>([]);

  useEffect(() => {
    fetchBusinesses();
  }, [serviceSlug, selectedState, selectedCity, sortBy, locationFilter]);

  useEffect(() => {
    // Generate suggestions based on input
    if (locationFilter.length > 1) {
      const allCities: Array<{city: string; state: string}> = [];
      businesses.forEach(b => {
        if (!allCities.find(c => c.city === b.city && c.state === b.state)) {
          allCities.push({ city: b.city, state: b.state });
        }
      });
      
      const filtered = allCities.filter(c => {
        const searchTerm = locationFilter.toLowerCase();
        const cityState = `${c.city}, ${c.state}`.toLowerCase();
        return cityState.includes(searchTerm) || 
               c.city.toLowerCase().includes(searchTerm) || 
               c.state.toLowerCase().includes(searchTerm);
      }).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [locationFilter, businesses]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('category', serviceName);
      
      if (selectedCity && selectedState) {
        const cityName = selectedCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const stateName = stateNames[selectedState] || selectedState;
        params.set('city', cityName);
        params.set('state', stateName);
      } else if (selectedState) {
        const stateName = stateNames[selectedState] || selectedState;
        params.set('state', stateName);
      }

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const data = await response.json();
      
      const businessesData: Business[] = Array.isArray(data.businesses) ? (data.businesses as Business[]) : [];
      if (businessesData.length > 0) {
        // Sort businesses
        let sorted = [...businessesData];
        if (sortBy === 'featured') {
          sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        } else if (sortBy === 'rating') {
          sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'reviews') {
          sorted.sort((a, b) => b.reviews - a.reviews);
        }
        
        setBusinesses(sorted);
        
        // Calculate stats
        const cities = businessesData.reduce(
          (
            acc: Array<{ city: string; state: string; count: number }>,
            b: Business
          ) => {
            const existing = acc.find(c => c.city === b.city && c.state === b.state);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ city: b.city, state: b.state, count: 1 });
            }
            return acc;
          },
          [] as Array<{ city: string; state: string; count: number }>
        );
        
        setTopCities(cities.sort((a, b) => b.count - a.count).slice(0, 10));
        
        const stats: ServiceStats = {
          total_businesses: Number(data.total) || businessesData.length,
          avg_rating: businessesData.length > 0 
            ? businessesData.reduce((acc: number, b: Business) => acc + b.rating, 0) / businessesData.length 
            : 0,
          total_reviews: businessesData.reduce((acc: number, b: Business) => acc + b.reviews, 0),
          cities: cities
        };
        setServiceStats(stats);
      } else {
        setBusinesses([]);
        setServiceStats(null);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation) {
      // Parse location (could be "City, State" or "ZIP")
      const parts = searchLocation.split(',').map(s => s.trim());
      if (parts.length === 2) {
        const city = parts[0].toLowerCase().replace(/\s+/g, '-');
        const state = Object.entries(stateNames).find(([_, name]) => 
          name.toLowerCase() === parts[1].toLowerCase()
        )?.[0];
        if (state) {
          router.push(`/${state}/${city}?service=${serviceSlug}`);
        }
      }
    }
  };

  const handleGetQuotes = () => {
    const initialData: any = {
      customerType: 'residential',
      state: selectedState ? stateNames[selectedState] : undefined,
      city: selectedCity ? selectedCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : undefined,
    };
    setModalInitialData(initialData);
    setModalStartStep(1);
    setQuoteModalOpen(true);
  };

  const handleSelectBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setSelectedBusiness(business);
      const initialData: any = {
        customerType: 'residential',
        city: business.city,
        state: business.state,
        zipcode: business.zipcode || undefined,
      };
      setModalInitialData(initialData);
      setModalStartStep(1);
    }
    setQuoteModalOpen(true);
  };

  // Apply location filter
  const filteredBusinesses = businesses.filter(b => {
    if (!locationFilter) return true;
    const searchTerm = locationFilter.toLowerCase();
    const cityState = `${b.city}, ${b.state}`.toLowerCase();
    return cityState.includes(searchTerm) || 
           b.city.toLowerCase().includes(searchTerm) || 
           b.state.toLowerCase().includes(searchTerm);
  });
  
  const displayedBusinesses = showAllBusinesses ? filteredBusinesses : filteredBusinesses.slice(0, 10);

    // Build dynamic breadcrumb based on navigation context
  const getBreadcrumb = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: Home }
    ];

    if (selectedState && selectedCity) {
      // Came from city page: Home > State > City > Service
      items.push({ 
        label: stateNames[selectedState] || selectedState, 
        href: `/${selectedState}` 
      });
      items.push({ 
        label: selectedCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
        href: `/${selectedState}/${selectedCity}` 
      });
    }
    
    items.push({ 
      label: serviceName, 
      href: `/services/${serviceSlug}` 
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumb();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading {serviceName} providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Bar */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-foreground font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-primary flex items-center gap-1">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">
            {serviceName} {terminology?.service.providers || 'Providers'}
            {selectedCity && selectedState && ` in ${selectedCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}, ${stateNames[selectedState]}`}
            {!selectedCity && selectedState && ` in ${stateNames[selectedState]}`}
          </h1>
          <p className="text-muted-foreground">
            Compare {businesses.length} verified providers • Get free quotes • Read real reviews
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Service Categories */}
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-3">Services</h3>
                <div className="space-y-1">
                  {categories.slice(0, 8).map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/services/${cat.slug}`}
                      className={`block px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors ${
                        cat.slug === serviceSlug ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    className="block px-2 py-1.5 text-sm text-primary hover:bg-muted rounded transition-colors"
                  >
                    All Services →
                  </Link>
                </div>
              </div>

              {/* Popular Locations */}
              {topCities.length > 0 && (
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-semibold text-sm mb-3">Top Locations</h3>
                  <div className="space-y-1">
                    {topCities.slice(0, 5).map(city => {
                      const stateSlug = Object.entries(stateNames).find(([_, name]) => 
                        name === city.state
                      )?.[0] || city.state.toLowerCase().replace(/\s+/g, '-');
                      const citySlug = city.city.toLowerCase().replace(/\s+/g, '-');
                      
                      return (
                        <Link
                          key={`${city.city}-${city.state}`}
                          href={`/${stateSlug}/${citySlug}?service=${serviceSlug}`}
                          className="block px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors"
                        >
                          <div>{city.city}</div>
                          <div className="text-xs text-muted-foreground">{city.count} providers</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resources */}
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-3">Resources</h3>
                <div className="space-y-1">
                  <Link href="/how-it-works" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors">
                    <Info className="h-3.5 w-3.5" />
                    How It Works
                  </Link>
                  <Link href="/for-business" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors">
                    <Building2 className="h-3.5 w-3.5" />
                    For Business
                  </Link>
                  <Link href="/blog" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                    Blog
                  </Link>
                  <Link href="/help" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Help
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {businesses.length === 0 ? (
              /* No Data Message */
              <div className="bg-card rounded-lg border p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No {serviceName} Providers Found</h2>
                <p className="text-muted-foreground mb-6">
                  Try searching in a different location or browse all services.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/directory"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Browse All Providers
                  </Link>
                  <Link
                    href="/for-business"
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                  >
                    Join as Provider
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Filter Bar */}
                <div className="bg-card rounded-lg border p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by Location</label>
                      <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Type city or state..."
                        className="w-full px-3 py-2 border rounded bg-background text-sm"
                      />
                      {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
                          {suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setLocationFilter(`${s.city}, ${s.state}`);
                                setShowSuggestions(false);
                                // Update the actual filters
                                const stateSlug = Object.entries(stateNames).find(([_, name]) => 
                                  name === s.state
                                )?.[0] || s.state.toLowerCase().replace(/\s+/g, '-');
                                setSelectedState(stateSlug);
                                setSelectedCity(s.city.toLowerCase().replace(/\s+/g, '-'));
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                            >
                              {s.city}, {s.state}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="sm:w-48">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-background text-sm"
                      >
                        <option value="featured">Featured First</option>
                        <option value="rating">Highest Rated</option>
                        <option value="reviews">Most Reviews</option>
                      </select>
                    </div>
                    {locationFilter && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setLocationFilter('');
                            setSelectedState('');
                            setSelectedCity('');
                          }}
                          className="px-3 py-2 text-sm border rounded hover:bg-muted"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {displayedBusinesses.length} of {filteredBusinesses.length} {serviceName} providers{locationFilter && ` in "${locationFilter}"`}
                  </p>
                </div>

                {/* Business Listings */}
                <div className="space-y-4">
                  {displayedBusinesses.map((business) => (
                    <div 
                      key={business.id} 
                      className={`bg-card rounded-lg border ${
                        business.is_featured ? 'border-primary' : ''
                      } hover:shadow-md transition-all p-6`}
                    >
                      {business.is_featured && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-3">
                          <Award className="h-3 w-3" />
                          Featured
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        {/* Business Logo */}
                        {business.logo_url && (
                          <div className="flex-shrink-0">
                            <img 
                              src={business.logo_url} 
                              alt={business.name} 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Business Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link 
                                href={`/business/${business.id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                              >
                                {business.name}
                              </Link>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-primary text-primary" />
                                  <span className="font-medium">{business.rating}</span>
                                  <span className="text-muted-foreground">({business.reviews})</span>
                                </div>
                                
                                {business.is_verified && (
                                  <span className="flex items-center gap-1 text-primary">
                                    <CheckCircle className="h-4 w-4" />
                                    Verified
                                  </span>
                                )}
                                
                                <span className="text-muted-foreground">
                                  {business.city}, {business.state}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {business.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {business.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary">
                              <Phone className="h-3.5 w-3.5" />
                              {business.phone}
                            </a>
                            {business.years_in_business && (
                              <span>{business.years_in_business}+ years experience</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectBusiness(business.id)}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium"
                            >
                              Get Quote
                            </button>
                            <Link
                              href={`/business/${business.id}`}
                              className="px-4 py-2 border rounded hover:bg-muted text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {filteredBusinesses.length > 10 && !showAllBusinesses && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAllBusinesses(true)}
                      className="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 font-medium"
                    >
                      Show All {filteredBusinesses.length} Providers
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Get Quotes Box */}
              <div className="bg-primary text-primary-foreground rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2">Get Free Quotes</h3>
                <p className="text-white/90 text-sm mb-4">
                  Compare {serviceName} prices from {businesses.length} providers
                </p>
                <button
                  onClick={handleGetQuotes}
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

              {/* Service Stats */}
              {serviceStats && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="font-semibold mb-4">{serviceName} Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Providers</span>
                      <span className="font-medium">{serviceStats.total_businesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{serviceStats.avg_rating ? serviceStats.avg_rating.toFixed(1) : '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Reviews</span>
                      <span className="font-medium">{serviceStats.total_reviews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cities Served</span>
                      <span className="font-medium">{serviceStats.cities.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* How It Works */}
              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-semibold mb-4">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <div className="font-medium text-sm">Submit Request</div>
                      <div className="text-xs text-muted-foreground">Describe your {serviceName.toLowerCase()} needs</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <div className="font-medium text-sm">Get Quotes</div>
                      <div className="text-xs text-muted-foreground">Receive multiple quotes</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <div className="font-medium text-sm">Choose & Book</div>
                      <div className="text-xs text-muted-foreground">Pick the best provider</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Why Choose Us</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Verified Providers</div>
                      <div className="text-xs text-muted-foreground">Licensed & insured</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Real Reviews</div>
                      <div className="text-xs text-muted-foreground">From verified customers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Fast Response</div>
                      <div className="text-xs text-muted-foreground">Usually within 2 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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