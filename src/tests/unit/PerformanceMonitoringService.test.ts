/**
 * Tests unitarios para PerformanceMonitoringService v3.3.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import performanceMonitoring from '@/services/PerformanceMonitoringService'
import '@/tests/mocks/performance';

// Usar performanceMonitoring como performanceMonitor para compatibilidad
const performanceMonitor = performanceMonitoring

// Mock del logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  }
}))

describe('PerformanceMonitoringService', () => {
  let service: typeof performanceMonitor

  beforeEach(() => {
    service = performanceMonitor
  })

  afterEach(() => {
    // La API no tiene cleanup, solo limpiamos los mocks
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
        service.recordMetric({
          name: 'response_time',
          value: 150,
          unit: 'ms',
          category: 'custom',
          metadata: { test: true }
        })
      }).not.toThrow()
    })

    it('should record error metric', () => {
      expect(() => {
        service.recordMetric({
          name: 'response_time_error',
          value: 150,
          unit: 'ms',
          category: 'custom',
          metadata: { error: 'Test error' }
        })
      }).not.toThrow()
    })
  })

  describe('generateReport', () => {
    it('should generate hourly report', () => {
      const report = service.generateReport(1) // 1 hora
      
      expect(report).toBeDefined()
      expect(report.period).toBeDefined()
      expect(report.metrics).toBeDefined()
      expect(report.summary).toBeDefined()
      expect(report.alerts).toBeDefined()
    })

    it('should generate daily report', () => {
      const report = service.generateReport(24) // 24 horas = 1 día
      
      expect(report).toBeDefined()
      expect(report.period).toBeDefined()
    })

    it('should generate weekly report', () => {
      const report = service.generateReport(168) // 168 horas = 1 semana
      
      expect(report).toBeDefined()
      expect(report.period).toBeDefined()
    })
  })

  describe('performance monitoring', () => {
    it('should track performance automatically', () => {
      // Record some metrics
      service.recordMetric({
        name: 'test_operation',
        value: 100,
        unit: 'ms',
        category: 'custom'
      })
      
      // Generate report
      const report = service.generateReport(1)
      
      expect(report.metrics).toBeDefined()
      expect(report.alerts).toBeDefined()
    })

    it('should provide recommendations via alerts', () => {
      // Record slow operations to trigger alerts
      service.recordMetric({
        name: 'slow_operation',
        value: 5000, // > 4000ms threshold
        unit: 'ms',
        category: 'load'
      })
      
      const report = service.generateReport(1)
      
      expect(report.alerts).toBeDefined()
      expect(Array.isArray(report.alerts)).toBe(true)
    })
  })
})