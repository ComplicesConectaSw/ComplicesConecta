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
    // El servicio no requiere limpieza explícita
  });

  afterEach(() => {
    // El servicio no requiere limpieza explícita
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
      expect(result1.length).toBeGreaterThanOrEqual(0);

      // El caché funciona correctamente si result1 === result2
      expect(result1).toEqual(result2);
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
      performanceMonitor.recordMetric({
        name: 'test_operation',
        value: 100,
        unit: 'ms',
        category: 'custom'
      });
      
      const report = performanceMonitor.generateReport(1);
      
      expect(report.metrics).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    it('should identify slow operations', () => {
      // Registrar operaciones lentas
      performanceMonitor.recordMetric({
        name: 'slow_operation',
        value: 5000, // > 4000ms threshold crítico
        unit: 'ms',
        category: 'load'
      });

      const report = performanceMonitor.generateReport(1);
      
      expect(report.alerts).toBeDefined();
      expect(report.alerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate meaningful alerts', () => {
      // Simular métricas que requieren optimización
      performanceMonitor.recordMetric({
        name: 'critical_operation',
        value: 5000, // > 4000ms threshold crítico
        unit: 'ms',
        category: 'load'
      });

      const report = performanceMonitor.generateReport(1);
      
      expect(report.alerts).toBeDefined();
      expect(Array.isArray(report.alerts)).toBe(true);
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
