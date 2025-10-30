/**
 * =====================================================
 * WEBHOOK SERVICE
 * =====================================================
 * Servicio para gestionar webhooks y notificaciones externas
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export type WebhookProvider = 'slack' | 'discord' | 'custom';
export type WebhookEventType = 'error' | 'alert' | 'report' | 'performance' | 'security';

export interface WebhookConfig {
  id: string;
  name: string;
  provider: WebhookProvider;
  url: string;
  enabled: boolean;
  events: WebhookEventType[];
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  rateLimit?: number; // mensajes por minuto
  retryAttempts?: number;
  timeout?: number; // en ms
  headers?: Record<string, string>;
  createdAt: Date;
  lastUsed?: Date;
}

export interface WebhookPayload {
  event: WebhookEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  source: string;
  userId?: string;
  url?: string;
}

export interface WebhookResponse {
  success: boolean;
  status?: number;
  message?: string;
  error?: string;
  timestamp: Date;
}

// =====================================================
// SERVICE CLASS
// =====================================================

class WebhookService {
  private static instance: WebhookService;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private rateLimitMap: Map<string, number[]> = new Map();
  private queue: Array<{ webhookId: string; payload: WebhookPayload }> = [];
  private processing = false;

  private constructor() {
    this.loadWebhooksFromStorage();
    this.startQueueProcessor();
  }

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Registrar nuevo webhook
   */
  registerWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt'>): string {
    const id = this.generateId();
    const webhook: WebhookConfig = {
      ...config,
      id,
      createdAt: new Date(),
      retryAttempts: config.retryAttempts || 3,
      timeout: config.timeout || 5000,
      rateLimit: config.rateLimit || 60
    };

    this.webhooks.set(id, webhook);
    this.saveWebhooksToStorage();

    logger.info('Webhook registered:', { id, name: webhook.name, provider: webhook.provider });
    return id;
  }

  /**
   * Actualizar webhook existente
   */
  updateWebhook(id: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      logger.error('Webhook not found:', { id });
      return false;
    }

    const updated = { ...webhook, ...updates, id, createdAt: webhook.createdAt };
    this.webhooks.set(id, updated);
    this.saveWebhooksToStorage();

    logger.info('Webhook updated:', { id, updates });
    return true;
  }

  /**
   * Eliminar webhook
   */
  deleteWebhook(id: string): boolean {
    const deleted = this.webhooks.delete(id);
    if (deleted) {
      this.saveWebhooksToStorage();
      logger.info('Webhook deleted:', { id });
    }
    return deleted;
  }

  /**
   * Obtener webhook por ID
   */
  getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Obtener todos los webhooks
   */
  getAllWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Obtener webhooks activos para un evento
   */
  getWebhooksForEvent(event: WebhookEventType, severity: string): WebhookConfig[] {
    return this.getAllWebhooks().filter(webhook => {
      if (!webhook.enabled) return false;
      if (!webhook.events.includes(event)) return false;
      
      // Filtrar por severidad mínima
      if (webhook.minSeverity) {
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const minLevel = severityLevels[webhook.minSeverity] || 1;
        const currentLevel = severityLevels[severity as keyof typeof severityLevels] || 1;
        if (currentLevel < minLevel) return false;
      }

      return true;
    });
  }

  /**
   * Enviar notificación a webhook
   */
  async sendNotification(payload: WebhookPayload): Promise<void> {
    const webhooks = this.getWebhooksForEvent(payload.event, payload.severity);
    
    if (webhooks.length === 0) {
      logger.debug('No webhooks configured for event:', { event: payload.event });
      return;
    }

    // Agregar a la cola
    webhooks.forEach(webhook => {
      this.queue.push({ webhookId: webhook.id, payload });
    });

    logger.debug('Webhook notifications queued:', { count: webhooks.length, event: payload.event });
  }

  /**
   * Enviar a webhook específico
   */
  private async sendToWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload
  ): Promise<WebhookResponse> {
    // Verificar rate limit
    if (!this.checkRateLimit(webhook.id, webhook.rateLimit!)) {
      return {
        success: false,
        message: 'Rate limit exceeded',
        timestamp: new Date()
      };
    }

    try {
      const formattedPayload = this.formatPayload(webhook.provider, payload);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers
        },
        body: JSON.stringify(formattedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Actualizar última vez usado
      webhook.lastUsed = new Date();
      this.webhooks.set(webhook.id, webhook);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Webhook sent successfully:', {
        id: webhook.id,
        provider: webhook.provider,
        event: payload.event
      });

      return {
        success: true,
        status: response.status,
        message: 'Webhook sent successfully',
        timestamp: new Date()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('Webhook send failed:', {
        id: webhook.id,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    }
  }

  /**
   * Formatear payload según el provider
   */
  private formatPayload(provider: WebhookProvider, payload: WebhookPayload): any {
    switch (provider) {
      case 'slack':
        return this.formatSlackPayload(payload);
      case 'discord':
        return this.formatDiscordPayload(payload);
      default:
        return payload;
    }
  }

  /**
   * Formatear para Slack
   */
  private formatSlackPayload(payload: WebhookPayload): any {
    const severityEmoji = {
      low: ':white_check_mark:',
      medium: ':warning:',
      high: ':rotating_light:',
      critical: ':fire:'
    };

    const severityColor = {
      low: '#22C55E',
      medium: '#EAB308',
      high: '#F97316',
      critical: '#EF4444'
    };

    return {
      text: `${severityEmoji[payload.severity]} *${payload.title}*`,
      attachments: [
        {
          color: severityColor[payload.severity],
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${payload.title}*\n${payload.message}`
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `*Evento:* ${payload.event} | *Severidad:* ${payload.severity} | *Fuente:* ${payload.source}`
                }
              ]
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `🕐 ${new Date(payload.timestamp).toLocaleString()}`
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Formatear para Discord
   */
  private formatDiscordPayload(payload: WebhookPayload): any {
    const severityColor = {
      low: 2278922,    // Verde
      medium: 15377664, // Amarillo
      high: 16355328,   // Naranja
      critical: 15679748 // Rojo
    };

    return {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color: severityColor[payload.severity],
          fields: [
            {
              name: 'Evento',
              value: payload.event,
              inline: true
            },
            {
              name: 'Severidad',
              value: payload.severity.toUpperCase(),
              inline: true
            },
            {
              name: 'Fuente',
              value: payload.source,
              inline: true
            }
          ],
          timestamp: payload.timestamp,
          footer: {
            text: 'ComplicesConecta Monitoring System'
          }
        }
      ]
    };
  }

  /**
   * Verificar rate limit
   */
  private checkRateLimit(webhookId: string, limit: number): boolean {
    const now = Date.now();
    const minute = 60 * 1000;
    
    if (!this.rateLimitMap.has(webhookId)) {
      this.rateLimitMap.set(webhookId, []);
    }

    const timestamps = this.rateLimitMap.get(webhookId)!;
    
    // Limpiar timestamps antiguos
    const recentTimestamps = timestamps.filter(t => now - t < minute);
    
    if (recentTimestamps.length >= limit) {
      return false;
    }

    recentTimestamps.push(now);
    this.rateLimitMap.set(webhookId, recentTimestamps);
    
    return true;
  }

  /**
   * Procesar cola de webhooks
   */
  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (this.processing || this.queue.length === 0) return;

      this.processing = true;

      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;

        const webhook = this.webhooks.get(item.webhookId);
        if (!webhook || !webhook.enabled) continue;

        await this.sendToWebhook(webhook, item.payload);
        
        // Pequeño delay entre envíos
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.processing = false;
    }, 1000); // Procesar cada segundo
  }

  /**
   * Guardar webhooks en localStorage
   */
  private saveWebhooksToStorage(): void {
    try {
      const data = Array.from(this.webhooks.values()).map(w => ({
        ...w,
        createdAt: w.createdAt.toISOString(),
        lastUsed: w.lastUsed?.toISOString()
      }));
      localStorage.setItem('webhooks', JSON.stringify(data));
    } catch (error) {
      logger.error('Error saving webhooks to storage:', { error: String(error) });
    }
  }

  /**
   * Cargar webhooks desde localStorage
   */
  private loadWebhooksFromStorage(): void {
    try {
      const stored = localStorage.getItem('webhooks');
      if (!stored) return;

      const data = JSON.parse(stored);
      data.forEach((w: any) => {
        this.webhooks.set(w.id, {
          ...w,
          createdAt: new Date(w.createdAt),
          lastUsed: w.lastUsed ? new Date(w.lastUsed) : undefined
        });
      });

      logger.info('Webhooks loaded from storage:', { count: this.webhooks.size });
    } catch (error) {
      logger.error('Error loading webhooks from storage:', { error: String(error) });
    }
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Test webhook
   */
  async testWebhook(id: string): Promise<WebhookResponse> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return {
        success: false,
        error: 'Webhook not found',
        timestamp: new Date()
      };
    }

    const testPayload: WebhookPayload = {
      event: 'alert',
      severity: 'low',
      title: '🧪 Test Webhook',
      message: 'This is a test message from ComplicesConecta Monitoring System',
      timestamp: new Date().toISOString(),
      source: 'WebhookService.testWebhook',
      metadata: {
        test: true,
        webhookId: id,
        webhookName: webhook.name
      }
    };

    return await this.sendToWebhook(webhook, testPayload);
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance();
export default webhookService;

