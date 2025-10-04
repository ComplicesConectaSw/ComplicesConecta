/**
 * SecurityService - Sistema de seguridad avanzada con 2FA y fraud detection
 * TODO: Implementar lógica real de 2FA y detección de fraude
 * PLACEHOLDER: Retorna análisis mock seguros para mantener funcionalidad
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/types/types';

export interface SecurityAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: SecurityFlag[];
  recommendations: string[];
  requiresAction: boolean;
}

export interface SecurityFlag {
  type: 'suspicious_login' | 'multiple_devices' | 'unusual_activity' | 'fraud_pattern' | 'account_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  timestamp: string;
}

export interface TwoFactorSetup {
  userId: string;
  method: '2fa_app' | 'sms' | 'email';
  secret?: string;
  backupCodes: string[];
  isEnabled: boolean;
  verifiedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Json | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  riskScore: number;
}

export interface FraudAnalysis {
  isFraudulent: boolean;
  confidence: number;
  patterns: string[];
  riskFactors: string[];
  recommendation: 'allow' | 'review' | 'block' | 'require_verification';
}

class SecurityService {
  /**
   * Analiza actividad sospechosa de un usuario
   * TODO: Implementar análisis real con ML/IA
   */
  async analyzeUserActivity(userId: string, _timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<SecurityAnalysis> {
    try {
      // PLACEHOLDER: Análisis mock de actividad sospechosa
      const flags: SecurityFlag[] = [];
      let riskScore = 0;
      
      // Simular detección de patrones sospechosos
      if (Math.random() < 0.1) { // 10% chance de actividad sospechosa
        flags.push({
          type: 'unusual_activity',
          severity: 'medium',
          description: 'Patrón de actividad inusual detectado',
          confidence: 0.7,
          timestamp: new Date().toISOString()
        });
        riskScore += 30;
      }
      
      if (Math.random() < 0.05) { // 5% chance de múltiples dispositivos
        flags.push({
          type: 'multiple_devices',
          severity: 'low',
          description: 'Acceso desde múltiples dispositivos detectado',
          confidence: 0.8,
          timestamp: new Date().toISOString()
        });
        riskScore += 15;
      }
      
      const riskLevel = this.calculateRiskLevel(riskScore);
      const recommendations = this.generateSecurityRecommendations(flags);
      
      return {
        riskScore,
        riskLevel,
        flags,
        recommendations,
        requiresAction: riskLevel === 'high' || riskLevel === 'critical'
      };
      
    } catch (error) {
      console.error('Error analyzing user activity:', error);
      return {
        riskScore: 0,
        riskLevel: 'low',
        flags: [],
        recommendations: [],
        requiresAction: false
      };
    }
  }

  /**
   * Configura 2FA para un usuario
   * TODO: Integrar con servicio real de 2FA (Google Authenticator, Authy)
   */
  async setup2FA(userId: string, method: TwoFactorSetup['method']): Promise<{
    success: boolean;
    setup?: TwoFactorSetup;
    qrCode?: string;
    error?: string;
  }> {
    try {
      // PLACEHOLDER: Generar configuración mock de 2FA
      const secret = this.generateSecret();
      const backupCodes = this.generateBackupCodes();
      
      const setup: TwoFactorSetup = {
        userId,
        method,
        secret: method === '2fa_app' ? secret : undefined,
        backupCodes,
        isEnabled: false // Se habilitará después de verificación
      };
      
      // Guardar en base de datos (simulado - tabla no existe en esquema actual)
      const error = null; // Simulado para evitar errores de esquema
      
      if (error) {
        console.error('Error setting up 2FA:', error);
        return { success: false, error: 'Error simulado' };
      }
      
      // Generar QR code para apps de autenticación
      const qrCode = method === '2fa_app' ? this.generateQRCode(userId, secret) : undefined;
      
      return {
        success: true,
        setup,
        qrCode
      };
      
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica código 2FA
   * TODO: Implementar verificación real de códigos TOTP
   */
  async verify2FA(userId: string, code: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Obtener configuración 2FA del usuario (simulado - tabla no existe en esquema actual)
      const settings = null;
      const error = null;
      
      if (error || !settings) {
        return { success: false, error: '2FA no configurado' };
      }
      
      // PLACEHOLDER: Verificación mock (en producción usar TOTP library)
      const isValidCode = this.mockVerifyTOTP('mock_secret', code);
      const isBackupCode = false; // Simulado ya que settings es null
      
      if (!isValidCode && !isBackupCode) {
        // Log intento fallido
        await this.logSecurityEvent(userId, 'failed_2fa_verification', {
          code_length: code.length,
          timestamp: new Date().toISOString()
        });
        
        return { success: false, error: 'Código inválido' };
      }
      
      // Si usó backup code, removerlo de la lista (simulado)
      if (isBackupCode) {
        // Actualización simulada - tabla no existe en esquema actual
        console.log('Backup code usado:', code);
      }
      
      // Log verificación exitosa
      await this.logSecurityEvent(userId, 'successful_2fa_verification', {
        method: isBackupCode ? 'backup_code' : 'totp',
        timestamp: new Date().toISOString()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Detecta patrones de fraude
   * TODO: Implementar ML para detección de fraude real
   */
  async detectFraud(userId: string, activity: {
    action: string;
    ipAddress: string;
    userAgent: string;
    metadata?: Json | null;
  }): Promise<FraudAnalysis> {
    try {
      const patterns: string[] = [];
      const riskFactors: string[] = [];
      let confidence = 0;
      
      // PLACEHOLDER: Análisis básico de patrones de fraude
      
      // Verificar IP sospechosa
      if (this.isSuspiciousIP(activity.ipAddress)) {
        patterns.push('suspicious_ip');
        riskFactors.push('Dirección IP marcada como sospechosa');
        confidence += 0.3;
      }
      
      // Verificar user agent inusual
      if (this.isUnusualUserAgent(activity.userAgent)) {
        patterns.push('unusual_user_agent');
        riskFactors.push('User agent inusual o automatizado');
        confidence += 0.2;
      }
      
      // Verificar velocidad de acciones
      const isHighVelocity = await this.checkActionVelocity(userId, activity.action);
      if (isHighVelocity) {
        patterns.push('high_velocity');
        riskFactors.push('Velocidad de acciones anormalmente alta');
        confidence += 0.4;
      }
      
      const isFraudulent = confidence >= 0.6;
      let recommendation: FraudAnalysis['recommendation'] = 'allow';
      
      if (confidence >= 0.8) {
        recommendation = 'block';
      } else if (confidence >= 0.6) {
        recommendation = 'require_verification';
      } else if (confidence >= 0.3) {
        recommendation = 'review';
      }
      
      return {
        isFraudulent,
        confidence,
        patterns,
        riskFactors,
        recommendation
      };
      
    } catch (error) {
      console.error('Error detecting fraud:', error);
      return {
        isFraudulent: false,
        confidence: 0,
        patterns: [],
        riskFactors: [],
        recommendation: 'allow'
      };
    }
  }

  /**
   * Registra evento de seguridad en audit log
   */
  async logSecurityEvent(
    userId: string,
    action: string,
    details: Json | null,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const riskScore = await this.calculateEventRiskScore(action, details);
      
      await (supabase as any)
        .from('reports') // Usando tabla existente como fallback
        .insert({
          user_id: userId,
          action_type: action,
          action_description: `Evento de seguridad: ${action}`,
          resource_type: 'security',
          request_data: details,
          ip_address: ipAddress || 'unknown',
          user_agent: userAgent || 'unknown',
          fraud_score: riskScore,
          created_at: new Date().toISOString()
        });
        
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Obtiene logs de auditoría de un usuario
   */
  async getAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    success: boolean;
    logs?: AuditLogEntry[];
    total?: number;
    error?: string;
  }> {
    try {
      const { data, error, count } = await (supabase as any)
        .from('reports') // Usando tabla existente como fallback
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Mapear los datos de la base de datos al formato esperado
      const mappedLogs: AuditLogEntry[] = (data || []).map((log: any) => ({
        id: log.id,
        userId: log.user_id || '',
        action: log.action_type || '',
        resource: log.resource_type || '',
        details: log.request_data || null,
        ipAddress: (log.ip_address as string) || 'unknown',
        userAgent: log.user_agent || '',
        timestamp: log.created_at || new Date().toISOString(),
        riskScore: log.fraud_score || 0
      }));

      return {
        success: true,
        logs: mappedLogs,
        total: count || 0
      };
      
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Helpers privados
   */
  private calculateRiskLevel(score: number): SecurityAnalysis['riskLevel'] {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private generateSecurityRecommendations(flags: SecurityFlag[]): string[] {
    const recommendations: string[] = [];
    
    if (flags.some(f => f.type === 'unusual_activity')) {
      recommendations.push('Revisar actividad reciente y cambiar contraseña');
    }
    
    if (flags.some(f => f.type === 'multiple_devices')) {
      recommendations.push('Verificar dispositivos autorizados');
    }
    
    if (flags.length > 0) {
      recommendations.push('Habilitar autenticación de dos factores');
    }
    
    return recommendations;
  }

  private generateSecret(): string {
    // PLACEHOLDER: Generar secret mock para 2FA
    return 'JBSWY3DPEHPK3PXP'; // Base32 mock secret
  }

  private generateBackupCodes(): string[] {
    // PLACEHOLDER: Generar códigos de respaldo mock
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private generateQRCode(userId: string, secret: string): string {
    // PLACEHOLDER: En producción usar library para generar QR real
    return `otpauth://totp/ComplicesConecta:${userId}?secret=${secret}&issuer=ComplicesConecta`;
  }

  private mockVerifyTOTP(secret: string, code: string): boolean {
    // PLACEHOLDER: Verificación mock (en producción usar TOTP library real)
    return code.length === 6 && /^\d{6}$/.test(code);
  }

  private isSuspiciousIP(ip: string): boolean {
    // PLACEHOLDER: Lista básica de IPs sospechosas
    const suspiciousIPs = ['127.0.0.1', '0.0.0.0'];
    return suspiciousIPs.includes(ip);
  }

  private isUnusualUserAgent(userAgent: string): boolean {
    // PLACEHOLDER: Detectar user agents sospechosos
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private async checkActionVelocity(userId: string, action: string): Promise<boolean> {
    try {
      // Verificar cuántas veces ha realizado esta acción en la última hora
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count } = await (supabase as any)
        .from('reports') // Usando tabla existente como fallback
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', action)
        .gte('created_at', oneHourAgo);
      
      // PLACEHOLDER: Límites mock por acción
      const limits: Record<string, number> = {
        'login': 10,
        'password_change': 3,
        'profile_update': 5,
        'message_send': 100
      };
      
      const limit = limits[action] || 20;
      return (count || 0) > limit;
      
    } catch (error) {
      console.error('Error checking action velocity:', error);
      return false;
    }
  }

  private async calculateEventRiskScore(action: string, _details: Json | null): Promise<number> {
    // PLACEHOLDER: Cálculo básico de risk score
    const riskScores: Record<string, number> = {
      'login': 1,
      'failed_login': 5,
      'password_change': 3,
      'profile_update': 2,
      '2fa_setup': 2,
      'failed_2fa_verification': 8,
      'suspicious_activity': 10
    };
    
    return riskScores[action] || 1;
  }
}

export const securityService = new SecurityService();
export default securityService;
