import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if credentials are provided
// Otherwise create a dummy client that won't be used
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Type definitions for database tables
export interface Business {
  id: string;
  name: string;
  category: string;
  description?: string;
  rating: number;
  reviews: number;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  is_featured: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  featured_until?: string;
  logo_url?: string;
  cover_image?: string;
  years_in_business?: number;
  license_number?: string;
  insurance?: boolean;
  price_range?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  zipcode?: string;
  service_type: string;
  project_description?: string;
  timeline: string;
  budget?: string;
  business_ids?: string[];
  category?: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');
}
