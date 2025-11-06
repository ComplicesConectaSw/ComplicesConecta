/**
 * Tipos para AnalyticsService - ComplicesConecta v3.5.0
 * Reemplaza Record<string, any> con tipos específicos
 */

/**
 * Propiedades de evento de analytics
 */
export interface AnalyticsProperties {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  items?: AnalyticsItem[];
  user_id?: string;
  session_id?: string;
  page_path?: string;
  page_title?: string;
  [key: string]: unknown; // Para propiedades adicionales desconocidas
}

/**
 * Item de analytics (para e-commerce)
 */
export interface AnalyticsItem {
  item_id?: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  [key: string]: unknown; // Para propiedades adicionales desconocidas
}

/**
 * Métricas de rendimiento del navegador
 */
export interface BrowserPerformanceMemory {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

