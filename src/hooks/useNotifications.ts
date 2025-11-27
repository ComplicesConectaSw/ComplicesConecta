/**
 * =====================================================
 * USE NOTIFICATIONS HOOK
 * =====================================================
 * Hook para gestionar notificaciones en tiempo real
 * Features: Auto-update, contador, filtros
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationService, type Notification, type NotificationType } from '@/services/NotificationService';
import { logger } from '@/lib/logger';

interface UseNotificationsOptions {
  userId?: string;
  autoLoad?: boolean;
  filter?: {
    read?: boolean;
    type?: NotificationType;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  clearOld: (daysOld?: number) => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { userId, autoLoad = true, filter } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Cargar notificaciones
   */
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Cargar desde el servicio
      const loaded = await notificationService.loadUnreadNotifications(userId);
      setNotifications(loaded);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading notifications');
      logger.error('[useNotifications] Error:', { error });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Actualizar lista desde el servicio
   */
  const updateFromService = useCallback(() => {
    const filtered = notificationService.getNotifications(filter);
    setNotifications(filtered);
  }, [filter]);

  /**
   * Marcar como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      updateFromService();
    } catch (err) {
      logger.error('[useNotifications] Error marking as read:', { error: err });
    }
  }, [updateFromService]);

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      updateFromService();
    } catch (err) {
      logger.error('[useNotifications] Error marking all as read:', { error: err });
    }
  }, [userId, updateFromService]);

  /**
   * Limpiar notificaciones antiguas
   */
  const clearOld = useCallback(async (daysOld: number = 30) => {
    try {
      await notificationService.clearOld(daysOld);
      updateFromService();
    } catch (err) {
      logger.error('[useNotifications] Error clearing old:', { error: err });
    }
  }, [updateFromService]);

  /**
   * Inicializar servicio y escuchar cambios
   */
  useEffect(() => {
    if (!userId) return;

    // Inicializar servicio
    notificationService.initialize(userId);

    // Auto-cargar si está habilitado
    if (autoLoad) {
      loadNotifications();
    }

    // Suscribirse a nuevas notificaciones
    const unsubscribeNew = notificationService.addListener('new', () => {
      updateFromService();
    });

    // Suscribirse a notificaciones leídas
    const unsubscribeRead = notificationService.addListener('read', () => {
      updateFromService();
    });

    // Suscribirse a todas leídas
    const unsubscribeAllRead = notificationService.addListener('all-read', () => {
      updateFromService();
    });

    // Cleanup
    return () => {
      unsubscribeNew();
      unsubscribeRead();
      unsubscribeAllRead();
    };
  }, [userId, autoLoad, loadNotifications, updateFromService]);

  /**
   * Calcular contador de no leídas
   */
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
    clearOld
  };
}

/**
 * Hook simplificado solo para el contador
 */
export function useUnreadCount(userId?: string): number {
  const { unreadCount } = useNotifications({ userId, autoLoad: true });
  return unreadCount;
}

/**
 * Hook para notificaciones por tipo
 */
export function useNotificationsByType(userId?: string, type?: NotificationType) {
  return useNotifications({
    userId,
    autoLoad: true,
    filter: { type }
  });
}
