/**
 * CoupleDissolutionService.ts - Protocolo de Disolución "Cuenta Regresiva"
 * 
 * Propósito: Gestionar disolución de parejas con congelamiento y timer de 72h
 * Autor: Lead Architect & Legal Engineer
 * Versión: v3.7.2 - Dissolution Protocol Implementation
 * Fecha: 21 Noviembre 2025
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DisputeStatus {
  id: string;
  coupleId: string;
  initiatedBy: string;
  status: 'PENDING_AGREEMENT' | 'RESOLVED_TRANSFERRED' | 'EXPIRED_FORFEITED';
  deadlineAt: string;
  timeRemaining: {
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  };
  frozenAssetsSnapshot: any;
  proposedWinnerId?: string;
  finalWinnerId?: string;
}

export interface AssetSnapshot {
  partner_1: {
    user_id: string;
    assets: {
      cmpx_balance: number;
      gtk_balance: number;
      nfts_count: number;
    };
  };
  partner_2: {
    user_id: string;
    assets: {
      cmpx_balance: number;
      gtk_balance: number;
      nfts_count: number;
    };
  };
  frozen_at: string;
  total_value_estimate: number;
}

export class CoupleDissolutionService {
  /**
   * Congelar cuenta e iniciar proceso de disolución
   */
  static async freezeAccount(coupleId: string, initiatedBy: string): Promise<DisputeStatus> {
    try {
      // Crear snapshot de activos
      const { data: snapshotData, error: snapshotError } = await supabase!
        .rpc('create_assets_snapshot', { p_couple_id: coupleId });

      if (snapshotError) {
        logger.error('Error creando snapshot de activos', { snapshotError });
        throw snapshotError;
      }

      // Crear disputa con timer de 72h
      const { data: dispute, error: disputeError } = await supabase!
        .from('couple_disputes')
        .insert({
          couple_id: coupleId,
          initiated_by: initiatedBy,
          frozen_assets_snapshot: snapshotData,
          deadline_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (disputeError) {
        logger.error('Error creando disputa', { disputeError });
        throw disputeError;
      }

      logger.info('Cuenta congelada exitosamente', {
        disputeId: dispute.id,
        coupleId,
        initiatedBy
      });

      return await this.getDisputeStatus(dispute.id);

    } catch (error) {
      logger.error('Error en freezeAccount', { error, coupleId, initiatedBy });
      throw error;
    }
  }

  /**
   * Proponer ganador de activos
   */
  static async proposeWinner(disputeId: string, winnerId: string, proposedBy: string): Promise<DisputeStatus> {
    try {
      const { data: _data, error } = await supabase!
        .from('couple_disputes')
        .update({
          proposed_winner_id: winnerId,
          proposed_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .eq('status', 'PENDING_AGREEMENT')
        .select()
        .single();

      if (error) {
        logger.error('Error proponiendo ganador', { error });
        throw error;
      }

      logger.info('Ganador propuesto', { disputeId, winnerId, proposedBy });

      return await this.getDisputeStatus(disputeId);

    } catch (error) {
      logger.error('Error en proposeWinner', { error });
      throw error;
    }
  }

  /**
   * Aceptar propuesta y procesar acuerdo
   */
  static async acceptProposal(disputeId: string, acceptedBy: string): Promise<DisputeStatus> {
    try {
      const { data, error } = await supabase!
        .from('couple_disputes')
        .update({
          winner_accepted_by: acceptedBy,
          accepted_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .eq('status', 'PENDING_AGREEMENT')
        .select()
        .single();

      if (error) {
        logger.error('Error aceptando propuesta', { error });
        throw error;
      }

      // Si hay propuesta y aceptación, procesar transferencia
      if (data.proposed_winner_id && data.winner_accepted_by) {
        await this.processAgreement(disputeId);
      }

      logger.info('Propuesta aceptada', { disputeId, acceptedBy });

      return await this.getDisputeStatus(disputeId);

    } catch (error) {
      logger.error('Error en acceptProposal', { error });
      throw error;
    }
  }

  /**
   * Procesar acuerdo y transferir activos
   */
  static async processAgreement(disputeId: string): Promise<void> {
    try {
      // Obtener datos de la disputa
      const { data: dispute, error: disputeError } = await supabase!
        .from('couple_disputes')
        .select('*, couple_profiles(*)')
        .eq('id', disputeId)
        .single();

      if (disputeError || !dispute) {
        throw new Error('Disputa no encontrada');
      }

      const winnerId = dispute.proposed_winner_id;
      const loserId = dispute.couple_profiles.partner_1_id === winnerId 
        ? dispute.couple_profiles.partner_2_id 
        : dispute.couple_profiles.partner_1_id;

      // Transferir todos los activos al ganador
      await this.transferAllAssets(winnerId, loserId);

      // Descongelar wallet del ganador
      await supabase!
        .from('user_wallets')
        .update({ is_frozen: false })
        .eq('user_id', winnerId);

      // Marcar pareja como disuelta
      await supabase!
        .from('couple_profiles')
        .update({ status: 'DISSOLVED' })
        .eq('id', dispute.couple_id);

      // Actualizar disputa como resuelta
      await supabase!
        .from('couple_disputes')
        .update({
          status: 'RESOLVED_TRANSFERRED',
          final_winner_id: winnerId,
          assets_transferred_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      logger.info('Acuerdo procesado exitosamente', { disputeId, winnerId, loserId });

    } catch (error) {
      logger.error('Error procesando acuerdo', { error });
      throw error;
    }
  }

  /**
   * Procesar disputas expiradas (cron job)
   */
  static async cronCheckExpirations(): Promise<void> {
    try {
      const { data: expiredDisputes, error } = await supabase!
        .rpc('get_expired_disputes');

      if (error) {
        logger.error('Error obteniendo disputas expiradas', { error });
        return;
      }

      for (const dispute of expiredDisputes || []) {
        await this.executeForfeiture(dispute.dispute_id);
      }

      logger.info('Procesamiento de expiraciones completado', {
        processedCount: expiredDisputes?.length || 0
      });

    } catch (error) {
      logger.error('Error en cronCheckExpirations', { error });
    }
  }

  /**
   * Ejecutar confiscación por expiración
   */
  private static async executeForfeiture(disputeId: string): Promise<void> {
    try {
      // Obtener disputa
      const { data: dispute, error: disputeError } = await supabase!
        .from('couple_disputes')
        .select('*, couple_profiles(*)')
        .eq('id', disputeId)
        .single();

      if (disputeError || !dispute) {
        logger.error('Disputa no encontrada para confiscación', { disputeId });
        return;
      }

      // Confiscar activos (transferir a cuenta de la plataforma)
      await this.confiscateAssets(
        dispute.couple_profiles.partner_1_id,
        dispute.couple_profiles.partner_2_id
      );

      // Marcar disputa como confiscada
      await supabase!
        .from('couple_disputes')
        .update({
          status: 'EXPIRED_FORFEITED',
          forfeited_to_platform_at: new Date().toISOString(),
          resolution_notes: 'Activos confiscados por expiración de plazo (72h)'
        })
        .eq('id', disputeId);

      // Marcar pareja como disuelta
      await supabase!
        .from('couple_profiles')
        .update({ status: 'DISSOLVED' })
        .eq('id', dispute.couple_id);

      logger.info('Confiscación ejecutada', { disputeId });

    } catch (error) {
      logger.error('Error ejecutando confiscación', { error, disputeId });
    }
  }

  /**
   * Obtener estado actual de una disputa
   */
  static async getDisputeStatus(disputeId: string): Promise<DisputeStatus> {
    try {
      const { data: dispute, error } = await supabase!
        .from('couple_disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (error || !dispute) {
        throw new Error('Disputa no encontrada');
      }

      // Obtener tiempo restante
      const { data: timeData, error: _timeError } = await supabase!
        .rpc('get_dispute_time_remaining', { p_dispute_id: disputeId });

      const timeRemaining = timeData?.[0] || {
        hours_remaining: 0,
        minutes_remaining: 0,
        seconds_remaining: 0,
        is_expired: true
      };

      return {
        id: dispute.id,
        coupleId: dispute.couple_id,
        initiatedBy: dispute.initiated_by,
        status: dispute.status,
        deadlineAt: dispute.deadline_at,
        timeRemaining: {
          hours: timeRemaining.hours_remaining,
          minutes: timeRemaining.minutes_remaining,
          seconds: timeRemaining.seconds_remaining,
          isExpired: timeRemaining.is_expired
        },
        frozenAssetsSnapshot: dispute.frozen_assets_snapshot,
        proposedWinnerId: dispute.proposed_winner_id,
        finalWinnerId: dispute.final_winner_id
      };

    } catch (error) {
      logger.error('Error obteniendo estado de disputa', { error });
      throw error;
    }
  }

  /**
   * Transferir todos los activos de perdedor a ganador
   */
  private static async transferAllAssets(winnerId: string, loserId: string): Promise<void> {
    try {
      // Obtener balances del perdedor
      const { data: loserWallet } = await supabase!
        .from('user_wallets')
        .select('cmpx_balance, gtk_balance')
        .eq('user_id', loserId)
        .single();

      if (loserWallet) {
        // Transferir tokens CMPX y GTK
        await supabase!
          .from('user_wallets')
          .update({
            cmpx_balance: 0,
            gtk_balance: 0,
            is_frozen: false
          })
          .eq('user_id', loserId);

        // Agregar tokens al ganador
        await supabase!
          .from('user_wallets')
          .update({
            cmpx_balance: (loserWallet.cmpx_balance || 0),
            gtk_balance: (loserWallet.gtk_balance || 0)
          })
          .eq('user_id', winnerId);
      }

      // Transferir NFTs
      await supabase!
        .from('user_nfts')
        .update({ user_id: winnerId })
        .eq('user_id', loserId)
        .eq('is_active', true);

      logger.info('Activos transferidos', { winnerId, loserId });

    } catch (error) {
      logger.error('Error transfiriendo activos', { error });
      throw error;
    }
  }

  /**
   * Confiscar activos a favor de la plataforma
   */
  private static async confiscateAssets(partner1Id: string, partner2Id: string): Promise<void> {
    try {
      // Resetear wallets de ambos partners
      await supabase!
        .from('user_wallets')
        .update({
          cmpx_balance: 0,
          gtk_balance: 0,
          is_frozen: false
        })
        .in('user_id', [partner1Id, partner2Id]);

      // Marcar NFTs como confiscados
      await supabase!
        .from('user_nfts')
        .update({ 
          is_active: false,
          metadata: { confiscated_at: new Date().toISOString(), reason: 'couple_dissolution_timeout' }
        })
        .in('user_id', [partner1Id, partner2Id])
        .eq('is_active', true);

      logger.info('Activos confiscados', { partner1Id, partner2Id });

    } catch (error) {
      logger.error('Error confiscando activos', { error });
      throw error;
    }
  }
}

export default CoupleDissolutionService;
