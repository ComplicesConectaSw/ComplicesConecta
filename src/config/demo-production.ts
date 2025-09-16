/**
 * Configuración para separar lógica demo y producción
 * Módulo dedicado para gestionar el comportamiento según el entorno
 */

import { logger } from '@/lib/logger';

// Tipos para configuración
export interface DemoConfig {
  enabled: boolean;
  profiles: any[];
  mockData: boolean;
  skipValidations: boolean;
}

export interface ProductionConfig {
  enabled: boolean;
  supabaseUrl: string;
  requireAuth: boolean;
  strictValidations: boolean;
}

export interface AppMode {
  isDemo: boolean;
  isProduction: boolean;
  current: 'demo' | 'production';
}

// Configuración demo
export const demoConfig: DemoConfig = {
  enabled: import.meta.env.VITE_APP_MODE === 'demo',
  profiles: [], // Se cargarán desde mock data
  mockData: true,
  skipValidations: false // Mantener validaciones incluso en demo
};

// Configuración producción
export const productionConfig: ProductionConfig = {
  enabled: import.meta.env.VITE_APP_MODE === 'production' || import.meta.env.VITE_APP_MODE !== 'demo',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  requireAuth: true,
  strictValidations: true
};

// Modo actual de la aplicación
export const appMode: AppMode = {
  isDemo: demoConfig.enabled,
  isProduction: productionConfig.enabled,
  current: demoConfig.enabled ? 'demo' : 'production'
};

/**
 * Determina si se debe usar datos demo o reales
 * @param userAuthenticated - Si el usuario está autenticado
 * @param forceProduction - Forzar modo producción
 * @returns boolean indicando si usar datos demo
 */
export const shouldUseDemoData = (userAuthenticated: boolean = false, forceProduction: boolean = false): boolean => {
  // Si se fuerza producción, nunca usar demo
  if (forceProduction) {
    logger.info('Modo producción forzado, usando datos reales');
    return false;
  }

  // Si el usuario está autenticado, usar datos reales
  if (userAuthenticated) {
    logger.info('Usuario autenticado, usando datos reales');
    return false;
  }

  // Si estamos en modo demo y el usuario no está autenticado
  if (appMode.isDemo && !userAuthenticated) {
    logger.info('Modo demo activo para usuario no autenticado');
    return true;
  }

  // Por defecto, usar datos reales en producción
  logger.info('Usando datos reales por defecto');
  return false;
};

/**
 * Obtiene la configuración de datos según el contexto
 * @param context - Contexto de la aplicación
 * @returns configuración apropiada
 */
export const getDataConfig = (context: {
  userAuthenticated?: boolean;
  userType?: 'admin' | 'user' | 'guest';
  forceMode?: 'demo' | 'production';
}) => {
  const { userAuthenticated = false, userType = 'guest', forceMode } = context;

  // Forzar modo específico si se especifica
  if (forceMode) {
    return {
      useDemo: forceMode === 'demo',
      useSupabase: forceMode === 'production',
      requireAuth: forceMode === 'production',
      mode: forceMode
    };
  }

  // Usuarios admin siempre en producción
  if (userType === 'admin') {
    return {
      useDemo: false,
      useSupabase: true,
      requireAuth: true,
      mode: 'production' as const
    };
  }

  // Determinar según autenticación y configuración
  const useDemo = shouldUseDemoData(userAuthenticated);
  
  return {
    useDemo,
    useSupabase: !useDemo,
    requireAuth: !useDemo,
    mode: useDemo ? 'demo' as const : 'production' as const
  };
};

/**
 * Wrapper para servicios que necesitan comportamiento diferente en demo/producción
 */
export class ServiceWrapper<T> {
  private demoService: T;
  private productionService: T;

  constructor(demoService: T, productionService: T) {
    this.demoService = demoService;
    this.productionService = productionService;
  }

  /**
   * Obtiene el servicio apropiado según el contexto
   */
  getService(context: Parameters<typeof getDataConfig>[0]): T {
    const config = getDataConfig(context);
    return config.useDemo ? this.demoService : this.productionService;
  }
}

/**
 * Hook para obtener configuración reactiva
 */
export const useAppMode = () => {
  return {
    ...appMode,
    getDataConfig,
    shouldUseDemoData,
    ServiceWrapper
  };
};

// Log de configuración inicial
logger.info('Configuración de modo de aplicación:', {
  mode: appMode.current,
  isDemo: appMode.isDemo,
  isProduction: appMode.isProduction,
  env: import.meta.env.VITE_APP_MODE
});
