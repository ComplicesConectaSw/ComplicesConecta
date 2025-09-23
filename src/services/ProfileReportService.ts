import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CreateProfileReportParams {
  reportedUserId: string;
  reason: 'harassment' | 'impersonation' | 'fake-profile' | 'fraud' | 'underage' | 'other';
  description?: string;
}

export interface ProfileReport {
  id: string;
  reported_user_id: string;
  reporter_user_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'confirmed';
  description?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_notes?: string;
  action_taken?: 'none' | 'warning' | 'temporary_suspension' | 'permanent_suspension';
}

export interface ProfileReportStats {
  userId: string;
  reportsMade: number;
  reportsReceived: number;
  recentReports: number;
  isBlocked: boolean;
  suspensionEndDate?: string;
}

class ProfileReportService {
  /**
   * Crear un reporte de perfil
   */
  async createProfileReport(params: CreateProfileReportParams): Promise<{ success: boolean; reportId?: string; error?: string }> {
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
        .from('profile_reports')
        .select('id')
        .eq('reporter_user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentReports && recentReports.length >= 5) {
        return { success: false, error: 'Has alcanzado el límite de reportes por día' };
      }

      // Verificar si ya reportó este perfil
      const { data: existingReport } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reporter_user_id', user.id)
        .eq('reported_user_id', params.reportedUserId)
        .eq('status', 'pending')
        .single();

      if (existingReport) {
        return { success: false, error: 'Ya has reportado este perfil' };
      }

      // Crear el reporte
      const { data, error } = await supabase
        .from('profile_reports')
        .insert({
          reported_user_id: params.reportedUserId,
          reporter_user_id: user.id,
          reason: params.reason,
          description: params.description || null,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating profile report:', { error: error.message });
        return { success: false, error: 'Error al crear el reporte' };
      }

      // Verificar si necesita bloqueo automático (≥3 reportes en 24h)
      await this.checkAutoBlock(params.reportedUserId);

      logger.info('Profile report created successfully:', { reportId: data.id });
      return { success: true, reportId: data.id };

    } catch (error) {
      logger.error('Error in createProfileReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Verificar si un perfil necesita bloqueo automático
   */
  private async checkAutoBlock(reportedUserId: string): Promise<void> {
    try {
      const { data: recentReports } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reported_user_id', reportedUserId)
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentReports && recentReports.length >= 3) {
        // Bloquear perfil temporalmente
        await supabase
          .from('profiles')
          .update({ 
            is_blocked: true,
            blocked_reason: 'Múltiples reportes pendientes de revisión',
            blocked_at: new Date().toISOString()
          })
          .eq('id', reportedUserId);

        // Crear notificación para el usuario
        await this.createBlockNotification(reportedUserId, 'temporary_block');
        
        logger.info('Profile auto-blocked due to multiple reports:', { userId: reportedUserId });
      }
    } catch (error) {
      logger.error('Error in checkAutoBlock:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Crear notificación para usuario bloqueado/desbloqueado
   */
  private async createBlockNotification(userId: string, type: 'temporary_block' | 'restored' | 'suspended'): Promise<void> {
    try {
      let title = '';
      let message = '';

      switch (type) {
        case 'temporary_block':
          title = 'Perfil bloqueado preventivamente';
          message = 'Tu perfil fue bloqueado preventivamente por reportes. Será revisado por nuestro equipo. Esto no implica automáticamente una violación de términos.';
          break;
        case 'restored':
          title = 'Perfil restaurado';
          message = 'Tu perfil fue restaurado tras revisión. No se detectó violación a las políticas.';
          break;
        case 'suspended':
          title = 'Perfil suspendido';
          message = 'Tu perfil fue suspendido por infringir nuestras políticas. Revisa los términos de servicio.';
          break;
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: 'profile_report',
          is_read: false
        });

    } catch (error) {
      logger.error('Error creating block notification:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Obtener reportes pendientes para moderadores
   */
  async getPendingProfileReports(limit = 50, offset = 0): Promise<{ success: boolean; reports?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar permisos de moderador/admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || !['admin', 'moderator'].includes(userRole.role)) {
        return { success: false, error: 'No tienes permisos para ver reportes' };
      }

      const { data, error } = await supabase
        .from('profile_reports')
        .select(`
          *,
          reported_user:profiles!profile_reports_reported_user_id_fkey(
            id, full_name, email, avatar_url, created_at
          ),
          reporter_user:profiles!profile_reports_reporter_user_id_fkey(
            id, full_name, email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching pending profile reports:', { error: error.message });
        return { success: false, error: 'Error al obtener reportes pendientes' };
      }

      return { success: true, reports: data };

    } catch (error) {
      logger.error('Error in getPendingProfileReports:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Resolver un reporte de perfil
   */
  async resolveProfileReport(
    reportId: string,
    action: 'dismiss' | 'confirm',
    actionTaken?: 'none' | 'warning' | 'temporary_suspension' | 'permanent_suspension',
    resolutionNotes?: string,
    suspensionDays?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar permisos
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || !['admin', 'moderator'].includes(userRole.role)) {
        return { success: false, error: 'No tienes permisos para resolver reportes' };
      }

      // Obtener información del reporte
      const { data: report, error: reportError } = await supabase
        .from('profile_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        return { success: false, error: 'Reporte no encontrado' };
      }

      // Actualizar el reporte
      const status = action === 'dismiss' ? 'dismissed' : 'confirmed';
      const { error: updateError } = await supabase
        .from('profile_reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          resolution_notes: resolutionNotes || null,
          action_taken: actionTaken || 'none'
        })
        .eq('id', reportId);

      if (updateError) {
        logger.error('Error updating profile report:', { error: updateError.message });
        return { success: false, error: 'Error al actualizar el reporte' };
      }

      // Aplicar acción al perfil reportado
      if (action === 'confirm' && actionTaken && actionTaken !== 'none') {
        await this.applyProfileAction(report.reported_user_id, actionTaken, suspensionDays);
      } else if (action === 'dismiss') {
        // Restaurar perfil si estaba bloqueado
        await this.restoreProfile(report.reported_user_id);
      }

      logger.info('Profile report resolved:', { reportId, action, actionTaken });
      return { success: true };

    } catch (error) {
      logger.error('Error in resolveProfileReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Aplicar acción disciplinaria a un perfil
   */
  private async applyProfileAction(
    userId: string, 
    action: 'warning' | 'temporary_suspension' | 'permanent_suspension',
    suspensionDays?: number
  ): Promise<void> {
    try {
      let updateData: any = {};
      let notificationType: 'restored' | 'suspended' = 'suspended';

      switch (action) {
        case 'warning':
          updateData = {
            is_blocked: false,
            blocked_reason: null,
            blocked_at: null,
            warning_count: supabase.raw('COALESCE(warning_count, 0) + 1')
          };
          notificationType = 'restored';
          break;
        
        case 'temporary_suspension': {
          const suspensionEnd = new Date();
          suspensionEnd.setDate(suspensionEnd.getDate() + (suspensionDays || 7));
          
          updateData = {
            is_blocked: true,
            blocked_reason: `Suspensión temporal por ${suspensionDays || 7} días`,
            blocked_at: new Date().toISOString(),
            suspension_end_date: suspensionEnd.toISOString()
          };
          break;
        }
        
        case 'permanent_suspension':
          updateData = {
            is_blocked: true,
            blocked_reason: 'Suspensión permanente',
            blocked_at: new Date().toISOString(),
            suspension_end_date: null
          };
          break;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      await this.createBlockNotification(userId, notificationType);

    } catch (error) {
      logger.error('Error applying profile action:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Restaurar un perfil (quitar bloqueo)
   */
  private async restoreProfile(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          is_blocked: false,
          blocked_reason: null,
          blocked_at: null,
          suspension_end_date: null
        })
        .eq('id', userId);

      await this.createBlockNotification(userId, 'restored');

    } catch (error) {
      logger.error('Error restoring profile:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Obtener estadísticas de reportes de un usuario
   */
  async getProfileReportStats(userId?: string): Promise<{ success: boolean; stats?: ProfileReportStats; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const targetUserId = userId || user.id;

      // Obtener reportes hechos por el usuario
      const { data: reportsMade } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reporter_user_id', targetUserId);

      // Obtener reportes recibidos por el usuario
      const { data: reportsReceived } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reported_user_id', targetUserId);

      // Obtener reportes recientes (últimas 24h)
      const { data: recentReports } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reporter_user_id', targetUserId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Verificar si el perfil está bloqueado
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked, suspension_end_date')
        .eq('id', targetUserId)
        .single();

      const stats: ProfileReportStats = {
        userId: targetUserId,
        reportsMade: reportsMade?.length || 0,
        reportsReceived: reportsReceived?.length || 0,
        recentReports: recentReports?.length || 0,
        isBlocked: profile?.is_blocked || false,
        suspensionEndDate: profile?.suspension_end_date || undefined
      };

      return { success: true, stats };

    } catch (error) {
      logger.error('Error in getProfileReportStats:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Verificar si un usuario puede reportar (no está limitado)
   */
  async canUserReport(userId?: string): Promise<{ success: boolean; canReport?: boolean; reason?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const targetUserId = userId || user.id;

      // Verificar reportes recientes
      const { data: recentReports } = await supabase
        .from('profile_reports')
        .select('id')
        .eq('reporter_user_id', targetUserId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentReports && recentReports.length >= 5) {
        return { 
          success: true, 
          canReport: false, 
          reason: 'Has alcanzado el límite diario de reportes' 
        };
      }

      // Verificar si el usuario está bloqueado
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', targetUserId)
        .single();

      if (profile?.is_blocked) {
        return { 
          success: true, 
          canReport: false, 
          reason: 'Tu cuenta está suspendida' 
        };
      }

      return { success: true, canReport: true };

    } catch (error) {
      logger.error('Error in canUserReport:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error interno del servidor' };
    }
  }
}

export const profileReportService = new ProfileReportService();
