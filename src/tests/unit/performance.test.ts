/**
 * Performance Tests - Tests para validar optimizaciones de performance
 * Valida que las optimizaciones implementadas funcionen correctamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { postsService } from '../../services/postsService';
import performanceMonitoring from '../../services/PerformanceMonitoringService';
import { TokenAnalyticsService } from '../../services/TokenAnalyticsService';

// Usar performanceMonitoring como performanceMonitor para compatibilidad con tests
const performanceMonitor = performanceMonitoring;

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Limpiar métricas antes de cada test
    performanceMonitor.cleanup();
  });

  afterEach(() => {
    // Limpiar después de cada test
    performanceMonitor.cleanup();
  });

  describe('PostsService - Feed Optimization', () => {
    it('should use cache for repeated requests', async () => {
      // Primera llamada - debe ir a la base de datos
      const start1 = performance.now();
      const result1 = await postsService.getFeed(0, 10);
      const _duration1 = performance.now() - start1;

      // Segunda llamada - debe usar cache
      const start2 = performance.now();
      const result2 = await postsService.getFeed(0, 10);
      const _duration2 = performance.now() - start2;

      // Verificar que los resultados son iguales
      expect(result1).toEqual(result2);
      
      // Verificar que tenemos resultados válidos
      expect(Array.isArray(result1)).toBe(true);
      expect(result1.length).toBeGreaterThan(0);

      // Verificar métricas de performance
      const metrics = performanceMonitor.getRealTimeMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });

    it('should complete feed requests within acceptable time', async () => {
      const start = performance.now();
      const result = await postsService.getFeed(0, 20);
      const duration = performance.now() - start;

      // Debe completarse en menos de 2 segundos
      expect(duration).toBeLessThan(2000);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle pagination efficiently', async () => {
      const pages = [0, 1, 2];
      const durations: number[] = [];

      for (const page of pages) {
        const start = performance.now();
        await postsService.getFeed(page, 10);
        const duration = performance.now() - start;
        durations.push(duration);
      }

      // Todas las páginas deben ser similares en tiempo
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      durations.forEach(duration => {
        expect(duration).toBeLessThan(avgDuration * 2); // No más del doble del promedio
      });
    });
  });

  describe('TokenAnalyticsService - Cache Optimization', () => {
    it('should cache metrics for subsequent requests', async () => {
      const analyticsService = TokenAnalyticsService.getInstance();

      // Primera llamada
      const start1 = performance.now();
      const result1 = await analyticsService.generateCurrentMetrics();
      const duration1 = performance.now() - start1;

      // Segunda llamada (debe usar cache)
      const start2 = performance.now();
      const result2 = await analyticsService.generateCurrentMetrics();
      const duration2 = performance.now() - start2;

      // Verificar que la segunda llamada fue más rápida
      expect(duration2).toBeLessThan(duration1);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should generate metrics within acceptable time', async () => {
      const analyticsService = TokenAnalyticsService.getInstance();
      
      const start = performance.now();
      const result = await analyticsService.generateCurrentMetrics();
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(3000); // Menos de 3 segundos
      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation metrics correctly', () => {
      // Simular operaciones
      performanceMonitor.recordMetric('test_operation', 100, true);
      performanceMonitor.recordMetric('test_operation', 200, false, 'Test error');
      performanceMonitor.recordMetric('test_operation', 150, true);

      const report = performanceMonitor.generateReport('hour');
      
      expect(report.totalOperations).toBe(3);
      expect(report.errorRate).toBeCloseTo(33.33, 1); // 1 de 3 operaciones falló
      expect(report.averageResponseTime).toBeCloseTo(150, 0); // (100+200+150)/3
    });

    it('should identify slow queries', () => {
      // Registrar consultas rápidas y lentas
      performanceMonitor.recordQuery('fast_query', 100, 10, false);
      performanceMonitor.recordQuery('slow_query', 1500, 100, false); // > 1000ms threshold
      performanceMonitor.recordQuery('another_fast_query', 200, 5, false);

      const report = performanceMonitor.generateReport('hour');
      
      expect(report.slowQueries).toHaveLength(1);
      expect(report.slowQueries[0].query).toBe('slow_query');
      expect(report.slowQueries[0].duration).toBe(1500);
    });

    it('should track cache hit rates', () => {
      // Registrar consultas con y sin cache
      performanceMonitor.recordQuery('query1', 100, 10, false); // No cache
      performanceMonitor.recordQuery('query2', 50, 10, true);   // Cache hit
      performanceMonitor.recordQuery('query3', 50, 10, true);   // Cache hit
      performanceMonitor.recordQuery('query4', 120, 10, false); // No cache

      const report = performanceMonitor.generateReport('hour');
      
      expect(report.cacheHitRate).toBeCloseTo(50, 0); // 2 de 4 consultas fueron cache hits
    });

    it('should generate meaningful recommendations', () => {
      // Simular métricas que requieren optimización
      performanceMonitor.recordMetric('slow_operation', 2000, true); // > 500ms
      performanceMonitor.recordQuery('slow_query', 1500, 100, false); // > 1000ms
      performanceMonitor.recordMetric('error_operation', 100, false, 'Test error');

      const report = performanceMonitor.generateReport('hour');
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some((r: string) => r.includes('cache'))).toBe(true);
      expect(report.recommendations.some((r: string) => r.toLowerCase().includes('optimizar'))).toBe(true);
    });
  });

  describe('Real-time Metrics', () => {
    it('should provide accurate real-time metrics', () => {
      // Registrar algunas operaciones
      performanceMonitor.recordMetric('op1', 100, true);
      performanceMonitor.recordMetric('op2', 200, true);
      performanceMonitor.recordMetric('op3', 150, false, 'Error');

      const realTimeMetrics = performanceMonitor.getRealTimeMetrics();
      
      expect(realTimeMetrics.operationsPerMinute).toBeGreaterThan(0);
      expect(realTimeMetrics.averageResponseTime).toBeGreaterThan(0);
      expect(realTimeMetrics.errorRate).toBeGreaterThan(0);
    });
  });

  describe('Performance Thresholds', () => {
    it('should meet performance requirements', async () => {
      const tests = [
        { operation: 'getFeed', maxTime: 2000 },
        { operation: 'generateMetrics', maxTime: 3000 },
        { operation: 'cacheHit', maxTime: 100 }
      ];

      for (const test of tests) {
        const start = performance.now();
        
        // Simular operación
        if (test.operation === 'getFeed') {
          await postsService.getFeed(0, 10);
        } else if (test.operation === 'generateMetrics') {
          const analyticsService = TokenAnalyticsService.getInstance();
          await analyticsService.generateCurrentMetrics();
        } else if (test.operation === 'cacheHit') {
          // Segunda llamada para cache hit
          await postsService.getFeed(0, 10);
        }
        
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(test.maxTime);
      }
    });
  });
});

describe('Integration Performance Tests', () => {
  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 5;
    const promises = [];

    const start = performance.now();
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(postsService.getFeed(i, 10));
    }

    const results = await Promise.all(promises);
    const totalDuration = performance.now() - start;

    // Verificar que todas las requests completaron
    expect(results).toHaveLength(concurrentRequests);
    results.forEach((result: any) => {
      expect(Array.isArray(result)).toBe(true);
    });

    // Verificar que el tiempo total es razonable
    expect(totalDuration).toBeLessThan(5000); // Menos de 5 segundos para 5 requests concurrentes
  });

  it('should maintain performance under load', async () => {
    const loadTests = 10;
    const durations: number[] = [];

    for (let i = 0; i < loadTests; i++) {
      const start = performance.now();
      await postsService.getFeed(i % 3, 10); // Rotar páginas
      const duration = performance.now() - start;
      durations.push(duration);
    }

    // Calcular estadísticas de performance
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    // Verificar que el rendimiento es consistente
    expect(avgDuration).toBeLessThan(2000); // Promedio menor a 2 segundos
    expect(maxDuration).toBeLessThan(avgDuration * 3); // Máximo no más de 3x el promedio
    expect(minDuration).toBeGreaterThan(0); // Mínimo mayor a 0
  });
});
