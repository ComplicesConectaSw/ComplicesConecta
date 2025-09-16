/**
 * Factory Pattern para seleccionar Provider según contexto
 * Determina automáticamente si usar Demo o Real Provider
 */

import React, { ReactNode } from 'react';
import { DemoProvider } from './DemoProvider';
import { RealProvider } from './RealProvider';
import { getDataConfig } from '@/config/demo-production';
import { logger } from '@/lib/logger';

interface AppFactoryProps {
  children: ReactNode;
  forceMode?: 'demo' | 'production';
  userContext?: {
    authenticated?: boolean;
    userType?: 'admin' | 'user' | 'guest';
  };
}

export const AppFactory: React.FC<AppFactoryProps> = ({
  children,
  forceMode,
  userContext = {}
}) => {
  const config = getDataConfig({
    userAuthenticated: userContext.authenticated,
    userType: userContext.userType,
    forceMode
  });

  logger.info('AppFactory configuración:', {
    mode: config.mode,
    useDemo: config.useDemo,
    userContext
  });

  if (config.useDemo) {
    return <DemoProvider>{children}</DemoProvider>;
  }

  return <RealProvider>{children}</RealProvider>;
};

/**
 * Hook para obtener el contexto apropiado (Demo o Real)
 * Funciona independientemente del provider activo
 */
export const useAppContext = () => {
  // Intentar obtener contexto demo
  try {
    const { useDemoContext } = require('./DemoProvider');
    const demoContext = useDemoContext();
    if (demoContext) {
      return {
        ...demoContext,
        type: 'demo' as const
      };
    }
  } catch {
    // Demo context no disponible
  }

  // Intentar obtener contexto real
  try {
    const { useRealContext } = require('./RealProvider');
    const realContext = useRealContext();
    if (realContext) {
      return {
        ...realContext,
        type: 'real' as const
      };
    }
  } catch {
    // Real context no disponible
  }

  // Fallback - retornar contexto básico
  logger.warn('No se pudo obtener contexto demo ni real, usando fallback');
  return {
    profiles: [],
    isDemo: false,
    type: 'fallback' as const,
    getRealProfile: async () => null,
    getRealProfiles: async () => [],
    realAuth: {
      login: async () => ({ success: false, error: 'Service not available' }),
      logout: async () => {},
      getCurrentUser: async () => null,
      signUp: async () => ({ success: false, error: 'Service not available' })
    }
  };
};

export default AppFactory;
