import { supabase } from '@/integrations/supabase/client';

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
  private analyticsCache: Map<string, NodeJS.Timeout | unknown> = new Map()
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
      // Mock implementation with realistic data
      const mockMetrics: TokenMetrics = {
        totalSupply: {
          cmpx: 1000000,
          gtk: 5000000
        },
        circulatingSupply: {
          cmpx: 750000,
          gtk: 3750000
        },
        transactionVolume: {
          cmpx: 50000,
          gtk: 250000,
          count: 1250
        },
        stakingMetrics: {
          totalStaked: 200000,
          activeStakers: 150,
          avgDuration: 30
        },
        userMetrics: {
          activeUsers: 500,
          newUsers: 25
        }
      };

      return { success: true, metrics: mockMetrics };
    } catch (error) {
      console.error('Error generating metrics:', error);
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
      // Mock implementation since token_analytics table doesn't exist
      const analyticsData: TokenAnalytics = {
        id: crypto.randomUUID(),
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
        },
        created_at: new Date().toISOString()
      };

      // Store in localStorage as fallback
      const existingData = localStorage.getItem('token_analytics') || '[]';
      const data = JSON.parse(existingData);
      data.push(analyticsData);
      localStorage.setItem('token_analytics', JSON.stringify(data));

      return { success: true, analytics: [analyticsData] };
    } catch (error) {
      console.error('Error in saveAnalytics:', error);
      return { success: false, error: String(error) };
    }
  }

  async getHistoricalAnalytics(
    periodType: PeriodType,
    limit: number = 30
  ): Promise<AnalyticsResponse> {
    try {
      // Mock implementation - return data from localStorage
      const storedData = localStorage.getItem('token_analytics');
      if (!storedData) {
        return { success: true, analytics: [] };
      }

      const data = JSON.parse(storedData) as TokenAnalytics[];
      const filteredData = data
        .filter(item => item.period_type === periodType)
        .slice(-limit);

      return { success: true, analytics: filteredData };
    } catch (error) {
      console.error('Error getting historical analytics:', error);
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
      console.error('Error generating automatic report:', error);
      return { success: false, error: String(error) };
    }
  }

  startAutomaticAnalytics(intervalHours: number = 1): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      try {
        console.log('🔄 Generating automatic analytics report...');
        
        const report = await this.generateAutomaticReport('hourly');
        if (report.success) {
          console.log('✅ Analytics report generated successfully');
        } else {
          console.error('❌ Failed to generate analytics report:', report.error);
        }
      } catch (error) {
        console.error('❌ Error in automatic analytics:', error);
      }
    }, intervalMs);

    this.analyticsCache.set('automatic_analytics', intervalId);
    console.log(`🚀 Automatic analytics started (every ${intervalHours} hours)`);
  }

  stopAutomaticAnalytics(): void {
    const intervalId = this.analyticsCache.get('automatic_analytics') as NodeJS.Timeout;
    if (intervalId) {
      clearInterval(intervalId);
      this.analyticsCache.delete('automatic_analytics');
      console.log('🛑 Automatic analytics stopped');
    }
  }

  private calculateTrends(historical: TokenAnalytics[], current: TokenMetrics): Record<string, number> {
    const trends: Record<string, number> = {};

    if (historical.length < 2) {
      return trends;
    }

    const latest = historical[historical.length - 1];
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