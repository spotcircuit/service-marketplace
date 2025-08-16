'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGoogleMap?: () => void;
  }
}

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  info?: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  services?: string[];
  verified?: boolean;
  priceRange?: string;
  availability?: string;
  address?: string;
  onQuoteClick?: () => void;
  onDetailsClick?: () => void;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  height?: string;
  onMarkerClick?: (marker: Marker) => void;
  className?: string;
}

export default function GoogleMap({
  center = { lat: 35.7796, lng: -78.6382 }, // Default to Raleigh, NC
  zoom = 12,
  markers = [],
  height = '500px',
  onMarkerClick,
  className = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key not configured');
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com/maps/api/js"]`
      );
      
      if (existingScript) {
        // Script exists, wait for it to load
        existingScript.addEventListener('load', () => setIsLoaded(true));
        // Check if already loaded
        if (window.google?.maps) {
          setIsLoaded(true);
        }
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMap = () => {
        setIsLoaded(true);
        delete window.initGoogleMap;
      };

      script.onerror = () => {
        setError('Failed to load Google Maps');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;

    try {
      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      googleMapRef.current = map;

      // Add click listener for map
      map.addListener('click', () => {
        // Close all info windows when clicking on map
        markersRef.current.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
      });
    } catch (err) {
      console.error('Error initializing Google Map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded, center, zoom]);

  // Update center when prop changes
  useEffect(() => {
    if (googleMapRef.current && center) {
      googleMapRef.current.setCenter(center);
    }
  }, [center]);

  // Manage markers
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const lat = Number(markerData.lat);
      const lng = Number(markerData.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn('Skipping marker with invalid coordinates:', markerData);
        return;
      }

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current,
        title: markerData.title,
        animation: window.google.maps.Animation.DROP
      });

      // Create info window with business details (always show a window)
      const infoContent = `
          <div style="padding: 16px; min-width: 300px; max-width: 350px;">
            <h4 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #111827;">${markerData.title}</h4>
            
            ${markerData.rating ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="color: #facc15; font-size: 16px;">★ ${Number(markerData.rating).toFixed(1)}</span>
                <span style="color: #6b7280; font-size: 14px;">(${markerData.reviews} reviews)</span>
                ${markerData.verified ? '<span style="color: #10b981; font-size: 14px;">✓ Verified</span>' : ''}
              </div>
            ` : ''}
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">Dumpster Rental Services</div>
              
              ${markerData.services && markerData.services.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                  ${markerData.services.map(service => `
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${service} Dumpster
                    </span>
                  `).join('')}
                </div>
              ` : ''}
              
              ${markerData.priceRange ? `
                <div style="font-size: 14px; color: #059669; font-weight: 600; margin-bottom: 4px;">
                  💰 ${markerData.priceRange}
                </div>
              ` : ''}
              
              ${markerData.availability ? `
                <div style="font-size: 13px; color: #374151;">
                  🚚 ${markerData.availability}
                </div>
              ` : '<div style="font-size: 13px; color: #059669;">✓ Same Day Delivery Available</div>'}
            </div>
            
            ${markerData.phone ? `
              <div style="margin-bottom: 8px;">
                <a href="tel:${markerData.phone}" style="color: #2563eb; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                  <span>📞</span>
                  <span style="font-weight: 500;">${markerData.phone}</span>
                </a>
              </div>
            ` : ''}
            
            ${markerData.address ? `
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                📍 ${markerData.address}
              </div>
            ` : ''}
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
              <button 
                onclick="window.handleMarkerQuote && window.handleMarkerQuote('${markerData.id}')"
                style="display: block; width: 100%; padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; margin-bottom: 8px;"
              >
                Get Free Quote →
              </button>
              <button 
                onclick="window.handleMarkerDetails && window.handleMarkerDetails('${markerData.id}')"
                style="display: block; width: 100%; padding: 10px 16px; background: white; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 500; text-align: center; text-decoration: none;"
              >
                View Full Details
              </button>
            </div>
          </div>
        `;
        
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });

      marker.infoWindow = infoWindow;

      marker.addListener('click', () => {
        // Close other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow && m !== marker) {
            m.infoWindow.close();
          }
        });

        // Open this info window
        infoWindow.open(googleMapRef.current, marker);

        // Notify parent component
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all valid markers
    const validMarkers = markers.filter(m => Number.isFinite(Number(m.lat)) && Number.isFinite(Number(m.lng)));
    if (validMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      validMarkers.forEach(m => {
        bounds.extend(new window.google.maps.LatLng(Number(m.lat), Number(m.lng)));
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [markers, onMarkerClick]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}