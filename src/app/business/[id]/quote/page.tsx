'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Building, Star, Phone, MapPin, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';

interface Business {
  id: string;
  name: string;
  category?: string;
  rating: number;
  reviews: number;
  city: string;
  state: string;
  address?: string;
  phone: string;
  email?: string;
  is_featured: boolean;
  is_verified: boolean;
  description?: string;
  services?: any[];
}

export default function BusinessQuotePage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      } else {
        // If business not found, redirect to directory
        router.push('/directory');
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      router.push('/directory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href={`/business/${businessId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Business Profile
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Get a Quote from {business.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{business.rating}</span>
                  <span>({business.reviews} reviews)</span>
                </div>
                {business.is_verified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Verified Business</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{business.city}, {business.state}</span>
                </div>
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  <span>{business.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Why Choose {business.name}?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Fast Response</h3>
                <p className="text-sm text-muted-foreground">
                  Same day delivery available. Quick quote turnaround.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Licensed & Insured</h3>
                <p className="text-sm text-muted-foreground">
                  Fully licensed and insured for your protection.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Top Rated</h3>
                <p className="text-sm text-muted-foreground">
                  {business.rating} star rating from {business.reviews} satisfied customers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        {business.services && business.services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Available Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {business.services.map((service: any, index: number) => (
                <div key={service.id || index} className="border rounded-lg p-3 text-center">
                  <p className="font-medium">{service.name}</p>
                  {service.price && (
                    <p className="text-sm text-primary mt-1">From ${service.price}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          router.push(`/business/${businessId}`);
        }}
        businessId={businessId}
        businessName={business.name}
      />
    </div>
  );
}