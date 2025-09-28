/**
 * Índice de exportación para paneles del Dashboard Administrativo v3.3.0
 * Facilita las importaciones y evita errores de módulos no encontrados
 */

export { ReportsPanel } from './ReportsPanel'
export { UserManagementPanel } from './UserManagementPanel'
export { TokenSystemPanel } from './TokenSystemPanel'
export { default as AnalyticsPanel } from '../AnalyticsPanel'
export { PerformancePanel } from './PerformancePanel'
export { SecurityPanel } from './SecurityPanel'

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
  icon: React.ComponentType<any>
  color: string
  requiredRole: 'admin' | 'moderator'
}
