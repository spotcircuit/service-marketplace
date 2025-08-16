"use client";

import { useState } from 'react';
import { popularCities, states } from '@/config/site-config';
import Link from 'next/link';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export default function LocationsSection() {
  const [showAllCities, setShowAllCities] = useState(false);
  const [showStates, setShowStates] = useState(false);

  const displayedCities = showAllCities ? popularCities : popularCities.slice(0, 20);

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Available Nationwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Find trusted professionals in cities across the country
          </p>
        </div>

        {/* Popular Cities Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Popular Cities
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {displayedCities.map((city) => (
              <Link
                key={city}
                href={`/locations/${city.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md transition-colors text-sm"
              >
                {city}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setShowAllCities(!showAllCities)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            {showAllCities ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show All Cities <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* States Section */}
        <div className="max-w-6xl mx-auto mt-12">
          <button
            onClick={() => setShowStates(!showStates)}
            className="flex items-center gap-2 text-xl font-semibold mb-6 hover:text-primary transition-colors"
          >
            <MapPin className="h-5 w-5 text-primary" />
            Browse by State
            {showStates ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {showStates && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-6 bg-card rounded-lg border">
              {states.map((state) => (
                <Link
                  key={state}
                  href={`/locations/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md transition-colors text-sm"
                >
                  {state}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
