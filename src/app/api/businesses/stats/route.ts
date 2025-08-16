import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonConfigured } from '@/lib/neon';

// Map of state names to abbreviations
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'district of columbia': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI',
  'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME',
  'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX',
  'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

// Reverse map: abbreviation -> lower-cased full state name
const ABBR_TO_NAME_LOWER: Record<string, string> = Object.entries(STATE_NAME_TO_ABBR).reduce(
  (acc, [fullLower, abbr]) => {
    acc[abbr] = fullLower;
    return acc;
  },
  {} as Record<string, string>
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let state = searchParams.get('state');
    const city = searchParams.get('city');
    const debug = searchParams.get('debug') === '1';
    
    // Convert full state name to abbreviation if needed
    if (state) {
      const stateLower = state.toLowerCase();
      if (STATE_NAME_TO_ABBR[stateLower]) {
        // Convert full name to abbreviation (e.g., "Virginia" -> "VA")
        state = STATE_NAME_TO_ABBR[stateLower];
      } else if (state.length === 2) {
        // Already an abbreviation, just uppercase it
        state = state.toUpperCase();
      }
    }

    // Check if database is configured
    if (!isNeonConfigured() || !sql) {
      // Return empty arrays if database not configured
      return NextResponse.json({
        categories: [],
        states: [],
        cities: [],
        stats: {
          total_businesses: 0,
          total_categories: 0,
          total_states: 0,
          total_cities: 0,
          featured_count: 0,
          verified_count: 0,
          average_rating: 0,
          total_reviews: 0
        }
      });
    }

    // If state is provided, get cities in that state with counts
    if (state) {
      const fullLower = ABBR_TO_NAME_LOWER[state] || '';
      const cities = await sql`
        SELECT 
          TRIM(city) as city,
          COUNT(*) as count
        FROM businesses
        WHERE (
          TRIM(LOWER(state)) = LOWER(${state})
          OR TRIM(LOWER(state)) = LOWER(${fullLower})
        )
          AND city IS NOT NULL AND TRIM(city) <> ''
        GROUP BY TRIM(city)
        ORDER BY count DESC, city ASC
      `;

      const stateStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT TRIM(NULLIF(city, ''))) as city_count,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
          AVG(rating) as average_rating,
          SUM(reviews) as total_reviews
        FROM businesses
        WHERE (
          TRIM(LOWER(state)) = LOWER(${state})
          OR TRIM(LOWER(state)) = LOWER(${fullLower})
        )
      `;

      // Optional debug payload to help identify how state values are stored
      let debugInfo: any = null;
      if (debug) {
        const matchedStates = await sql`
          SELECT DISTINCT state FROM businesses
          WHERE (
            TRIM(LOWER(state)) = LOWER(${state})
            OR TRIM(LOWER(state)) = LOWER(${fullLower})
          )
          ORDER BY state ASC
          LIMIT 25
        `;
        debugInfo = {
          normalizedParams: {
            state,
            fullLower
          },
          matchedStates,
          sampleCities: Array.isArray(cities) ? cities.slice(0, 5) : []
        };
      }

      return NextResponse.json({
        cities: cities || [],
        total: stateStats[0]?.total || 0,
        stats: stateStats[0] || {},
        debug: debugInfo
      });
    }

    // If city is provided, get stats for that city
    if (city) {
      const cityStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
          AVG(rating) as average_rating,
          SUM(reviews) as total_reviews
        FROM businesses
        WHERE city = ${city}
      `;

      return NextResponse.json({
        total: cityStats[0]?.total || 0,
        stats: cityStats[0] || {}
      });
    }

    // Default: Get overall stats
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
      categories: categories || [],
      states: states || [],
      cities: cities || [],
      stats: stats[0] || {
        total_businesses: 0,
        total_categories: 0,
        total_states: 0,
        total_cities: 0,
        featured_count: 0,
        verified_count: 0,
        average_rating: 0,
        total_reviews: 0
      }
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    // Return empty data on error
    return NextResponse.json({
      categories: [],
      states: [],
      cities: [],
      stats: {
        total_businesses: 0,
        total_categories: 0,
        total_states: 0,
        total_cities: 0,
        featured_count: 0,
        verified_count: 0,
        average_rating: 0,
        total_reviews: 0
      }
    });
  }
}