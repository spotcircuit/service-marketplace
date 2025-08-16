'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation, Loader2, Star, Phone, Truck, Clock, Shield, MapPin, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNiche } from '@/hooks/useNiche';
import GoogleMap from './GoogleMap';
import GoogleLocationSearch from './GoogleLocationSearch';

interface Provider {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  phone: string;
  distance?: number;
  services?: string[];
  description?: string;
  is_verified?: boolean;
  is_featured?: boolean;
  response_time?: string;
}

interface LocationMapProps {
  initialCategory?: string;
  onProviderSelect?: (provider: Provider) => void;
  showCategoryFilter?: boolean;
  initialState?: string;
  initialCity?: string;
  mapCenter?: { lat: number; lng: number } | null;
  mapZoom?: number;
}

export default function LocationMap({ 
  initialCategory, 
  onProviderSelect,
  showCategoryFilter = true,
  initialState,
  initialCity,
  mapCenter,
  mapZoom = 10
}: LocationMapProps) {
  const { user } = useAuth();
  const { categories, terminology } = useNiche();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapError, setMapError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');

  // Initialize with mapCenter if provided, otherwise IP geolocation
  useEffect(() => {
    const initializeLocation = async () => {
      // If mapCenter is provided (state page), use that
      if (mapCenter) {
        setLocation(mapCenter);
        
        // If we have initialState/initialCity, fetch providers for that
        if (initialState) {
          const displayAddress = initialCity 
            ? `${initialCity}, ${initialState}`
            : initialState;
          setAddress(displayAddress);
          await fetchProvidersByLocation(initialCity || '', initialState);
        }
        return;
      }
      
      // Override with user's saved location if logged in
      if (user && user.city && user.state) {
        const formatted = user.zipcode 
          ? `${user.city}, ${user.state} ${user.zipcode}`
          : `${user.city}, ${user.state}`;
        setAddress(formatted);
        
        // Fetch providers for user's location
        fetchProvidersByLocation(user.city, user.state, user.zipcode);
        return; // Exit early if we have user location
      }
      
      // Otherwise try IP geolocation
      try {
        // Get location from our API (which handles IP geolocation server-side)
        const response = await fetch('/api/geolocation');
        const data = await response.json();
        
        console.log('Geolocation data:', data); // Debug log
        
        if (data.city && (data.region || data.state || data.region_code)) {
          // Format the address properly
          const stateCode = data.region_code || data.state || data.region;
          const formatted = data.postal 
            ? `${data.city}, ${stateCode} ${data.postal}`.trim()
            : `${data.city}, ${stateCode}`.trim();
          
          console.log('Setting address to:', formatted); // Debug log
          setAddress(formatted);
          
          if (data.latitude && data.longitude) {
            setLocation({ lat: data.latitude, lng: data.longitude });
          }
          
          // Fetch providers for this location
          await fetchProvidersByLocation(data.city, stateCode, data.postal);
        } else {
          // Fallback if geolocation doesn't return complete data
          console.log('Incomplete geolocation data, using fallback');
          setLocation({ lat: 37.5407, lng: -77.4360 });
          setAddress('Richmond, VA');
          fetchProvidersByLocation('Richmond', 'VA');
        }
      } catch (error) {
        console.log('IP geolocation failed, falling back to default:', error);
        // Fallback to default location (Richmond, VA)
        setLocation({ lat: 37.5407, lng: -77.4360 });
        setAddress('Richmond, VA');
        fetchProvidersByLocation('Richmond', 'VA');
      }
    };
    
    initializeLocation();
  }, [user, selectedCategory, mapCenter, initialState, initialCity]); // Re-fetch when category or location changes

  // Handle location search
  const handleLocationChange = async (locationData: {
    city?: string;
    state?: string;
    zipcode?: string;
    formatted: string;
    lat?: number;
    lng?: number;
  }) => {
    if (!locationData.formatted) {
      setProviders([]);
      setLocation(null);
      setAddress('');
      return;
    }

    setAddress(locationData.formatted);
    setLoading(true);
    setMapError('');

    // Update map center if coordinates are available
    if (locationData.lat && locationData.lng) {
      setLocation({ lat: locationData.lat, lng: locationData.lng });
      
      // Fetch providers near these coordinates
      await fetchNearbyProviders(locationData.lat, locationData.lng);
    } else if (locationData.city || locationData.state || locationData.zipcode) {
      // Fallback to city/state search
      await fetchProvidersByLocation(
        locationData.city || '', 
        locationData.state || '',
        locationData.zipcode
      );
    }
    
    setLoading(false);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setMapError('');
    
    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setAddress('Your Current Location');
        
        // Fetch nearby providers
        await fetchNearbyProviders(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        setMapError('Unable to get your location. Please search for an address.');
        setLoading(false);
      }
    );
  };

  // Fetch providers near coordinates
  const fetchNearbyProviders = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      // Try to reverse geocode the coordinates to get city/state
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            const addressComponents = geocodeData.results[0].address_components;
            let city = '';
            let state = '';
            
            for (const component of addressComponents) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
            }
            
            if (city || state) {
              // Fetch real businesses for this city/state
              await fetchProvidersByLocation(city, state);
              return;
            }
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding failed, using nearest major city');
      }
      
      // Fallback: find nearest major city and fetch businesses
      const nearestCity = getNearestCity(lat, lng);
      await fetchProvidersByLocation(nearestCity.city, nearestCity.state);
      
    } catch (error) {
      console.error('Error fetching providers:', error);
      setMapError('Failed to load providers. Please try again.');
      setLoading(false);
    }
  };

  // Helper function to find nearest major city
  const getNearestCity = (lat: number, lng: number): {city: string, state: string} => {
    const cities = [
      { city: 'Ashburn', state: 'VA', lat: 39.0438, lng: -77.4874 },
      { city: 'Richmond', state: 'VA', lat: 37.5407, lng: -77.4360 },
      { city: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
      { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
      { city: 'Norfolk', state: 'VA', lat: 36.8508, lng: -76.2859 },
      { city: 'Alexandria', state: 'VA', lat: 38.8048, lng: -77.0469 }
    ];
    
    let nearest = cities[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    }
    
    return { city: nearest.city, state: nearest.state };
  };

  // Fetch providers by location name
  const fetchProvidersByLocation = async (city: string, state: string, zipcode?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      // Get more providers for state-wide view
      params.set('limit', city ? '50' : '200');

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const data = await response.json();
      
      if (data.businesses && data.businesses.length > 0) {
        // Get city/state coordinates from geocoding API or use approximates
        let centerLat = 39.0438;
        let centerLng = -77.4874;
        
        // Known coordinates for major cities/states
        const stateCoordinates: Record<string, {lat: number, lng: number}> = {
          'virginia': { lat: 37.4316, lng: -78.6569 },
          'va': { lat: 37.4316, lng: -78.6569 },
          'north carolina': { lat: 35.7596, lng: -79.0193 },
          'nc': { lat: 35.7596, lng: -79.0193 },
          'maryland': { lat: 39.0458, lng: -76.6413 },
          'md': { lat: 39.0458, lng: -76.6413 },
          'pennsylvania': { lat: 41.2033, lng: -77.1945 },
          'pa': { lat: 41.2033, lng: -77.1945 },
          'delaware': { lat: 38.9108, lng: -75.5277 },
          'de': { lat: 38.9108, lng: -75.5277 },
          'west virginia': { lat: 38.5976, lng: -80.4549 },
          'wv': { lat: 38.5976, lng: -80.4549 }
        };

        const cityCoordinates: Record<string, {lat: number, lng: number}> = {
          'richmond': { lat: 37.5407, lng: -77.4360 },
          'ashburn': { lat: 39.0438, lng: -77.4874 },
          'raleigh': { lat: 35.7796, lng: -78.6382 },
          'charlotte': { lat: 35.2271, lng: -80.8431 },
          'norfolk': { lat: 36.8508, lng: -76.2859 },
          'virginia beach': { lat: 36.8529, lng: -75.9780 },
          'alexandria': { lat: 38.8048, lng: -77.0469 }
        };
        
        // Check for city coordinates first, then state
        const cityLower = city.toLowerCase();
        const stateLower = state.toLowerCase();
        
        if (cityCoordinates[cityLower]) {
          centerLat = cityCoordinates[cityLower].lat;
          centerLng = cityCoordinates[cityLower].lng;
        } else if (stateCoordinates[stateLower]) {
          centerLat = stateCoordinates[stateLower].lat;
          centerLng = stateCoordinates[stateLower].lng;
        }
        
        // Sort businesses - featured first
        const sortedBusinesses = [...data.businesses].sort((a: any, b: any) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.rating - a.rating;
        });
        
        // Map businesses with real or fallback coordinates
        const mapProviders = sortedBusinesses.map((b: any, idx: number) => {
          let providerLat = typeof b.latitude === 'string' ? parseFloat(b.latitude) : b.latitude;
          let providerLng = typeof b.longitude === 'string' ? parseFloat(b.longitude) : b.longitude;
          
          // If no coordinates or invalid numbers, generate positions near city center
          if (!Number.isFinite(providerLat) || !Number.isFinite(providerLng)) {
            // Use business ID to generate consistent but spread out positions
            const hash = b.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const angle = (hash % 360) * (Math.PI / 180);
            const distance = 0.01 + (hash % 100) / 2000; // Spread within ~5 mile radius
            providerLat = centerLat + distance * Math.cos(angle);
            providerLng = centerLng + distance * Math.sin(angle);
          }
          
          // Parse services - expecting array of strings
          let dumpsterSizes: string[] = [];
          if (b.services) {
            if (Array.isArray(b.services)) {
              // Services is already an array
              dumpsterSizes = b.services.map((s: any) => {
                const service = typeof s === 'string' ? s : (s.name || s.toString());
                // Clean up service names for display
                if (service.includes('10')) return '10 Yard';
                if (service.includes('20')) return '20 Yard';
                if (service.includes('30')) return '30 Yard';
                if (service.includes('40')) return '40 Yard';
                return service;
              }).filter(Boolean);
            } else if (typeof b.services === 'object') {
              // Handle JSONB object format
              dumpsterSizes = Object.values(b.services).filter(Boolean) as string[];
            }
          }
          
          // If no sizes found, use default sizes based on business type
          if (dumpsterSizes.length === 0) {
            if (b.is_featured) {
              dumpsterSizes = ['10 Yard', '20 Yard', '30 Yard', '40 Yard'];
            } else {
              dumpsterSizes = ['10 Yard', '20 Yard', '30 Yard'];
            }
          }
          
          // Calculate distance from center if we have real coordinates
          let distance = 0;
          if (b.latitude && b.longitude) {
            // Haversine formula for distance
            const R = 3959; // Earth's radius in miles
            const dLat = (b.latitude - centerLat) * Math.PI / 180;
            const dLon = (b.longitude - centerLng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(centerLat * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = Math.round(R * c * 10) / 10;
          }
          
          return {
            id: b.id,
            name: b.name,
            lat: Number(providerLat),
            lng: Number(providerLng),
            city: b.city || city,
            state: b.state || state,
            rating: b.rating || 4.5,
            reviews: b.reviews || 0,
            phone: b.phone,
            distance: distance,
            services: dumpsterSizes,
            description: b.description || `Professional dumpster rental service in ${b.city || city}`,
            is_verified: b.is_verified || false,
            is_featured: b.is_featured || false,
            response_time: b.response_time || (b.is_featured ? 'Same day' : '< 24 hours'),
            service_radius: b.service_radius || 25,
            customer_types: b.customer_types || ['residential', 'commercial']
          };
        });
        
        setProviders(mapProviders);
        setLocation({ lat: centerLat, lng: centerLng });
      } else {
        setProviders([]);
        // Still set location even for empty results
        if (location) {
          setLocation(location);
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setLocation({ lat: provider.lat, lng: provider.lng });
    if (onProviderSelect) {
      onProviderSelect(provider);
    }
  };

  // Set up global handlers for info window buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleMarkerQuote = (providerId: string) => {
        const provider = providers.find(p => p.id === providerId);
        if (provider && onProviderSelect) {
          onProviderSelect(provider);
        }
      };
      
      (window as any).handleMarkerDetails = (providerId: string) => {
        window.location.href = `/business/${providerId}`;
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleMarkerQuote;
        delete (window as any).handleMarkerDetails;
      }
    };
  }, [providers, onProviderSelect]);

  // Prepare markers for Google Map with full details (stable reference)
  const mapMarkers = useMemo(() => (
    providers
      .map(provider => ({
        id: provider.id,
        lat: Number(provider.lat),
        lng: Number(provider.lng),
        title: provider.name,
        rating: provider.rating,
        reviews: provider.reviews,
        phone: provider.phone,
        services: provider.services?.slice(0, 3),
        info: provider.description || `Professional ${selectedCategory === 'all' ? 'waste management' : selectedCategory.toLowerCase()} service`,
        verified: provider.is_verified,
        priceRange: provider.is_featured ? 'Starting at $295' : 'Competitive Pricing',
        availability: provider.response_time || 'Same Day Available',
        address: `${provider.city}, ${provider.state}`
      }))
      .filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng))
  ), [providers, selectedCategory]);

  // Stable marker click handler (select and center only)
  const handleMarkerClick = useCallback((marker: { id: string }) => {
    const provider = providers.find(p => p.id === marker.id);
    if (provider) {
      setSelectedProvider(provider);
    }
  }, [providers]);

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    // Re-fetch providers with new category
    if (address) {
      if (location) {
        fetchNearbyProviders(location.lat, location.lng);
      } else {
        // Parse address to get city/state
        const parts = address.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          fetchProvidersByLocation(parts[0], parts[1]);
        }
      }
    }
  };

  return (
    <div className="bg-card">
      {/* Search Header */}
      <div className="container mx-auto px-4 py-6">
        <h3 className="text-xl font-bold mb-4">
          Find {selectedCategory === 'all' 
            ? terminology?.service.providers || 'Service Providers'
            : selectedCategory} Near You
        </h3>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <GoogleLocationSearch
              value={address}
              onChange={handleLocationChange}
              placeholder="Enter city, state or ZIP code"
              className="py-3"
              types={['geocode']}
            />
            
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="px-4 py-3 border rounded-lg hover:bg-muted disabled:opacity-50"
              title="Use my current location"
            >
              <Navigation className="h-5 w-5" />
            </button>
          </div>
          
          {showCategoryFilter && (
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 border rounded-lg bg-background min-w-[200px]"
              >
                <option value="all">All Services</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {mapError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {mapError}
          </div>
        )}
      </div>

      {/* Google Map - Container Width */}
      <div className="container mx-auto px-4">
        <div className="relative rounded-lg overflow-hidden border">
          <GoogleMap
            center={location || { lat: 35.7796, lng: -78.6382 }}
            zoom={mapZoom || (location ? 12 : 10)}
            markers={mapMarkers}
            height="600px"
            onMarkerClick={handleMarkerClick}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Results List - Below Map */}
      {providers.length > 0 && (
        <div className="container mx-auto p-6">
          <h3 className="text-lg font-semibold mb-4">
            {providers.length} Providers Found {address && `near ${address}`}
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`bg-background rounded-lg border p-4 hover:shadow-md cursor-pointer transition-all ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderClick(provider)}
              >
                {provider.is_featured && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
                    <Star className="h-3 w-3" />
                    Featured
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{provider.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{provider.rating ? Number(provider.rating).toFixed(1) : '0.0'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({provider.reviews} reviews)
                      </span>
                      {provider.is_verified && (
                        <Shield className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </div>
                  </div>
                  {provider.distance && (
                    <span className="text-sm font-medium text-primary">
                      {provider.distance.toFixed(1)} mi
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {provider.city}, {provider.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {provider.phone}
                  </div>
                  {provider.response_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Response: {provider.response_time}
                    </div>
                  )}
                  {provider.services && provider.services.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      {provider.services.join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/business/${provider.id}`}
                    className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 text-center"
                  >
                    Get Quote
                  </Link>
                  <Link
                    href={`/business/${provider.id}`}
                    className="flex-1 px-3 py-1.5 border text-sm rounded hover:bg-muted text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && address && providers.length === 0 && (
        <div className="p-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-2">No Providers Found</p>
          <p className="text-sm text-muted-foreground">
            Try searching a different area or expanding your search
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !address && (
        <div className="p-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-2">Search for Providers</p>
          <p className="text-sm text-muted-foreground">
            Enter a location above to find {selectedCategory === 'all' ? 'service' : selectedCategory.toLowerCase()} providers near you
          </p>
        </div>
      )}
    </div>
  );
}