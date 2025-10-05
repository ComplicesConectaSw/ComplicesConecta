import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CreateReportParams {
  reportedUserId?: string;
  reportedContentId?: string;
  contentType: 'profile' | 'story' | 'post' | 'message' | 'comment';
  reason: string;
  description?: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_content_id: string | null;
  content_type: string;
  reason: string;
  description?: string | null;
  status: string;
  severity?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  resolution_notes?: string | null;
  action_taken?: string | null;
  is_false_positive?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReportResponse {
  success: boolean;
  data?: Report;
  error?: string;
}

export interface ReportsListResponse {
  success: boolean;
  reports?: Report[];
  error?: string;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  accuracyRate: number;
}

export class ReportService {
  async createReport(params: CreateReportParams): Promise<ReportResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      if (!params.reportedUserId) {
        return { success: false, error: 'ID de usuario reportado es requerido' };
      }

      if (user.id === params.reportedUserId) {
        return { success: false, error: 'No puedes reportarte a ti mismo' };
      }

      // Crear reporte usando insert directo con tipos correctos
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: params.reportedUserId,
          reported_content_id: params.reportedContentId || params.reportedUserId,
          content_type: params.contentType,
          reason: params.reason,
          description: params.description || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating report:', error);
        return { success: false, error: 'Error al crear el reporte' };
      }

      logger.info('Report created successfully:', { reportId: data?.id });
      return { success: true, data };

    } catch (error) {
      logger.error('Unexpected error in createReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al crear el reporte' };
    }
  }

  async getUserReports(): Promise<ReportsListResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user reports:', error);
        return { success: false, error: 'Error al obtener los reportes' };
      }

      return { success: true, reports: data || [] };

    } catch (error) {
      logger.error('Unexpected error in getUserReports:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al obtener los reportes' };
    }
  }

  async getPendingReports(): Promise<ReportsListResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching pending reports:', error);
        return { success: false, error: 'Error al obtener reportes pendientes' };
      }

      return { success: true, reports: data || [] };

    } catch (error) {
      logger.error('Error in getPendingReports:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async resolveReport(reportId: string, action: 'warning' | 'suspension' | 'ban' | 'dismiss', notes?: string): Promise<ReportResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const status = action === 'dismiss' ? 'dismissed' : 'resolved';
      const actionTaken = action === 'dismiss' ? 'none' : action;

      const { data, error } = await supabase
        .from('reports')
        .update({
          status,
          action_taken: actionTaken,
          resolution_notes: notes,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        logger.error('Error resolving report:', error);
        return { success: false, error: 'Error al resolver el reporte' };
      }

      logger.info('Report resolved successfully:', { reportId, action });
      return { success: true, data };

    } catch (error) {
      logger.error('Unexpected error in resolveReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al resolver el reporte' };
    }
  }

  async getUserReportStats(): Promise<{ success: boolean; stats?: ReportStats; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Calcular estadísticas desde la tabla reports directamente
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('status')
        .eq('reporter_id', user.id);

      if (error) {
        logger.error('Error fetching user report stats:', error);
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      const reports = allReports || [];
      const stats: ReportStats = {
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        resolvedReports: reports.filter(r => r.status === 'resolved').length,
        dismissedReports: reports.filter(r => r.status === 'dismissed').length,
        accuracyRate: reports.length > 0 ? (reports.filter(r => r.status === 'resolved').length / reports.length) * 100 : 0
      };

      return { success: true, stats };

    } catch (error) {
      logger.error('Unexpected error in getUserReportStats:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al obtener estadísticas' };
    }
  }

  async getReportNotifications(): Promise<{ success: boolean; notifications?: unknown[]; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Usar notification_history como alternativa
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'report_update')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('Error fetching report notifications:', error);
        return { success: false, error: 'Error al obtener notificaciones' };
      }

      return { success: true, notifications: data || [] };

    } catch (error) {
      logger.error('Unexpected error in getReportNotifications:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al obtener notificaciones' };
    }
  }

  async isContentBlocked(contentId: string, contentType: string): Promise<{ success: boolean; isBlocked?: boolean; error?: string }> {
    try {
      // Verificar si hay reportes resueltos que indiquen contenido bloqueado
      const { data, error } = await supabase
        .from('reports')
        .select('id, status')
        .eq('reported_content_id', contentId)
        .eq('content_type', contentType)
        .eq('status', 'resolved');

      if (error) {
        logger.error('Error checking blocked content:', error);
        return { success: false, error: 'Error al verificar contenido bloqueado' };
      }

      const isBlocked = (data || []).length > 0;
      return { success: true, isBlocked };

    } catch (error) {
      logger.error('Unexpected error in isContentBlocked:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al verificar contenido' };
    }
  }

  async getReportStatistics(): Promise<{ success: boolean; stats?: Record<string, unknown>; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('reports')
        .select('status, content_type')
        .not('status', 'is', null);

      if (error) {
        logger.error('Error fetching report statistics:', error);
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((r: Record<string, unknown>) => r.status === 'pending').length || 0,
        resolved: data?.filter((r: Record<string, unknown>) => r.status === 'resolved').length || 0,
        dismissed: data?.filter((r: Record<string, unknown>) => r.status === 'dismissed').length || 0,
        byType: {
          profile: data?.filter((r: Record<string, unknown>) => r.content_type === 'profile').length || 0,
          message: data?.filter((r: Record<string, unknown>) => r.content_type === 'message').length || 0,
          media: data?.filter((r: Record<string, unknown>) => r.content_type === 'media').length || 0,
          other: data?.filter((r: Record<string, unknown>) => r.content_type === 'other').length || 0
        }
      };

      return { success: true, stats };

    } catch (error) {
      logger.error('Error in getReportStatistics:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }
}

export const reportService = new ReportService();
