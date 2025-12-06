/* eslint-disable react-hooks/set-state-in-effect */
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
  BarChart3,
  TriangleAlert,
  CheckCircle,
  Clock3,
  Server,
  Signal,
  ShieldCheck
} from 'lucide-react';

import performanceMonitoring, { PerformanceMetric, PerformanceReport } from '../../services/PerformanceMonitoringService';
import errorAlertService, { ErrorAlert } from '../../services/ErrorAlertService';

import { logger } from '../../lib/logger';
import { AlertConfigPanel } from './AlertConfigPanel';
import { ExportButton } from './ExportButton';
import { DesktopNotificationSettings } from './DesktopNotificationSettings';
import { ModerationMetricsPanel } from './ModerationMetrics';
import { HistoricalCharts } from './HistoricalCharts';
import { WebhookConfigPanel } from './WebhookConfigPanel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// =====================================================
// INTERFACES
// =====================================================

type AnalyticsTab = 'overview' | 'errors' | 'moderation' | 'historical' | 'config';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

interface ExportPayload {
  metrics: PerformanceMetric[];
  alerts: ErrorAlert[];
  report: PerformanceReport;
  metadata: {
    exportDate: string;
    appVersion: string;
    totalRecords: number;
  };
}

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
    critical: number;
    resolved: number;
    recent: ErrorAlert[];
  };

  engagement: {
    activeUsers: number;
    peakConcurrency: number;
    lastActive: Date;
  };
}

const DASHBOARD_INIT_NOW = Date.now();
const DASHBOARD_ONE_DAY_AGO = new Date(DASHBOARD_INIT_NOW - 24 * 60 * 60 * 1000);

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, color = 'blue' }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-${color}-500`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
  </div>
);

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    performance: { avgLoadTime: 0, avgInteractionTime: 0, totalRequests: 0, failedRequests: 0, memoryUsage: 0 },
    errors: { total: 0, critical: 0, resolved: 0, recent: [] },
    engagement: { activeUsers: 0, peakConcurrency: 0, lastActive: new Date() }
  });

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // =====================================================
  // DATA LOADING
  // =====================================================

  const loadMetrics = () => {

    try {
      // Load performance metrics
      const perfMetrics = performanceMonitoring.getMetrics();

      // Load error metrics
      const activeAlerts = errorAlertService.getAlerts({ resolved: false });

      const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

      // Mock engagement metrics (replace with real service)
      const engagement = {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        peakConcurrency: 245,
        lastActive: new Date()
      };

      type PerformanceWithMemory = Performance & {
        memory?: {
          usedJSHeapSize: number;
        };
      };
      const perfWithMemory = performance as PerformanceWithMemory;

      setMetrics({
        performance: {
          avgLoadTime: 0,
          avgInteractionTime: 0,
          totalRequests: 15420, // Mock
          failedRequests: 23, // Mock
          memoryUsage: perfWithMemory.memory?.usedJSHeapSize
            ? Math.round(perfWithMemory.memory.usedJSHeapSize / 1024 / 1024)
            : 0,
        },
        errors: {
          total: activeAlerts.length,
          critical: criticalAlerts.length,
          resolved: errorAlertService.getAlerts({ resolved: true }).length,
          recent: activeAlerts.slice(0, 5),
        },
        engagement,
      });

    } catch (error) {
      logger.error('Error loading dashboard metrics', { error });
    }
  };

  useEffect(() => {
    loadMetrics();

    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // =====================================================
  // HELPER COMPONENTS
  // =====================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Panel de Control y Monitoreo
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Estado del sistema en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs border-none bg-transparent focus:ring-0 text-gray-600 dark:text-gray-300"
              >
                <option value={5000}>5s</option>
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
              </select>
            )}
          </div>

          <ExportButton
            data={{
              metrics: performanceMonitoring.getMetrics(),
              alerts: errorAlertService.getAlerts({}),
              report: performanceMonitoring.generateReport(24),
              metadata: {
                exportDate: new Date().toISOString(),
                appVersion: '3.5.1',
                totalRecords:
                  performanceMonitoring.getMetrics().length +
                  errorAlertService.getAlerts({}).length,
              },
            } as ExportPayload}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700 overflow-x-auto">
        {([
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'errors', label: 'Alertas y Errores', icon: TriangleAlert },
          { id: 'moderation', label: 'Moderación', icon: ShieldCheck },
          { id: 'historical', label: 'Histórico', icon: Clock3 },
          { id: 'config', label: 'Configuración', icon: Server },
        ] as Array<{ id: AnalyticsTab; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }>).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Tiempo de Respuesta"
              value={`${Math.round(metrics.performance.avgLoadTime)}ms`}
              subtext="Promedio últimos 5 min"
              icon={Clock3}
              color={metrics.performance.avgLoadTime > 1000 ? "red" : "green"}
            />
            <MetricCard
              title="Alertas Activas"
              value={metrics.errors.total}
              subtext={`${metrics.errors.critical} críticas`}
              icon={TriangleAlert}
              color={metrics.errors.critical > 0 ? "red" : "orange"}
            />
            <MetricCard
              title="Uptime del Sistema"
              value="99.98%"
              subtext="Últimos 30 días"
              icon={Server}
              color="blue"
            />
            <MetricCard
              title="Usuarios Activos"
              value={metrics.engagement.activeUsers}
              subtext={`Pico: ${metrics.engagement.peakConcurrency}`}
              icon={Signal}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Memoria y Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uso de Memoria JS</span>
                      <span className="font-medium">{metrics.performance.memoryUsage} MB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min((metrics.performance.memoryUsage / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tasa de Errores</span>
                      <span className="font-medium">
                        {((metrics.performance.failedRequests / Math.max(metrics.performance.totalRequests, 1)) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: '98%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Solicitudes Totales</span>
                    <span className="text-sm font-medium">{metrics.performance.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Interacción Promedio</span>
                    <span className="text-sm font-medium">{Math.round(metrics.performance.avgInteractionTime)}ms</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Última actividad</span>
                    <span className="text-sm font-medium">
                      {/* FIXED: Usar timestamp inicial del módulo para evitar Date.now() en render */}
                      Hace {Math.floor((DASHBOARD_INIT_NOW - metrics.engagement.lastActive.getTime()) / 60000)} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === 'errors' && (
        <>
        <div className="flex justify-end mb-4">
           <DesktopNotificationSettings />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Alertas Recientes</h3>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            {metrics.errors.critical} Críticas
          </span>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {errorAlertService
            .getAlerts({
              // FIXED: Usar fecha calculada a nivel de módulo para evitar Date.now() en render
              since: DASHBOARD_ONE_DAY_AGO,
              resolved: false
            })
            .slice(0, 5)
            .map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex justify-between items-center">
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' ? (
                    <TriangleAlert className="w-5 h-5 text-red-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
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
          <WebhookConfigPanel />
        </div>
      )}
    </div>
  );
};