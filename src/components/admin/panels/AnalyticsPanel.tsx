/**
 * AnalyticsPanel v3.3.0
 * 
 * Panel de analytics avanzados del sistema de tokens
 * Integrado con TokenAnalyticsService
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

import { tokenAnalytics, TokenMetrics } from '../../../services/TokenAnalyticsService'
import { analyticsMetrics } from '../../../lib/analytics-metrics'

export const AnalyticsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<TokenMetrics | null>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [systemMetrics, setSystemMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    loadMetrics()
    loadRealTimeMetrics()
    
    // Actualizar métricas en tiempo real cada 30 segundos
    const interval = setInterval(() => {
      loadRealTimeMetrics()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const response = await tokenAnalytics.generateCurrentMetrics()
      
      if (response.success && response.metrics) {
        setMetrics(response.metrics)
      } else {
        setError(response.error || 'Error cargando métricas')
      }
    } catch (err) {
      setError('Error inesperado cargando métricas')
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      // Obtener métricas en tiempo real del sistema de analytics
      const rtMetrics = analyticsMetrics.getRealTimeMetrics()
      const sysMetrics = analyticsMetrics.getSystemMetrics()
      
      setRealTimeMetrics(rtMetrics)
      setSystemMetrics(sysMetrics)
    } catch (err) {
      console.error('Error cargando métricas en tiempo real:', err)
    }
  }

  const generateReport = async () => {
    try {
      setIsGeneratingReport(true)
      const response = await tokenAnalytics.generateAutomaticReport('daily')
      
      if (response.success && response.report) {
        // En una implementación real, esto abriría un modal o descarga
        console.log('Reporte generado:', response.report)
        alert('Reporte generado exitosamente')
      } else {
        setError(response.error || 'Error generando reporte')
      }
    } catch (err) {
      setError('Error inesperado generando reporte')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-2 text-gray-300">Cargando analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Analytics del Sistema</h3>
        <button
          onClick={generateReport}
          disabled={isGeneratingReport}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg transition-colors disabled:opacity-50 touch-manipulation w-full sm:w-auto"
        >
          {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {/* Métricas en Tiempo Real */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Usuarios Activos</h4>
            <p className="text-2xl font-bold text-green-400">{realTimeMetrics.activeUsers}</p>
            <p className="text-xs text-gray-500">En línea ahora</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Eventos Recientes</h4>
            <p className="text-2xl font-bold text-blue-400">{realTimeMetrics.recentEvents}</p>
            <p className="text-xs text-gray-500">Último minuto</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Sesiones Totales</h4>
            <p className="text-2xl font-bold text-purple-400">{realTimeMetrics.totalSessions}</p>
            <p className="text-xs text-gray-500">Desde inicio</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Pico de Usuarios</h4>
            <p className="text-2xl font-bold text-yellow-400">{realTimeMetrics.peakConcurrentUsers}</p>
            <p className="text-xs text-gray-500">Máximo concurrente</p>
          </div>
        </div>
      )}

      {/* Métricas del Sistema */}
      {systemMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Rendimiento del Sistema
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Duración Promedio de Sesión</span>
                <span className="text-white font-semibold">
                  {Math.round(systemMetrics.averageSessionDuration / 60000)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Llamadas API</span>
                <span className="text-white font-semibold">{systemMetrics.apiCalls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tasa de Cache Hit</span>
                <span className="text-green-400 font-semibold">{systemMetrics.cacheHitRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tasa de Errores</span>
                <span className={`font-semibold ${systemMetrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {systemMetrics.errorRate}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Actividad de Usuarios
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Usuarios Activos Actuales</span>
                <span className="text-green-400 font-semibold">{systemMetrics.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total de Sesiones</span>
                <span className="text-white font-semibold">{systemMetrics.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tiempo de Respuesta</span>
                <span className="text-blue-400 font-semibold">{systemMetrics.responseTime}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas de supply - Responsive */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                Supply de Tokens
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">CMPX Total</span>
                    <span className="text-xl font-bold text-green-400">
                      {metrics.totalSupply.cmpx.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CMPX Circulante</span>
                    <span className="text-lg text-green-300">
                      {metrics.circulatingSupply.cmpx.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">GTK Total</span>
                    <span className="text-xl font-bold text-blue-400">
                      {metrics.totalSupply.gtk.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">GTK Circulante</span>
                    <span className="text-lg text-blue-300">
                      {metrics.circulatingSupply.gtk.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Actividad de Transacciones
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Volumen CMPX (24h)</span>
                  <p className="text-2xl font-bold text-green-400">
                    {metrics.transactionVolume.cmpx.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Volumen GTK (24h)</span>
                  <p className="text-2xl font-bold text-blue-400">
                    {metrics.transactionVolume.gtk.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Total Transacciones</span>
                  <p className="text-xl font-bold text-white">
                    {metrics.transactionVolume.count.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de staking y usuarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Staking
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Total Staked</span>
                  <p className="text-2xl font-bold text-purple-400">
                    {metrics.stakingMetrics.totalStaked.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Stakers Activos</span>
                  <p className="text-xl font-bold text-white">
                    {metrics.stakingMetrics.activeStakers}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Duración Promedio</span>
                  <p className="text-lg text-gray-300">
                    {metrics.stakingMetrics.avgDuration.toFixed(1)} días
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Usuarios
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Usuarios Activos (24h)</span>
                  <p className="text-2xl font-bold text-yellow-400">
                    {metrics.userMetrics.activeUsers}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Nuevos Usuarios (24h)</span>
                  <p className="text-xl font-bold text-white">
                    {metrics.userMetrics.newUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
