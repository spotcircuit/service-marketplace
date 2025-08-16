import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    // Get categories with counts
    const categories = await sql`
      SELECT 
        category,
        COUNT(*) as count
      FROM businesses
      GROUP BY category
      ORDER BY count DESC
    `;

    // Get states with counts
    const states = await sql`
      SELECT 
        state,
        COUNT(*) as count,
        COUNT(DISTINCT city) as city_count
      FROM businesses
      GROUP BY state
      ORDER BY count DESC
    `;

    // Get cities with counts
    const cities = await sql`
      SELECT 
        city,
        state,
        COUNT(*) as count
      FROM businesses
      GROUP BY city, state
      ORDER BY count DESC
      LIMIT 50
    `;

    // Get total stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT state) as total_states,
        COUNT(DISTINCT city) as total_cities,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
        AVG(rating) as average_rating,
        SUM(reviews) as total_reviews
      FROM businesses
    `;

    return NextResponse.json({
      categories,
      states,
      cities,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business statistics' },
      { status: 500 }
    );
  }
}