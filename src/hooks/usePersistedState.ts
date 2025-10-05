import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook seguro para persistir estado en localStorage con compatibilidad SSR
 * Reemplaza el uso directo de localStorage en toda la aplicación
 * 
 * @param key - Clave única para localStorage
 * @param defaultValue - Valor por defecto si no existe en localStorage
 * @returns [state, setState] - Tupla con estado y función para actualizarlo
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Estado inicial con verificación SSR-safe
  const [state, setState] = useState<T>(() => {
    // Verificar si estamos en el cliente (no SSR)
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      // Intentar parsear como JSON primero
      try {
        const parsed = JSON.parse(item);
        // Solo loggear en desarrollo o para keys críticas
        if (process.env.NODE_ENV === 'development' || key.includes('demo_') || key.includes('auth_')) {
          logger.info('Estado cargado desde localStorage:', { key, hasValue: !!parsed });
        }
        return parsed;
      } catch (jsonError) {
        // Si falla JSON, tratar como string simple
        if (process.env.NODE_ENV === 'development' || key.includes('demo_') || key.includes('auth_')) {
          logger.info('Estado cargado desde localStorage (string):', { key, value: item });
        }
        return item as T;
      }
    } catch (error) {
      logger.error('Error leyendo localStorage:', { key, error: String(error) });
      return defaultValue;
    }
  });

  // Función para actualizar estado y localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      
      // Solo actualizar localStorage en el cliente
      if (typeof window !== 'undefined') {
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
          if (process.env.NODE_ENV === 'development' || key.includes('demo_') || key.includes('auth_')) {
            logger.info('Valor removido de localStorage:', { key });
          }
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          if (process.env.NODE_ENV === 'development' || key.includes('demo_') || key.includes('auth_')) {
            logger.info('Valor guardado en localStorage:', { key, hasValue: !!valueToStore });
          }
        }
      }
    } catch (error) {
      logger.error('Error guardando en localStorage:', { key, error: String(error) });
    }
  }, [key, state]);

  // Sincronizar con cambios externos de localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setState(newValue);
          logger.info('Estado sincronizado desde storage event:', { key });
        } catch (error) {
          logger.error('Error sincronizando storage event:', { key, error: String(error) });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setValue];
}

/**
 * Hook para limpiar localStorage de forma controlada
 */
export function useClearPersistedState() {
  return (keys: string[]) => {
    keys.forEach(key => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
      }
    });
  };
}
