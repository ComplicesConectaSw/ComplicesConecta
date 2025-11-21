/**
 * ConsentService.ts - Servicio de Consentimientos Dinámicos
 * 
 * Propósito: Gestionar consentimientos informados con evidencia legal
 * Autor: Lead Architect & Legal Tech
 * Versión: v3.7.2 - Legal Tech Implementation
 * Fecha: 21 Noviembre 2025
 * 
 * Características:
 * - Registro de consentimientos con evidencia legal
 * - Verificación de validez y expiración
 * - Integración con sistema de parejas
 * - Cumplimiento normativo
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ConsentRecord {
  id: string;
  userId: string;
  documentPath: string;
  consentType: 'TERMS' | 'PRIVACY' | 'LEY_OLIMPIA' | 'WALLET_RISK' | 'COUPLE_AGREEMENT';
  ipAddress: string;
  userAgent: string;
  consentTextHash: string;
  consentedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  version: string;
}

export interface CoupleAgreement {
  id: string;
  coupleId: string;
  partner1Id: string;
  partner2Id: string;
  partner1Signature: boolean;
  partner2Signature: boolean;
  status: 'PENDING' | 'ACTIVE' | 'DISPUTED' | 'DISSOLVED' | 'FORFEITED';
  signedAt: string | null;
  disputeDeadline: string | null;
  agreementHash: string;
}

export class ConsentService {
  /**
   * Registrar un nuevo consentimiento
   */
  static async recordConsent(params: {
    userId: string;
    documentPath: string;
    consentType: ConsentRecord['consentType'];
    consentText: string;
    ipAddress: string;
    userAgent: string;
    expirationDays?: number | null;
  }): Promise<ConsentRecord> {
    try {
      // Generar hash del contenido
      const contentHash = await this.generateContentHash(params.consentText);
      
      // Calcular fecha de expiración
      const expiresAt = params.expirationDays 
        ? new Date(Date.now() + params.expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase!
        .from('user_consents')
        .insert({
          user_id: params.userId,
          document_path: params.documentPath,
          consent_type: params.consentType,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
          consent_text_hash: contentHash,
          expires_at: expiresAt,
          version: '1.0'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error registrando consentimiento', { error, params });
        throw error;
      }

      logger.info('Consentimiento registrado exitosamente', {
        consentId: data.id,
        type: params.consentType,
        userId: params.userId
      });

      return {
        id: data.id,
        userId: data.user_id,
        documentPath: data.document_path,
        consentType: data.consent_type,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        consentTextHash: data.consent_text_hash,
        consentedAt: data.consented_at,
        expiresAt: data.expires_at,
        isActive: data.is_active,
        version: data.version
      };

    } catch (error) {
      logger.error('Error en recordConsent', { error, params });
      throw error;
    }
  }

  /**
   * Verificar si un usuario tiene consentimiento activo
   */
  static async hasActiveConsent(
    userId: string,
    documentPath: string,
    consentType: ConsentRecord['consentType']
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase!
        .from('user_consents')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('document_path', documentPath)
        .eq('consent_type', consentType)
        .eq('is_active', true)
        .order('consented_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error verificando consentimiento', { error });
        return false;
      }

      if (!data) return false;

      // Verificar si no ha expirado
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        logger.info('Consentimiento expirado', { consentId: data.id });
        return false;
      }

      return true;

    } catch (error) {
      logger.error('Error en hasActiveConsent', { error });
      return false;
    }
  }

  /**
   * Obtener todos los consentimientos activos de un usuario
   */
  static async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const { data, error } = await supabase!
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('consented_at', { ascending: false });

      if (error) {
        logger.error('Error obteniendo consentimientos de usuario', { error });
        throw error;
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        documentPath: item.document_path,
        consentType: item.consent_type,
        ipAddress: item.ip_address,
        userAgent: item.user_agent,
        consentTextHash: item.consent_text_hash,
        consentedAt: item.consented_at,
        expiresAt: item.expires_at,
        isActive: item.is_active,
        version: item.version
      }));

    } catch (error) {
      logger.error('Error en getUserConsents', { error });
      throw error;
    }
  }

  /**
   * Crear acuerdo prenupcial para pareja
   */
  static async createCoupleAgreement(params: {
    coupleId: string;
    partner1Id: string;
    partner2Id: string;
    agreementText: string;
  }): Promise<CoupleAgreement> {
    try {
      const agreementHash = await this.generateContentHash(params.agreementText);

      const { data, error } = await supabase!
        .from('couple_agreements')
        .insert({
          couple_id: params.coupleId,
          partner_1_id: params.partner1Id,
          partner_2_id: params.partner2Id,
          agreement_hash: agreementHash,
          death_clause_text: 'En caso de disolución de la cuenta de pareja por conflicto no resuelto en 30 días, los activos digitales (Tokens/NFTs) no reclamados serán transferidos a la plataforma por concepto de "Gastos Administrativos de Cancelación" y la cuenta será eliminada.',
          asset_disposition_clause: 'ADMIN_FORFEIT'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creando acuerdo de pareja', { error });
        throw error;
      }

      logger.info('Acuerdo de pareja creado', { agreementId: data.id });

      return {
        id: data.id,
        coupleId: data.couple_id,
        partner1Id: data.partner_1_id,
        partner2Id: data.partner_2_id,
        partner1Signature: data.partner_1_signature,
        partner2Signature: data.partner_2_signature,
        status: data.status,
        signedAt: data.signed_at,
        disputeDeadline: data.dispute_deadline,
        agreementHash: data.agreement_hash
      };

    } catch (error) {
      logger.error('Error en createCoupleAgreement', { error });
      throw error;
    }
  }

  /**
   * Firmar acuerdo de pareja
   */
  static async signCoupleAgreement(params: {
    agreementId: string;
    partnerId: string;
    ipAddress: string;
  }): Promise<CoupleAgreement> {
    try {
      // Obtener el acuerdo actual
      const { data: agreement, error: fetchError } = await supabase!
        .from('couple_agreements')
        .select('*')
        .eq('id', params.agreementId)
        .single();

      if (fetchError) {
        logger.error('Error obteniendo acuerdo', { fetchError });
        throw fetchError;
      }

      // Determinar qué partner está firmando
      const isPartner1 = agreement.partner_1_id === params.partnerId;
      const isPartner2 = agreement.partner_2_id === params.partnerId;

      if (!isPartner1 && !isPartner2) {
        throw new Error('Usuario no autorizado para firmar este acuerdo');
      }

      // Preparar campos de actualización
      const updateFields: any = {};
      
      if (isPartner1) {
        updateFields.partner_1_signature = true;
        updateFields.partner_1_ip = params.ipAddress;
        updateFields.partner_1_signed_at = new Date().toISOString();
      } else {
        updateFields.partner_2_signature = true;
        updateFields.partner_2_ip = params.ipAddress;
        updateFields.partner_2_signed_at = new Date().toISOString();
      }

      // Actualizar acuerdo
      const { data, error } = await supabase!
        .from('couple_agreements')
        .update(updateFields)
        .eq('id', params.agreementId)
        .select()
        .single();

      if (error) {
        logger.error('Error firmando acuerdo', { error });
        throw error;
      }

      logger.info('Acuerdo firmado exitosamente', {
        agreementId: params.agreementId,
        partnerId: params.partnerId,
        isPartner1
      });

      return {
        id: data.id,
        coupleId: data.couple_id,
        partner1Id: data.partner_1_id,
        partner2Id: data.partner_2_id,
        partner1Signature: data.partner_1_signature,
        partner2Signature: data.partner_2_signature,
        status: data.status,
        signedAt: data.signed_at,
        disputeDeadline: data.dispute_deadline,
        agreementHash: data.agreement_hash
      };

    } catch (error) {
      logger.error('Error en signCoupleAgreement', { error });
      throw error;
    }
  }

  /**
   * Verificar si una pareja tiene acuerdo activo
   */
  static async hasCoupleAgreement(coupleId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase!
        .from('couple_agreements')
        .select('id')
        .eq('couple_id', coupleId)
        .eq('status', 'ACTIVE')
        .eq('partner_1_signature', true)
        .eq('partner_2_signature', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error verificando acuerdo de pareja', { error });
        return false;
      }

      return !!data;

    } catch (error) {
      logger.error('Error en hasCoupleAgreement', { error });
      return false;
    }
  }

  /**
   * Generar hash SHA-256 del contenido
   */
  private static async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Revocar consentimiento
   */
  static async revokeConsent(consentId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase!
        .from('user_consents')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString()
        })
        .eq('id', consentId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error revocando consentimiento', { error });
        throw error;
      }

      logger.info('Consentimiento revocado', { consentId, userId });

    } catch (error) {
      logger.error('Error en revokeConsent', { error });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de consentimientos
   */
  static async getConsentStats(): Promise<{
    totalConsents: number;
    activeConsents: number;
    expiredConsents: number;
    revokedConsents: number;
    coupleAgreements: number;
  }> {
    try {
      const [consentsResult, couplesResult] = await Promise.all([
        supabase!
          .from('user_consents')
          .select('is_active, expires_at, revoked_at'),
        
        supabase!
          .from('couple_agreements')
          .select('id')
      ]);

      if (consentsResult.error || couplesResult.error) {
        throw consentsResult.error || couplesResult.error;
      }

      const consents = consentsResult.data || [];
      const now = new Date();

      const stats = {
        totalConsents: consents.length,
        activeConsents: 0,
        expiredConsents: 0,
        revokedConsents: 0,
        coupleAgreements: couplesResult.data?.length || 0
      };

      consents.forEach(consent => {
        if (consent.revoked_at) {
          stats.revokedConsents++;
        } else if (consent.expires_at && new Date(consent.expires_at) < now) {
          stats.expiredConsents++;
        } else if (consent.is_active) {
          stats.activeConsents++;
        }
      });

      return stats;

    } catch (error) {
      logger.error('Error obteniendo estadísticas de consentimientos', { error });
      throw error;
    }
  }
}

export default ConsentService;
