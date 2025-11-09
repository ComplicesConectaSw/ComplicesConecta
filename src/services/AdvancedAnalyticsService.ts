import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { advancedCacheService } from '@/services/AdvancedCacheService';

export interface AdvancedAnalyticsConfig {
  enableRealTimeAnalytics: boolean;
  enablePredictiveAnalytics: boolean;
  enableBehaviorAnalytics: boolean;
  enablePerformanceAnalytics: boolean;
  enableUserJourneyAnalytics: boolean;
  dataRetentionDays: number;
  samplingRate: number; // 0-1
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    userEngagement: number;
    conversionRate: number;
  };
}

export interface RealTimeMetrics {
  timestamp: string;
  activeUsers: number;
  pageViews: number;
  apiCalls: number;
  errorRate: number;
  averageResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface UserBehaviorMetrics {
  userId: string;
  sessionId: string;
  pageViews: number;
  timeOnSite: number;
  bounceRate: number;
  conversionEvents: string[];
  userJourney: UserJourneyStep[];
  engagementScore: number;
  lastActivity: string;
}

export interface UserJourneyStep {
  step: number;
  page: string;
  timestamp: string;
  duration: number;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface PredictiveInsights {
  predictionType: 'user_retention' | 'conversion' | 'churn' | 'engagement';
  userId?: string;
  probability: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  errorCount: number;
  cachePerformance: {
    hitRate: number;
    missRate: number;
    averageAccessTime: number;
  };
  databasePerformance: {
    queryTime: number;
    connectionPool: number;
    slowQueries: number;
  };
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface AnalyticsAlert {
  id: string;
  type: 'error' | 'performance' | 'user_behavior' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  metadata: Record<string, any>;
}

export interface AnalyticsDashboard {
  realTimeMetrics: RealTimeMetrics;
  userBehaviorMetrics: UserBehaviorMetrics[];
  predictiveInsights: PredictiveInsights[];
  performanceMetrics: PerformanceMetrics;
  alerts: AnalyticsAlert[];
  trends: {
    userGrowth: number;
    engagementTrend: number;
    conversionTrend: number;
    errorTrend: number;
  };
}

export class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;
  private config: AdvancedAnalyticsConfig = {
    enableRealTimeAnalytics: true,
    enablePredictiveAnalytics: true,
    enableBehaviorAnalytics: true,
    enablePerformanceAnalytics: true,
    enableUserJourneyAnalytics: true,
    dataRetentionDays: 90,
    samplingRate: 0.1,
    alertThresholds: {
      errorRate: 0.05,
      responseTime: 2000,
      userEngagement: 0.3,
      conversionRate: 0.02
    }
  };

  private realTimeMetrics: RealTimeMetrics[] = [];
  private userSessions: Map<string, UserBehaviorMetrics> = new Map();
  private alerts: AnalyticsAlert[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeRealTimeAnalytics();
  }

  public static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  /**
   * Inicializa analytics en tiempo real
   */
  private initializeRealTimeAnalytics(): void {
    if (!this.config.enableRealTimeAnalytics) return;

    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectRealTimeMetrics();
        this.realTimeMetrics.push(metrics);
        
        // Mantener solo las últimas 1000 métricas
        if (this.realTimeMetrics.length > 1000) {
          this.realTimeMetrics = this.realTimeMetrics.slice(-1000);
        }

        // Verificar alertas
        await this.checkAlerts(metrics);
        
        logger.debug('Real-time metrics collected:', { timestamp: metrics.timestamp });
      } catch (error) {
        logger.error('Error collecting real-time metrics:', { error: String(error) });
      }
    }, 30000); // Cada 30 segundos
  }

  /**
   * Recolecta métricas en tiempo real
   */
  private async collectRealTimeMetrics(): Promise<RealTimeMetrics> {
    const timestamp = new Date().toISOString();
    
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando métricas por defecto');
        return {
          timestamp,
          activeUsers: 0,
          pageViews: 0,
          apiCalls: 0,
          errorRate: 0,
          averageResponseTime: 0,
          cacheHitRate: 0,
          memoryUsage: 0,
          cpuUsage: 0
        };
      }

      // Obtener métricas de usuarios activos
      const activeUsersResult = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      
      const activeUsers = activeUsersResult.data?.length || 0;

      // Obtener métricas de rendimiento del cache
      const cacheStats = advancedCacheService.getStats();

      // Simular métricas del sistema (en producción vendrían del sistema real)
      const memoryUsage = this.getMemoryUsage();
      const cpuUsage = this.getCPUUsage();

      return {
        timestamp,
        activeUsers,
        pageViews: Math.floor(Math.random() * 100) + 50, // Simulado
        apiCalls: Math.floor(Math.random() * 200) + 100, // Simulado
        errorRate: Math.random() * 0.02, // Simulado
        averageResponseTime: Math.random() * 500 + 100, // Simulado
        cacheHitRate: cacheStats.hitRate,
        memoryUsage,
        cpuUsage
      };
    } catch (error) {
      logger.error('Error collecting real-time metrics:', { error: String(error) });
      return {
        timestamp,
        activeUsers: 0,
        pageViews: 0,
        apiCalls: 0,
        errorRate: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };
    }
  }

  /**
   * Obtiene uso de memoria (simulado)
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / usage.heapTotal;
    }
    return Math.random() * 0.8 + 0.2; // Simulado
  }

  /**
   * Obtiene uso de CPU (simulado)
   */
  private getCPUUsage(): number {
    return Math.random() * 0.6 + 0.2; // Simulado
  }

  /**
   * Rastrea comportamiento de usuario
   */
  async trackUserBehavior(
    userId: string,
    sessionId: string,
    action: string,
    page: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.config.enableBehaviorAnalytics) return;

    try {
      const now = new Date().toISOString();
      
      // Obtener o crear sesión de usuario
      let userMetrics = this.userSessions.get(sessionId);
      if (!userMetrics) {
        userMetrics = {
          userId,
          sessionId,
          pageViews: 0,
          timeOnSite: 0,
          bounceRate: 0,
          conversionEvents: [],
          userJourney: [],
          engagementScore: 0,
          lastActivity: now
        };
        this.userSessions.set(sessionId, userMetrics);
      }

      // Actualizar métricas
      userMetrics.pageViews++;
      userMetrics.lastActivity = now;

      // Agregar paso al journey
      const journeyStep: UserJourneyStep = {
        step: userMetrics.userJourney.length + 1,
        page,
        timestamp: now,
        duration: 0, // Se calculará en el siguiente paso
        action,
        metadata
      };
      userMetrics.userJourney.push(journeyStep);

      // Calcular engagement score
      userMetrics.engagementScore = this.calculateEngagementScore(userMetrics);

      // Registrar evento en analytics_events
      if (supabase) {
        try {
          await supabase
            .from('analytics_events')
            .insert({
              user_id: userId,
              event_name: `${action}_${page}`,
              event_type: 'user_behavior',
              properties: metadata || {},
              session_id: sessionId,
              timestamp: now,
            });
        } catch (error) {
          logger.debug('Failed to log analytics event:', { error: String(error) });
        }
      }

      logger.debug('User behavior tracked:', { userId, sessionId, action, page });
    } catch (error) {
      logger.error('Error tracking user behavior:', { error: String(error) });
    }
  }

  /**
   * Calcula score de engagement del usuario
   */
  private calculateEngagementScore(metrics: UserBehaviorMetrics): number {
    let score = 0;
    
    // Puntos por page views
    score += Math.min(metrics.pageViews * 2, 20);
    
    // Puntos por tiempo en sitio
    score += Math.min(metrics.timeOnSite / 60, 30); // 1 punto por minuto
    
    // Puntos por eventos de conversión
    score += metrics.conversionEvents.length * 10;
    
    // Puntos por diversidad de páginas
    const uniquePages = new Set(metrics.userJourney.map(step => step.page)).size;
    score += Math.min(uniquePages * 3, 15);
    
    return Math.min(score, 100);
  }

  /**
   * Genera insights predictivos
   */
  async generatePredictiveInsights(): Promise<PredictiveInsights[]> {
    if (!this.config.enablePredictiveAnalytics) return [];

    try {
      const insights: PredictiveInsights[] = [];
      
      // Analizar retención de usuarios
      const retentionInsight = await this.predictUserRetention();
      if (retentionInsight) {
        insights.push(retentionInsight);
      }

      // Analizar conversiones
      const conversionInsight = await this.predictConversions();
      if (conversionInsight) {
        insights.push(conversionInsight);
      }

      // Analizar churn
      const churnInsight = await this.predictChurn();
      if (churnInsight) {
        insights.push(churnInsight);
      }

      return insights;
    } catch (error) {
      logger.error('Error generating predictive insights:', { error: String(error) });
      return [];
    }
  }

  /**
   * Predice retención de usuarios
   */
  private async predictUserRetention(): Promise<PredictiveInsights | null> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return null;
      }

      // Obtener datos de usuarios activos
      const activeUsersResult = await supabase
        .from('profiles')
        .select('id, created_at, updated_at')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!activeUsersResult.data) return null;

      const totalUsers = activeUsersResult.data.length;
      const recentUsers = activeUsersResult.data.filter(user => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length;

      const retentionRate = recentUsers / totalUsers;
      const probability = Math.min(retentionRate * 1.2, 1);

      return {
        predictionType: 'user_retention',
        probability,
        confidence: 0.75,
        timeframe: '7 días',
        factors: ['Actividad reciente', 'Tiempo en la plataforma', 'Engagement'],
        recommendations: [
          'Implementar campañas de re-engagement',
          'Mejorar onboarding para nuevos usuarios',
          'Crear contenido personalizado'
        ]
      };
    } catch (error) {
      logger.error('Error predicting user retention:', { error: String(error) });
      return null;
    }
  }

  /**
   * Predice conversiones
   */
  private async predictConversions(): Promise<PredictiveInsights | null> {
    try {
      // Simular análisis de conversión
      const conversionRate = Math.random() * 0.1 + 0.05; // 5-15%
      const probability = Math.min(conversionRate * 2, 1);

      return {
        predictionType: 'conversion',
        probability,
        confidence: 0.8,
        timeframe: '30 días',
        factors: ['Comportamiento de navegación', 'Tiempo en páginas clave', 'Interacciones'],
        recommendations: [
          'Optimizar páginas de conversión',
          'Implementar remarketing',
          'Mejorar UX en puntos de fricción'
        ]
      };
    } catch (error) {
      logger.error('Error predicting conversions:', { error: String(error) });
      return null;
    }
  }

  /**
   * Predice churn de usuarios
   */
  private async predictChurn(): Promise<PredictiveInsights | null> {
    try {
      // Simular análisis de churn
      const churnRate = Math.random() * 0.2 + 0.1; // 10-30%
      const probability = Math.min(churnRate, 1);

      return {
        predictionType: 'churn',
        probability,
        confidence: 0.7,
        timeframe: '14 días',
        factors: ['Baja actividad', 'Falta de engagement', 'Tiempo sin login'],
        recommendations: [
          'Enviar notificaciones personalizadas',
          'Ofrecer incentivos de retención',
          'Mejorar experiencia del usuario'
        ]
      };
    } catch (error) {
      logger.error('Error predicting churn:', { error: String(error) });
      return null;
    }
  }

  /**
   * Verifica alertas basadas en métricas
   */
  private async checkAlerts(metrics: RealTimeMetrics): Promise<void> {
    try {
      const alerts: AnalyticsAlert[] = [];

      // Verificar tasa de errores
      if (metrics.errorRate > this.config.alertThresholds.errorRate) {
        alerts.push({
          id: `error-rate-${Date.now()}`,
          type: 'error',
          severity: 'high',
          title: 'Tasa de errores elevada',
          message: `La tasa de errores es ${(metrics.errorRate * 100).toFixed(2)}%, por encima del umbral del ${(this.config.alertThresholds.errorRate * 100).toFixed(2)}%`,
          timestamp: metrics.timestamp,
          resolved: false,
          metadata: { errorRate: metrics.errorRate }
        });
      }

      // Verificar tiempo de respuesta
      if (metrics.averageResponseTime > this.config.alertThresholds.responseTime) {
        alerts.push({
          id: `response-time-${Date.now()}`,
          type: 'performance',
          severity: 'medium',
          title: 'Tiempo de respuesta lento',
          message: `El tiempo de respuesta promedio es ${metrics.averageResponseTime.toFixed(0)}ms, por encima del umbral de ${this.config.alertThresholds.responseTime}ms`,
          timestamp: metrics.timestamp,
          resolved: false,
          metadata: { responseTime: metrics.averageResponseTime }
        });
      }

      // Verificar hit rate del cache
      if (metrics.cacheHitRate < 0.7) {
        alerts.push({
          id: `cache-hit-rate-${Date.now()}`,
          type: 'performance',
          severity: 'low',
          title: 'Hit rate del cache bajo',
          message: `El hit rate del cache es ${(metrics.cacheHitRate * 100).toFixed(2)}%, por debajo del umbral recomendado del 70%`,
          timestamp: metrics.timestamp,
          resolved: false,
          metadata: { cacheHitRate: metrics.cacheHitRate }
        });
      }

      // Agregar alertas nuevas
      this.alerts.push(...alerts);

      // Mantener solo las últimas 100 alertas
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      // Log alertas críticas
      alerts.forEach(alert => {
        if (alert.severity === 'critical' || alert.severity === 'high') {
          logger.warn('Analytics alert triggered:', { alert });
        }
      });
    } catch (error) {
      logger.error('Error checking alerts:', { error: String(error) });
    }
  }

  /**
   * Obtiene dashboard completo de analytics
   */
  async getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
    try {
      const latestMetrics = this.realTimeMetrics[this.realTimeMetrics.length - 1] || {
        timestamp: new Date().toISOString(),
        activeUsers: 0,
        pageViews: 0,
        apiCalls: 0,
        errorRate: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };

      const userBehaviorMetrics = Array.from(this.userSessions.values());
      const predictiveInsights = await this.generatePredictiveInsights();
      const performanceMetrics = await this.getPerformanceMetrics();

      // Calcular tendencias
      const trends = await this.calculateTrends();

      return {
        realTimeMetrics: latestMetrics,
        userBehaviorMetrics,
        predictiveInsights,
        performanceMetrics,
        alerts: this.alerts.filter(alert => !alert.resolved),
        trends
      };
    } catch (error) {
      logger.error('Error getting analytics dashboard:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheStats = advancedCacheService.getStats();
    
    return {
      pageLoadTime: Math.random() * 2000 + 500, // Simulado
      apiResponseTime: Math.random() * 1000 + 200, // Simulado
      errorCount: Math.floor(Math.random() * 10), // Simulado
      cachePerformance: {
        hitRate: cacheStats.hitRate,
        missRate: cacheStats.missRate,
        averageAccessTime: cacheStats.averageAccessTime
      },
      databasePerformance: {
        queryTime: Math.random() * 100 + 50, // Simulado
        connectionPool: Math.floor(Math.random() * 20) + 10, // Simulado
        slowQueries: Math.floor(Math.random() * 5) // Simulado
      },
      memoryUsage: {
        heapUsed: this.getMemoryUsage() * 1000000000, // Simulado
        heapTotal: 2000000000, // Simulado
        external: Math.random() * 100000000 // Simulado
      }
    };
  }

  /**
   * Calcula tendencias
   */
  private async calculateTrends(): Promise<{
    userGrowth: number;
    engagementTrend: number;
    conversionTrend: number;
    errorTrend: number;
  }> {
    // Simular cálculos de tendencias
    return {
      userGrowth: Math.random() * 20 - 10, // -10% a +10%
      engagementTrend: Math.random() * 30 - 15, // -15% a +15%
      conversionTrend: Math.random() * 10 - 5, // -5% a +5%
      errorTrend: Math.random() * 5 - 2.5 // -2.5% a +2.5%
    };
  }

  /**
   * Resuelve una alerta
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info('Alert resolved:', { alertId });
    }
  }

  /**
   * Actualiza configuración
   */
  updateConfig(newConfig: Partial<AdvancedAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Analytics config updated:', { config: this.config });
  }

  /**
   * Limpia datos antiguos
   */
  async cleanupOldData(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
      
      // Limpiar métricas en tiempo real
      this.realTimeMetrics = this.realTimeMetrics.filter(
        metric => new Date(metric.timestamp) > cutoffDate
      );

      // Limpiar sesiones de usuario
      for (const [sessionId, metrics] of this.userSessions.entries()) {
        if (new Date(metrics.lastActivity) < cutoffDate) {
          this.userSessions.delete(sessionId);
        }
      }

      // Limpiar alertas resueltas antiguas
      this.alerts = this.alerts.filter(
        alert => !alert.resolved || new Date(alert.timestamp) > cutoffDate
      );

      logger.info('Analytics data cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up analytics data:', { error: String(error) });
    }
  }

  /**
   * Destruye el servicio
   */
  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    this.realTimeMetrics = [];
    this.userSessions.clear();
    this.alerts = [];
    
    logger.info('Advanced analytics service destroyed');
  }
}

export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();
