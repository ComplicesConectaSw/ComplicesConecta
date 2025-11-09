/**
 * Utilidad para limpiar localStorage corrupto y resetear estado de autenticación
 */

import { logger } from '@/lib/logger';

export const clearAllStorage = () => {
  try {
    // Limpiar todas las claves relacionadas con autenticación
    const keysToRemove = [
      'demo_authenticated',
      'demo_user',
      'userType',
      'hasVisitedComplicesConecta',
      'sb-axtvqnozatbmllvwzuim-auth-token'
    ];

    keysToRemove.forEach(key => {
      safeRemoveItem(key);
    });

    logger.info('🧹 localStorage limpiado completamente');
    
    // Recargar página para aplicar cambios
    window.location.reload();
  } catch (error) {
    logger.error('Error limpiando localStorage:', { error: String(error) });
  }
};

export const resetAuthState = () => {
  try {
    // Solo limpiar claves de autenticación
    safeRemoveItem('demo_authenticated');
    safeRemoveItem('demo_user');
    safeRemoveItem('userType');
    
    logger.info('🔄 Estado de autenticación reseteado');
  } catch (error) {
    logger.error('Error reseteando autenticación:', { error: String(error) });
  }
};

// Función para debug - mostrar todo el localStorage
export const debugStorage = () => {
  logger.debug('Estado actual del localStorage');
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const value = safeGetItem<string>(key, { validate: false, defaultValue: null });
        logger.debug(`${key}: ${value}`);
      }
    }
  }
};
