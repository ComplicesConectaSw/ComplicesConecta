/**
 * PerformancePanel v3.3.0
 * 
 * Panel de monitoreo de performance del sistema
 * Integrado con PerformanceMonitoringService
 */

import React, { useState, useEffect } from 'react'
import { 
  CpuChipIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { performanceMonitor, PerformanceMetrics } from '@/services/PerformanceMonitoringService'

export const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Actualizar cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const currentMetrics = await performanceMonitor.collectCurrentMetrics()
      setMetrics(currentMetrics)
      setLoading(false)
    } catch (err) {
      setError('Error cargando métricas de performance')
      setLoading(false)
    }
  }

  const toggleMonitoring = () => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring()
      setIsMonitoring(false)
    } else {
      performanceMonitor.startMonitoring(5) // Cada 5 minutos
      setIsMonitoring(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-2 text-gray-300">Cargando métricas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Métricas en Tiempo Real</h3>
        <button
          onClick={toggleMonitoring}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isMonitoring 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isMonitoring ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
        </button>
      </div>

      {/* Métricas principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{metrics.responseTime.toFixed(0)}ms</p>
                <p className="text-sm text-gray-400">Tiempo de Respuesta</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{metrics.queryCount}</p>
                <p className="text-sm text-gray-400">Consultas/Hora</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{metrics.errorRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Tasa de Error</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{metrics.activeUsers}</p>
                <p className="text-sm text-gray-400">Usuarios Activos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado del sistema */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Estado del Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-400 mb-2">Actividad de Tokens</h5>
            <p className="text-2xl font-bold text-white">{metrics?.tokenTransactions || 0}</p>
            <p className="text-sm text-gray-400">Transacciones (24h)</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-400 mb-2">Actividad de Reportes</h5>
            <p className="text-2xl font-bold text-white">{metrics?.reportActivity || 0}</p>
            <p className="text-sm text-gray-400">Reportes (24h)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
