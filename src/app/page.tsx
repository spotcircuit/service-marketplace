'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/contexts/ConfigContext';
import { useNiche } from '@/hooks/useNiche';
import { Search, MapPin, Star, Phone, Shield, Award, ArrowRight, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuoteRequestModal from '@/components/QuoteRequestModal';
import { businessCache } from '@/lib/cache';

export default function Home() {
  const { config } = useConfig();
  const router = useRouter();
  const { niche, terminology, categories, hero, replaceVariables, loading: nicheLoading } = useNiche();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | undefined>();

  // Get real data from cache
  const stats = businessCache.getStats();
  const topCategories = businessCache.getCategories().slice(0, 8);
  const topStates = businessCache.getStates().slice(0, 8);
  const topCities = businessCache.getCities().slice(0, 8);

  useEffect(() => {
    fetchFeaturedBusinesses();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses?featured=true&limit=3');
      const data = await response.json();
      setFeaturedBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Failed to fetch featured businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    router.push(`/directory?${params.toString()}`);
  };

  const handleGetQuote = (businessId?: string, businessName?: string) => {
    setSelectedBusinessId(businessId);
    setSelectedBusinessName(businessName);
    setQuoteModalOpen(true);
  };

  if (nicheLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section - Using Niche Configuration */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto">
            {hero?.headline || `Find Trusted ${terminology?.service.providers || 'Service Providers'}`}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {hero?.subheadline || `Connect with verified ${terminology?.service.providers?.toLowerCase() || 'professionals'} in your area`}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 bg-white rounded-lg p-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`What ${terminology?.service.singular.toLowerCase() || 'service'} do you need?`}
                  className="w-full pl-10 pr-4 py-3 focus:outline-none text-foreground"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={hero?.searchPlaceholder || 'Enter your ZIP code'}
                  className="w-full pl-10 pr-4 py-3 focus:outline-none text-foreground"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
              >
                {hero?.ctaText || terminology?.quote.action || 'Search'}
              </button>
            </div>
          </form>

          {/* Niche Categories as Quick Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-white/80">Popular:</span>
            {categories.slice(0, 4).map(cat => (
              <Link
                key={cat.slug}
                href={`/services/${cat.slug}`}
                className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur text-sm font-medium transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar - Using Real Data */}
      <section className="bg-primary/10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{stats.total_businesses}+</div>
              <div className="text-sm text-muted-foreground">{terminology?.service.providers || 'Service Providers'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{stats.total_cities}+</div>
              <div className="text-sm text-muted-foreground">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{stats.total_reviews}+</div>
              <div className="text-sm text-muted-foreground">Customer Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{stats.average_rating?.toFixed(1) || '4.8'}/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category - Using Niche Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse {terminology?.service.plural || 'Services'} by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the right {terminology?.service.provider?.toLowerCase() || 'provider'} for your {terminology?.project.singular?.toLowerCase() || 'project'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Show niche-specific categories if available, otherwise use database categories */}
            {categories.length > 0 ? (
              categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/services/${cat.slug}`}
                  className="bg-card hover:bg-primary/5 border hover:border-primary/30 rounded-lg p-6 text-center transition-all"
                >
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                </Link>
              ))
            ) : (
              topCategories.map(cat => (
                <Link
                  key={cat.category}
                  href={`/services/${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-card hover:bg-primary/5 border hover:border-primary/30 rounded-lg p-6 text-center transition-all"
                >
                  <h3 className="font-semibold">{cat.category}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} {terminology?.service.providers?.toLowerCase() || 'providers'}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured {terminology?.service.providers || 'Service Providers'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top-rated {terminology?.service.providers?.toLowerCase() || 'businesses'} in your area, verified and ready to serve
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBusinesses.map(business => (
              <div key={business.id} className="bg-card rounded-lg border hover:shadow-xl transition-all p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {business.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">{business.category}</p>
                    </div>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{business.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({business.reviews} reviews)</span>
                  {business.is_verified && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Shield className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {business.description || `Professional ${business.category?.toLowerCase()} services`}
                </p>

                <div className="flex items-center gap-3 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {business.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {business.city}, {business.state}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/business/${business.id}`}
                    className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleGetQuote(business.id, business.name)}
                    className="flex-1 px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 text-sm font-medium">
                    {terminology?.quote.action || 'Get Quote'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Cities & States - Using Real Data */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Top Cities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Top Cities for {terminology?.service.plural || 'Services'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {topCities.map(city => (
                  <Link
                    key={`${city.state}-${city.city}`}
                    href={`/${city.state.toLowerCase().replace(/\s+/g, '-')}/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white rounded-lg p-4 hover:shadow-md transition border"
                  >
                    <h3 className="font-semibold text-gray-900">{city.city}</h3>
                    <p className="text-sm text-gray-600">{city.count} {terminology?.service.providers?.toLowerCase() || 'providers'}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top States */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by State</h2>
              <div className="grid grid-cols-2 gap-3">
                {topStates.map(state => (
                  <Link
                    key={state.state}
                    href={`/${state.state.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white rounded-lg p-4 hover:shadow-md transition border"
                  >
                    <h3 className="font-semibold text-gray-900">{state.state}</h3>
                    <p className="text-sm text-gray-600">{state.city_count} cities • {state.count} {terminology?.service.providers?.toLowerCase() || 'providers'}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedBusinessId(undefined);
          setSelectedBusinessName(undefined);
        }}
        businessIds={selectedBusinessId ? [selectedBusinessId] : []}
        businessName={selectedBusinessName}
      />
    </>
  );
}