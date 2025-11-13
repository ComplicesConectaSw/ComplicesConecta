// ComplicesConecta v3.7.0 - NFTService
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Servicio para gestión de NFTs, IPFS y lógica de parejas
// Funcionalidades: Mint NFT, upload IPFS, consentimiento doble, metadata

import { supabase } from '../integrations/supabase/client';
import { logger } from '@/lib/logger';
import { WalletService } from './WalletService';
import type { 
  CoupleNFTRequest, 
  BlockchainSupabaseClient 
} from '@/types/blockchain';
import { safeBlockchainCast } from '@/types/blockchain';

/**
 * Interfaz para metadata de NFT
 */
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Interfaz para información de NFT
 */
interface NFTInfo {
  id: string;
  token_id: number;
  owner_address: string;
  metadata_uri: string;
  rarity: string;
  is_couple: boolean;
  partner_address?: string;
  created_at: string;
}

// CoupleNFTRequest ya está importado desde @/types/blockchain

/**
 * Servicio de NFTs para ComplicesConecta
 * 
 * Características principales:
 * - Mint de NFTs individuales y de pareja
 * - Upload a IPFS con Pinata
 * - Sistema de consentimiento doble
 * - Gestión de metadata y rareza
 * - Integración con contratos inteligentes
 */
export class NFTService {
  private static instance: NFTService;
  private walletService: WalletService;
  
  // Helper para acceso seguro a tablas blockchain
  private get blockchainClient(): BlockchainSupabaseClient {
    if (!supabase) {
      throw new Error('Supabase client no inicializado');
    }
    return safeBlockchainCast(supabase);
  }
  
  // Configuración de Pinata IPFS
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud';
  private static readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
  
  // Tipos de rareza y sus multiplicadores
  private static readonly RARITY_TYPES = {
    common: { name: 'Común', multiplier: 100, probability: 70 },
    rare: { name: 'Raro', multiplier: 125, probability: 20 },
    epic: { name: 'Épico', multiplier: 150, probability: 8 },
    legendary: { name: 'Legendario', multiplier: 200, probability: 2 }
  };
  
  private constructor() {
    this.walletService = WalletService.getInstance();
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }
  
  /**
   * Sube una imagen a IPFS usando Pinata
   * @param file Archivo de imagen
   * @param metadata Metadata adicional
   * @returns Hash IPFS de la imagen
   */
  public async uploadImageToIPFS(file: File, metadata?: Record<string, any>): Promise<string> {
    try {
      logger.info('Subiendo imagen a IPFS...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: `ComplicesConecta-${Date.now()}`,
          keyvalues: metadata
        }));
      }
      
      const response = await fetch(`${NFTService.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_PINATA_JWT}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error subiendo a IPFS: ${response.statusText}`);
      }
      
      const result = await response.json();
      logger.info(`Imagen subida a IPFS: ${result.IpfsHash}`);
      
      return result.IpfsHash;
      
    } catch (error) {
      logger.error('Error subiendo imagen a IPFS:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Sube metadata de NFT a IPFS
   * @param metadata Metadata del NFT
   * @returns Hash IPFS del metadata
   */
  public async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      logger.info('Subiendo metadata a IPFS...');
      
      const response = await fetch(`${NFTService.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `ComplicesConecta-Metadata-${Date.now()}`
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error subiendo metadata a IPFS: ${response.statusText}`);
      }
      
      const result = await response.json();
      logger.info(`Metadata subida a IPFS: ${result.IpfsHash}`);
      
      return result.IpfsHash;
      
    } catch (error) {
      logger.error('Error subiendo metadata a IPFS:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Genera rareza aleatoria basada en probabilidades
   * @returns Tipo de rareza
   */
  public generateRandomRarity(): string {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [rarity, config] of Object.entries(NFTService.RARITY_TYPES)) {
      cumulative += config.probability;
      if (random <= cumulative) {
        return rarity;
      }
    }
    
    return 'common'; // Fallback
  }
  
  /**
   * Crea metadata para NFT individual
   * @param name Nombre del NFT
   * @param description Descripción
   * @param imageHash Hash IPFS de la imagen
   * @param rarity Rareza del NFT
   * @param additionalAttributes Atributos adicionales
   * @returns Metadata del NFT
   */
  public createNFTMetadata(
    name: string,
    description: string,
    imageHash: string,
    rarity: string,
    additionalAttributes: Array<{ trait_type: string; value: string | number }> = []
  ): NFTMetadata {
    const rarityConfig = NFTService.RARITY_TYPES[rarity as keyof typeof NFTService.RARITY_TYPES];
    
    return {
      name,
      description,
      image: `${NFTService.PINATA_GATEWAY}${imageHash}`,
      attributes: [
        { trait_type: 'Rarity', value: rarityConfig?.name || 'Común' },
        { trait_type: 'Type', value: 'Gallery' },
        { trait_type: 'Verified', value: 'WorldID' },
        { trait_type: 'Staking', value: 'Eligible' },
        { trait_type: 'Platform', value: 'ComplicesConecta' },
        { trait_type: 'Version', value: '3.7.0' },
        ...additionalAttributes
      ]
    };
  }
  
  /**
   * Mintea un NFT individual
   * @param userId ID del usuario
   * @param name Nombre del NFT
   * @param description Descripción
   * @param imageFile Archivo de imagen
   * @param network Red blockchain
   * @returns Información del NFT minteado
   */
  public async mintSingleNFT(
    userId: string,
    name: string,
    description: string,
    imageFile: File,
    network: string = 'mumbai'
  ): Promise<NFTInfo> {
    try {
      logger.info(`Minteando NFT individual para usuario ${userId}`);
      
      // 1. Obtener wallet del usuario
      const wallet1 = await this.walletService.getOrCreateWallet(userId, network);
      
      // 2. Subir imagen a IPFS
      const imageHash = await this.uploadImageToIPFS(imageFile, {
        user_id: userId,
        type: 'single_nft'
      });
      
      // 3. Generar rareza
      const rarity = this.generateRandomRarity();
      
      // 4. Crear metadata
      const metadata = this.createNFTMetadata(name, description, imageHash, rarity);
      
      // 5. Subir metadata a IPFS
      const metadataHash = await this.uploadMetadataToIPFS(metadata);
      const metadataUri = `ipfs://${metadataHash}`;
      
      // 6. Mintear en blockchain (simulado por ahora)
      const tokenId = Math.floor(Math.random() * 10000);
      
      // 7. Guardar en base de datos
      const { data, error } = await this.blockchainClient
        .from('user_nfts')
        .insert({
          token_id: tokenId,
          owner_address: wallet1.address,
          metadata_uri: metadataUri,
          rarity: rarity,
          is_couple: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error guardando NFT en base de datos:', { error: String(error) });
        throw error;
      }
      
      logger.info(`NFT individual minteado exitosamente: Token ID ${tokenId}`);
      return data as NFTInfo;
      
    } catch (error) {
      logger.error('Error minteando NFT individual:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Solicita mint de NFT de pareja
   * @param userId ID del usuario iniciador
   * @param partnerUserId ID del usuario pareja
   * @param name Nombre del NFT
   * @param description Descripción
   * @param imageFile Archivo de imagen
   * @param network Red blockchain
   * @returns Información de la solicitud
   */
  public async requestCoupleNFT(
    userId: string,
    partnerUserId: string,
    name: string,
    description: string,
    imageFile: File,
    network: string = 'mumbai'
  ): Promise<CoupleNFTRequest> {
    try {
      logger.info(`Solicitando NFT de pareja: ${userId} -> ${partnerUserId}`);
      
      // 1. Obtener wallets de ambos usuarios
      const initiatorWallet = await this.walletService.getOrCreateWallet(userId, network);
      const wallet2 = await this.walletService.getOrCreateWallet(partnerUserId, network);
      
      // 2. Verificar que no tengan ya un NFT de pareja
      const existingCouple = await this.checkExistingCoupleNFT(
        initiatorWallet.address,
        wallet2.address
      );
      
      if (existingCouple) {
        throw new Error('Esta pareja ya tiene un NFT');
      }
      
      // 3. Subir imagen a IPFS
      const imageHash = await this.uploadImageToIPFS(imageFile, {
        user_id: userId,
        partner_user_id: partnerUserId,
        type: 'couple_nft'
      });
      
      // 4. Crear metadata para pareja
      const metadata = this.createNFTMetadata(
        name,
        description,
        imageHash,
        'rare', // NFTs de pareja son siempre raros o mejor
        [
          { trait_type: 'Type', value: 'Couple' },
          { trait_type: 'Consent', value: 'Required' }
        ]
      );
      
      // 5. Subir metadata a IPFS
      const metadataHash = await this.uploadMetadataToIPFS(metadata);
      const metadataUri = `ipfs://${metadataHash}`;
      
      // 6. Crear solicitud en blockchain (simulado)
      const tokenId = Math.floor(Math.random() * 10000);
      
      // 7. Guardar solicitud en base de datos
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas para aprobar
      
      const { data, error } = await this.blockchainClient
        .from('couple_nft_requests')
        .insert({
          token_id: tokenId,
          partner1_address: initiatorWallet.address,
          partner2_address: wallet2.address,
          initiator_address: initiatorWallet.address,
          metadata_uri: metadataUri,
          consent1_timestamp: new Date().toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error creando solicitud de NFT de pareja:', { error: String(error) });
        throw error;
      }
      
      // 8. Enviar notificación al partner (implementar después)
      // await this.sendCoupleNFTNotification(partnerUserId, data.id);
      
      logger.info(`Solicitud de NFT de pareja creada: ${data.id}`);
      return (data as any) as CoupleNFTRequest;
      
    } catch (error) {
      logger.error('Error solicitando NFT de pareja:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene las solicitudes de NFT de pareja para un usuario
   * @param userId ID del usuario
   * @returns Lista de solicitudes de NFT de pareja
   */
  public async getCoupleNFTRequests(userId: string): Promise<any[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client no disponible');
      }

      // Obtener la dirección de wallet del usuario
      const { data: wallet } = await this.blockchainClient
        .from('user_wallets')
        .select('address')
        .eq('user_id', userId)
        .single();

      if (!wallet) {
        return [];
      }

      // Obtener solicitudes donde el usuario es partner1 o partner2
      const { data: request, error } = await this.blockchainClient
        .from('couple_nft_requests')
        .select('*')
        .or(`partner1_address.eq.${(wallet as any).address},partner2_address.eq.${(wallet as any).address}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (request as any) || [];
    } catch (error) {
      logger.error('Error obteniendo solicitudes de NFT de pareja:', { error: String(error) });
      return [];
    }
  }

  /**
   * Aprueba una solicitud de NFT de pareja
   * @param requestId ID de la solicitud
   * @param userId ID del usuario que aprueba
   * @returns Información del NFT minteado
   */
  public async approveCoupleNFT(requestId: string, userId: string): Promise<NFTInfo[]> {
    try {
      logger.info(`Aprobando NFT de pareja: ${requestId} por usuario ${userId}`);
      
      // 1. Obtener solicitud
      const { data: request, error: requestError } = await supabase
        .from('couple_nft_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError || !request) {
        throw new Error('Solicitud no encontrada');
      }
      
      // 2. Verificar que el usuario puede aprobar
      const userWallet = await this.walletService.getWalletByUserId(userId);
      if (!userWallet || 
          (userWallet.address !== request.partner1_address && 
           userWallet.address !== request.partner2_address)) {
        throw new Error('Usuario no autorizado para aprobar esta solicitud');
      }
      
      // 3. Verificar que no haya expirado
      if (new Date() > new Date(request.expires_at)) {
        await this.cancelCoupleNFTRequest(requestId, 'expired');
        throw new Error('La solicitud ha expirado');
      }
      
      // 4. Registrar consentimiento
      const isPartner2 = userWallet.address === request.partner2_address;
      const updateField = isPartner2 ? 'consent2_timestamp' : 'consent1_timestamp';
      
      const { error: updateError } = await supabase
        .from('couple_nft_requests')
        .update({
          [updateField]: new Date().toISOString(),
          status: request.consent1_timestamp && isPartner2 ? 'approved' : 'pending'
        })
        .eq('id', requestId);
      
      if (updateError) {
        throw new Error('Error actualizando consentimiento');
      }
      
      // 5. Si ambos han dado consentimiento, mintear
      if (request.consent1_timestamp && isPartner2) {
        return await this.executeCoupleNFTMint(requestId);
      }
      
      logger.info(`Consentimiento registrado para solicitud ${requestId}`);
      return [];
      
    } catch (error) {
      logger.error('Error aprobando NFT de pareja:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Ejecuta el mint del NFT de pareja
   * @param requestId ID de la solicitud
   * @returns Array con los dos NFTs minteados
   */
  private async executeCoupleNFTMint(requestId: string): Promise<NFTInfo[]> {
    try {
      // 1. Obtener solicitud actualizada
      const { data: request } = await supabase
        .from('couple_nft_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }
      
      // 2. Mintear dual NFT en blockchain (simulado)
      const tokenId1 = request.token_id;
      const tokenId2 = request.token_id + 1;
      
      // 3. Guardar ambos NFTs en base de datos
      const nfts = [
        {
          token_id: tokenId1,
          owner_address: request.partner1_address,
          metadata_uri: request.metadata_uri,
          rarity: 'rare',
          is_couple: true,
          partner_address: request.partner2_address,
          created_at: new Date().toISOString()
        },
        {
          token_id: tokenId2,
          owner_address: request.partner2_address,
          metadata_uri: request.metadata_uri,
          rarity: 'rare',
          is_couple: true,
          partner_address: request.partner1_address,
          created_at: new Date().toISOString()
        }
      ];
      
      const { data, error } = await supabase
        .from('user_nfts')
        .insert(nfts)
        .select();
      
      if (error) {
        throw new Error('Error guardando NFTs de pareja');
      }
      
      // 4. Actualizar solicitud como minteada
      await supabase
        .from('couple_nft_requests')
        .update({ status: 'minted' })
        .eq('id', requestId);
      
      logger.info(`NFT de pareja minteado exitosamente: Tokens ${tokenId1} y ${tokenId2}`);
      return data as NFTInfo[];
      
    } catch (error) {
      logger.error('Error ejecutando mint de NFT de pareja:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Cancela una solicitud de NFT de pareja
   * @param requestId ID de la solicitud
   * @param reason Razón de la cancelación
   */
  public async cancelCoupleNFTRequest(requestId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('couple_nft_requests')
        .update({ 
          status: reason === 'expired' ? 'expired' : 'cancelled' 
        })
        .eq('id', requestId);
      
      if (error) {
        throw error;
      }
      
      logger.info(`Solicitud de NFT de pareja cancelada: ${requestId} - ${reason}`);
      
    } catch (error) {
      logger.error('Error cancelando solicitud:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Verifica si una pareja ya tiene un NFT
   * @param address1 Primera dirección
   * @param address2 Segunda dirección
   * @returns true si ya tienen un NFT
   */
  private async checkExistingCoupleNFT(address1: string, address2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_nfts')
        .select('id')
        .eq('is_couple', true)
        .or(`and(owner_address.eq.${address1},partner_address.eq.${address2}),and(owner_address.eq.${address2},partner_address.eq.${address1})`)
        .limit(1);
      
      if (error) {
        logger.error('Error verificando NFT de pareja existente:', { error: String(error) });
        return false;
      }
      
      return data && data.length > 0;
      
    } catch (error) {
      logger.error('Error verificando NFT de pareja:', { error: String(error) });
      return false;
    }
  }
  
  /**
   * Obtiene los NFTs de un usuario
   * @param userId ID del usuario
   * @returns Array de NFTs del usuario
   */
  public async getUserNFTs(userId: string): Promise<NFTInfo[]> {
    try {
      const wallet = await this.walletService.getWalletByUserId(userId);
      if (!wallet) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('user_nfts')
        .select('*')
        .eq('owner_address', wallet.address)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error obteniendo NFTs del usuario:', { error: String(error) });
        throw error;
      }
      
      return data as NFTInfo[];
      
    } catch (error) {
      logger.error('Error obteniendo NFTs:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene las solicitudes pendientes de un usuario
   * @param userId ID del usuario
   * @returns Array de solicitudes pendientes
   */
  public async getPendingCoupleRequests(userId: string): Promise<CoupleNFTRequest[]> {
    try {
      const wallet = await this.walletService.getWalletByUserId(userId);
      if (!wallet) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('couple_nft_requests')
        .select('*')
        .or(`partner1_address.eq.${wallet.address},partner2_address.eq.${wallet.address}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error obteniendo solicitudes pendientes:', { error: String(error) });
        throw error;
      }
      
      return data as CoupleNFTRequest[];
      
    } catch (error) {
      logger.error('Error obteniendo solicitudes:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene información de rareza
   * @param rarity Tipo de rareza
   * @returns Configuración de rareza
   */
  public static getRarityInfo(rarity: string) {
    return NFTService.RARITY_TYPES[rarity as keyof typeof NFTService.RARITY_TYPES] || NFTService.RARITY_TYPES.common;
  }
  
  /**
   * Obtiene todos los tipos de rareza disponibles
   * @returns Tipos de rareza
   */
  public static getAllRarityTypes() {
    return NFTService.RARITY_TYPES;
  }
}

// Exportar instancia singleton
export const nftService = NFTService.getInstance();
