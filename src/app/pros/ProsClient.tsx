'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Shield,
  BarChart3,
  MapPin,
  Search as SearchIcon,
  ArrowRight,
  Phone,
  Award,
  Briefcase,
  CheckCircle,
  Zap,
} from 'lucide-react';

export default function ProsClient() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [foundBusiness, setFoundBusiness] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handlePlaceSelect = useCallback(async () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place || !place.place_id) return;

    setPlaceDetails(place);
    setIsLoading(true);
    setShowResults(false);

    const addressComponents = place.address_components || [];

    let city = '';
    let state = '';
    let zipcode = '';
    let streetNumber = '';
    let route = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (types.includes('locality')) city = component.long_name;
      if (types.includes('administrative_area_level_1')) state = component.short_name;
      if (types.includes('postal_code')) zipcode = component.long_name;
      if (types.includes('street_number')) streetNumber = component.long_name;
      if (types.includes('route')) route = component.long_name;
    });

    let streetAddress = '';
    if (streetNumber && route) streetAddress = `${streetNumber} ${route}`;
    else if (route) streetAddress = route;

    const placeName = place.name || '';
    const isJustAddress = !placeName ||
      placeName === place.formatted_address ||
      placeName === streetAddress ||
      (streetNumber && placeName.startsWith(streetNumber));

    const businessName = isJustAddress ? '' : placeName;

    if (!streetAddress && place.formatted_address) {
      const parts = place.formatted_address.split(',');
      if (parts.length > 0) {
        const firstPart = parts[0].trim();
        if (/\d/.test(firstPart)) streetAddress = firstPart;
      }
    }

    const businessDetails = {
      name: businessName,
      address: streetAddress,
      fullAddress: place.formatted_address || '',
      city,
      state,
      zipcode,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      placeId: place.place_id,
    };

    try {
      const searchParams = new URLSearchParams();
      if (streetAddress) searchParams.append('address', streetAddress);
      if (city) searchParams.append('city', city);
      if (state) searchParams.append('state', state);
      if (businessName) searchParams.append('name', businessName);

      const response = await fetch(`/api/businesses/check?${searchParams.toString()}`);
      const data = await response.json();

      if (data.exists && data.business) {
        setFoundBusiness(data.business);
        setPlaceDetails({ ...place, businessDetails });
        setShowResults(true);
      } else {
        setFoundBusiness(null);
        setPlaceDetails({ ...place, businessDetails });
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error checking business:', error);
      setFoundBusiness(null);
      setPlaceDetails({ ...place, businessDetails });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize Google Places Autocomplete if available
  useEffect(() => {
    let mounted = true;

    const initAutocomplete = () => {
      try {
        if (!mounted || !inputRef.current) return;
        const g = (globalThis as any).google;
        if (g?.maps?.places) {
          autocompleteRef.current = new g.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'us' },
            fields: ['name', 'formatted_address', 'place_id', 'geometry', 'types', 'address_components', 'formatted_phone_number', 'website'],
          });
          autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }
      } catch (err) {
        console.error('Error initializing Google Autocomplete:', err);
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      const g = (globalThis as any).google;
      if (autocompleteRef.current && g?.maps?.event) {
        g.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [handlePlaceSelect]);

  const handleClaimExisting = () => {
    if (!foundBusiness) return;

    const claimParams = new URLSearchParams({
      businessId: foundBusiness.id,
      businessName: foundBusiness.name,
      address: foundBusiness.address || '',
      city: foundBusiness.city,
      state: foundBusiness.state,
      zipcode: foundBusiness.zipcode || '',
      phone: foundBusiness.phone || '',
      email: foundBusiness.email || '',
      website: foundBusiness.website || '',
      category: foundBusiness.category || 'Dumpster Rental',
      fromPros: 'true',
    });
    router.push(`/claim?${claimParams.toString()}`);
  };

  const handleCreateNew = () => {
    if (!placeDetails || !placeDetails.businessDetails) return;

    const details = placeDetails.businessDetails;

    let parsedCity = details.city;
    let parsedState = details.state;
    let parsedZip = details.zipcode;
    let parsedAddress = details.address;

    if (details.fullAddress && (!parsedCity || !parsedState)) {
      const parts = details.fullAddress.split(',').map((p: string) => p.trim());
      if (parts.length >= 3) {
        if (!parsedAddress && parts[0]) parsedAddress = parts[0];
        if (!parsedCity && parts[1]) parsedCity = parts[1];
        if (!parsedState && parts[2]) {
          const stateZip = parts[2].trim();
          const stateZipMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})?/);
          if (stateZipMatch) {
            parsedState = stateZipMatch[1];
            if (!parsedZip && stateZipMatch[2]) parsedZip = stateZipMatch[2];
          }
        }
      }
    }

    const params: Record<string, string> = {
      businessName: details.name || '',
      address: parsedAddress || '',
      city: parsedCity || '',
      state: parsedState || '',
      zipcode: parsedZip || '',
      phone: details.phone || '',
      website: details.website || '',
      placeId: details.placeId || '',
      fullAddress: details.fullAddress || placeDetails.formatted_address || '',
      fromPros: 'true',
      isNew: 'true',
    };

    const newBusinessParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newBusinessParams.append(key, value);
    });

    router.push(`/claim?${newBusinessParams.toString()}`);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'No Upfront Costs',
      description: 'Join our network free. No membership fees, no hidden charges. We only succeed when you do.',
    },
    {
      icon: TrendingUp,
      title: 'Guaranteed Orders',
      description: 'We send you confirmed orders, not leads. No more chasing quotes or competing on price.',
    },
    {
      icon: Clock,
      title: 'Get Paid Fast',
      description: 'Reliable, on-time payments for all completed orders. No chasing invoices or late payments.',
    },
    {
      icon: Users,
      title: 'We Handle Sales',
      description: 'Our team manages all customer interactions, from initial contact to final billing.',
    },
    {
      icon: Shield,
      title: 'Protected Territory',
      description: 'Exclusive service areas mean more consistent business without oversaturation.',
    },
    {
      icon: BarChart3,
      title: 'Growth Support',
      description: 'Marketing, technology, and operational support to help scale your business.',
    },
  ];

  const howItWorks = [
    { step: '1', title: 'Apply to Join', description: 'Quick application process. We review your credentials and service capabilities.' },
    { step: '2', title: 'Get Approved', description: 'Once approved, set your service areas and availability preferences.' },
    { step: '3', title: 'Receive Orders', description: 'Get confirmed orders directly to your dashboard or phone. No bidding required.' },
    { step: '4', title: 'Complete Service', description: 'Deliver and pick up containers according to customer requirements.' },
    { step: '5', title: 'Get Paid', description: 'Submit completion confirmation and receive payment within 7 business days.' },
  ];

  const requirements = [
    'Valid business license and insurance',
    'Minimum 2 years in waste management',
    'Fleet of roll-off trucks and containers',
    'Professional, uniformed drivers',
    'GPS tracking capability',
    'Same-day/next-day availability',
    'Commitment to customer service',
    'Environmental compliance certification',
  ];

  const stats = [
    { value: '2,000+', label: 'Partner Network' },
    { value: '15,000+', label: 'Monthly Orders' },
    { value: '98%', label: 'Partner Retention' },
    { value: '$2.5M+', label: 'Monthly Payouts' },
  ];

  const testimonials = [
    {
      quote: 'Joining this network was the best decision for our business. Consistent orders, reliable payments, and no marketing headaches.',
      author: 'Mike Johnson',
      company: 'Johnson Waste Solutions',
      location: 'Richmond, VA',
    },
    {
      quote: "We've grown 40% since partnering. The technology and support have transformed how we operate.",
      author: 'Sarah Chen',
      company: 'Green Valley Disposal',
      location: 'Charlotte, NC',
    },
    {
      quote: 'Finally, a partner program that actually delivers. Real orders, real revenue, real growth.',
      author: 'Tom Martinez',
      company: 'Metro Dumpster Co',
      location: 'Baltimore, MD',
    },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    if (placeDetails && placeDetails.businessDetails) {
      if (showResults) return;
      handlePlaceSelect();
    } else {
      const params = new URLSearchParams({
        searchText: address,
        fromPros: 'true',
        isNew: 'true',
        needsAddress: 'true',
      });
      router.push(`/claim?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-hero-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">Join Our Growing Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Grow Your Dumpster Rental Business</h1>
            <p className="text-xl mb-8 text-hero-foreground/90 max-w-3xl mx-auto">
              Partner with us to get guaranteed orders, reliable payments, and the technology to scale. No upfront costs, no lead fees, just real business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#apply" className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg">
                Apply to Join
              </a>
              <a href="tel:1-888-PRO-LINE" className="px-8 py-4 bg-primary-foreground/10 backdrop-blur text-hero-foreground rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Call 1-888-PRO-LINE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Partner With Us</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We handle the hard parts of growing a dumpster rental business so you can focus on what you do best.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon as any;
              return (
                <div key={benefit.title} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-5 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step.step}</div>
                {idx < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-6 h-5 w-5 text-gray-400" />
                )}
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Partners Say</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="bg-white rounded-lg p-6 shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Partner Requirements</h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {requirements.map((req) => (
              <div key={req} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">Don't meet all requirements? Let's talk - we may have solutions to help you qualify.</p>
            <a href="tel:1-888-PRO-LINE" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition">
              <Phone className="h-5 w-5" />
              Call to Discuss
            </a>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get Started as a Partner</h2>
            <p className="text-muted-foreground">Enter your business address to get started</p>
          </div>

          {/* Address Lookup Form */}
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Find Your Business</h3>
              </div>
              <p className="text-sm text-muted-foreground">Start typing your business address and select from the suggestions</p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your business address..."
                    disabled={isLoading}
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Start typing and select your business from the dropdown suggestions for accurate address details</p>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Checking our directory...</span>
                </div>
              )}

              {showResults && !isLoading && (
                <div className="border-t pt-6">
                  {foundBusiness ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">We found a business at this address!</span>
                      </div>

                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">{foundBusiness.name}</h4>
                        <p className="text-sm text-muted-foreground">{foundBusiness.address}</p>
                        <p className="text-sm text-muted-foreground">{foundBusiness.city}, {foundBusiness.state} {foundBusiness.zipcode}</p>
                        {foundBusiness.phone && <p className="text-sm text-muted-foreground">📞 {foundBusiness.phone}</p>}
                        {foundBusiness.is_claimed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full mt-2">
                            <Shield className="h-3 w-3" />
                            Already Claimed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-2">
                            <CheckCircle className="h-3 w-3" />
                            Available to Claim
                          </span>
                        )}
                      </div>

                      {foundBusiness.is_claimed ? (
                        <div className="space-y-3">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">This business has already been claimed. If this is your business, please log in to manage it.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Link href="/login?type=business" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                              Log In
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                const disputeParams = new URLSearchParams({
                                  businessId: foundBusiness.id,
                                  businessName: foundBusiness.name,
                                  action: 'dispute',
                                });
                                router.push(`/contact?${disputeParams.toString()}`);
                              }}
                              className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition flex items-center justify-center gap-2"
                            >
                              Dispute Claim
                              <Shield className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-center">
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                              Forgot your password?
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleClaimExisting} className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                          Claim This Business
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ) : placeDetails ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Briefcase className="h-5 w-5" />
                        <span className="font-medium">Business not found - Let's add it!</span>
                      </div>

                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">
                          {placeDetails.businessDetails?.name ? (
                            placeDetails.businessDetails.name
                          ) : (
                            <span className="text-muted-foreground italic">Business name will be required</span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">{placeDetails.formatted_address}</p>
                        {placeDetails.businessDetails?.phone && (
                          <p className="text-sm text-muted-foreground">Phone: {placeDetails.businessDetails.phone}</p>
                        )}
                        {placeDetails.businessDetails?.website && (
                          <p className="text-sm text-muted-foreground">Website: {placeDetails.businessDetails.website}</p>
                        )}
                      </div>

                      <button onClick={handleCreateNew} className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                        Add Your Business
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {!showResults && (
                <button
                  type="submit"
                  disabled={!address || isLoading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </form>

            <div className="mt-8 pt-6 border-t">
              <div className="grid md:grid-cols-2 gap-4 text-center">
                <div>
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Instant Verification</p>
                  <p className="text-xs text-muted-foreground">We'll verify your business automatically</p>
                </div>
                <div>
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Quick Setup</p>
                  <p className="text-xs text-muted-foreground">Complete your profile in minutes</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">Already have an account?</p>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in to your dealer portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-white/90">Join 2,000+ successful partners nationwide. Start receiving orders within 48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply" className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition">
              Apply Now
            </a>
            <Link href="/commercial" className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition">
              Learn About Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
