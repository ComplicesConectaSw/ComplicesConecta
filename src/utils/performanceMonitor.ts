/**
 * Performance Monitor - Métricas en tiempo real
 * Monitorea Web Vitals y performance del bundle en producción
 */

import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
}

interface WebVitalsMetric extends PerformanceMetric {
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Inicializar monitoreo de performance
   */
  init(): void {
    if (typeof window === 'undefined') return;

    try {
      // Monitorear Web Vitals
      this.initWebVitals();
      
      // Monitorear recursos
      this.initResourceTiming();
      
      // Monitorear navegación
      this.initNavigationTiming();
      
      // Monitorear long tasks
      this.initLongTaskTiming();

      logger.info('🚀 Performance Monitor inicializado');
    } catch (error) {
      logger.error('❌ Error inicializando Performance Monitor:', { error });
    }
  }

  /**
   * Monitorear Web Vitals (CLS, FID, LCP)
   */
  private initWebVitals(): void {
    // Cumulative Layout Shift (CLS)
    this.observePerformance('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      if (clsValue > 0) {
        this.recordWebVital({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: Date.now(),
          url: window.location.href,
          id: 'cls',
          delta: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
        });
      }
    });

    // Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const lcpValue = lastEntry.startTime;
        this.recordWebVital({
          name: 'LCP',
          value: lcpValue,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href,
          id: 'lcp',
          delta: lcpValue,
          rating: lcpValue <= 2500 ? 'good' : lcpValue <= 4000 ? 'needs-improvement' : 'poor'
        });
      }
    });

    // First Input Delay (FID) - usando event timing
    this.observePerformance('first-input', (entries) => {
      const firstInput = entries[0];
      if (firstInput) {
        const fidValue = firstInput.processingStart - firstInput.startTime;
        this.recordWebVital({
          name: 'FID',
          value: fidValue,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href,
          id: 'fid',
          delta: fidValue,
          rating: fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs-improvement' : 'poor'
        });
      }
    });
  }

  /**
   * Monitorear timing de recursos
   */
  private initResourceTiming(): void {
    this.observePerformance('resource', (entries) => {
      for (const entry of entries) {
        const resource = entry as PerformanceResourceTiming;
        
        // Solo monitorear JS y CSS grandes
        if (resource.transferSize > 100000) { // >100KB
          this.recordMetric({
            name: 'Resource Load Time',
            value: resource.responseEnd - resource.requestStart,
            unit: 'ms',
            timestamp: Date.now(),
            url: resource.name
          });

          // Alertar sobre recursos muy grandes
          if (resource.transferSize > 500000) { // >500KB
            logger.warn('📦 Recurso grande detectado:', {
              url: resource.name,
              size: Math.round(resource.transferSize / 1024) + 'KB',
              loadTime: Math.round(resource.responseEnd - resource.requestStart) + 'ms'
            });
          }
        }
      }
    });
  }

  /**
   * Monitorear timing de navegación
   */
  private initNavigationTiming(): void {
    this.observePerformance('navigation', (entries) => {
      const nav = entries[0] as PerformanceNavigationTiming;
      if (nav) {
        // Time to First Byte (TTFB)
        const ttfb = nav.responseStart - nav.requestStart;
        this.recordMetric({
          name: 'TTFB',
          value: ttfb,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href
        });

        // DOM Content Loaded
        const dcl = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
        this.recordMetric({
          name: 'DOM Content Loaded',
          value: dcl,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href
        });

        // Load Complete
        const loadComplete = nav.loadEventEnd - nav.loadEventStart;
        this.recordMetric({
          name: 'Load Complete',
          value: loadComplete,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href
        });
      }
    });
  }

  /**
   * Monitorear long tasks (>50ms)
   */
  private initLongTaskTiming(): void {
    this.observePerformance('longtask', (entries) => {
      for (const entry of entries) {
        this.recordMetric({
          name: 'Long Task',
          value: entry.duration,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href
        });

        // Alertar sobre tareas muy largas
        if (entry.duration > 100) {
          logger.warn('⏱️ Long Task detectada:', {
            duration: Math.round(entry.duration) + 'ms',
            startTime: Math.round(entry.startTime) + 'ms'
          });
        }
      }
    });
  }

  /**
   * Observar tipos de performance
   */
  private observePerformance(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      logger.debug(`Performance observer no soportado: ${type}`);
    }
  }

  /**
   * Registrar métrica de Web Vital
   */
  private recordWebVital(metric: WebVitalsMetric): void {
    this.metrics.push(metric);
    
    logger.info(`📊 Web Vital - ${metric.name}:`, {
      value: Math.round(metric.value * 100) / 100,
      unit: metric.unit,
      rating: metric.rating
    });

    // Enviar a analytics si está en producción
    if (import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Registrar métrica general
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    logger.debug(`📈 Performance - ${metric.name}:`, {
      value: Math.round(metric.value * 100) / 100,
      unit: metric.unit
    });
  }

  /**
   * Enviar métricas a analytics
   */
  private sendToAnalytics(metric: WebVitalsMetric): void {
    try {
      // Enviar a Google Analytics 4 si está disponible
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating
        });
      }

      // Enviar a servicio personalizado
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          type: 'web-vital',
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: metric.url,
          timestamp: metric.timestamp,
          userAgent: navigator.userAgent
        });

        navigator.sendBeacon('/api/analytics/web-vitals', data);
      }
    } catch (error) {
      logger.debug('Error enviando métricas a analytics:', { error });
    }
  }

  /**
   * Obtener resumen de métricas
   */
  getMetricsSummary(): {
    webVitals: { [key: string]: WebVitalsMetric };
    performance: PerformanceMetric[];
    recommendations: string[];
  } {
    const webVitals: { [key: string]: WebVitalsMetric } = {};
    const performance: PerformanceMetric[] = [];
    const recommendations: string[] = [];

    // Separar Web Vitals de otras métricas
    for (const metric of this.metrics) {
      if ('rating' in metric) {
        webVitals[metric.name] = metric as WebVitalsMetric;
      } else {
        performance.push(metric);
      }
    }

    // Generar recomendaciones
    if (webVitals.CLS && webVitals.CLS.rating === 'poor') {
      recommendations.push('Optimizar Cumulative Layout Shift - revisar elementos que causan cambios de layout');
    }
    
    if (webVitals.LCP && webVitals.LCP.rating === 'poor') {
      recommendations.push('Optimizar Largest Contentful Paint - optimizar carga de imágenes y recursos críticos');
    }
    
    if (webVitals.FID && webVitals.FID.rating === 'poor') {
      recommendations.push('Optimizar First Input Delay - reducir JavaScript blocking y long tasks');
    }

    const longTasks = performance.filter(m => m.name === 'Long Task');
    if (longTasks.length > 5) {
      recommendations.push('Reducir Long Tasks - optimizar JavaScript y usar code splitting');
    }

    return { webVitals, performance, recommendations };
  }

  /**
   * Limpiar observers
   */
  destroy(): void {
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
    this.metrics = [];
  }
}

// Declarar gtag para TypeScript
declare global {
  function gtag(...args: any[]): void;
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;
