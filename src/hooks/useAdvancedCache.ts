import { useState, useEffect, useCallback, useRef } from 'react';
import { advancedCacheService, CacheConfig, CacheStats } from '@/services/AdvancedCacheService';
import { logger } from '@/lib/logger';

export interface UseAdvancedCacheOptions {
  key: string;
  ttl?: number;
  priority?: number;
  dependencies?: string[];
  tags?: string[];
  enablePredictiveCache?: boolean;
  enableAdaptiveTTL?: boolean;
  onCacheHit?: (data: any) => void;
  onCacheMiss?: () => void;
  onError?: (error: Error) => void;
}

export interface CacheState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  cacheStats: CacheStats | null;
  lastUpdated: number | null;
}

export function useAdvancedCache<T>(
  fetcher: () => Promise<T>,
  options: UseAdvancedCacheOptions
): CacheState<T> & {
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
  preload: () => Promise<void>;
  updateCache: (data: T) => Promise<void>;
} {
  const [state, setState] = useState<CacheState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isFromCache: false,
    cacheStats: null,
    lastUpdated: null
  });

  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  // Actualizar referencias cuando cambien
  useEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  }, [fetcher, options]);

  // Función para obtener datos
  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    const { key, ttl, priority: _priority = 1, dependencies: _dependencies = [], tags: _tags = [] } = optionsRef.current;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Intentar obtener desde cache si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = await advancedCacheService.get<T>(key);
        if (cachedData !== null) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isFromCache: true,
            lastUpdated: Date.now(),
            cacheStats: advancedCacheService.getStats()
          }));
          
          optionsRef.current.onCacheHit?.(cachedData);
          return;
        }
      }

      // Cache miss - obtener datos frescos
      optionsRef.current.onCacheMiss?.();
      const freshData = await fetcherRef.current();
      
      // Guardar en cache
      await advancedCacheService.set(key, freshData, ttl);
      
      setState(prev => ({
        ...prev,
        data: freshData,
        isLoading: false,
        isFromCache: false,
        lastUpdated: Date.now(),
        cacheStats: advancedCacheService.getStats()
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error fetching data:', { key, error: errorMessage });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        cacheStats: advancedCacheService.getStats()
      }));
      
      optionsRef.current.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, []);

  // Función para refrescar datos
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  // Función para invalidar cache
  const invalidate = useCallback(async (): Promise<void> => {
    const { key } = optionsRef.current;
    await advancedCacheService.delete(key);
    
    setState(prev => ({
      ...prev,
      data: null,
      isFromCache: false,
      cacheStats: advancedCacheService.getStats()
    }));
  }, []);

  // Función para pre-cargar datos
  const preload = useCallback(async (): Promise<void> => {
    const { key } = optionsRef.current;
    
    try {
      const cachedData = await advancedCacheService.get<T>(key);
      if (cachedData === null) {
        await fetchData();
      }
    } catch (error) {
      logger.error('Error preloading data:', { key, error: String(error) });
    }
  }, [fetchData]);

  // Función para actualizar cache manualmente
  const updateCache = useCallback(async (data: T): Promise<void> => {
    const { key, ttl } = optionsRef.current;
    
    try {
      await advancedCacheService.set(key, data, ttl);
      
      setState(prev => ({
        ...prev,
        data,
        isFromCache: true,
        lastUpdated: Date.now(),
        cacheStats: advancedCacheService.getStats()
      }));
    } catch (error) {
      logger.error('Error updating cache:', { key, error: String(error) });
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configurar cache predictivo si está habilitado
  useEffect(() => {
    const { enablePredictiveCache, key } = optionsRef.current;
    
    if (enablePredictiveCache) {
      // Simular patrón de acceso para predicción
      const accessPattern = [key];
      advancedCacheService.predictAndWarm(accessPattern);
    }
  }, []);

  return {
    ...state,
    refetch,
    invalidate,
    preload,
    updateCache
  };
}

// Hook para estadísticas del cache
export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null);

  const refreshStats = useCallback(() => {
    const currentStats = advancedCacheService.getStats();
    const analysis = advancedCacheService.getPerformanceAnalysis();
    
    setStats(currentStats);
    setPerformanceAnalysis(analysis);
  }, []);

  useEffect(() => {
    refreshStats();
    
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(refreshStats, 30000);
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  const optimizeCache = useCallback(async () => {
    await advancedCacheService.optimize();
    refreshStats();
  }, [refreshStats]);

  const clearCache = useCallback(async () => {
    await advancedCacheService.clear();
    refreshStats();
  }, [refreshStats]);

  const cleanupCache = useCallback(async () => {
    await advancedCacheService.cleanup();
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    performanceAnalysis,
    refreshStats,
    optimizeCache,
    clearCache,
    cleanupCache
  };
}

// Hook para configuración del cache
export function useCacheConfig() {
  const [config, setConfig] = useState<CacheConfig | null>(null);

  const updateConfig = useCallback((newConfig: Partial<CacheConfig>) => {
    advancedCacheService.updateConfig(newConfig);
    // TODO: Obtener configuración actual del servicio
    setConfig({ ...config, ...newConfig } as CacheConfig);
  }, [config]);

  const resetConfig = useCallback(() => {
    // TODO: Restaurar configuración por defecto
    logger.info('Cache config reset');
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
}

export default useAdvancedCache;
