/**
 * =====================================================
 * HISTORICAL METRICS SERVICE
 * =====================================================
 * Servicio para obtener y procesar métricas históricas
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PerformanceTrendData {
  loadTime: TimeSeriesDataPoint[];
  interactionTime: TimeSeriesDataPoint[];
  memoryUsage: TimeSeriesDataPoint[];
  requests: TimeSeriesDataPoint[];
}

export interface ErrorTrendData {
  total: TimeSeriesDataPoint[];
  critical: TimeSeriesDataPoint[];
  high: TimeSeriesDataPoint[];
  medium: TimeSeriesDataPoint[];
  low: TimeSeriesDataPoint[];
}

export interface WebVitalsTrendData {
  lcp: TimeSeriesDataPoint[];
  fid: TimeSeriesDataPoint[];
  cls: TimeSeriesDataPoint[];
  fcp: TimeSeriesDataPoint[];
  ttfb: TimeSeriesDataPoint[];
}

export interface ModerationTrendData {
  pending: TimeSeriesDataPoint[];
  underReview: TimeSeriesDataPoint[];
  resolved: TimeSeriesDataPoint[];
  dismissed: TimeSeriesDataPoint[];
  total: TimeSeriesDataPoint[];
}

export interface HistoricalDataOptions {
  hours?: number;
  days?: number;
  interval?: 'hour' | 'day';
  startDate?: Date;
  endDate?: Date;
}

// =====================================================
// SERVICE CLASS
// =====================================================

class HistoricalMetricsService {
  private static instance: HistoricalMetricsService;

  private constructor() {}

  static getInstance(): HistoricalMetricsService {
    if (!HistoricalMetricsService.instance) {
      HistoricalMetricsService.instance = new HistoricalMetricsService();
    }
    return HistoricalMetricsService.instance;
  }

  /**
   * Obtener tendencias de performance
   */
  async getPerformanceTrends(options: HistoricalDataOptions = {}): Promise<PerformanceTrendData> {
    const { hours = 24, interval = 'hour' } = options;
    
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando datos vacíos');
        return this.getEmptyPerformanceTrends();
      }

      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        logger.error('Error fetching performance trends:', { error: String(error) });
        return this.getEmptyPerformanceTrends();
      }

      if (!data || data.length === 0) {
        return this.getEmptyPerformanceTrends();
      }

      // Agrupar por intervalo
      const grouped = this.groupByInterval(data, interval);

      return {
        loadTime: this.extractMetric(grouped, 'load_time'),
        interactionTime: this.extractMetric(grouped, 'interaction_time'),
        memoryUsage: this.extractMetric(grouped, 'memory_usage'),
        requests: this.extractMetric(grouped, 'total_requests')
      };
    } catch (error) {
      logger.error('Error processing performance trends:', { error: String(error) });
      return this.getEmptyPerformanceTrends();
    }
  }

  /**
   * Obtener tendencias de errores
   */
  async getErrorTrends(options: HistoricalDataOptions = {}): Promise<ErrorTrendData> {
    const { hours = 24, interval = 'hour' } = options;
    
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando datos vacíos');
        return this.getEmptyErrorTrends();
      }

      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('error_alerts')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        logger.error('Error fetching error trends:', { error: String(error) });
        return this.getEmptyErrorTrends();
      }

      if (!data || data.length === 0) {
        return this.getEmptyErrorTrends();
      }

      // Agrupar por intervalo y severidad
      const grouped = this.groupByInterval(data, interval);
      
      return {
        total: this.countByInterval(grouped),
        critical: this.countBySeverity(grouped, 'critical'),
        high: this.countBySeverity(grouped, 'high'),
        medium: this.countBySeverity(grouped, 'medium'),
        low: this.countBySeverity(grouped, 'low')
      };
    } catch (error) {
      logger.error('Error processing error trends:', { error: String(error) });
      return this.getEmptyErrorTrends();
    }
  }

  /**
   * Obtener tendencias de Web Vitals
   */
  async getWebVitalsTrends(options: HistoricalDataOptions = {}): Promise<WebVitalsTrendData> {
    const { hours = 24, interval = 'hour' } = options;
    
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando datos vacíos');
        return this.getEmptyWebVitalsTrends();
      }

      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('web_vitals_history')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        logger.error('Error fetching web vitals trends:', { error: String(error) });
        return this.getEmptyWebVitalsTrends();
      }

      if (!data || data.length === 0) {
        return this.getEmptyWebVitalsTrends();
      }

      // Agrupar por intervalo
      const grouped = this.groupByInterval(data, interval);

      return {
        lcp: this.extractMetric(grouped, 'lcp'),
        fid: this.extractMetric(grouped, 'fid'),
        cls: this.extractMetric(grouped, 'cls'),
        fcp: this.extractMetric(grouped, 'fcp'),
        ttfb: this.extractMetric(grouped, 'ttfb')
      };
    } catch (error) {
      logger.error('Error processing web vitals trends:', { error: String(error) });
      return this.getEmptyWebVitalsTrends();
    }
  }

  /**
   * Obtener tendencias de moderación
   */
  async getModerationTrends(options: HistoricalDataOptions = {}): Promise<ModerationTrendData> {
    const { days = 7, interval = 'day' } = options;
    
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible, retornando datos vacíos');
        return this.getEmptyModerationTrends();
      }

      const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('reports')
        .select('created_at, status')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching moderation trends:', { error: String(error) });
        return this.getEmptyModerationTrends();
      }

      if (!data || data.length === 0) {
        return this.getEmptyModerationTrends();
      }

      // Agrupar por intervalo
      const grouped = this.groupByInterval(data.map(r => ({ ...r, timestamp: r.created_at })), interval);

      return {
        total: this.countByInterval(grouped),
        pending: this.countByStatus(grouped, 'pending'),
        underReview: this.countByStatus(grouped, 'under_review'),
        resolved: this.countByStatus(grouped, 'resolved'),
        dismissed: this.countByStatus(grouped, 'dismissed')
      };
    } catch (error) {
      logger.error('Error processing moderation trends:', { error: String(error) });
      return this.getEmptyModerationTrends();
    }
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private groupByInterval(data: any[], interval: 'hour' | 'day'): Map<string, any[]> {
    const grouped = new Map<string, any[]>();

    data.forEach(item => {
      const date = new Date(item.timestamp || item.created_at);
      let key: string;

      if (interval === 'hour') {
        // Formato: YYYY-MM-DD HH:00
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        // Formato: YYYY-MM-DD
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    return grouped;
  }

  private extractMetric(grouped: Map<string, any[]>, metricName: string): TimeSeriesDataPoint[] {
    const result: TimeSeriesDataPoint[] = [];

    grouped.forEach((items, timestamp) => {
      const values = items
        .map(item => item[metricName])
        .filter(v => v !== null && v !== undefined && !isNaN(v));

      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        result.push({
          timestamp,
          value: Math.round(avg * 100) / 100,
          label: this.formatTimestamp(timestamp)
        });
      }
    });

    return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private countByInterval(grouped: Map<string, any[]>): TimeSeriesDataPoint[] {
    const result: TimeSeriesDataPoint[] = [];

    grouped.forEach((items, timestamp) => {
      result.push({
        timestamp,
        value: items.length,
        label: this.formatTimestamp(timestamp)
      });
    });

    return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private countBySeverity(grouped: Map<string, any[]>, severity: string): TimeSeriesDataPoint[] {
    const result: TimeSeriesDataPoint[] = [];

    grouped.forEach((items, timestamp) => {
      const count = items.filter(item => item.severity === severity).length;
      result.push({
        timestamp,
        value: count,
        label: this.formatTimestamp(timestamp)
      });
    });

    return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private countByStatus(grouped: Map<string, any[]>, status: string): TimeSeriesDataPoint[] {
    const result: TimeSeriesDataPoint[] = [];

    grouped.forEach((items, timestamp) => {
      const count = items.filter(item => item.status === status).length;
      result.push({
        timestamp,
        value: count,
        label: this.formatTimestamp(timestamp)
      });
    });

    return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private formatTimestamp(timestamp: string): string {
    const parts = timestamp.split(' ');
    if (parts.length === 2) {
      // Hour format: "2025-01-30 14:00" -> "14:00"
      return parts[1];
    }
    // Day format: "2025-01-30" -> "30 Ene"
    const date = new Date(timestamp);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  private getEmptyPerformanceTrends(): PerformanceTrendData {
    return {
      loadTime: [],
      interactionTime: [],
      memoryUsage: [],
      requests: []
    };
  }

  private getEmptyErrorTrends(): ErrorTrendData {
    return {
      total: [],
      critical: [],
      high: [],
      medium: [],
      low: []
    };
  }

  private getEmptyWebVitalsTrends(): WebVitalsTrendData {
    return {
      lcp: [],
      fid: [],
      cls: [],
      fcp: [],
      ttfb: []
    };
  }

  private getEmptyModerationTrends(): ModerationTrendData {
    return {
      total: [],
      pending: [],
      underReview: [],
      resolved: [],
      dismissed: []
    };
  }
}

// Export singleton instance
export const historicalMetricsService = HistoricalMetricsService.getInstance();
export default historicalMetricsService;

