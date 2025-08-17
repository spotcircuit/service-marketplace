// Geocoding utilities for converting addresses to coordinates

export async function geocodeAddress(address: string, city: string, state: string, zipcode?: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('Google Maps API key not configured');
    return null;
  }

  try {
    const fullAddress = `${address}, ${city}, ${state}${zipcode ? ' ' + zipcode : ''}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error('Geocoding request failed');
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
    
    console.error('No geocoding results found for address:', fullAddress);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}