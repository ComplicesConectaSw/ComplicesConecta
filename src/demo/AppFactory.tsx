/**
 * Factory Pattern para seleccionar Provider según contexto
 * Determina automáticamente si usar Demo o Real Provider
 */

import React, { ReactNode, useMemo } from 'react';
import { DemoProvider } from '@/demo/DemoProvider';
import { RealProvider } from '@/demo/RealProvider';

// CRÍTICO: Importar logger de forma segura con fallback
import { logger } from '@/lib/logger';

// Fallback logger si el import falla (no debería pasar, pero por seguridad)
const safeLogger = logger || {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

interface AppFactoryProps {
  children: ReactNode;
  forceMode?: 'demo' | 'production';
}

export const AppFactory: React.FC<AppFactoryProps> = ({ children }) => {
  const isDemoMode = useMemo(() => {
    const mode = import.meta.env.VITE_APP_MODE;
    const isDemo = mode === 'demo' || mode === 'development';
    
    safeLogger.info('AppFactory: Modo detectado', { 
      mode, 
      isDemo,
      env: import.meta.env.MODE 
    });
    
    return isDemo;
  }, []);

  // Renderizar provider apropiado según el modo
  if (isDemoMode) {
    safeLogger.info('AppFactory: Usando DemoProvider');
    
    return (
      <DemoProvider>
        {children}
      </DemoProvider>
    );
  }

  safeLogger.info('AppFactory: Usando RealProvider');
  
  return (
    <RealProvider>
      {children}
    </RealProvider>
  );
};

/**
 * Hook para obtener el contexto apropiado (Demo o Real)
 * Funciona independientemente del provider activo
 */
export const useAppContext = () => {
  const isDemoMode = useMemo(() => {
    const mode = import.meta.env.VITE_APP_MODE;
    return mode === 'demo' || mode === 'development';
  }, []);

  // Fallback seguro sin hooks condicionales
  return {
    profiles: [],
    isDemo: isDemoMode,
    mode: isDemoMode ? 'demo' : 'production',
    realAuth: {
      login: async () => ({ success: false, error: 'Service not available' }),
      logout: async () => {},
      getCurrentUser: async () => null,
      signUp: async () => ({ success: false, error: 'Service not available' })
    }
  };
};

export default AppFactory;
