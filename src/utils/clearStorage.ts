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
      localStorage.removeItem(key);
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
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('userType');
    
    logger.info('🔄 Estado de autenticación reseteado');
  } catch (error) {
    logger.error('Error reseteando autenticación:', { error: String(error) });
  }
};

// Función para debug - mostrar todo el localStorage
export const debugStorage = () => {
  logger.debug('Estado actual del localStorage');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      logger.debug(`${key}: ${value}`);
    }
  }
};
