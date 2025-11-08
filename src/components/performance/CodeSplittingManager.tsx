/**
 * Gestor avanzado de code splitting con estrategias de carga inteligente
 * Implementa route-based y component-based splitting con preloading
 */

import React, { ComponentType } from 'react';
import { createLazyComponent, LazyComponentLoader, PageLoader } from './LazyComponentLoader';
import { logger } from '@/lib/logger';

// Tipos para configuración de splitting
interface SplitConfig {
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  chunkName?: string;
  retryAttempts?: number;
}

interface RouteConfig extends SplitConfig {
  path: string;
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

// Configuración de rutas con prioridades
const ROUTE_CONFIGS: RouteConfig[] = [
  // Rutas críticas - alta prioridad
  {
    path: '/profiles',
    component: () => import('@/profiles/shared/Profiles'),
    priority: 'high',
    preload: true,
    chunkName: 'profiles',
    fallback: <PageLoader pageName="Perfiles" />
  },
  {
    path: '/chat',
    component: () => import('@/pages/Chat'),
    priority: 'high',
    preload: true,
    chunkName: 'chat',
    fallback: <PageLoader pageName="Chat" />
  },
  {
    path: '/matches',
    component: () => import('@/pages/Matches'),
    priority: 'high',
    preload: true,
    chunkName: 'matches',
    fallback: <PageLoader pageName="Matches" />
  },
  {
    path: '/requests',
    component: () => import('@/pages/Requests'),
    priority: 'high',
    preload: true,
    chunkName: 'requests',
    fallback: <PageLoader pageName="Solicitudes" />
  },
  
  // Rutas importantes - prioridad media
  {
    path: '/premium',
    component: () => import('@/pages/Premium'),
    priority: 'medium',
    preload: false,
    chunkName: 'premium',
    fallback: <PageLoader pageName="Premium" />
  },
  {
    path: '/settings',
    component: () => import('@/pages/Settings'),
    priority: 'medium',
    preload: false,
    chunkName: 'settings',
    fallback: <PageLoader pageName="Configuración" />
  },
  {
    path: '/tokens',
    component: () => import('@/pages/Tokens'),
    priority: 'medium',
    preload: false,
    chunkName: 'tokens',
    fallback: <PageLoader pageName="Tokens" />
  },
  {
    path: '/dashboard',
    component: () => import('@/pages/Dashboard'),
    priority: 'medium',
    preload: false,
    chunkName: 'dashboard',
    fallback: <PageLoader pageName="Dashboard" />
  },
  
  // Rutas secundarias - baja prioridad
  {
    path: '/faq',
    component: () => import('@/pages/FAQ'),
    priority: 'low',
    preload: false,
    chunkName: 'faq',
    fallback: <PageLoader pageName="FAQ" />
  },
  {
    path: '/support',
    component: () => import('@/pages/Support'),
    priority: 'low',
    preload: false,
    chunkName: 'support',
    fallback: <PageLoader pageName="Soporte" />
  },
  {
    path: '/terms',
    component: () => import('@/pages/Terms'),
    priority: 'low',
    preload: false,
    chunkName: 'terms',
    fallback: <PageLoader pageName="Términos" />
  },
  {
    path: '/privacy',
    component: () => import('@/pages/Privacy'),
    priority: 'low',
    preload: false,
    chunkName: 'privacy',
    fallback: <PageLoader pageName="Privacidad" />
  }
];

// Cache de componentes lazy
const lazyComponentCache = new Map<string, React.LazyExoticComponent<ComponentType<any>>>();

// Función para crear componente lazy con cache
function getCachedLazyComponent(config: RouteConfig): React.LazyExoticComponent<ComponentType<any>> {
  const cacheKey = config.chunkName || config.path;
  
  if (lazyComponentCache.has(cacheKey)) {
    return lazyComponentCache.get(cacheKey)!;
  }
  
  const lazyComponent = createLazyComponent(config.component, {
    preload: config.preload,
    retryAttempts: config.retryAttempts || 3,
    chunkName: config.chunkName
  });
  
  lazyComponentCache.set(cacheKey, lazyComponent);
  return lazyComponent;
}

// Componente wrapper para rutas lazy
export const LazyRoute: React.FC<{ config: RouteConfig }> = ({ config }) => {
  const LazyComponent = getCachedLazyComponent(config);
  
  return (
    <LazyComponentLoader
      fallback={config.fallback}
      loadingText={`Cargando ${config.chunkName || 'página'}...`}
    >
      <LazyComponent />
    </LazyComponentLoader>
  );
};

// Manager principal de code splitting
export class CodeSplittingManager {
  private static instance: CodeSplittingManager;
  private preloadedRoutes = new Set<string>();
  private preloadQueue: RouteConfig[] = [];
  
  static getInstance(): CodeSplittingManager {
    if (!CodeSplittingManager.instance) {
      CodeSplittingManager.instance = new CodeSplittingManager();
    }
    return CodeSplittingManager.instance;
  }
  
  constructor() {
    this.initializePreloading();
  }
  
  private initializePreloading() {
    // Precargar rutas de alta prioridad después de la carga inicial
    setTimeout(() => {
      this.preloadHighPriorityRoutes();
    }, 2000);
    
    // Precargar rutas de prioridad media después de un delay mayor
    setTimeout(() => {
      this.preloadMediumPriorityRoutes();
    }, 5000);
  }
  
  private async preloadHighPriorityRoutes() {
    const highPriorityRoutes = ROUTE_CONFIGS.filter(
      config => config.priority === 'high' && config.preload
    );
    
    logger.info('🚀 Iniciando precarga de rutas de alta prioridad', {
      routes: highPriorityRoutes.map(r => r.chunkName)
    });
    
    for (const route of highPriorityRoutes) {
      await this.preloadRoute(route);
    }
  }
  
  private async preloadMediumPriorityRoutes() {
    const mediumPriorityRoutes = ROUTE_CONFIGS.filter(
      config => config.priority === 'medium'
    );
    
    logger.info('⚡ Iniciando precarga de rutas de prioridad media', {
      routes: mediumPriorityRoutes.map(r => r.chunkName)
    });
    
    for (const route of mediumPriorityRoutes) {
      await this.preloadRoute(route);
      // Pequeño delay entre precargas para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  private async preloadRoute(config: RouteConfig): Promise<void> {
    const routeKey = config.chunkName || config.path;
    
    if (this.preloadedRoutes.has(routeKey)) {
      return;
    }
    
    try {
      logger.info(`📦 Precargando ruta: ${routeKey}`);
      await config.component();
      this.preloadedRoutes.add(routeKey);
      logger.info(`✅ Ruta precargada exitosamente: ${routeKey}`);
    } catch (error) {
      logger.warn(`⚠️ Error precargando ruta: ${routeKey}`, {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  // Precargar ruta específica manualmente
  public async preloadSpecificRoute(path: string): Promise<void> {
    const config = ROUTE_CONFIGS.find(r => r.path === path);
    if (config) {
      await this.preloadRoute(config);
    }
  }
  
  // Obtener estadísticas de precarga
  public getPreloadStats() {
    const totalRoutes = ROUTE_CONFIGS.length;
    const preloadedCount = this.preloadedRoutes.size;
    
    return {
      total: totalRoutes,
      preloaded: preloadedCount,
      percentage: Math.round((preloadedCount / totalRoutes) * 100),
      preloadedRoutes: Array.from(this.preloadedRoutes)
    };
  }
}

// Hook para usar el manager
export function useCodeSplitting() {
  const manager = React.useMemo(() => CodeSplittingManager.getInstance(), []);
  
  const preloadRoute = React.useCallback(
    (path: string) => manager.preloadSpecificRoute(path),
    [manager]
  );
  
  const getStats = React.useCallback(
    () => manager.getPreloadStats(),
    [manager]
  );
  
  return { preloadRoute, getStats };
}

// Componentes lazy para componentes específicos (no rutas)
export const LazyComponents = {
  // Componentes de perfil - manejo seguro de imports
  ProfileCard: createLazyComponent(
    () => import('@/profiles/shared/MainProfileCard').then(module => ({ 
      default: (module as any).default || (module as any).MainProfileCard || module 
    })),
    { chunkName: 'profile-card', preload: true }
  ),
  
  // Componentes de chat - ChatRoom es el componente principal usado
  // ChatWindow eliminado - no se usaba realmente
  
  // Componentes de animación - manejo seguro de imports
  AnimationSettings: createLazyComponent(
    () => import('@/components/animations/AnimationSettings').then(module => ({ 
      default: (module as any).default || (module as any).AnimationSettings || module 
    })),
    { chunkName: 'animation-settings', preload: false }
  ),
  
  // Componentes de análisis - manejo seguro de imports
  ProfileAnalytics: createLazyComponent(
    () => import('@/profiles/shared/ProfileAnalytics').then(module => ({ 
      default: (module as any).default || (module as any).ProfileAnalytics || module 
    })),
    { chunkName: 'profile-analytics', preload: false }
  ),
  
  // Modales y diálogos - manejo seguro de imports
  WelcomeModal: createLazyComponent(
    () => import('@/components/WelcomeModal').then(module => ({ 
      default: (module as any).default || (module as any).WelcomeModal || module 
    })),
    { chunkName: 'welcome-modal', preload: false }
  ),
  
  SendRequestDialog: createLazyComponent(
    () => import('@/components/SendRequestDialog').then(module => ({ 
      default: (module as any).default || (module as any).SendRequestDialog || module 
    })),
    { chunkName: 'send-request-dialog', preload: false }
  )
};

// Exportar configuraciones para uso en App.tsx
export { ROUTE_CONFIGS };

export default CodeSplittingManager;
