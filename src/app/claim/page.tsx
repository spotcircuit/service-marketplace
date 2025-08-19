"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { Search, Building2, CheckCircle, Mail, Phone, Shield, ArrowRight, Edit, MapPin, Star } from 'lucide-react';
import { sampleBusinesses } from '@/data/sample-businesses';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClaimForm from './ClaimForm';

function ClaimBusinessContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof sampleBusinesses>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [claimStep, setClaimStep] = useState<'search' | 'verify' | 'success'>('search');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [businessData, setBusinessData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    phone: '',
    website: '',
    category: 'Dumpster Rental',
    placeId: ''
  });
  const [verificationData, setVerificationData] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    verification_method: 'email',
    business_license: '',
    additional_info: '',
  });

  useEffect(() => {
    checkAuth();
    handleUrlParams();
  }, []);

  // Page-level header theming: make header use secondary while on /claim
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-header-tone');
    root.setAttribute('data-header-tone', 'secondary');
    return () => {
      if (prev) {
        root.setAttribute('data-header-tone', prev);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
  }, []);

  // Debounced search for autocomplete
  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleUrlParams = async () => {
    const businessId = searchParams.get('businessId');
    const businessName = searchParams.get('businessName');
    const isNew = searchParams.get('isNew') === 'true';
    const fromPros = searchParams.get('fromPros') === 'true';
    const searchText = searchParams.get('searchText'); // Text user typed without selecting
    const needsAddress = searchParams.get('needsAddress') === 'true';
    const token = searchParams.get('token'); // Claim token from shortened URL
    
    // Get all business details from URL params (when coming from business details page)
    const address = searchParams.get('address') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const zipcode = searchParams.get('zipcode') || '';
    const phone = searchParams.get('phone') || '';
    const email = searchParams.get('email') || '';
    const website = searchParams.get('website') || '';
    const category = searchParams.get('category') || 'Dumpster Rental';
    
    // Store token in session for tracking
    if (token) {
      sessionStorage.setItem('claimToken', token);
    }
    
    // Handle new business from pros page
    if (isNew || (fromPros && !businessId)) {
      const fullAddress = searchParams.get('fullAddress') || '';
      const placeId = searchParams.get('placeId') || '';
      
      console.log('Received params from pros page (NEW):', {
        businessName,
        address,
        city,
        state,
        zipcode,
        phone,
        website,
        fullAddress,
        searchText,
        needsAddress
      });
      
      // If user just typed text without selecting from autocomplete
      if (needsAddress && searchText) {
        // Try to parse what they typed
        const parts = searchText.split(',').map(p => p.trim());
        let parsedAddress = '';
        let parsedCity = '';
        let parsedState = '';
        let parsedZip = '';
        
        if (parts.length === 1) {
          // Just one part - could be address or business name
          parsedAddress = parts[0];
        } else if (parts.length >= 2) {
          parsedAddress = parts[0];
          parsedCity = parts[1];
          if (parts[2]) {
            const stateZip = parts[2].trim();
            const stateZipMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})?/i);
            if (stateZipMatch) {
              parsedState = stateZipMatch[1].toUpperCase();
              parsedZip = stateZipMatch[2] || '';
            } else {
              parsedState = parts[2];
            }
          }
        }
        
        setIsNewBusiness(true);
        setBusinessData({
          name: '',
          address: parsedAddress,
          city: parsedCity,
          state: parsedState,
          zipcode: parsedZip,
          phone: '',
          website: '',
          category: 'Dumpster Rental',
          placeId: ''
        });
        
        // Don't set selectedBusiness for new businesses - let ClaimForm handle it
        setSelectedBusiness(null);
      } else {
        // Normal flow with data from Google Places
        setIsNewBusiness(true);
        setBusinessData({
          name: businessName || '',
          address: address,
          city: city,
          state: state,
          zipcode: zipcode,
          phone: phone,
          website: website,
          category: 'Dumpster Rental',
          placeId: placeId
        });
        
        // Don't set selectedBusiness for new businesses - let ClaimForm handle it
        setSelectedBusiness(null);
      }
      
      setClaimStep('verify');
      setIsLoading(false);
      return;
    }
    
    // Handle existing business from pros page (when business was found)
    if (businessId && fromPros) {
      // Coming from pros page with an existing business
      try {
        const response = await fetch(`/api/businesses/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.business) {
            setSelectedBusiness(data.business);
            setIsNewBusiness(false);
            setClaimStep('verify');
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      }
    }
    
    if (businessId && !isNew && !fromPros) {
      // Coming from business details page or with existing business ID
      try {
        const response = await fetch(`/api/businesses/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.business) {
            // Merge URL params with fetched data (URL params take precedence)
            const mergedBusiness = {
              ...data.business,
              name: businessName ? decodeURIComponent(businessName) : data.business.name,
              address: address || data.business.address,
              city: city || data.business.city,
              state: state || data.business.state,
              zipcode: zipcode || data.business.zipcode,
              phone: phone || data.business.phone,
              email: email || data.business.email,
              website: website || data.business.website,
              category: category || data.business.category
            };
            setSelectedBusiness(mergedBusiness);
            
            // Pre-fill verification data with business owner info if available
            if (mergedBusiness.owner_email || email) {
              setVerificationData(prev => ({
                ...prev,
                owner_email: mergedBusiness.owner_email || email || '',
                owner_phone: mergedBusiness.owner_phone || phone || ''
              }));
            }
            
            setClaimStep('verify');
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      }
      
      // If we couldn't fetch from API, create business object from URL params
      if (businessName) {
        const businessFromParams = {
          id: businessId,
          name: decodeURIComponent(businessName),
          address: address,
          city: city,
          state: state,
          zipcode: zipcode,
          phone: phone,
          email: email,
          website: website,
          category: category,
          is_claimed: false,
          is_verified: false
        };
        setSelectedBusiness(businessFromParams);
        setClaimStep('verify');
      }
    } else if (businessId) {
      // Legacy flow - try to fetch by ID only
      try {
        const response = await fetch(`/api/businesses/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.business) {
            setSelectedBusiness(data.business);
            setClaimStep('verify');
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      }
    }
    setIsLoading(false);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.businesses || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (business: any) => {
    setSelectedBusiness(business);
    setSearchQuery(business.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setClaimStep('verify');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Search businesses by name, phone, or address
    const results = sampleBusinesses.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleClaimBusiness = (business: any) => {
    setSelectedBusiness(business);
    setClaimStep('verify');
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a password for the user (they can change it later)
    const tempPassword = 'Business' + Math.random().toString(36).slice(-8) + '!';

    try {
      const requestBody: any = {
        businessId: selectedBusiness?.id,
        email: verificationData.owner_email,
        password: tempPassword,
        name: verificationData.owner_name,
        phone: verificationData.owner_phone,
        verificationMethod: verificationData.verification_method,
        verificationCode: '123456', // In production, this would be sent via email/SMS
      };
      
      // If this is a new business, include the business data
      if (isNewBusiness) {
        requestBody.businessName = businessData.name;
        requestBody.businessAddress = businessData.address;
        requestBody.businessCity = businessData.city;
        requestBody.businessState = businessData.state;
        requestBody.businessZipcode = businessData.zipcode;
        requestBody.businessPhone = businessData.phone;
        requestBody.businessWebsite = businessData.website;
        requestBody.businessCategory = businessData.category;
      }
      
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        // Store the temp password to show the user
        localStorage.setItem('tempPassword', tempPassword);
        setClaimStep('success');

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = data.redirect || '/dealer-portal';
        }, 3000);
      } else {
        alert(data.error || 'Failed to claim business. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Claim Your Business Listing
            </h1>
            <p className="text-xl text-white/90">
              Take control of your online presence and start getting more leads
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {claimStep === 'search' && (
          <div className="max-w-3xl mx-auto">
            {/* Search Form */}
            <div className="bg-card rounded-lg border p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Find Your Business</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start typing your business name or address
                  </label>
                  <div className="relative">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(-1);
                          }}
                          onKeyDown={handleKeyDown}
                          onFocus={() => {
                            if (suggestions.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on suggestion
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          placeholder="e.g., ABC Dumpsters or 123 Main Street"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          autoComplete="off"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-3.5">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2"
                      >
                        <Search className="h-5 w-5" />
                        Search
                      </button>
                    </div>
                    
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
                        <div className="p-2">
                          {suggestions.map((business, index) => (
                            <div
                              key={business.id}
                              onClick={() => handleSuggestionClick(business)}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div className="font-medium">{business.name}</div>
                                    {business.is_verified && (
                                      <Shield className="h-4 w-4 text-blue-600" />
                                    )}
                                    {business.is_claimed && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Claimed
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>
                                      {business.address && `${business.address}, `}
                                      {business.city}, {business.state} {business.zipcode}
                                    </span>
                                  </div>
                                  {business.rating > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm font-medium">{business.rating}</span>
                                      <span className="text-sm text-muted-foreground">
                                        ({business.reviews} reviews)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {suggestions.length >= 8 && (
                          <div className="p-3 border-t text-center text-sm text-muted-foreground">
                            Type more to refine your search...
                          </div>
                        )}
                      </div>
                    )}
                    
                    {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !isSearching && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border p-6 text-center">
                        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          No businesses found matching "{searchQuery}"
                        </p>
                        <Link
                          href={`/pros?searchText=${encodeURIComponent(searchQuery)}&needsAddress=true`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
                        >
                          Add Your Business
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </form>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Can't find your business?
                </p>
                <Link
                  href="/pros"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Add your business listing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Found {searchResults.length} business{searchResults.length !== 1 ? 'es' : ''}
                </h3>
                {searchResults.map(business => (
                  <div key={business.id} className="bg-card rounded-lg border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold">{business.name}</h4>
                          {business.is_claimed && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Already Claimed
                            </span>
                          )}
                          {business.is_verified && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <Shield className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{business.category}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {business.phone}
                          </span>
                          <span>{business.address}, {business.city}, {business.state}</span>
                        </div>
                      </div>

                      {!business.is_claimed ? (
                        <button
                          onClick={() => handleClaimBusiness(business)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                        >
                          Claim This Business
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          {user && user.business_id === business.id ? (
                            <Link
                              href="/dealer-portal"
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium inline-flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Manage Listing
                            </Link>
                          ) : (
                            <Link
                              href="/login?type=business"
                              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium"
                            >
                              Sign In to Manage
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div className="bg-card rounded-lg border p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t find a business matching your search.
                </p>
                <Link
                  href="/signup?pro=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Add Your Business
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {claimStep === 'verify' && (
          <ClaimForm 
            business={selectedBusiness}
            isNewBusiness={isNewBusiness}
            businessData={businessData}
            onBusinessDataChange={setBusinessData}
          />
        )}

        {/* Original verify form - now hidden */}
        {false && selectedBusiness && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-8">
              <h2 className="text-2xl font-bold mb-6">
                {isNewBusiness ? 'Complete Your Business Listing' : 'Verify Your Ownership'}
              </h2>

              {/* Business Info Section */}
              {isNewBusiness ? (
                <div className="space-y-6 mb-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessData.name}
                          onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                          placeholder="Enter your business name"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessData.address}
                          onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                          placeholder="123 Main Street"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessData.city}
                          onChange={(e) => setBusinessData({...businessData, city: e.target.value})}
                          placeholder="City"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessData.state}
                          onChange={(e) => setBusinessData({...businessData, state: e.target.value})}
                          placeholder="State"
                          maxLength={2}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={businessData.zipcode}
                          onChange={(e) => setBusinessData({...businessData, zipcode: e.target.value})}
                          placeholder="12345"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Business Phone
                        </label>
                        <input
                          type="tel"
                          value={businessData.phone}
                          onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={businessData.website}
                          onChange={(e) => setBusinessData({...businessData, website: e.target.value})}
                          placeholder="https://www.yourbusiness.com"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">{selectedBusiness.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.address}, {selectedBusiness.city}, {selectedBusiness.state}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedBusiness.phone}</p>
                </div>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationData.owner_name}
                      onChange={(e) => setVerificationData({...verificationData, owner_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={verificationData.owner_phone}
                      onChange={(e) => setVerificationData({...verificationData, owner_phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={verificationData.owner_email}
                    onChange={(e) => setVerificationData({...verificationData, owner_email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business License Number (if available)
                  </label>
                  <input
                    type="text"
                    value={verificationData.business_license}
                    onChange={(e) => setVerificationData({...verificationData, business_license: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Method *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="email"
                        checked={verificationData.verification_method === 'email'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Email Verification</div>
                        <div className="text-sm text-muted-foreground">
                          We&apos;ll send a verification code to your business email
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="phone"
                        checked={verificationData.verification_method === 'phone'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Phone Verification</div>
                        <div className="text-sm text-muted-foreground">
                          We&apos;ll call the business phone number on file
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="document"
                        checked={verificationData.verification_method === 'document'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Document Verification</div>
                        <div className="text-sm text-muted-foreground">
                          Upload business license or registration documents
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Information
                  </label>
                  <textarea
                    rows={3}
                    value={verificationData.additional_info}
                    onChange={(e) => setVerificationData({...verificationData, additional_info: e.target.value})}
                    placeholder="Tell us more about your role at this business..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                  >
                    Submit Claim Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimStep('search');
                      setSelectedBusiness(null);
                    }}
                    className="px-6 py-3 border rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {claimStep === 'success' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold mb-4">Claim Request Submitted!</h2>

              <p className="text-muted-foreground mb-6">
                Your business <strong>{selectedBusiness?.name}</strong> has been successfully claimed!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">Your Account Details:</h3>
                <p className="text-sm text-green-800">
                  Email: <strong>{verificationData.owner_email}</strong><br/>
                  Temporary Password: <strong>{typeof window !== 'undefined' ? localStorage.getItem('tempPassword') : ''}</strong>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Please save this password. You can change it after logging in.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold mb-3">What happens next?</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>You&apos;ll receive a verification {verificationData.verification_method === 'email' ? 'email' : 'call'} within 24 hours</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Complete the verification process to confirm ownership</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Once verified, you&apos;ll get full access to manage your listing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">4.</span>
                    <span>Start receiving leads and growing your business!</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-3 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/for-business"
                  className="px-6 py-3 border rounded-lg hover:bg-muted font-medium"
                >
                  Learn About Premium
                </Link>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ClaimBusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ClaimBusinessContent />
    </Suspense>
  );
}
