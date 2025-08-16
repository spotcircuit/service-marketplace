import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

    console.log('Geolocation API - Detected IP:', ip);

    // Try to get location even for localhost (it will use the server's public IP)
    const ipToUse = (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') ? '' : ip;
    
    console.log('Geolocation API - Using IP for lookup:', ipToUse || 'server IP');
    
    // Use ipapi.co for geolocation (free tier: 1000 requests/day)
    // If no IP provided, it will use the requester's IP
    const response = await fetch(`https://ipapi.co/${ipToUse}/json/`);
    
    if (!response.ok) {
      throw new Error(`ipapi.co returned status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Geolocation API - ipapi.co response:', data);

    // Check if we got valid data
    if (!data.city || !data.region_code) {
      console.log('Geolocation API - Incomplete data from ipapi.co, using defaults');
      // Still return Ashburn as default but with the actual IP
      return NextResponse.json({
        city: data.city || 'Ashburn',
        state: data.region_code || 'VA',
        region: data.region || 'Virginia',
        region_code: data.region_code || 'VA',
        postal: data.postal || '20147',
        latitude: data.latitude || 39.018,
        longitude: data.longitude || -77.539,
        country: data.country_code || 'US',
        ip: data.ip || ip,
        partial: true
      });
    }

    // Return normalized location data
    return NextResponse.json({
      city: data.city,
      state: data.region_code,
      region: data.region,
      region_code: data.region_code,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.country_code || data.country,
      ip: data.ip || ip
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    
    // Return default location on error (Ashburn, VA)
    return NextResponse.json({
      city: 'Ashburn',
      state: 'VA',
      region: 'Virginia',
      region_code: 'VA',
      postal: '20147',
      latitude: 39.018,
      longitude: -77.539,
      country: 'US',
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}