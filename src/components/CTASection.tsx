"use client";

import Link from 'next/link';
import { siteConfig } from '@/config/site-config';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
          <div className="text-center lg:text-left text-white">
            {/* Main CTA Content */}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Are you a pro or service provider?
            </h2>

            <p className="text-xl mb-8 text-white/90">
              Join our network of pros and grow your business with customer inquiries
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
                <h3 className="font-semibold mb-1">Partner-Focused Platform</h3>
                <p className="text-sm text-white/80">Join pros growing their businesses with us</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Disclaimer / Indicator */}
            <div className="mt-8 text-sm text-white/80">
              {siteConfig.businessName} is a marketplace that helps customers compare local providers. Availability and pricing are set by providers.
            </div>
          </div>
          {/* Right-side Illustration (desktop only) */}
          <div className="hidden lg:block ml-auto w-full max-w-md relative aspect-[4/3]">
            <Image
              src="/images/dumppickup.png"
              alt="Pickup truck collecting dumpster for service providers"
              fill
              className="object-contain drop-shadow-xl"
              sizes="(min-width: 1024px) 480px, 100vw"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
