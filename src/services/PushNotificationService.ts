import { logger } from '@/lib/logger';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Register Service Worker for push notifications
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!this.isSupported()) {
        logger.info('Push notifications not supported');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });

      logger.info('✅ Service Worker registrado:', { 
        scope: registration.scope,
        state: registration.active?.state 
      });

      return registration;
    } catch (error) {
      logger.error('Error registrando Service Worker:', { error: String(error) });
      return null;
    }
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!this.isSupported()) {
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      logger.info('Permiso de notificaciones:', { permission });
      
      return permission;
    } catch (error) {
      logger.error('Error solicitando permiso:', { error: String(error) });
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribeToPush(): Promise<PushSubscriptionData | null> {
    try {
      const registration = await this.registerServiceWorker();
      if (!registration) {
        return null;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        logger.info('Permiso de notificaciones denegado');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as unknown as ArrayBuffer
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      logger.info('✅ Suscripción a push notifications creada');
      return subscriptionData;
    } catch (error) {
      logger.error('Error suscribiéndose a push notifications:', { error: String(error) });
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        logger.info('❌ Suscripción a push notifications cancelada');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error cancelando suscripción:', { error: String(error) });
      return false;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   */
  static async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      logger.error('Error verificando suscripción:', { error: String(error) });
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  static async getCurrentSubscription(): Promise<PushSubscriptionData | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      logger.error('Error obteniendo suscripción actual:', { error: String(error) });
      return null;
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('Prueba de notificación', {
        body: 'Esta es una notificación de prueba',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        requireInteraction: true
        // actions: [
        //   {
        //     action: 'test',
        //     title: 'Probar'
        //   }
        // ]
      });

      logger.info('📱 Notificación de prueba enviada');
      return true;
    } catch (error) {
      logger.error('Error enviando notificación de prueba:', { error: String(error) });
      return false;
    }
  }

  /**
   * Setup push notifications for a user
   */
  static async setupForUser(userId: string): Promise<boolean> {
    try {
      const subscriptionData = await this.subscribeToPush();
      if (!subscriptionData) {
        return false;
      }

      // TODO: Enviar subscriptionData al servidor para asociarlo con el usuario
      logger.info('🔔 Push notifications configuradas para usuario:', { userId });
      
      return true;
    } catch (error) {
      logger.error('Error configurando push notifications:', { error: String(error) });
      return false;
    }
  }

  /**
   * Convert URL-safe base64 to Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Check notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Show local notification
   */
  static async showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });

      return true;
    } catch (error) {
      logger.error('Error mostrando notificación local:', { error: String(error) });
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      
      notifications.forEach(notification => {
        notification.close();
      });

      logger.info('🧹 Todas las notificaciones limpiadas');
    } catch (error) {
      logger.error('Error limpiando notificaciones:', { error: String(error) });
    }
  }
}

export default PushNotificationService;