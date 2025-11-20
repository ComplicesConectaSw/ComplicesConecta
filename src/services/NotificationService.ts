/**
 * =====================================================
 * NOTIFICATION SERVICE
 * =====================================================
 * Servicio de notificaciones en tiempo real
 * Features: WebSocket, Push notifications, Supabase Realtime
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/config/supabase.config';

export type NotificationType = 
  | 'like' 
  | 'match' 
  | 'message' 
  | 'view' 
  | 'comment'
  | 'private_request'
  | 'achievement'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  imageUrl?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  types: {
    [key in NotificationType]?: boolean;
  };
}

class NotificationService {
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private subscription: any = null;
  private notificationQueue: Notification[] = [];
  private audioContext: AudioContext | null = null;
  private sounds: Map<NotificationType, AudioBuffer> = new Map();

  /**
   * Inicializar el servicio
   */
  async initialize(userId: string): Promise<void> {
    try {
      logger.info('[NotificationService] Initializing for user:', { userId });

      // Solicitar permisos de notificaciones del navegador
      await this.requestPermission();

      // Inicializar audio context para sonidos
      this.initializeAudio();

      // Suscribirse a notificaciones en tiempo real
      await this.subscribeToRealtime(userId);

      // Cargar notificaciones no leídas
      await this.loadUnreadNotifications(userId);

    } catch (error) {
      logger.error('[NotificationService] Initialization error:', { error });
    }
  }

  /**
   * Solicitar permisos de notificaciones
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      logger.warn('[NotificationService] Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      logger.info('[NotificationService] Permission:', { permission });
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Inicializar contexto de audio
   */
  private initializeAudio(): void {
    try {
      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
        logger.info('[NotificationService] Audio context initialized');
      }
    } catch (error) {
      logger.warn('[NotificationService] Audio initialization failed:', { error });
    }
  }

  /**
   * Suscribirse a notificaciones en tiempo real
   */
  private async subscribeToRealtime(userId: string): Promise<void> {
    try {
      // Suscribirse a la tabla de notificaciones
      this.subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            logger.info('[NotificationService] New notification:', { payload });
            this.handleNewNotification(payload.new as any);
          }
        )
        .subscribe();

      logger.info('[NotificationService] Subscribed to realtime');
    } catch (error) {
      logger.error('[NotificationService] Realtime subscription error:', { error });
    }
  }

  /**
   * Manejar nueva notificación
   */
  private handleNewNotification(data: any): void {
    const notification: Notification = {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: data.read || false,
      createdAt: new Date(data.created_at),
      actionUrl: data.action_url,
      priority: data.priority || 'medium',
      icon: data.icon,
      imageUrl: data.image_url
    };

    // Agregar a la cola
    this.notificationQueue.push(notification);

    // Notificar a todos los listeners
    this.notifyListeners('new', notification);

    // Mostrar notificación del navegador
    this.showBrowserNotification(notification);

    // Reproducir sonido
    this.playSound(notification.type);
  }

  /**
   * Mostrar notificación del navegador
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        data: notification.data
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-cerrar después de 5 segundos (excepto prioridad alta)
      if (notification.priority !== 'high') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    } catch (error) {
      logger.error('[NotificationService] Browser notification error:', { error });
    }
  }

  /**
   * Reproducir sonido de notificación
   */
  private async playSound(type: NotificationType): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Por ahora usar beep simple
      // TODO: Cargar sonidos personalizados por tipo
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = type === 'match' ? 800 : 600;
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      logger.warn('[NotificationService] Sound playback error:', { error });
    }
  }

  /**
   * Agregar listener
   */
  addListener(event: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Retornar función de cleanup
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Notificar a listeners
   */
  private notifyListeners(event: string, notification: Notification): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        logger.error('[NotificationService] Listener error:', { error });
      }
    });
  }

  /**
   * Cargar notificaciones no leídas
   */
  async loadUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      // TODO: En producción, obtener desde Supabase
      logger.info('[NotificationService] Loading unread notifications:', { userId });

      // Simular notificaciones
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId,
          type: 'like',
          title: 'Nuevo Like',
          message: 'María le dio like a tu perfil',
          read: false,
          createdAt: new Date(Date.now() - 2 * 3600000),
          priority: 'medium',
          actionUrl: '/profile/maria'
        },
        {
          id: '2',
          userId,
          type: 'match',
          title: '¡Nuevo Match!',
          message: 'Tienes un nuevo match con Carlos',
          read: false,
          createdAt: new Date(Date.now() - 5 * 3600000),
          priority: 'high',
          actionUrl: '/matches'
        },
        {
          id: '3',
          userId,
          type: 'message',
          title: 'Nuevo Mensaje',
          message: 'Ana te envió un mensaje',
          read: false,
          createdAt: new Date(Date.now() - 86400000),
          priority: 'high',
          actionUrl: '/chat/ana'
        }
      ];

      this.notificationQueue = mockNotifications;
      return mockNotifications;
    } catch (error) {
      logger.error('[NotificationService] Error loading notifications:', { error });
      return [];
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      logger.info('[NotificationService] Marking as read:', { notificationId });

      // Actualizar en la cola local
      const notification = this.notificationQueue.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }

      // TODO: En producción, actualizar en Supabase
      /*
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      */

      this.notifyListeners('read', notification!);
    } catch (error) {
      logger.error('[NotificationService] Error marking as read:', { error });
    }
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      logger.info('[NotificationService] Marking all as read:', { userId });

      this.notificationQueue.forEach(n => {
        if (n.userId === userId) {
          n.read = true;
        }
      });

      // TODO: En producción, actualizar en Supabase
      this.notifyListeners('all-read', {} as any);
    } catch (error) {
      logger.error('[NotificationService] Error marking all as read:', { error });
    }
  }

  /**
   * Obtener notificaciones
   */
  getNotifications(filter?: { read?: boolean; type?: NotificationType }): Notification[] {
    let notifications = [...this.notificationQueue];

    if (filter?.read !== undefined) {
      notifications = notifications.filter(n => n.read === filter.read);
    }

    if (filter?.type) {
      notifications = notifications.filter(n => n.type === filter.type);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Obtener contador de no leídas
   */
  getUnreadCount(): number {
    return this.notificationQueue.filter(n => !n.read).length;
  }

  /**
   * Limpiar notificaciones antiguas
   */
  async clearOld(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 86400000);
      
      this.notificationQueue = this.notificationQueue.filter(
        n => n.createdAt > cutoffDate
      );

      logger.info('[NotificationService] Cleared old notifications');
    } catch (error) {
      logger.error('[NotificationService] Error clearing old:', { error });
    }
  }

  /**
   * Destruir el servicio
   */
  destroy(): void {
    // Desuscribirse de realtime
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    // Limpiar listeners
    this.listeners.clear();

    // Cerrar audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    logger.info('[NotificationService] Service destroyed');
  }
}

export const notificationService = new NotificationService();
export default notificationService;
