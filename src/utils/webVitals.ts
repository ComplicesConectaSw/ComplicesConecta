// Monitoreo de Core Web Vitals - ComplicesConecta v3.3.0
import { Metric } from 'web-vitals';
import { logger } from '@/lib/logger';
import { safeGetItem, safeSetItem } from '@/utils/safeLocalStorage';

// Importación dinámica para evitar errores de build
const getWebVitals = async () => {
  try {
    // @ts-ignore - Módulo opcional, TypeScript puede quejarse si no está resuelto
    const webVitals = await import('web-vitals');
    
    // Definir la interfaz para web-vitals
    interface WebVitalsModule {
      getCLS?: (callback: (metric: any) => void) => void;
      getFID?: (callback: (metric: any) => void) => void;
      getFCP?: (callback: (metric: any) => void) => void;
      getLCP?: (callback: (metric: any) => void) => void;
      getTTFB?: (callback: (metric: any) => void) => void;
    }
    
    const vitalsModule = webVitals as WebVitalsModule;
    
    return {
      getCLS: vitalsModule.getCLS || (() => {}),
      getFID: vitalsModule.getFID || (() => {}),
      getFCP: vitalsModule.getFCP || (() => {}),
      getLCP: vitalsModule.getLCP || (() => {}),
      getTTFB: vitalsModule.getTTFB || (() => {})
    };
  } catch (error) {
    logger.warn('web-vitals not available', { error });
    return {
      getCLS: () => {},
      getFID: () => {},
      getFCP: () => {},
      getLCP: () => {},
      getTTFB: () => {}
    };
  }
};

export interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface WebVitalsConfig {
  enableLogging?: boolean;
  enableAnalytics?: boolean;
  apiEndpoint?: string;
  sampleRate?: number;
}

// Umbrales para Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
};

// Determinar rating basado en umbrales
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Formatear datos de métrica
const formatMetric = (metric: Metric): WebVitalsData => ({
  name: metric.name,
  value: metric.value,
  rating: getRating(metric.name, metric.value),
  delta: metric.delta,
  id: metric.id,
  timestamp: Date.now(),
  url: window.location.href,
  userAgent: navigator.userAgent
});

// Enviar métricas a analytics
const sendToAnalytics = async (data: WebVitalsData, config: WebVitalsConfig): Promise<void> => {
  if (!config.enableAnalytics || !config.apiEndpoint) return;
  
  // Sampling para reducir carga
  if (config.sampleRate && Math.random() > config.sampleRate) return;
  
  try {
    await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true
    });
  } catch (error) {
    logger.error('Failed to send web vitals data', { error });
  }
};

// Logger para desarrollo
const logMetric = (data: WebVitalsData): void => {
  const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
  logger.info(`${emoji} ${data.name}: ${data.value.toFixed(2)}ms (${data.rating})`, { metric: data });
};

// Clase principal para monitoreo
export class WebVitalsMonitor {
  private config: WebVitalsConfig;
  private metrics: Map<string, WebVitalsData> = new Map();

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      enableLogging: true,
      enableAnalytics: false,
      sampleRate: 1.0,
      ...config
    };
  }

  // Inicializar monitoreo
  public async init(): Promise<void> {
    const handleMetric = (metric: Metric) => {
      const data = formatMetric(metric);
      this.metrics.set(data.name, data);
      
      if (this.config.enableLogging) {
        logMetric(data);
      }
      
      if (this.config.enableAnalytics) {
        sendToAnalytics(data, this.config);
      }
      
      // Emitir evento personalizado
      window.dispatchEvent(new CustomEvent('webvital', { detail: data }));
    };

    try {
      // Importación dinámica para evitar errores de build
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await getWebVitals();
      
      // Registrar observadores para todas las métricas
      getCLS(handleMetric);
      getFID(handleMetric);
      getFCP(handleMetric);
      getLCP(handleMetric);
      getTTFB(handleMetric);
    } catch (error) {
      logger.error('Error loading web-vitals', { error });
    }
  }

  // Obtener métricas actuales
  public getMetrics(): WebVitalsData[] {
    return Array.from(this.metrics.values());
  }

  // Obtener métrica específica
  public getMetric(name: string): WebVitalsData | undefined {
    return this.metrics.get(name);
  }

  // Obtener resumen de performance
  public getPerformanceSummary(): {
    score: number;
    good: number;
    needsImprovement: number;
    poor: number;
    metrics: WebVitalsData[];
  } {
    const metrics = this.getMetrics();
    const good = metrics.filter(m => m.rating === 'good').length;
    const needsImprovement = metrics.filter(m => m.rating === 'needs-improvement').length;
    const poor = metrics.filter(m => m.rating === 'poor').length;
    
    const score = metrics.length > 0 ? (good / metrics.length) * 100 : 0;
    
    return {
      score: Math.round(score),
      good,
      needsImprovement,
      poor,
      metrics
    };
  }
}

// Instancia global del monitor
let globalMonitor: WebVitalsMonitor | null = null;

// Inicializar monitoreo global
export const initWebVitalsMonitoring = (config?: WebVitalsConfig): WebVitalsMonitor => {
  if (!globalMonitor) {
    globalMonitor = new WebVitalsMonitor(config);
    globalMonitor.init();
  }
  return globalMonitor;
};

// Hook para React
export const useWebVitals = () => {
  const monitor = globalMonitor || initWebVitalsMonitoring();
  
  return {
    getMetrics: () => monitor.getMetrics(),
    getMetric: (name: string) => monitor.getMetric(name),
    getSummary: () => monitor.getPerformanceSummary()
  };
};

// Utilidades adicionales
export const measureCustomMetric = (name: string, startTime: number): void => {
  const duration = performance.now() - startTime;
  const data: WebVitalsData = {
    name,
    value: duration,
    rating: duration < 1000 ? 'good' : duration < 2000 ? 'needs-improvement' : 'poor',
    delta: duration,
    id: `${name}-${Date.now()}`,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  logger.info(`Custom metric ${name}: ${duration.toFixed(2)}ms`, { metric: data });
  window.dispatchEvent(new CustomEvent('custommetric', { detail: data }));
};

// Medir tiempo de carga de componente
export const measureComponentLoad = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    measureCustomMetric(`component-${componentName}`, startTime);
  };
};

// Medir tiempo de navegación entre rutas
export const measureRouteChange = (from: string, to: string) => {
  const startTime = performance.now();
  
  return () => {
    measureCustomMetric(`route-${from}-to-${to}`, startTime);
  };
};

// Detectar problemas de performance
export const detectPerformanceIssues = (): string[] => {
  const issues: string[] = [];
  const summary = globalMonitor?.getPerformanceSummary();
  
  if (!summary) return issues;
  
  if (summary.score < 75) {
    issues.push('Overall performance score is below 75%');
  }
  
  summary.metrics.forEach(metric => {
    if (metric.rating === 'poor') {
      issues.push(`${metric.name} is in poor range: ${metric.value.toFixed(2)}`);
    }
  });
  
  return issues;
};

// Configuración de métricas realistas
interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  timestamp: number;
}

// Almacenamiento local de métricas
const metricsStorage: PerformanceMetrics[] = [];

// Función para almacenar métricas localmente
const _storeMetric = (metric: Partial<PerformanceMetrics>) => {
  const timestamp = Date.now();
  const storedMetric: PerformanceMetrics = {
    lcp: metric.lcp || 0,
    fid: metric.fid || 0,
    cls: metric.cls || 0,
    fcp: metric.fcp || 0,
    ttfb: metric.ttfb || 0,
    timestamp
  };
  
  metricsStorage.push(storedMetric);
  
  // Mantener solo las últimas 50 métricas
  if (metricsStorage.length > 50) {
    metricsStorage.shift();
  }
  
  // Guardar en localStorage para persistencia
  try {
    safeSetItem('webVitalsMetrics', metricsStorage.slice(-10), { validate: false, sanitize: true });
  } catch {
    logger.warn('No se pudo guardar métricas en localStorage');
  }
};

// Función para obtener métricas promedio
export const getAverageMetrics = (): PerformanceMetrics | null => {
  if (metricsStorage.length === 0) return null;
  
  const sum = metricsStorage.reduce((acc, metric) => ({
    lcp: acc.lcp + metric.lcp,
    fid: acc.fid + metric.fid,
    cls: acc.cls + metric.cls,
    fcp: acc.fcp + metric.fcp,
    ttfb: acc.ttfb + metric.ttfb,
    timestamp: 0
  }), { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0, timestamp: 0 });
  
  const count = metricsStorage.length;
  
  return {
    lcp: sum.lcp / count,
    fid: sum.fid / count,
    cls: sum.cls / count,
    fcp: sum.fcp / count,
    ttfb: sum.ttfb / count,
    timestamp: Date.now()
  };
};

// Función para obtener métricas desde localStorage
export const getStoredMetrics = (): PerformanceMetrics[] => {
  try {
    const stored = safeGetItem<PerformanceMetrics[]>('webVitalsMetrics', { validate: false, defaultValue: [] });
    return Array.isArray(stored) ? stored : [];
  } catch {
    logger.warn('No se pudieron cargar métricas desde localStorage');
    return [];
  }
};

export default {
  WebVitalsMonitor,
  initWebVitalsMonitoring,
  useWebVitals,
  measureCustomMetric,
  measureComponentLoad,
  measureRouteChange,
  detectPerformanceIssues,
  getAverageMetrics,
  getStoredMetrics
};
