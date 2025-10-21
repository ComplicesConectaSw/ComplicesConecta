/**
 * Google Services Integration - ComplicesConecta v3.3.0
 * Servicios de Google (Analytics, Push Notifications) - Sin Firebase
 * Nota: Este proyecto usa Supabase, no Firebase
 * 
 * Servicios optimizados para plataforma swinger con enfoque en:
 * - Discreción y privacidad
 * - Comunicación segura
 * - Análisis de comportamiento lifestyle
 * - Notificaciones discretas
 */

// Configuración de servicios de Google
interface GoogleServicesConfig {
  analytics?: boolean;
  messaging?: boolean;
  crashlytics?: boolean;
}

// Estado de inicialización
let isInitialized = false;
let analytics: any = null;
let messaging: any = null;

// Configuración por defecto (desarrollo)
const defaultConfig: GoogleServicesConfig = {
  analytics: true,
  messaging: true,
  crashlytics: false
};

/**
 * Inicializar servicios de Google (sin Firebase)
 */
export const initializeGoogleServices = async (config: GoogleServicesConfig = defaultConfig): Promise<boolean> => {
  if (isInitialized) {
    console.log('✅ Google Services ya inicializados');
    return true;
  }

  try {
    console.log('🚀 Inicializando Google Services (Supabase-based)...');

    // Inicializar Analytics si está habilitado
    if (config.analytics) {
      await initializeAnalytics();
    }

    // Inicializar Messaging si está habilitado
    if (config.messaging) {
      await initializeMessaging();
    }

    isInitialized = true;
    console.log('✅ Google Services inicializados exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error inicializando Google Services:', error);
    return false;
  }
};

/**
 * Inicializar Analytics (Google Analytics 4)
 */
const initializeAnalytics = async (): Promise<void> => {
  try {
    // Verificar si Google Analytics está disponible globalmente
    if (typeof window !== 'undefined' && (window as any).gtag) {
      analytics = (window as any).gtag;
      console.log('✅ Google Analytics inicializado');
    } else {
      throw new Error('Google Analytics not available');
    }
  } catch {
    console.warn('⚠️ Google Analytics no disponible, usando modo demo');
    // Simular Analytics para desarrollo
    analytics = {
      logEvent: (eventName: string, parameters?: any) => {
        console.log(`📊 Analytics Event: ${eventName}`, parameters);
      }
    };
  }
};

/**
 * Inicializar Messaging (Web Push API)
 */
const initializeMessaging = async (): Promise<void> => {
  try {
    // Usar Web Push API nativo en lugar de Firebase
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = {
        getToken: async () => {
          // Simular token para desarrollo
          return 'demo-push-token-123';
        },
        onMessage: (_callback: any) => {
          console.log('📱 Push listener registrado');
        }
      };
      
      console.log('✅ Web Push Messaging inicializado');
    } else {
      throw new Error('Push API not supported');
    }
  } catch {
    console.warn('⚠️ Push Messaging no disponible, usando modo demo');
    // Simular Messaging para desarrollo
    messaging = {
      getToken: async () => 'demo-token-123',
      onMessage: (_callback: any) => {
        console.log('📱 Messaging listener registrado');
      }
    };
  }
};

/**
 * Solicitar permisos de notificación (Web Push API)
 */
const _requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permisos de notificación concedidos');
      
      // Obtener token de push
      if (messaging) {
        const token = await getPushToken();
        return token;
      }
    } else {
      console.warn('⚠️ Permisos de notificación denegados');
    }
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error);
  }
  
  return null;
};

/**
 * Obtener token de Push (Web Push API)
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn('⚠️ Messaging no inicializado');
      return null;
    }

    const token = await messaging.getToken();

    if (token) {
      console.log('✅ Token Push obtenido:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('⚠️ No se pudo obtener token Push');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo token Push:', error);
    return null;
  }
};

/**
 * Registrar evento de Analytics
 */
export const logAnalyticsEvent = (eventName: string, parameters?: any): void => {
  try {
    if (analytics && analytics.logEvent) {
      analytics.logEvent(eventName, parameters);
    } else {
      // Fallback para desarrollo
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
    }
  } catch (error) {
    console.error('❌ Error registrando evento:', error);
  }
};

/**
 * Registrar evento específico del lifestyle swinger
 */
export const logSwingerEvent = (eventType: string, parameters?: any): void => {
  try {
    // Agregar contexto específico para eventos swinger
    const swingerContext = {
      ...parameters,
      platform: 'complices-conecta',
      lifestyle: 'swinger',
      timestamp: new Date().toISOString(),
      privacy_level: 'high'
    };

    logAnalyticsEvent(eventType, swingerContext);
  } catch (error) {
    console.error('❌ Error registrando evento swinger:', error);
  }
};

/**
 * Registrar evento de discreción y privacidad
 */
export const logDiscretionEvent = (action: string, privacyLevel: 'high' | 'medium' | 'low'): void => {
  logSwingerEvent('discretion_action', {
    action,
    privacy_level: privacyLevel,
    user_consent: true
  });
};

/**
 * Registrar evento de seguridad y límites
 */
export const logSafetyEvent = (eventType: 'boundary_set' | 'consent_given' | 'safety_check' | 'protocol_followed'): void => {
  logSwingerEvent('safety_protocol', {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    compliance: true
  });
};

/**
 * Eventos predefinidos de Analytics - Optimizados para plataforma swinger
 */
export const AnalyticsEvents = {
  // Eventos de usuario
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Eventos de perfil
  PROFILE_VIEW: 'profile_view',
  PROFILE_EDIT: 'profile_edit',
  PROFILE_LIKE: 'profile_like',
  PROFILE_MESSAGE: 'profile_message',
  
  // Eventos de descubrimiento
  DISCOVER_VIEW: 'discover_view',
  DISCOVER_FILTER: 'discover_filter',
  DISCOVER_REFRESH: 'discover_refresh',
  
  // Eventos de chat
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SEND: 'chat_message_send',
  CHAT_VIDEO_CALL: 'chat_video_call',
  
  // Eventos de tokens
  TOKEN_PURCHASE: 'token_purchase',
  TOKEN_STAKING: 'token_staking',
  TOKEN_REWARD: 'token_reward',
  
  // Eventos específicos del lifestyle swinger
  LIFESTYLE_DISCUSSION: 'lifestyle_discussion',
  BOUNDARIES_SETTING: 'boundaries_setting',
  CONSENT_GIVEN: 'consent_given',
  DISCRETION_PROTOCOL: 'discretion_protocol',
  SAFETY_CHECK: 'safety_check',
  COMMUNITY_GUIDELINES: 'community_guidelines',
  PRIVACY_SETTINGS: 'privacy_settings',
  MATCH_COMPATIBILITY: 'match_compatibility',
  VIRTUAL_DATE_SCHEDULED: 'virtual_date_scheduled',
  ETIQUETTE_SESSION: 'etiquette_session',
  
  // Eventos de errores
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue'
};

/**
 * Configurar listener de mensajes en primer plano (Web Push API)
 */
export const setupMessageListener = (): void => {
  try {
    if (!messaging) {
      console.warn('⚠️ Messaging no inicializado');
      return;
    }

    // Usar Web Push API en lugar de Firebase
    messaging.onMessage((payload: any) => {
      console.log('📱 Mensaje recibido:', payload);
      
      // Mostrar notificación personalizada
      if (payload.notification) {
        showCustomNotification(payload.notification);
      }
    });
    
    console.log('✅ Message listener configurado');
  } catch (error) {
    console.error('❌ Error configurando listener:', error);
  }
};

/**
 * Mostrar notificación personalizada - Optimizada para discreción
 */
const showCustomNotification = (notification: any): void => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Configuración discreta para notificaciones
      const notificationOptions = {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'complices-notification', // Evita múltiples notificaciones
        silent: true, // Sin sonido para discreción
        requireInteraction: false, // No requiere interacción inmediata
        data: {
          timestamp: Date.now(),
          source: 'complices-conecta'
        }
      };

      new Notification(notification.title, notificationOptions);
    }
  } catch (error) {
    console.error('❌ Error mostrando notificación:', error);
  }
};

/**
 * Verificar si los servicios están disponibles
 */
export const isGoogleServicesAvailable = (): boolean => {
  return isInitialized;
};

/**
 * Obtener estado de los servicios
 */
export const getServicesStatus = () => {
  return {
    initialized: isInitialized,
    analytics: !!analytics,
    messaging: !!messaging
  };
};

/**
 * Limpiar servicios (para testing)
 */
export const cleanupGoogleServices = (): void => {
  isInitialized = false;
  messaging = null;
  analytics = null;
  console.log('🧹 Google Services limpiados');
};

export default {
  initializeGoogleServices,
  getPushToken,
  logAnalyticsEvent,
  logSwingerEvent,
  logDiscretionEvent,
  logSafetyEvent,
  AnalyticsEvents,
  setupMessageListener,
  isGoogleServicesAvailable,
  getServicesStatus,
  cleanupGoogleServices
};
