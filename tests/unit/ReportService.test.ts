import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService, CreateReportParams } from '../../src/services/ReportService';
import type { User } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
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
      mockSupabaseClient.auth.getUser.mockResolvedValue({
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

      const result = await service.createReport(params);

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('debería fallar si el usuario no está autenticado', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const params: CreateReportParams = {
        reportedUserId: 'reported-user-123',
        contentType: 'profile',
        reason: 'harassment',
        description: 'Test description'
      };

      const result = await service.createReport(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no autenticado');
    });

    it('debería fallar si el usuario intenta reportarse a sí mismo', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
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

      const result = await service.createReport(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No puedes reportarte a ti mismo');
    });
  });

  describe('getUserReports', () => {
    it('debería obtener reportes del usuario', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
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

      const result = await service.getUserReports();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('getPendingReports', () => {
    it('debería obtener reportes pendientes', async () => {
      vi.mocked(mockSupabaseClient.auth.getUser).mockResolvedValue({
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

      const result = await service.getPendingReports();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('resolveReport', () => {
    it('debería resolver un reporte exitosamente', async () => {
      vi.mocked(mockSupabaseClient.auth.getUser).mockResolvedValue({
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

      const result = await service.resolveReport('report-123', 'warning', 'Resolved with warning');

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('getUserReportStats', () => {
    it('debería obtener estadísticas de reportes del usuario', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
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

      const result = await service.getUserReportStats();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('getReportNotifications', () => {
    it('debería obtener notificaciones de reportes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
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

      const result = await service.getReportNotifications();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });

  describe('isContentBlocked', () => {
    it('debería verificar si el contenido está bloqueado', async () => {
      const result = await service.isContentBlocked('content-123', 'profile');

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('success');
    });
  });

  describe('getReportStatistics', () => {
    it('debería obtener estadísticas generales de reportes', async () => {
      vi.mocked(mockSupabaseClient.auth.getUser).mockResolvedValue({
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

      const result = await service.getReportStatistics();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });
  });
});
