'use client';

import Link from 'next/link';
import { Building2, Users, MapPin, TrendingUp, Search } from 'lucide-react';
import { useState } from 'react';

// All US states with data
const allStates = [
  { slug: 'alabama', name: 'Alabama', cities: 23, providers: 145, featured: false },
  { slug: 'alaska', name: 'Alaska', cities: 8, providers: 34, featured: false },
  { slug: 'arizona', name: 'Arizona', cities: 31, providers: 234, featured: false },
  { slug: 'arkansas', name: 'Arkansas', cities: 18, providers: 89, featured: false },
  { slug: 'california', name: 'California', cities: 92, providers: 876, featured: true },
  { slug: 'colorado', name: 'Colorado', cities: 38, providers: 267, featured: false },
  { slug: 'connecticut', name: 'Connecticut', cities: 24, providers: 156, featured: false },
  { slug: 'delaware', name: 'Delaware', cities: 9, providers: 45, featured: false },
  { slug: 'florida', name: 'Florida', cities: 67, providers: 543, featured: true },
  { slug: 'georgia', name: 'Georgia', cities: 45, providers: 312, featured: false },
  { slug: 'hawaii', name: 'Hawaii', cities: 12, providers: 67, featured: false },
  { slug: 'idaho', name: 'Idaho', cities: 16, providers: 78, featured: false },
  { slug: 'illinois', name: 'Illinois', cities: 43, providers: 389, featured: true },
  { slug: 'indiana', name: 'Indiana', cities: 34, providers: 234, featured: false },
  { slug: 'iowa', name: 'Iowa', cities: 22, providers: 123, featured: false },
  { slug: 'kansas', name: 'Kansas', cities: 19, providers: 98, featured: false },
  { slug: 'kentucky', name: 'Kentucky', cities: 26, providers: 167, featured: false },
  { slug: 'louisiana', name: 'Louisiana', cities: 28, providers: 189, featured: false },
  { slug: 'maine', name: 'Maine', cities: 14, providers: 76, featured: false },
  { slug: 'maryland', name: 'Maryland', cities: 29, providers: 234, featured: false },
  { slug: 'massachusetts', name: 'Massachusetts', cities: 35, providers: 298, featured: false },
  { slug: 'michigan', name: 'Michigan', cities: 41, providers: 345, featured: false },
  { slug: 'minnesota', name: 'Minnesota', cities: 32, providers: 256, featured: false },
  { slug: 'mississippi', name: 'Mississippi', cities: 21, providers: 112, featured: false },
  { slug: 'missouri', name: 'Missouri', cities: 30, providers: 223, featured: false },
  { slug: 'montana', name: 'Montana', cities: 11, providers: 54, featured: false },
  { slug: 'nebraska', name: 'Nebraska', cities: 15, providers: 87, featured: false },
  { slug: 'nevada', name: 'Nevada', cities: 18, providers: 145, featured: false },
  { slug: 'new-hampshire', name: 'New Hampshire', cities: 13, providers: 89, featured: false },
  { slug: 'new-jersey', name: 'New Jersey', cities: 38, providers: 334, featured: false },
  { slug: 'new-mexico', name: 'New Mexico', cities: 17, providers: 98, featured: false },
  { slug: 'new-york', name: 'New York', cities: 54, providers: 567, featured: true },
  { slug: 'north-carolina', name: 'North Carolina', cities: 42, providers: 356, featured: false },
  { slug: 'north-dakota', name: 'North Dakota', cities: 9, providers: 43, featured: false },
  { slug: 'ohio', name: 'Ohio', cities: 48, providers: 412, featured: false },
  { slug: 'oklahoma', name: 'Oklahoma', cities: 24, providers: 156, featured: false },
  { slug: 'oregon', name: 'Oregon', cities: 27, providers: 198, featured: false },
  { slug: 'pennsylvania', name: 'Pennsylvania', cities: 51, providers: 445, featured: true },
  { slug: 'rhode-island', name: 'Rhode Island', cities: 8, providers: 56, featured: false },
  { slug: 'south-carolina', name: 'South Carolina', cities: 29, providers: 234, featured: false },
  { slug: 'south-dakota', name: 'South Dakota', cities: 10, providers: 54, featured: false },
  { slug: 'tennessee', name: 'Tennessee', cities: 33, providers: 278, featured: false },
  { slug: 'texas', name: 'Texas', cities: 85, providers: 789, featured: true },
  { slug: 'utah', name: 'Utah', cities: 20, providers: 145, featured: false },
  { slug: 'vermont', name: 'Vermont', cities: 9, providers: 45, featured: false },
  { slug: 'virginia', name: 'Virginia', cities: 36, providers: 298, featured: false },
  { slug: 'washington', name: 'Washington', cities: 39, providers: 323, featured: false },
  { slug: 'west-virginia', name: 'West Virginia', cities: 16, providers: 89, featured: false },
  { slug: 'wisconsin', name: 'Wisconsin', cities: 31, providers: 234, featured: false },
  { slug: 'wyoming', name: 'Wyoming', cities: 7, providers: 34, featured: false },
];

export default function StatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  // Define regions
  const regions: Record<string, string[]> = {
    'Northeast': ['connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey', 'new-york', 'pennsylvania', 'rhode-island', 'vermont'],
    'Southeast': ['alabama', 'arkansas', 'delaware', 'florida', 'georgia', 'kentucky', 'louisiana', 'maryland', 'mississippi', 'north-carolina', 'south-carolina', 'tennessee', 'virginia', 'west-virginia'],
    'Midwest': ['illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota', 'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin'],
    'Southwest': ['arizona', 'new-mexico', 'oklahoma', 'texas'],
    'West': ['alaska', 'california', 'colorado', 'hawaii', 'idaho', 'montana', 'nevada', 'oregon', 'utah', 'washington', 'wyoming']
  };

  // Get region for a state
  const getRegion = (stateSlug: string) => {
    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(stateSlug)) return region;
    }
    return 'Other';
  };

  // Filter states
  const filteredStates = allStates.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || getRegion(state.slug) === filterRegion;
    return matchesSearch && matchesRegion;
  });

  // Get featured states
  const featuredStates = allStates.filter(state => state.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Service Providers Across All 50 States
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Find trusted professionals anywhere in the United States
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">50</div>
              <div className="text-sm text-gray-600">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">1,200+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10,000+</div>
              <div className="text-sm text-gray-600">Service Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">US Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-4 px-4 bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">Filter by region:</span>
            <button
              onClick={() => setFilterRegion('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                filterRegion === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Regions
            </button>
            {Object.keys(regions).map(region => (
              <button
                key={region}
                onClick={() => setFilterRegion(region)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  filterRegion === region
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured States */}
      {featuredStates.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Top States by Provider Count</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStates.map(state => (
                <Link
                  key={state.slug}
                  href={`/${state.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-green-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{state.name}</h3>
                      <p className="text-gray-600">{getRegion(state.slug)}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Top State
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-900">{state.cities}</div>
                      <div className="text-xs text-gray-600">Cities</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-900">{state.providers}</div>
                      <div className="text-xs text-gray-600">Providers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Explore {state.name}
                    <TrendingUp className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All States Grid */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All States</h2>
          
          {Object.entries(regions).map(([region, statesSlugs]) => {
            const regionStates = filteredStates.filter(state => 
              statesSlugs.includes(state.slug)
            );
            
            if (regionStates.length === 0) return null;
            
            return (
              <div key={region} className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-600" />
                  {region}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {regionStates.map(state => (
                    <Link
                      key={state.slug}
                      href={`/${state.slug}`}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition border"
                    >
                      <h4 className="font-medium text-gray-900">{state.name}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {state.cities} cities
                        </p>
                        <p className="text-xs text-gray-600 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {state.providers} providers
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Service Providers?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Select your state to browse local professionals
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}