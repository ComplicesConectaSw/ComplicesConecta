/**
 * TokenAnalyticsService v3.3.0
 * 
 * Servicio para analytics avanzados del sistema de tokens CMPX/GTK
 * Genera métricas, reportes y análisis de comportamiento de usuarios
 * 
 * Funcionalidades:
 * - Métricas de supply y circulación
 * - Análisis de transacciones
 * - Estadísticas de staking
 * - Reportes automáticos
 * - Predicciones de demanda
 * - Dashboard de analytics
 */

import { supabase } from '../integrations/supabase/client'
import { logger } from '../lib/logger'

// Tipos para analytics de tokens
export type PeriodType = 'hourly' | 'daily' | 'weekly' | 'monthly'

export interface TokenMetrics {
  totalSupply: {
    cmpx: number
    gtk: number
  }
  circulatingSupply: {
    cmpx: number
    gtk: number
  }
  transactionVolume: {
    cmpx: number
    gtk: number
    count: number
  }
  stakingMetrics: {
    totalStaked: number
    activeStakers: number
    avgDuration: number
  }
  userMetrics: {
    activeUsers: number
    newUsers: number
  }
}

export interface TokenAnalytics {
  id: string
  period_type: PeriodType
  period_start: string
  period_end: string
  total_cmpx_supply: number
  total_gtk_supply: number
  circulating_cmpx: number
  circulating_gtk: number
  transaction_count: number
  transaction_volume_cmpx: number
  transaction_volume_gtk: number
  total_staked_cmpx: number
  active_stakers: number
  metadata: Record<string, any>
  created_at: string
}

export interface AnalyticsResponse {
  success: boolean
  analytics?: TokenAnalytics[]
  error?: string
}

export interface MetricsResponse {
  success: boolean
  metrics?: TokenMetrics
  error?: string
}

export interface ReportResponse {
  success: boolean
  report?: {
    summary: TokenMetrics
    trends: Record<string, number>
    insights: string[]
  }
  error?: string
}

/**
 * Servicio principal de analytics de tokens
 */
export class TokenAnalyticsService {
  private static instance: TokenAnalyticsService
  private analyticsCache: Map<string, any> = new Map()
  private isGeneratingReports: boolean = false

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): TokenAnalyticsService {
    if (!TokenAnalyticsService.instance) {
      TokenAnalyticsService.instance = new TokenAnalyticsService()
    }
    return TokenAnalyticsService.instance
  }

  /**
   * Generar métricas actuales del sistema de tokens
   */
  async generateCurrentMetrics(): Promise<MetricsResponse> {
    try {
      logger.info('Generando métricas actuales de tokens...')

      // Obtener métricas de supply
      const supplyMetrics = await this.calculateSupplyMetrics()
      
      // Obtener métricas de transacciones
      const transactionMetrics = await this.calculateTransactionMetrics()
      
      // Obtener métricas de staking
      const stakingMetrics = await this.calculateStakingMetrics()
      
      // Obtener métricas de usuarios
      const userMetrics = await this.calculateUserMetrics()

      const metrics: TokenMetrics = {
        totalSupply: supplyMetrics.totalSupply,
        circulatingSupply: supplyMetrics.circulatingSupply,
        transactionVolume: transactionMetrics,
        stakingMetrics,
        userMetrics
      }

      logger.info('Métricas generadas exitosamente:', { metrics })
      return { success: true, metrics }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error generando métricas:', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Guardar analytics para un período específico
   */
  async saveAnalytics(
    periodType: PeriodType,
    periodStart: Date,
    periodEnd: Date,
    metrics: TokenMetrics
  ): Promise<AnalyticsResponse> {
    try {
      const analyticsData = {
        period_type: periodType,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_cmpx_supply: metrics.totalSupply.cmpx,
        total_gtk_supply: metrics.totalSupply.gtk,
        circulating_cmpx: metrics.circulatingSupply.cmpx,
        circulating_gtk: metrics.circulatingSupply.gtk,
        transaction_count: metrics.transactionVolume.count,
        transaction_volume_cmpx: metrics.transactionVolume.cmpx,
        transaction_volume_gtk: metrics.transactionVolume.gtk,
        total_staked_cmpx: metrics.stakingMetrics.totalStaked,
        active_stakers: metrics.stakingMetrics.activeStakers,
        metadata: {
          avgStakingDuration: metrics.stakingMetrics.avgDuration,
          activeUsers: metrics.userMetrics.activeUsers,
          newUsers: metrics.userMetrics.newUsers
        }
      }

      const { data, error } = await supabase
        .from('token_analytics')
        .upsert(analyticsData, {
          onConflict: 'period_type,period_start'
        })
        .select()
        .single()

      if (error) {
        logger.error('Error guardando analytics:', { error: error.message })
        return { success: false, error: error.message }
      }

      logger.info('Analytics guardados exitosamente:', { periodType, periodStart })
      return { success: true, analytics: [data as TokenAnalytics] }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error inesperado guardando analytics:', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Obtener analytics históricos
   */
  async getHistoricalAnalytics(
    periodType: PeriodType,
    limit: number = 30
  ): Promise<AnalyticsResponse> {
    try {
      const { data, error } = await supabase
        .from('token_analytics')
        .select('*')
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Error obteniendo analytics históricos:', { error: error.message })
        return { success: false, error: error.message }
      }

      return { success: true, analytics: data as TokenAnalytics[] || [] }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Generar reporte automático
   */
  async generateAutomaticReport(periodType: PeriodType = 'daily'): Promise<ReportResponse> {
    try {
      if (this.isGeneratingReports) {
        return { success: false, error: 'Ya se está generando un reporte' }
      }

      this.isGeneratingReports = true
      logger.info('Generando reporte automático:', { periodType })

      // Obtener métricas actuales
      const currentMetrics = await this.generateCurrentMetrics()
      if (!currentMetrics.success || !currentMetrics.metrics) {
        return { success: false, error: 'No se pudieron obtener las métricas actuales' }
      }

      // Obtener analytics históricos para comparación
      const historical = await this.getHistoricalAnalytics(periodType, 7)
      if (!historical.success) {
        return { success: false, error: 'No se pudieron obtener datos históricos' }
      }

      // Calcular tendencias
      const trends = this.calculateTrends(historical.analytics || [], currentMetrics.metrics)
      
      // Generar insights
      const insights = this.generateInsights(currentMetrics.metrics, trends)

      const report = {
        summary: currentMetrics.metrics,
        trends,
        insights
      }

      logger.info('Reporte generado exitosamente')
      return { success: true, report }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error generando reporte:', { error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      this.isGeneratingReports = false
    }
  }

  /**
   * Iniciar generación automática de analytics
   */
  startAutomaticAnalytics(intervalHours: number = 1): void {
    logger.info('Iniciando generación automática de analytics:', { intervalHours })

    const interval = setInterval(async () => {
      try {
        const now = new Date()
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

        // Generar métricas actuales
        const metrics = await this.generateCurrentMetrics()
        if (metrics.success && metrics.metrics) {
          // Guardar analytics por hora
          await this.saveAnalytics('hourly', hourStart, hourEnd, metrics.metrics)

          // Si es medianoche, generar analytics diarios
          if (now.getHours() === 0) {
            const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
            const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            await this.saveAnalytics('daily', dayStart, dayEnd, metrics.metrics)
          }

          // Si es domingo medianoche, generar analytics semanales
          if (now.getHours() === 0 && now.getDay() === 0) {
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            await this.saveAnalytics('weekly', weekStart, now, metrics.metrics)
          }

          // Si es primer día del mes, generar analytics mensuales
          if (now.getHours() === 0 && now.getDate() === 1) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
            await this.saveAnalytics('monthly', monthStart, monthEnd, metrics.metrics)
          }
        }

      } catch (error) {
        logger.error('Error en generación automática de analytics:', { error })
      }
    }, intervalHours * 60 * 60 * 1000)

    // Guardar referencia del interval
    this.analyticsCache.set('analyticsInterval', interval)
  }

  /**
   * Detener generación automática
   */
  stopAutomaticAnalytics(): void {
    const interval = this.analyticsCache.get('analyticsInterval')
    if (interval) {
      clearInterval(interval)
      this.analyticsCache.delete('analyticsInterval')
      logger.info('Generación automática de analytics detenida')
    }
  }

  // Métodos privados para cálculos específicos

  private async calculateSupplyMetrics(): Promise<{
    totalSupply: { cmpx: number; gtk: number }
    circulatingSupply: { cmpx: number; gtk: number }
  }> {
    try {
      // Calcular supply total sumando todos los balances
      const { data: balances, error } = await supabase
        .from('user_tokens')
        .select('cmpx_balance, gtk_balance, total_earned, total_spent')

      if (error) {
        logger.error('Error calculando supply:', { error: error.message })
        return {
          totalSupply: { cmpx: 0, gtk: 0 },
          circulatingSupply: { cmpx: 0, gtk: 0 }
        }
      }

      const totalCmpx = balances?.reduce((sum: number, b: any) => sum + (b.cmpx_balance || 0), 0) || 0
      const totalGtk = balances?.reduce((sum: number, b: any) => sum + (b.gtk_balance || 0), 0) || 0

      // Calcular tokens en staking (no circulantes)
      const { data: staking } = await supabase
        .from('user_staking')
        .select('amount')
        .eq('status', 'active')

      const stakedAmount = staking?.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) || 0

      return {
        totalSupply: { cmpx: totalCmpx, gtk: totalGtk },
        circulatingSupply: { 
          cmpx: Math.max(0, totalCmpx - stakedAmount), 
          gtk: totalGtk 
        }
      }

    } catch (error) {
      logger.error('Error en calculateSupplyMetrics:', { error })
      return {
        totalSupply: { cmpx: 0, gtk: 0 },
        circulatingSupply: { cmpx: 0, gtk: 0 }
      }
    }
  }

  private async calculateTransactionMetrics(): Promise<{
    cmpx: number
    gtk: number
    count: number
  }> {
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('token_type, amount')
        .gte('created_at', last24h)

      if (error) {
        logger.error('Error calculando métricas de transacciones:', { error: error.message })
        return { cmpx: 0, gtk: 0, count: 0 }
      }

      const cmpxVolume = transactions?.filter((t: any) => t.token_type === 'CMPX')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0
      
      const gtkVolume = transactions?.filter((t: any) => t.token_type === 'GTK')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0

      return {
        cmpx: cmpxVolume,
        gtk: gtkVolume,
        count: transactions?.length || 0
      }

    } catch (error) {
      logger.error('Error en calculateTransactionMetrics:', { error })
      return { cmpx: 0, gtk: 0, count: 0 }
    }
  }

  private async calculateStakingMetrics(): Promise<{
    totalStaked: number
    activeStakers: number
    avgDuration: number
  }> {
    try {
      const { data: staking, error } = await supabase
        .from('user_staking')
        .select('amount, start_date, end_date, status')
        .eq('status', 'active')

      if (error) {
        logger.error('Error calculando métricas de staking:', { error: error.message })
        return { totalStaked: 0, activeStakers: 0, avgDuration: 0 }
      }

      const totalStaked = staking?.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) || 0
      const activeStakers = staking?.length || 0

      // Calcular duración promedio
      const avgDuration = staking?.length > 0 
        ? staking.reduce((sum: number, s: any) => {
            const start = new Date(s.start_date)
            const end = new Date(s.end_date)
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / staking.length
        : 0

      return { totalStaked, activeStakers, avgDuration }

    } catch (error) {
      logger.error('Error en calculateStakingMetrics:', { error })
      return { totalStaked: 0, activeStakers: 0, avgDuration: 0 }
    }
  }

  private async calculateUserMetrics(): Promise<{
    activeUsers: number
    newUsers: number
  }> {
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      // Usuarios activos (con transacciones en las últimas 24h)
      const { data: activeUsers, error: activeError } = await supabase
        .from('transactions')
        .select('user_id')
        .gte('created_at', last24h)

      // Usuarios nuevos (creados en las últimas 24h)
      const { data: newUsers, error: newError } = await supabase
        .from('user_tokens')
        .select('user_id')
        .gte('created_at', last24h)

      if (activeError || newError) {
        logger.error('Error calculando métricas de usuarios')
        return { activeUsers: 0, newUsers: 0 }
      }

      const uniqueActiveUsers = new Set(activeUsers?.map((u: any) => u.user_id) || []).size
      const uniqueNewUsers = newUsers?.length || 0

      return {
        activeUsers: uniqueActiveUsers,
        newUsers: uniqueNewUsers
      }

    } catch (error) {
      logger.error('Error en calculateUserMetrics:', { error })
      return { activeUsers: 0, newUsers: 0 }
    }
  }

  private calculateTrends(historical: TokenAnalytics[], current: TokenMetrics): Record<string, number> {
    if (historical.length === 0) {
      return {}
    }

    const previous = historical[0]
    
    return {
      supplyGrowth: this.calculatePercentageChange(
        previous.total_cmpx_supply + previous.total_gtk_supply,
        current.totalSupply.cmpx + current.totalSupply.gtk
      ),
      transactionGrowth: this.calculatePercentageChange(
        previous.transaction_count,
        current.transactionVolume.count
      ),
      stakingGrowth: this.calculatePercentageChange(
        previous.total_staked_cmpx,
        current.stakingMetrics.totalStaked
      ),
      userGrowth: this.calculatePercentageChange(
        previous.metadata?.activeUsers || 0,
        current.userMetrics.activeUsers
      )
    }
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  private generateInsights(metrics: TokenMetrics, trends: Record<string, number>): string[] {
    const insights: string[] = []

    // Insights sobre supply
    if (trends.supplyGrowth > 10) {
      insights.push(`📈 El supply total de tokens ha crecido un ${trends.supplyGrowth.toFixed(1)}% - crecimiento saludable`)
    } else if (trends.supplyGrowth < -5) {
      insights.push(`📉 El supply de tokens ha disminuido un ${Math.abs(trends.supplyGrowth).toFixed(1)}% - revisar emisión`)
    }

    // Insights sobre transacciones
    if (trends.transactionGrowth > 20) {
      insights.push(`🚀 Las transacciones han aumentado un ${trends.transactionGrowth.toFixed(1)}% - alta actividad`)
    } else if (trends.transactionGrowth < -10) {
      insights.push(`⚠️ Las transacciones han disminuido un ${Math.abs(trends.transactionGrowth).toFixed(1)}% - baja actividad`)
    }

    // Insights sobre staking
    const stakingRatio = metrics.stakingMetrics.totalStaked / (metrics.totalSupply.cmpx || 1)
    if (stakingRatio > 0.3) {
      insights.push(`🔒 Alto ratio de staking (${(stakingRatio * 100).toFixed(1)}%) - tokens bien distribuidos`)
    } else if (stakingRatio < 0.1) {
      insights.push(`💡 Bajo ratio de staking (${(stakingRatio * 100).toFixed(1)}%) - oportunidad de incentivos`)
    }

    // Insights sobre usuarios
    if (trends.userGrowth > 15) {
      insights.push(`👥 Crecimiento de usuarios activos del ${trends.userGrowth.toFixed(1)}% - excelente adopción`)
    }

    return insights
  }
}

// Exportar instancia singleton
export const tokenAnalytics = TokenAnalyticsService.getInstance()
