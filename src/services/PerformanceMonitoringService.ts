/**
 * =====================================================
 * PERFORMANCE MONITORING SERVICE
 * =====================================================
 * Servicio para monitorear y analizar el rendimiento de la aplicación
 * Fecha: 2025-10-28
 * Versión: v3.4.1
 * =====================================================
 */

import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'load' | 'interaction' | 'network' | 'memory' | 'custom';
  metadata?: Record<string, any>;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface PerformanceReport {
  period: string;
  metrics: PerformanceMetric[];
  summary: {
    avgLoadTime: number;
    avgInteractionTime: number;
    totalRequests: number;
    failedRequests: number;
    memoryUsage: number;
  };
  alerts: Array<{
    severity: 'warning' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    message: string;
  }>;
}

// =====================================================
// THRESHOLDS
// =====================================================

const DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'pageLoadTime', warning: 2000, critical: 4000, unit: 'ms' },
  { metric: 'timeToInteractive', warning: 3000, critical: 5000, unit: 'ms' },
  { metric: 'firstContentfulPaint', warning: 1500, critical: 3000, unit: 'ms' },
  { metric: 'largestContentfulPaint', warning: 2500, critical: 4000, unit: 'ms' },
  { metric: 'apiResponseTime', warning: 500, critical: 1000, unit: 'ms' },
  { metric: 'memoryUsage', warning: 100, critical: 200, unit: 'MB' }
];

// =====================================================
// SERVICE CLASS
// =====================================================

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = DEFAULT_THRESHOLDS;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Inicializar observadores de performance
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not available');
      return;
    }

    try {
      // Observer para navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              name: 'pageLoadTime',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              unit: 'ms',
              category: 'load'
            });
          }
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observer para paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            unit: 'ms',
            category: 'load'
          });
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observer para resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric({
              name: 'resourceLoadTime',
              value: resourceEntry.duration,
              unit: 'ms',
              category: 'network',
              metadata: {
                url: resourceEntry.name,
                type: resourceEntry.initiatorType
              }
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      logger.info('✅ Performance observers initialized');
    } catch (error) {
      logger.error('Error initializing performance observers:', { error: String(error) });
    }
  }

  /**
   * Registrar métrica personalizada
   */
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      id: `${metric.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);

    // Check thresholds
    this.checkThresholds(fullMetric);

    // Keep only last 1000 metrics to avoid memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    logger.debug('Metric recorded:', { metric: fullMetric });
  }

  /**
   * Verificar umbrales y generar alertas
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find((t) => t.metric === metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      logger.error(`🔴 CRITICAL: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.critical}${threshold.unit})`);
    } else if (metric.value >= threshold.warning) {
      logger.warn(`⚠️ WARNING: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.warning}${threshold.unit})`);
    }
  }

  /**
   * Obtener métricas filtradas
   */
  getMetrics(filter?: {
    category?: PerformanceMetric['category'];
    name?: string;
    since?: Date;
  }): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (filter?.category) {
      filtered = filtered.filter((m) => m.category === filter.category);
    }

    if (filter?.name) {
      filtered = filtered.filter((m) => m.name === filter.name);
    }

    if (filter?.since) {
      filtered = filtered.filter((m) => m.timestamp >= filter.since!);
    }

    return filtered;
  }

  /**
   * Generar reporte de performance
   */
  generateReport(periodMinutes: number = 60): PerformanceReport {
    const since = new Date(Date.now() - periodMinutes * 60 * 1000);
    const metrics = this.getMetrics({ since });

    // Calculate summary
    const loadMetrics = metrics.filter((m) => m.category === 'load');
    const networkMetrics = metrics.filter((m) => m.category === 'network');

    const avgLoadTime =
      loadMetrics.length > 0
        ? loadMetrics.reduce((sum, m) => sum + m.value, 0) / loadMetrics.length
        : 0;

    const avgInteractionTime =
      networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length
        : 0;

    // Calculate memory usage (if available)
    let memoryUsage = 0;
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    // Generate alerts
    const alerts: PerformanceReport['alerts'] = [];
    for (const metric of metrics) {
      const threshold = this.thresholds.find((t) => t.metric === metric.name);
      if (!threshold) continue;

      if (metric.value >= threshold.critical) {
        alerts.push({
          severity: 'critical',
          metric: metric.name,
          value: metric.value,
          threshold: threshold.critical,
          message: `${metric.name} exceeded critical threshold: ${metric.value}${metric.unit} >= ${threshold.critical}${threshold.unit}`
        });
      } else if (metric.value >= threshold.warning) {
        alerts.push({
          severity: 'warning',
          metric: metric.name,
          value: metric.value,
          threshold: threshold.warning,
          message: `${metric.name} exceeded warning threshold: ${metric.value}${metric.unit} >= ${threshold.warning}${threshold.unit}`
        });
      }
    }

    return {
      period: `Last ${periodMinutes} minutes`,
      metrics,
      summary: {
        avgLoadTime: Math.round(avgLoadTime),
        avgInteractionTime: Math.round(avgInteractionTime),
        totalRequests: networkMetrics.length,
        failedRequests: 0, // TODO: Track failed requests
        memoryUsage: Math.round(memoryUsage)
      },
      alerts
    };
  }

  /**
   * Limpiar métricas antiguas
   */
  clearMetrics(olderThanMinutes: number = 60): void {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    this.metrics = this.metrics.filter((m) => m.timestamp >= cutoff);
    logger.info(`✅ Cleared metrics older than ${olderThanMinutes} minutes`);
  }

  /**
   * Actualizar umbrales
   */
  updateThresholds(thresholds: PerformanceThreshold[]): void {
    this.thresholds = thresholds;
    logger.info('✅ Performance thresholds updated');
  }

  /**
   * Destruir observadores
   */
  destroy(): void {
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
    this.metrics = [];
    logger.info('✅ Performance monitoring service destroyed');
  }

  /**
   * Medir tiempo de ejecución de una función
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        category: 'custom',
        metadata: { ...metadata, success: true }
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        category: 'custom',
        metadata: { ...metadata, success: false, error: String(error) }
      });

      throw error;
    }
  }

  /**
   * Obtener estadísticas de Web Vitals
   */
  getWebVitals(): {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
  } {
    const vitals: any = {};

    const lcpMetric = this.metrics
      .filter((m) => m.name === 'largest-contentful-paint')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    const fcpMetric = this.metrics
      .filter((m) => m.name === 'first-contentful-paint')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (lcpMetric) vitals.lcp = lcpMetric.value;
    if (fcpMetric) vitals.fcp = fcpMetric.value;

    return vitals;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const performanceMonitoring = new PerformanceMonitoringService();
export default performanceMonitoring;
