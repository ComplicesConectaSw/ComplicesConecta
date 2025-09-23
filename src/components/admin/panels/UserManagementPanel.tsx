/**
 * UserManagementPanel v3.3.0
 * 
 * Panel de gestión de usuarios para moderadores y administradores
 */

import React from 'react'
import { UserGroupIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const UserManagementPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Panel de Gestión de Usuarios</h3>
        <p className="text-gray-400 mb-6">Funcionalidad en desarrollo para v3.3.0</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <ShieldCheckIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Verificación</p>
            <p className="text-xs text-gray-400">Gestión de usuarios verificados</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Moderación</p>
            <p className="text-xs text-gray-400">Acciones de moderación</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <UserGroupIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Estadísticas</p>
            <p className="text-xs text-gray-400">Métricas de usuarios</p>
          </div>
        </div>
      </div>
    </div>
  )
}
