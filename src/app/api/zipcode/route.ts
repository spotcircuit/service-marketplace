import { NextRequest, NextResponse } from 'next/server';

// Cache for ZIP lookups to avoid repeated API calls
const zipCache = new Map<string, { city: string; state: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback database for common ZIP codes (used if API fails)
const FALLBACK_ZIP_DATABASE: Record<string, { city: string; state: string }> = {
  // Virginia - Northern VA / DC Metro
  '20147': { city: 'Ashburn', state: 'VA' },
  '20148': { city: 'Ashburn', state: 'VA' },
  '20176': { city: 'Leesburg', state: 'VA' },
  '20175': { city: 'Leesburg', state: 'VA' },
  '22180': { city: 'Vienna', state: 'VA' },
  '22182': { city: 'Vienna', state: 'VA' },
  '20190': { city: 'Reston', state: 'VA' },
  '20191': { city: 'Reston', state: 'VA' },
  '20194': { city: 'Reston', state: 'VA' },
  '20170': { city: 'Herndon', state: 'VA' },
  '20171': { city: 'Herndon', state: 'VA' },
  '20164': { city: 'Sterling', state: 'VA' },
  '20165': { city: 'Sterling', state: 'VA' },
  '20166': { city: 'Sterling', state: 'VA' },
  '22015': { city: 'Burke', state: 'VA' },
  '22031': { city: 'Fairfax', state: 'VA' },
  '22032': { city: 'Fairfax', state: 'VA' },
  '22033': { city: 'Fairfax', state: 'VA' },
  '22101': { city: 'McLean', state: 'VA' },
  '22102': { city: 'McLean', state: 'VA' },
  '22201': { city: 'Arlington', state: 'VA' },
  '22202': { city: 'Arlington', state: 'VA' },
  '22203': { city: 'Arlington', state: 'VA' },
  '22204': { city: 'Arlington', state: 'VA' },
  '22205': { city: 'Arlington', state: 'VA' },
  '22206': { city: 'Arlington', state: 'VA' },
  '22207': { city: 'Arlington', state: 'VA' },
  '22301': { city: 'Alexandria', state: 'VA' },
  '22302': { city: 'Alexandria', state: 'VA' },
  '22303': { city: 'Alexandria', state: 'VA' },
  '22304': { city: 'Alexandria', state: 'VA' },
  '22305': { city: 'Alexandria', state: 'VA' },
  
  // Richmond, VA
  '23219': { city: 'Richmond', state: 'VA' },
  '23220': { city: 'Richmond', state: 'VA' },
  '23221': { city: 'Richmond', state: 'VA' },
  '23222': { city: 'Richmond', state: 'VA' },
  '23223': { city: 'Richmond', state: 'VA' },
  '23224': { city: 'Richmond', state: 'VA' },
  '23225': { city: 'Richmond', state: 'VA' },
  '23226': { city: 'Richmond', state: 'VA' },
  '23227': { city: 'Richmond', state: 'VA' },
  '23228': { city: 'Richmond', state: 'VA' },
  '23229': { city: 'Richmond', state: 'VA' },
  '23230': { city: 'Richmond', state: 'VA' },
  
  // Virginia Beach / Norfolk
  '23451': { city: 'Virginia Beach', state: 'VA' },
  '23452': { city: 'Virginia Beach', state: 'VA' },
  '23453': { city: 'Virginia Beach', state: 'VA' },
  '23454': { city: 'Virginia Beach', state: 'VA' },
  '23455': { city: 'Virginia Beach', state: 'VA' },
  '23456': { city: 'Virginia Beach', state: 'VA' },
  '23501': { city: 'Norfolk', state: 'VA' },
  '23502': { city: 'Norfolk', state: 'VA' },
  '23503': { city: 'Norfolk', state: 'VA' },
  '23504': { city: 'Norfolk', state: 'VA' },
  '23505': { city: 'Norfolk', state: 'VA' },
  
  // Maryland - DC Metro
  '20812': { city: 'Bethesda', state: 'MD' },
  '20813': { city: 'Bethesda', state: 'MD' },
  '20814': { city: 'Bethesda', state: 'MD' },
  '20815': { city: 'Chevy Chase', state: 'MD' },
  '20816': { city: 'Bethesda', state: 'MD' },
  '20817': { city: 'Bethesda', state: 'MD' },
  '20850': { city: 'Rockville', state: 'MD' },
  '20851': { city: 'Rockville', state: 'MD' },
  '20852': { city: 'Rockville', state: 'MD' },
  '20853': { city: 'Rockville', state: 'MD' },
  '20854': { city: 'Potomac', state: 'MD' },
  '20874': { city: 'Germantown', state: 'MD' },
  '20875': { city: 'Germantown', state: 'MD' },
  '20876': { city: 'Germantown', state: 'MD' },
  '20877': { city: 'Gaithersburg', state: 'MD' },
  '20878': { city: 'Gaithersburg', state: 'MD' },
  '20879': { city: 'Gaithersburg', state: 'MD' },
  '20901': { city: 'Silver Spring', state: 'MD' },
  '20902': { city: 'Silver Spring', state: 'MD' },
  '20903': { city: 'Silver Spring', state: 'MD' },
  '20904': { city: 'Silver Spring', state: 'MD' },
  '20905': { city: 'Silver Spring', state: 'MD' },
  '20906': { city: 'Silver Spring', state: 'MD' },
  
  // Baltimore, MD
  '21201': { city: 'Baltimore', state: 'MD' },
  '21202': { city: 'Baltimore', state: 'MD' },
  '21203': { city: 'Baltimore', state: 'MD' },
  '21204': { city: 'Towson', state: 'MD' },
  '21205': { city: 'Baltimore', state: 'MD' },
  '21206': { city: 'Baltimore', state: 'MD' },
  '21207': { city: 'Baltimore', state: 'MD' },
  '21208': { city: 'Baltimore', state: 'MD' },
  '21209': { city: 'Baltimore', state: 'MD' },
  '21210': { city: 'Baltimore', state: 'MD' },
  
  // Washington DC
  '20001': { city: 'Washington', state: 'DC' },
  '20002': { city: 'Washington', state: 'DC' },
  '20003': { city: 'Washington', state: 'DC' },
  '20004': { city: 'Washington', state: 'DC' },
  '20005': { city: 'Washington', state: 'DC' },
  '20006': { city: 'Washington', state: 'DC' },
  '20007': { city: 'Washington', state: 'DC' },
  '20008': { city: 'Washington', state: 'DC' },
  '20009': { city: 'Washington', state: 'DC' },
  '20010': { city: 'Washington', state: 'DC' },
  
  // North Carolina - Charlotte
  '28201': { city: 'Charlotte', state: 'NC' },
  '28202': { city: 'Charlotte', state: 'NC' },
  '28203': { city: 'Charlotte', state: 'NC' },
  '28204': { city: 'Charlotte', state: 'NC' },
  '28205': { city: 'Charlotte', state: 'NC' },
  '28206': { city: 'Charlotte', state: 'NC' },
  '28207': { city: 'Charlotte', state: 'NC' },
  '28208': { city: 'Charlotte', state: 'NC' },
  '28209': { city: 'Charlotte', state: 'NC' },
  '28210': { city: 'Charlotte', state: 'NC' },
  
  // North Carolina - Raleigh
  '27601': { city: 'Raleigh', state: 'NC' },
  '27602': { city: 'Raleigh', state: 'NC' },
  '27603': { city: 'Raleigh', state: 'NC' },
  '27604': { city: 'Raleigh', state: 'NC' },
  '27605': { city: 'Raleigh', state: 'NC' },
  '27606': { city: 'Raleigh', state: 'NC' },
  '27607': { city: 'Raleigh', state: 'NC' },
  '27608': { city: 'Raleigh', state: 'NC' },
  '27609': { city: 'Raleigh', state: 'NC' },
  '27610': { city: 'Raleigh', state: 'NC' },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zip = searchParams.get('zip');

    if (!zip) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Clean the ZIP code (remove any non-digits, take first 5)
    const cleanZip = zip.replace(/\D/g, '').slice(0, 5);

    // Check cache first
    const cached = zipCache.get(cleanZip);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        zip: cleanZip,
        city: cached.city,
        state: cached.state,
        found: true,
        source: 'cache',
      });
    }

    // Try multiple API services in order of preference
    let location = null;

    // 1. Try Zippopotam.us (free, no key required)
    try {
      const zippoResponse = await fetch(`https://api.zippopotam.us/us/${cleanZip}`, {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (zippoResponse.ok) {
        const data = await zippoResponse.json();
        if (data.places && data.places.length > 0) {
          location = {
            city: data.places[0]['place name'],
            state: data.places[0]['state abbreviation'],
          };
        }
      }
    } catch (error) {
      console.log('Zippopotam API failed, trying next service...');
    }

    // 2. Try Google Maps Geocoding API if available
    if (!location && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZip}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          { signal: AbortSignal.timeout(3000) }
        );
        
        if (googleResponse.ok) {
          const data = await googleResponse.json();
          if (data.results && data.results.length > 0) {
            const components = data.results[0].address_components;
            let city = '';
            let state = '';
            
            for (const component of components) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
            }
            
            if (city && state) {
              location = { city, state };
            }
          }
        }
      } catch (error) {
        console.log('Google Geocoding API failed, trying next...');
      }
    }

    // 3. Try OpenDataSoft (free public dataset)
    if (!location) {
      try {
        const odsResponse = await fetch(
          `https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=${cleanZip}&facet=state&facet=timezone&facet=dst`,
          { signal: AbortSignal.timeout(3000) }
        );
        
        if (odsResponse.ok) {
          const data = await odsResponse.json();
          if (data.records && data.records.length > 0) {
            const record = data.records[0].fields;
            location = {
              city: record.city || record.primary_city || '',
              state: record.state || '',
            };
          }
        }
      } catch (error) {
        console.log('OpenDataSoft API failed');
      }
    }

    // If API lookups succeeded, cache and return
    if (location && location.city && location.state) {
      zipCache.set(cleanZip, {
        ...location,
        timestamp: Date.now(),
      });

      return NextResponse.json({
        zip: cleanZip,
        city: location.city,
        state: location.state,
        found: true,
        source: 'api',
      });
    }

    // Fall back to local database
    const fallbackLocation = FALLBACK_ZIP_DATABASE[cleanZip];
    if (fallbackLocation) {
      return NextResponse.json({
        zip: cleanZip,
        city: fallbackLocation.city,
        state: fallbackLocation.state,
        found: true,
        source: 'fallback',
      });
    }

    // Last resort: basic state guess based on ZIP prefix
    const firstDigit = cleanZip[0];
    const fallbackStates: Record<string, string> = {
      '0': 'MA',
      '1': 'NY',
      '2': 'VA',
      '3': 'FL',
      '4': 'KY',
      '5': 'IA',
      '6': 'IL',
      '7': 'TX',
      '8': 'CO',
      '9': 'CA',
    };

    return NextResponse.json({
      zip: cleanZip,
      city: 'Unknown',
      state: fallbackStates[firstDigit] || 'Unknown',
      found: false,
      message: 'Could not determine city/state for this ZIP code',
    });

  } catch (error) {
    console.error('ZIP code lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup ZIP code' },
      { status: 500 }
    );
  }
}