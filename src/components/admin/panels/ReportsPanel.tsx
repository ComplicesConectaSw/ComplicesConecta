/**
 * ReportsPanel v3.3.0
 * 
 * Panel de gestión de reportes para moderadores y administradores
 * Integrado con ProfileReportService para operaciones CRUD
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

import { reportService } from '@/services/ReportService'
import { logger } from '@/lib/logger'

interface Report {
  id: string
  reporter_user_id: string
  reported_user_id: string
  reason: string
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}

type FilterType = 'all' | 'pending' | 'resolved' | 'dismissed'
type SeverityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical'

export const ReportsPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [_selectedReport, _setSelectedReport] = useState<Report | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Usar reportService importado directamente

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await reportService.getPendingProfileReports()
      
      if (response.success && response.reports) {
        setReports(response.reports as unknown as Report[])
      } else {
        setError(response.error || 'Error cargando reportes')
      }
    } catch (err) {
      logger.error('Error cargando reportes:', { error: err })
      setError('Error inesperado cargando reportes')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesStatus = filter === 'all' || report.status === filter
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter
    const matchesSearch = searchTerm === '' || 
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSeverity && matchesSearch
  })

  // Resolver reporte
  const handleResolveReport = async (reportId: string, resolution: 'resolved' | 'dismissed') => {
    try {
      setActionLoading(reportId)
      const response = await reportService.resolveProfileReport(reportId, resolution)
      
      if (response.success) {
        // Actualizar el reporte en la lista
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: resolution }
            : report
        ))
        _setSelectedReport(null)
        logger.info('Reporte resuelto:', { reportId, resolution })
      } else {
        setError(response.error || 'Error resolviendo reporte')
      }
    } catch (err) {
      logger.error('Error resolviendo reporte:', { error: err })
      setError('Error inesperado resolviendo reporte')
    } finally {
      setActionLoading(null)
    }
  }

  // Obtener color según severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-orange-400 bg-orange-400/10'
      case 'critical': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      case 'resolved': return 'text-green-400 bg-green-400/10'
      case 'dismissed': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-2 text-gray-300">Cargando reportes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'pending').length}</p>
              <p className="text-sm text-gray-400">Pendientes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'resolved').length}</p>
              <p className="text-sm text-gray-400">Resueltos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{reports.filter(r => r.severity === 'critical').length}</p>
              <p className="text-sm text-gray-400">Críticos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{reports.length}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda - Mobile First */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
        
        <select
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.currentTarget.value as FilterType)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="resolved">Resueltos</option>
          <option value="dismissed">Archivados</option>
        </select>
        
        <select
          value={severityFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeverityFilter(e.currentTarget.value as SeverityFilter)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
        >
          <option value="all">Todas las severidades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron reportes</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{report.reason}</h3>
                  
                  {report.description && (
                    <p className="text-gray-300 mb-3">{report.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-400">
                    <p>Reportado por: {report.reporter_user_id}</p>
                    <p>Usuario reportado: {report.reported_user_id}</p>
                  </div>
                </div>
                
                {report.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleResolveReport(report.id, 'resolved')}
                      disabled={actionLoading === report.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === report.id ? 'Procesando...' : 'Resolver'}
                    </button>
                    <button
                      onClick={() => handleResolveReport(report.id, 'dismissed')}
                      disabled={actionLoading === report.id}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Archivar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-300 hover:text-red-200"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
