'use client';

import Link from 'next/link';
import { MapPin, Star, CheckCircle, Phone, ArrowRight, Building2, Users, AlertCircle, Home, ChevronRight, Shield, Clock, Truck, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import BusinessDirectory from '@/components/BusinessDirectory';
import LocationMap from '@/components/LocationMap';
import CityClusterMap from '@/components/CityClusterMap';
import DumpsterQuoteModalSimple from '@/components/DumpsterQuoteModalSimple';
import DirectoryDisclaimer from '@/components/DirectoryDisclaimer';
import { useConfig } from '@/contexts/ConfigContext';

// State coordinates for centering map
const stateCoordinates: Record<string, {lat: number, lng: number}> = {
  'virginia': { lat: 37.4316, lng: -78.6569 },
  'maryland': { lat: 39.0458, lng: -76.6413 },
  'north-carolina': { lat: 35.7596, lng: -79.0193 },
  'pennsylvania': { lat: 41.2033, lng: -77.1945 },
  'delaware': { lat: 38.9108, lng: -75.5277 },
  'district-of-columbia': { lat: 38.9072, lng: -77.0369 },
  'west-virginia': { lat: 38.5976, lng: -80.4549 }
};

interface StatePageClientProps {
  stateSlug: string;
  stateName: string;
}

export default function StatePageClient({ stateSlug, stateName }: StatePageClientProps) {
  const isVirginia = stateSlug === 'virginia';
  
  const [cities, setCities] = useState<{city: string; count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, cities: 0 });
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [customerType, setCustomerType] = useState<'all' | 'residential' | 'commercial'>('all');
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalStartStep, setModalStartStep] = useState<number | undefined>(undefined);
  const [showAllCities, setShowAllCities] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<{city: string; count: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // Map full state names to abbreviations
  const STATE_NAME_TO_ABBR: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'district-of-columbia': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI',
    'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME',
    'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
    'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
    'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM',
    'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI',
    'south-carolina': 'SC', 'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX',
    'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
    'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    zipcode: '',
    size: '20-yard',
    debrisType: 'general',
    deliveryDate: 'asap',
    phone: '',
    email: '',
    consent: true,
    projectType: '' as string,
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [zipcodeDisplay, setZipcodeDisplay] = useState<string>('');
  const { config } = useConfig();

  // Dumpster sizes data
  type SizeCard = {
    size: string;
    id: string;
    dimensions: string;
    capacity: string;
    projects: string;
    price: string;
    image: string;
    popular?: boolean;
  };

  const dumpsterSizes: SizeCard[] = [
    {
      size: '10-Yard',
      id: '10-yard',
      dimensions: '14\' × 8\' × 3.5\'',
      capacity: '4 pickup loads',
      projects: 'Single room, garage cleanout',
      price: `$295-$395`,
      image: '🚛',
    },
    {
      size: '20-Yard',
      id: '20-yard',
      dimensions: '16\' × 8\' × 5.5\'',
      capacity: '8 pickup loads',
      projects: 'Kitchen remodel, flooring',
      price: `$395-$595`,
      image: '🚛',
      popular: true,
    },
    {
      size: '30-Yard',
      id: '30-yard',
      dimensions: '20\' × 8\' × 6\'',
      capacity: '12 pickup loads',
      projects: 'Full home renovation',
      price: `$495-$695`,
      image: '🚚',
    },
    {
      size: '40-Yard',
      id: '40-yard',
      dimensions: '22\' × 8\' × 8\'',
      capacity: '16 pickup loads',
      projects: 'Major construction',
      price: `$595-$795`,
      image: '🚚',
    },
  ];

  const projectTypesResidential = [
    { id: 'home-cleanout', label: 'Home Clean Out' },
    { id: 'moving', label: 'Moving' },
    { id: 'construction', label: 'Construction/Demolition' },
    { id: 'heavy-debris', label: 'Heavy Debris' },
    { id: 'landscaping', label: 'Landscaping/Other' },
  ];

  const projectTypesCommercial = [
    { id: 'office-cleanout', label: 'Office Cleanout' },
    { id: 'retail-fitout', label: 'Retail Build-Out/Closeout' },
    { id: 'construction', label: 'Construction/Demolition' },
    { id: 'industrial-heavy', label: 'Industrial/Heavy Debris' },
    { id: 'landscaping', label: 'Landscaping/Events' },
  ];

  // Auto-lookup city/state when zipcode is entered
  useEffect(() => {
    const lookupZipcode = async () => {
      // Only lookup if we have a 5-digit zipcode
      if (quoteForm.zipcode.length === 5 && /^\d{5}$/.test(quoteForm.zipcode)) {
        try {
          const response = await fetch(`/api/zipcode?zip=${quoteForm.zipcode}`);
          if (response.ok) {
            const data = await response.json();
            if (data.city && data.state) {
              setZipcodeDisplay(`${data.city}, ${data.state}`);
            }
          }
        } catch (error) {
          console.error('Failed to lookup zipcode:', error);
        }
      } else {
        setZipcodeDisplay('');
      }
    };

    const debounceTimer = setTimeout(lookupZipcode, 300);
    return () => clearTimeout(debounceTimer);
  }, [quoteForm.zipcode]);

  useEffect(() => {
    console.log('=== STATE PAGE LOADED ===');
    console.log('State slug:', stateSlug);
    console.log('State name:', stateName);
    console.log('State abbreviation:', STATE_NAME_TO_ABBR[stateSlug]);
    fetchStateData();
    // Set initial map center to state center
    const coords = stateCoordinates[stateSlug] || stateCoordinates['virginia'];
    setMapCenter(coords);
  }, [stateSlug]);

  useEffect(() => {
    // Ensure header/hero tone inversion applies via :root attribute
    document.documentElement.setAttribute('data-header-tone', 'secondary');
    return () => {
      document.documentElement.removeAttribute('data-header-tone');
    };
  }, []);

  const fetchStateData = async () => {
    // Prepare abort controller and timeout outside try so we can clear in finally
    let controller: AbortController | null = null;
    let timeoutId: any = null;
    try {
      // Convert state slug to abbreviation for API call
      const stateAbbr = STATE_NAME_TO_ABBR[stateSlug] || stateSlug.toUpperCase();
      const url = `/api/businesses/stats?state=${stateAbbr}`;
      console.log('[StatePage] Fetching state stats', { slug: stateSlug, stateAbbr, url });
      console.time('[StatePage] /api/businesses/stats');

      // Use AbortController to avoid indefinite hangs
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort('timeout' as any), 10000);

      // Use the state-specific endpoint; bypass any cache during debugging
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      const statusInfo = { ok: response.ok, status: response.status, statusText: response.statusText };
      console.log('[StatePage] Stats response status', statusInfo);

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('[StatePage] Failed to parse JSON from stats response', jsonErr);
      }
      console.timeEnd('[StatePage] /api/businesses/stats');
      console.log('[StatePage] Stats data summary', {
        hasData: !!data,
        total: data?.total,
        citiesCount: Array.isArray(data?.cities) ? data.cities.length : 0,
        sampleCities: Array.isArray(data?.cities) ? data.cities.slice(0, 3) : []
      });

      if (data?.cities && data.cities.length > 0) {
        const normalizedCities = data.cities.map((c: any) => ({
          city: String(c.city || '').trim(),
          count: Number(c.count) || 0
        }));

        // Deduplicate by city name (case-insensitive), aggregate counts
        const cityMap = new Map<string, { city: string; count: number }>();
        for (const c of normalizedCities) {
          const key = c.city.toLowerCase();
          if (!key) continue;
          const existing = cityMap.get(key);
          if (existing) {
            existing.count += c.count;
          } else {
            cityMap.set(key, { city: c.city, count: c.count });
          }
        }

        // Sort by count desc, then city name asc
        const uniqueCities = Array.from(cityMap.values()).sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return a.city.localeCompare(b.city);
        });

        setCities(uniqueCities);
        setStats({
          total: Number(data.total) || 0,
          cities: uniqueCities.length
        });
      } else {
        console.warn('[StatePage] No cities returned for state', { slug: stateSlug, stateAbbr, url });
        setCities([]);
        setStats({ total: 0, cities: 0 });
      }
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        console.warn('[StatePage] Stats request aborted due to timeout');
      } else {
        console.error('[StatePage] Error fetching state data', error);
      }
      setCities([]);
    } finally {
      try { if (timeoutId) { clearTimeout(timeoutId); } } catch {}
      setLoading(false);
    }
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setCitySearchQuery(city);
    // Scroll to top of results section
    setTimeout(() => {
      const resultsSection = document.getElementById('business-results');
      if (resultsSection) {
        const yOffset = -80; // Offset for any fixed header
        const y = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCitySearch = (query: string) => {
    setCitySearchQuery(query);
    if (query.trim()) {
      const filtered = cities.filter(city => 
        city.city.toLowerCase().includes(query.toLowerCase())
      );
      setCitySuggestions(filtered.slice(0, 10));
      setShowCitySuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setSelectedCity('');
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.consent) {
      alert('Please agree to receive quotes');
      return;
    }

    // First, look up city from zipcode if needed
    let city = '';
    let state = stateName;
    
    if (quoteForm.zipcode) {
      try {
        const zipResponse = await fetch(`/api/zipcode?zip=${quoteForm.zipcode}`);
        if (zipResponse.ok) {
          const zipData = await zipResponse.json();
          city = zipData.city || '';
          state = zipData.state || stateName;
        }
      } catch (error) {
        console.error('Failed to lookup zipcode:', error);
      }
    }

    // Prepare the quote data
    const quoteData = {
      customerType,
      zipcode: quoteForm.zipcode,
      debrisType: quoteForm.debrisType,
      dumpsterSize: quoteForm.size,
      email: quoteForm.email,
      phone: quoteForm.phone,
      projectType: quoteForm.projectType || 'general',
      deliveryDate: quoteForm.deliveryDate === 'date' ? selectedDate : quoteForm.deliveryDate,
      source: 'state-page',
      city,
      state,
    };

    // Submit quote directly
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const result = await response.json();
        // Show success and open modal for additional options
        const initialData: any = {
          customerType,
          zipcode: quoteForm.zipcode,
          dumpsterSize: quoteForm.size,
          debrisType: quoteForm.debrisType,
          email: quoteForm.email,
          phone: quoteForm.phone,
          city,
          state,
        };
        
        setModalInitialData(initialData);
        setQuoteModalOpen(true);
      } else {
        alert('Failed to submit quote. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="hover:text-primary flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href="/locations" className="hover:text-primary">Locations</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{stateName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-hero-foreground relative">
        <div className="container mx-auto px-4 py-12">
          <div>
            {/* Headlines */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Dumpster Rental in {stateName}
              </h1>
              <p className="text-xl text-hero-foreground/90 mb-6">
                Compare quotes from {stats.total}+ local providers across {stats.cities} cities. 
                Same-day or next-day delivery may be available.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Provider credentials vary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Same-day may be available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current" />
                  <span>4.7/5 Average Rating</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-hero-foreground/80 text-sm">Service Providers</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.cities}</div>
                  <div className="text-hero-foreground/80 text-sm">Cities Covered</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-hero-foreground/80 text-sm">Support Available</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">Free</div>
                  <div className="text-hero-foreground/80 text-sm">Quote Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Map Section - City Clusters (Moved to top) */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">
              Service Coverage in {stateName}
            </h2>
            <p className="text-muted-foreground">
              Click on any city to filter providers or use the search below
            </p>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden" style={{ height: '350px' }}>
            <CityClusterMap
              state={stateName}
              stateSlug={stateSlug}
              cities={cities}
              mapCenter={mapCenter || stateCoordinates[stateSlug] || stateCoordinates['virginia']}
              onCitySelect={(city) => {
                setSelectedCity(city);
                setCitySearchQuery(city);
                // Scroll to top of results section
                setTimeout(() => {
                  const resultsSection = document.getElementById('business-results');
                  if (resultsSection) {
                    const yOffset = -80; // Offset for any fixed header
                    const y = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 100);
              }}
            />
          </div>
        </section>

        {/* City Filter and Search Controls - Compact Design */}
        <section className="mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-wrap gap-3">
              {/* City Search with Autocomplete */}
              <div className="flex-1 min-w-[200px] relative">
                <label className="block text-xs font-medium mb-1">Search City</label>
                <div className="relative">
                  <input
                    type="text"
                    value={citySearchQuery}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    onFocus={() => setShowCitySuggestions(true)}
                    placeholder="Type city name..."
                    className="w-full px-3 py-1.5 pr-8 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {citySearchQuery && (
                    <button
                      onClick={() => {
                        setCitySearchQuery('');
                        setSelectedCity('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={city.city}
                          onClick={() => {
                            setCitySearchQuery(city.city);
                            setSelectedCity(city.city);
                            setShowCitySuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between items-center"
                        >
                          <span>{city.city}</span>
                          <span className="text-xs text-gray-500">{city.count} providers</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Business Name Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium mb-1">Search Business</label>
                <input
                  type="text"
                  value={businessSearchQuery}
                  onChange={(e) => setBusinessSearchQuery(e.target.value)}
                  placeholder="Business name..."
                  className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category Filter - Compact */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All</option>
                  <option value="Dumpster Rental">Dumpster</option>
                  <option value="Waste Management">Waste</option>
                  <option value="Junk Removal">Junk</option>
                  <option value="Construction Debris">Construction</option>
                </select>
              </div>

              {/* Sort By - Compact */}
              <div className="min-w-[100px]">
                <label className="block text-xs font-medium mb-1">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="rating">Rating</option>
                  <option value="reviews">Reviews</option>
                  <option value="name">A-Z</option>
                </select>
              </div>

              {/* City Results Button */}
              {selectedCity && (
                <div className="flex items-end">
                  <Link
                    href={`/${stateSlug}/${selectedCity.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    View City
                  </Link>
                </div>
              )}

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCity('');
                    setCitySearchQuery('');
                    setBusinessSearchQuery('');
                    setSelectedCategory('');
                    setSortBy('rating');
                  }}
                  className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* City Pills - Much Larger Section */}
            {cities.length > 0 && (
              <div className="mt-8 pt-8 border-t-2">
                <div className="mb-4 text-lg font-semibold">Quick City Selection:</div>
                <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border">
                  <button
                    onClick={() => {
                      setSelectedCity('');
                      setCitySearchQuery('');
                    }}
                    className={`px-5 py-3 rounded-lg text-base whitespace-nowrap transition shadow-sm ${
                      selectedCity === '' 
                        ? 'bg-primary text-white font-semibold shadow-md' 
                        : 'bg-white hover:bg-gray-50 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    All Cities in {stateName} ({stats.total})
                  </button>
                  {cities.map(cityData => (
                    <button
                      key={cityData.city}
                      onClick={() => handleCityClick(cityData.city)}
                      className={`px-5 py-3 rounded-lg text-base whitespace-nowrap transition shadow-sm ${
                        selectedCity === cityData.city 
                          ? 'bg-primary text-white font-semibold shadow-md' 
                          : 'bg-white hover:bg-gray-50 border border-gray-300 hover:border-primary'
                      }`}
                    >
                      {cityData.city} ({cityData.count})
                    </button>
                  ))}
                </div>
                {showAllCities && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setShowAllCities(false)}
                      className="text-sm text-gray-600 hover:text-primary"
                    >
                      Show Less
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Business Directory - Shows All State Providers */}
        <section id="business-results">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCity 
              ? `All Providers in ${selectedCity}, ${stateName}` 
              : businessSearchQuery
              ? `Search Results for "${businessSearchQuery}" in ${stateName}`
              : `All Service Providers in ${stateName}`}
          </h2>
          <BusinessDirectory
            initialState={STATE_NAME_TO_ABBR[stateSlug]}
            initialCity={selectedCity}
            initialSearchQuery={businessSearchQuery}
            initialCategory={selectedCategory}
            initialSortBy={sortBy}
            showLocationSearch={false}
            showCategoryFilter={false}
            showSidebar={true}
            onCityClick={(city: string) => {
              // Navigate to city page when city/state is clicked in results
              const citySlug = city.toLowerCase().replace(/\s+/g, '-');
              window.location.href = `/${stateSlug}/${citySlug}`;
            }}
          />
        </section>

        {/* All Cities Section (if more than 18) */}
        {showAllCities && cities.length > 0 && (
          <section id="all-cities" className="mt-12 mb-12">
            <h2 className="text-2xl font-bold mb-6">All Cities in {stateName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cities.map(cityData => (
                <Link
                  key={cityData.city}
                  href={`/${stateSlug}/${cityData.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-card rounded-lg border hover:border-primary hover:shadow-md transition p-3 group"
                >
                  <div className="text-sm font-semibold group-hover:text-primary">{cityData.city}</div>
                  <div className="text-xs text-muted-foreground">
                    {cityData.count} {cityData.count === 1 ? 'provider' : 'providers'}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content */}
        <section className="mt-12">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold mb-4">
              Dumpster Rental Services Throughout {stateName}
            </h2>
            <p className="text-muted-foreground mb-4">
              Finding the right dumpster rental company in {stateName} has never been easier. Our marketplace connects 
              you with {stats.total} local providers across {stats.cities} cities, helping you compare options for 
              your project. Whether you need a 10-yard dumpster for a small home cleanout or a 40-yard container for 
              major construction, our network of providers has you covered.
            </p>
            <p className="text-muted-foreground mb-4">
              {stateName} pros and homeowners use our platform to compare transparent pricing, check availability, and find professional service. Many providers are licensed and insured; credentials vary—please verify details directly with the provider.
            </p>
            <p className="text-muted-foreground">
              Popular services in {stateName} include residential dumpster rentals for home renovations, commercial containers 
              for business waste management, construction debris removal, and specialized disposal for roofing materials 
              and concrete. Get instant quotes from multiple providers and choose the best option for your budget and timeline.
            </p>
          </div>
        </section>
        {/* Directory Disclaimer */}
        <DirectoryDisclaimer />
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModalSimple
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedProvider(null);
          setModalInitialData(null);
          setModalStartStep(undefined);
        }}
        businessId={selectedProvider?.id}
        businessName={selectedProvider?.name}
        initialData={modalInitialData || { dumpsterSize: "20-yard" }}
      />
    </div>
  );
}