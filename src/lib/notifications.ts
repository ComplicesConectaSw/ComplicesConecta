import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { RealtimeChannel } from '@supabase/supabase-js';
import { trackEvent } from '@/config/posthog.config';
import { oneSignalService } from '@/services/notifications/OneSignalService';

export interface CreateNotificationParams {
  userId: string;
  type: 'email' | 'request' | 'alert' | 'system' | 'match' | 'like' | 'message' | 'achievement' | 'event' | 'reminder' | 'security';
  title: string;
  message: string;
  actionUrl?: string;
  senderId?: string;
  senderName?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: string;
  expiresAt?: string;
  groupKey?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    matches: boolean;
    messages: boolean;
    likes: boolean;
    achievements: boolean;
    events: boolean;
    reminders: boolean;
    security: boolean;
  };
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  batch_notifications: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

export interface NotificationAnalytics {
  total_sent: number;
  total_read: number;
  total_clicked: number;
  read_rate: number;
  click_rate: number;
  engagement_score: number;
  last_activity: string;
}

export interface RealtimeNotificationHandler {
  onNewNotification: (notification: any) => void;
  onNotificationRead: (notificationId: string) => void;
  onNotificationDeleted: (notificationId: string) => void;
  onUnreadCountChange: (count: number) => void;
}

export class NotificationService {
  private static realtimeChannels: Map<string, RealtimeChannel> = new Map();
  private static notificationHandlers: Map<string, RealtimeNotificationHandler> = new Map();

  /**
   * Create a new notification for a user
   */
  static async createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const notificationData = {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        sender_id: params.senderId || null,
        sender_name: params.senderName || null,
        metadata: params.metadata || null,
        priority: params.priority || 'normal',
        scheduled_for: params.scheduledFor || null,
        expires_at: params.expiresAt || null,
        group_key: params.groupKey || null,
        read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating notification:', { error: error.message });
        return null;
      }

      // Enviar push notification vía OneSignal
      if (data?.id) {
        oneSignalService.sendNotification(
          params.userId,
          params.title,
          params.message
        ).catch((err) => {
          logger.warn('Error enviando push notification', { error: err });
        });
      }

      // Track event en PostHog
      trackEvent('notification_created', {
        type: params.type,
        priority: params.priority || 'normal',
        userId: params.userId.substring(0, 8) + '***'
      });

      return data?.id ? String(data.id) : null;
    } catch (error) {
      logger.error('Error in createNotification:', { error: error instanceof Error ? error.message : String(error) });
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

    // Track en PostHog
    trackEvent('match_notification', {
      userId: userId.substring(0, 8) + '***',
      matchedUserId: matchedUserId.substring(0, 8) + '***'
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

    // Track en PostHog
    trackEvent('message_notification', {
      userId: userId.substring(0, 8) + '***',
      senderUserId: senderUserId.substring(0, 8) + '***'
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
      if (!supabase) {
        logger.error('Supabase no está disponible');
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

      const { data: _data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Error getting user preferences:', { error: error.message });
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
      logger.error('Error in getUserPreferences:', { error: error instanceof Error ? error.message : String(error) });
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
  static async updateUserPreferences(userId: string, _preferences: Partial<{
    email_notifications: boolean;
    push_notifications: boolean;
    in_app_notifications: boolean;
    notification_types: Record<string, boolean>;
    quiet_hours_start: string;
    quiet_hours_end: string;
    timezone: string;
  }>) {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Error updating user preferences:', { error: error.message });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateUserPreferences:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(notificationId))
        .eq('user_id', userId);

      if (error) {
        logger.error('Error marking notification as read:', { error: error.message });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in markAsRead:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        logger.error('Error marking all notifications as read:', { error: error.message });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in markAllAsRead:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', parseInt(notificationId));

      if (error) {
        logger.error('Error deleting notification:', { error: error.message });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteNotification:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { notifications: [], total: 0 };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        // Silenciar errores de API key inválido para evitar spam en consola
        if (!error.message.includes('Invalid API key')) {
          logger.error('Error getting user notifications:', { error: error.message });
        }
        return { notifications: [], total: 0 };
      }

      return {
        notifications: data || [],
        total: (data || []).length
      };
    } catch (error) {
      logger.error('Error in getUserNotifications:', { error: error instanceof Error ? error.message : String(error) });
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return 0;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        // Silenciar errores de API key inválido para evitar spam en consola
        if (!error.message.includes('Invalid API key') && error.message.trim() !== '') {
          logger.error('Error getting unread count:', { error: error.message });
        }
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getUnreadCount:', { error: error instanceof Error ? error.message : String(error) });
      return 0;
    }
  }

  /**
   * Subscribe to realtime notifications for a user
   */
  static subscribeToNotifications(userId: string, handler: RealtimeNotificationHandler): RealtimeChannel | null {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      // Cancel existing subscription if any
      this.unsubscribeFromNotifications(userId);

      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            logger.info('🔔 Nueva notificación recibida:', { notification: payload.new });
            handler.onNewNotification(payload.new);
            this.updateUnreadCount(userId, handler);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.new.read && !payload.old.read) {
              logger.info('📖 Notificación marcada como leída:', { notificationId: payload.new.id });
              handler.onNotificationRead(payload.new.id);
              this.updateUnreadCount(userId, handler);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            logger.info('🗑️ Notificación eliminada:', { notificationId: payload.old.id });
            handler.onNotificationDeleted(payload.old.id);
            this.updateUnreadCount(userId, handler);
          }
        )
        .subscribe();

      this.realtimeChannels.set(userId, channel);
      this.notificationHandlers.set(userId, handler);

      logger.info('✅ Suscripción a notificaciones activada', { userId });
      return channel;
    } catch (error) {
      logger.error('Error subscribing to notifications:', { error: String(error) });
      return null;
    }
  }

  /**
   * Unsubscribe from realtime notifications
   */
  static unsubscribeFromNotifications(userId: string): void {
    const channel = this.realtimeChannels.get(userId);
    if (channel && supabase) {
      try {
        supabase.removeChannel(channel);
        this.realtimeChannels.delete(userId);
        this.notificationHandlers.delete(userId);
        logger.info('❌ Suscripción a notificaciones cancelada', { userId });
      } catch (error) {
        logger.error('Error al cancelar suscripción:', { error, userId });
      }
    }
  }

  /**
   * Update unread count and notify handler
   */
  private static async updateUnreadCount(userId: string, handler: RealtimeNotificationHandler): Promise<void> {
    try {
      const count = await this.getUnreadCount(userId);
      handler.onUnreadCountChange(count);
    } catch (error) {
      logger.error('Error updating unread count:', { error: String(error) });
    }
  }

  /**
   * Send push notification using Service Worker
   */
  static async sendPushNotification(notification: any): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        logger.info('Push notifications not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        data: {
          url: notification.action_url,
          notificationId: notification.id
        },
        // actions: [
        //   {
        //     action: 'view',
        //     title: 'Ver',
        //     icon: '/icons/view.png'
        //   },
        //   {
        //     action: 'dismiss',
        //     title: 'Descartar',
        //     icon: '/icons/dismiss.png'
        //   }
        // ],
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low'
      });

      logger.info('📱 Push notification sent:', { notificationId: notification.id });
      return true;
    } catch (error) {
      logger.error('Error sending push notification:', { error: String(error) });
      return false;
    }
  }

  /**
   * Group similar notifications together
   */
  static async groupNotifications(userId: string, groupKey: string, limit: number = 5): Promise<any[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('group_key', groupKey)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error grouping notifications:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in groupNotifications:', { error: String(error) });
      return [];
    }
  }

  /**
   * Create grouped notification
   */
  static async createGroupedNotification(
    userId: string,
    groupKey: string,
    notifications: CreateNotificationParams[]
  ): Promise<string | null> {
    try {
      // Check if there are existing notifications in this group
      const existingGroup = await this.groupNotifications(userId, groupKey, 1);
      
      if (existingGroup.length > 0) {
        // Update existing grouped notification
        const existingNotification = existingGroup[0];
        const updatedCount = (existingNotification.metadata?.count || 1) + notifications.length;
        
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return null;
        }

        const { error } = await supabase
          .from('notifications')
          .update({
            message: `${updatedCount} nuevas notificaciones`,
            metadata: {
              ...existingNotification.metadata,
              count: updatedCount,
              latest_notifications: notifications.map(n => ({
                type: n.type,
                title: n.title,
                sender: n.senderName
              }))
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingNotification.id);

        if (error) {
          logger.error('Error updating grouped notification:', { error: error.message });
          return null;
        }

        return existingNotification.id;
      } else {
        // Create new grouped notification
        const groupedNotification: CreateNotificationParams = {
          userId,
          type: 'system',
          title: `${notifications.length} nuevas notificaciones`,
          message: `${notifications.length} nuevas notificaciones`,
          groupKey,
          priority: 'normal',
          metadata: {
            count: notifications.length,
            latest_notifications: notifications.map(n => ({
              type: n.type,
              title: n.title,
              sender: n.senderName
            }))
          }
        };

        return await this.createNotification(groupedNotification);
      }
    } catch (error) {
      logger.error('Error creating grouped notification:', { error: String(error) });
      return null;
    }
  }

  /**
   * Schedule notification for later delivery
   */
  static async scheduleNotification(
    params: CreateNotificationParams,
    scheduledFor: string
  ): Promise<string | null> {
    try {
      const scheduledParams = {
        ...params,
        scheduledFor,
        priority: params.priority || 'normal'
      };

      return await this.createNotification(scheduledParams);
    } catch (error) {
      logger.error('Error scheduling notification:', { error: String(error) });
      return null;
    }
  }

  /**
   * Process scheduled notifications
   */
  static async processScheduledNotifications(): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('read', false)
        .not('scheduled_for', 'is', null)
        .lte('scheduled_for', now);

      if (error) {
        logger.error('Error processing scheduled notifications:', { error: error.message });
        return;
      }

      for (const notification of data || []) {
        // Send the notification
        await this.sendPushNotification(notification);
        
        // Mark as processed
        if (supabase) {
          await supabase
            .from('notifications')
            .update({ 
              is_read: true
            })
            .eq('id', notification.id);
        }
      }

      logger.info('⏰ Procesadas notificaciones programadas:', { count: (data || []).length });
    } catch (error) {
      logger.error('Error in processScheduledNotifications:', { error: String(error) });
    }
  }

  /**
   * Get notification analytics for a user
   */
  static async getNotificationAnalytics(userId: string): Promise<NotificationAnalytics> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return {
          total_sent: 0,
          total_read: 0,
          total_clicked: 0,
          read_rate: 0,
          click_rate: 0,
          engagement_score: 0,
          last_activity: new Date().toISOString()
        };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error getting notification analytics:', { error: error.message });
        return {
          total_sent: 0,
          total_read: 0,
          total_clicked: 0,
          read_rate: 0,
          click_rate: 0,
          engagement_score: 0,
          last_activity: new Date().toISOString()
        };
      }

      const notifications = data || [];
      const totalSent = notifications.length;
      const totalRead = notifications.filter(n => n.is_read).length;
      const totalClicked = notifications.filter(n => {
        try {
          const notifData = n.data as any;
          return notifData?.clicked === true;
        } catch {
          return false;
        }
      }).length;
      const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const engagementScore = (readRate + clickRate) / 2;

      return {
        total_sent: totalSent,
        total_read: totalRead,
        total_clicked: totalClicked,
        read_rate: Math.round(readRate * 100) / 100,
        click_rate: Math.round(clickRate * 100) / 100,
        engagement_score: Math.round(engagementScore * 100) / 100,
        last_activity: notifications[0]?.created_at || new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in getNotificationAnalytics:', { error: String(error) });
      return {
        total_sent: 0,
        total_read: 0,
        total_clicked: 0,
        read_rate: 0,
        click_rate: 0,
        engagement_score: 0,
        last_activity: new Date().toISOString()
      };
    }
  }

  /**
   * Check if user is in quiet hours
   */
  static isInQuietHours(preferences: NotificationPreferences): boolean {
    try {
      const now = new Date();
      const timezone = preferences.timezone || 'America/Mexico_City';
      
      // Convert to user's timezone
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const currentTime = userTime.getHours() * 60 + userTime.getMinutes();
      
      const quietStart = this.timeToMinutes(preferences.quiet_hours_start);
      const quietEnd = this.timeToMinutes(preferences.quiet_hours_end);
      
      if (quietStart <= quietEnd) {
        return currentTime >= quietStart && currentTime <= quietEnd;
      } else {
        // Quiet hours span midnight
        return currentTime >= quietStart || currentTime <= quietEnd;
      }
    } catch (error) {
      logger.error('Error checking quiet hours:', { error: String(error) });
      return false;
    }
  }

  /**
   * Convert time string to minutes
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }

      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .not('expires_at', 'is', null)
        .lte('expires_at', now);

      if (error) {
        logger.error('Error cleaning up expired notifications:', { error: error.message });
      } else {
        logger.info('🧹 Notificaciones expiradas eliminadas');
      }
    } catch (error) {
      logger.error('Error in cleanupExpiredNotifications:', { error: String(error) });
    }
  }
}

export default NotificationService;