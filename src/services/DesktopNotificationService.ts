/**
 * =====================================================
 * DESKTOP NOTIFICATION SERVICE
 * =====================================================
 * Servicio para gestionar notificaciones nativas del navegador
 * Fecha: 2025-01-29
 * Versión: v3.4.1
 * =====================================================
 */

import { logger } from '@/lib/logger';
import type { ErrorAlert } from './ErrorAlertService';
import type { PerformanceMetric } from './PerformanceMonitoringService';

// =====================================================
// INTERFACES
// =====================================================

export interface NotificationConfig {
  enabled: boolean;
  criticalOnly: boolean;
  sound: boolean;
  frequency: number; // Mínimo de milisegundos entre notificaciones
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

// =====================================================
// SERVICE CLASS
// =====================================================

class DesktopNotificationService {
  private permission: NotificationPermission = 'default';
  private config: NotificationConfig;
  private lastNotificationTime: number = 0;
  private notificationQueue: NotificationOptions[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.checkPermission();
  }

  /**
   * Cargar configuración de localStorage
   */
  private loadConfig(): NotificationConfig {
    try {
      const saved = localStorage.getItem('notification_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      logger.error('Error loading notification config:', error);
    }

    // Configuración por defecto
    return {
      enabled: false,
      criticalOnly: true,
      sound: true,
      frequency: 60000 // 1 minuto entre notificaciones
    };
  }

  /**
   * Guardar configuración en localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('notification_config', JSON.stringify(this.config));
    } catch (error) {
      logger.error('Error saving notification config:', error);
    }
  }

  /**
   * Verificar permisos de notificación
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      logger.info('Notification permission:', this.permission);
    } else {
      logger.warn('Browser does not support notifications');
    }
  }

  /**
   * Solicitar permisos de notificación
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      logger.error('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        logger.info('✅ Notification permission granted');
        this.config.enabled = true;
        this.saveConfig();
        return true;
      } else {
        logger.warn('❌ Notification permission denied');
        this.config.enabled = false;
        this.saveConfig();
        return false;
      }
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Actualizar configuración
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
    logger.info('Notification config updated:', this.config);
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Verificar si puede enviar notificación
   */
  private canNotify(): boolean {
    if (!this.config.enabled) return false;
    if (this.permission !== 'granted') return false;
    
    // Verificar frecuencia
    const now = Date.now();
    if (now - this.lastNotificationTime < this.config.frequency) {
      logger.debug('Notification throttled by frequency limit');
      return false;
    }

    return true;
  }

  /**
   * Mostrar notificación
   */
  private showNotification(options: NotificationOptions): void {
    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-72.png',
        tag: options.tag || 'analytics-alert',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || !this.config.sound
      });

      this.lastNotificationTime = Date.now();

      // Auto-cerrar después de 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click handler
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navegar al dashboard de analytics
        if (window.location.pathname !== '/admin/analytics') {
          window.location.href = '/admin/analytics';
        }
      };

      logger.info('✅ Notification shown:', options.title);
    } catch (error) {
      logger.error('Error showing notification:', error);
    }
  }

  /**
   * Notificar error crítico
   */
  notifyError(alert: ErrorAlert): void {
    if (!this.canNotify()) return;

    // Si está en modo solo críticos, filtrar
    if (this.config.criticalOnly && alert.severity !== 'critical') {
      return;
    }

    const emoji = this.getSeverityEmoji(alert.severity);
    
    this.showNotification({
      title: `${emoji} Error ${alert.severity.toUpperCase()}`,
      body: alert.message,
      tag: `error-${alert.id}`,
      requireInteraction: alert.severity === 'critical',
      icon: '/icon-error.png'
    });
  }

  /**
   * Notificar degradación de performance
   */
  notifyPerformance(metric: PerformanceMetric, threshold: number): void {
    if (!this.canNotify()) return;

    this.showNotification({
      title: '⚠️ Performance Degradation',
      body: `${metric.name}: ${metric.value}${metric.unit} (threshold: ${threshold}${metric.unit})`,
      tag: 'performance-alert',
      icon: '/icon-warning.png'
    });
  }

  /**
   * Notificar alto uso de memoria
   */
  notifyHighMemory(usage: number, threshold: number): void {
    if (!this.canNotify()) return;

    this.showNotification({
      title: '🧠 High Memory Usage',
      body: `Memory usage: ${usage.toFixed(2)}MB (threshold: ${threshold}MB)`,
      tag: 'memory-alert',
      requireInteraction: true,
      icon: '/icon-memory.png'
    });
  }

  /**
   * Notificar errores repetidos
   */
  notifyRepeatedErrors(count: number, category: string): void {
    if (!this.canNotify()) return;

    this.showNotification({
      title: '🔁 Repeated Errors Detected',
      body: `${count} errors in category: ${category} (last minute)`,
      tag: 'repeated-errors',
      requireInteraction: true,
      icon: '/icon-error.png'
    });
  }

  /**
   * Notificación personalizada
   */
  notify(options: NotificationOptions): void {
    if (!this.canNotify()) return;
    this.showNotification(options);
  }

  /**
   * Obtener emoji según severidad
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  /**
   * Test de notificación
   */
  async testNotification(): Promise<boolean> {
    try {
      if (this.permission !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) return false;
      }

      this.showNotification({
        title: '✅ Test Notification',
        body: 'Notificaciones configuradas correctamente',
        tag: 'test',
        icon: '/icon-success.png'
      });

      return true;
    } catch (error) {
      logger.error('Error testing notification:', error);
      return false;
    }
  }

  /**
   * Deshabilitar notificaciones
   */
  disable(): void {
    this.config.enabled = false;
    this.saveConfig();
    logger.info('Notifications disabled');
  }

  /**
   * Habilitar notificaciones
   */
  async enable(): Promise<boolean> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    this.config.enabled = true;
    this.saveConfig();
    logger.info('Notifications enabled');
    return true;
  }

  /**
   * Obtener estado de permisos
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Verificar soporte del navegador
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }
}

// Exportar instancia singleton
export const desktopNotificationService = new DesktopNotificationService();
export default desktopNotificationService;

