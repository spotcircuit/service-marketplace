'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

interface GoogleLocationSearchProps {
  value?: string;
  onChange: (location: {
    city?: string;
    state?: string;
    zipcode?: string;
    formatted: string;
    lat?: number;
    lng?: number;
    placeId?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
  autofocus?: boolean;
  types?: string[]; // ['(cities)'], ['(regions)'], ['geocode'], etc.
  componentRestrictions?: { country: string }; // { country: 'us' }
}

export default function GoogleLocationSearch({
  value = '',
  onChange,
  placeholder = 'Enter location',
  className = '',
  showIcon = true,
  autofocus = false,
  types = ['(cities)'],
  componentRestrictions = { country: 'us' }
}: GoogleLocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
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
        if (window.google?.maps?.places) {
          setIsLoaded(true);
        }
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      
      window.initGooglePlaces = () => {
        setIsLoaded(true);
        delete window.initGooglePlaces;
      };

      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types,
        componentRestrictions,
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'name']
      });

      // Handle place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          return;
        }

        // Parse address components
        let city = '';
        let state = '';
        let zipcode = '';
        let stateShort = '';

        place.address_components.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
            stateShort = component.short_name;
          } else if (types.includes('postal_code')) {
            zipcode = component.long_name;
          }
        });

        // Format display value
        let formatted = place.formatted_address || place.name || '';
        
        // For US addresses, simplify to "City, State"
        if (city && stateShort) {
          formatted = `${city}, ${stateShort}`;
        }

        setInputValue(formatted);

        // Notify parent component - use state abbreviation for consistency
        onChange({
          city,
          state: stateShort || state, // Use abbreviation if available
          zipcode,
          formatted,
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
          placeId: place.place_id
        });
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [isLoaded, types, componentRestrictions, onChange]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const clearInput = () => {
    setInputValue('');
    onChange({ formatted: '' });
    inputRef.current?.focus();
  };

  // Parse manual input like "Richmond, VA" or "Ashburn, VA"
  const parseManualInput = (input: string) => {
    const parts = input.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      const city = parts[0];
      const stateOrZip = parts[1];
      
      // Check if it's a state abbreviation (2 letters)
      if (stateOrZip.length === 2) {
        return {
          city,
          state: stateOrZip.toUpperCase(),
          zipcode: '',
          formatted: `${city}, ${stateOrZip.toUpperCase()}`
        };
      }
      // Check if it includes state and zip
      const stateParts = stateOrZip.split(' ').filter(Boolean);
      if (stateParts.length > 0) {
        return {
          city,
          state: stateParts[0].toUpperCase(),
          zipcode: stateParts[1] || '',
          formatted: input
        };
      }
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter when selecting from dropdown
    if (e.key === 'Enter') {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && (pacContainer as HTMLElement).style.display !== 'none') {
        e.preventDefault();
      } else {
        // No dropdown visible, try to parse manual input
        e.preventDefault();
        const parsed = parseManualInput(inputValue);
        if (parsed) {
          onChange(parsed);
        }
      }
    }
  };

  const handleBlur = () => {
    // Give autocomplete time to fire if user clicked on suggestion
    setTimeout(() => {
      // If value changed but no place was selected, try to parse it
      if (inputValue && inputValue !== value) {
        const parsed = parseManualInput(inputValue);
        if (parsed) {
          onChange(parsed);
        }
      }
    }, 200);
  };

  return (
    <div className="relative">
      {showIcon && (
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autofocus}
        className={`w-full ${showIcon ? 'pl-10' : 'pl-4'} pr-10 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      />
      {inputValue && (
        <button
          type="button"
          onClick={clearInput}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {!isLoaded && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
}