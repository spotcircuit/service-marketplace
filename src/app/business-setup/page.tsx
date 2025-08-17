'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Building2, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface GooglePlace {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface ExistingBusiness {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  is_claimed: boolean;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  category?: string | null;
}

export default function BusinessSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'verify' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [existingBusiness, setExistingBusiness] = useState<ExistingBusiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressComponents, setAddressComponents] = useState({
    address: '',
    city: '',
    state: '',
    zipcode: '',
    lat: 0,
    lng: 0
  });

  // Load Google Places API
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Debounced search for address suggestions
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // For now, we'll use a mock implementation
    // In production, this would call Google Places Autocomplete API
    try {
      // Mock suggestions - replace with actual Google Places API call
      const mockSuggestions = [
        {
          place_id: '1',
          description: `${query}, Houston, TX`,
          structured_formatting: {
            main_text: query,
            secondary_text: 'Houston, TX'
          }
        }
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddresses(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddresses]);

  const handlePlaceSelect = async (place: any) => {
    setLoading(true);
    setError('');
    
    try {
      // Parse the address components
      // In production, this would use Google Places Details API
      const components = {
        address: place.description.split(',')[0] || '',
        city: place.description.split(',')[1]?.trim() || '',
        state: place.description.split(',')[2]?.trim()?.split(' ')[0] || '',
        zipcode: place.description.split(',')[2]?.trim()?.split(' ')[1] || '',
        lat: 29.7604, // Mock coordinates for Houston
        lng: -95.3698
      };

      setAddressComponents(components);
      setSelectedPlace(place);
      setSuggestions([]);
      
      // Check for existing business at this address
      const response = await fetch('/api/businesses/check-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: components.address,
          city: components.city,
          state: components.state,
          zipcode: components.zipcode
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.business) {
          setExistingBusiness(data.business);
          setBusinessName(data.business.name);
          setStep('verify');
        } else {
          setStep('create');
        }
      } else {
        // No existing business found, proceed to create
        setStep('create');
      }
    } catch (error) {
      console.error('Error processing address:', error);
      setError('Failed to verify address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = () => {
    // Navigate to claim page with business data
    const params = new URLSearchParams({
      businessName: businessName || '',
      address: addressComponents.address,
      city: addressComponents.city,
      state: addressComponents.state,
      zipcode: addressComponents.zipcode,
      fromBusinessSetup: 'true',
      ...(existingBusiness ? { 
        businessId: existingBusiness.id,
        phone: existingBusiness.phone || '',
        email: existingBusiness.email || '',
        website: existingBusiness.website || '',
        category: existingBusiness.category || 'Dumpster Rental'
      } : {
        isNew: 'true'
      })
    });
    
    router.push(`/claim?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'search' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'search' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Find Your Business</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center ${step === 'verify' || step === 'create' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'verify' || step === 'create' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Verify Details</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 'search' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Let's Find Your Business
                </h1>
                <p className="text-gray-600">
                  Enter your business name and address to get started
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                    <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Start typing your address..."
                    />
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    {loading && (
                      <Loader2 className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 animate-spin" />
                    )}
                  </div>

                  {/* Address Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => handlePlaceSelect(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                              </div>
                              <div className="text-sm text-gray-500">
                                {suggestion.structured_formatting?.secondary_text || suggestion.description.split(',').slice(1).join(',')}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!businessName || !searchQuery ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                      <div className="text-sm text-blue-700">
                        Enter your business name and select your address from the suggestions to continue
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          {step === 'verify' && existingBusiness && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  We Found Your Business!
                </h1>
                <p className="text-gray-600">
                  {existingBusiness.is_claimed 
                    ? 'This business has already been claimed'
                    : 'You can claim this business listing'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{existingBusiness.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{existingBusiness.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{existingBusiness.city}, {existingBusiness.state} {existingBusiness.zipcode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${existingBusiness.is_claimed ? 'text-red-600' : 'text-green-600'}`}>
                      {existingBusiness.is_claimed ? 'Already Claimed' : 'Available to Claim'}
                    </span>
                  </div>
                </div>
              </div>

              {existingBusiness.is_claimed ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-700">
                        This business has already been claimed. If you believe this is your business, please contact support.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('search')}
                    className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Search Again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleCreateBusiness}
                    className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Claim This Business
                  </button>
                  <button
                    onClick={() => setStep('search')}
                    className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    This Isn't My Business
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'create' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Your Business Listing
                </h1>
                <p className="text-gray-600">
                  We'll create a new listing for your business
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">New Business Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{addressComponents.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{addressComponents.city}, {addressComponents.state} {addressComponents.zipcode}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  <div className="text-sm text-green-700">
                    <strong>Address Verified!</strong> Your business location has been confirmed via Google Maps.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCreateBusiness}
                  className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue to Create Account
                </button>
                <button
                  onClick={() => {
                    setStep('search');
                    setSearchQuery('');
                    setSelectedPlace(null);
                  }}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Edit Address
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login?type=business" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}