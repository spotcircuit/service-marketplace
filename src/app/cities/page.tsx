'use client';

import Link from 'next/link';
import { MapPin, Users, Star, TrendingUp, Search } from 'lucide-react';
import { useState } from 'react';

// Major US cities organized by state
const citiesByState = {
  'Texas': [
    { slug: 'houston', state: 'texas', name: 'Houston', providers: 234, featured: true },
    { slug: 'dallas', state: 'texas', name: 'Dallas', providers: 189, featured: true },
    { slug: 'austin', state: 'texas', name: 'Austin', providers: 167, featured: false },
    { slug: 'san-antonio', state: 'texas', name: 'San Antonio', providers: 143, featured: false },
    { slug: 'fort-worth', state: 'texas', name: 'Fort Worth', providers: 98, featured: false },
    { slug: 'el-paso', state: 'texas', name: 'El Paso', providers: 67, featured: false },
  ],
  'California': [
    { slug: 'los-angeles', state: 'california', name: 'Los Angeles', providers: 312, featured: true },
    { slug: 'san-diego', state: 'california', name: 'San Diego', providers: 198, featured: true },
    { slug: 'san-francisco', state: 'california', name: 'San Francisco', providers: 176, featured: false },
    { slug: 'san-jose', state: 'california', name: 'San Jose', providers: 134, featured: false },
    { slug: 'fresno', state: 'california', name: 'Fresno', providers: 89, featured: false },
    { slug: 'sacramento', state: 'california', name: 'Sacramento', providers: 112, featured: false },
  ],
  'Florida': [
    { slug: 'miami', state: 'florida', name: 'Miami', providers: 256, featured: true },
    { slug: 'tampa', state: 'florida', name: 'Tampa', providers: 178, featured: true },
    { slug: 'orlando', state: 'florida', name: 'Orlando', providers: 165, featured: false },
    { slug: 'jacksonville', state: 'florida', name: 'Jacksonville', providers: 123, featured: false },
    { slug: 'fort-lauderdale', state: 'florida', name: 'Fort Lauderdale', providers: 98, featured: false },
    { slug: 'tallahassee', state: 'florida', name: 'Tallahassee', providers: 67, featured: false },
  ],
  'New York': [
    { slug: 'new-york-city', state: 'new-york', name: 'New York City', providers: 489, featured: true },
    { slug: 'buffalo', state: 'new-york', name: 'Buffalo', providers: 98, featured: false },
    { slug: 'rochester', state: 'new-york', name: 'Rochester', providers: 76, featured: false },
    { slug: 'albany', state: 'new-york', name: 'Albany', providers: 65, featured: false },
    { slug: 'syracuse', state: 'new-york', name: 'Syracuse', providers: 54, featured: false },
  ],
  'Illinois': [
    { slug: 'chicago', state: 'illinois', name: 'Chicago', providers: 298, featured: true },
    { slug: 'aurora', state: 'illinois', name: 'Aurora', providers: 67, featured: false },
    { slug: 'rockford', state: 'illinois', name: 'Rockford', providers: 45, featured: false },
    { slug: 'joliet', state: 'illinois', name: 'Joliet', providers: 43, featured: false },
    { slug: 'naperville', state: 'illinois', name: 'Naperville', providers: 56, featured: false },
  ],
  'Pennsylvania': [
    { slug: 'philadelphia', state: 'pennsylvania', name: 'Philadelphia', providers: 234, featured: true },
    { slug: 'pittsburgh', state: 'pennsylvania', name: 'Pittsburgh', providers: 156, featured: false },
    { slug: 'allentown', state: 'pennsylvania', name: 'Allentown', providers: 67, featured: false },
    { slug: 'erie', state: 'pennsylvania', name: 'Erie', providers: 45, featured: false },
    { slug: 'reading', state: 'pennsylvania', name: 'Reading', providers: 43, featured: false },
  ],
};

export default function CitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  // Get all cities flattened
  const allCities = Object.entries(citiesByState).flatMap(([state, cities]) =>
    cities.map(city => ({ ...city, stateName: state }))
  );

  // Filter cities based on search and state
  const filteredCities = allCities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          city.stateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'all' || city.stateName === selectedState;
    return matchesSearch && matchesState;
  });

  // Get featured cities
  const featuredCities = allCities.filter(city => city.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Service Providers by City
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Browse our network of verified professionals in major cities across the United States
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city..."
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
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600">Major Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">2,500+</div>
              <div className="text-sm text-gray-600">Service Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-4 px-4 bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">Filter by state:</span>
            <button
              onClick={() => setSelectedState('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                selectedState === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All States
            </button>
            {Object.keys(citiesByState).map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  selectedState === state
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Cities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCities.slice(0, 6).map(city => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/${city.state}/${city.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-blue-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{city.name}</h3>
                    <p className="text-gray-600">{city.stateName}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Featured
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {city.providers} providers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="h-4 w-4 mr-2 text-yellow-400" />
                    4.8 avg rating
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  View providers
                  <TrendingUp className="h-4 w-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Cities by State */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All Cities by State</h2>
          
          {Object.entries(citiesByState).map(([state, cities]) => {
            if (selectedState !== 'all' && selectedState !== state) return null;
            
            const filteredStateCities = cities.filter(city =>
              city.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredStateCities.length === 0) return null;
            
            return (
              <div key={state} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  {state}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredStateCities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/${city.state}/${city.slug}`}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition border"
                    >
                      <h4 className="font-medium text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {city.providers} service providers
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find Your City?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're constantly expanding. Tell us where you need service.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Request Your City
          </Link>
        </div>
      </section>
    </div>
  );
}