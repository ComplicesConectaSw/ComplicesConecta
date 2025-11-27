/**
 * Performance Hook - Hook optimizado para performance
 * Implementa técnicas avanzadas de optimización de React
 */

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  logRenders: boolean;
  trackMemory: boolean;
  maxRenderCount: number;
}

/**
 * Hook para optimización de performance con métricas
 */
export const usePerformanceOptimization = (
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) => {
  const defaultConfig: PerformanceConfig = {
    enableMetrics: true,
    logRenders: false,
    trackMemory: false,
    maxRenderCount: 100
  };

  const finalConfig = { ...defaultConfig, ...config };
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderTimeRef = useRef(Date.now());

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = Date.now();
    renderCountRef.current += 1;
    
    const renderTime = startTime - lastRenderTimeRef.current;
    renderTimesRef.current.push(renderTime);
    
    // Mantener solo los últimos 10 renderizados
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current = renderTimesRef.current.slice(-10);
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setMetrics({
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      averageRenderTime
    });

    if (finalConfig.logRenders) {
      logger.info(`Render ${componentName}:`, {
        renderCount: renderCountRef.current,
        renderTime,
        averageRenderTime
      });
    }

    lastRenderTimeRef.current = startTime;

    // Limpiar métricas si se excede el máximo
    if (renderCountRef.current > finalConfig.maxRenderCount) {
      renderCountRef.current = 0;
      renderTimesRef.current = [];
    }
  });

  return {
    metrics,
    isHighRenderCount: renderCountRef.current > 20,
    shouldOptimize: renderCountRef.current > 10
  };
};

/**
 * Hook para debouncing de valores
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttling de funciones
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook para memoización de cálculos costosos
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: any[]
): T => {
  return useMemo(() => {
    const startTime = Date.now();
    const result = calculation();
    const endTime = Date.now();
    
    logger.info('Expensive calculation completed:', {
      duration: endTime - startTime,
      dependencies: dependencies.length
    });
    
    return result;
  }, dependencies);
};

/**
 * Hook para optimización de listas grandes
 */
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

/**
 * Hook para optimización de imágenes
 */
export const useImageOptimization = (src: string, options: {
  lazy?: boolean;
  placeholder?: string;
  errorFallback?: string;
} = {}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(options.placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageState('loaded');
      setCurrentSrc(src);
    };
    
    img.onerror = () => {
      setImageState('error');
      setCurrentSrc(options.errorFallback || '/placeholder.svg');
    };
    
    img.src = src;
  }, [src, options.errorFallback]);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setImageState('error');
    setCurrentSrc(options.errorFallback || '/placeholder.svg');
  }, [options.errorFallback]);

  return {
    src: currentSrc,
    state: imageState,
    isLoading: imageState === 'loading',
    isLoaded: imageState === 'loaded',
    isError: imageState === 'error',
    handleLoad,
    handleError,
    imgRef
  };
};

/**
 * Hook para optimización de formularios
 */
export const useFormOptimization = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: any
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    if (validationSchema && touched[field]) {
      try {
        validationSchema.pick({ [field]: true }).parse({ [field]: value });
        setErrors(prev => ({ ...prev, [field]: undefined }));
      } catch (error: any) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  }, [validationSchema, touched]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submit = useCallback(async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    reset,
    submit,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Hook para optimización de API calls
 */
export const useApiOptimization = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean;
    retryCount?: number;
    retryDelay?: number;
    cacheTime?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (!options.enabled) return;

    // Verificar caché
    const cacheKey = JSON.stringify(dependencies);
    const cached = cacheRef.current.get(cacheKey);
    
    if (cached && options.cacheTime && Date.now() - cached.timestamp < options.cacheTime) {
      setData(cached.data);
      return;
    }

    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      setRetryCount(0);
      
      // Guardar en caché
      cacheRef.current.set(cacheKey, { data: result, timestamp: Date.now() });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      setError(err as Error);
      
      // Retry logic
      if (retryCount < (options.retryCount || 0)) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          execute();
        }, options.retryDelay || 1000);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, dependencies, options, retryCount]);

  useEffect(() => {
    execute();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  return {
    data,
    loading,
    error,
    retryCount,
    refetch: execute
  };
};

/**
 * HOC para memoización de componentes
 */
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const OptimizedComponent = memo(Component);
  OptimizedComponent.displayName = `Optimized(${componentName})`;
  return OptimizedComponent;
};

export default {
  usePerformanceOptimization,
  useDebounce,
  useThrottle,
  useExpensiveCalculation,
  useVirtualizedList,
  useImageOptimization,
  useFormOptimization,
  useApiOptimization,
  withPerformanceOptimization
};
