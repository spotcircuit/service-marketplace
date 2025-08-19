import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { businessCache } from '@/lib/cache';

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

// Reverse map: abbreviation -> Title Case full state name
const ABBR_TO_NAME: Record<string, string> = Object.entries(STATE_NAME_TO_ABBR).reduce(
  (acc, [fullLower, abbr]) => {
    const title = fullLower
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
    acc[abbr] = title;
    return acc;
  },
  {} as Record<string, string>
);

// GET: Fetch businesses that service a location
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    let state = searchParams.get('state');
    const zipcode = searchParams.get('zipcode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    // Convert full state name to abbreviation if needed
    if (state) {
      const stateLower = state.toLowerCase();
      if (STATE_NAME_TO_ABBR[stateLower]) {
        state = STATE_NAME_TO_ABBR[stateLower];
      } else if (state.length === 2) {
        state = state.toUpperCase();
      }
    }
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Check if database is configured
    if (!sql) {
      console.log('Database not configured');
      return NextResponse.json({
        businesses: [],
        total: 0,
        cached: false,
        error: 'Database not configured'
      });
    }

    // Build the query to find businesses that service this location
    let queryText = '';
    let values: any[] = [];
    
    // If we have a specific location (city or zipcode), find businesses that service it
    if (city || zipcode) {
      // For now, we'll use a simplified approach
      // In the future, this could use the PostGIS extension for proper geographic queries
      
      // Get businesses that either:
      // 1. Have this zipcode in their service_zipcodes array
      // 2. Are within their service_radius_miles of the location
      // 3. Are in the same city (fallback for businesses without service areas configured)
      
      const conditions = [];
      
      // Category filter
      if (category) {
        conditions.push(`LOWER(category) = LOWER($${values.length + 1})`);
        values.push(category);
      }
      
      // Featured filter
      if (featured === 'true') {
        // Check if business is in featured_listings table with valid expiry
        conditions.push(`EXISTS (
          SELECT 1 FROM featured_listings fl 
          WHERE fl.business_id = b.id 
          AND fl.expires_at > NOW()
        )`);
      }
      
      // Verified filter
      if (verified === 'true') {
        conditions.push(`is_verified = true`);
      }
      
      // Search filter
      if (search) {
        conditions.push(`(
          LOWER(name) LIKE LOWER($${values.length + 1}) OR
          LOWER(description) LIKE LOWER($${values.length + 2}) OR
          LOWER(category) LIKE LOWER($${values.length + 3})
        )`);
        values.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
      }
      
      // Service area matching
      const serviceAreaConditions = [];
      
      // Match by zipcode
      if (zipcode) {
        serviceAreaConditions.push(`$${values.length + 1} = ANY(service_zipcodes)`);
        values.push(zipcode);
      }
      
      // Match by city (for businesses in the same city or that haven't configured service areas)
      if (city) {
        serviceAreaConditions.push(`LOWER(city) = LOWER($${values.length + 1})`);
        values.push(city);
        
        // Also match businesses that explicitly list this city in their service_areas JSONB
        serviceAreaConditions.push(`service_areas::text ILIKE $${values.length + 1}`);
        values.push('%' + city + '%');
      }
      
      // For businesses using radius-based service areas
      // This is a simplified check - ideally would use PostGIS for accurate distance calculations
      // For now, we'll include all businesses with a service_radius_miles > 0 in the same state
      if (state) {
        const stateCondition = `(
          (state = $${values.length + 1} OR state = $${values.length + 2}) 
          AND service_radius_miles > 0
        )`;
        values.push(state, ABBR_TO_NAME[state] || state);
        serviceAreaConditions.push(stateCondition);
      }
      
      // Combine service area conditions with OR
      if (serviceAreaConditions.length > 0) {
        conditions.push(`(${serviceAreaConditions.join(' OR ')})`);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Add limit and offset
      values.push(limit, offset);
      
      queryText = `
        SELECT 
          b.*,
          CASE 
            WHEN fl.business_id IS NOT NULL AND fl.expires_at > NOW() THEN true 
            ELSE false 
          END as is_currently_featured
        FROM businesses b
        LEFT JOIN featured_listings fl ON b.id = fl.business_id
        ${whereClause}
        ORDER BY 
          is_currently_featured DESC,
          rating DESC, 
          reviews DESC
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `;
      
    } else {
      // No location specified, return all businesses (filtered by other criteria)
      const conditions = [];
      
      if (category) {
        conditions.push(`LOWER(category) = LOWER($${values.length + 1})`);
        values.push(category);
      }
      
      if (featured === 'true') {
        conditions.push(`EXISTS (
          SELECT 1 FROM featured_listings fl 
          WHERE fl.business_id = b.id 
          AND fl.expires_at > NOW()
        )`);
      }
      
      if (verified === 'true') {
        conditions.push(`is_verified = true`);
      }
      
      if (search) {
        conditions.push(`(
          LOWER(name) LIKE LOWER($${values.length + 1}) OR
          LOWER(description) LIKE LOWER($${values.length + 2}) OR
          LOWER(category) LIKE LOWER($${values.length + 3})
        )`);
        values.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      values.push(limit, offset);
      
      queryText = `
        SELECT 
          b.*,
          CASE 
            WHEN fl.business_id IS NOT NULL AND fl.expires_at > NOW() THEN true 
            ELSE false 
          END as is_currently_featured
        FROM businesses b
        LEFT JOIN featured_listings fl ON b.id = fl.business_id
        ${whereClause}
        ORDER BY 
          is_currently_featured DESC,
          rating DESC, 
          reviews DESC
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `;
    }
    
    const businesses = await sql(queryText, values);

    // Get total count with same conditions but without limit/offset
    const countValues = values.slice(0, -2); // Remove limit and offset
    const countQueryText = queryText
      .replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM')
      .replace(/ORDER BY[\s\S]*$/, '');
    
    const countResult = await sql(countQueryText, countValues);
    const total = countResult[0]?.total || 0;

    // Update is_featured flag based on featured_listings table
    const businessesWithFeatured = businesses.map((b: any) => ({
      ...b,
      is_featured: b.is_currently_featured || false
    }));

    return NextResponse.json({
      businesses: businessesWithFeatured,
      total,
      cached: false,
      service_area_search: true,
      search_location: { city, state, zipcode }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error },
      { status: 500 }
    );
  }
}