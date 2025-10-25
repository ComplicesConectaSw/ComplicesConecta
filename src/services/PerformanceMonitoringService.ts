/**
 * PerformanceMonitoringService - Sistema de monitoreo de performance
 * Monitorea tiempo de respuesta, consultas lentas y métricas de rendimiento
 */

import { logger } from '@/lib/logger';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface QueryPerformance {
  query: string;
  duration: number;
  rowsAffected?: number;
  cacheHit?: boolean;
  optimization?: string;
}

export interface PerformanceReport {
  totalOperations: number;
  averageResponseTime: number;
  slowQueries: QueryPerformance[];
  cacheHitRate: number;
  errorRate: number;
  recommendations: string[];
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryPerformance[] = [];
  private readonly MAX_METRICS = 1000; // Mantener solo las últimas 1000 métricas
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 segundo

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Registrar métrica de performance
   */
  recordMetric(operation: string, duration: number, success: boolean, error?: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      error,
      metadata
    };

    this.metrics.push(metric);

    // Mantener solo las últimas métricas
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log consultas lentas
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      logger.warn('🐌 Slow operation detected', {
        operation,
        duration: `${duration}ms`,
        threshold: `${this.SLOW_QUERY_THRESHOLD}ms`,
        metadata
      });
    }
  }

  /**
   * Registrar métrica de consulta específica
   */
  recordQuery(query: string, duration: number, rowsAffected?: number, cacheHit?: boolean, optimization?: string): void {
    const queryMetric: QueryPerformance = {
      query: this.sanitizeQuery(query),
      duration,
      rowsAffected,
      cacheHit,
      optimization
    };

    this.queryMetrics.push(queryMetric);

    // Mantener solo las últimas consultas
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }

    // Alertar sobre consultas lentas
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      logger.warn('🐌 Slow query detected', {
        query: this.sanitizeQuery(query),
        duration: `${duration}ms`,
        rowsAffected,
        cacheHit,
        optimization
      });
    }
  }

  /**
   * Generar reporte de performance
   */
  generateReport(timeframe: 'hour' | 'day' | 'week' = 'hour'): PerformanceReport {
    const now = new Date();
    const timeframeMs = this.getTimeframeMs(timeframe);
    const cutoffTime = new Date(now.getTime() - timeframeMs);

    // Filtrar métricas por timeframe
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= cutoffTime
    );

    const recentQueries = this.queryMetrics.filter(_q => 
      new Date().getTime() - timeframeMs <= Date.now()
    );

    // Calcular estadísticas
    const totalOperations = recentMetrics.length;
    const averageResponseTime = totalOperations > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations 
      : 0;

    const slowQueries = recentQueries.filter(q => q.duration > this.SLOW_QUERY_THRESHOLD);

    const cacheHits = recentQueries.filter(q => q.cacheHit).length;
    const cacheHitRate = recentQueries.length > 0 ? (cacheHits / recentQueries.length) * 100 : 0;

    const errors = recentMetrics.filter(m => !m.success).length;
    const errorRate = totalOperations > 0 ? (errors / totalOperations) * 100 : 0;

    // Generar recomendaciones
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      slowQueries: slowQueries.length,
      cacheHitRate,
      errorRate
    });

    return {
      totalOperations,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      recommendations
    };
  }

  /**
   * Decorador para medir tiempo de ejecución de funciones
   */
  measureExecution<T extends (...args: any[]) => any>(
    operation: string,
    fn: T,
    metadata?: Record<string, any>
  ): T {
    return ((...args: Parameters<T>) => {
      const startTime = performance.now();
      let success = true;
      let error: string | undefined;

      try {
        const result = fn(...args);
        
        // Si es una promesa, medir también su resolución
        if (result && typeof result.then === 'function') {
          return result
            .then((res: any) => {
              const duration = performance.now() - startTime;
              this.recordMetric(operation, duration, true, undefined, metadata);
              return res;
            })
            .catch((err: any) => {
              const duration = performance.now() - startTime;
              this.recordMetric(operation, duration, false, err.message, metadata);
              throw err;
            });
        }

        const duration = performance.now() - startTime;
        this.recordMetric(operation, duration, true, undefined, metadata);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        const duration = performance.now() - startTime;
        this.recordMetric(operation, duration, success, error, metadata);
        throw err;
      }
    }) as T;
  }

  /**
   * Limpiar métricas antiguas
   */
  cleanup(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= oneWeekAgo
    );
    
    this.queryMetrics = this.queryMetrics.filter(_q => 
      new Date().getTime() - 7 * 24 * 60 * 60 * 1000 <= Date.now()
    );

    logger.info('🧹 Performance metrics cleaned up', {
      metricsRemaining: this.metrics.length,
      queriesRemaining: this.queryMetrics.length
    });
  }

  /**
   * Obtener métricas en tiempo real
   */
  getRealTimeMetrics(): {
    operationsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  } {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= oneMinuteAgo
    );

    const recentQueries = this.queryMetrics.filter(_q => 
      new Date().getTime() - 60 * 1000 <= Date.now()
    );

    const operationsPerMinute = recentMetrics.length;
    const averageResponseTime = operationsPerMinute > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / operationsPerMinute 
      : 0;

    const errors = recentMetrics.filter(m => !m.success).length;
    const errorRate = operationsPerMinute > 0 ? (errors / operationsPerMinute) * 100 : 0;

    const cacheHits = recentQueries.filter(q => q.cacheHit).length;
    const cacheHitRate = recentQueries.length > 0 ? (cacheHits / recentQueries.length) * 100 : 0;

    return {
      operationsPerMinute,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Helpers privados
   */
  private getTimeframeMs(timeframe: 'hour' | 'day' | 'week'): number {
    switch (timeframe) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  private sanitizeQuery(query: string): string {
    // Remover información sensible de las consultas
    return query
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]')
      .substring(0, 200); // Limitar longitud
  }

  private generateRecommendations(stats: {
    averageResponseTime: number;
    slowQueries: number;
    cacheHitRate: number;
    errorRate: number;
  }): string[] {
    const recommendations: string[] = [];

    if (stats.averageResponseTime > 500) {
      recommendations.push('Considerar implementar más cache para reducir tiempo de respuesta');
    }

    if (stats.slowQueries > 5) {
      recommendations.push('Revisar y optimizar consultas lentas identificadas');
    }

    if (stats.cacheHitRate < 70) {
      recommendations.push('Mejorar estrategia de cache para aumentar hit rate');
    }

    if (stats.errorRate > 5) {
      recommendations.push('Investigar y corregir errores frecuentes');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance dentro de parámetros normales');
    }

    return recommendations;
  }
}

export const performanceMonitor = PerformanceMonitoringService.getInstance();
export default performanceMonitor;