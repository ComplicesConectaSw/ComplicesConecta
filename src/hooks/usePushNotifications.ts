import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
}

export interface NotificationSubscription {
  id?: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  created_at?: string;
  is_active?: boolean;
}

interface UsePushNotificationsOptions {
  userId?: string;
  vapidPublicKey?: string;
  onNotificationReceived?: (notification: PushNotificationPayload) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

export const usePushNotifications = ({
  userId,
  vapidPublicKey = 'BKxyz...', // Replace with actual VAPID key
  onNotificationReceived,
  onSubscriptionChange
}: UsePushNotificationsOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      logger.info('✅ Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      logger.error('Error registering service worker:', { error: String(error) });
      setError('Error registrando Service Worker');
      return null;
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Las notificaciones push no están soportadas');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'denied') {
        setError('Permisos de notificación denegados');
      } else if (permission === 'granted') {
        setError(null);
      }
      
      return permission;
    } catch (error) {
      logger.error('Error requesting notification permission:', { error: String(error) });
      setError('Error solicitando permisos de notificación');
      return 'denied';
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !userId) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          setIsLoading(false);
          return null;
        }
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setIsLoading(false);
        return null;
      }

      // Subscribe to push manager
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      setSubscription(pushSubscription);
      onSubscriptionChange?.(pushSubscription);

      // Save subscription to database
      await saveSubscriptionToDatabase(pushSubscription);

      logger.info('✅ Suscripción push creada:', pushSubscription);
      return pushSubscription;
    } catch (error) {
      logger.error('Error subscribing to push notifications:', { error: String(error) });
      setError('Error creando suscripción push');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, userId, permission, vapidPublicKey, requestPermission, registerServiceWorker, onSubscriptionChange]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    setIsLoading(true);
    try {
      // Unsubscribe from push manager
      const success = await subscription.unsubscribe();
      
      if (success) {
        // Remove from database
        await removeSubscriptionFromDatabase(subscription);
        
        setSubscription(null);
        onSubscriptionChange?.(null);
        logger.info('✅ Suscripción push eliminada');
      }
      
      return success;
    } catch (error) {
      logger.error('Error unsubscribing from push notifications:', { error: String(error) });
      setError('Error eliminando suscripción push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, onSubscriptionChange]);

  // Save subscription to Supabase (using profiles table for now)
  const saveSubscriptionToDatabase = useCallback(async (pushSubscription: PushSubscription) => {
    if (!userId) return;

    try {
      // For now, we'll store push subscription data in localStorage
      // until the push_subscriptions table is created in the database
      const subscriptionData = {
        user_id: userId,
        endpoint: pushSubscription.endpoint,
        p256dh_key: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
        auth_key: arrayBufferToBase64(pushSubscription.getKey('auth')!),
        user_agent: navigator.userAgent,
        is_active: true,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscriptionData));
      logger.info('✅ Suscripción guardada temporalmente en localStorage');
    } catch (error) {
      logger.error('Error saving subscription to database:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }, [userId]);

  // Remove subscription from database
  const removeSubscriptionFromDatabase = useCallback(async (_pushSubscription: PushSubscription) => {
    if (!userId) return;

    try {
      // Remove from localStorage for now
      localStorage.removeItem(`push_subscription_${userId}`);
      logger.info('✅ Suscripción removida de localStorage');
    } catch (error) {
      logger.error('Error removing subscription from database:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }, [userId]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!subscription || !userId) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          notification: {
            title: '🔔 Notificación de prueba',
            body: 'Esta es una notificación de prueba de ComplicesConecta',
            icon: '/compliceslogo.png',
            badge: '/compliceslogo.png',
            data: {
              type: 'test',
              timestamp: Date.now()
            }
          }
        }
      });

      if (error) {
        logger.error('Error sending test notification:', { error: String(error) });
        setError('Error enviando notificación de prueba');
      } else {
        logger.info('✅ Notificación de prueba enviada');
      }
    } catch (error) {
      logger.error('Error sending test notification:', { error: String(error) });
      setError('Error enviando notificación de prueba');
    }
  }, [subscription, userId]);

  // Show local notification
  const showLocalNotification = useCallback((payload: PushNotificationPayload) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/compliceslogo.png',
        badge: payload.badge || '/compliceslogo.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        onNotificationReceived?.(payload);
      };

      return notification;
    } catch (error) {
      logger.error('Error showing local notification:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }, [isSupported, permission, onNotificationReceived]);

  // Load existing subscription
  useEffect(() => {
    const loadExistingSubscription = async () => {
      if (!isSupported || !userId) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          setSubscription(existingSubscription);
          onSubscriptionChange?.(existingSubscription);
        }
      } catch (error) {
        logger.error('❌ Error cargando suscripción existente:', { error: error instanceof Error ? error.message : String(error) });
      }
    };

    loadExistingSubscription();
  }, [isSupported, userId, onSubscriptionChange]);

  return {
    // Estado
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    isSubscribed: !!subscription,

    // Acciones
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    showLocalNotification,

    // Utilidades
    canSubscribe: isSupported && permission === 'granted',
    needsPermission: isSupported && permission === 'default'
  };
};

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default usePushNotifications;
