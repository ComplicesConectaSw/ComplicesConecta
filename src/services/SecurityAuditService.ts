/**
 * SecurityAuditService - Sistema de auditoría de seguridad avanzado
 * Implementa monitoreo continuo, detección de amenazas y respuesta automática
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'suspicious_activity' | 'failed_login' | 'data_access' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ThreatDetection {
  threatId: string;
  threatType: 'brute_force' | 'data_breach' | 'suspicious_pattern' | 'unauthorized_access' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  detectedAt: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  mitigationActions: string[];
  confidence: number;
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  averageResponseTime: number;
  threatDetectionRate: number;
  falsePositiveRate: number;
  securityScore: number;
}

export interface SecurityReport {
  period: string;
  metrics: SecurityMetrics;
  topThreats: ThreatDetection[];
  recentEvents: SecurityEvent[];
  recommendations: string[];
  complianceStatus: {
    gdpr: boolean;
    ccpa: boolean;
    iso27001: boolean;
  };
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private readonly THREAT_THRESHOLDS = {
    brute_force_attempts: 5,
    suspicious_login_hours: 2,
    data_access_frequency: 100,
    admin_action_frequency: 50
  };

  private constructor() {
    this.startContinuousMonitoring();
  }

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  /**
   * Inicia el monitoreo continuo de seguridad
   */
  private startContinuousMonitoring(): void {
    // Monitoreo cada 5 minutos
    setInterval(async () => {
      await this.performSecurityScan();
    }, 5 * 60 * 1000);

    // Análisis de amenazas cada hora
    setInterval(async () => {
      await this.analyzeThreats();
    }, 60 * 60 * 1000);

    logger.info('🔒 Security monitoring started');
  }

  /**
   * Registra un evento de seguridad
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }

      const securityEventData = {
        user_id: event.userId,
        event_type: event.eventType,
        severity: event.severity,
        description: event.description,
        metadata: JSON.stringify(event.metadata),
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        resolved: false
      };

      const { error } = await supabase
        .from('security_events')
        .insert(securityEventData);

      if (error) {
        logger.error('Error logging security event:', { error: error.message });
      } else {
        logger.info('🔒 Security event logged', { eventType: event.eventType, severity: event.severity });
      }
    } catch (error) {
      logger.error('Error in logSecurityEvent:', { error: String(error) });
    }
  }

  /**
   * Realiza un escaneo de seguridad completo
   */
  async performSecurityScan(): Promise<void> {
    try {
      logger.info('🔍 Performing security scan...');

      // Verificar eventos sospechosos recientes
      await this.checkSuspiciousActivity();
      
      // Verificar patrones de acceso anómalos
      await this.checkAnomalousAccess();
      
      // Verificar integridad de datos
      await this.checkDataIntegrity();
      
      // Verificar configuración de seguridad
      await this.checkSecurityConfiguration();

      logger.info('✅ Security scan completed');
    } catch (error) {
      logger.error('Error in security scan:', { error: String(error) });
    }
  }

  /**
   * Verifica actividad sospechosa
   */
  private async checkSuspiciousActivity(): Promise<void> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return;
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', oneHourAgo)
        .eq('event_type', 'failed_login');

      if (error) {
        logger.error('Error checking suspicious activity:', { error: error.message });
        return;
      }

      // Agrupar por IP y usuario
      const activityMap = new Map<string, number>();
      recentEvents?.forEach((event: Tables<'security_events'>) => {
        const key = `${event.ip_address || 'unknown'}-${event.user_id}`;
        activityMap.set(key, (activityMap.get(key) || 0) + 1);
      });

      // Detectar intentos de fuerza bruta
      for (const [key, count] of activityMap.entries()) {
        if (count >= this.THREAT_THRESHOLDS.brute_force_attempts) {
          const [ipAddress, userId] = key.split('-');
          
          await this.logSecurityEvent({
            userId,
            eventType: 'suspicious_activity',
            severity: 'high',
            description: `Multiple failed login attempts detected: ${count} attempts`,
            metadata: { ipAddress, attemptCount: count },
            ipAddress
          });

          // Bloquear IP temporalmente
          await this.blockIPAddress(ipAddress, '1 hour');
        }
      }
    } catch (error) {
      logger.error('Error in checkSuspiciousActivity:', { error: String(error) });
    }
  }

  /**
   * Verifica acceso anómalo
   */
  private async checkAnomalousAccess(): Promise<void> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return;
      }

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: accessEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', oneDayAgo)
        .eq('event_type', 'data_access');

      if (error) {
        logger.error('Error checking anomalous access:', { error: error.message });
        return;
      }

      // Detectar acceso excesivo a datos
      const accessCounts = new Map<string, number>();
      accessEvents?.forEach((event: Tables<'security_events'>) => {
        const userId = event.user_id || 'unknown';
        accessCounts.set(userId, (accessCounts.get(userId) || 0) + 1);
      });

      for (const [userId, count] of accessCounts.entries()) {
        if (count > this.THREAT_THRESHOLDS.data_access_frequency) {
        await this.logSecurityEvent({
          userId,
          eventType: 'suspicious_activity',
          severity: 'medium',
          description: `Excessive data access detected: ${count} accesses in 24h`,
          metadata: { accessCount: count }
        });
        }
      }
    } catch (error) {
      logger.error('Error in checkAnomalousAccess:', { error: String(error) });
    }
  }

  /**
   * Verifica integridad de datos
   */
  private async checkDataIntegrity(): Promise<void> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return;
      }

      // Verificar perfiles duplicados usando query directo
      // Nota: Esta es una simplificación. En producción, usar RPC con función SQL
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name')
        .limit(100);

      if (error) {
        logger.error('Error checking data integrity:', { error: error.message });
        return;
      }

      // Verificar duplicados básico por nombre
      const nameCounts = new Map<string, number>();
      profiles?.forEach((profile: any) => {
        const name = profile.name;
        nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
      });

      const duplicateCount = Array.from(nameCounts.values()).filter(count => count > 1).length;
      
      if (duplicateCount > 0) {
        await this.logSecurityEvent({
          userId: 'system',
          eventType: 'suspicious_activity',
          severity: 'medium',
          description: `Possible duplicate profiles detected: ${duplicateCount} potential duplicates`,
          metadata: { duplicateCount }
        });
      }
    } catch (error) {
      logger.error('Error in checkDataIntegrity:', { error: String(error) });
    }
  }

  /**
   * Verifica configuración de seguridad
   */
  private async checkSecurityConfiguration(): Promise<void> {
    try {
      if (!supabase) {
        logger.debug('Supabase no está disponible');
        return;
      }

      // Verificar usuarios sin 2FA habilitado
      const { data: usersWithout2FA, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('two_factor_enabled', false)
        .eq('is_admin', true);

      if (error) {
        logger.error('Error checking security configuration:', { error: error.message });
        return;
      }

      if (usersWithout2FA && usersWithout2FA.length > 0) {
        await this.logSecurityEvent({
          userId: 'system',
          eventType: 'suspicious_activity',
          severity: 'high',
          description: `Admin users without 2FA: ${usersWithout2FA.length} users`,
          metadata: { usersWithout2FA: usersWithout2FA.length }
        });
      }
    } catch (error) {
      logger.error('Error in checkSecurityConfiguration:', { error: String(error) });
    }
  }

  /**
   * Analiza amenazas detectadas
   */
  async analyzeThreats(): Promise<ThreatDetection[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      const threats: ThreatDetection[] = [];
      
      // Analizar eventos críticos no resueltos
      const { data: criticalEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('severity', 'critical')
        .eq('resolved', false)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        logger.error('Error analyzing threats:', { error: error.message });
        return threats;
      }

      if (criticalEvents && criticalEvents.length > 0) {
        threats.push({
          threatId: `threat-${Date.now()}`,
          threatType: 'suspicious_pattern',
          severity: 'critical',
          description: `${criticalEvents.length} critical security events detected`,
          affectedUsers: [...new Set(criticalEvents.map((e: Tables<'security_events'>) => e.user_id))] as string[],
          detectedAt: new Date().toISOString(),
          status: 'active',
          mitigationActions: ['Review events', 'Implement additional monitoring', 'Notify security team'],
          confidence: 0.9
        });
      }

      return threats;
    } catch (error) {
      logger.error('Error in analyzeThreats:', { error: String(error) });
      return [];
    }
  }

  /**
   * Bloquea una dirección IP
   */
  private async blockIPAddress(ipAddress: string, duration: string): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }

      const expiresAt = new Date();
      if (duration.includes('hour')) {
        expiresAt.setHours(expiresAt.getHours() + parseInt(duration));
      } else if (duration.includes('day')) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
      }

      const { error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ipAddress,
          blocked_at: new Date().toISOString(),
          duration: duration,
          reason: 'Suspicious activity detected',
          blocked_by: 'security_system',
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        logger.error('Error blocking IP address:', { error: error.message });
      } else {
        logger.info('🚫 IP address blocked', { ipAddress, duration });
      }
    } catch (error) {
      logger.error('Error in blockIPAddress:', { error: String(error) });
    }
  }

  /**
   * Obtiene métricas de seguridad
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return this.getDefaultMetrics();
      }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', oneWeekAgo);

      if (error) {
        logger.error('Error getting security metrics:', { error: error.message });
        return this.getDefaultMetrics();
      }

      const totalEvents = events?.length || 0;
      const criticalEvents = events?.filter((e: Tables<'security_events'>) => e.severity === 'critical').length || 0;
      const resolvedEvents = events?.filter((e: Tables<'security_events'>) => e.resolved).length || 0;
      
      const averageResponseTime = this.calculateAverageResponseTime(events || []);
      const threatDetectionRate = this.calculateThreatDetectionRate(events || []);
      const falsePositiveRate = this.calculateFalsePositiveRate(events || []);
      const securityScore = this.calculateSecurityScore(totalEvents, criticalEvents, resolvedEvents);

      return {
        totalEvents,
        criticalEvents,
        resolvedEvents,
        averageResponseTime,
        threatDetectionRate,
        falsePositiveRate,
        securityScore
      };
    } catch (error) {
      logger.error('Error in getSecurityMetrics:', { error: String(error) });
      return this.getDefaultMetrics();
    }
  }

  /**
   * Genera reporte de seguridad
   */
  async generateSecurityReport(): Promise<SecurityReport> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }

      const metrics = await this.getSecurityMetrics();
      const threats = await this.analyzeThreats();
      
      const { data: recentEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error generating security report:', { error: error.message });
      }

      const recommendations = this.generateSecurityRecommendations(metrics, threats);
      const complianceStatus = await this.checkComplianceStatus();

      // Mapear recentEvents a SecurityEvent[]
      const mappedEvents: SecurityEvent[] = (recentEvents || []).map((event: any) => ({
        id: event.id || '',
        userId: event.user_id || '',
        eventType: event.event_type as any,
        severity: event.severity as any,
        description: event.description || '',
        metadata: event.metadata as Record<string, any> || {},
        ipAddress: event.ip_address as string,
        userAgent: event.user_agent as string,
        timestamp: event.timestamp || '',
        resolved: event.resolved || false,
        resolvedAt: event.resolved_at || undefined,
        resolvedBy: event.resolved_by || undefined
      }));

      return {
        period: 'Last 7 days',
        metrics,
        topThreats: threats.slice(0, 5),
        recentEvents: mappedEvents,
        recommendations,
        complianceStatus
      };
    } catch (error) {
      logger.error('Error in generateSecurityReport:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Métodos auxiliares
   */
  private getDefaultMetrics(): SecurityMetrics {
    return {
      totalEvents: 0,
      criticalEvents: 0,
      resolvedEvents: 0,
      averageResponseTime: 0,
      threatDetectionRate: 0,
      falsePositiveRate: 0,
      securityScore: 100
    };
  }

  private calculateAverageResponseTime(events: Tables<'security_events'>[]): number {
    const resolvedEvents = events.filter(e => e.resolved && e.resolved_at);
    if (resolvedEvents.length === 0) return 0;
    
    const totalTime = resolvedEvents.reduce((sum, event) => {
      const detected = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
      const resolved = event.resolved_at ? new Date(event.resolved_at).getTime() : Date.now();
      return sum + (resolved - detected);
    }, 0);
    
    return totalTime / resolvedEvents.length / (1000 * 60); // minutos
  }

  private calculateThreatDetectionRate(events: Tables<'security_events'>[]): number {
    const suspiciousEvents = events.filter(e => e.event_type === 'suspicious_activity').length;
    return events.length > 0 ? (suspiciousEvents / events.length) * 100 : 0;
  }

  private calculateFalsePositiveRate(events: Tables<'security_events'>[]): number {
    const falsePositives = events.filter(e => {
      const meta = e.metadata as any;
      return meta && typeof meta === 'object' && meta.falsePositive === true;
    }).length;
    return events.length > 0 ? (falsePositives / events.length) * 100 : 0;
  }

  private calculateSecurityScore(totalEvents: number, criticalEvents: number, resolvedEvents: number): number {
    if (totalEvents === 0) return 100;
    
    const resolutionRate = resolvedEvents / totalEvents;
    const criticalRate = criticalEvents / totalEvents;
    
    return Math.max(0, 100 - (criticalRate * 50) + (resolutionRate * 30));
  }

  private generateSecurityRecommendations(metrics: SecurityMetrics, threats: ThreatDetection[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.securityScore < 70) {
      recommendations.push('Implementar medidas de seguridad adicionales');
    }
    
    if (metrics.criticalEvents > 5) {
      recommendations.push('Revisar y mejorar políticas de seguridad');
    }
    
    if (metrics.averageResponseTime > 60) {
      recommendations.push('Mejorar tiempo de respuesta a incidentes');
    }
    
    if (threats.length > 0) {
      recommendations.push('Investigar amenazas activas inmediatamente');
    }
    
    return recommendations;
  }

  private async checkComplianceStatus(): Promise<SecurityReport['complianceStatus']> {
    // TODO: Implementar verificación real de cumplimiento
    return {
      gdpr: true,
      ccpa: true,
      iso27001: false
    };
  }
}

export const securityAuditService = SecurityAuditService.getInstance();
