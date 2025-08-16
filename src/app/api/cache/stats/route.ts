import { NextResponse } from 'next/server';
import { businessCache } from '@/lib/cache';

export async function GET() {
  try {
    // Get cache data
    const stats = businessCache.getStats();
    const categories = businessCache.getCategories();
    const states = businessCache.getStates();
    const cities = businessCache.getCities();
    
    return NextResponse.json({
      stats,
      categories: categories.slice(0, 8),
      states: states.slice(0, 8),
      cities: cities.slice(0, 8),
      lastUpdated: businessCache.getLastUpdated()
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    
    // Return empty data if cache not available
    return NextResponse.json({
      stats: {
        total_businesses: 0,
        total_categories: 0,
        total_states: 0,
        total_cities: 0,
        featured_count: 0,
        verified_count: 0,
        average_rating: 0,
        total_reviews: 0
      },
      categories: [],
      states: [],
      cities: [],
      lastUpdated: null
    });
  }
}