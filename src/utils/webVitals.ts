// Monitoreo de Core Web Vitals - ComplicesConecta v2.9.0
import type { Metric, ReportCallback } from 'web-vitals';

// Tipos para las funciones de web-vitals
type WebVitalsModule = {
  getCLS: (callback: ReportCallback) => void;
  getFID: (callback: ReportCallback) => void;
  getFCP: (callback: ReportCallback) => void;
  getLCP: (callback: ReportCallback) => void;
  getTTFB: (callback: ReportCallback) => void;
};

// Importación dinámica para evitar errores de build
const getWebVitals = async (): Promise<WebVitalsModule> => {
  try {
    const webVitals = await import('web-vitals');
    // Acceso seguro a las funciones con fallback
    const module = webVitals as Record<string, unknown>;
    return {
      getCLS: (typeof module.getCLS === 'function' ? module.getCLS : () => {}) as (callback: ReportCallback) => void,
      getFID: (typeof module.getFID === 'function' ? module.getFID : () => {}) as (callback: ReportCallback) => void,
      getFCP: (typeof module.getFCP === 'function' ? module.getFCP : () => {}) as (callback: ReportCallback) => void,
      getLCP: (typeof module.getLCP === 'function' ? module.getLCP : () => {}) as (callback: ReportCallback) => void,
      getTTFB: (typeof module.getTTFB === 'function' ? module.getTTFB : () => {}) as (callback: ReportCallback) => void
    };
  } catch (error) {
    console.warn('web-vitals not available:', error);
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
    console.error('Failed to send web vitals data:', error);
  }
};

// Logger para desarrollo
const logMetric = (data: WebVitalsData): void => {
  if (import.meta.env.DEV) {
    const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${data.name}: ${data.value.toFixed(2)}ms (${data.rating})`);
  }
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
      console.error('Error loading web-vitals:', error);
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
  
  if (import.meta.env.DEV) {
    console.log(`📊 Custom metric ${name}: ${duration.toFixed(2)}ms`);
  }
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

export default {
  WebVitalsMonitor,
  initWebVitalsMonitoring,
  useWebVitals,
  measureCustomMetric,
  measureComponentLoad,
  measureRouteChange,
  detectPerformanceIssues
};
