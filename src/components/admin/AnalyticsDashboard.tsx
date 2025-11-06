/**
 * =====================================================
 * ANALYTICS DASHBOARD
 * =====================================================
 * Dashboard en tiempo real para monitoreo de métricas y errores
 * Fecha: 2025-10-28
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  SignalIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import performanceMonitoring from '@/services/PerformanceMonitoringService';
import errorAlertService from '@/services/ErrorAlertService';
import { logger } from '@/lib/logger';
import { AlertConfigPanel } from './AlertConfigPanel';
import { ExportButton } from './ExportButton';
import { DesktopNotificationSettings } from './DesktopNotificationSettings';
import { ModerationMetricsPanel } from './ModerationMetrics';
import { HistoricalCharts } from './HistoricalCharts';
import { WebhookConfigPanel } from './WebhookConfigPanel';
// ExportData se usa como tipo en props de ExportButton, no necesita import directo

// =====================================================
// INTERFACES
// =====================================================

interface DashboardMetrics {
  performance: {
    avgLoadTime: number;
    avgInteractionTime: number;
    totalRequests: number;
    failedRequests: number;
    memoryUsage: number;
  };
  errors: {
    total: number;
    bySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    byCategory: {
      frontend: number;
      backend: number;
      network: number;
      database: number;
      auth: number;
      unknown: number;
    };
    resolved: number;
    unresolved: number;
    last24Hours: number;
  };
  webVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
}

// =====================================================
// COMPONENT
// =====================================================

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    performance: {
      avgLoadTime: 0,
      avgInteractionTime: 0,
      totalRequests: 0,
      failedRequests: 0,
      memoryUsage: 0
    },
    errors: {
      total: 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byCategory: {
        frontend: 0,
        backend: 0,
        network: 0,
        database: 0,
        auth: 0,
        unknown: 0
      },
      resolved: 0,
      unresolved: 0,
      last24Hours: 0
    },
    webVitals: {}
  });

  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'moderation' | 'historical'>('overview');

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    loadMetrics();

    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // =====================================================
  // FUNCTIONS
  // =====================================================

  const loadMetrics = () => {
    try {
      // Load performance metrics
      const perfReport = performanceMonitoring.generateReport(60);
      const webVitals = performanceMonitoring.getWebVitals();

      // Load error statistics
      const errorStats = errorAlertService.getStatistics();

      setMetrics({
        performance: perfReport.summary,
        errors: errorStats,
        webVitals
      });

      logger.debug('Dashboard metrics updated');
    } catch (error) {
      logger.error('Error loading dashboard metrics:', { error: String(error) });
    }
  };

  // =====================================================
  // HELPER COMPONENTS
  // =====================================================

  const SimpleBarChart = ({ data, max }: { data: Array<{ label: string; value: number; color: string }>; max: number }) => (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min((item.value / max) * 100, 100)}%`,
                backgroundColor: item.color
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoreo en tiempo real de performance y errores
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto Refresh</span>
          </label>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>

          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh Now
          </button>

          {/* Botón de Exportación */}
          <ExportButton
            data={{
              metrics: performanceMonitoring.getMetrics({}),
              alerts: errorAlertService.getAlerts({}),
              report: performanceMonitoring.generateReport(24), // Últimas 24 horas
              metadata: {
                exportDate: new Date().toISOString(),
                appVersion: '3.4.1',
                totalRecords: performanceMonitoring.getMetrics({}).length + errorAlertService.getAlerts({}).length
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span className="font-medium">Overview</span>
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'moderation'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="font-medium">Moderación</span>
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('historical')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'historical'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <SignalIcon className="h-5 w-5" />
              <span className="font-medium">Histórico</span>
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="font-medium">Configuración</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Avg Load Time */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Load Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.performance.avgLoadTime}ms
              </p>
            </div>
            <ClockIcon className="w-12 h-12 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((metrics.performance.avgLoadTime / 4000) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.performance.totalRequests}
              </p>
            </div>
            <ServerIcon className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {metrics.performance.failedRequests} failed
          </p>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.performance.memoryUsage}MB
              </p>
            </div>
            <SignalIcon className="w-12 h-12 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((metrics.performance.memoryUsage / 200) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unresolved Errors</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.errors.unresolved}
              </p>
            </div>
            <ExclamationTriangleIcon
              className={`w-12 h-12 ${
                metrics.errors.unresolved > 0 ? 'text-red-500' : 'text-green-500'
              }`}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {metrics.errors.bySeverity.critical} critical, {metrics.errors.bySeverity.high} high
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Performance
          </h3>
          <SimpleBarChart
            data={[
              { label: 'Load Time', value: metrics.performance.avgLoadTime, color: '#3b82f6' },
              { label: 'Interaction', value: metrics.performance.avgInteractionTime, color: '#10b981' },
              { label: 'Memory (MB)', value: metrics.performance.memoryUsage, color: '#8b5cf6' }
            ]}
            max={Math.max(metrics.performance.avgLoadTime, metrics.performance.avgInteractionTime, metrics.performance.memoryUsage * 10)}
          />
        </div>

        {/* Errors by Severity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚨 Errors by Severity
          </h3>
          <SimpleBarChart
            data={[
              { label: 'Critical', value: metrics.errors.bySeverity.critical, color: '#ef4444' },
              { label: 'High', value: metrics.errors.bySeverity.high, color: '#f97316' },
              { label: 'Medium', value: metrics.errors.bySeverity.medium, color: '#eab308' },
              { label: 'Low', value: metrics.errors.bySeverity.low, color: '#22c55e' }
            ]}
            max={Math.max(...Object.values(metrics.errors.bySeverity)) || 1}
          />
        </div>

        {/* Web Vitals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ Web Vitals
          </h3>
          <SimpleBarChart
            data={[
              { label: 'LCP', value: metrics.webVitals.lcp || 0, color: '#10b981' },
              { label: 'FCP', value: metrics.webVitals.fcp || 0, color: '#06b6d4' }
            ]}
            max={4000}
          />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔔 Recent Alerts (Last 24h)
        </h3>
        <div className="space-y-3">
          {errorAlertService
            .getAlerts({
              since: new Date(Date.now() - 24 * 60 * 60 * 1000),
              resolved: false
            })
            .slice(0, 5)
            .map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {alert.severity === 'critical' && (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  )}
                  {alert.severity === 'high' && (
                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  )}
                  {alert.severity === 'medium' && (
                    <ChartBarIcon className="w-6 h-6 text-yellow-500" />
                  )}
                  {alert.severity === 'low' && (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.category} • {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => errorAlertService.resolveAlert(alert.id)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Resolve
                </button>
              </div>
            ))}

          {errorAlertService.getAlerts({ resolved: false }).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              ✅ No unresolved alerts
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <ModerationMetricsPanel refreshInterval={refreshInterval / 1000} />
      )}

      {/* Historical Tab */}
      {activeTab === 'historical' && (
        <div className="mt-6">
          <HistoricalCharts refreshInterval={refreshInterval / 1000} />
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="mt-6 space-y-6">
          <AlertConfigPanel />
          <DesktopNotificationSettings />
          <WebhookConfigPanel />
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

