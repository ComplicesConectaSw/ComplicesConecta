/**
 * SecurityPanel v3.3.0
 * 
 * Panel de seguridad y auditoría del sistema
 */

import React from 'react'
import { ShieldCheckIcon, KeyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const SecurityPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Panel de Seguridad</h3>
        <p className="text-gray-400 mb-6">Auditoría y configuración de seguridad avanzada</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <KeyIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">2FA</p>
            <p className="text-xs text-gray-400">Autenticación de dos factores</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Fraud Detection</p>
            <p className="text-xs text-gray-400">Detección de actividad sospechosa</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Auditoría</p>
            <p className="text-xs text-gray-400">Logs de seguridad</p>
          </div>
        </div>
      </div>
    </div>
  )
}
