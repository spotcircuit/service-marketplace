'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search } from 'lucide-react';

interface LocationSearchProps {
  value?: string;
  onChange: (location: { city?: string; state?: string; zipcode?: string; formatted: string }) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
  autofocus?: boolean;
}

// Common US cities for autocomplete
const COMMON_CITIES = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Austin', state: 'TX' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Boston', state: 'MA' },
  { city: 'El Paso', state: 'TX' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Oklahoma City', state: 'OK' },
  { city: 'Portland', state: 'OR' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Memphis', state: 'TN' },
  { city: 'Louisville', state: 'KY' },
  { city: 'Baltimore', state: 'MD' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Albuquerque', state: 'NM' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Fresno', state: 'CA' },
  { city: 'Mesa', state: 'AZ' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Omaha', state: 'NE' },
  { city: 'Raleigh', state: 'NC' },
  { city: 'Miami', state: 'FL' },
  { city: 'Long Beach', state: 'CA' },
  { city: 'Virginia Beach', state: 'VA' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Arlington', state: 'TX' },
  { city: 'New Orleans', state: 'LA' },
];

const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut',
  'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
  'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
  'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan',
  'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
  'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
  'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota',
  'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming'
};

export default function LocationSearch({
  value = '',
  onChange,
  placeholder = 'Enter city, state or ZIP',
  className = '',
  showIcon = true,
  autofocus = false
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseLocation = (input: string) => {
    const trimmed = input.trim();
    
    // Check for ZIP code
    if (/^\d{5}$/.test(trimmed)) {
      return { zipcode: trimmed, formatted: trimmed };
    }
    
    // Check for city, state format
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const city = parts[0];
        const stateOrZip = parts[1];
        
        // Check if second part is a state abbreviation
        const stateUpper = stateOrZip.toUpperCase();
        if (STATE_NAMES[stateUpper]) {
          return { city, state: STATE_NAMES[stateUpper], formatted: `${city}, ${stateUpper}` };
        }
        
        // Check if it's a full state name
        const stateName = Object.entries(STATE_NAMES).find(([_, name]) => 
          name.toLowerCase() === stateOrZip.toLowerCase()
        );
        if (stateName) {
          return { city, state: stateName[1], formatted: `${city}, ${stateName[0]}` };
        }
        
        return { city, state: stateOrZip, formatted: trimmed };
      }
    }
    
    // Check for state only
    const stateUpper = trimmed.toUpperCase();
    if (STATE_NAMES[stateUpper]) {
      return { state: STATE_NAMES[stateUpper], formatted: stateUpper };
    }
    
    // Check for full state name
    const stateName = Object.entries(STATE_NAMES).find(([_, name]) => 
      name.toLowerCase() === trimmed.toLowerCase()
    );
    if (stateName) {
      return { state: stateName[1], formatted: stateName[0] };
    }
    
    // Assume it's a city name
    return { city: trimmed, formatted: trimmed };
  };

  const generateSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    // If it looks like a partial ZIP, show ZIP format hint
    if (/^\d{1,4}$/.test(query)) {
      results.push({
        type: 'hint',
        text: 'Enter 5-digit ZIP code',
        formatted: query
      });
    }

    // Search cities
    COMMON_CITIES.forEach(location => {
      const cityLower = location.city.toLowerCase();
      const stateLower = location.state.toLowerCase();
      const fullLocation = `${location.city}, ${location.state}`.toLowerCase();
      
      if (cityLower.startsWith(lowerQuery) || 
          stateLower.startsWith(lowerQuery) ||
          fullLocation.includes(lowerQuery)) {
        results.push({
          type: 'city',
          city: location.city,
          state: location.state,
          formatted: `${location.city}, ${location.state}`
        });
      }
    });

    // Search states
    Object.entries(STATE_NAMES).forEach(([abbr, name]) => {
      if (name.toLowerCase().startsWith(lowerQuery) || 
          abbr.toLowerCase().startsWith(lowerQuery)) {
        results.push({
          type: 'state',
          state: name,
          abbr: abbr,
          formatted: `${name} (${abbr})`
        });
      }
    });

    // Limit to 8 results
    setSuggestions(results.slice(0, 8));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    generateSuggestions(newValue);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'hint') return;
    
    let locationData;
    if (suggestion.type === 'city') {
      setInputValue(suggestion.formatted);
      locationData = {
        city: suggestion.city,
        state: suggestion.state,
        formatted: suggestion.formatted
      };
    } else if (suggestion.type === 'state') {
      setInputValue(suggestion.abbr);
      locationData = {
        state: suggestion.state,
        formatted: suggestion.abbr
      };
    }
    
    if (locationData) {
      onChange(locationData);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.filter(s => s.type !== 'hint').length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const validSuggestions = suggestions.filter(s => s.type !== 'hint');
      if (highlightedIndex >= 0 && highlightedIndex < validSuggestions.length) {
        handleSuggestionClick(validSuggestions[highlightedIndex]);
      } else {
        // Parse whatever is in the input
        const parsed = parseLocation(inputValue);
        onChange(parsed);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      if (inputValue && inputValue !== value) {
        const parsed = parseLocation(inputValue);
        onChange(parsed);
      }
    }, 200);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    onChange({ formatted: '' });
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        {showIcon && (
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && generateSuggestions(inputValue)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autofocus}
          className={`w-full ${showIcon ? 'pl-10' : 'pl-4'} pr-10 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const validIndex = suggestions.filter(s => s.type !== 'hint').indexOf(suggestion);
            const isHighlighted = validIndex === highlightedIndex;
            
            if (suggestion.type === 'hint') {
              return (
                <div
                  key={index}
                  className="px-4 py-2 text-sm text-muted-foreground italic"
                >
                  {suggestion.text}
                </div>
              );
            }
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 ${
                  isHighlighted ? 'bg-muted' : ''
                }`}
              >
                {suggestion.type === 'city' ? (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{suggestion.city}</span>, {suggestion.state}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">ST</span>
                    </div>
                    <span>{suggestion.formatted}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}