'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleMap from './GoogleMap';
import { MapPin, Users, Building2, Home } from 'lucide-react';

interface CityData {
  city: string;
  count: number;
  lat?: number;
  lng?: number;
}

interface CityClusterMapProps {
  state: string;
  stateSlug: string;
  cities: CityData[];
  mapCenter: { lat: number; lng: number };
  onCitySelect?: (city: string) => void;
}

// City coordinates for major cities
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Virginia
  'richmond': { lat: 37.5407, lng: -77.4360 },
  'virginia beach': { lat: 36.8529, lng: -75.9780 },
  'norfolk': { lat: 36.8508, lng: -76.2859 },
  'alexandria': { lat: 38.8048, lng: -77.0469 },
  'ashburn': { lat: 39.0438, lng: -77.4874 },
  'arlington': { lat: 38.8816, lng: -77.0910 },
  'newport news': { lat: 37.0871, lng: -76.4730 },
  'hampton': { lat: 37.0299, lng: -76.3452 },
  'chesapeake': { lat: 36.7682, lng: -76.2875 },
  'lynchburg': { lat: 37.4137, lng: -79.1422 },
  'roanoke': { lat: 37.2710, lng: -79.9414 },
  'fairfax': { lat: 38.8462, lng: -77.3064 },
  
  // Maryland
  'baltimore': { lat: 39.2904, lng: -76.6122 },
  'annapolis': { lat: 38.9784, lng: -76.4922 },
  'rockville': { lat: 39.0840, lng: -77.1528 },
  'gaithersburg': { lat: 39.1434, lng: -77.2014 },
  'silver spring': { lat: 38.9907, lng: -77.0261 },
  'columbia': { lat: 39.2037, lng: -76.8610 },
  
  // North Carolina
  'charlotte': { lat: 35.2271, lng: -80.8431 },
  'raleigh': { lat: 35.7796, lng: -78.6382 },
  'durham': { lat: 35.9940, lng: -78.8986 },
  'greensboro': { lat: 36.0726, lng: -79.7920 },
  'winston-salem': { lat: 36.0999, lng: -80.2442 },
  'cary': { lat: 35.7915, lng: -78.7811 },
  'wilmington': { lat: 34.2257, lng: -77.9447 },
  
  // Pennsylvania
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'harrisburg': { lat: 40.2732, lng: -76.8867 },
  'allentown': { lat: 40.6084, lng: -75.4902 },
  'reading': { lat: 40.3356, lng: -75.9269 },
  
  // DC
  'washington': { lat: 38.9072, lng: -77.0369 },
  'district of columbia': { lat: 38.9072, lng: -77.0369 }
};

export default function CityClusterMap({
  state,
  stateSlug,
  cities,
  mapCenter,
  onCitySelect
}: CityClusterMapProps) {
  const router = useRouter();
  const [markers, setMarkers] = useState<any[]>([]);

  // Provide a safe default center (continental US midpoint) if incoming center is invalid
  const safeCenter = (() => {
    const lat = Number(mapCenter?.lat);
    const lng = Number(mapCenter?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    console.warn('[CityClusterMap] Invalid mapCenter provided, using fallback center.', mapCenter);
    return { lat: 39.8283, lng: -98.5795 }; // USA centroid approx
  })();

  useEffect(() => {
    // Create markers for cities with provider counts
    const cityMarkers = cities
      .map(cityData => {
        const cityLower = cityData.city.toLowerCase();
        const known = cityCoordinates[cityLower];

        // Derive base coords
        const baseLat = Number(
          cityData.lat ?? (known ? known.lat : safeCenter.lat + (Math.random() - 0.5) * 2)
        );
        const baseLng = Number(
          cityData.lng ?? (known ? known.lng : safeCenter.lng + (Math.random() - 0.5) * 3)
        );

        if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng)) {
          console.warn('[CityClusterMap] Skipping city due to invalid coords:', {
            city: cityData.city,
            provided: { lat: cityData.lat, lng: cityData.lng },
            derived: { lat: baseLat, lng: baseLng }
          });
          return null;
        }

        return {
          id: `city-${cityData.city}`,
          lat: baseLat,
          lng: baseLng,
          title: cityData.city,
          info: `${cityData.count} provider${cityData.count === 1 ? '' : 's'}`,
          rating: 0, // Hide rating for city markers
          reviews: cityData.count,
          services: [`${cityData.count} Providers Available`],
          onDetailsClick: () => {
            // Navigate to city page
            const citySlug = cityData.city.toLowerCase().replace(/\s+/g, '-');
            router.push(`/${stateSlug}/${citySlug}`);
          }
        };
      })
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    setMarkers(cityMarkers);
  }, [cities, safeCenter.lat, safeCenter.lng, stateSlug, router]);

  const handleMarkerClick = (marker: any) => {
    if (onCitySelect) {
      onCitySelect(marker.title);
    }
    // Navigate to city page
    const citySlug = marker.title.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${stateSlug}/${citySlug}`);
  };

  return (
    <div className="relative h-full">
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="font-semibold text-sm mb-2">Service Areas</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Major Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-secondary" />
            <span>Click to view providers</span>
          </div>
        </div>
      </div>

      {/* City Summary Stats */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-semibold">{cities.length}</span>
            <span className="text-muted-foreground">Cities</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-secondary" />
            <span className="font-semibold">
              {cities.reduce((sum, c) => sum + c.count, 0)}
            </span>
            <span className="text-muted-foreground">Providers</span>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap
        center={safeCenter}
        zoom={7} // State-level zoom
        markers={markers}
        height="100%"
        onMarkerClick={handleMarkerClick}
        className="rounded-lg"
      />
    </div>
  );
}