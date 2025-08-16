import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// Geocode a single address using Google Maps API
async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    console.error('No results found for address:', address);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// GET: Geocode an address
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const coordinates = await geocodeAddress(address);

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Failed to geocode address' },
        { status: 404 }
      );
    }

    return NextResponse.json(coordinates);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}

// POST: Batch geocode businesses without coordinates
export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get businesses that need geocoding
    const businesses = await sql`
      SELECT id, address, city, state, zipcode
      FROM businesses
      WHERE (latitude IS NULL OR longitude IS NULL OR is_geocoded = false)
      LIMIT 10
    `;

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        message: 'No businesses need geocoding',
        geocoded: 0
      });
    }

    let geocodedCount = 0;
    const results = [];

    for (const business of businesses) {
      const fullAddress = `${business.address}, ${business.city}, ${business.state} ${business.zipcode}`;
      const coordinates = await geocodeAddress(fullAddress);

      if (coordinates) {
        // Update the business with coordinates
        await sql`
          UPDATE businesses
          SET 
            latitude = ${coordinates.lat},
            longitude = ${coordinates.lng},
            is_geocoded = true,
            geocoded_at = NOW()
          WHERE id = ${business.id}
        `;
        
        geocodedCount++;
        results.push({
          id: business.id,
          address: fullAddress,
          ...coordinates
        });
      } else {
        results.push({
          id: business.id,
          address: fullAddress,
          error: 'Failed to geocode'
        });
      }

      // Add a small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      message: `Geocoded ${geocodedCount} of ${businesses.length} businesses`,
      geocoded: geocodedCount,
      results
    });

  } catch (error) {
    console.error('Batch geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to batch geocode businesses' },
      { status: 500 }
    );
  }
}