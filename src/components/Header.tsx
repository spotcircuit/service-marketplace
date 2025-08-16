"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/contexts/ConfigContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, ChevronDown, User, LogOut, Shield, Briefcase, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const { config, loading } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
    } finally {
      setUserLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
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
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-primary">Loading...</div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* QuickAccess Bar */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/trust-safety" className="text-muted-foreground hover:text-primary transition-colors">
                Trust & Safety
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {!userLoading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>{user.role === 'admin' ? 'Admin Panel' : user.role === 'business_owner' ? 'Dealer Portal' : 'My Account'}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setQuickAccessOpen(!quickAccessOpen)}
                        className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Quick Access</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {quickAccessOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border p-2 z-50">
                          <div className="space-y-1">
                            <Link
                              href="/login?type=customer"
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors"
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
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors"
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
                              className="flex items-start p-3 rounded-md hover:bg-muted transition-colors"
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
                                className="block w-full text-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                {config.businessName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
              >
                <span>Find Services</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {servicesDropdownOpen && (
                <div
                  className="absolute top-full left-0 pt-2 w-64 z-50"
                >
                  <div className="bg-white rounded-lg shadow-xl border p-4">
                    <Link
                      href="/directory"
                      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      Browse All Services
                    </Link>
                    <div className="border-t my-2"></div>
                    <div className="space-y-2">
                      <Link
                        href="/services/dumpster-rental"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="text-sm font-medium">Dumpster Rental</div>
                      </Link>
                      <Link
                        href="/services/junk-removal"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="text-sm font-medium">Junk Removal</div>
                      </Link>
                      <Link
                        href="/services/demolition"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="text-sm font-medium">Demolition</div>
                      </Link>
                      <Link
                        href="/services/construction-cleanup"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="text-sm font-medium">Construction Cleanup</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/resources"
              className="text-foreground hover:text-primary transition-colors"
            >
              Resources
            </Link>

            <Link
              href="/for-business"
              className="text-foreground hover:text-primary transition-colors"
            >
              For Professionals
            </Link>

            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>

            {/* CTA Button */}
            {!user && (
              <Link
                href="/for-business"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Join as a Pro
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-muted"
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
                href="/directory"
                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Services
              </Link>
              <Link
                href="/resources"
                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/for-business"
                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Professionals
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* Mobile User Menu */}
              <div className="border-t pt-2 mt-2">
                {!userLoading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href={getDashboardLink()}
                          className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {user.role === 'admin' ? 'Admin Panel' : user.role === 'business_owner' ? 'Dealer Portal' : 'Dashboard'}
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/for-business"
                          className="block mx-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-center font-medium mt-2"
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
