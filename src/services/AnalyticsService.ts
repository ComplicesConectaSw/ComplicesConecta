/**
 * Analytics Service - ComplicesConecta v3.3.0
 * Sistema de métricas y analytics realistas
 */

import { logger } from '@/lib/logger';
import type { AnalyticsProperties, BrowserPerformanceMemory } from '@/types/analytics.types';

// Tipos de eventos
interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties?: AnalyticsProperties;
}

// Métricas de usuario
interface UserMetrics {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number;
  lastActive: number;
  profileViews: number;
  messagesSent: number;
  likesGiven: number;
  matchesReceived: number;
  premiumFeatures: string[];
}

// Métricas de rendimiento
interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  errorRate: number;
  crashRate: number;
  memoryUsage: number;
  networkLatency: number;
}

// Almacenamiento local
const eventsStorage: AnalyticsEvent[] = [];
const userMetricsStorage: Map<string, UserMetrics> = new Map();
const performanceMetricsStorage: PerformanceMetrics[] = [];

// Configuración
interface AnalyticsConfig {
  enableTracking: boolean;
  enablePerformanceTracking: boolean;
  enableUserTracking: boolean;
  sampleRate: number;
  apiEndpoint?: string;
  debugMode: boolean;
}

const defaultConfig: AnalyticsConfig = {
  enableTracking: true,
  enablePerformanceTracking: true,
  enableUserTracking: true,
  sampleRate: 1.0,
  debugMode: false
};

let currentConfig = defaultConfig;
let currentSessionId = generateSessionId();
let currentUserId: string | null = null;

/**
 * Generar ID de sesión único
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Inicializar Analytics
 */
export const initializeAnalytics = (config: Partial<AnalyticsConfig> = {}): void => {
  currentConfig = { ...defaultConfig, ...config };
  currentSessionId = generateSessionId();
  
  // Cargar métricas almacenadas
  loadStoredMetrics();
  
  // Configurar listeners de rendimiento
  if (currentConfig.enablePerformanceTracking) {
    setupPerformanceTracking();
  }
  
  // Configurar listeners de usuario
  if (currentConfig.enableUserTracking) {
    setupUserTracking();
  }
  
  logger.info('Analytics inicializado', {
    sessionId: currentSessionId,
    config: currentConfig
  });
};

/**
 * Configurar tracking de rendimiento
 */
const setupPerformanceTracking = (): void => {
  // Medir tiempo de carga de página
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    trackEvent('performance', 'page_load', 'main', loadTime);
  });
  
  // Medir tiempo de respuesta de API
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = performance.now();
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      trackEvent('performance', 'api_response', args[0]?.toString() || 'unknown', endTime - startTime);
      return response;
    } catch (error) {
      const endTime = performance.now();
      trackEvent('error', 'api_error', args[0]?.toString() || 'unknown', endTime - startTime);
      throw error;
    }
  };
  
  // Medir uso de memoria
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as { memory?: BrowserPerformanceMemory }).memory;
      if (memory) {
        trackEvent('performance', 'memory_usage', 'heap', memory.usedJSHeapSize);
      }
    }, 30000); // Cada 30 segundos
  }
};

/**
 * Configurar tracking de usuario
 */
const setupUserTracking = (): void => {
  // Detectar cambios de página
  let lastPage = window.location.pathname;
  
  const trackPageView = () => {
    const currentPage = window.location.pathname;
    if (currentPage !== lastPage) {
      trackEvent('navigation', 'page_view', currentPage);
      lastPage = currentPage;
    }
  };
  
  // Escuchar cambios de ruta
  window.addEventListener('popstate', trackPageView);
  
  // Detectar actividad del usuario
  let lastActivity = Date.now();
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    });
  });
  
  // Detectar inactividad
  setInterval(() => {
    const now = Date.now();
    if (now - lastActivity > 300000) { // 5 minutos
      trackEvent('user', 'inactive', 'session', now - lastActivity);
    }
  }, 60000); // Verificar cada minuto
};

/**
 * Registrar evento
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
  properties?: AnalyticsProperties
): void => {
  if (!currentConfig.enableTracking) return;
  
  // Sampling
  if (Math.random() > currentConfig.sampleRate) return;
  
  const event: AnalyticsEvent = {
    name: `${category}_${action}`,
    category,
    action,
    label,
    value,
    timestamp: Date.now(),
    userId: currentUserId || undefined,
    sessionId: currentSessionId,
    properties
  };
  
  eventsStorage.push(event);
  
  // Mantener solo los últimos 1000 eventos
  if (eventsStorage.length > 1000) {
    eventsStorage.shift();
  }
  
  // Actualizar métricas de usuario
  if (currentUserId && currentConfig.enableUserTracking) {
    updateUserMetrics(event);
  }
  
  // Debug
  if (currentConfig.debugMode) {
    logger.debug('Event tracked', { event });
  }
  
  // Enviar a servidor si está configurado
  if (currentConfig.apiEndpoint) {
    sendEventToServer(event);
  }
};

/**
 * Actualizar métricas de usuario
 */
const updateUserMetrics = (event: AnalyticsEvent): void => {
  if (!currentUserId) return;
  
  let userMetrics = userMetricsStorage.get(currentUserId) || {
    userId: currentUserId,
    totalSessions: 1,
    totalTimeSpent: 0,
    lastActive: Date.now(),
    profileViews: 0,
    messagesSent: 0,
    likesGiven: 0,
    matchesReceived: 0,
    premiumFeatures: []
  };
  
  // Actualizar métricas basadas en eventos
  switch (event.category) {
    case 'profile':
      if (event.action === 'view') userMetrics.profileViews++;
      break;
    case 'chat':
      if (event.action === 'message_send') userMetrics.messagesSent++;
      break;
    case 'discover':
      if (event.action === 'like') userMetrics.likesGiven++;
      break;
    case 'match':
      if (event.action === 'received') userMetrics.matchesReceived++;
      break;
    case 'premium':
      if (event.action === 'feature_used' && event.label) {
        if (!userMetrics.premiumFeatures.includes(event.label)) {
          userMetrics.premiumFeatures.push(event.label);
        }
      }
      break;
  }
  
  userMetrics.lastActive = Date.now();
  userMetricsStorage.set(currentUserId, userMetrics);
};

/**
 * Establecer usuario actual
 */
export const setCurrentUser = (userId: string): void => {
  currentUserId = userId;
  
  // Inicializar métricas de usuario si no existen
  if (!userMetricsStorage.has(userId)) {
    userMetricsStorage.set(userId, {
      userId,
      totalSessions: 1,
      totalTimeSpent: 0,
      lastActive: Date.now(),
      profileViews: 0,
      messagesSent: 0,
      likesGiven: 0,
      matchesReceived: 0,
      premiumFeatures: []
    });
  }
  
  trackEvent('user', 'login', userId);
};

/**
 * Obtener métricas de usuario
 */
export const getUserMetrics = (userId?: string): UserMetrics | null => {
  const targetUserId = userId || currentUserId;
  if (!targetUserId) return null;
  
  return userMetricsStorage.get(targetUserId) || null;
};

/**
 * Obtener métricas de rendimiento
 */
export const getPerformanceMetrics = (): PerformanceMetrics | null => {
  if (performanceMetricsStorage.length === 0) return null;
  
  const latest = performanceMetricsStorage[performanceMetricsStorage.length - 1];
  return latest;
};

/**
 * Obtener eventos recientes
 */
export const getRecentEvents = (limit: number = 50): AnalyticsEvent[] => {
  return eventsStorage.slice(-limit);
};

/**
 * Obtener estadísticas de eventos
 */
export const getEventStats = (): {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsByAction: Record<string, number>;
  topEvents: Array<{ name: string; count: number }>;
} => {
  const totalEvents = eventsStorage.length;
  const eventsByCategory: Record<string, number> = {};
  const eventsByAction: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  
  eventsStorage.forEach(event => {
    eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;
    eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
  });
  
  const topEvents = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  return {
    totalEvents,
    eventsByCategory,
    eventsByAction,
    topEvents
  };
};

/**
 * Enviar evento a servidor
 */
const sendEventToServer = async (event: AnalyticsEvent): Promise<void> => {
  if (!currentConfig.apiEndpoint) return;
  
  try {
    await fetch(currentConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      keepalive: true
    });
  } catch (error) {
    logger.warn('Error enviando evento a servidor', { error });
  }
};

/**
 * Cargar métricas almacenadas
 */
const loadStoredMetrics = (): void => {
  try {
    const storedEvents = localStorage.getItem('analytics_events');
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      eventsStorage.push(...parsedEvents);
    }
    
    const storedUserMetrics = localStorage.getItem('analytics_user_metrics');
    if (storedUserMetrics) {
      const parsedMetrics = JSON.parse(storedUserMetrics);
      Object.entries(parsedMetrics).forEach(([userId, metrics]) => {
        userMetricsStorage.set(userId, metrics as UserMetrics);
      });
    }
  } catch (error) {
    logger.warn('Error cargando métricas almacenadas', { error });
  }
};

/**
 * Guardar métricas en localStorage
 */
const saveMetricsToStorage = (): void => {
  try {
    localStorage.setItem('analytics_events', JSON.stringify(eventsStorage.slice(-100)));
    
    const userMetricsObj = Object.fromEntries(userMetricsStorage);
    localStorage.setItem('analytics_user_metrics', JSON.stringify(userMetricsObj));
  } catch (error) {
    logger.warn('Error guardando métricas', { error });
  }
};

/**
 * Eventos predefinidos
 */
export const AnalyticsEvents = {
  // Usuario
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  
  // Perfil
  PROFILE_VIEW: 'profile_view',
  PROFILE_EDIT: 'profile_edit',
  PROFILE_LIKE: 'profile_like',
  PROFILE_MESSAGE: 'profile_message',
  
  // Descubrimiento
  DISCOVER_VIEW: 'discover_view',
  DISCOVER_FILTER: 'discover_filter',
  DISCOVER_REFRESH: 'discover_refresh',
  
  // Chat
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SEND: 'chat_message_send',
  CHAT_VIDEO_CALL: 'chat_video_call',
  
  // Tokens
  TOKEN_PURCHASE: 'token_purchase',
  TOKEN_STAKING: 'token_staking',
  TOKEN_REWARD: 'token_reward',
  
  // Errores
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue'
};

/**
 * Limpiar datos (para testing)
 */
export const clearAnalyticsData = (): void => {
  eventsStorage.length = 0;
  userMetricsStorage.clear();
  performanceMetricsStorage.length = 0;
  
  localStorage.removeItem('analytics_events');
  localStorage.removeItem('analytics_user_metrics');
  
  logger.debug('Datos de analytics limpiados');
};

// Guardar métricas cada 5 minutos
setInterval(saveMetricsToStorage, 300000);

export default {
  initializeAnalytics,
  trackEvent,
  setCurrentUser,
  getUserMetrics,
  getPerformanceMetrics,
  getRecentEvents,
  getEventStats,
  AnalyticsEvents,
  clearAnalyticsData
};
