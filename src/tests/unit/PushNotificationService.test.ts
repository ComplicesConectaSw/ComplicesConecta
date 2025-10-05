/**
 * Tests unitarios para PushNotificationService v3.3.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PushNotificationService } from '@/services/PushNotificationService'
import { testDebugger } from '@/utils/testDebugger'

// Mock de Supabase - FIXED: Return success: true in service responses
const mockSupabaseChain = {
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ 
        data: { id: '1', token: 'device_token_123' }, 
        error: null 
      }))
    }))
  })),
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ 
        data: [{ 
          id: '1', 
          user_id: 'user123',
          device_token: 'device_token_123',
          is_active: true,
          device_type: 'android'
        }], 
        error: null 
      }))
    }))
  })),
  upsert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ 
        data: { id: '1', token: 'device_token_123' }, 
        error: null 
      }))
    }))
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ 
        data: { id: '1' }, 
        error: null 
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'user_notification_preferences') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ 
              data: [{ 
                id: '1', 
                user_id: 'user123',
                notification_type: 'report_resolved',
                delivery_method: 'push',
                enabled: true
              }], 
              error: null 
            }))
          })),
          upsert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: { id: '1', enabled: true }, 
                error: null 
              }))
            }))
          })),
          insert: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: null 
          }))
        };
      }
      if (table === 'notification_history') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: { id: '1', status: 'pending' }, 
                error: null 
              }))
            }))
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ 
                  data: [{ id: '1', title: 'Test notification' }], 
                  error: null 
                }))
              }))
            }))
          }))
        };
      }
      return mockSupabaseChain;
    })
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
      testDebugger.logTestStart('PushNotificationService - registerDeviceToken');
      
      const result = await service.registerDeviceToken(
        'user123',
        'device_token_123',
        'android',
        { model: 'Test Device' }
      )
      
      testDebugger.logTestEnd('PushNotificationService - registerDeviceToken', result.success, result);
      
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
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user123', updated_at: new Date().toISOString() },
                error: null
              })
            })
          })
        })
      } as any)

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
      const service = PushNotificationService.getInstance()
      
      // Mock the private sendNotification method directly
      const sendNotificationSpy = vi.spyOn(service as any, 'sendNotification').mockResolvedValue({
        success: true,
        notification: { id: 'notification-1', status: 'sent' }
      })
      
      const result = await service.sendReportNotification(
        'user-123',
        'report-456',
        'resolved'
      )

      expect(result.success).toBe(true)
      expect(sendNotificationSpy).toHaveBeenCalledWith('user-123', 'report_resolved', expect.any(Object))
    })
  })

  describe('sendTokenNotification', () => {
    it('should send token transaction notification', async () => {
      const service = PushNotificationService.getInstance()
      
      // Mock the private sendNotification method directly
      const sendNotificationSpy = vi.spyOn(service as any, 'sendNotification').mockResolvedValue({
        success: true,
        notification: { id: 'notification-1', status: 'sent' }
      })
      
      const result = await service.sendTokenNotification(
        'user123',
        'earn_referral',
        50,
        'CMPX'
      )
      
      expect(result.success).toBe(true)
      expect(sendNotificationSpy).toHaveBeenCalledWith('user123', 'token_transaction', expect.any(Object))
    })
  })

  describe('createDefaultPreferences', () => {
    it('should create default preferences for new user', async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: 'user123', updated_at: new Date().toISOString() },
            error: null
          })
        })
      } as any)
      
      const result = await service.createDefaultPreferences('user123')
      
      expect(result.success).toBe(true)
    })
  })

  describe('getNotificationHistory', () => {
    it('should get notification history for user', async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ id: '1', title: 'Test notification', created_at: '2023-01-01' }],
                error: null
              })
            })
          })
        })
      } as any)
      
      const result = await service.getNotificationHistory('user123', 10)
      
      expect(result.success).toBe(true)
      expect(result.notifications).toBeDefined()
    })
  })
})
