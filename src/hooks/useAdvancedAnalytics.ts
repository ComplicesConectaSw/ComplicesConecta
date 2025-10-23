import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  advancedAnalyticsService, 
  AdvancedAnalyticsConfig, 
  AnalyticsDashboard,
  PredictiveInsights,
  AnalyticsAlert
} from '@/services/AdvancedAnalyticsService';
import { logger } from '@/lib/logger';

export interface UseAdvancedAnalyticsOptions {
  enableRealTimeUpdates?: boolean;
  updateInterval?: number; // milliseconds
  enableUserTracking?: boolean;
  enablePredictiveInsights?: boolean;
  onAlert?: (alert: AnalyticsAlert) => void;
  onInsight?: (insight: PredictiveInsights) => void;
}

export interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  config: AdvancedAnalyticsConfig | null;
}

export function useAdvancedAnalytics(
  options: UseAdvancedAnalyticsOptions = {}
): AnalyticsState & {
  trackUserBehavior: (action: string, page: string, metadata?: Record<string, any>) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  updateConfig: (config: Partial<AdvancedAnalyticsConfig>) => void;
  cleanupData: () => Promise<void>;
} {
  const {
    enableRealTimeUpdates = true,
    updateInterval = 30000,
    enableUserTracking = true,
    onAlert,
    onInsight
  } = options;

  const [state, setState] = useState<AnalyticsState>({
    dashboard: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    config: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random()}`);

  // Función para cargar dashboard
  const loadDashboard = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const dashboard = await advancedAnalyticsService.getAnalyticsDashboard();
      
      setState(prev => ({
        ...prev,
        dashboard,
        isLoading: false,
        lastUpdated: Date.now()
      }));

      // Notificar sobre nuevas alertas
      if (onAlert && dashboard.alerts.length > 0) {
        const latestAlert = dashboard.alerts[dashboard.alerts.length - 1];
        onAlert(latestAlert);
      }

      // Notificar sobre nuevos insights
      if (onInsight && dashboard.predictiveInsights.length > 0) {
        const latestInsight = dashboard.predictiveInsights[dashboard.predictiveInsights.length - 1];
        onInsight(latestInsight);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error loading analytics dashboard:', { error: errorMessage });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [onAlert, onInsight]);

  // Función para rastrear comportamiento de usuario
  const trackUserBehavior = useCallback(async (
    action: string,
    page: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!enableUserTracking) return;

    try {
      // Obtener userId del contexto de autenticación
      // TODO: Integrar con sistema de autenticación
      const userId = 'current-user-id'; // Placeholder
      
      await advancedAnalyticsService.trackUserBehavior(
        userId,
        sessionIdRef.current,
        action,
        page,
        metadata
      );

      logger.debug('User behavior tracked:', { action, page, metadata });
    } catch (error) {
      logger.error('Error tracking user behavior:', { error: String(error) });
    }
  }, [enableUserTracking]);

  // Función para refrescar dashboard
  const refreshDashboard = useCallback(async (): Promise<void> => {
    await loadDashboard();
  }, [loadDashboard]);

  // Función para resolver alerta
  const resolveAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      await advancedAnalyticsService.resolveAlert(alertId);
      await loadDashboard(); // Recargar para reflejar cambios
    } catch (error) {
      logger.error('Error resolving alert:', { error: String(error) });
    }
  }, [loadDashboard]);

  // Función para actualizar configuración
  const updateConfig = useCallback((config: Partial<AdvancedAnalyticsConfig>): void => {
    try {
      advancedAnalyticsService.updateConfig(config);
      logger.info('Analytics config updated:', { config });
    } catch (error) {
      logger.error('Error updating analytics config:', { error: String(error) });
    }
  }, []);

  // Función para limpiar datos
  const cleanupData = useCallback(async (): Promise<void> => {
    try {
      await advancedAnalyticsService.cleanupOldData();
      await loadDashboard(); // Recargar después de limpiar
    } catch (error) {
      logger.error('Error cleaning up analytics data:', { error: String(error) });
    }
  }, [loadDashboard]);

  // Cargar dashboard inicial
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Configurar actualizaciones en tiempo real
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    intervalRef.current = setInterval(() => {
      loadDashboard();
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableRealTimeUpdates, updateInterval, loadDashboard]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    trackUserBehavior,
    refreshDashboard,
    resolveAlert,
    updateConfig,
    cleanupData
  };
}

// Hook para métricas específicas
export function useAnalyticsMetrics() {
  const { dashboard, isLoading, error } = useAdvancedAnalytics();
  
  const realTimeMetrics = dashboard?.realTimeMetrics || null;
  const userBehaviorMetrics = dashboard?.userBehaviorMetrics || [];
  const predictiveInsights = dashboard?.predictiveInsights || [];
  const performanceMetrics = dashboard?.performanceMetrics || null;
  const alerts = dashboard?.alerts || [];
  const trends = dashboard?.trends || null;

  return {
    realTimeMetrics,
    userBehaviorMetrics,
    predictiveInsights,
    performanceMetrics,
    alerts,
    trends,
    isLoading,
    error
  };
}

// Hook para insights predictivos
export function usePredictiveInsights() {
  const { predictiveInsights, isLoading, error } = useAnalyticsMetrics();
  
  const retentionInsights = predictiveInsights.filter(
    insight => insight.predictionType === 'user_retention'
  );
  
  const conversionInsights = predictiveInsights.filter(
    insight => insight.predictionType === 'conversion'
  );
  
  const churnInsights = predictiveInsights.filter(
    insight => insight.predictionType === 'churn'
  );
  
  const engagementInsights = predictiveInsights.filter(
    insight => insight.predictionType === 'engagement'
  );

  return {
    allInsights: predictiveInsights,
    retentionInsights,
    conversionInsights,
    churnInsights,
    engagementInsights,
    isLoading,
    error
  };
}

// Hook para alertas
export function useAnalyticsAlerts() {
  const { alerts, isLoading, error } = useAnalyticsMetrics();
  
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowAlerts = alerts.filter(alert => alert.severity === 'low');
  
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return {
    allAlerts: alerts,
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    lowAlerts,
    unresolvedAlerts,
    resolvedAlerts,
    isLoading,
    error
  };
}

// Hook para métricas de rendimiento
export function usePerformanceMetrics() {
  const { performanceMetrics, isLoading, error } = useAnalyticsMetrics();
  
  const cachePerformance = performanceMetrics?.cachePerformance || null;
  const databasePerformance = performanceMetrics?.databasePerformance || null;
  const memoryUsage = performanceMetrics?.memoryUsage || null;

  return {
    performanceMetrics,
    cachePerformance,
    databasePerformance,
    memoryUsage,
    isLoading,
    error
  };
}

export default useAdvancedAnalytics;
