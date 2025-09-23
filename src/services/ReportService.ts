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

export interface ModerationAction {
  id: string;
  report_id: string;
  moderator_id: string;
  action_type: string;
  duration_hours?: number;
  reason: string;
  is_automated: boolean;
  created_at: string;
}

export interface ReportNotification {
  id: string;
  user_id: string;
  report_id: string;
  notification_type: 'content_reported' | 'report_reviewed' | 'action_taken' | 'appeal_result';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserReportStats {
  user_id: string;
  reports_made: number;
  reports_received: number;
  false_reports_made: number;
  valid_reports_made: number;
  trust_score: number;
  is_flagged_reporter: boolean;
  last_report_at?: string;
  created_at: string;
  updated_at: string;
}

class ReportService {
  /**
   * Crear un nuevo reporte
   */
  async createReport(params: CreateReportParams): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario no se reporte a sí mismo
      if (params.reportedUserId === user.id) {
        return { success: false, error: 'No puedes reportarte a ti mismo' };
      }

      // Verificar límite de reportes por día (anti-spam)
      const { data: recentReports } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentReports && recentReports.length >= 10) {
        return { success: false, error: 'Has alcanzado el límite de reportes por día' };
      }

      // Crear el reporte usando la función RPC
      const { data, error } = await supabase.rpc('create_report', {
        p_reporter_id: user.id,
        p_content_type: params.contentType,
        p_reason: params.reason,
        p_reported_user_id: params.reportedUserId || null,
        p_reported_content_id: params.reportedContentId || null,
        p_description: params.description || null
      });

      if (error) {
        logger.error('Error creating report:', { error: error.message });
        return { success: false, error: 'Error al crear el reporte' };
      }

      logger.info('Report created successfully:', { reportId: data });
      return { success: true, reportId: data };

    } catch (error) {
      logger.error('Error in createReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Obtener reportes del usuario actual
   */
  async getUserReports(): Promise<{ success: boolean; reports?: Report[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user reports:', { error: error.message });
        return { success: false, error: 'Error al obtener reportes' };
      }

      return { success: true, reports: data as Report[] };

    } catch (error) {
      logger.error('Error in getUserReports:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Obtener reportes pendientes (solo para moderadores/admins)
   */
  async getPendingReports(limit = 50, offset = 0): Promise<{ success: boolean; reports?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario sea moderador o admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || !['admin', 'moderator'].includes(userRole.role)) {
        return { success: false, error: 'No tienes permisos para ver reportes' };
      }

      const { data, error } = await supabase.rpc('get_pending_reports', {
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        logger.error('Error fetching pending reports:', { error: error.message });
        return { success: false, error: 'Error al obtener reportes pendientes' };
      }

      return { success: true, reports: data };

    } catch (error) {
      logger.error('Error in getPendingReports:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Resolver un reporte (solo para moderadores/admins)
   */
  async resolveReport(
    reportId: string, 
    actionTaken: string, 
    resolutionNotes?: string, 
    isFalsePositive = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario sea moderador o admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || !['admin', 'moderator'].includes(userRole.role)) {
        return { success: false, error: 'No tienes permisos para resolver reportes' };
      }

      const { data, error } = await supabase.rpc('resolve_report', {
        p_report_id: reportId,
        p_moderator_id: user.id,
        p_action_taken: actionTaken,
        p_resolution_notes: resolutionNotes || null,
        p_is_false_positive: isFalsePositive
      });

      if (error) {
        logger.error('Error resolving report:', { error: error.message });
        return { success: false, error: 'Error al resolver el reporte' };
      }

      if (!data) {
        return { success: false, error: 'Reporte no encontrado' };
      }

      logger.info('Report resolved successfully:', { reportId });
      return { success: true };

    } catch (error) {
      logger.error('Error in resolveReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Obtener notificaciones de reportes del usuario
   */
  async getReportNotifications(): Promise<{ success: boolean; notifications?: ReportNotification[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('report_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error fetching report notifications:', { error: error.message });
        return { success: false, error: 'Error al obtener notificaciones' };
      }

      return { success: true, notifications: data as ReportNotification[] };

    } catch (error) {
      logger.error('Error in getReportNotifications:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await supabase
        .from('report_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error marking notification as read:', { error: error.message });
        return { success: false, error: 'Error al marcar notificación' };
      }

      return { success: true };

    } catch (error) {
      logger.error('Error in markNotificationAsRead:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Obtener estadísticas de reportes del usuario
   */
  async getUserReportStats(): Promise<{ success: boolean; stats?: UserReportStats; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('user_report_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error('Error fetching user report stats:', { error: error.message });
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      return { success: true, stats: data as UserReportStats };

    } catch (error) {
      logger.error('Error in getUserReportStats:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Verificar si un contenido está bloqueado
   */
  async isContentBlocked(contentId: string, contentType: string): Promise<{ success: boolean; isBlocked?: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blocked_content')
        .select('id')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error checking if content is blocked:', { error: error.message });
        return { success: false, error: 'Error al verificar contenido' };
      }

      return { success: true, isBlocked: !!data };

    } catch (error) {
      logger.error('Error in isContentBlocked:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Obtener estadísticas generales de reportes (para admins)
   */
  async getReportStatistics(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario sea admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        return { success: false, error: 'No tienes permisos para ver estadísticas' };
      }

      // Obtener estadísticas básicas
      const { data: totalReports } = await supabase
        .from('reports')
        .select('id', { count: 'exact' });

      const { data: pendingReports } = await supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      const { data: resolvedReports } = await supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('status', 'resolved');

      const { data: falsePositives } = await supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('is_false_positive', true);

      const stats = {
        totalReports: totalReports?.length || 0,
        pendingReports: pendingReports?.length || 0,
        resolvedReports: resolvedReports?.length || 0,
        falsePositives: falsePositives?.length || 0
      };

      return { success: true, stats };

    } catch (error) {
      logger.error('Error in getReportStatistics:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }
}

export const reportService = new ReportService();
