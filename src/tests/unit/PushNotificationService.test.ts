/**
 * Tests unitarios para PushNotificationService v3.3.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PushNotificationService } from '@/services/PushNotificationService'

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
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}))

// Mock del logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

describe('PushNotificationService', () => {
  let service: PushNotificationService

  beforeEach(() => {
    service = PushNotificationService.getInstance()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PushNotificationService.getInstance()
      const instance2 = PushNotificationService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('registerDeviceToken', () => {
    it('should register device token successfully', async () => {
      const result = await service.registerDeviceToken(
        'user123',
        'device_token_123',
        'android',
        { model: 'Test Device' }
      )
      
      expect(result.success).toBe(true)
      expect(result.token).toBeDefined()
    })
  })

  describe('getUserPreferences', () => {
    it('should get user notification preferences', async () => {
      const result = await service.getUserPreferences('user123')
      
      expect(result.success).toBe(true)
      expect(result.preferences).toBeDefined()
      expect(Array.isArray(result.preferences)).toBe(true)
    })
  })

  describe('updateUserPreferences', () => {
    it('should update notification preferences', async () => {
      const result = await service.updateUserPreferences(
        'user123',
        'report_resolved',
        true,
        'push',
        { sound: true }
      )
      
      expect(result.success).toBe(true)
    })
  })

  describe('sendReportNotification', () => {
    it('should send report resolution notification', async () => {
      const result = await service.sendReportNotification(
        'user123',
        'report123',
        'resolved'
      )
      
      expect(result.success).toBe(true)
    })
  })

  describe('sendTokenNotification', () => {
    it('should send token transaction notification', async () => {
      const result = await service.sendTokenNotification(
        'user123',
        'earn_referral',
        50,
        'CMPX'
      )
      
      expect(result.success).toBe(true)
    })
  })

  describe('createDefaultPreferences', () => {
    it('should create default preferences for new user', async () => {
      const result = await service.createDefaultPreferences('user123')
      
      expect(result.success).toBe(true)
    })
  })

  describe('getNotificationHistory', () => {
    it('should get notification history for user', async () => {
      const result = await service.getNotificationHistory('user123', 10)
      
      expect(result.success).toBe(true)
      expect(result.notifications).toBeDefined()
    })
  })
})
