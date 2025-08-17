// Centralized Google Maps loader to prevent duplicate script loading

declare global {
  interface Window {
    google: any;
    googleMapsCallback?: () => void;
    googleMapsLoading?: boolean;
    googleMapsLoaded?: boolean;
  }
}

let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Already loaded
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    
    if (existingScript) {
      // Script exists, wait for it to load
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      
      // Set up listener for when it loads
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Google Maps loading timeout'));
      }, 10000);
      
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';

    // Set up callback
    window.googleMapsCallback = () => {
      window.googleMapsLoaded = true;
      window.googleMapsLoading = false;
      resolve();
      delete window.googleMapsCallback;
    };

    script.onerror = () => {
      window.googleMapsLoading = false;
      loadPromise = null;
      reject(new Error('Failed to load Google Maps'));
    };

    window.googleMapsLoading = true;
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};

export const waitForGoogleMaps = async (timeout = 10000): Promise<void> => {
  if (isGoogleMapsLoaded()) {
    return;
  }

  const startTime = Date.now();
  
  while (!isGoogleMapsLoaded()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for Google Maps to load');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};