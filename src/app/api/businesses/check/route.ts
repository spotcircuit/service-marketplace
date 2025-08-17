import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Helper function to normalize addresses for comparison
function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/\./g, '') // Remove periods
    .replace(/,/g, '') // Remove commas
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bplace\b/g, 'pl')
    .replace(/\bcircle\b/g, 'cir')
    .replace(/\bparkway\b/g, 'pkwy')
    .replace(/\bhighway\b/g, 'hwy')
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/\bapartment\b/g, 'apt')
    .replace(/\bsuite\b/g, 'ste')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const address = searchParams.get('address');

    const sql = neon(process.env.DATABASE_URL!);

    // If we have address, city, and state, try to find by location first
    if (address && city && state) {
      const normalizedInputAddr = normalizeAddress(address);
      
      // First try: exact city and state match with fuzzy address
      const locationQuery = `
        SELECT *, 
          CASE 
            WHEN LOWER(REPLACE(REPLACE(REPLACE(address, '.', ''), ',', ''), '  ', ' ')) = LOWER($1) THEN 100
            WHEN LOWER(REPLACE(REPLACE(REPLACE(address, '.', ''), ',', ''), '  ', ' ')) LIKE LOWER($2) THEN 90
            WHEN LOWER(address) LIKE LOWER($3) THEN 80
            ELSE 70
          END as match_score
        FROM businesses 
        WHERE LOWER(city) = LOWER($4) 
          AND LOWER(state) = LOWER($5)
          AND (
            LOWER(REPLACE(REPLACE(REPLACE(address, '.', ''), ',', ''), '  ', ' ')) = LOWER($1)
            OR LOWER(REPLACE(REPLACE(REPLACE(address, '.', ''), ',', ''), '  ', ' ')) LIKE LOWER($2)
            OR (LENGTH($6) > 5 AND LOWER(address) LIKE LOWER($7))
          )
        ORDER BY match_score DESC
        LIMIT 5
      `;
      
      const searchAddr = normalizedInputAddr.split(' ')[0]; // Get street number
      // Only do partial matching if the street number is reasonable (not too long)
      const shouldPartialMatch = searchAddr.length <= 4; // Most street numbers are 1-4 digits
      
      const locationResult = await sql(locationQuery, [
        address, // Exact match
        `${address}%`, // Starts with
        `${address}%`, // Starts with (for LIKE)
        city,
        state,
        searchAddr, // Street number for length check
        shouldPartialMatch ? `${searchAddr} %` : `${address}%` // Only partial match for short numbers
      ]);
      
      if (locationResult && locationResult.length > 0) {
        // If we have a name, try to match it too
        if (name) {
          const nameMatch = locationResult.find((b: any) => 
            b.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(b.name.toLowerCase())
          );
          if (nameMatch) {
            return NextResponse.json({ 
              exists: true,
              business: nameMatch,
              matchType: 'address_and_name'
            });
          }
        }
        
        // Return the best address match
        return NextResponse.json({ 
          exists: true,
          business: locationResult[0],
          matchType: 'address_only',
          possibleMatches: locationResult.slice(1) // Other potential matches
        });
      }
    }

    // Fallback to name-based search if no address match
    if (name) {
      let query = 'SELECT * FROM businesses WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      query += ` AND (LOWER(name) = LOWER($${paramIndex}) OR LOWER(name) LIKE LOWER($${paramIndex + 1}))`;
      params.push(name, `%${name}%`);
      paramIndex += 2;

      if (city) {
        query += ` AND LOWER(city) = LOWER($${paramIndex})`;
        params.push(city);
        paramIndex++;
      }

      if (state) {
        query += ` AND LOWER(state) = LOWER($${paramIndex})`;
        params.push(state);
        paramIndex++;
      }

      query += ' LIMIT 1';

      const result = await sql(query, params);
      
      if (result && result.length > 0) {
        return NextResponse.json({ 
          exists: true,
          business: result[0],
          matchType: 'name'
        });
      }
    }

    return NextResponse.json({ 
      exists: false,
      message: 'Business not found in our directory'
    });

  } catch (error) {
    console.error('Error checking business:', error);
    return NextResponse.json(
      { error: 'Failed to check business', exists: false },
      { status: 500 }
    );
  }
}