/**
 * Índice de exportación para paneles del Dashboard Administrativo v3.5.0
 * Facilita las importaciones y evita errores de módulos no encontrados
 * 
 * NOTA: Se usan los componentes funcionales en lugar de placeholders
 */

import type { ComponentType } from 'react'

export { ReportsPanel } from './ReportsPanel'
export { UserManagementPanel } from '../UserManagementPanel'
export { TokenSystemPanel } from '../TokenSystemPanel'
export { AnalyticsPanel } from '../AnalyticsPanel'


export { default as PerformancePanel } from '../PerformancePanel'
export { default as SecurityPanel } from '../SecurityPanel'

// Tipos de paneles disponibles
export type PanelType = 
  | 'reports' 
  | 'users' 
  | 'tokens' 
  | 'analytics' 
  | 'performance' 
  | 'security'

// Configuración de paneles
export interface PanelConfig {
  id: PanelType
  title: string
  description: string
  icon: ComponentType<unknown>
  color: string
  requiredRole: 'admin' | 'moderator'
}
