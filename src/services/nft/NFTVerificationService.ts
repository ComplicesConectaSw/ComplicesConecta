/**
 * NFTVerificationService - Verificación de NFTs con GTK Staking
 * 
 * Requiere 100 GTK en staking para mint NFT
 * Solo usuarios con NFT pueden ver galerías privadas
 * 
 * @version 3.5.0
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { polygonStubService } from './PolygonStubService';

export interface NFTVerification {
  id: string;
  userId: string;
  nftContractAddress: string;
  nftTokenId: string;
  network: 'polygon' | 'ethereum';
  mintedWithGtk: number;
  stakingRecordId: string;
  verifiedAt: Date;
  isActive: boolean;
}

export interface MintNFTRequest {
  userId: string;
  galleryId?: string;
  gtkStakingAmount: number; // Mínimo 100 GTK
  metadata?: Record<string, unknown>;
}

const MIN_STAKING_GTK = 100;

class NFTVerificationService {
  private static instance: NFTVerificationService;

  static getInstance(): NFTVerificationService {
    if (!NFTVerificationService.instance) {
      NFTVerificationService.instance = new NFTVerificationService();
    }
    return NFTVerificationService.instance;
  }

  /**
   * Verifica si usuario tiene 100 GTK en staking
   */
  async hasRequiredStaking(userId: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }

      // Obtener staking activo de GTK
      const { data: stakingRecords, error } = await supabase
        .from('staking_records')
        .select('amount')
        .eq('user_id', userId)
        .eq('token_type', 'gtk')
        .eq('status', 'active');

      if (error || !stakingRecords) {
        return false;
      }

      const totalStaked = stakingRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      return totalStaked >= MIN_STAKING_GTK;
    } catch (error) {
      logger.error('Error verificando staking', { error });
      return false;
    }
  }

  /**
   * Mint NFT con GTK staking (requiere 100 GTK mínimo)
   */
  async mintNFT(request: MintNFTRequest): Promise<NFTVerification | null> {
    try {
      logger.info('🎨 Minting NFT con GTK staking', {
        userId: request.userId.substring(0, 8) + '***',
        gtkAmount: request.gtkStakingAmount
      });

      // 1. Verificar staking mínimo
      if (request.gtkStakingAmount < MIN_STAKING_GTK) {
        throw new Error(`Se requieren al menos ${MIN_STAKING_GTK} GTK en staking`);
      }

      // 2. Verificar que tiene staking activo
      const hasStaking = await this.hasRequiredStaking(request.userId);
      if (!hasStaking) {
        throw new Error(`Se requieren ${MIN_STAKING_GTK} GTK en staking activo`);
      }

      // 3. Obtener staking record activo
      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }

      const { data: stakingRecord, error: stakingError } = await supabase
        .from('staking_records')
        .select('id, amount')
        .eq('user_id', request.userId)
        .eq('token_type', 'gtk')
        .eq('status', 'active')
        .gte('amount', MIN_STAKING_GTK)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (stakingError || !stakingRecord) {
        throw new Error('No se encontró staking activo con suficiente GTK');
      }

      // 4. Mint NFT en Polygon (stub)
      const nftResult = await polygonStubService.mintERC721({
        to: request.userId,
        tokenURI: `https://complicesconecta.com/nft/${request.userId}/${request.galleryId || 'profile'}`,
        metadata: {
          userId: request.userId,
          galleryId: request.galleryId,
          mintedWithGtk: request.gtkStakingAmount,
          ...request.metadata
        }
      });

      // 5. Guardar verificación en BD
      const verification: NFTVerification = {
        id: crypto.randomUUID(),
        userId: request.userId,
        nftContractAddress: nftResult.contractAddress,
        nftTokenId: nftResult.tokenId,
        network: 'polygon',
        mintedWithGtk: request.gtkStakingAmount,
        stakingRecordId: stakingRecord.id,
        verifiedAt: new Date(),
        isActive: true
      };

      const { error: insertError } = await supabase
        .from('nft_verifications')
        .insert({
          id: verification.id,
          user_id: verification.userId,
          nft_contract_address: verification.nftContractAddress,
          nft_token_id: verification.nftTokenId,
          network: verification.network,
          minted_with_gtk: verification.mintedWithGtk,
          staking_record_id: verification.stakingRecordId,
          verified_at: verification.verifiedAt.toISOString(),
          is_active: verification.isActive
        });

      if (insertError) {
        throw insertError;
      }

      logger.info('✅ NFT minted exitosamente', {
        userId: request.userId.substring(0, 8) + '***',
        tokenId: nftResult.tokenId
      });

      return verification;
    } catch (error) {
      logger.error('Error minting NFT', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Verifica si usuario tiene NFT verificado
   */
  async hasNFTVerification(userId: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }

      const { data, error } = await supabase
        .from('nft_verifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

      if (error || !data || data.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error verificando NFT', { error });
      return false;
    }
  }

  /**
   * Obtiene verificación NFT del usuario
   */
  async getVerification(userId: string): Promise<NFTVerification | null> {
    try {
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from('nft_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('verified_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        nftContractAddress: data.nft_contract_address,
        nftTokenId: data.nft_token_id,
        network: data.network as 'polygon' | 'ethereum',
        mintedWithGtk: data.minted_with_gtk || 0,
        stakingRecordId: data.staking_record_id,
        verifiedAt: new Date(data.verified_at),
        isActive: data.is_active
      };
    } catch (error) {
      logger.error('Error obteniendo verificación NFT', { error });
      return null;
    }
  }

  /**
   * Verifica acceso a galería privada (requiere NFT)
   */
  async canAccessPrivateGallery(ownerId: string, requesterId: string): Promise<boolean> {
    // Si es el dueño, siempre tiene acceso
    if (ownerId === requesterId) {
      return true;
    }

    // Verificar si el solicitante tiene NFT verificado
    const hasNFT = await this.hasNFTVerification(requesterId);
    return hasNFT;
  }
}

export const nftVerificationService = NFTVerificationService.getInstance();
export default nftVerificationService;

