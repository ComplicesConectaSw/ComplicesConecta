/**
 * Tests unitarios para PerformanceMonitoringService v3.3.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PerformanceMonitoringService } from '@/services/PerformanceMonitoringService'

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        gte: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      }))
    }))
  }
}))

// Mock del logger
vi.mock('../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService

  beforeEach(() => {
    service = PerformanceMonitoringService.getInstance()
  })

  afterEach(() => {
    service.stopMonitoring()
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PerformanceMonitoringService.getInstance()
      const instance2 = PerformanceMonitoringService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('recordMetric', () => {
    it('should record a metric successfully', async () => {
      const result = await service.recordMetric('response_time', 150, 'ms', { test: true })
      
      expect(result.success).toBe(true)
      expect(result.metric).toBeDefined()
    })

    it('should handle metric recording errors', async () => {
      // Mock error response
      const mockSupabase = await import('@/integrations/supabase/client')
      vi.mocked(mockSupabase.supabase.from).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Test error' } }))
          }))
        }))
      } as any)

      const result = await service.recordMetric('response_time', 150, 'ms')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
    })
  })

  describe('collectCurrentMetrics', () => {
    it('should collect current system metrics', async () => {
      const metrics = await service.collectCurrentMetrics()
      
      expect(metrics).toBeDefined()
      expect(metrics.responseTime).toBeGreaterThan(0)
      expect(metrics.queryCount).toBeGreaterThanOrEqual(0)
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0)
      expect(metrics.activeUsers).toBeGreaterThanOrEqual(0)
      expect(metrics.tokenTransactions).toBeGreaterThanOrEqual(0)
      expect(metrics.reportActivity).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getMetrics', () => {
    it('should retrieve metrics by type', async () => {
      const result = await service.getMetrics('response_time', 24)
      
      expect(result.success).toBe(true)
      expect(result.metrics).toBeDefined()
      expect(Array.isArray(result.metrics)).toBe(true)
    })

    it('should retrieve all metrics when no type specified', async () => {
      const result = await service.getMetrics()
      
      expect(result.success).toBe(true)
      expect(result.metrics).toBeDefined()
    })
  })

  describe('getAggregatedStats', () => {
    it('should calculate aggregated statistics', async () => {
      const result = await service.getAggregatedStats(24)
      
      expect(result.success).toBe(true)
      expect(result.stats).toBeDefined()
    })
  })

  describe('monitoring', () => {
    it('should start and stop monitoring', () => {
      expect(() => service.startMonitoring(1)).not.toThrow()
      expect(() => service.stopMonitoring()).not.toThrow()
    })

    it('should not start monitoring if already active', () => {
      service.startMonitoring(1)
      
      // Should not throw when trying to start again
      expect(() => service.startMonitoring(1)).not.toThrow()
      
      service.stopMonitoring()
    })
  })
})
