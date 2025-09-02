import { useState, useEffect } from 'react';

interface GeolocationState {
  location: { latitude: number; longitude: number } | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false
  });

  const getCurrentLocation = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'La geolocalización no está soportada por este navegador'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          error: null,
          isLoading: false
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Acceso a la ubicación denegado por el usuario';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación';
            break;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  };

  return {
    ...state,
    getCurrentLocation,
    calculateDistance
  };
};