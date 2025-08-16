"use client";

import { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { Search, MapPin } from 'lucide-react';

export default function HeroSection() {
  const { config, loading } = useConfig();
  const [zipCode, setZipCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', zipCode);
  };

  if (loading || !config) {
    return (
      <section className="relative min-h-[600px] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 w-96 bg-muted rounded-lg mx-auto mb-4"></div>
            <div className="h-8 w-64 bg-muted rounded-lg mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${config.hero?.backgroundImage || 'https://ext.same-assets.com/1079325698/1819760783.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto">
          {config.hero?.headline || 'Find the Perfect Service Provider'}
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          {config.hero?.subheadline || 'Connect with verified professionals'}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder={config.hero?.placeholderText || 'Enter your location'}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              {config.hero?.ctaText || 'Search'}
            </button>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✓</span>
            <span>Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <span>Quick Response</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">★</span>
            <span>Top Rated Service</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-8 bg-accent text-accent-foreground py-3 px-6 rounded-full inline-block font-semibold">
          {config.tagline || 'Your trusted service platform'}
        </div>
      </div>
    </section>
  );
}
