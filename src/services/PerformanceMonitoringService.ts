/**
 * PerformanceMonitoringService v3.3.0
 * 
 * Servicio para monitoreo de performance en tiempo real
 * Recolecta métricas del sistema y las almacena en Supabase
 * 
 * Funcionalidades:
 * - Métricas de tiempo de respuesta
 * - Conteo de consultas SQL
 * - Tasa de errores
 * - Usuarios activos
 * - Transacciones de tokens
 * - Actividad de reportes
 */

import { supabase } from '../integrations/supabase/client'
import { logger } from '../lib/logger'

// Tipos para las métricas del sistema
export interface PerformanceMetrics {
  responseTime: number
  queryCount: number
  errorRate: number
  activeUsers: number
  tokenTransactions: number
  reportActivity: number
  memoryUsage?: number
  cpuUsage?: number
}

export interface SystemMetric {
  id: string
  metric_type: 'response_time' | 'query_count' | 'error_rate' | 'active_users' | 
               'token_transactions' | 'report_activity' | 'memory_usage' | 'cpu_usage'
  metric_value: number
  metric_unit: 'ms' | 'count' | 'percentage' | 'bytes' | 'users'
  metadata: Record<string, any>
  recorded_at: string
  created_at: string
}

export interface MetricsResponse {
  success: boolean
  metrics?: SystemMetric[]
  error?: string
}

export interface MetricInsertResponse {
  success: boolean
  metric?: SystemMetric
  error?: string
}

/**
 * Servicio principal de monitoreo de performance
 */
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService
  private metricsCache: Map<string, any> = new Map()
  private isMonitoring: boolean = false

  private constructor() {
    // Singleton pattern para evitar múltiples instancias
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService()
    }
    return PerformanceMonitoringService.instance
  }

  /**
   * Registrar una métrica individual en el sistema
   */
  async recordMetric(
    type: SystemMetric['metric_type'],
    value: number,
    unit: SystemMetric['metric_unit'],
    metadata: Record<string, any> = {}
  ): Promise<MetricInsertResponse> {
    try {
      const { data, error } = await (supabase as any)
        .from('system_metrics')
        .insert({
          metric_type: type,
          metric_value: value,
          metric_unit: unit,
          metadata,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Error registrando métrica:', { error: error.message, type, value })
        return { success: false, error: error.message }
      }

      logger.debug('Métrica registrada exitosamente:', { type, value, unit })
      return { success: true, metric: data }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error inesperado registrando métrica:', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Obtener métricas del sistema por tipo y período
   */
  async getMetrics(
    type?: SystemMetric['metric_type'],
    hours: number = 24
  ): Promise<MetricsResponse> {
    try {
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      
      let query = (supabase as any)
        .from('system_metrics')
        .select('*')
        .gte('recorded_at', startTime)
        .order('recorded_at', { ascending: false })
        .limit(1000)

      if (type) {
        query = query.eq('metric_type', type)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error obteniendo métricas:', { error: error.message })
        return { success: false, error: error.message }
      }

      return { success: true, metrics: data || [] }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error inesperado obteniendo métricas:', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Recopilar métricas actuales del sistema
   */
  async collectCurrentMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now()

    try {
      // Simular recolección de métricas (en producción se conectaría a APIs reales)
      const metrics: PerformanceMetrics = {
        responseTime: this.measureResponseTime(),
        queryCount: await this.getQueryCount(),
        errorRate: await this.getErrorRate(),
        activeUsers: await this.getActiveUsers(),
        tokenTransactions: await this.getTokenTransactions(),
        reportActivity: await this.getReportActivity(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage()
      }

      const collectionTime = performance.now() - startTime
      logger.debug('Métricas recolectadas:', { metrics, collectionTime: `${collectionTime}ms` })

      return metrics

    } catch (error) {
      logger.error('Error recolectando métricas:', { error })
      throw error
    }
  }

  /**
   * Iniciar monitoreo automático de métricas
   */
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.isMonitoring) {
      logger.warn('El monitoreo ya está activo')
      return
    }

    this.isMonitoring = true
    logger.info('Iniciando monitoreo de performance', { intervalMinutes })

    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectCurrentMetrics()
        
        // Registrar cada métrica individualmente
        await Promise.all([
          this.recordMetric('response_time', metrics.responseTime, 'ms'),
          this.recordMetric('query_count', metrics.queryCount, 'count'),
          this.recordMetric('error_rate', metrics.errorRate, 'percentage'),
          this.recordMetric('active_users', metrics.activeUsers, 'users'),
          this.recordMetric('token_transactions', metrics.tokenTransactions, 'count'),
          this.recordMetric('report_activity', metrics.reportActivity, 'count'),
          ...(metrics.memoryUsage ? [this.recordMetric('memory_usage', metrics.memoryUsage, 'bytes')] : []),
          ...(metrics.cpuUsage ? [this.recordMetric('cpu_usage', metrics.cpuUsage, 'percentage')] : [])
        ])

      } catch (error) {
        logger.error('Error en monitoreo automático:', { error })
      }
    }, intervalMinutes * 60 * 1000)

    // Guardar referencia del interval para poder detenerlo
    this.metricsCache.set('monitoringInterval', interval)
  }

  /**
   * Detener monitoreo automático
   */
  stopMonitoring(): void {
    const interval = this.metricsCache.get('monitoringInterval')
    if (interval) {
      clearInterval(interval)
      this.metricsCache.delete('monitoringInterval')
      this.isMonitoring = false
      logger.info('Monitoreo de performance detenido')
    }
  }

  /**
   * Obtener estadísticas agregadas de métricas
   */
  async getAggregatedStats(hours: number = 24): Promise<{
    success: boolean
    stats?: Record<string, { avg: number; min: number; max: number; count: number }>
    error?: string
  }> {
    try {
      const { data, error } = await (supabase as any)
        .from('system_metrics')
        .select('metric_type, metric_value')
        .gte('recorded_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())

      if (error) {
        return { success: false, error: error.message }
      }

      // Agregar estadísticas por tipo de métrica
      const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {}
      
      data?.forEach((metric: any) => {
        const type = metric.metric_type
        const value = parseFloat(metric.metric_value)

        if (!stats[type]) {
          stats[type] = { avg: 0, min: value, max: value, count: 0 }
        }

        stats[type].min = Math.min(stats[type].min, value)
        stats[type].max = Math.max(stats[type].max, value)
        stats[type].avg = ((stats[type].avg * stats[type].count) + value) / (stats[type].count + 1)
        stats[type].count += 1
      })

      return { success: true, stats }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  // Métodos privados para recolección de métricas específicas

  private measureResponseTime(): number {
    // En producción, esto mediría el tiempo de respuesta real de las APIs
    return Math.random() * 200 + 50 // Simular 50-250ms
  }

  private async getQueryCount(): Promise<number> {
    // En producción, esto consultaría métricas reales de Supabase
    return Math.floor(Math.random() * 100) + 10
  }

  private async getErrorRate(): Promise<number> {
    // En producción, esto calcularía la tasa de error real
    return Math.random() * 5 // Simular 0-5% de errores
  }

  private async getActiveUsers(): Promise<number> {
    try {
      // Contar usuarios activos en las últimas 24 horas
      const { count, error } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return error ? 0 : (count || 0)
    } catch {
      return 0
    }
  }

  private async getTokenTransactions(): Promise<number> {
    try {
      // Contar transacciones de tokens en las últimas 24 horas
      const { count, error } = await (supabase as any)
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return error ? 0 : (count || 0)
    } catch {
      return 0
    }
  }

  private async getReportActivity(): Promise<number> {
    try {
      // Contar reportes creados en las últimas 24 horas
      const { count, error } = await (supabase as any)
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return error ? 0 : (count || 0)
    } catch {
      return 0
    }
  }

  private getMemoryUsage(): number {
    // En producción, esto obtendría métricas reales del sistema
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return Math.random() * 100000000 // Simular uso de memoria
  }

  private getCpuUsage(): number {
    // En producción, esto obtendría métricas reales de CPU
    return Math.random() * 100 // Simular 0-100% de CPU
  }
}

// Exportar instancia singleton
export const performanceMonitor = PerformanceMonitoringService.getInstance()

// Utilidades para medición de performance
export const withPerformanceTracking = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    
    // Registrar métrica de tiempo de respuesta
    await performanceMonitor.recordMetric(
      'response_time',
      duration,
      'ms',
      { operation: operationName, success: true }
    )
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    
    // Registrar métrica de error
    await performanceMonitor.recordMetric(
      'response_time',
      duration,
      'ms',
      { operation: operationName, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    throw error
  }
}
