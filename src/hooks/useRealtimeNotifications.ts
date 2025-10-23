import { useEffect, useState, useCallback } from 'react';
import { NotificationService, RealtimeNotificationHandler } from '@/lib/notifications';
import { logger } from '@/lib/logger';

export interface UseRealtimeNotificationsOptions {
  userId: string;
  enabled?: boolean;
  autoMarkAsRead?: boolean;
  showPushNotifications?: boolean;
}

export interface NotificationState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useRealtimeNotifications({
  userId,
  enabled = true,
  autoMarkAsRead = false,
  showPushNotifications = true
}: UseRealtimeNotificationsOptions) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null
  });

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { notifications } = await NotificationService.getUserNotifications(userId, 50);
      const unreadCount = await NotificationService.getUnreadCount(userId);
      
      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false
      }));
    } catch (error) {
      logger.error('Error loading notifications:', { error: String(error) });
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al cargar notificaciones'
      }));
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await NotificationService.markAsRead(notificationId, userId);
      if (success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
      }
    } catch (error) {
      logger.error('Error marking notification as read:', { error: String(error) });
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const success = await NotificationService.markAllAsRead(userId);
      if (success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        }));
      }
    } catch (error) {
      logger.error('Error marking all notifications as read:', { error: String(error) });
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const success = await NotificationService.deleteNotification(notificationId);
      if (success) {
        setState(prev => {
          const notification = prev.notifications.find(n => n.id === notificationId);
          const wasUnread = notification && !notification.is_read;
          
          return {
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
          };
        });
      }
    } catch (error) {
      logger.error('Error deleting notification:', { error: String(error) });
    }
  }, []);

  // Send push notification
  const sendPushNotification = useCallback(async (notification: any) => {
    if (showPushNotifications) {
      await NotificationService.sendPushNotification(notification);
    }
  }, [showPushNotifications]);

  // Realtime notification handler
  const notificationHandler: RealtimeNotificationHandler = {
    onNewNotification: useCallback(async (notification: any) => {
      logger.info('🔔 Nueva notificación recibida:', { notification });
      
      setState(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1
      }));

      // Send push notification
      await sendPushNotification(notification);

      // Auto mark as read if enabled
      if (autoMarkAsRead) {
        setTimeout(() => markAsRead(notification.id), 1000);
      }
    }, [autoMarkAsRead, markAsRead, sendPushNotification]),

    onNotificationRead: useCallback((notificationId: string) => {
      logger.info('📖 Notificación marcada como leída:', { notificationId });
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    }, []),

    onNotificationDeleted: useCallback((notificationId: string) => {
      logger.info('🗑️ Notificación eliminada:', { notificationId });
      
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.is_read;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    }, []),

    onUnreadCountChange: useCallback((count: number) => {
      setState(prev => ({ ...prev, unreadCount: count }));
    }, [])
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!enabled || !userId) return;

    loadNotifications();

    const channel = NotificationService.subscribeToNotifications(userId, notificationHandler);
    
    return () => {
      if (channel) {
        NotificationService.unsubscribeFromNotifications(userId);
      }
    };
  }, [enabled, userId, loadNotifications, notificationHandler]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        NotificationService.unsubscribeFromNotifications(userId);
      }
    };
  }, [userId]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
    sendPushNotification
  };
}

export default useRealtimeNotifications;
