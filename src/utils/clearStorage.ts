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

    if (typeof localStorage !== 'undefined') {
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      logger.info('🧹 localStorage limpiado completamente');
      
      // Recargar página para aplicar cambios
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  } catch (error) {
    logger.error('Error limpiando localStorage:', { error: String(error) });
  }
};

export const resetAuthState = () => {
  try {
    // Solo limpiar claves de autenticación
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('userType');
    }
    
    logger.info('🔄 Estado de autenticación reseteado');
  } catch (error) {
    logger.error('Error reseteando estado de auth:', { error: String(error) });
  }
};

// Función para debug - mostrar todo el localStorage
export const debugStorage = () => {
  if (typeof localStorage === 'undefined') {
    console.log('📋 localStorage no disponible (SSR)');
    return;
  }
  
  console.log('📋 Estado actual del localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }
  }
};
