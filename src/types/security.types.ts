/**
 * Tipos para SecurityService - ComplicesConecta v3.5.0
 * Reemplaza Record<string, any> con tipos específicos
 */

/**
 * Patrones de actividad del usuario
 */
export interface ActivityPattern {
  loginFrequency: number; // logins por período
  sessionDuration: number; // minutos promedio
  actionCount: number; // acciones por sesión
  deviceCount: number; // dispositivos únicos
  locationCount: number; // ubicaciones únicas
  timePattern: 'normal' | 'unusual'; // patrón temporal
}

/**
 * Actividad del usuario para análisis de comportamiento
 */
export interface UserActivity {
  action: string;
  timestamp?: string;
  userId?: string;
  deviceId?: string;
  location?: string;
  metadata?: ActivityMetadata;
}

/**
 * Metadatos de actividad
 */
export interface ActivityMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  [key: string]: unknown; // Para propiedades adicionales desconocidas
}

/**
 * Detalles de evento de auditoría
 */
export interface AuditEventDetails {
  action?: string;
  resource?: string;
  resourceId?: string;
  metadata?: ActivityMetadata;
  [key: string]: unknown; // Para propiedades adicionales desconocidas
}

/**
 * Log de auditoría mapeado
 */
export interface MappedAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: AuditEventDetails;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  riskScore: number;
}

