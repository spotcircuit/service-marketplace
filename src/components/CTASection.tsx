"use client";

import Link from 'next/link';
import { siteConfig } from '@/config/site-config';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Main CTA Content */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Are You a Professional Service Provider?
          </h2>

          <p className="text-xl mb-8 text-white/90">
            Join our network of trusted professionals and grow your business with qualified leads
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-1">Qualified Leads</h3>
              <p className="text-sm text-white/80">Connect with customers actively seeking your services</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-1">Grow Your Business</h3>
              <p className="text-sm text-white/80">Expand your reach and increase revenue</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-1">Trusted Platform</h3>
              <p className="text-sm text-white/80">Join thousands of successful professionals</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/professionals/join"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-semibold"
            >
              Get Started as a Pro
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/professionals/learn-more"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur transition-colors font-semibold border border-white/30"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Indicator */}
          <div className="mt-8 text-sm text-white/80">
            More customers visit {siteConfig.businessName} to find services than any other platform
          </div>
        </div>
      </div>
    </section>
  );
}
