/**
 * Tests unitarios para PerformanceMonitoringService v3.3.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { performanceMonitor } from '@/services/PerformanceMonitoringService'

// Mock del logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

describe('PerformanceMonitoringService', () => {
  let service: typeof performanceMonitor

  beforeEach(() => {
    service = performanceMonitor
  })

  afterEach(() => {
    service.cleanup()
    vi.clearAllMocks()
  })

  describe('instance', () => {
    it('should return singleton instance', () => {
      expect(service).toBeDefined()
      expect(typeof service).toBe('object')
    })
  })

  describe('recordMetric', () => {
    it('should record a metric successfully', () => {
      expect(() => {
        service.recordMetric('response_time', 150, true, undefined, { test: true })
      }).not.toThrow()
    })

    it('should record error metric', () => {
      expect(() => {
        service.recordMetric('response_time', 150, false, 'Test error')
      }).not.toThrow()
    })
  })

  describe('recordQuery', () => {
    it('should record query performance', () => {
      expect(() => {
        service.recordQuery('SELECT * FROM users', 50, 100, true, 'index_used')
      }).not.toThrow()
    })

    it('should record slow query', () => {
      expect(() => {
        service.recordQuery('SELECT * FROM users', 2000, 1000, false, 'no_index')
      }).not.toThrow()
    })
  })

  describe('generateReport', () => {
    it('should generate hourly report', () => {
      const report = service.generateReport('hour')
      
      expect(report).toBeDefined()
      expect(report.totalOperations).toBeGreaterThanOrEqual(0)
      expect(report.averageResponseTime).toBeGreaterThanOrEqual(0)
      expect(report.slowQueries).toBeDefined()
      expect(report.cacheHitRate).toBeGreaterThanOrEqual(0)
      expect(report.errorRate).toBeGreaterThanOrEqual(0)
      expect(report.recommendations).toBeDefined()
    })

    it('should generate daily report', () => {
      const report = service.generateReport('day')
      
      expect(report).toBeDefined()
      expect(report.totalOperations).toBeGreaterThanOrEqual(0)
    })

    it('should generate weekly report', () => {
      const report = service.generateReport('week')
      
      expect(report).toBeDefined()
      expect(report.totalOperations).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getRealTimeMetrics', () => {
    it('should get real-time metrics', () => {
      const metrics = service.getRealTimeMetrics()
      
      expect(metrics).toBeDefined()
      expect(metrics.operationsPerMinute).toBeGreaterThanOrEqual(0)
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0)
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0)
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('cleanup', () => {
    it('should cleanup metrics', () => {
      expect(() => service.cleanup()).not.toThrow()
    })
  })

  describe('performance monitoring', () => {
    it('should track performance automatically', () => {
      // Record some metrics
      service.recordMetric('test_operation', 100, true)
      service.recordQuery('SELECT * FROM test', 50, 10, true)
      
      // Generate report
      const report = service.generateReport('hour')
      
      expect(report.totalOperations).toBeGreaterThan(0)
      expect(report.slowQueries.length).toBeGreaterThanOrEqual(0)
    })

    it('should provide recommendations', () => {
      // Record slow operations to trigger recommendations
      service.recordMetric('slow_operation', 1000, true)
      service.recordQuery('SELECT * FROM large_table', 2000, 1000, false)
      
      const report = service.generateReport('hour')
      
      expect(report.recommendations).toBeDefined()
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })
})