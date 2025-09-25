import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileReportService, CreateProfileReportParams } from '../../src/services/ProfileReportService';
import type { User } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
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
      // Mock usuario autenticado
      mockSupabase.auth.getUser.mockResolvedValue({
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
        reportedUserId: 'reported-user-123',
        reason: 'harassment',
        description: 'Test description'
      };

      const result = await service.createProfileReport(params);

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('debería fallar si el usuario no está autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

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
      mockSupabase.auth.getUser.mockResolvedValue({
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

      vi.mocked(mockSupabase.from).mockReturnValue({
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
      expect(mockSupabase.from).toHaveBeenCalledWith('user_report_stats');
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

      vi.mocked(mockSupabase.from).mockReturnValue({
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
      expect(mockSupabase.from).toHaveBeenCalledWith('profile_reports');
    });
  });

  describe('getPendingProfileReports', () => {
    it('debería obtener reportes pendientes', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
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

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('resolveProfileReport', () => {
    it('debería resolver un reporte de perfil', async () => {
      // Arrange
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      // Act
      const result = await service.resolveProfileReport('report1', 'resolved', 'none');

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('profile_reports');
    });

    it('debería resolver un reporte de perfil con notas', async () => {
      // Arrange
      const profileReportService = new ProfileReportService();
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      // Act
      const result = await profileReportService.resolveProfileReport('report-123', 'resolved', 'Test notes');

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('profile_reports');
    });
  });

  describe('canUserReport', () => {
    it('debería verificar si el usuario puede reportar', async () => {
      // Arrange
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

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });
});
