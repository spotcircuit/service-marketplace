"use client";

import Link from 'next/link';
import { useConfig } from '@/contexts/ConfigContext';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { config, loading } = useConfig();
  const currentYear = new Date().getFullYear();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">
              {config.businessName}
            </h3>
            <p className="text-sm mb-4 text-secondary-foreground/80">
              {config.description || 'Connecting customers with trusted local service providers.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <a href="tel:1-800-555-0123" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                1-800-555-0123
              </a>
              <a href="mailto:support@example.com" className="flex items-center gap-2 text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@example.com
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/directory"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Find Services
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/trust-safety"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/for-business"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Join Our Network
                </Link>
              </li>
              <li>
                <Link
                  href="/claim"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Claim Your Business
                </Link>
              </li>
              <li>
                <Link
                  href="/dealer-portal"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Dealer Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/dealer-portal/subscription"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
              <li>
                <a
                  href="mailto:business@example.com"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Business Support
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Customer Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@example.com"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-semibold mb-3">Stay Updated</h4>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Get tips, updates, and exclusive offers delivered to your inbox
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-secondary-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-secondary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-secondary-foreground/60">
            <div>
              © {currentYear} {config.businessName}. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/sitemap" className="hover:text-primary transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
