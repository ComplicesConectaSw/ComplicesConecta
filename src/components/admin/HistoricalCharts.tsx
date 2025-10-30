/**
 * =====================================================
 * HISTORICAL CHARTS COMPONENT
 * =====================================================
 * Gráficos históricos avanzados con Recharts
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

import historicalMetricsService, {
  type PerformanceTrendData,
  type ErrorTrendData,
  type WebVitalsTrendData,
  type ModerationTrendData
} from '@/services/HistoricalMetricsService';
import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

interface HistoricalChartsProps {
  timeRange?: number; // en horas
  refreshInterval?: number; // en segundos
}

// =====================================================
// COMPONENT
// =====================================================

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({
  timeRange = 24,
  refreshInterval = 60
}) => {
  const [performanceData, setPerformanceData] = useState<PerformanceTrendData | null>(null);
  const [errorData, setErrorData] = useState<ErrorTrendData | null>(null);
  const [webVitalsData, setWebVitalsData] = useState<WebVitalsTrendData | null>(null);
  const [moderationData, setModerationData] = useState<ModerationTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<number>(timeRange);

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedRange, refreshInterval]);

  // =====================================================
  // FUNCTIONS
  // =====================================================

  const fetchAllData = async () => {
    try {
      const [perf, errors, vitals, moderation] = await Promise.all([
        historicalMetricsService.getPerformanceTrends({ hours: selectedRange }),
        historicalMetricsService.getErrorTrends({ hours: selectedRange }),
        historicalMetricsService.getWebVitalsTrends({ hours: selectedRange }),
        historicalMetricsService.getModerationTrends({ days: selectedRange > 24 ? 7 : 1 })
      ]);

      setPerformanceData(perf);
      setErrorData(errors);
      setWebVitalsData(vitals);
      setModerationData(moderation);
      setLoading(false);
    } catch (error) {
      logger.error('Error fetching historical data:', { error: String(error) });
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderPerformanceChart = () => {
    if (!performanceData || performanceData.loadTime.length === 0) {
      return <EmptyState message="No hay datos de performance disponibles" />;
    }

    // Combinar datos para el gráfico
    const combinedData = performanceData.loadTime.map((item, index) => ({
      timestamp: item.label || item.timestamp,
      loadTime: item.value,
      interactionTime: performanceData.interactionTime[index]?.value || 0,
      memoryUsage: performanceData.memoryUsage[index]?.value || 0
    }));

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Tendencias de Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="loadTime"
              name="Load Time (ms)"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="interactionTime"
              name="Interaction Time (ms)"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="memoryUsage"
              name="Memory (MB)"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderErrorChart = () => {
    if (!errorData || errorData.total.length === 0) {
      return <EmptyState message="No hay datos de errores disponibles" />;
    }

    // Combinar datos para el gráfico
    const combinedData = errorData.total.map((item, index) => ({
      timestamp: item.label || item.timestamp,
      total: item.value,
      critical: errorData.critical[index]?.value || 0,
      high: errorData.high[index]?.value || 0,
      medium: errorData.medium[index]?.value || 0,
      low: errorData.low[index]?.value || 0
    }));

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🚨 Distribución de Errores por Severidad
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="critical"
              name="Crítico"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="high"
              name="Alto"
              stackId="1"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="medium"
              name="Medio"
              stackId="1"
              stroke="#EAB308"
              fill="#EAB308"
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="low"
              name="Bajo"
              stackId="1"
              stroke="#22C55E"
              fill="#22C55E"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderWebVitalsChart = () => {
    if (!webVitalsData || webVitalsData.lcp.length === 0) {
      return <EmptyState message="No hay datos de Web Vitals disponibles" />;
    }

    // Combinar datos para el gráfico
    const combinedData = webVitalsData.lcp.map((item, index) => ({
      timestamp: item.label || item.timestamp,
      lcp: item.value,
      fcp: webVitalsData.fcp[index]?.value || 0,
      fid: webVitalsData.fid[index]?.value || 0,
      ttfb: webVitalsData.ttfb[index]?.value || 0
    }));

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Web Vitals - Core Metrics
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Bar dataKey="lcp" name="LCP (ms)" fill="#10B981" />
            <Bar dataKey="fcp" name="FCP (ms)" fill="#06B6D4" />
            <Line
              type="monotone"
              dataKey="fid"
              name="FID (ms)"
              stroke="#F59E0B"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="ttfb"
              name="TTFB (ms)"
              stroke="#8B5CF6"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderModerationChart = () => {
    if (!moderationData || moderationData.total.length === 0) {
      return <EmptyState message="No hay datos de moderación disponibles" />;
    }

    // Combinar datos para el gráfico
    const combinedData = moderationData.total.map((item, index) => ({
      timestamp: item.label || item.timestamp,
      total: item.value,
      pending: moderationData.pending[index]?.value || 0,
      underReview: moderationData.underReview[index]?.value || 0,
      resolved: moderationData.resolved[index]?.value || 0,
      dismissed: moderationData.dismissed[index]?.value || 0
    }));

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🛡️ Actividad de Moderación
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Bar dataKey="pending" name="Pendientes" stackId="a" fill="#F59E0B" />
            <Bar dataKey="underReview" name="En Revisión" stackId="a" fill="#3B82F6" />
            <Bar dataKey="resolved" name="Resueltos" stackId="a" fill="#10B981" />
            <Bar dataKey="dismissed" name="Descartados" stackId="a" fill="#6B7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de rango */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Gráficos Históricos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tendencias y análisis temporal de métricas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Rango:</span>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={1}>Última hora</option>
            <option value={6}>Últimas 6 horas</option>
            <option value={12}>Últimas 12 horas</option>
            <option value={24}>Últimas 24 horas</option>
            <option value={48}>Últimas 48 horas</option>
            <option value={168}>Última semana</option>
          </select>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 gap-6">
        {renderPerformanceChart()}
        {renderErrorChart()}
        {renderWebVitalsChart()}
        {renderModerationChart()}
      </div>
    </div>
  );
};

// =====================================================
// HELPER COMPONENTS
// =====================================================

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 dark:text-gray-600 mb-4">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

export default HistoricalCharts;

