import { supabase } from '@/integrations/supabase/client';

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
      const notificationData = {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        sender_id: params.senderId || null,
        sender_name: params.senderName || null,
        metadata: params.metadata || null,
        read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  /**
   * Notify user about a new match
   */
  static async notifyMatch(userId: string, matchedUserId: string, matchedUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'match',
      title: '¡Nuevo Match! 💕',
      message: `Tienes un nuevo match con ${matchedUserName}`,
      actionUrl: `/profile/${matchedUserId}`,
      senderId: matchedUserId,
      senderName: matchedUserName,
      metadata: { match_type: 'mutual_like' }
    });
  }

  /**
   * Notify user about a new like
   */
  static async notifyLike(userId: string, likerUserId: string, likerUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'like',
      title: '¡Alguien te dio Like! ❤️',
      message: `${likerUserName} mostró interés en tu perfil`,
      actionUrl: `/profile/${likerUserId}`,
      senderId: likerUserId,
      senderName: likerUserName,
      metadata: { like_type: 'profile_like' }
    });
  }

  /**
   * Notify user about a new message
   */
  static async notifyMessage(userId: string, senderUserId: string, senderUserName: string, messagePreview: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'message',
      title: `Nuevo mensaje de ${senderUserName}`,
      message: messagePreview,
      actionUrl: `/chat/${senderUserId}`,
      senderId: senderUserId,
      senderName: senderUserName,
      metadata: { message_preview: messagePreview }
    });
  }

  /**
   * Notify user about an achievement
   */
  static async notifyAchievement(userId: string, achievementTitle: string, achievementDescription: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement',
      title: `¡Logro desbloqueado! 🏆`,
      message: `${achievementTitle}: ${achievementDescription}`,
      actionUrl: '/achievements',
      metadata: { achievement_title: achievementTitle }
    });
  }

  /**
   * Notify user about email verification
   */
  static async notifyEmailVerification(userId: string, verificationUrl: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'email',
      title: 'Verifica tu email',
      message: 'Por favor verifica tu dirección de email para completar tu registro',
      actionUrl: verificationUrl,
      metadata: { verification_type: 'email' }
    });
  }

  /**
   * Notify user about a connection request
   */
  static async notifyConnectionRequest(userId: string, requesterUserId: string, requesterUserName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'request',
      title: 'Nueva solicitud de conexión',
      message: `${requesterUserName} quiere conectarse contigo`,
      actionUrl: `/connections`,
      senderId: requesterUserId,
      senderName: requesterUserName,
      metadata: { request_type: 'connection' }
    });
  }

  /**
   * Notify user about a system alert
   */
  static async notifySystemAlert(userId: string, alertTitle: string, alertMessage: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'alert',
      title: alertTitle,
      message: alertMessage,
      actionUrl,
      metadata: { alert_type: 'system' }
    });
  }

  /**
   * Notify user about a system message
   */
  static async notifySystem(userId: string, title: string, message: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      actionUrl,
      metadata: { system_type: 'general' }
    });
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user preferences:', error);
        return {
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          notification_types: {
            matches: true,
            messages: true,
            likes: true,
            achievements: true
          },
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
          timezone: 'America/Mexico_City'
        };
      }

      return {
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        notification_types: {
          matches: true,
          messages: true,
          likes: true,
          achievements: true
        },
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'America/Mexico_City'
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return {
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        notification_types: {
          matches: true,
          messages: true,
          likes: true,
          achievements: true
        },
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'America/Mexico_City'
      };
    }
  }

  /**
   * Update user notification preferences
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
      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting user notifications:', error);
        return { notifications: [], total: 0 };
      }

      return {
        notifications: data || [],
        total: (data || []).length
      };
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }
}

export default NotificationService;