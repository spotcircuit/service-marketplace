export interface Business {
  id: string;
  // Basic Information
  name: string;
  category: string;
  description?: string;

  // Ratings & Reviews
  rating: number;
  reviews: number;

  // Contact Information
  phone: string;
  email?: string;
  website?: string;

  // Location
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;

  // SEO & Discovery
  google_rank?: number;
  place_id?: string;
  search_query?: string;

  // Business Owner Information
  owner_name?: string;
  owner_title?: string;
  owner_email?: string;

  // Platform Features
  is_featured: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  featured_until?: string;

  // Media
  logo_url?: string;
  cover_image?: string;
  gallery_images?: string[];
  video_url?: string;

  // Business Details
  years_in_business?: number;
  license_number?: string;
  insurance?: boolean;
  certifications?: string[];

  // Service Details
  services?: ServiceOffering[];
  service_areas?: string[];
  price_range?: 'budget' | 'moderate' | 'premium' | 'luxury';

  // Hours of Operation
  hours?: BusinessHours;

  // Metadata
  created_at: string;
  updated_at: string;
  source?: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
  price_unit?: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface SearchFilters {
  category?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  rating_min?: number;
  distance_miles?: number;
  price_range?: string;
  is_verified?: boolean;
  sort_by?: 'featured' | 'rating' | 'reviews' | 'distance' | 'name';
}

export interface Quote {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_needed: string;
  description: string;
  timeline: string;
  budget?: string;
  business_ids: string[];
  created_at: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_leads?: number;
  featured_placement: boolean;
  priority_support: boolean;
  analytics: boolean;
  badge?: string;
}
