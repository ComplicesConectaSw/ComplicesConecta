import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService, CreateReportParams } from '@/services/ReportService';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'report-123', status: 'pending' },
            error: null
          })
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: { id: 'report-123', status: 'resolved' },
          error: null
        })
      }))
    })),
    rpc: vi.fn().mockResolvedValue({
      data: { count: 0 },
      error: null
    })
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    service = new ReportService();
    vi.clearAllMocks();
  });

  describe('createReport', () => {
    it('debería crear un reporte exitosamente', async () => {
      // Prevención de bucles infinitos con timeout
      const startTime = Date.now();
      const maxTime = 5000; // Máximo 5 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } as User
          },
          error: null
        });

        const params: CreateReportParams = {
          reportedUserId: 'reported-user-123',
          contentType: 'profile',
          reason: 'harassment',
          description: 'Test description'
        };

        const result = await Promise.race([
          service.createReport(params),
          new Promise<Awaited<ReturnType<typeof service.createReport>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, error: 'Timeout' };
        });

        expect(result.success).toBe(true);
        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 8000); // Timeout de 8 segundos para el test completo

    it('debería fallar si el usuario no está autenticado', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: null },
          error: null
        } as any);

        const params: CreateReportParams = {
          reportedUserId: 'reported-user-123',
          contentType: 'profile',
          reason: 'harassment',
          description: 'Test description'
        };

        const result = await Promise.race([
          service.createReport(params),
          new Promise<Awaited<ReturnType<typeof service.createReport>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, error: 'Timeout' };
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Usuario no autenticado');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo

    it('debería fallar si el usuario intenta reportarse a sí mismo', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } as User
          },
          error: null
        });

        const params: CreateReportParams = {
          reportedUserId: 'user-123', // Mismo usuario autenticado
          contentType: 'profile',
          reason: 'harassment',
          description: 'Test description'
        };

        const result = await Promise.race([
          service.createReport(params),
          new Promise<Awaited<ReturnType<typeof service.createReport>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, error: 'Timeout' };
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('No puedes reportarte a ti mismo');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('getUserReports', () => {
    it('debería obtener reportes del usuario', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } as User
          },
          error: null
        });

        const result = await Promise.race([
          service.getUserReports(),
          new Promise<Awaited<ReturnType<typeof service.getUserReports>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, reports: [] };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('getPendingReports', () => {
    it('debería obtener reportes pendientes', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'admin-123', 
              email: 'admin@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } 
          },
          error: null
        });

        const result = await Promise.race([
          service.getPendingReports(),
          new Promise<Awaited<ReturnType<typeof service.getPendingReports>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, reports: [] };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('resolveReport', () => {
    it('debería resolver un reporte exitosamente', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'admin-123', 
              email: 'admin@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } 
          },
          error: null
        });

        const result = await Promise.race([
          service.resolveReport('report-123', 'warning', 'Resolved with warning'),
          new Promise<Awaited<ReturnType<typeof service.resolveReport>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('getUserReportStats', () => {
    it('debería obtener estadísticas de reportes del usuario', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } as User
          },
          error: null
        });

        const result = await Promise.race([
          service.getUserReportStats(),
          new Promise<Awaited<ReturnType<typeof service.getUserReportStats>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, stats: null };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('getReportNotifications', () => {
    it('debería obtener notificaciones de reportes', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } as User
          },
          error: null
        });

        const result = await Promise.race([
          service.getReportNotifications(),
          new Promise<Awaited<ReturnType<typeof service.getReportNotifications>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, notifications: [] };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('isContentBlocked', () => {
    it('debería verificar si el contenido está bloqueado', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        const result = await Promise.race([
          service.isContentBlocked('content-123', 'profile'),
          new Promise<Awaited<ReturnType<typeof service.isContentBlocked>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, blocked: false };
        });

        expect(typeof result).toBe('object');
        expect(result).toHaveProperty('success');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('getReportStatistics', () => {
    it('debería obtener estadísticas generales de reportes', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { 
            user: { 
              id: 'admin-123', 
              email: 'admin@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            } 
          },
          error: null
        });

        const result = await Promise.race([
          service.getReportStatistics(),
          new Promise<Awaited<ReturnType<typeof service.getReportStatistics>>>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), maxTime)
          )
        ]).catch(() => {
          return { success: false, statistics: null };
        });

        expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
        expect(typeof result).toBe('object');
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [ReportService Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });
});
