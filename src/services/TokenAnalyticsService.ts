import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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
  metadata: Record<string, unknown>
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

export class TokenAnalyticsService {
  private static instance: TokenAnalyticsService
  private analyticsCache: Map<string, { data: any; timestamp: number }> = new Map()
  private intervalCache: Map<string, NodeJS.Timeout> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos
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

  async generateCurrentMetrics(): Promise<MetricsResponse> {
    try {
      // Verificar cache primero
      const cacheKey = 'current_metrics';
      const cached = this.analyticsCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info('📊 Using cached metrics');
        return { success: true, metrics: cached.data };
      }

      logger.info('📊 Generating fresh metrics from database');
      
      // Verificar que supabase esté disponible
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }
      
      // Obtener métricas reales de las tablas de Supabase con consultas optimizadas
      const [
        _tokenAnalyticsResult,
        userBalancesResult,
        stakingResult,
        transactionsResult,
        userStatsResult
      ] = await Promise.allSettled([
        // Obtener analytics más recientes
        supabase
          .from('token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        
        // Obtener balances totales de usuarios (optimizado)
        supabase
          .from('user_token_balances')
          .select('cmpx_balance, gtk_balance')
          .not('cmpx_balance', 'is', null)
          .not('gtk_balance', 'is', null),
        
        // Obtener métricas de staking (optimizado)
        supabase
          .from('staking_records')
          .select('amount, start_date, end_date, created_at')
          .eq('status', 'active'),
        
        // Obtener transacciones recientes (optimizado)
        supabase
          .from('token_transactions')
          .select('amount, token_type, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // Obtener estadísticas de usuarios (optimizado)
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Procesar resultados y calcular métricas
      const metrics: TokenMetrics = {
        totalSupply: {
          cmpx: 1000000, // Supply fijo para CMPX
          gtk: 5000000   // Supply fijo para GTK
        },
        circulatingSupply: {
          cmpx: 0,
          gtk: 0
        },
        transactionVolume: {
          cmpx: 0,
          gtk: 0,
          count: 0
        },
        stakingMetrics: {
          totalStaked: 0,
          activeStakers: 0,
          avgDuration: 0
        },
        userMetrics: {
          activeUsers: 0,
          newUsers: 0
        }
      };

      // Calcular circulating supply desde balances de usuarios
      if (userBalancesResult.status === 'fulfilled' && userBalancesResult.value.data) {
        const balances = userBalancesResult.value.data;
        metrics.circulatingSupply.cmpx = balances.reduce((sum, balance) => 
          sum + (balance.cmpx_balance || 0), 0);
        metrics.circulatingSupply.gtk = balances.reduce((sum, balance) => 
          sum + (balance.gtk_balance || 0), 0);
      }

      // Calcular métricas de staking
      if (stakingResult.status === 'fulfilled' && stakingResult.value.data) {
        const stakingRecords = stakingResult.value.data;
        metrics.stakingMetrics.totalStaked = stakingRecords.reduce((sum: number, record: any) => 
          sum + (record.amount || 0), 0);
        metrics.stakingMetrics.activeStakers = stakingRecords.length;
        
        if (stakingRecords.length > 0) {
          // Calcular duración promedio desde start_date y end_date
          metrics.stakingMetrics.avgDuration = stakingRecords.reduce((sum: number, record: any) => {
            if (record.start_date && record.end_date) {
              const start = new Date(record.start_date);
              const end = new Date(record.end_date);
              const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }
            return sum;
          }, 0) / stakingRecords.length;
        }
      }

      // Calcular volumen de transacciones
      if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) {
        const transactions = transactionsResult.value.data;
        metrics.transactionVolume.count = transactions.length;
        
        transactions.forEach((transaction: any) => {
          if (transaction.token_type === 'cmpx') {
            metrics.transactionVolume.cmpx += transaction.amount || 0;
          } else if (transaction.token_type === 'gtk') {
            metrics.transactionVolume.gtk += transaction.amount || 0;
          }
        });
      }

      // Calcular métricas de usuarios
      if (userStatsResult.status === 'fulfilled' && userStatsResult.value.data) {
        metrics.userMetrics.newUsers = userStatsResult.value.data.length;
      }

      // Obtener usuarios activos (aproximación)
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }

      const activeUsersResult = await supabase
        .from('profiles')
        .select('id')
        .not('last_seen', 'is', null)
        .gte('last_seen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (activeUsersResult.data) {
        metrics.userMetrics.activeUsers = activeUsersResult.data.length;
      }

      // Guardar en cache
      this.analyticsCache.set(cacheKey, { data: metrics, timestamp: Date.now() });

      return { success: true, metrics };
    } catch (error) {
      logger.error('Error generating metrics:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: String(error) };
    }
  }

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
          avgDuration: metrics.stakingMetrics.avgDuration,
          activeUsers: metrics.userMetrics.activeUsers,
          newUsers: metrics.userMetrics.newUsers
        }
      };

      // Verificar que supabase esté disponible
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }

      // Guardar en la base de datos real
      const { data, error } = await supabase
        .from('token_analytics')
        .insert(analyticsData)
        .select()
        .single();

      if (error) {
        logger.error('Error saving analytics to database:', { error: error.message });
        return { success: false, error: error.message };
      }

      return { success: true, analytics: [data as TokenAnalytics] };
    } catch (error) {
      logger.error('Error in saveAnalytics:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: String(error) };
    }
  }

  async getHistoricalAnalytics(
    periodType: PeriodType,
    limit: number = 30
  ): Promise<AnalyticsResponse> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { success: false, error: 'Supabase no está disponible' };
      }
      
      const { data, error } = await supabase
        .from('token_analytics')
        .select('*')
        .eq('period_type', periodType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error getting historical analytics:', { error: error.message });
        return { success: false, error: error.message };
      }

      return { success: true, analytics: (data || []) as TokenAnalytics[] };
    } catch (error) {
      logger.error('Error getting historical analytics:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: String(error) };
    }
  }

  async generateAutomaticReport(periodType: PeriodType = 'daily'): Promise<ReportResponse> {
    try {
      if (this.isGeneratingReports) {
        return { success: false, error: 'Report generation already in progress' };
      }

      this.isGeneratingReports = true;

      // Generate current metrics
      const metricsResponse = await this.generateCurrentMetrics();
      if (!metricsResponse.success || !metricsResponse.metrics) {
        return { success: false, error: 'Failed to generate metrics' };
      }

      const metrics = metricsResponse.metrics;

      // Get historical data for trends
      const historicalResponse = await this.getHistoricalAnalytics(periodType, 7);
      const historical = historicalResponse.analytics || [];

      // Calculate trends
      const trends = this.calculateTrends(historical, metrics);

      // Generate insights
      const insights = this.generateInsights(metrics, trends);

      // Save current analytics
      await this.saveAnalytics(
        periodType,
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        new Date(),
        metrics
      );

      this.isGeneratingReports = false;

      return {
        success: true,
        report: {
          summary: metrics,
          trends,
          insights
        }
      };
    } catch (error) {
      this.isGeneratingReports = false;
      logger.error('Error generating automatic report:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: String(error) };
    }
  }

  startAutomaticAnalytics(intervalHours: number = 1): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      try {
        logger.info('🔄 Generating automatic analytics report...');
        
        const report = await this.generateAutomaticReport('hourly');
        if (report.success) {
          logger.info('✅ Analytics report generated successfully');
        } else {
          logger.error('❌ Failed to generate analytics report:', { error: report.error });
        }
      } catch (error) {
        logger.error('❌ Error in automatic analytics:', { error: error instanceof Error ? error.message : String(error) });
      }
    }, intervalMs);

    this.intervalCache.set('automatic_analytics', intervalId);
    logger.info(`🚀 Automatic analytics started (every ${intervalHours} hours)`);
  }

  stopAutomaticAnalytics(): void {
    const intervalId = this.intervalCache.get('automatic_analytics');
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalCache.delete('automatic_analytics');
      logger.info('🛑 Automatic analytics stopped');
    }
  }

  /**
   * Limpiar cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.analyticsCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.analyticsCache.delete(key);
      }
    }
    logger.info('🧹 Expired cache cleared');
  }

  /**
   * Limpiar todo el cache
   */
  clearAllCache(): void {
    this.analyticsCache.clear();
    logger.info('🧹 All cache cleared');
  }

  private calculateTrends(historical: TokenAnalytics[], current: TokenMetrics): Record<string, number> {
    const trends: Record<string, number> = {};

    if (historical.length < 2) {
      return trends;
    }

    const _latest = historical[historical.length - 1];
    const previous = historical[historical.length - 2];

    trends.cmpx_supply_change = this.calculatePercentageChange(
      previous.total_cmpx_supply,
      current.totalSupply.cmpx
    );

    trends.gtk_supply_change = this.calculatePercentageChange(
      previous.total_gtk_supply,
      current.totalSupply.gtk
    );

    trends.transaction_volume_change = this.calculatePercentageChange(
      previous.transaction_volume_cmpx,
      current.transactionVolume.cmpx
    );

    trends.staking_change = this.calculatePercentageChange(
      previous.total_staked_cmpx,
      current.stakingMetrics.totalStaked
    );

    return trends;
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  private generateInsights(metrics: TokenMetrics, trends: Record<string, number>): string[] {
    const insights: string[] = [];

    // Supply insights
    if (trends.cmpx_supply_change > 0) {
      insights.push(`CMPX supply increased by ${trends.cmpx_supply_change.toFixed(1)}%`);
    }

    // Transaction insights
    if (metrics.transactionVolume.count > 1000) {
      insights.push('High transaction volume detected - platform activity is strong');
    }

    // Staking insights
    if (metrics.stakingMetrics.activeStakers > 100) {
      insights.push('Strong staking participation with over 100 active stakers');
    }

    // User growth insights
    if (metrics.userMetrics.newUsers > 20) {
      insights.push('Healthy user growth with significant new user registrations');
    }

    return insights;
  }
}

export default TokenAnalyticsService;