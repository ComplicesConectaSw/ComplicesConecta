import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileReportService, CreateProfileReportParams } from '@/features/profile/ProfileReportService';
import type { User } from '@supabase/supabase-js';
import { testDebugger } from '@/utils/testDebugger';

// Mock Supabase client con cadenas de métodos completas
const mockSupabaseChain = {
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ 
        data: { id: 'report-123' }, 
        error: null 
      }))
    }))
  })),
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: { id: '1', stats: {} }, 
          error: null 
        })),
        gte: vi.fn(() => Promise.resolve({ 
          data: [], 
          error: null 
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ 
            data: [], 
            error: null 
          }))
        }))
      })),
      single: vi.fn(() => Promise.resolve({ 
        data: { id: '1', stats: {} }, 
        error: null 
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ 
          data: [], 
          error: null 
        }))
      }))
    }))
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: { id: 'report-123' }, 
          error: null 
        }))
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => mockSupabaseChain),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('ProfileReportService', () => {
  let service: ProfileReportService;

  beforeEach(() => {
    service = new ProfileReportService();
    vi.clearAllMocks();
  });

  describe('createProfileReport', () => {
    it('debería crear un reporte exitosamente', async () => {
      testDebugger.logTestStart('ProfileReportService - createProfileReport success');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock usuario autenticado
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
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

      // El mock ya está configurado globalmente con mockSupabaseChain

      const params: CreateProfileReportParams = {
        reportedUserId: 'reported-user-123',
        reason: 'harassment',
        description: 'Test description'
      };

      testDebugger.logSupabaseMock('insert', 'profile_reports', params);

      const result = await service.createProfileReport(params);

      testDebugger.logTestEnd('ProfileReportService - createProfileReport success', result.success, result);
      
      expect(result.success).toBe(true);
      expect(supabase!.auth.getUser).toHaveBeenCalled();
      expect(supabase!.from).toHaveBeenCalledWith('reports');
    });

    it('debería fallar si el usuario no está autenticado', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      } as any);

      const params: CreateProfileReportParams = {
        reportedUserId: 'reported-user-123',
        reason: 'harassment',
        description: 'Test description'
      };

      const result = await service.createProfileReport(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no autenticado');
    });

    it('debería fallar si el usuario intenta reportarse a sí mismo', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
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

      const params: CreateProfileReportParams = {
        reportedUserId: 'user-123', // Mismo usuario autenticado
        reason: 'harassment',
        description: 'Test description'
      };

      const result = await service.createProfileReport(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No puedes reportarte a ti mismo');
    });
  });

  describe('getProfileReportStats', () => {
    it('debería obtener estadísticas de reportes del usuario', async () => {
      // Arrange
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock auth.getUser
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          } 
        },
        error: null
      });

      // Mock multiple from() calls with different return values
      let callCount = 0;
      vi.mocked(supabase!.from).mockImplementation(() => {
        callCount++;
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: callCount === 1 ? [{id: '1'}, {id: '2'}] : [{id: '1'}],
                  error: null
                })
              })
            })
          })
        } as any;
      });

      // Act
      const result = await service.getProfileReportStats('test-user-id');

      // Assert
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(supabase!.from).toHaveBeenCalledWith('reports');
    });
  });

  describe('getPendingProfileReports', () => {
    it('debería obtener reportes de perfil pendientes', async () => {
      // Arrange
      const mockReports = [
        {
          id: '1',
          reported_user_id: 'user1',
          reporter_user_id: 'user2',
          reason: 'harassment',
          status: 'pending',
          description: 'Test report',
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase!.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockReports,
                error: null
              })
            })
          })
        })
      } as any);

      // Act
      const result = await service.getPendingProfileReports();

      // Assert
      expect(result.success).toBe(true);
      expect(result.reports).toEqual(mockReports);
      expect(supabase!.from).toHaveBeenCalledWith('reports');
    });
  });

  describe('getPendingProfileReports', () => {
    it('debería obtener reportes pendientes', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase!.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ id: '1', status: 'pending', content_type: 'profile' }],
                error: null
              })
            })
          })
        })
      } as any);

      const result = await service.getPendingProfileReports();

      expect(result.success).toBe(true);
      expect(typeof result).toBe('object');
    });
  });

  describe('resolveProfileReport', () => {
    it('debería resolver un reporte de perfil', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock auth.getUser
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
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

      vi.mocked(supabase!.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'report1', status: 'resolved' },
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await service.resolveProfileReport('report1', 'resolved');

      expect(result.success).toBe(true);
      expect(supabase!.from).toHaveBeenCalledWith('reports');
    });

    it('debería resolver un reporte de perfil con notas', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mock auth.getUser
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
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

      vi.mocked(supabase!.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'report-123', status: 'resolved', resolution_notes: 'Test notes' },
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await service.resolveProfileReport('report-123', 'resolved', 'Test notes');

      expect(result.success).toBe(true);
      expect(supabase!.from).toHaveBeenCalledWith('reports');
    });
  });

  describe('canUserReport', () => {
    it('debería verificar si el usuario puede reportar', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
        data: {
          user: {
            id: 'user1',
            email: 'user@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          }
        },
        error: null
      });

      const result = await service.canUserReport('user1');

      expect(supabase!.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });
});
