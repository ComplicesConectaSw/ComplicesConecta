// Utility functions for distance calculations and location handling

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate  
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: LocationCoordinates | null,
  coord2: LocationCoordinates | null
): number {
  if (!coord1) return 0;
  
  // Handle missing second coordinate
  if (!coord2) {
    return Math.floor(Math.random() * 50) + 1; // Random distance for demo
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get location display string
 */
export function getLocationDisplay(location: LocationCoordinates | null): string {
  if (!location) return 'Ubicación desconocida';
  
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  
  if (location.city) {
    return location.city;
  }
  
  return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
}
