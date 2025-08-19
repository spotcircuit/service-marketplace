'use client';

import Link from 'next/link';
import { MapPin, Star, CheckCircle, Phone, ArrowRight, Building2, Users, AlertCircle, Home, ChevronRight, Shield, Clock, Truck } from 'lucide-react';
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
    // You could update map center to city coordinates here
    // For now, we'll let the LocationMap handle filtering
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

      {/* Hero Section with Quote Form */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-hero-foreground relative">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Headlines */}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-hero-foreground/80 text-sm">Service Providers</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.cities}</div>
                  <div className="text-hero-foreground/80 text-sm">Cities Covered</div>
                </div>
              </div>
            </div>

            {/* Right: Quote Form */}
            <div className="bg-white rounded-xl shadow-2xl p-2 md:p-2.5 text-gray-900 -mt-2 md:-mt-3 lg:-mt-6 relative">
              {/* Call button anchored to the card's top-right corner */}
              <a
                href={`tel:${config?.contactPhoneE164 || config?.contactPhone || ''}`}
                className="hidden sm:inline-flex items-center gap-1.5 absolute top-2 right-2 bg-primary text-white px-2.5 py-1 rounded-md text-xs md:text-sm shadow hover:bg-primary/90"
                aria-label="Call Now"
              >
                <Phone className="h-4 w-4" />
                {config?.contactPhoneDisplay || config?.contactPhone || 'Call'}
              </a>
              <h2 className="text-base md:text-lg font-semibold mb-1 pr-16">Get Quotes</h2>

              <form onSubmit={handleQuoteSubmit} className="space-y-1">
                {/* Customer Type */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">Customer Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomerType('residential')}
                      className={`p-1.5 border rounded-lg text-sm transition-all ${
                        customerType === 'residential' 
                          ? 'border-primary bg-primary/10 text-primary font-semibold' 
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      Residential
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerType('commercial')}
                      className={`p-1.5 border rounded-lg text-sm transition-all ${
                        customerType === 'commercial' 
                          ? 'border-primary bg-primary/10 text-primary font-semibold' 
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      Commercial
                    </button>
                  </div>
                </div>
                {/* ZIP Code */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">
                    ZIP Code
                    {zipcodeDisplay && (
                      <span className="ml-2 text-xs font-normal text-green-600">
                        {zipcodeDisplay}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={quoteForm.zipcode}
                    onChange={(e) => setQuoteForm({...quoteForm, zipcode: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                    placeholder="Enter ZIP"
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    required
                  />
                </div>

                {/* Size Selection (filtered by customer type) */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">
                    Dumpster Size
                    <button type="button" className="ml-2 text-primary text-xs underline">
                      Not sure?
                    </button>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {dumpsterSizes.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setQuoteForm({...quoteForm, size: size.id})}
                        className={`p-1.5 border rounded-lg text-sm transition ${
                          quoteForm.size === size.id 
                            ? 'border-primary bg-primary/10 font-semibold' 
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {size.size}
                        {size.popular && <span className="text-xs text-primary ml-1">Popular</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Debris Type */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">Debris Type</label>
                  <select
                    value={quoteForm.debrisType}
                    onChange={(e) => setQuoteForm({...quoteForm, debrisType: e.target.value})}
                    className="w-full px-2.5 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="general">General Waste</option>
                    <option value="construction">Construction Debris</option>
                    <option value="heavy">Heavy Materials (concrete, dirt, brick)</option>
                  </select>
                </div>

                {/* Project Type (matches modal options) */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">Project Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(customerType === 'commercial' ? projectTypesCommercial : projectTypesResidential).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQuoteForm({ ...quoteForm, projectType: p.id })}
                        className={`p-1.5 border rounded-lg text-sm ${
                          quoteForm.projectType === p.id ? 'border-primary bg-primary/10 font-semibold' : 'border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-0.5">When do you need it?</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'asap'})}
                      className={`p-1.5 border rounded-lg text-sm ${
                        quoteForm.deliveryDate === 'asap' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-300'
                      }`}
                    >
                      ASAP
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'week'})}
                      className={`p-1.5 border rounded-lg text-sm ${
                        quoteForm.deliveryDate === 'week' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-300'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'date'})}
                      className={`p-1.5 border rounded-lg text-sm ${
                        quoteForm.deliveryDate === 'date' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-300'
                      }`}
                    >
                      Pick Date
                    </button>
                  </div>
                  {quoteForm.deliveryDate === 'date' && (
                    <div className="mt-0.5">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                    className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                    className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                    I agree to receive quotes via phone/text about my request. Message rates may apply.
                  </label>
                </div>

                {/* CTAs */}
                <div className="space-y-1">
                  <button
                    type="submit"
                    className="w-full py-1.5 btn-primary rounded-lg text-sm"
                  >
                    Get Quotes →
                  </button>
                </div>

                {/* Micro-trust */}
                <div className="hidden">
                  <span>✓ Same-day in some areas</span>
                  <span>✓ No spam</span>
                  <span>✓ Free quotes</span>
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
              {(showAllCities ? cities : cities.slice(0, 20)).map(cityData => (
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
            {cities.length > 20 && !showAllCities && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowAllCities(true)}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  View all {cities.length} cities →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Cities with Provider Counts - show only for Virginia to avoid duplicate grids */}
        {cities.length > 0 && isVirginia && (
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
        initialData={modalInitialData || { dumpsterSize: "20-yard" }}
      />
    </div>
  );
}