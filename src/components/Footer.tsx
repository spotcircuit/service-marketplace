"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useConfig } from '@/contexts/ConfigContext';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { config, loading } = useConfig();
  const currentYear = new Date().getFullYear();

  // Popular states for footer links
  const popularStates = [
    'Virginia', 'Maryland', 'North Carolina', 'Pennsylvania',
    'West Virginia', 'Delaware', 'New Jersey', 'New York'
  ];

  // Major cities for footer links - focusing on Mid-Atlantic region
  const majorCities = [
    { name: 'Richmond', state: 'VA' },
    { name: 'Virginia Beach', state: 'VA' },
    { name: 'Norfolk', state: 'VA' },
    { name: 'Alexandria', state: 'VA' },
    { name: 'Ashburn', state: 'VA' },
    { name: 'Baltimore', state: 'MD' },
    { name: 'Washington', state: 'DC' },
    { name: 'Charlotte', state: 'NC' },
    { name: 'Raleigh', state: 'NC' },
    { name: 'Philadelphia', state: 'PA' },
    { name: 'Wilmington', state: 'DE' },
    { name: 'Newark', state: 'NJ' }
  ];

  if (loading || !config) {
    return (
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Link href="/" aria-label={config.businessName || 'Home'} className="inline-block">
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
            <p className="text-sm mb-4 text-secondary-foreground/80">
              {config.description || 'Your trusted marketplace for dumpster rental and waste management services.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <a href="tel:+14342076559" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                (434) 207-6559
              </a>
              <a href="mailto:support@dumpquote.co" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@dumpquote.co
              </a>
              <div className="flex items-center gap-2 text-sm text-secondary-foreground/80">
                <MapPin className="h-4 w-4" />
                Serving All 50 States
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Get a Quote
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Find Providers
                </Link>
              </li>
              <li>
                <Link href="/dumpster-sizes" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Dumpster Size Guide
                </Link>
              </li>
              <li>
                <Link href="/homeowners" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Homeowner Resources
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Commercial Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Pricing Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="font-semibold mb-4">For Business</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/for-business" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/claim" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Claim Your Business
                </Link>
              </li>
              <li>
                <Link href="/dealer-portal" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Dealer Portal
                </Link>
              </li>
              <li>
                <Link href="/pricing/business" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Business Pricing
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Advertising
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular States */}
          <div>
            <h4 className="font-semibold mb-4">Popular States</h4>
            <ul className="space-y-2">
              {popularStates.slice(0, 7).map(state => (
                <li key={state}>
                  <Link 
                    href={`/${state.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                  >
                    {state}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/locations" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  View All States →
                </Link>
              </li>
            </ul>
          </div>

          {/* Major Cities */}
          <div>
            <h4 className="font-semibold mb-4">Major Cities</h4>
            <ul className="space-y-2">
              {majorCities.slice(0, 7).map(city => (
                <li key={`${city.name}-${city.state}`}>
                  <Link 
                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                  >
                    {city.name}, {city.state}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/locations" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  View All Cities →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-secondary-foreground/60 text-center md:text-left">
              © {currentYear} {config.businessName}. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/privacy" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}