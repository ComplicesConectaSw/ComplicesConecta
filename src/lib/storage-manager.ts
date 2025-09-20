import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';

// Storage Manager - Migración gradual de localStorage a React Query + Supabase
// Solo mantiene flags de sesión en localStorage, datos en Supabase

export interface SessionFlags {
  demo_authenticated: boolean;
  userType: 'single' | 'couple' | null;
}

export class StorageManager {
  // Solo flags de sesión permitidos en localStorage
  private static readonly ALLOWED_KEYS = [
    'demo_authenticated', 
    'userType'
  ];

  // Migrar datos legacy a Supabase y limpiar localStorage
  static migrateToSupabase() {
    const legacyKeys = [
      'apoyo_session',
      'demo_user',
      'demo_session',
      'user_profile',
      'profile_data',
      'cached_profile'
    ];

    legacyKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        logger.info(`🔄 Migrando ${key} - datos movidos a Supabase`);
        localStorage.removeItem(key);
      }
    });
  }

  // Obtener flags de sesión
  static getSessionFlags(): SessionFlags {
    return {
      demo_authenticated: localStorage.getItem('demo_authenticated') === 'true',
      userType: localStorage.getItem('userType') as 'single' | 'couple' | null
    };
  }

  // Establecer flag de sesión
  static setSessionFlag(key: keyof SessionFlags, value: boolean | string | null) {
    if (!this.ALLOWED_KEYS.includes(key)) {
      logger.warn(`⚠️ Intento de guardar clave no permitida: ${key}`);
      return;
    }

    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  }

  // Limpiar todas las sesiones
  static clearAllSessions() {
    this.ALLOWED_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Limpiar solo sesión demo
  static clearDemoSession() {
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('userType');
  }

  // Limpiar sesión real (no hay sesiones especiales)
  static clearRealSession() {
    // No hay sesiones especiales que limpiar
  }

  // Validar que no hay datos sensibles en localStorage
  static validateCleanStorage(): boolean {
    const prohibitedKeys = [
      'user_profile',
      'profile_data', 
      'cached_profile',
      'demo_user'
    ];

    const violations = prohibitedKeys.filter(key => 
      localStorage.getItem(key) !== null
    );

    if (violations.length > 0) {
      logger.error('❌ Datos sensibles detectados en localStorage:', { violations: violations.join(', ') });
      return false;
    }

    return true;
  }
}
