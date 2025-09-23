/**
 * AdminDashboard v3.3.0
 * 
 * Dashboard administrativo completo con subpaneles modulares
 * Para moderadores y administradores del sistema
 * 
 * Subpaneles:
 * - ReportsPanel: Gestión de reportes
 * - UserManagementPanel: Administración de usuarios
 * - TokenSystemPanel: Métricas y gestión de tokens
 * - AnalyticsPanel: Analytics avanzados
 * - PerformancePanel: Monitoreo de performance
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Importar subpaneles
import { ReportsPanel } from './panels/ReportsPanel'
import { UserManagementPanel } from './panels/UserManagementPanel'
import { TokenSystemPanel } from './panels/TokenSystemPanel'
import { AnalyticsPanel } from './panels/AnalyticsPanel'
import { PerformancePanel } from './panels/PerformancePanel'
import { SecurityPanel } from './panels/SecurityPanel'

// Hooks y servicios
import { useAuth } from '../../hooks/useAuth'
import { logger } from '../../lib/logger'

// Tipos de paneles disponibles
type PanelType = 
  | 'reports' 
  | 'users' 
  | 'tokens' 
  | 'analytics' 
  | 'performance' 
  | 'security'

interface PanelConfig {
  id: PanelType
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  requiredRole: 'admin' | 'moderator'
}

// Configuración de paneles
const PANEL_CONFIGS: PanelConfig[] = [
  {
    id: 'reports',
    title: 'Reportes',
    description: 'Gestión de reportes de usuarios y contenido',
    icon: ExclamationTriangleIcon,
    color: 'from-red-500 to-red-600',
    requiredRole: 'moderator'
  },
  {
    id: 'users',
    title: 'Usuarios',
    description: 'Administración de usuarios y perfiles',
    icon: UserGroupIcon,
    color: 'from-blue-500 to-blue-600',
    requiredRole: 'moderator'
  },
  {
    id: 'tokens',
    title: 'Sistema de Tokens',
    description: 'Métricas y gestión de tokens CMPX/GTK',
    icon: CurrencyDollarIcon,
    color: 'from-green-500 to-green-600',
    requiredRole: 'admin'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Análisis avanzado y reportes automáticos',
    icon: ChartBarIcon,
    color: 'from-purple-500 to-purple-600',
    requiredRole: 'admin'
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Monitoreo de rendimiento del sistema',
    icon: CpuChipIcon,
    color: 'from-yellow-500 to-yellow-600',
    requiredRole: 'admin'
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Auditoría y configuración de seguridad',
    icon: ShieldCheckIcon,
    color: 'from-indigo-500 to-indigo-600',
    requiredRole: 'admin'
  }
]

/**
 * Componente principal del dashboard administrativo
 */
export const AdminDashboard: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const [activePanel, setActivePanel] = useState<PanelType>('reports')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar permisos al cargar
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!user) {
          setError('Usuario no autenticado')
          return
        }

        const userRole = profile?.role || (isAdmin() ? 'admin' : null)
        if (!userRole || !['admin', 'moderator'].includes(userRole)) {
          setError('No tienes permisos para acceder al dashboard administrativo')
          return
        }

        logger.info('Dashboard administrativo cargado:', { userId: user.id, role: userRole })
        setIsLoading(false)

      } catch (err) {
        logger.error('Error verificando permisos:', { error: err })
        setError('Error verificando permisos de acceso')
      }
    }

    checkPermissions()
  }, [user, profile, isAdmin])

  // Filtrar paneles según el rol del usuario
  const userRole = profile?.role || (isAdmin() ? 'admin' : 'moderator')
  const availablePanels = PANEL_CONFIGS.filter(panel => {
    if (userRole === 'admin') return true
    return panel.requiredRole === 'moderator'
  })

  // Renderizar panel activo
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'reports':
        return <ReportsPanel />
      case 'users':
        return <UserManagementPanel />
      case 'tokens':
        return <TokenSystemPanel />
      case 'analytics':
        return <AnalyticsPanel />
      case 'performance':
        return <PerformancePanel />
      case 'security':
        return <SecurityPanel />
      default:
        return <div className="text-center py-8 text-gray-500">Panel no encontrado</div>
    }
  }

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando dashboard administrativo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header del Dashboard */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-8 w-8 text-pink-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard Administrativo</h1>
                <p className="text-sm text-gray-400">
                  Rol: {userRole === 'admin' ? 'Administrador' : 'Moderador'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">{user?.email}</p>
                <p className="text-xs text-gray-400">v3.3.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar de navegación - Responsive */}
          <div className="xl:col-span-1">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Paneles</h2>
              <nav className="space-y-2">
                {availablePanels.map((panel) => {
                  const Icon = panel.icon
                  const isActive = activePanel === panel.id
                  
                  return (
                    <button
                      key={panel.id}
                      onClick={() => setActivePanel(panel.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 touch-manipulation ${
                        isActive
                          ? `bg-gradient-to-r ${panel.color} text-white shadow-lg`
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{panel.title}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {panel.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Información del sistema */}
            <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Estado del Sistema</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Versión:</span>
                  <span className="text-green-400">v3.3.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estado:</span>
                  <span className="text-green-400">Operativo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Última actualización:</span>
                  <span className="text-gray-300">Hoy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal - Responsive */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6"
              >
                {/* Header del panel activo */}
                <div className="mb-6">
                  {(() => {
                    const panelConfig = PANEL_CONFIGS.find(p => p.id === activePanel)
                    if (!panelConfig) return null
                    
                    const Icon = panelConfig.icon
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${panelConfig.color} mb-3 sm:mb-0 sm:mr-4 self-start`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white">{panelConfig.title}</h2>
                          <p className="text-sm sm:text-base text-gray-400">{panelConfig.description}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Contenido del panel */}
                <div className="min-h-[600px]">
                  {renderActivePanel()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
