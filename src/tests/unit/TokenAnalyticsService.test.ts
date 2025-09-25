/**
 * Tests unitarios para TokenAnalyticsService v3.3.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TokenAnalyticsService } from '../../services/TokenAnalyticsService'

// Mock de Supabase
const mockAnalyticsData = [
  {
    id: '1',
    period_type: 'daily',
    period_start: '2025-01-01T00:00:00Z',
    period_end: '2025-01-02T00:00:00Z',
    metrics: {
      totalSupply: { cmpx: 1000, gtk: 500 },
      circulatingSupply: { cmpx: 800, gtk: 400 },
      transactionVolume: { cmpx: 100, gtk: 50, count: 10 },
      stakingMetrics: { totalStaked: 200, activeStakers: 5, avgDuration: 30 },
      userMetrics: { activeUsers: 25, newUsers: 3 }
    }
  }
]

vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
        }))
      })),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn(() => Promise.resolve({ data: mockAnalyticsData, error: null })),
      gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}))

// Mock del logger
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

describe('TokenAnalyticsService', () => {
  let service: TokenAnalyticsService

  beforeEach(() => {
    service = TokenAnalyticsService.getInstance()
  })

  afterEach(() => {
    service.stopAutomaticAnalytics()
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = TokenAnalyticsService.getInstance()
      const instance2 = TokenAnalyticsService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateCurrentMetrics', () => {
    it('should generate current token metrics', async () => {
      const result = await service.generateCurrentMetrics()
      
      expect(result.success).toBe(true)
      expect(result.metrics).toBeDefined()
      
      if (result.metrics) {
        expect(result.metrics.totalSupply).toBeDefined()
        expect(result.metrics.circulatingSupply).toBeDefined()
        expect(result.metrics.transactionVolume).toBeDefined()
        expect(result.metrics.stakingMetrics).toBeDefined()
        expect(result.metrics.userMetrics).toBeDefined()
      }
    })
  })

  describe('saveAnalytics', () => {
    it('should save analytics for a period', async () => {
      const mockMetrics = {
        totalSupply: { cmpx: 1000, gtk: 500 },
        circulatingSupply: { cmpx: 800, gtk: 400 },
        transactionVolume: { cmpx: 100, gtk: 50, count: 10 },
        stakingMetrics: { totalStaked: 200, activeStakers: 5, avgDuration: 30 },
        userMetrics: { activeUsers: 25, newUsers: 3 }
      }

      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-02')

      const result = await service.saveAnalytics('daily', startDate, endDate, mockMetrics)
      
      expect(result.success).toBe(true)
      expect(result.analytics).toBeDefined()
    })
  })

  describe('getHistoricalAnalytics', () => {
    it('should get historical analytics', async () => {
      const result = await service.getHistoricalAnalytics('daily', 7)
      
      expect(result.success).toBe(true)
      expect(result.analytics).toBeDefined()
      expect(Array.isArray(result.analytics)).toBe(true)
    })
  })

  describe('generateAutomaticReport', () => {
    it('should generate automatic report', async () => {
      const result = await service.generateAutomaticReport('daily')
      
      expect(result.success).toBe(true)
      expect(result.report).toBeDefined()
      
      if (result.report) {
        expect(result.report.summary).toBeDefined()
        expect(result.report.trends).toBeDefined()
        expect(result.report.insights).toBeDefined()
        expect(Array.isArray(result.report.insights)).toBe(true)
      }
    })

    it('should not generate report if already generating', async () => {
      // Start first report
      const promise1 = service.generateAutomaticReport('daily')
      
      // Try to start second report immediately
      const result2 = await service.generateAutomaticReport('daily')
      
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('Ya se está generando')
      
      // Wait for first report to complete
      await promise1
    })
  })

  describe('automatic analytics', () => {
    it('should start and stop automatic analytics', () => {
      // Mock setInterval to prevent infinite loops in tests
      const mockSetInterval = vi.fn()
      const mockClearInterval = vi.fn()
      
      vi.stubGlobal('setInterval', mockSetInterval)
      vi.stubGlobal('clearInterval', mockClearInterval)
      
      expect(() => service.startAutomaticAnalytics(1)).not.toThrow()
      expect(mockSetInterval).toHaveBeenCalledTimes(1)
      
      expect(() => service.stopAutomaticAnalytics()).not.toThrow()
      
      // Restore original functions
      vi.unstubAllGlobals()
    })
  })
})
