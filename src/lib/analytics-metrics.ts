import { logger } from '@/lib/logger';
import { Json } from '@/types/supabase';
import { redisCache, CacheKeys, CacheTTL } from '@/lib/redis-cache';

/**
 * Sistema de Métricas de Uso en Tiempo Real
 * Monitorea actividad de usuarios y performance del sistema
 */

interface UserMetrics {
  userId: string;
  sessionStart: number;
  pageViews: number;
  interactions: number;
  matchesViewed: number;
  messagesExchanged: number;
  profileUpdates: number;
  tokensEarned: number;
  tokensSpent: number;
  lastActivity: number;
}

interface SystemMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  apiCalls: number;
  cacheHitRate: number;
  errorRate: number;
  responseTime: number;
}

interface EventMetric {
  type: 'page_view' | 'interaction' | 'match_view' | 'message_sent' | 'profile_update' | 'token_transaction' | 'error';
  userId?: string;
  timestamp: number;
  metadata?: Json | null;
}

class AnalyticsMetrics {
  private userSessions: Map<string, UserMetrics> = new Map();
  private systemMetrics: SystemMetrics = {
    activeUsers: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    peakConcurrentUsers: 0,
    apiCalls: 0,
    cacheHitRate: 0,
    errorRate: 0,
    responseTime: 0
  };
  private eventBuffer: EventMetric[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMetrics();
    console.log('📊 Sistema de Métricas inicializado - Analytics en tiempo real activo');
  }

  private initializeMetrics() {
    // Cargar métricas desde cache si existen
    this.loadMetricsFromCache();
    
    // Iniciar recolección automática cada 30 segundos
    this.metricsInterval = setInterval(() => {
      this.processMetrics();
    }, 30000);

    // Limpiar sesiones inactivas cada 5 minutos
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000);

    logger.info('📊 Analytics: Sistema de métricas iniciado', {});
  }

  // Iniciar sesión de usuario
  startUserSession(userId: string) {
    console.log(`📊 Analytics: Iniciando sesión para usuario ${userId}`);
    
    const existingSession = this.userSessions.get(userId);
    if (existingSession) {
      // Actualizar sesión existente
      existingSession.lastActivity = Date.now();
      console.log(`📊 Analytics: Sesión existente actualizada para ${userId}`);
    } else {
      // Nueva sesión
      const newSession: UserMetrics = {
        userId,
        sessionStart: Date.now(),
        pageViews: 0,
        interactions: 0,
        matchesViewed: 0,
        messagesExchanged: 0,
        profileUpdates: 0,
        tokensEarned: 0,
        tokensSpent: 0,
        lastActivity: Date.now()
      };
      
      this.userSessions.set(userId, newSession);
      this.systemMetrics.totalSessions++;
      console.log(`📊 Analytics: Nueva sesión creada para ${userId}`);
    }

    this.updateActiveUsers();
    this.saveMetricsToCache();
  }

  // Registrar evento
  trackEvent(event: EventMetric) {
    console.log(`📊 Analytics: Evento registrado - ${event.type}`, event.metadata || {});
    
    this.eventBuffer.push(event);
    
    // Actualizar métricas de usuario si aplica
    if (event.userId) {
      const session = this.userSessions.get(event.userId);
      if (session) {
        session.lastActivity = Date.now();
        
        switch (event.type) {
          case 'page_view':
            session.pageViews++;
            break;
          case 'interaction':
            session.interactions++;
            break;
          case 'match_view':
            session.matchesViewed++;
            break;
          case 'message_sent':
            session.messagesExchanged++;
            break;
          case 'profile_update':
            session.profileUpdates++;
            break;
          case 'token_transaction':
            if (event.metadata && typeof event.metadata === 'object' && 'type' in event.metadata) {
              const metadata = event.metadata as { type?: string; amount?: number };
              if (metadata.type === 'earn') {
                session.tokensEarned += metadata.amount || 0;
              } else if (metadata.type === 'spend') {
                session.tokensSpent += metadata.amount || 0;
              }
            }
            break;
        }
      }
    }

    // Procesar inmediatamente si es un error
    if (event.type === 'error') {
      this.systemMetrics.errorRate++;
      console.error('📊 Analytics: Error registrado', event.metadata);
    }
  }

  // Obtener métricas de usuario
  getUserMetrics(userId: string): UserMetrics | null {
    const metrics = this.userSessions.get(userId);
    if (metrics) {
      console.log(`📊 Analytics: Métricas obtenidas para ${userId}`, metrics);
    }
    return metrics || null;
  }

  // Obtener métricas del sistema
  getSystemMetrics(): SystemMetrics {
    console.log('📊 Analytics: Métricas del sistema obtenidas', this.systemMetrics);
    return { ...this.systemMetrics };
  }

  // Obtener métricas en tiempo real
  getRealTimeMetrics() {
    const now = Date.now();
    const activeUsers = Array.from(this.userSessions.values())
      .filter(session => (now - session.lastActivity) < 300000) // Activos en últimos 5 min
      .length;

    const recentEvents = this.eventBuffer
      .filter(event => (now - event.timestamp) < 60000) // Últimos 60 segundos
      .length;

    const metrics = {
      activeUsers,
      recentEvents,
      totalSessions: this.systemMetrics.totalSessions,
      peakConcurrentUsers: this.systemMetrics.peakConcurrentUsers,
      timestamp: now
    };

    console.log('📊 Analytics: Métricas en tiempo real', metrics);
    return metrics;
  }

  // Procesar métricas acumuladas
  private processMetrics() {
    console.log('📊 Analytics: Procesando métricas acumuladas...');
    
    // Calcular duración promedio de sesión
    const activeSessions = Array.from(this.userSessions.values());
    if (activeSessions.length > 0) {
      const totalDuration = activeSessions.reduce((sum, session) => {
        return sum + (Date.now() - session.sessionStart);
      }, 0);
      
      this.systemMetrics.averageSessionDuration = totalDuration / activeSessions.length;
    }

    // Actualizar usuarios activos
    this.updateActiveUsers();

    // Limpiar buffer de eventos (mantener solo últimos 1000)
    if (this.eventBuffer.length > 1000) {
      this.eventBuffer = this.eventBuffer.slice(-1000);
    }

    // Guardar en cache
    this.saveMetricsToCache();

    console.log('📊 Analytics: Métricas procesadas', {
      activeSessions: activeSessions.length,
      eventBuffer: this.eventBuffer.length,
      averageSessionDuration: Math.round(this.systemMetrics.averageSessionDuration / 1000) + 's'
    });
  }

  // Actualizar contador de usuarios activos
  private updateActiveUsers() {
    const now = Date.now();
    const activeUsers = Array.from(this.userSessions.values())
      .filter(session => (now - session.lastActivity) < 300000) // 5 minutos
      .length;

    this.systemMetrics.activeUsers = activeUsers;
    
    if (activeUsers > this.systemMetrics.peakConcurrentUsers) {
      this.systemMetrics.peakConcurrentUsers = activeUsers;
      console.log(`📊 Analytics: Nuevo pico de usuarios concurrentes: ${activeUsers}`);
    }
  }

  // Limpiar sesiones inactivas
  private cleanupInactiveSessions() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutos
    let cleaned = 0;

    for (const [userId, session] of this.userSessions.entries()) {
      if ((now - session.lastActivity) > inactiveThreshold) {
        this.userSessions.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`📊 Analytics: Limpieza de sesiones - ${cleaned} sesiones inactivas eliminadas`);
    }
  }

  // Guardar métricas en cache
  private async saveMetricsToCache() {
    try {
      await redisCache.set(CacheKeys.USER_STATS('system'), this.systemMetrics, CacheTTL.MEDIUM);
      
      // Guardar métricas de usuarios activos
      const activeUsers = Array.from(this.userSessions.entries())
        .filter(([_, session]) => (Date.now() - session.lastActivity) < 300000);
      
      for (const [userId, metrics] of activeUsers) {
        await redisCache.set(CacheKeys.USER_STATS(userId), metrics, CacheTTL.SHORT);
      }
    } catch (error) {
      console.error('📊 Analytics: Error al guardar métricas en cache', error);
    }
  }

  // Cargar métricas desde cache
  private async loadMetricsFromCache() {
    try {
      const cachedMetrics = await redisCache.get<SystemMetrics>(CacheKeys.USER_STATS('system'));
      if (cachedMetrics) {
        this.systemMetrics = { ...cachedMetrics };
        console.log('📊 Analytics: Métricas cargadas desde cache');
      }
    } catch (error) {
      console.error('📊 Analytics: Error al cargar métricas desde cache', error);
    }
  }

  // Obtener reporte detallado
  getDetailedReport() {
    const now = Date.now();
    const activeSessions = Array.from(this.userSessions.values());
    
    const report = {
      timestamp: now,
      system: this.systemMetrics,
      sessions: {
        total: activeSessions.length,
        active: activeSessions.filter(s => (now - s.lastActivity) < 300000).length,
        averageDuration: this.systemMetrics.averageSessionDuration,
      },
      events: {
        total: this.eventBuffer.length,
        recent: this.eventBuffer.filter(e => (now - e.timestamp) < 3600000).length, // Última hora
        byType: this.getEventsByType()
      },
      topUsers: this.getTopUsers()
    };

    console.log('📊 Analytics: Reporte detallado generado', report);
    return report;
  }

  // Obtener eventos por tipo
  private getEventsByType() {
    const eventCounts: Record<string, number> = {};
    
    this.eventBuffer.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    });

    return eventCounts;
  }

  // Obtener usuarios más activos
  private getTopUsers() {
    return Array.from(this.userSessions.values())
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
      .map(session => ({
        userId: session.userId,
        interactions: session.interactions,
        pageViews: session.pageViews,
        sessionDuration: Date.now() - session.sessionStart
      }));
  }

  // Destruir instancia
  destroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    console.log('📊 Analytics: Sistema de métricas destruido');
  }
}

// Instancia singleton
export const analyticsMetrics = new AnalyticsMetrics();

// Funciones de utilidad para tracking
export const trackPageView = (userId: string, page: string) => {
  analyticsMetrics.trackEvent({
    type: 'page_view',
    userId,
    timestamp: Date.now(),
    metadata: { page }
  });
};

export const trackInteraction = (userId: string, action: string, target?: string) => {
  analyticsMetrics.trackEvent({
    type: 'interaction',
    userId,
    timestamp: Date.now(),
    metadata: { action, target }
  });
};

export const trackMatchView = (userId: string, matchedUserId: string) => {
  analyticsMetrics.trackEvent({
    type: 'match_view',
    userId,
    timestamp: Date.now(),
    metadata: { matchedUserId }
  });
};

export const trackMessage = (userId: string, chatId: string) => {
  analyticsMetrics.trackEvent({
    type: 'message_sent',
    userId,
    timestamp: Date.now(),
    metadata: { chatId }
  });
};

export const trackTokenTransaction = (userId: string, type: 'earn' | 'spend', amount: number, reason: string) => {
  analyticsMetrics.trackEvent({
    type: 'token_transaction',
    userId,
    timestamp: Date.now(),
    metadata: { type, amount, reason }
  });
};

export const trackError = (error: string, userId?: string, context?: Json | null) => {
  analyticsMetrics.trackEvent({
    type: 'error',
    userId,
    timestamp: Date.now(),
    metadata: { error, context }
  });
};

logger.info('📊 Sistema de Analytics y Métricas inicializado', {});
