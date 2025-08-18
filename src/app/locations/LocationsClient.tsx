'use client';

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Search, Phone, Home } from 'lucide-react';
import USStatesMap from '@/components/USStatesMap';

export default function LocationsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servedStates, setServedStates] = useState<Array<{ state: string; count: number; city_count: number }>>([]);
  const [citiesData, setCitiesData] = useState<Array<{ city: string; state: string; count: number }>>([]);
  const router = useRouter();

  const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
  // Normalize potential 2-letter abbreviations from DB into full names
  const STATE_ABBR_TO_NAME: Record<string, string> = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District of Columbia',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  };
  const normalizeStateName = (s: string) => {
    if (!s) return '';
    const trimmed = (s || '').trim();
    const upper = trimmed.toUpperCase();
    if (STATE_ABBR_TO_NAME[upper as keyof typeof STATE_ABBR_TO_NAME]) {
      return STATE_ABBR_TO_NAME[upper as keyof typeof STATE_ABBR_TO_NAME];
    }
    // Title-case full names like 'virginia' or 'north carolina'
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  };
  const INVALID_STATE_NAMES = new Set(['State', 'Unknown']);
  const isValidStateName = (s: string) => {
    const n = normalizeStateName(s);
    return n.trim().length > 0 && !INVALID_STATE_NAMES.has(n);
  };
  const toStateSlug = (s: string) => slugify(normalizeStateName(s));
  const goToStateByName = (name: string) => router.push(`/${toStateSlug(name)}`);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/businesses/stats');
        if (!res.ok) throw new Error(`Failed to load stats: ${res.status}`);
        const data = await res.json() as {
          states: Array<{ state: string; count: number; city_count: number }>;
          cities: Array<{ city: string; state: string; count: number }>;
        };
        if (!isMounted) return;
        setServedStates(data.states || []);
        setCitiesData(data.cities || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load service areas');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Invert header/hero tone for this page
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
  }, []);

  // Removed placeholder featured cities to avoid fake data on Locations page

  // Prepare served set and filtered cities from live data
  const servedSet = useMemo(
    () => new Set(
      servedStates
        .filter((s) => isValidStateName(s.state))
        .map((s) => toStateSlug(s.state))
        .filter((slug) => slug && slug.trim().length > 0)
    ),
    [servedStates]
  );
  const filteredCities = useMemo(() => {
    if (!searchQuery) return [] as Array<{ city: string; state: string }>;
    return citiesData
      .filter((c) => c.city.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10)
      .map(({ city, state }) => ({ city, state: normalizeStateName(state) }));
  }, [searchQuery, citiesData]);

  // Removed crude inline SVG map; using high-quality USStatesMap component

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
            <span className="text-foreground font-medium">Locations</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/90">
        <div className="container mx-auto px-4 text-center py-12 text-hero-foreground">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Service Locations
          </h1>
          <p className="text-xl mb-8 text-hero-foreground/90 max-w-3xl mx-auto">
            We proudly serve the Mid-Atlantic region with same-day and next-day dumpster delivery
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 shadow-lg"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
                {filteredCities.map((result, idx) => (
                  <Link
                    key={idx}
                    href={`/${toStateSlug(result.state)}/${slugify(result.city)}`}
                    className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{result.city}</span>
                        <span className="text-gray-500 ml-2">{normalizeStateName(result.state)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Select Your State</h2>
            <p className="text-muted-foreground">Click on a state to view cities we serve</p>
          </div>
          
          <div className="grid gap-8 items-start">
            {/* Map */}
            <div className="bg-gray-50 rounded-xl p-4">
              <USStatesMap served={servedSet} onStateClick={(slug) => router.push(`/${slug}`)} />
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {servedStates
                  .slice()
                  .filter((s) => isValidStateName(s.state))
                  .sort((a, b) => normalizeStateName(a.state).localeCompare(normalizeStateName(b.state)))
                  .map((s) => (
                    <button
                      key={normalizeStateName(s.state)}
                      onClick={() => goToStateByName(normalizeStateName(s.state))}
                      className="px-3 py-1 rounded text-sm font-medium transition bg-gray-100 hover:bg-gray-200 text-gray-700"
                      title={`${s.city_count} cities • ${s.count} providers`}
                    >
                      {normalizeStateName(s.state)}
                    </button>
                  ))}
              </div>
              {loading && (
                <p className="text-center text-sm text-gray-500 mt-3">Loading service areas…</p>
              )}
              {error && (
                <p className="text-center text-sm text-red-600 mt-3">{error}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* All States Grid */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">All Service Areas</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servedStates
              .slice()
              .filter((s) => isValidStateName(s.state))
              .sort((a, b) => normalizeStateName(a.state).localeCompare(normalizeStateName(b.state)))
              .map((s) => (
                <Link
                  key={normalizeStateName(s.state)}
                  href={`/${toStateSlug(s.state)}`}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-primary hover:text-white transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-white">{normalizeStateName(s.state)}</h3>
                      <p className="text-sm text-gray-600 group-hover:text-white/80">
                        {s.city_count} cities • {s.count} providers
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Don't See Your City?</h2>
          <p className="text-xl mb-8 text-white/90">
            We're constantly expanding. Contact us to check availability in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+14342076559"
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call (434) 207-6559
            </a>
            <Link
              href="/contact"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition border-2 border-white/50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}