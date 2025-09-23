/**
 * TokenSystemPanel v3.3.0
 * 
 * Panel de gestión del sistema de tokens CMPX/GTK
 */

import React from 'react'
import { CurrencyDollarIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export const TokenSystemPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Panel de Sistema de Tokens</h3>
        <p className="text-gray-400 mb-6">Gestión avanzada de tokens CMPX/GTK</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <ChartBarIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Métricas</p>
            <p className="text-xs text-gray-400">Supply y circulación</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Transacciones</p>
            <p className="text-xs text-gray-400">Historial y volumen</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Cog6ToothIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Configuración</p>
            <p className="text-xs text-gray-400">Parámetros del sistema</p>
          </div>
        </div>
      </div>
    </div>
  )
}
