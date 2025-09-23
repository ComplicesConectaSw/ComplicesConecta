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
  reported_user_id?: string;
  reported_content_id?: string;
  content_type: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action_taken?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  is_false_positive: boolean;
  created_at: string;
  updated_at: string;
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
}

export class ReportService {
  async createReport(params: CreateReportParams): Promise<ReportResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      if (user.id === params.reportedUserId) {
        return { success: false, error: 'No puedes reportarte a ti mismo' };
      }

      // Crear reporte usando insert directo con casting
      const { data, error } = await (supabase as any)
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: params.reportedUserId,
          content_type: params.contentType,
          reason: params.reason,
          description: params.description,
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

      const { data, error } = await (supabase as any)
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

      const { data, error } = await (supabase as any)
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

      const { data, error } = await (supabase as any)
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

      const { data, error } = await (supabase as any)
        .from('user_report_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching user report stats:', error);
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      const stats: ReportStats = {
        totalReports: data?.total_reports || 0,
        pendingReports: data?.pending_reports || 0,
        resolvedReports: data?.resolved_reports || 0,
        dismissedReports: data?.dismissed_reports || 0
      };

      return { success: true, stats };

    } catch (error) {
      logger.error('Unexpected error in getUserReportStats:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al obtener estadísticas' };
    }
  }

  async getReportNotifications(): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await (supabase as any)
        .from('report_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

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
      const { data, error } = await (supabase as any)
        .from('blocked_content')
        .select('id')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error checking blocked content:', error);
        return { success: false, error: 'Error al verificar contenido bloqueado' };
      }

      return { success: true, isBlocked: !!data };

    } catch (error) {
      logger.error('Unexpected error in isContentBlocked:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error inesperado al verificar contenido' };
    }
  }

  async getReportStatistics(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await (supabase as any)
        .from('reports')
        .select('status, content_type')
        .not('status', 'is', null);

      if (error) {
        logger.error('Error fetching report statistics:', error);
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((r: any) => r.status === 'pending').length || 0,
        resolved: data?.filter((r: any) => r.status === 'resolved').length || 0,
        dismissed: data?.filter((r: any) => r.status === 'dismissed').length || 0,
        byType: {
          profile: data?.filter((r: any) => r.content_type === 'profile').length || 0,
          message: data?.filter((r: any) => r.content_type === 'message').length || 0,
          media: data?.filter((r: any) => r.content_type === 'media').length || 0,
          other: data?.filter((r: any) => r.content_type === 'other').length || 0
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
