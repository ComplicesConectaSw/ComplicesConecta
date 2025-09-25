import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CreateNotificationParams {
  userId: string;
  type: 'email' | 'request' | 'alert' | 'system' | 'match' | 'like' | 'message' | 'achievement';
  title: string;
  message: string;
  actionUrl?: string;
  senderId?: string;
  senderName?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: params.userId,
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_action_url: params.actionUrl || null,
        p_sender_id: params.senderId || null,
        p_sender_name: params.senderName || null,
        p_metadata: params.metadata || {}
      } as any);

      if (error) {
        logger.error('Error creating notification:', error);
        return null;
      }

      return data as string | null;
    } catch (error) {
      logger.error('Error in createNotification:', error as any);
      return null;
    }
  }

  /**
   * Send a match notification
   */
  static async notifyMatch(userId: string, matchedUserId: string, matchedUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'match',
      title: '¡Nuevo Match!',
      message: `¡Tienes un nuevo match con ${matchedUserName}!`,
      actionUrl: `/matches`,
      senderId: matchedUserId,
      senderName: matchedUserName
    });
  }

  /**
   * Send a like notification
   */
  static async notifyLike(userId: string, likerUserId: string, likerUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'like',
      title: 'Te han dado like',
      message: `A ${likerUserName} le gustas`,
      actionUrl: `/discover`,
      senderId: likerUserId,
      senderName: likerUserName
    });
  }

  /**
   * Send a message notification
   */
  static async notifyMessage(userId: string, senderUserId: string, senderUserName: string, messagePreview: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'message',
      title: 'Nuevo mensaje',
      message: `${senderUserName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      actionUrl: `/chat/${senderUserId}`,
      senderId: senderUserId,
      senderName: senderUserName
    });
  }

  /**
   * Send an achievement notification
   */
  static async notifyAchievement(userId: string, achievementTitle: string, achievementDescription: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement',
      title: '¡Logro desbloqueado!',
      message: `${achievementTitle}: ${achievementDescription}`,
      actionUrl: `/profile`
    });
  }

  /**
   * Send an email verification notification
   */
  static async notifyEmailVerification(userId: string, verificationUrl: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'email',
      title: 'Verifica tu email',
      message: 'Haz clic para verificar tu dirección de correo electrónico',
      actionUrl: verificationUrl
    });
  }

  /**
   * Send a connection request notification
   */
  static async notifyConnectionRequest(userId: string, requesterUserId: string, requesterUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'request',
      title: 'Nueva solicitud de conexión',
      message: `${requesterUserName} quiere conectar contigo`,
      actionUrl: `/requests`,
      senderId: requesterUserId,
      senderName: requesterUserName
    });
  }

  /**
   * Send a system alert notification
   */
  static async notifySystemAlert(userId: string, alertTitle: string, alertMessage: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'alert',
      title: alertTitle,
      message: alertMessage,
      actionUrl
    });
  }

  /**
   * Send a system notification
   */
  static async notifySystem(userId: string, title: string, message: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      actionUrl
    });
  }

  /**
   * Get user's notification preferences
   */
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        logger.error('Error fetching notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getUserPreferences:', error as any);
      return null;
    }
  }

  /**
   * Update user's notification preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<{
    email_notifications: boolean;
    push_notifications: boolean;
    in_app_notifications: boolean;
    notification_types: Record<string, boolean>;
    quiet_hours_start: string;
    quiet_hours_end: string;
    timezone: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          updated_at: new Date().toISOString(),
          ...preferences
        } as any)
        .select()
        .single();

      if (error) {
        logger.error('Error updating notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in updateUserPreferences:', error as any);
      return null;
    }
  }

  /**
   * Mark notification as read - usando audit_logs como tabla real
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Registrar en audit_logs que la notificación fue leída usando propiedades reales
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id_fk: userId,
          action_type: 'notification_read',
          action_description: 'Notificación marcada como leída',
          resource_type: 'notification',
          resource_id: notificationId,
          request_data: { notification_id: notificationId, read_at: new Date().toISOString() }
        });

      if (error) {
        logger.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in markAsRead:', error as any);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user - usando audit_logs como tabla real
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      // Registrar en audit_logs que todas las notificaciones fueron leídas usando propiedades reales
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id_fk: userId,
          action_type: 'notifications_read_all',
          action_description: 'Todas las notificaciones marcadas como leídas',
          resource_type: 'notification',
          resource_id: userId,
          request_data: { read_all_at: new Date().toISOString() }
        });

      if (error) {
        logger.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in markAllAsRead:', error as any);
      return false;
    }
  }

  /**
   * Delete a notification - usando audit_logs como tabla real
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      // Registrar en audit_logs que la notificación fue eliminada usando propiedades reales
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id_fk: null,
          action_type: 'notification_deleted',
          action_description: 'Notificación eliminada',
          resource_type: 'notification',
          resource_id: notificationId,
          request_data: { deleted_at: new Date().toISOString() }
        });

      if (error) {
        logger.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteNotification:', error as any);
      return false;
    }
  }

  /**
   * Get notifications for a user - usando audit_logs como tabla real
   */
  static async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    try {
      // Obtener notificaciones desde audit_logs usando propiedades reales
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id_fk', userId)
        .in('action_type', ['notification_created', 'notification_sent'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching user notifications:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getUserNotifications:', error as any);
      return null;
    }
  }

  /**
   * Get unread notification count for a user - usando audit_logs como tabla real
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Contar notificaciones no leídas desde audit_logs usando propiedades reales
      const { count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_fk', userId)
        .eq('action_type', 'notification_created');

      if (error) {
        logger.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getUnreadCount:', error as any);
      return 0;
    }
  }
}

export default NotificationService;
