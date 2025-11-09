// Servicio para manejar comisiones de galerías (10% plataforma, 90% creador)
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface GalleryCommissionParams {
  galleryId: string;
  creatorId: string;
  transactionType: 'view' | 'like' | 'super_like' | 'purchase' | 'tip';
  amountCMPX: number;
  commissionPercentage?: number; // Default 10%
}

/**
 * Registrar comisión de galería y otorgar tokens al creador
 */
export const recordGalleryCommission = async (
  params: GalleryCommissionParams
): Promise<string | null> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    logger.info('💰 Registrando comisión de galería', {
      galleryId: params.galleryId,
      creatorId: params.creatorId.substring(0, 8) + '***',
      amount: params.amountCMPX,
    });

    const commissionPercentage = params.commissionPercentage || 10.0;

    // Llamar función SQL que calcula y otorga tokens automáticamente
    const { data, error } = await supabase.rpc('record_gallery_commission', {
      p_gallery_id: params.galleryId,
      p_creator_id: params.creatorId,
      p_transaction_type: params.transactionType,
      p_amount_cmpx: params.amountCMPX,
      p_commission_percentage: commissionPercentage,
    });

    if (error) throw error;

    logger.info('✅ Comisión registrada exitosamente', {
      commissionId: data,
    });

    return data;
  } catch (error) {
    logger.error('Error registrando comisión de galería:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Obtener comisiones pendientes de un creador
 */
interface GalleryCommission {
  id: string;
  gallery_id: string;
  creator_id: string;
  transaction_type: string;
  amount_cmpx: number;
  commission_amount_cmpx: number;
  creator_amount_cmpx: number;
  creator_paid: boolean | null;
  created_at: string;
  updated_at: string;
}

export const getCreatorPendingCommissions = async (
  creatorId: string
): Promise<GalleryCommission[]> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data, error } = await supabase
      .from('gallery_commissions')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('creator_paid', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error obteniendo comisiones pendientes:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/**
 * Obtener estadísticas de comisiones de un creador
 */
export const getCreatorCommissionStats = async (
  creatorId: string
): Promise<{
  totalEarned: number;
  totalPending: number;
  totalCommissions: number;
  platformCommission: number;
}> => {
  try {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { data, error } = await supabase
      .from('gallery_commissions')
      .select('creator_amount_cmpx, commission_amount_cmpx, creator_paid')
      .eq('creator_id', creatorId);

    if (error) throw error;

    const stats = {
      totalEarned: 0,
      totalPending: 0,
      totalCommissions: 0,
      platformCommission: 0,
    };

    interface CommissionStatsRow {
      creator_amount_cmpx: number;
      commission_amount_cmpx: number;
      creator_paid: boolean | null;
    }
    
    (data || []).forEach((commission: CommissionStatsRow) => {
      stats.totalCommissions += commission.creator_amount_cmpx + commission.commission_amount_cmpx;
      stats.platformCommission += commission.commission_amount_cmpx;
      
      if (commission.creator_paid === true) {
        stats.totalEarned += commission.creator_amount_cmpx;
      } else {
        stats.totalPending += commission.creator_amount_cmpx;
      }
    });

    return stats;
  } catch (error) {
    logger.error('Error obteniendo estadísticas de comisiones:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

