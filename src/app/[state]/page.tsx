'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, CheckCircle, Phone, ArrowRight, Building2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

// US States data
const stateNames: Record<string, string> = {
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
  'delaware': 'Delaware', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
  'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa',
  'kansas': 'Kansas', 'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine',
  'maryland': 'Maryland', 'massachusetts': 'Massachusetts', 'michigan': 'Michigan',
  'minnesota': 'Minnesota', 'mississippi': 'Mississippi', 'missouri': 'Missouri',
  'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada',
  'new-hampshire': 'New Hampshire', 'new-jersey': 'New Jersey', 'new-mexico': 'New Mexico',
  'new-york': 'New York', 'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota',
  'ohio': 'Ohio', 'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
  'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina', 'south-dakota': 'South Dakota',
  'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah', 'vermont': 'Vermont',
  'virginia': 'Virginia', 'washington': 'Washington', 'west-virginia': 'West Virginia',
  'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming'
};

// Major cities by state (sample data)
const citiesByState: Record<string, string[]> = {
  'texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'],
  'california': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Oakland', 'Long Beach'],
  'florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale'],
  'new-york': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
  // Add more states as needed
};

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  city: string;
  is_featured: boolean;
  is_verified: boolean;
  phone: string;
}

export default function StatePage() {
  const params = useParams();
  const stateSlug = params.state as string;
  const stateName = stateNames[stateSlug] || stateSlug;
  const cities = citiesByState[stateSlug] || ['City 1', 'City 2', 'City 3', 'City 4', 'City 5', 'City 6'];
  
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured businesses for this state
    fetchFeaturedBusinesses();
  }, [stateSlug]);

  const fetchFeaturedBusinesses = async () => {
    try {
      // This would be an API call
      // const response = await fetch(`/api/businesses?state=${stateSlug}&featured=true`);
      // const data = await response.json();
      
      // Mock data for now
      setFeaturedBusinesses([
        {
          id: '1',
          name: 'Premium Dumpster Rentals',
          category: 'Dumpster Rental',
          rating: 4.8,
          reviews: 124,
          city: cities[0],
          is_featured: true,
          is_verified: true,
          phone: '(555) 123-4567'
        },
        {
          id: '2',
          name: 'Quick Waste Solutions',
          category: 'Junk Removal',
          rating: 4.6,
          reviews: 89,
          city: cities[1],
          is_featured: true,
          is_verified: true,
          phone: '(555) 234-5678'
        },
        {
          id: '3',
          name: 'Elite Construction Services',
          category: 'Construction',
          rating: 4.9,
          reviews: 201,
          city: cities[0],
          is_featured: true,
          is_verified: true,
          phone: '(555) 345-6789'
        }
      ]);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Service Providers in {stateName}
            </h1>
            <p className="text-xl text-blue-100">
              Connect with verified professionals across {stateName}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-blue-100 text-sm">Service Providers</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{cities.length}</div>
              <div className="text-blue-100 text-sm">Cities Covered</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">4.7</div>
              <div className="text-blue-100 text-sm">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-blue-100 text-sm">Available Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Popular Cities in {stateName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/${stateSlug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <MapPin className="h-5 w-5 text-gray-400 mb-2" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {city}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      45+ providers
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link
              href={`/${stateSlug}/all-cities`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View all cities in {stateName}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Providers in {stateName}
              </h2>
              <p className="text-gray-600 mt-2">
                Top-rated businesses ready to serve you
              </p>
            </div>
            <Link
              href={`/${stateSlug}/all-providers`}
              className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View all providers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <div key={business.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600">{business.category}</p>
                    </div>
                    {business.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(business.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {business.rating} ({business.reviews} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {business.city}, {stateName}
                    {business.is_verified && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call Now
                    </a>
                    <Link
                      href={`/business/${business.id}`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Popular Services in {stateName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Dumpster Rental',
              'Junk Removal',
              'Construction',
              'Demolition',
              'Roofing',
              'Plumbing',
              'HVAC',
              'Electrical'
            ].map((service) => (
              <Link
                key={service}
                href={`/${stateSlug}/service/${service.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition text-center group"
              >
                <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-600" />
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {service}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Service Provider?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get free quotes from verified professionals in {stateName}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Get Free Quotes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}