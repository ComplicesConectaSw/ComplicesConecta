/**
 * APMService - Sistema de Application Performance Monitoring avanzado
 * Implementa monitoreo de performance, métricas de negocio y alertas inteligentes
 * Incluye análisis de errores, tracing distribuido y dashboards en tiempo real
 */

import { logger } from '@/lib/logger';

export interface APMMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  category: 'performance' | 'business' | 'error' | 'custom';
}

export interface APMAlert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface APMConfig {
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableBusinessMetrics: boolean;
  enableRealTimeAlerts: boolean;
  samplingRate: number;
  retentionPeriod: number;
  alertThresholds: Record<string, number>;
}

export interface APMStats {
  totalMetrics: number;
  activeAlerts: number;
  errorRate: number;
  averageResponseTime: number;
  throughput: number;
  uptime: number;
}

class APMService {
  private metrics: Map<string, APMMetric[]> = new Map();
  private alerts: Map<string, APMAlert> = new Map();
  private config: APMConfig = {
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableBusinessMetrics: true,
    enableRealTimeAlerts: true,
    samplingRate: 1.0,
    retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    alertThresholds: {
      responseTime: 2000, // 2 seconds
      errorRate: 0.05, // 5%
      memoryUsage: 0.8, // 80%
      cpuUsage: 0.8 // 80%
    }
  };
  private stats: APMStats = {
    totalMetrics: 0,
    activeAlerts: 0,
    errorRate: 0,
    averageResponseTime: 0,
    throughput: 0,
    uptime: 100
  };

  constructor() {
    logger.info('📊 APMService initialized');
    this.initializeAPM();
  }

  /**
   * Inicializa el sistema APM
   */
  private async initializeAPM(): Promise<void> {
    try {
      // Start performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring();
      }

      // Start error tracking
      if (this.config.enableErrorTracking) {
        this.startErrorTracking();
      }

      // Start business metrics collection
      if (this.config.enableBusinessMetrics) {
        this.startBusinessMetricsCollection();
      }

      // Start real-time alerts
      if (this.config.enableRealTimeAlerts) {
        this.startRealTimeAlerts();
      }

      // Start data cleanup
      this.startDataCleanup();

      logger.info('✅ APM system initialized successfully');
    } catch (error) {
      logger.error('❌ APM initialization failed:', { error: String(error) });
    }
  }

  /**
   * Registra una métrica personalizada
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'count',
    category: APMMetric['category'] = 'custom',
    tags: Record<string, string> = {}
  ): void {
    try {
      const metric: APMMetric = {
        id: `metric_${Date.now()}_${Math.random()}`,
        name,
        value,
        unit,
        timestamp: new Date(),
        tags,
        category
      };

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      this.metrics.get(name)!.push(metric);
      this.stats.totalMetrics++;

      // Check for alerts
      this.checkMetricAlerts(metric);

      logger.debug('📊 Metric recorded', { name, value, unit, category });
    } catch (error) {
      logger.error('❌ Failed to record metric:', { name, error: String(error) });
    }
  }

  /**
   * Registra un error para tracking
   */
  recordError(
    error: Error,
    context: {
      component?: string;
      action?: string;
      userId?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    try {
      const errorMetric: APMMetric = {
        id: `error_${Date.now()}_${Math.random()}`,
        name: 'application_error',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        tags: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          component: context.component || 'unknown',
          action: context.action || 'unknown',
          userId: context.userId || 'anonymous',
          sessionId: context.sessionId || 'unknown'
        },
        category: 'error'
      };

      this.recordMetric('application_error', 1, 'count', 'error', errorMetric.tags);

      // Create error alert if needed
      this.createErrorAlert(error, context);

      logger.error('🚨 Error recorded in APM', { 
        error: error.message, 
        context 
      });
    } catch (apmError) {
      logger.error('❌ Failed to record error in APM:', { 
        originalError: error.message, 
        apmError: String(apmError) 
      });
    }
  }

  /**
   * Mide el tiempo de ejecución de una función
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    tags: Record<string, string> = {}
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const executionTime = Date.now() - startTime;
      
      this.recordMetric(
        `${name}_execution_time`,
        executionTime,
        'milliseconds',
        'performance',
        tags
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.recordMetric(
        `${name}_execution_time`,
        executionTime,
        'milliseconds',
        'performance',
        { ...tags, error: 'true' }
      );

      throw error;
    }
  }

  /**
   * Inicia monitoreo de performance
   */
  private startPerformanceMonitoring(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'milliseconds', 'performance');
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'milliseconds', 'performance');
        this.recordMetric('first_paint', navigation.responseEnd - navigation.requestStart, 'milliseconds', 'performance');
      });

      // Monitor memory usage
      if ('memory' in performance) {
        setInterval(() => {
          const memory = (performance as any).memory;
          this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'performance');
          this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes', 'performance');
        }, 30000); // Every 30 seconds
      }
    }

    logger.info('📈 Performance monitoring started');
  }

  /**
   * Inicia tracking de errores
   */
  private startErrorTracking(): void {
    if (typeof window !== 'undefined') {
      // Global error handler
      window.addEventListener('error', (event: ErrorEvent) => {
        this.recordError(new Error(event.message), {
          component: 'global',
          action: 'unhandled_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        this.recordError(new Error(String(event.reason)), {
          component: 'global',
          action: 'unhandled_promise_rejection',
          metadata: {
            reason: String(event.reason)
          }
        });
      });
    }

    logger.info('🚨 Error tracking started');
  }

  /**
   * Inicia recolección de métricas de negocio
   */
  private startBusinessMetricsCollection(): void {
    // Monitor user interactions
    if (typeof window !== 'undefined') {
      let clickCount = 0;
      let scrollDepth = 0;

      document.addEventListener('click', () => {
        clickCount++;
        this.recordMetric('user_clicks', clickCount, 'count', 'business');
      });

      window.addEventListener('scroll', () => {
        const newScrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (newScrollDepth > scrollDepth) {
          scrollDepth = newScrollDepth;
          this.recordMetric('scroll_depth', scrollDepth, 'percent', 'business');
        }
      });
    }

    // Monitor API calls
    this.monitorAPICalls();

    logger.info('💼 Business metrics collection started');
  }

  /**
   * Monitorea llamadas a APIs
   */
  private monitorAPICalls(): void {
    // Override fetch to monitor API calls
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const startTime = Date.now();
        const url = args[0] as string;
        
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;
          
          this.recordMetric('api_response_time', duration, 'milliseconds', 'performance', {
            url: url,
            status: response.status.toString(),
            method: 'GET' // Simplified
          });

          this.recordMetric('api_calls', 1, 'count', 'business', {
            url: url,
            status: response.status.toString()
          });

          return response;
        } catch (error) {
          const duration = Date.now() - startTime;
          
          this.recordMetric('api_error', 1, 'count', 'error', {
            url: url,
            error: String(error)
          });

          this.recordMetric('api_response_time', duration, 'milliseconds', 'performance', {
            url: url,
            status: 'error'
          });

          throw error;
        }
      };
    }
  }

  /**
   * Inicia alertas en tiempo real
   */
  private startRealTimeAlerts(): void {
    setInterval(() => {
      this.checkSystemAlerts();
    }, 60000); // Every minute

    logger.info('🔔 Real-time alerts started');
  }

  /**
   * Verifica alertas de métricas
   */
  private checkMetricAlerts(metric: APMMetric): void {
    const threshold = this.config.alertThresholds[metric.name];
    if (threshold && metric.value > threshold) {
      this.createAlert(
        `${metric.name}_threshold_exceeded`,
        `Metric ${metric.name} exceeded threshold`,
        'high',
        threshold,
        metric.value
      );
    }
  }

  /**
   * Verifica alertas del sistema
   */
  private checkSystemAlerts(): void {
    // Check error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert(
        'high_error_rate',
        'High error rate detected',
        'critical',
        this.config.alertThresholds.errorRate,
        errorRate
      );
    }

    // Check response time
    const avgResponseTime = this.calculateAverageResponseTime();
    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      this.createAlert(
        'slow_response_time',
        'Slow response time detected',
        'medium',
        this.config.alertThresholds.responseTime,
        avgResponseTime
      );
    }
  }

  /**
   * Crea una alerta
   */
  private createAlert(
    name: string,
    message: string,
    severity: APMAlert['severity'],
    threshold: number,
    currentValue: number
  ): void {
    const alertId = `alert_${name}_${Date.now()}`;
    
    // Check if alert already exists and is active
    const existingAlert = Array.from(this.alerts.values())
      .find(a => a.name === name && !a.resolved);

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: APMAlert = {
      id: alertId,
      name,
      severity,
      message,
      threshold,
      currentValue,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alertId, alert);
    this.stats.activeAlerts++;

    logger.warn('🚨 APM Alert created', { 
      name, 
      severity, 
      threshold, 
      currentValue 
    });
  }

  /**
   * Crea una alerta de error
   */
  private createErrorAlert(error: Error, _context: any): void {
    this.createAlert(
      'application_error',
      `Application error: ${error.message}`,
      'high',
      0,
      1
    );
  }

  /**
   * Inicia limpieza de datos
   */
  private startDataCleanup(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    logger.info('🧹 Data cleanup scheduled');
  }

  /**
   * Limpia datos antiguos
   */
  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod);
    let cleanedMetrics = 0;
    let cleanedAlerts = 0;

    // Clean old metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      cleanedMetrics += metrics.length - filteredMetrics.length;
      this.metrics.set(name, filteredMetrics);
    }

    // Clean old resolved alerts
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(id);
        cleanedAlerts++;
      }
    }

    if (cleanedMetrics > 0 || cleanedAlerts > 0) {
      logger.info('🧹 Old data cleaned up', { 
        cleanedMetrics, 
        cleanedAlerts 
      });
    }
  }

  /**
   * Calcula métricas agregadas
   */
  private calculateErrorRate(): number {
    const errorMetrics = this.metrics.get('application_error') || [];
    const totalMetrics = this.stats.totalMetrics;
    
    if (totalMetrics === 0) return 0;
    
    const errorCount = errorMetrics.length;
    return errorCount / totalMetrics;
  }

  private calculateAverageResponseTime(): number {
    const responseTimeMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => m.name.includes('response_time') || m.name.includes('execution_time'));

    if (responseTimeMetrics.length === 0) return 0;

    const totalTime = responseTimeMetrics.reduce((sum, m) => sum + m.value, 0);
    return totalTime / responseTimeMetrics.length;
  }

  /**
   * Obtiene métricas por categoría
   */
  getMetricsByCategory(category: APMMetric['category'], limit: number = 100): APMMetric[] {
    const allMetrics = Array.from(this.metrics.values()).flat();
    return allMetrics
      .filter(m => m.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obtiene alertas activas
   */
  getActiveAlerts(): APMAlert[] {
    return Array.from(this.alerts.values())
      .filter(a => !a.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resuelve una alerta
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.stats.activeAlerts--;
      
      logger.info('✅ Alert resolved', { alertId, name: alert.name });
    }
  }

  /**
   * Obtiene estadísticas del APM
   */
  getAPMStats(): APMStats {
    return { ...this.stats };
  }

  /**
   * Genera reporte completo del APM
   */
  generateAPMReport(): string {
    const errorRate = this.calculateErrorRate();
    const avgResponseTime = this.calculateAverageResponseTime();
    const activeAlerts = this.getActiveAlerts();

    let report = '# 📊 APM PERFORMANCE REPORT\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## 📈 System Overview\n`;
    report += `- **Total Metrics:** ${this.stats.totalMetrics}\n`;
    report += `- **Error Rate:** ${(errorRate * 100).toFixed(2)}%\n`;
    report += `- **Average Response Time:** ${avgResponseTime.toFixed(2)}ms\n`;
    report += `- **Active Alerts:** ${activeAlerts.length}\n`;
    report += `- **Uptime:** ${this.stats.uptime.toFixed(2)}%\n\n`;

    if (activeAlerts.length > 0) {
      report += `## 🚨 Active Alerts\n`;
      activeAlerts.forEach(alert => {
        report += `- **${alert.name}** (${alert.severity})\n`;
        report += `  - Message: ${alert.message}\n`;
        report += `  - Threshold: ${alert.threshold}\n`;
        report += `  - Current Value: ${alert.currentValue}\n`;
        report += `  - Time: ${alert.timestamp.toISOString()}\n\n`;
      });
    }

    report += `## 📊 Metrics Summary\n`;
    const categories = ['performance', 'business', 'error', 'custom'];
    categories.forEach(category => {
      const metrics = this.getMetricsByCategory(category as APMMetric['category'], 10);
      report += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Metrics\n`;
      report += `- Count: ${metrics.length}\n`;
      if (metrics.length > 0) {
        report += `- Latest: ${metrics[0].name} = ${metrics[0].value} ${metrics[0].unit}\n`;
      }
      report += '\n';
    });

    return report;
  }

  /**
   * Actualiza configuración del APM
   */
  updateConfig(newConfig: Partial<APMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('⚙️ APM configuration updated', { config: this.config });
  }
}

export const apmService = new APMService();
export default apmService;
