import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { s2Service } from '@/services/geo/S2Service';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  s2CellId?: string; // S2 cell ID para geosharding
  s2Level?: number;  // Nivel de precisión S2
}

export interface GeolocationState {
  location: LocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
  lastUpdated?: Date;
}

export interface LocationFilter {
  maxDistance?: number; // en kilómetros
  minAccuracy?: number; // en metros
  excludeCurrentUser?: boolean;
}

export interface NearbyUser {
  id: string;
  name: string;
  distance: number;
  location: LocationCoordinates;
  lastSeen?: Date;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false
  });
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = useCallback(() => {
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
        // Calcular S2 cell ID automáticamente
        let s2CellId: string | undefined;
        let s2Level: number | undefined;
        
        try {
          const defaultLevel = 15; // ~1km² (ideal para matching urbano)
          s2CellId = s2Service.getCell(position.coords.latitude, position.coords.longitude, defaultLevel);
          s2Level = defaultLevel;
        } catch (error) {
          logger.warn('Error calculating S2 cell ID:', { error: error instanceof Error ? error.message : String(error) });
        }

        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            s2CellId,
            s2Level
          },
          error: null,
          isLoading: false,
          lastUpdated: new Date()
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
  }, []);

  // Start watching position for real-time updates
  const startWatchingLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La geolocalización no está soportada por este navegador'
      }));
      return;
    }

    if (watchId !== null) {
      return; // Already watching
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        // Calcular S2 cell ID automáticamente
        let s2CellId: string | undefined;
        let s2Level: number | undefined;
        
        try {
          const defaultLevel = 15; // ~1km² (ideal para matching urbano)
          s2CellId = s2Service.getCell(position.coords.latitude, position.coords.longitude, defaultLevel);
          s2Level = defaultLevel;
        } catch (error) {
          logger.warn('Error calculating S2 cell ID:', { error: error instanceof Error ? error.message : String(error) });
        }

        setState(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            s2CellId,
            s2Level
          },
          error: null,
          isLoading: false,
          lastUpdated: new Date()
        }));
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
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes for real-time updates
      }
    );

    setWatchId(id);
  }, [watchId]);

  // Stop watching position
  const stopWatchingLocation = useCallback(() => {
    if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((
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
  }, []);

  // Filter nearby users based on location and criteria
  const filterNearbyUsers = useCallback((
    users: NearbyUser[],
    filter: LocationFilter,
    currentLocation?: LocationCoordinates
  ): NearbyUser[] => {
    if (!currentLocation) return [];

    return users.filter(user => {
      // Filter by maximum distance
      if (filter.maxDistance && user.distance > filter.maxDistance) {
        return false;
      }

      // Filter by minimum accuracy (if user has accuracy data)
      if (filter.minAccuracy && user.location.accuracy && user.location.accuracy > filter.minAccuracy) {
        return false;
      }

      return true;
    }).sort((a, b) => a.distance - b.distance); // Sort by distance
  }, []);

  // Get users within a specific radius
  const getUsersInRadius = useCallback((
    users: { id: string; name: string; location: LocationCoordinates; lastSeen?: Date }[],
    radius: number,
    currentUserId?: string
  ): NearbyUser[] => {
    if (!state.location) return [];

    const nearbyUsers: NearbyUser[] = users
      .filter(user => user.id !== currentUserId) // Exclude current user
      .map(user => {
        const distance = calculateDistance(
          state.location!.latitude,
          state.location!.longitude,
          user.location.latitude,
          user.location.longitude
        );

        return {
          id: user.id,
          name: user.name,
          distance,
          location: user.location,
          lastSeen: user.lastSeen
        };
      })
      .filter(user => user.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearbyUsers;
  }, [state.location, calculateDistance]);

  // Check if location is accurate enough
  const isLocationAccurate = useCallback((minAccuracy: number = 100): boolean => {
    if (!state.location?.accuracy) return false;
    return state.location.accuracy <= minAccuracy;
  }, [state.location]);

  // Get location permission status
  const getPermissionStatus = useCallback(async (): Promise<PermissionState | null> => {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return null;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      logger.warn('Could not query geolocation permission:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }, []);

  // Format distance for display
  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopWatchingLocation();
    };
  }, [stopWatchingLocation]);

  return {
    ...state,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation,
    calculateDistance,
    filterNearbyUsers,
    getUsersInRadius,
    isLocationAccurate,
    getPermissionStatus,
    formatDistance,
    isWatching: watchId !== null
  };
};