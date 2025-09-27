import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileReportService, CreateProfileReportParams } from '@/services/ProfileReportService';
import type { User } from '@supabase/supabase-js';
import { testDebugger } from '@/utils/testDebugger';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
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

      // Mock from chain for insert
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: 'report-123' },
        error: null
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const params: CreateProfileReportParams = {
        reportedUserId: 'reported-user-123',
        reason: 'harassment',
        description: 'Test description'
      };

      testDebugger.logSupabaseMock('insert', 'profile_reports', params);

      const result = await service.createProfileReport(params);

      testDebugger.logTestEnd('ProfileReportService - createProfileReport success', result.success, result);
      
      expect(result.success).toBe(true);
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('profile_reports');
    });

    it('debería fallar si el usuario no está autenticado', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
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
      const mockStats = {
        userId: 'test-user-id',
        reportsMade: 5,
        reportsReceived: 2,
        recentReports: 1,
        isBlocked: false
      };

      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockStats,
              error: null
            })
          })
        })
      } as any);

      // Act
      const result = await service.getProfileReportStats('test-user-id');

      // Assert
      expect(result.success).toBe(true);
      expect(result.stats).toEqual(mockStats);
      expect(supabase.from).toHaveBeenCalledWith('user_report_stats');
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
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReports,
              error: null
            })
          })
        })
      } as any);

      // Act
      const result = await service.getPendingProfileReports();

      // Assert
      expect(result.success).toBe(true);
      expect(result.reports).toEqual(mockReports);
      expect(supabase.from).toHaveBeenCalledWith('profile_reports');
    });
  });

  describe('getPendingProfileReports', () => {
    it('debería obtener reportes pendientes', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
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

      const result = await service.getPendingProfileReports();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('resolveProfileReport', () => {
    it('debería resolver un reporte de perfil', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      const result = await service.resolveProfileReport('report1', 'resolved', 'none');

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profile_reports');
    });

    it('debería resolver un reporte de perfil con notas', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      const result = await service.resolveProfileReport('report-123', 'resolved', 'Test notes');

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profile_reports');
    });
  });

  describe('canUserReport', () => {
    it('debería verificar si el usuario puede reportar', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
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

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });
});
