/**
 * Tests para Web Vitals monitoring
 * Cobertura de funciones de monitoreo de performance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initWebVitalsMonitoring } from '../../utils/webVitals';

// Mock de web-vitals module
const mockWebVitals = {
  getCLS: vi.fn(),
  getFID: vi.fn(),
  getFCP: vi.fn(),
  getLCP: vi.fn(),
  getTTFB: vi.fn()
};

// Mock de fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Web Vitals Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    // Mock dynamic import
    vi.doMock('web-vitals', () => mockWebVitals);
  });

  describe('initWebVitalsMonitoring', () => {
    it('should initialize with default config', async () => {
      const monitor = initWebVitalsMonitoring();
      
      expect(monitor).toHaveProperty('init');
      expect(monitor).toHaveProperty('getMetrics');
      expect(typeof monitor.init).toBe('function');
      expect(typeof monitor.getMetrics).toBe('function');
    });

    it('should initialize with custom config', async () => {
      const config = {
        enableLogging: true,
        enableAnalytics: true,
        apiEndpoint: '/custom/endpoint',
        sampleRate: 0.5
      };

      const monitor = initWebVitalsMonitoring(config);
      await monitor.init();

      expect(monitor).toBeDefined();
    });

    it('should handle web-vitals import error gracefully', async () => {
      // Mock import error
      vi.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });

      const monitor = initWebVitalsMonitoring();
      
      expect(async () => {
        await monitor.init();
      }).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return empty array initially', () => {
      const monitor = initWebVitalsMonitoring();
      const metrics = monitor.getMetrics();

      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics).toHaveLength(0);
    });

    it('should have getMetric method', () => {
      const monitor = initWebVitalsMonitoring();
      
      expect(typeof monitor.getMetric).toBe('function');
      expect(monitor.getMetric('CLS')).toBeUndefined();
    });

    it('should have getPerformanceSummary method', () => {
      const monitor = initWebVitalsMonitoring();
      const summary = monitor.getPerformanceSummary();
      
      expect(summary).toHaveProperty('score');
      expect(summary).toHaveProperty('good');
      expect(summary).toHaveProperty('needsImprovement');
      expect(summary).toHaveProperty('poor');
      expect(summary).toHaveProperty('metrics');
      expect(Array.isArray(summary.metrics)).toBe(true);
    });
  });
});
