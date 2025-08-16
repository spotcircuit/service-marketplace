import { Business } from '@/types/business';

export interface CSVBusinessData {
  id: string;
  name: string;
  category: string;
  website: string;
  phone: string;
  rating: string;
  reviewsCount: string;
  address: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  image: string;
  photos_count: string;
  status: string;
  featured: string;
  maps_url: string;
  url: string;
  categories: string;
  phones: string;
  emails: string;
  coords: string;
  hours: string;
  onlineServiceHours: string;
  social: string;
  created_at: string;
  updated_at: string;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function parseCSV(csvContent: string): CSVBusinessData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const businesses: CSVBusinessData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const business: any = {};

    headers.forEach((header, index) => {
      business[header] = values[index] || '';
    });

    businesses.push(business as CSVBusinessData);
  }

  return businesses;
}

export function parseHours(hoursString: string): any {
  const hoursParsed: any = {};

  if (!hoursString) return null;

  try {
    // Parse the hours string format: {'day': 'Monday', 'hours': '8:30 AM - 4 PM'}; ...
    const dayEntries = hoursString.split(';').filter(entry => entry.trim());

    dayEntries.forEach(entry => {
      const dayMatch = entry.match(/'day':\s*'([^']+)'/);
      const hoursMatch = entry.match(/'hours':\s*'([^']+)'/);

      if (dayMatch && hoursMatch) {
        const day = dayMatch[1].toLowerCase();
        const hours = hoursMatch[1];

        if (hours.toLowerCase() === 'closed') {
          hoursParsed[day] = { closed: true, open: '', close: '' };
        } else {
          const [open, close] = hours.split(' - ').map(t => t.trim());
          hoursParsed[day] = { open: open || '', close: close || '', closed: false };
        }
      }
    });
  } catch (error) {
    console.error('Error parsing hours:', error);
  }

  return hoursParsed;
}

export function parseCoordinates(coordsString: string): { lat?: number; lng?: number } {
  if (!coordsString) return {};

  try {
    const latMatch = coordsString.match(/lat:\s*([-\d.]+)/);
    const lngMatch = coordsString.match(/lng:\s*([-\d.]+)/);

    return {
      lat: latMatch ? parseFloat(latMatch[1]) : undefined,
      lng: lngMatch ? parseFloat(lngMatch[1]) : undefined,
    };
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return {};
  }
}

export function parseSocialLinks(socialString: string): { [key: string]: string } {
  const social: { [key: string]: string } = {};

  if (!socialString) return social;

  try {
    const entries = socialString.split(';').filter(entry => entry.trim());

    entries.forEach(entry => {
      const [platform, url] = entry.split(':').map(s => s.trim());
      if (platform && url) {
        social[platform] = url.startsWith('http') ? url : `https:${url}`;
      }
    });
  } catch (error) {
    console.error('Error parsing social links:', error);
  }

  return social;
}

export function convertCSVToBusiness(csvData: CSVBusinessData): Business {
  const coords = parseCoordinates(csvData.coords);
  const categories = csvData.categories ? csvData.categories.split(';').map(c => c.trim()) : [];
  const primaryCategory = categories[0] || csvData.category || 'General Service';

  // Extract services from categories
  const services = categories.slice(0, 3).map((cat, index) => ({
    id: `service-${index}`,
    name: cat,
    description: '',
  }));

  // Parse service areas from address
  const serviceAreas = csvData.address_city ? [csvData.address_city] : [];

  return {
    id: csvData.id,
    name: csvData.name,
    category: primaryCategory,
    description: `Professional ${primaryCategory.toLowerCase()} serving ${csvData.address_city}, ${csvData.address_state}`,

    rating: parseFloat(csvData.rating) || 0,
    reviews: parseInt(csvData.reviewsCount) || 0,

    phone: csvData.phone,
    email: csvData.emails?.split(';')[0]?.trim(),
    website: csvData.website,

    address: csvData.address_street || csvData.address,
    city: csvData.address_city,
    state: csvData.address_state,
    zipcode: csvData.address_postal_code,
    latitude: coords.lat,
    longitude: coords.lng,

    google_rank: undefined,
    place_id: undefined,
    search_query: undefined,

    owner_name: undefined,
    owner_title: undefined,
    owner_email: undefined,

    is_featured: csvData.featured === '1',
    is_verified: parseFloat(csvData.rating) >= 4.5 && parseInt(csvData.reviewsCount) > 10,
    is_claimed: false,
    featured_until: csvData.featured === '1' ? '2025-12-31' : undefined,

    logo_url: csvData.image || undefined,
    cover_image: csvData.image || undefined,
    gallery_images: [],
    video_url: undefined,

    years_in_business: undefined,
    license_number: undefined,
    insurance: undefined,
    certifications: [],

    services: services.length > 0 ? services : undefined,
    service_areas: serviceAreas,
    price_range: undefined,

    hours: parseHours(csvData.hours),

    created_at: csvData.created_at || new Date().toISOString(),
    updated_at: csvData.updated_at || new Date().toISOString(),
    source: 'csv_import',
  };
}

export function parseAndConvertCSV(csvContent: string): Business[] {
  const csvBusinesses = parseCSV(csvContent);
  return csvBusinesses.map(convertCSVToBusiness);
}
