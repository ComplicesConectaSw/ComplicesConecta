/**
 * =====================================================
 * MODERATION METRICS SERVICE
 * =====================================================
 * Servicio para obtener métricas de moderación en tiempo real
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export interface ModerationMetrics {
  reports: {
    total: number;
    byStatus: {
      pending: number;
      under_review: number;
      resolved: number;
      dismissed: number;
    };
    bySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    byType: {
      profile: number;
      post: number;
      message: number;
      other: number;
    };
    avgResolutionTime: number; // en horas
    last24Hours: number;
    last7Days: number;
  };
  moderators: {
    activeCount: number;
    totalActions: number;
    avgResponseTime: number;
  };
}

export interface ReportTrend {
  date: string;
  pending: number;
  resolved: number;
  dismissed: number;
  total: number;
}

// =====================================================
// SERVICE CLASS
// =====================================================

class ModerationMetricsService {
  private static instance: ModerationMetricsService;
  private cache: ModerationMetrics | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minuto

  private constructor() {}

  static getInstance(): ModerationMetricsService {
    if (!ModerationMetricsService.instance) {
      ModerationMetricsService.instance = new ModerationMetricsService();
    }
    return ModerationMetricsService.instance;
  }

  /**
   * Obtener métricas de moderación
   */
  async getMetrics(): Promise<ModerationMetrics> {
    // Check cache
    const now = Date.now();
    if (this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return this.getDefaultMetrics();
      }

      // Obtener todos los reportes
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching reports:', { error: String(error) });
        return this.getDefaultMetrics();
      }

      if (!reports || reports.length === 0) {
        return this.getDefaultMetrics();
      }

      // Calcular métricas
      const metrics: ModerationMetrics = {
        reports: {
          total: reports.length,
          byStatus: {
            pending: reports.filter(r => r.status === 'pending').length,
            under_review: reports.filter(r => r.status === 'under_review').length,
            resolved: reports.filter(r => r.status === 'resolved').length,
            dismissed: reports.filter(r => r.status === 'dismissed').length,
          },
          bySeverity: {
            low: reports.filter(r => r.severity === 'low').length,
            medium: reports.filter(r => r.severity === 'medium').length,
            high: reports.filter(r => r.severity === 'high').length,
            critical: reports.filter(r => r.severity === 'critical').length,
          },
          byType: {
            profile: reports.filter(r => (r.content_type || r.report_type) === 'profile').length,
            post: reports.filter(r => (r.content_type || r.report_type) === 'post' || (r.content_type || r.report_type) === 'story').length,
            message: reports.filter(r => (r.content_type || r.report_type) === 'message').length,
            other: reports.filter(r => !['profile', 'post', 'story', 'message'].includes((r.content_type || r.report_type) || '')).length,
          },
          avgResolutionTime: this.calculateAvgResolutionTime(reports),
          last24Hours: this.getReportsInTimeRange(reports, 24),
          last7Days: this.getReportsInTimeRange(reports, 24 * 7),
        },
        moderators: {
          activeCount: await this.getActiveModeratorsCount(),
          totalActions: reports.filter(r => r.resolved_by).length,
          avgResponseTime: this.calculateAvgResponseTime(reports),
        }
      };

      // Update cache
      this.cache = metrics;
      this.cacheExpiry = now + this.CACHE_DURATION;

      return metrics;
    } catch (error) {
      logger.error('Error calculating moderation metrics:', { error: String(error) });
      return this.getDefaultMetrics();
    }
  }

  /**
   * Obtener tendencias de reportes
   */
  async getReportTrends(days: number = 7): Promise<ReportTrend[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: reports, error } = await supabase
        .from('reports')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error || !reports) {
        logger.error('Error fetching report trends:', { error: String(error) });
        return [];
      }

      // Agrupar por día
      const trendsByDay: Record<string, ReportTrend> = {};

      reports.forEach(report => {
        const date = new Date(report.created_at).toISOString().split('T')[0];
        
        if (!trendsByDay[date]) {
          trendsByDay[date] = {
            date,
            pending: 0,
            resolved: 0,
            dismissed: 0,
            total: 0
          };
        }

        trendsByDay[date].total++;
        if (report.status === 'pending') trendsByDay[date].pending++;
        if (report.status === 'resolved') trendsByDay[date].resolved++;
        if (report.status === 'dismissed') trendsByDay[date].dismissed++;
      });

      return Object.values(trendsByDay).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('Error calculating report trends:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener reportes pendientes de alta prioridad
   */
  async getHighPriorityReports(): Promise<number> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return 0;
      }

      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'under_review'])
        .in('severity', ['high', 'critical']);

      if (error) {
        logger.error('Error fetching high priority reports:', { error: String(error) });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error getting high priority reports:', { error: String(error) });
      return 0;
    }
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private calculateAvgResolutionTime(reports: any[]): number {
    const resolved = reports.filter(r => r.resolved_at && r.created_at);
    
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, report) => {
      const created = new Date(report.created_at).getTime();
      const resolvedAt = new Date(report.resolved_at).getTime();
      return sum + (resolvedAt - created);
    }, 0);

    // Retornar en horas
    return totalTime / resolved.length / (1000 * 60 * 60);
  }

  private calculateAvgResponseTime(reports: any[]): number {
    const actioned = reports.filter(r => r.resolved_by && r.created_at && r.updated_at);
    
    if (actioned.length === 0) return 0;

    const totalTime = actioned.reduce((sum, report) => {
      const created = new Date(report.created_at).getTime();
      const updated = new Date(report.updated_at).getTime();
      return sum + (updated - created);
    }, 0);

    // Retornar en horas
    return totalTime / actioned.length / (1000 * 60 * 60);
  }

  private getReportsInTimeRange(reports: any[], hours: number): number {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return reports.filter(r => new Date(r.created_at).getTime() > cutoff).length;
  }

  private async getActiveModeratorsCount(): Promise<number> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return 0;
      }

      const { data, error } = await supabase
        .from('reports')
        .select('resolved_by')
        .not('resolved_by', 'is', null)
        .gte('resolved_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error || !data) return 0;

      // Contar moderadores únicos
      const uniqueModerators = new Set(data.map(r => r.resolved_by));
      return uniqueModerators.size;
    } catch {
      return 0;
    }
  }

  private getDefaultMetrics(): ModerationMetrics {
    return {
      reports: {
        total: 0,
        byStatus: {
          pending: 0,
          under_review: 0,
          resolved: 0,
          dismissed: 0,
        },
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
        byType: {
          profile: 0,
          post: 0,
          message: 0,
          other: 0,
        },
        avgResolutionTime: 0,
        last24Hours: 0,
        last7Days: 0,
      },
      moderators: {
        activeCount: 0,
        totalActions: 0,
        avgResponseTime: 0,
      }
    };
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const moderationMetricsService = ModerationMetricsService.getInstance();
export default moderationMetricsService;

