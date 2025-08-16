"use client";

import { use, useState, useEffect } from 'react';
import { Star, MapPin, Phone, Globe, Mail, Clock, Shield, Award, CheckCircle, Calendar, DollarSign, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import QuoteRequestModal from '@/components/QuoteRequestModal';

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [business, setBusiness] = useState<any>(null);
  const [similarBusinesses, setSimilarBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      // Fetch the main business
      const response = await fetch(`/api/businesses/${resolvedParams.id}`);
      const data = await response.json();

      if (data.business) {
        setBusiness(data.business);

        // Fetch similar businesses in the same category
        const similarResponse = await fetch(`/api/businesses?category=${data.business.category}&limit=4`);
        const similarData = await similarResponse.json();
        setSimilarBusinesses(
          (similarData.businesses || [])
            .filter((b: any) => b.id !== resolvedParams.id)
            .slice(0, 3)
        );
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Business Not Found</h1>
          <p className="text-muted-foreground mb-4">The business you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/directory" className="text-primary hover:underline">
            Browse Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-primary/80">
        {business.cover_image && (
          <img
            src={business.cover_image}
            alt={business.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-0 right-0">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/directory" className="hover:text-white">Directory</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{business.name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Business Header */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-card rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-32 h-32 bg-background rounded-lg border-4 border-background shadow-lg flex items-center justify-center shrink-0">
              {business.logo_url ? (
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">
                  {business.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {business.is_verified && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        <Shield className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    {business.is_featured && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        <Award className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="font-medium text-foreground">{business.category}</span>
                    {business.years_in_business && (
                      <span>{business.years_in_business} years in business</span>
                    )}
                    {business.license_number && (
                      <span>License: {business.license_number}</span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(business.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-lg">{business.rating}</span>
                    <span className="text-muted-foreground"> ({business.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-5 w-5" />
                  {business.phone}
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{business.address}, {business.city}, {business.state} {business.zipcode}</span>
                </div>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="h-5 w-5" />
                    Visit Website
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Get Free Quote
                </button>
                <a
                  href={`tel:${business.phone}`}
                  className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium inline-flex items-center justify-center"
                >
                  Call Now
                </a>
                {!business.is_claimed && (
                  <Link href="/claim" className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 font-medium">
                    Claim This Business
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">About {business.name}</h2>
              <p className="text-muted-foreground">
                {business.description || `${business.name} is a professional ${business.category.toLowerCase()} service provider serving ${business.city} and surrounding areas. With ${business.years_in_business || 'several'} years of experience, we deliver quality service you can trust.`}
              </p>

              {business.certifications && business.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Certifications & Licenses</h3>
                  <div className="flex flex-wrap gap-2">
                    {business.certifications.map((cert: any, i: number) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        <CheckCircle className="h-3 w-3" />
                        {cert}
                      </span>
                    ))}
                    {business.insurance && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <Shield className="h-3 w-3" />
                        Fully Insured
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-4">Services Offered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.services.map((service: any, index: number) => (
                    <div key={service.id || `service-${index}`} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-1">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      )}
                      {service.price_from && (
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {service.price_from}-{service.price_to || '???'} / {service.price_unit || 'service'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {business.service_areas && business.service_areas.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-4">Service Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {business.service_areas.map((area: any, i: number) => (
                    <span key={i} className="px-3 py-1 bg-muted rounded-lg text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Customer Reviews</h2>
                <button className="text-primary hover:underline text-sm">
                  Write a Review
                </button>
              </div>

              {/* Review Summary */}
              <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{business.rating}</div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(business.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{business.reviews} reviews</div>
                </div>

                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const percentage = stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 10 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-3">{stars}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold">John D.</span>
                      <span className="text-sm text-muted-foreground ml-2">2 weeks ago</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Excellent service! They delivered the dumpster on time and picked it up promptly. Very professional and fair pricing.
                  </p>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold">Sarah M.</span>
                      <span className="text-sm text-muted-foreground ml-2">1 month ago</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Great experience overall. The team was helpful and the dumpster was clean. Would use again for future projects.
                  </p>
                </div>
              </div>

              <button className="w-full mt-4 py-2 border rounded-lg hover:bg-muted text-sm">
                Load More Reviews
              </button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            {business.hours && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(business.hours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}</span>
                      <span className="text-muted-foreground">
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-bold mb-4">Quick Facts</h3>
              <div className="space-y-3">
                {business.years_in_business && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Established {new Date().getFullYear() - business.years_in_business}</span>
                  </div>
                )}
                {business.price_range && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm capitalize">Price Range: {business.price_range}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Serves {business.service_areas?.length || 1} areas</span>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
              <h3 className="font-bold mb-2">Need {business.category}?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get a free quote from {business.name} today!
              </p>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
              >
                Request Free Quote
              </button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                No obligation • Free quotes • Fast response
              </p>
            </div>

            {/* Similar Businesses */}
            {similarBusinesses.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-bold mb-4">Similar Businesses</h3>
                <div className="space-y-3">
                  {similarBusinesses.map(b => (
                    <Link
                      key={b.id}
                      href={`/business/${b.id}`}
                      className="block hover:bg-muted rounded-lg p-3 -m-3 transition-colors"
                    >
                      <div className="font-medium text-sm">{b.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {b.rating} ({b.reviews} reviews)
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        businessIds={[business.id]}
        businessName={business.name}
        category={business.category}
      />
    </div>
  );
}
