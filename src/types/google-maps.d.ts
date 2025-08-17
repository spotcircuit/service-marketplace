/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
    googleMapsCallback?: () => void;
    googleMapsLoading?: boolean;
    googleMapsLoaded?: boolean;
  }
}

export {};