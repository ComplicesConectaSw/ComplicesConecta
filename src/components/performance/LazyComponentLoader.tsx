/**
 * Componente optimizado para lazy loading con fallbacks inteligentes
 * Implementa estrategias de carga progresiva y manejo de errores
 */

import React, { Suspense, ComponentType, ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  _errorFallback?: ReactNode;
  loadingText?: string;
  minLoadingTime?: number;
}

interface LazyComponentOptions {
  preload?: boolean;
  retryAttempts?: number;
  chunkName?: string;
}

// Loader optimizado con tiempo mínimo de carga para evitar flashes
const OptimizedLoader: React.FC<{ text?: string; minTime?: number }> = ({ 
  text = "Cargando...", 
  minTime = 300 
}) => {
  const [showLoader, setShowLoader] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), minTime);
    return () => clearTimeout(timer);
  }, [minTime]);

  if (!showLoader) return null;

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
        </div>
        <p className="text-white text-lg font-medium">{text}</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

// Error fallback optimizado
const ErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h2 className="text-white text-xl font-semibold">Error al cargar</h2>
      <p className="text-white/80 text-sm">
        Hubo un problema al cargar esta página. Por favor, intenta nuevamente.
      </p>
      {error && (
        <details className="text-white/60 text-xs mt-2">
          <summary className="cursor-pointer">Detalles técnicos</summary>
          <pre className="mt-2 p-2 bg-black/20 rounded text-left overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
      {retry && (
        <button
          onClick={retry}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
);

// Wrapper principal para lazy loading
export const LazyComponentLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback,
  _errorFallback,
  loadingText,
  minLoadingTime = 300
}) => {
  const defaultFallback = fallback || (
    <OptimizedLoader text={loadingText} minTime={minLoadingTime} />
  );

  const _defaultErrorFallback = ({ _error, _resetErrorBoundary }: any) => (
    <ErrorFallback />
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Función helper para crear componentes lazy con opciones avanzadas
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<T> {
  const { preload = false, retryAttempts = 3, chunkName } = options;

  // Crear el componente lazy con reintentos
  const LazyComponent = React.lazy(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        logger.info(`🔄 Cargando componente lazy (intento ${attempt}/${retryAttempts})`, {
          chunkName,
          attempt
        });
        
        const module = await importFn();
        
        logger.info('✅ Componente lazy cargado exitosamente', {
          chunkName,
          attempt
        });
        
        return module;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`❌ Error cargando componente lazy (intento ${attempt}/${retryAttempts})`, {
          chunkName,
          attempt,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
        
        if (attempt < retryAttempts) {
          // Esperar antes del siguiente intento (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    logger.error('💥 Falló la carga del componente lazy después de todos los intentos', {
      chunkName,
      error: lastError?.message
    });
    
    throw lastError || new Error('Failed to load lazy component');
  });

  // Precargar si se especifica
  if (preload) {
    // Precargar después de un pequeño delay para no bloquear la carga inicial
    setTimeout(() => {
      logger.info('🚀 Precargando componente lazy', { chunkName });
      importFn().catch(error => {
        logger.warn('⚠️ Error precargando componente lazy', {
          chunkName,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      });
    }, 2000);
  }

  return LazyComponent;
}

// Hook para precargar componentes lazy manualmente
export function usePreloadComponent(
  importFn: () => Promise<any>,
  condition: boolean = true
) {
  React.useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        importFn().catch(error => {
          logger.warn('⚠️ Error precargando componente', {
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [importFn, condition]);
}

// Componentes específicos para diferentes tipos de carga
export const PageLoader: React.FC<{ pageName?: string }> = ({ pageName }) => (
  <OptimizedLoader 
    text={pageName ? `Cargando ${pageName}...` : "Cargando página..."} 
    minTime={200}
  />
);

export const ComponentLoader: React.FC<{ componentName?: string }> = ({ componentName }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {componentName ? `Cargando ${componentName}...` : "Cargando..."}
      </p>
    </div>
  </div>
);

export const ModalLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center space-y-3">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="text-white text-sm">Preparando contenido...</p>
    </div>
  </div>
);

export default LazyComponentLoader;
