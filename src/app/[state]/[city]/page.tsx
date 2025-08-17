'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  Phone, 
  Clock, 
  Shield, 
  ArrowRight,
  ChevronRight,
  Home,
  Truck,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Navigation,
  Filter,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import LocationMap from '@/components/LocationMap';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';

// Helper to create SEO-friendly slugs
function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

// State abbreviations
const stateAbbr: Record<string, string> = {
  'virginia': 'VA', 'maryland': 'MD', 'north-carolina': 'NC', 
  'pennsylvania': 'PA', 'delaware': 'DE', 'west-virginia': 'WV'
};

// Known city coordinates for better map centering
const cityCoordinates: Record<string, {lat: number, lng: number}> = {
  // Virginia cities
  'ashburn': { lat: 39.0438, lng: -77.4874 },
  'sterling': { lat: 39.0062, lng: -77.4286 },
  'reston': { lat: 38.9586, lng: -77.3570 },
  'herndon': { lat: 38.9695, lng: -77.3861 },
  'leesburg': { lat: 39.1157, lng: -77.5636 },
  'fairfax': { lat: 38.8462, lng: -77.3064 },
  'chantilly': { lat: 38.8943, lng: -77.4311 },
  'arlington': { lat: 38.8816, lng: -77.0910 },
  'alexandria': { lat: 38.8048, lng: -77.0469 },
  'mclean': { lat: 38.9339, lng: -77.1773 },
  'vienna': { lat: 38.9013, lng: -77.2653 },
  'falls-church': { lat: 38.8823, lng: -77.1711 },
  'manassas': { lat: 38.7509, lng: -77.4753 },
  'richmond': { lat: 37.5407, lng: -77.4360 },
  'virginia-beach': { lat: 36.8529, lng: -75.9780 },
  'norfolk': { lat: 36.8508, lng: -76.2859 },
  'chesapeake': { lat: 36.7682, lng: -76.2875 },
  'newport-news': { lat: 37.0871, lng: -76.4730 },
  'hampton': { lat: 37.0299, lng: -76.3452 }
};

// Nearby cities data
const nearbyCitiesData: Record<string, string[]> = {
  'sterling': ['Ashburn', 'Herndon', 'Reston', 'Leesburg', 'Chantilly', 'Fairfax'],
  'ashburn': ['Sterling', 'Leesburg', 'Herndon', 'Reston', 'Chantilly', 'Fairfax'],
  'reston': ['Herndon', 'Sterling', 'Fairfax', 'Vienna', 'McLean', 'Ashburn'],
  'herndon': ['Reston', 'Sterling', 'Ashburn', 'Chantilly', 'Fairfax', 'Vienna'],
  'leesburg': ['Ashburn', 'Sterling', 'Purcellville', 'Hamilton', 'Lovettsville'],
  'fairfax': ['Vienna', 'Chantilly', 'Reston', 'Arlington', 'Falls Church', 'McLean'],
  'arlington': ['Alexandria', 'Falls Church', 'McLean', 'Fairfax', 'Vienna'],
  'alexandria': ['Arlington', 'Falls Church', 'Springfield', 'Fairfax', 'Mount Vernon'],
  'richmond': ['Henrico', 'Chesterfield', 'Mechanicsville', 'Glen Allen', 'Midlothian']
};

export default function CityPage() {
  const params = useParams();
  const stateSlug = params.state as string;
  const citySlug = params.city as string;
  const stateName = stateNames[stateSlug] || stateSlug;
  const stateCode = stateAbbr[stateSlug] || stateSlug.toUpperCase();
  const cityName = citySlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, avgPrice: '$395' });
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [customerType, setCustomerType] = useState<'residential' | 'commercial'>('residential');
  const [showMap, setShowMap] = useState(true);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalStartStep, setModalStartStep] = useState<number | undefined>(undefined);
  
  // Get nearby cities for this location
  const nearbyCities = nearbyCitiesData[citySlug] || [];
  
  // Get coordinates for this city
  const cityCoords = cityCoordinates[citySlug] || { lat: 39.0438, lng: -77.4874 };

  useEffect(() => {
    fetchCityData();
  }, [citySlug, stateName]);

  useEffect(() => {
    // Ensure header/hero tone inversion applies via :root attribute
    document.documentElement.setAttribute('data-header-tone', 'secondary');
    return () => {
      document.documentElement.removeAttribute('data-header-tone');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCityData = async () => {
    try {
      setLoading(true);
      
      // Fetch providers for this city
      const response = await fetch(`/api/businesses?city=${cityName}&state=${stateName}&limit=20`);
      const data = await response.json();
      
      if (data.businesses && data.businesses.length > 0) {
        setProviders(data.businesses);
        
        // Calculate stats
        const avgRating = data.businesses.reduce((acc: number, b: any) => acc + (b.rating || 4.5), 0) / data.businesses.length;
        setStats({
          total: data.businesses.length,
          avgRating: Math.round(avgRating * 10) / 10,
          avgPrice: '$395'
        });
      } else {
        setProviders([]);
        setStats({ total: 0, avgRating: 0, avgPrice: '$395' });
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteClick = (provider?: any, size?: string) => {
    if (provider) {
      setSelectedProvider(provider);
    }
    
    // Prepare initial data for the modal
    const initialData: any = {
      customerType,
      city: cityName,
      state: stateName,
    };
    
    // Add size if provided
    if (size) {
      initialData.dumpsterSize = size;
    }
    
    setModalInitialData(initialData);
    setModalStartStep(1); // Start at step 1 (skip customer type selection)
    setQuoteModalOpen(true);
  };

  // Local FAQs specific to the city
  const localFaqs = [
    {
      question: `Do I need a permit for a dumpster in ${cityName}?`,
      answer: `Permit requirements in ${cityName} depend on placement. Driveway placement typically doesn't require permits, but street placement does. We'll help you determine permit needs.`
    },
    {
      question: `How quickly can I get a dumpster delivered in ${cityName}?`,
      answer: `Most providers in ${cityName} offer same-day or next-day delivery. During peak seasons, we recommend booking 2-3 days in advance.`
    },
    {
      question: `What's the average cost of dumpster rental in ${cityName}?`,
      answer: `Prices in ${cityName} typically range from $295-$695 depending on size and rental duration. Get quotes from multiple providers to find the best deal.`
    }
  ];

  // Service sizes for display
  const serviceSizes = [
    { size: '10 Yard', dims: '14\' × 8\' × 3.5\'', capacity: '4 pickup loads', price: '$295-$395' },
    { size: '20 Yard', dims: '16\' × 8\' × 5.5\'', capacity: '8 pickup loads', price: '$395-$595' },
    { size: '30 Yard', dims: '20\' × 8\' × 6\'', capacity: '12 pickup loads', price: '$495-$695' },
    { size: '40 Yard', dims: '22\' × 8\' × 8\'', capacity: '16 pickup loads', price: '$595-$795' }
  ];

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
            <Link href={`/${stateSlug}`} className="hover:text-primary">{stateName}</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{cityName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section with Quick Stats */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-hero-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dumpster Rental in {cityName}, {stateCode}
            </h1>
            <p className="text-xl text-hero-foreground/90 mb-6">
              Compare {stats.total || 'multiple'} verified providers serving {cityName} and surrounding areas. 
              Get free quotes in 60 seconds.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.total || '5+'}</div>
                <div className="text-sm text-hero-foreground/80">Local Providers</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold flex items-center gap-1">
                  {stats.avgRating || '4.5'} <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-hero-foreground/80">Avg Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.avgPrice}</div>
                <div className="text-sm text-hero-foreground/80">Starting Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">24hr</div>
                <div className="text-sm text-hero-foreground/80">Avg Delivery</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleQuoteClick()}
                className="px-6 py-3 bg-white text-secondary hover:bg-white/90 font-semibold rounded-lg transition"
              >
                Get Free Quotes →
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-6 py-3 bg-white/20 backdrop-blur hover:bg-white/30 font-semibold rounded-lg transition flex items-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                {showMap ? 'Hide Map' : 'View on Map'}
              </button>
              <a
                href="tel:+14342076559"
                className="px-6 py-3 bg-white/20 backdrop-blur hover:bg-white/30 font-semibold rounded-lg transition flex items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call (434) 207-6559
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Type Toggle */}
      <section className="bg-white border-b py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">I need a dumpster for:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomerType('residential')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    customerType === 'residential' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Users className="inline h-4 w-4 mr-1" />
                  Residential
                </button>
                <button
                  onClick={() => setCustomerType('commercial')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    customerType === 'commercial' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Commercial
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-600" />
                Licensed & Insured
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                Same Day Available
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Map Section - Toggleable */}
        {showMap && (
          <div className="mb-8">
            <div className="relative bg-white rounded-lg shadow-sm border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="absolute top-3 right-3 z-10 px-3 py-1.5 text-sm border rounded-lg bg-white/90 hover:bg-white shadow"
                aria-label="Hide map"
              >
                Hide Map
              </button>
              <LocationMap
                initialCity={cityName}
                initialState={stateName}
                mapCenter={cityCoords}
                mapZoom={12}
                showCategoryFilter={false}
                onProviderSelect={(provider) => handleQuoteClick(provider)}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Sizes */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Dumpster Sizes Available in {cityName}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {serviceSizes
                  .filter(size => customerType === 'commercial' || !size.size.includes('40'))
                  .map((size, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{size.size}</h3>
                      <span className="text-primary font-bold">{size.price}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Dimensions: {size.dims}</p>
                      <p>Holds: {size.capacity}</p>
                    </div>
                    <button
                      onClick={() => handleQuoteClick(undefined, size.size.toLowerCase().replace(' ', '-'))}
                      className="mt-3 w-full py-2 btn-primary rounded text-sm"
                    >
                      Get Quote for {size.size}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Local Providers */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">
                {loading ? 'Loading...' : `${providers.length || 'Available'} Providers in ${cityName}`}
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : providers.length > 0 ? (
                <div className="space-y-6">
                  {/* Featured Providers */}
                  {providers.filter((p: any) => p.is_featured).length > 0 && (
                    <div className="space-y-4">
                      {providers.filter((p: any) => p.is_featured).map((provider: any, idx: number) => (
                        <div key={`featured-${provider.id || idx}`} className="border rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold">{provider.name}</h3>
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                                  FEATURED
                                </span>
                                {provider.is_verified && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm mb-2">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{provider.rating || '4.5'}</span>
                                  <span className="text-muted-foreground">({provider.reviews || 0} reviews)</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {provider.city || cityName}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Truck className="h-4 w-4" />
                                  Same Day Available
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  Starting at $295
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  7-Day Rental
                                </span>
                              </div>
                              {provider.description && (
                                <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2 flex-1">
                              <button onClick={() => handleQuoteClick(provider)} className="px-4 py-2 btn-primary rounded text-sm">Get Quote</button>
                              <Link href={`/${stateSlug}/${citySlug}/${slugify(provider.name)}`} className="px-4 py-2 border rounded text-sm text-center hover:bg-gray-50">View Details</Link>
                            </div>
                            <div className="shrink-0">
                              {provider.is_claimed ? (
                                provider.is_verified ? (
                                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium flex items-center gap-1">
                                    <Shield className="h-4 w-4" />
                                    Verified
                                  </div>
                                ) : (
                                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">Claimed</div>
                                )
                              ) : (
                                <Link 
                                  href={`/claim?businessId=${provider.id}&businessName=${encodeURIComponent(provider.name)}&address=${encodeURIComponent(provider.address || '')}&city=${encodeURIComponent(provider.city || cityName)}&state=${encodeURIComponent(provider.state || stateName)}&zipcode=${encodeURIComponent(provider.zipcode || '')}&phone=${encodeURIComponent(provider.phone || '')}&email=${encodeURIComponent(provider.email || '')}&category=${encodeURIComponent(provider.category || 'Dumpster Rental')}&website=${encodeURIComponent(provider.website || '')}`}
                                  className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 text-sm font-medium"
                                >
                                  Claim This Business
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Providers in 2-column grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {providers.filter((p: any) => !p.is_featured).map((provider: any, idx: number) => (
                      <div key={`regular-${provider.id || idx}`} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{provider.name}</h3>
                              {provider.is_verified && (
                                <Shield className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm mb-2">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{provider.rating || '4.5'}</span>
                                <span className="text-muted-foreground">({provider.reviews || 0} reviews)</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {provider.city || cityName}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                Same Day Available
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Starting at $295
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                7-Day Rental
                              </span>
                            </div>
                            
                            {provider.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {provider.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2 flex-1">
                            <button
                              onClick={() => handleQuoteClick(provider)}
                              className="px-4 py-2 btn-primary rounded text-sm"
                            >
                              Get Quote
                            </button>
                            <Link
                              href={`/${stateSlug}/${citySlug}/${slugify(provider.name)}`}
                              className="px-4 py-2 border rounded text-sm text-center hover:bg-gray-50"
                            >
                              View Details
                            </Link>
                          </div>
                          <div className="shrink-0">
                            {provider.is_claimed ? (
                              provider.is_verified ? (
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
                                href={`/claim?businessId=${provider.id}&businessName=${encodeURIComponent(provider.name)}&address=${encodeURIComponent(provider.address || '')}&city=${encodeURIComponent(provider.city || cityName)}&state=${encodeURIComponent(provider.state || stateName)}&zipcode=${encodeURIComponent(provider.zipcode || '')}&phone=${encodeURIComponent(provider.phone || '')}&email=${encodeURIComponent(provider.email || '')}&category=${encodeURIComponent(provider.category || 'Dumpster Rental')}&website=${encodeURIComponent(provider.website || '')}`}
                                className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 text-sm font-medium"
                              >
                                Claim This Business
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-semibold mb-2">No providers found in {cityName}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    We're expanding our network. Call for assistance or try a nearby city.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <a
                      href="tel:+14342076559"
                      className="px-4 py-2 btn-primary rounded-lg flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call for Help
                    </a>
                    <Link
                      href={`/${stateSlug}`}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      View All {stateName}
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Service Information */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Dumpster Rental Service in {cityName}</h2>
              <div className="prose max-w-none text-muted-foreground">
                <p>
                  Looking for reliable dumpster rental in {cityName}, {stateName}? Our network of verified 
                  providers offers competitive pricing and fast delivery for both residential and commercial projects. 
                  Whether you're renovating your home, cleaning out your garage, or managing a construction site, 
                  we'll help you find the right size dumpster at the best price.
                </p>
                
                <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">Popular Projects in {cityName}:</h3>
                <ul className="space-y-1">
                  <li>Home renovations and remodeling</li>
                  <li>Roof replacement and repair</li>
                  <li>Garage and basement cleanouts</li>
                  <li>Landscaping and yard debris removal</li>
                  <li>Construction and demolition projects</li>
                  <li>Estate cleanouts and moving</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">Why Choose Our {cityName} Providers:</h3>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Licensed and insured companies</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Transparent, upfront pricing</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Same-day and next-day delivery</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Flexible rental periods</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Environmental compliance</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Professional customer service</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Local FAQs */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions - {cityName}</h2>
              <div className="space-y-4">
                {localFaqs.map((faq, idx) => (
                  <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Quote Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Get Free Quotes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compare prices from {stats.total || 'multiple'} providers in {cityName}
              </p>
              <button
                onClick={() => handleQuoteClick()}
                className="w-full py-3 btn-primary rounded-lg font-semibold"
              >
                Start Getting Quotes →
              </button>
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Or call for immediate assistance:</p>
                <a
                  href="tel:+14342076559"
                  className="text-lg font-bold text-primary hover:text-primary/80"
                >
                  (434) 207-6559
                </a>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No obligation quotes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Licensed providers only</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Best price guarantee</span>
                </div>
              </div>
            </div>

            {/* Nearby Cities */}
            {nearbyCities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold mb-4">Nearby Cities</h3>
                <div className="space-y-2">
                  {nearbyCities.map(city => (
                    <Link
                      key={city}
                      href={`/${stateSlug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-3 py-2 text-sm rounded hover:bg-gray-50 transition flex items-center justify-between group"
                    >
                      <span>{city}, {stateCode}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/${stateSlug}`}
                  className="block mt-4 pt-4 border-t text-center text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View All {stateName} Cities →
                </Link>
              </div>
            )}

            {/* Service Areas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold mb-4">Service Coverage</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our {cityName} providers typically service:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{cityName} city limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>15-25 mile service radius</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Surrounding neighborhoods</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Rural areas (may vary)</span>
                </li>
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Need Help Choosing?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Not sure what size dumpster you need? Our experts can help you choose the right size for your project.
              </p>
              <Link
                href="/dumpster-sizes"
                className="block text-center py-2 bg-white rounded-lg hover:shadow-sm transition text-sm font-medium"
              >
                View Size Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-gray-50 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Rent a Dumpster in {cityName}?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who saved time and money by comparing quotes from multiple providers.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleQuoteClick()}
              className="px-8 py-3 btn-primary rounded-lg font-semibold"
            >
              Get Free Quotes Now
            </button>
            <a
              href="tel:+14342076559"
              className="px-8 py-3 btn-ghost-primary rounded-lg font-semibold flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call (434) 207-6559
            </a>
          </div>
        </div>
      </section>

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
        initialCustomerType={customerType}
        initialData={modalInitialData}
        startAtStep={modalStartStep}
      />
    </div>
  );
}