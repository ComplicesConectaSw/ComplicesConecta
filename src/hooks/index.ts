/**
 * Índice centralizado de hooks - ComplicesConecta v3.6.3
 * Organización y exportación centralizada de hooks personalizados
 */

// === HOOKS PRINCIPALES ===

// Autenticación y usuarios
export { useAuth } from '@/features/auth/useAuth';

// Estado y persistencia
export { usePersistedState } from './usePersistedState';
export { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

// UI y interacción
export { useToast } from './useToast';
export { useIsMobile } from './use-mobile';
export { useScrollHide } from './useScrollHide';

// Datos y API
export { useTokens } from './useTokens';
export { useFeatures } from './useFeatures';
export { useInterests } from './useInterests';

// Geolocalización y ubicación
export { useGeolocation } from './useGeolocation';

// Notificaciones y comunicación
export { usePushNotifications } from './usePushNotifications';
export { useRealtimeNotifications } from './useRealtimeNotifications';
export { useOnlineStatus } from './useOnlineStatus';

// Seguridad y protección
export { useScreenshotProtection } from './useScreenshotProtection';
export { useConsentVerification } from './useConsentVerification';

// Performance y optimización
export { usePerformanceOptimization } from './usePerformanceOptimization';
export { useAdvancedCache } from './useAdvancedCache';

// Moderación y análisis
export { useAdvancedModeration } from './useAdvancedModeration';
export { useAdvancedAnalytics } from './useAdvancedAnalytics';
export { useModeratorTimer } from './useModeratorTimer';

// Integración externa
export { useWorldID } from './useWorldID';
export { useSupabaseTheme } from './useSupabaseTheme';

// === CONFIGURACIONES DE HOOKS ===
export const HOOKS_CONFIG = {
  // Configuración de cache para hooks
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Configuración de debounce
  DEBOUNCE_DELAY: 300, // 300ms
  
  // Configuración de polling
  POLLING_INTERVAL: 30000, // 30 segundos
  
  // Configuración de geolocalización
  GEOLOCATION: {
    TIMEOUT: 10000, // 10 segundos
    MAX_AGE: 60000, // 1 minuto
    HIGH_ACCURACY: true
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
  }
} as const;
