"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useConfig } from '@/contexts/ConfigContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown, User, LogOut, Shield, Briefcase, Users, Settings, UserCircle, MapPin } from 'lucide-react';
import GoogleLocationSearch from '@/components/GoogleLocationSearch';

export default function Header() {
  const { user, loading: authLoading, logout } = useAuth();
  const { config, loading } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [locationsDropdownOpen, setLocationsDropdownOpen] = useState(false);
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ city?: string; state?: string; zipcode?: string; formatted: string }>({ formatted: 'Select Location' });
  
  // Load saved location from localStorage on mount or detect it
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
      } catch (e) {
        console.error('Error parsing saved location:', e);
        detectUserLocation();
      }
    } else {
      // No saved location, detect it
      detectUserLocation();
    }
  }, []);

  const detectUserLocation = async () => {
    try {
      const response = await fetch('/api/geolocation');
      if (response.ok) {
        const data = await response.json();
        if (data.city && (data.region_code || data.state)) {
          const detectedLocation = {
            city: data.city,
            state: data.region_code || data.state,
            zipcode: data.postal || '',
            formatted: `${data.city}, ${data.region_code || data.state}`
          };
          setCurrentLocation(detectedLocation);
          localStorage.setItem('userLocation', JSON.stringify(detectedLocation));
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      // Set default location
      const defaultLocation = {
        city: 'Ashburn',
        state: 'VA',
        zipcode: '20147',
        formatted: 'Ashburn, VA'
      };
      setCurrentLocation(defaultLocation);
      localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
    }
  };

  const handleLocationChange = (location: { city?: string; state?: string; zipcode?: string; formatted: string }) => {
    // Only update if we have valid city and state
    if (location.city && location.state) {
      setCurrentLocation(location);
      setShowLocationSearch(false);
      
      // Save to localStorage
      localStorage.setItem('userLocation', JSON.stringify(location));
      // Trigger a custom event so other components can listen for location changes
      window.dispatchEvent(new CustomEvent('locationChanged', { detail: location }));
    } else if (!location.formatted || location.formatted === '') {
      // If empty selection, just close the search without updating
      setShowLocationSearch(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'business_owner':
        return '/dealer-portal';
      case 'customer':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  if (loading || !config) {
    return (
      <header className="site-header sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-primary">Loading...</div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="site-header sticky top-0 z-50 shadow-sm">
      {/* QuickAccess Bar */}
      <div className="topbar border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="/trust-safety" className="text-foreground/80 hover:text-foreground transition-colors">
                Trust & Safety
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {!authLoading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setQuickAccessOpen(!quickAccessOpen)}
                        className="flex items-center space-x-1 text-sm text-foreground hover:text-foreground/80 transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Quick Access</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {quickAccessOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-lg shadow-xl border p-2 z-50">
                          <div className="space-y-1">
                            <Link
                              href={getDashboardLink()}
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors text-foreground"
                              onClick={() => setQuickAccessOpen(false)}
                            >
                              <User className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">{user.role === 'admin' ? 'Admin Panel' : user.role === 'business_owner' ? 'Business Dashboard' : 'Customer Dashboard'}</div>
                                <div className="text-xs text-muted-foreground">Go to your dashboard</div>
                              </div>
                            </Link>

                            <Link
                              href="/profile"
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors text-foreground"
                              onClick={() => setQuickAccessOpen(false)}
                            >
                              <Settings className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">Profile</div>
                                <div className="text-xs text-muted-foreground">Manage your account</div>
                              </div>
                            </Link>

                            <button
                              onClick={() => { handleLogout(); setQuickAccessOpen(false); }}
                              className="flex w-full items-start p-3 rounded-md hover:bg-muted transition-colors text-left text-foreground"
                            >
                              <LogOut className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">Sign Out</div>
                                <div className="text-xs text-muted-foreground">End your session</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setQuickAccessOpen(!quickAccessOpen)}
                        className="flex items-center space-x-1 text-sm text-foreground hover:text-foreground/80 transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Quick Access</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {quickAccessOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-popover text-popover-foreground rounded-lg shadow-xl border p-2 z-50">
                          <div className="space-y-1">
                            <Link
                              href="/login?type=customer"
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors text-foreground"
                              onClick={() => setQuickAccessOpen(false)}
                            >
                              <Users className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">Customer Login</div>
                                <div className="text-xs text-muted-foreground">Find services & get quotes</div>
                              </div>
                            </Link>

                            <Link
                              href="/login?type=business"
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors text-foreground"
                              onClick={() => setQuickAccessOpen(false)}
                            >
                              <Briefcase className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">Business Owner Login</div>
                                <div className="text-xs text-muted-foreground">Manage leads & grow your business</div>
                              </div>
                            </Link>

                            <Link
                              href="/login?type=admin"
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors text-foreground"
                              onClick={() => setQuickAccessOpen(false)}
                            >
                              <Shield className="h-5 w-5 text-primary mt-0.5 mr-3" />
                              <div>
                                <div className="font-medium text-sm">Admin Login</div>
                                <div className="text-xs text-muted-foreground">Platform administration</div>
                              </div>
                            </Link>

                            <div className="border-t my-2 pt-2">
                              <Link
                                href="/signup"
                                className="block w-full text-center px-4 py-2 btn-primary rounded-md text-sm"
                                onClick={() => setQuickAccessOpen(false)}
                              >
                                Create New Account
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between md:justify-start gap-3 md:gap-6 h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" aria-label={config.businessName || 'Home'}>
              <Image
                src="/images/dumpquote.png"
                alt={config.businessName || 'Brand logo'}
                width={200}
                height={50}
                priority
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/homeowners"
              className="text-inherit hover:opacity-80 transition-colors"
            >
              Homeowners
            </Link>

            <Link
              href="/commercial"
              className="text-inherit hover:opacity-80 transition-colors"
            >
              Commercial
            </Link>

            <Link
              href="/dumpster-sizes"
              className="text-inherit hover:opacity-80 transition-colors"
            >
              Dumpster Sizes
            </Link>

            {/* Locations Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setLocationsDropdownOpen(true)}
              onMouseLeave={() => setLocationsDropdownOpen(false)}
            >
              <button
                onClick={() => setLocationsDropdownOpen(!locationsDropdownOpen)}
                className="flex items-center space-x-1 text-inherit hover:opacity-80 transition-colors"
              >
                <span>Locations</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {locationsDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-popover text-popover-foreground rounded-lg shadow-xl border p-4 max-h-96 overflow-y-auto">
                    <Link
                      href="/directory"
                      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors font-medium mb-2 text-foreground"
                    >
                      🔍 Search Business Directory
                    </Link>
                    <Link
                      href="/locations"
                      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors font-medium mb-2 text-foreground"
                    >
                      📍 View All Service Areas
                    </Link>
                    <div className="border-t my-2"></div>
                    <p className="text-xs text-muted-foreground px-3 pb-2">Select a state:</p>
                    <div className="space-y-1">
                      <Link href="/virginia" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        Virginia
                      </Link>
                      <Link href="/maryland" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        Maryland
                      </Link>
                      <Link href="/district-of-columbia" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        District of Columbia
                      </Link>
                      <Link href="/north-carolina" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        North Carolina
                      </Link>
                      <Link href="/pennsylvania" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        Pennsylvania
                      </Link>
                      <Link href="/west-virginia" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        West Virginia
                      </Link>
                      <Link href="/delaware" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        Delaware
                      </Link>
                      <Link href="/new-jersey" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium text-foreground">
                        New Jersey
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>


            <Link
              href="/about"
              className="text-inherit hover:opacity-80 transition-colors"
            >
              About
            </Link>

            {/* Location Selector */}
            <div className="relative">
              {!showLocationSearch ? (
                <button
                  onClick={() => setShowLocationSearch(true)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentLocation.city && currentLocation.state 
                      ? `${currentLocation.city}, ${currentLocation.state}`
                      : currentLocation.formatted === 'Select Location' 
                        ? 'Select Location'
                        : currentLocation.formatted
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              ) : (
                <div className="absolute top-0 right-0 z-50 bg-popover text-popover-foreground rounded-lg shadow-xl border p-3 min-w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Change Location</span>
                    <button
                      onClick={() => setShowLocationSearch(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <GoogleLocationSearch
                    value={currentLocation.formatted}
                    onChange={handleLocationChange}
                    placeholder="Enter city, state or ZIP"
                    autofocus={true}
                  />
                </div>
              )}
            </div>

            {/* CTA Button - Always show, different text based on auth */}
            <Link
              href={!user ? '/pros' : user.role === 'business_owner' ? '/dealer-portal' : '/pros'}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold transition-all duration-200"
            >
              {!user ? 'Join as a Pro' : user.role === 'business_owner' ? 'Partner Portal' : 'For Pros'}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-inherit hover:opacity-80"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              <Link
                href="/dumpster-sizes"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dumpster Sizes
              </Link>
              <Link
                href="/commercial"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Commercial
              </Link>
              <Link
                href="/directory"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Directory
              </Link>
              <Link
                href="/locations"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Locations
              </Link>
              <Link
                href="/pros"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pros
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* Mobile User Menu */}
              <div className="border-t pt-2 mt-2">
                {!authLoading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href={getDashboardLink()}
                          className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {user.role === 'admin' ? 'Admin Panel' : user.role === 'business_owner' ? 'Business Dashboard' : 'Customer Dashboard'}
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Edit Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-3 py-2 rounded-md text-inherit hover:opacity-80 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/pros"
                          className="block mx-3 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-center mt-2 font-semibold"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Join as a Pro
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
