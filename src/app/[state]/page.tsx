'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, CheckCircle, Phone, ArrowRight, Building2, Users, AlertCircle, Home, ChevronRight, Shield, Clock, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import BusinessDirectory from '@/components/BusinessDirectory';
import LocationMap from '@/components/LocationMap';
import CityClusterMap from '@/components/CityClusterMap';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';

// US States data
const stateNames: Record<string, string> = {
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
  'delaware': 'Delaware', 'district-of-columbia': 'District of Columbia', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
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

export default function StatePage() {
  const params = useParams();
  const stateSlug = params.state as string;
  const stateName = stateNames[stateSlug] || stateSlug;
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
    consent: false
  });

  useEffect(() => {
    console.log('=== VIRGINIA PAGE LOADED ===');
    console.log('State slug:', stateSlug);
    console.log('State name:', stateName);
    console.log('State abbreviation:', STATE_NAME_TO_ABBR[stateSlug]);
    fetchStateData();
    // Set initial map center to state center
    const coords = stateCoordinates[stateSlug] || stateCoordinates['virginia'];
    setMapCenter(coords);
  }, [stateSlug]);

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
          city: c.city,
          count: Number(c.count) || 0
        }));
        setCities(normalizedCities);
        setStats({
          total: Number(data.total) || 0,
          cities: normalizedCities.length
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
    // You could update map center to city coordinates here
    // For now, we'll let the LocationMap handle filtering
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.consent) {
      alert('Please agree to receive quotes');
      return;
    }
    
    // Prepare initial data for the modal
    const initialData: any = {
      customerType: customerType === 'commercial' ? 'commercial' : 'residential',
      zipcode: quoteForm.zipcode,
      dumpsterSize: quoteForm.size,
      debrisType: quoteForm.debrisType,
      email: quoteForm.email,
      phone: quoteForm.phone,
      state: stateName
    };
    
    // Add delivery date if specified
    if (quoteForm.deliveryDate !== 'asap') {
      initialData.deliveryDate = quoteForm.deliveryDate;
    }
    
    setModalInitialData(initialData);
    setModalStartStep(1); // Start at step 1 (skip customer type selection)
    setQuoteModalOpen(true);
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

      {/* Hero Section with Quote Form */}
      <section className="hero-gradient-secondary text-white relative">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Headlines */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Dumpster Rental in {stateName}
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Compare quotes from {stats.total}+ verified providers across {stats.cities} cities. 
                Same-day delivery available.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Same-Day Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current" />
                  <span>4.7/5 Average Rating</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-white/80 text-sm">Service Providers</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.cities}</div>
                  <div className="text-white/80 text-sm">Cities Covered</div>
                </div>
              </div>
            </div>

            {/* Right: Quick Quote Form */}
            <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-900">
              <h2 className="text-2xl font-bold mb-4">Get Instant Quotes</h2>
              
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                {/* ZIP Code */}
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code in {stateName}</label>
                  <input
                    type="text"
                    value={quoteForm.zipcode}
                    onChange={(e) => setQuoteForm({...quoteForm, zipcode: e.target.value})}
                    placeholder="Enter ZIP"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Dumpster Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['10-yard', '20-yard', '30-yard', '40-yard'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setQuoteForm({...quoteForm, size})}
                        className={`p-2 border rounded-lg text-sm transition ${
                          quoteForm.size === size 
                            ? 'border-primary bg-primary/10 font-semibold' 
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {size.replace('-', ' ')}
                        {size === '20-yard' && <span className="text-xs text-primary ml-1">Popular</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                {/* TCPA Consent */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={quoteForm.consent}
                    onChange={(e) => setQuoteForm({...quoteForm, consent: e.target.checked})}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="consent" className="text-xs text-gray-600">
                    I agree to receive quotes via phone/text. Message rates may apply.
                  </label>
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 btn-primary rounded-lg font-semibold"
                  >
                    Get Quotes from {stateName} Providers
                  </button>
                  <a
                    href="tel:1-855-DUMPSTER"
                    className="w-full py-2 btn-ghost-primary rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call: 1-855-DUMPSTER
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Cities Grid with Provider Counts */}
        {cities.length > 0 && !isVirginia && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Select a City in {stateName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedCity('')}
                className={`p-3 rounded-lg border transition ${
                  selectedCity === '' 
                    ? 'border-primary bg-primary/10 font-semibold' 
                    : 'border-gray-200 hover:border-primary bg-white'
                }`}
              >
                <div className="text-sm font-medium">All Cities</div>
                <div className="text-xs text-muted-foreground">{stats.total} providers</div>
              </button>
              {cities.map(cityData => (
                <button
                  key={cityData.city}
                  onClick={() => handleCityClick(cityData.city)}
                  className={`p-3 rounded-lg border transition text-left ${
                    selectedCity === cityData.city 
                      ? 'border-primary bg-primary/10 font-semibold' 
                      : 'border-gray-200 hover:border-primary bg-white'
                  }`}
                >
                  <div className="text-sm font-medium">{cityData.city}</div>
                  <div className="text-xs text-muted-foreground">
                    {cityData.count} {cityData.count === 1 ? 'provider' : 'providers'}
                  </div>
                </button>
              ))}
            </div>
            {cities.length > 18 && (
              <div className="text-center mt-4">
                <Link
                  href="#all-cities"
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  View all {cities.length} cities →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Cities with Provider Counts - Like locations page */}
        {cities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Cities We Serve in {stateName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cities.slice(0, 20).map(cityData => (
                <Link
                  key={cityData.city}
                  href={`/${stateSlug}/${cityData.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-lg border hover:border-primary hover:shadow-lg transition-all p-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base group-hover:text-primary">{cityData.city}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cityData.count} {cityData.count === 1 ? 'provider' : 'providers'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1" />
                  </div>
                </Link>
              ))}
            </div>
            {cities.length > 20 && !showAllCities && (
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowAllCities(true)}
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
                >
                  View all {cities.length} cities in {stateName}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* Map Section - City Clusters */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Service Coverage in {stateName}
            </h2>
            <p className="text-muted-foreground">
              Click on any city to view local providers and get instant quotes
            </p>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden" style={{ height: '600px' }}>
            <CityClusterMap
              state={stateName}
              stateSlug={stateSlug}
              cities={cities}
              mapCenter={mapCenter || stateCoordinates[stateSlug] || stateCoordinates['virginia']}
              onCitySelect={(city) => {
                const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                // Navigate to city page instead of filtering
                window.location.href = `/${stateSlug}/${citySlug}`;
              }}
            />
          </div>
        </section>

        {/* Business Directory - Shows All State Providers */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCity 
              ? `All Providers in ${selectedCity}, ${stateName}` 
              : `All Service Providers in ${stateName}`}
          </h2>
          <BusinessDirectory
            initialState={STATE_NAME_TO_ABBR[stateSlug] || stateSlug.toUpperCase()}
            initialCity={selectedCity}
            showLocationSearch={false}
            showCategoryFilter={true}
            showSidebar={true}
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
              you with {stats.total} verified local providers across {stats.cities} cities, ensuring you get competitive 
              pricing and reliable service for your project. Whether you need a 10-yard dumpster for a small home cleanout 
              or a 40-yard container for major construction, our network of providers has you covered.
            </p>
            <p className="text-muted-foreground mb-4">
              {stateName} contractors and homeowners trust our platform to deliver transparent pricing, same-day delivery 
              options, and professional service. Every provider in our network is vetted for proper licensing and insurance, 
              giving you peace of mind that your waste disposal needs are handled professionally and in compliance with 
              local regulations.
            </p>
            <p className="text-muted-foreground">
              Popular services in {stateName} include residential dumpster rentals for home renovations, commercial containers 
              for business waste management, construction debris removal, and specialized disposal for roofing materials 
              and concrete. Get instant quotes from multiple providers and choose the best option for your budget and timeline.
            </p>
          </div>
        </section>
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedProvider(null);
          setModalInitialData(null);
          setModalStartStep(undefined);
        }}
        businessId={selectedProvider?.id}
        businessName={selectedProvider?.name}
        initialCustomerType={customerType === 'commercial' ? 'commercial' : 'residential'}
        initialData={modalInitialData}
        startAtStep={modalStartStep}
      />
    </div>
  );
}