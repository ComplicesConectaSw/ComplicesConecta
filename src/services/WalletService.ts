// ComplicesConecta v3.7.0 - WalletService
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Servicio de wallet interna con Supabase + Ethers.js + AES-256
// Funcionalidades: Crear wallet, encriptar claves, transacciones, balance

import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { supabase } from '../integrations/supabase/client';
import { logger } from '@/lib/logger';



/**
 * Interfaz para información de wallet
 */
interface WalletInfo {
  id: string;
  user_id: string;
  address: string;
  encrypted_private_key: string;
  network: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para balance de tokens
 */
interface TokenBalance {
  cmpx: string;
  gtk: string;
  matic: string;
}

/**
 * Interfaz para transacción
 */
interface _Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

/**
 * Configuración de red
 */
interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Servicio de Wallet Interna para ComplicesConecta
 * 
 * Características principales:
 * - Wallet interna con Supabase + Ethers.js
 * - Encriptación AES-256 de claves privadas
 * - Soporte para Mumbai testnet y Polygon mainnet
 * - Gestión de tokens CMPX y GTK
 * - Transacciones gasless para testnet
 * - Integración con contratos inteligentes
 */
export class WalletService {
  private static instance: WalletService;
  
  // Helper para acceder a tablas blockchain
  private get blockchainClient() {
    return supabase as any;
  }
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private encryptionKey: string;
  
  // Configuraciones de red
  private static readonly NETWORKS: Record<string, NetworkConfig> = {
    mumbai: {
      name: 'Mumbai Testnet',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      chainId: 80001,
      blockExplorer: 'https://mumbai.polygonscan.com/',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    polygon: {
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com/',
      chainId: 137,
      blockExplorer: 'https://polygonscan.com/',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    }
  };
  
  // Direcciones de contratos (se actualizarán después del deploy)
  private static readonly CONTRACT_ADDRESSES = {
    mumbai: {
      CMPX: '0x0000000000000000000000000000000000000000', // Actualizar después del deploy
      GTK: '0x0000000000000000000000000000000000000000',  // Actualizar después del deploy
      CoupleNFT: '0x0000000000000000000000000000000000000000', // Actualizar después del deploy
      StakingPool: '0x0000000000000000000000000000000000000000' // Actualizar después del deploy
    },
    polygon: {
      CMPX: '0x0000000000000000000000000000000000000000', // Para mainnet
      GTK: '0x0000000000000000000000000000000000000000',  // Para mainnet
      CoupleNFT: '0x0000000000000000000000000000000000000000', // Para mainnet
      StakingPool: '0x0000000000000000000000000000000000000000' // Para mainnet
    }
  };
  
  // Configuración de demo y testnet
  private static readonly DEMO_MODE = process.env.VITE_DEMO_MODE === 'true';
  private static readonly TESTNET_FREE_TOKENS = 1000; // 1000 CMPX gratuitos en testnet
  private static readonly DAILY_CLAIM_LIMIT = 2500000; // 2.5M CMPX diarios (1% del pool)
  
  private constructor() {
    // Clave de encriptación desde variables de entorno
    this.encryptionKey = process.env.VITE_WALLET_ENCRYPTION_KEY || 'default-key-change-in-production';
    
    // Inicializar provider por defecto (Mumbai testnet)
    this.initializeProvider('mumbai');
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }
  
  /**
   * Inicializa el provider de la red
   * @param network Red a utilizar ('mumbai' o 'polygon')
   */
  private initializeProvider(network: string): void {
    try {
      const config = WalletService.NETWORKS[network];
      if (!config) {
        throw new Error(`Red no soportada: ${network}`);
      }
      
      this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      logger.info(`Provider inicializado para ${config.name}`);
    } catch (error) {
      logger.error('Error inicializando provider:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Crea una nueva wallet para un usuario
   * @param userId ID del usuario en Supabase
   * @param network Red blockchain ('mumbai' por defecto)
   * @returns Información de la wallet creada
   */
  public async createWallet(userId: string, network: string = 'mumbai'): Promise<WalletInfo> {
    try {
      logger.info(`Creando wallet para usuario ${userId} en red ${network}`);
      
      // Verificar si el usuario ya tiene una wallet
      const existingWallet = await this.getWalletByUserId(userId);
      if (existingWallet) {
        throw new Error('El usuario ya tiene una wallet');
      }
      
      // Generar nueva wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Encriptar clave privada
      const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey);
      
      // Guardar en Supabase
      const { data, error } = await this.blockchainClient
        .from('user_wallets')
        .insert({
          user_id: userId,
          address: wallet.address,
          encrypted_private_key: encryptedPrivateKey,
          network: network,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error guardando wallet en Supabase:', { error: String(error) });
        throw error;
      }
      
      logger.info(`Wallet creada exitosamente: ${wallet.address}`);
      return data as WalletInfo;
      
    } catch (error) {
      logger.error('Error creando wallet:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene la wallet de un usuario
   * @param userId ID del usuario
   * @returns Información de la wallet o null si no existe
   */
  public async getWalletByUserId(userId: string): Promise<WalletInfo | null> {
    try {
      const { data, error } = await this.blockchainClient
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error('Error obteniendo wallet:', { error: String(error) });
        throw error;
      }
      
      return data as WalletInfo | null;
      
    } catch (error) {
      logger.error('Error obteniendo wallet:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene o crea una wallet para un usuario
   * @param userId ID del usuario
   * @param network Red blockchain
   * @returns Información de la wallet
   */
  public async getOrCreateWallet(userId: string, network: string = 'mumbai'): Promise<WalletInfo> {
    try {
      let wallet = await this.getWalletByUserId(userId);
      
      if (!wallet) {
        wallet = await this.createWallet(userId, network);
      }
      
      return wallet;
      
    } catch (error) {
      logger.error('Error obteniendo o creando wallet:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene el balance de tokens de una wallet
   * @param address Dirección de la wallet
   * @param network Red blockchain
   * @returns Balance de tokens
   */
  public async getTokenBalances(address: string, network: string = 'mumbai'): Promise<TokenBalance> {
    try {
      if (!this.provider) {
        this.initializeProvider(network);
      }
      
      // Balance de MATIC nativo
      const maticBalance = await this.provider!.getBalance(address);
      
      // TODO: Implementar balance de tokens CMPX y GTK cuando los contratos estén deployados
      // Por ahora retornamos valores por defecto
      
      return {
        cmpx: '0',
        gtk: '0',
        matic: ethers.utils.formatEther(maticBalance)
      };
      
    } catch (error) {
      logger.error('Error obteniendo balances:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Crea un signer para transacciones
   * @param userId ID del usuario
   * @param network Red blockchain
   * @returns Signer de Ethers.js
   */
  public async createSigner(userId: string, network: string = 'mumbai'): Promise<ethers.Wallet> {
    try {
      const walletInfo = await this.getWalletByUserId(userId);
      if (!walletInfo) {
        throw new Error('Wallet no encontrada para el usuario');
      }
      
      // Desencriptar clave privada
      const privateKey = this.decryptPrivateKey(walletInfo.encrypted_private_key);
      
      // Inicializar provider si es necesario
      if (!this.provider) {
        this.initializeProvider(network);
      }
      
      // Crear signer
      const signer = new ethers.Wallet(privateKey, this.provider!);
      
      return signer;
      
    } catch (error) {
      logger.error('Error creando signer:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Envía tokens CMPX
   * @param userId ID del usuario que envía
   * @param toAddress Dirección destino
   * @param amount Cantidad a enviar
   * @param network Red blockchain
   * @returns Hash de la transacción
   */
  public async sendCMPX(
    userId: string, 
    toAddress: string, 
    amount: string, 
    network: string = 'mumbai'
  ): Promise<string> {
    try {
      const _signer = await this.createSigner(userId, network);
      
      // TODO: Implementar cuando el contrato CMPX esté deployado
      // const cmpxContract = new ethers.Contract(
      //   WalletService.CONTRACT_ADDRESSES[network].CMPX,
      //   CMPX_ABI,
      //   signer
      // );
      
      // const tx = await cmpxContract.transfer(toAddress, ethers.utils.parseEther(amount));
      // return tx.hash;
      
      // Por ahora retornamos un hash simulado
      return '0x' + Math.random().toString(16).substr(2, 64);
      
    } catch (error) {
      logger.error('Error enviando CMPX:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Mintea un NFT de pareja
   * @param userId ID del usuario
   * @param partner1 Dirección de la primera pareja
   * @param partner2 Dirección de la segunda pareja
   * @param tokenURI URI del metadata
   * @param network Red blockchain
   * @returns Token ID del NFT
   */
  public async mintCoupleNFT(
    userId: string,
    partner1: string,
    partner2: string,
    tokenURI: string,
    network: string = 'mumbai'
  ): Promise<number> {
    try {
      const _signer = await this.createSigner(userId, network);
      
      // TODO: Implementar cuando el contrato CoupleNFT esté deployado
      // const coupleNFTContract = new ethers.Contract(
      //   WalletService.CONTRACT_ADDRESSES[network].CoupleNFT,
      //   COUPLE_NFT_ABI,
      //   signer
      // );
      
      // const tx = await coupleNFTContract.requestCoupleMint(partner1, partner2, tokenURI);
      // const receipt = await tx.wait();
      // return receipt.events[0].args.tokenId.toNumber();
      
      // Por ahora retornamos un token ID simulado
      return Math.floor(Math.random() * 10000);
      
    } catch (error) {
      logger.error('Error minteando NFT de pareja:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Stakea un NFT
   * @param userId ID del usuario
   * @param tokenId ID del NFT
   * @param vestingPeriod Período de vesting en días
   * @param rarity Rareza del NFT
   * @param network Red blockchain
   * @returns Hash de la transacción
   */
  public async stakeNFT(
    userId: string,
    tokenId: number,
    vestingPeriod: number,
    rarity: string,
    network: string = 'mumbai'
  ): Promise<string> {
    try {
      const _signer = await this.createSigner(userId, network);
      
      // TODO: Implementar cuando el contrato StakingPool esté deployado
      // const stakingContract = new ethers.Contract(
      //   WalletService.CONTRACT_ADDRESSES[network].StakingPool,
      //   STAKING_POOL_ABI,
      //   signer
      // );
      
      // const vestingPeriodSeconds = vestingPeriod * 24 * 60 * 60;
      // const tx = await stakingContract.stakeNFT(tokenId, vestingPeriodSeconds, rarity);
      // return tx.hash;
      
      // Por ahora retornamos un hash simulado
      return '0x' + Math.random().toString(16).substr(2, 64);
      
    } catch (error) {
      logger.error('Error stakeando NFT:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Encripta una clave privada usando AES-256
   * @param privateKey Clave privada a encriptar
   * @returns Clave privada encriptada
   */
  private encryptPrivateKey(privateKey: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(privateKey, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      logger.error('Error encriptando clave privada:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Desencripta una clave privada usando AES-256
   * @param encryptedPrivateKey Clave privada encriptada
   * @returns Clave privada desencriptada
   */
  private decryptPrivateKey(encryptedPrivateKey: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error('Error desencriptando clave privada:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Valida una dirección Ethereum
   * @param address Dirección a validar
   * @returns true si es válida
   */
  public static isValidAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }
  
  /**
   * Formatea una cantidad de tokens
   * @param amount Cantidad en wei
   * @param decimals Decimales del token (18 por defecto)
   * @returns Cantidad formateada
   */
  public static formatTokenAmount(amount: string, decimals: number = 18): string {
    try {
      return ethers.utils.formatUnits(amount, decimals);
    } catch {
      return '0';
    }
  }
  
  /**
   * Parsea una cantidad de tokens a wei
   * @param amount Cantidad a parsear
   * @param decimals Decimales del token (18 por defecto)
   * @returns Cantidad en wei
   */
  public static parseTokenAmount(amount: string, decimals: number = 18): string {
    try {
      return ethers.utils.parseUnits(amount, decimals).toString();
    } catch {
      return '0';
    }
  }
  
  /**
   * Obtiene información de la red actual
   * @param network Red blockchain
   * @returns Configuración de la red
   */
  public static getNetworkConfig(network: string): NetworkConfig | null {
    return WalletService.NETWORKS[network] || null;
  }
  
  /**
   * Obtiene las direcciones de contratos para una red
   * @param network Red blockchain
   * @returns Direcciones de contratos
   */
  public static getContractAddresses(network: string): Record<string, string> | null {
    return WalletService.CONTRACT_ADDRESSES[network as keyof typeof WalletService.CONTRACT_ADDRESSES] || null;
  }
  
  /**
   * Reclama tokens gratuitos de testnet
   * @param userId ID del usuario
   * @param amount Cantidad de tokens a reclamar (máximo 1000)
   * @param network Red blockchain (debe ser testnet)
   * @returns Hash de la transacción
   */
  public async claimTestnetTokens(
    userId: string,
    amount: number = WalletService.TESTNET_FREE_TOKENS,
    network: string = 'mumbai'
  ): Promise<string> {
    try {
      if (network !== 'mumbai') {
        throw new Error('Tokens gratuitos solo disponibles en testnet Mumbai');
      }
      
      if (amount > WalletService.TESTNET_FREE_TOKENS) {
        throw new Error(`Máximo ${WalletService.TESTNET_FREE_TOKENS} tokens por usuario`);
      }
      
      const _signer = await this.createSigner(userId, network);
      
      // TODO: Implementar cuando el contrato CMPX esté deployado
      // const cmpxContract = new ethers.Contract(
      //   WalletService.CONTRACT_ADDRESSES[network].CMPX,
      //   CMPX_ABI,
      //   signer
      // );
      
      // const tx = await cmpxContract.claimTestnetTokens(ethers.utils.parseEther(amount.toString()));
      // return tx.hash;
      
      // Por ahora retornamos un hash simulado y guardamos en base de datos local
      await this.saveTestnetTokensClaim(userId, amount);
      
      logger.info(`Tokens de testnet reclamados: ${amount} CMPX para usuario ${userId}`);
      return '0x' + Math.random().toString(16).substr(2, 64);
      
    } catch (error) {
      logger.error('Error reclamando tokens de testnet:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Verifica si el usuario puede reclamar tokens de testnet
   * @param userId ID del usuario
   * @returns Información de tokens disponibles
   */
  public async getTestnetTokensInfo(userId: string): Promise<{
    canClaim: boolean;
    claimed: number;
    remaining: number;
    maxClaim: number;
    dailyClaimed: number;
    dailyRemaining: number;
    dailyLimit: number;
  }> {
    try {
      const claimed = await this.getTestnetTokensClaimed(userId);
      const remaining = Math.max(0, WalletService.TESTNET_FREE_TOKENS - claimed);
      
      const dailyInfo = await this.getDailyTokensInfo(userId);
      
      return {
        canClaim: remaining > 0,
        claimed,
        remaining,
        maxClaim: WalletService.TESTNET_FREE_TOKENS,
        dailyClaimed: dailyInfo.claimed,
        dailyRemaining: dailyInfo.remaining,
        dailyLimit: WalletService.DAILY_CLAIM_LIMIT
      };
      
    } catch (error) {
      logger.error('Error obteniendo info de tokens de testnet:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Reclama tokens diarios para usuarios registrados (1% del pool por día)
   * @param userId ID del usuario
   * @param amount Cantidad de tokens a reclamar (máximo 2.5M)
   * @param network Red blockchain (debe ser testnet)
   * @returns Hash de la transacción
   */
  public async claimDailyTokens(
    userId: string,
    amount: number,
    network: string = 'mumbai'
  ): Promise<string> {
    try {
      if (network !== 'mumbai') {
        throw new Error('Tokens diarios solo disponibles en testnet Mumbai');
      }
      
      if (amount > WalletService.DAILY_CLAIM_LIMIT) {
        throw new Error(`Máximo ${WalletService.DAILY_CLAIM_LIMIT} tokens por día`);
      }
      
      // Verificar si el usuario ya reclamó hoy
      const dailyInfo = await this.getDailyTokensInfo(userId);
      if (dailyInfo.remaining < amount) {
        throw new Error(`Solo puedes reclamar ${dailyInfo.remaining} tokens más hoy`);
      }
      
      const _signer = await this.createSigner(userId, network);
      
      // TODO: Implementar cuando el contrato CMPX esté deployado
      // const cmpxContract = new ethers.Contract(
      //   WalletService.CONTRACT_ADDRESSES[network].CMPX,
      //   CMPX_ABI,
      //   signer
      // );
      
      // const tx = await cmpxContract.claimDailyTokens(ethers.utils.parseEther(amount.toString()));
      // return tx.hash;
      
      // Por ahora retornamos un hash simulado y guardamos en base de datos local
      await this.saveDailyTokensClaim(userId, amount);
      
      logger.info(`Tokens diarios reclamados: ${amount} CMPX para usuario ${userId}`);
      return '0x' + Math.random().toString(16).substr(2, 64);
      
    } catch (error) {
      logger.error('Error reclamando tokens diarios:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Ejecuta una función en modo demo (sin quemar tokens reales)
   * @param userId ID del usuario
   * @param action Acción a ejecutar
   * @param params Parámetros de la acción
   * @returns Resultado simulado
   */
  public async executeDemoAction(
    userId: string,
    action: 'mint_nft' | 'stake_nft' | 'send_tokens' | 'couple_nft',
    params: any
  ): Promise<any> {
    try {
      if (!WalletService.DEMO_MODE) {
        throw new Error('Modo demo no está habilitado');
      }
      
      logger.info(`Ejecutando acción demo: ${action} para usuario ${userId}`);
      
      // Simular diferentes acciones
      switch (action) {
        case 'mint_nft':
          return {
            success: true,
            tokenId: Math.floor(Math.random() * 10000),
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            message: 'NFT minteado exitosamente (DEMO)',
            cost: 0 // Sin costo en demo
          };
          
        case 'stake_nft':
          return {
            success: true,
            stakingId: Math.floor(Math.random() * 1000),
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            message: 'NFT stakeado exitosamente (DEMO)',
            estimatedRewards: params.amount * 0.1 // 10% APY simulado
          };
          
        case 'send_tokens':
          return {
            success: true,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            message: `${params.amount} CMPX enviados exitosamente (DEMO)`,
            cost: 0 // Sin costo en demo
          };
          
        case 'couple_nft':
          return {
            success: true,
            requestId: Math.floor(Math.random() * 10000),
            message: 'Solicitud de NFT de pareja creada (DEMO)',
            expiresIn: '24 horas',
            cost: 0 // Sin costo en demo
          };
          
        default:
          throw new Error(`Acción demo no soportada: ${action}`);
      }
      
    } catch (error) {
      logger.error('Error ejecutando acción demo:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Guarda el reclamo de tokens de testnet en base de datos local
   * @param userId ID del usuario
   * @param amount Cantidad reclamada
   */
  private async saveTestnetTokensClaim(userId: string, amount: number): Promise<void> {
    try {
      const { data: _data, error } = await this.blockchainClient
        .from('testnet_token_claims')
        .upsert({
          user_id: userId,
          amount_claimed: amount,
          claimed_at: new Date().toISOString()
        });
      
      if (error) {
        logger.error('Error guardando reclamo de tokens de testnet:', { error: String(error) });
        throw error;
      }
      
    } catch (error) {
      logger.error('Error en saveTestnetTokensClaim:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene la cantidad de tokens de testnet ya reclamados por un usuario
   * @param userId ID del usuario
   * @returns Cantidad reclamada
   */
  private async getTestnetTokensClaimed(userId: string): Promise<number> {
    try {
      const { data, error } = await this.blockchainClient
        .from('testnet_token_claims')
        .select('amount_claimed')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error('Error obteniendo tokens reclamados:', { error: String(error) });
        throw error;
      }
      
      return data?.amount_claimed || 0;
      
    } catch (error) {
      logger.error('Error en getTestnetTokensClaimed:', { error: String(error) });
      return 0;
    }
  }
  
  /**
   * Obtiene información de tokens diarios para un usuario
   * @param userId ID del usuario
   * @returns Información de tokens diarios
   */
  private async getDailyTokensInfo(userId: string): Promise<{
    claimed: number;
    remaining: number;
    canClaim: boolean;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const claimed = await this.getDailyTokensClaimed(userId, today);
      const remaining = Math.max(0, WalletService.DAILY_CLAIM_LIMIT - claimed);
      
      return {
        claimed,
        remaining,
        canClaim: remaining > 0
      };
      
    } catch (error) {
      logger.error('Error obteniendo info de tokens diarios:', { error: String(error) });
      return {
        claimed: 0,
        remaining: WalletService.DAILY_CLAIM_LIMIT,
        canClaim: true
      };
    }
  }
  
  /**
   * Guarda el reclamo de tokens diarios en base de datos local
   * @param userId ID del usuario
   * @param amount Cantidad reclamada
   */
  private async saveDailyTokensClaim(userId: string, amount: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const currentClaimed = await this.getDailyTokensClaimed(userId, today);
      
      // Usar tabla app_logs para registrar el claim
      const { error } = await (supabase!)
        .from('app_logs')
        .insert({
          message: `Daily tokens claimed: ${amount}`,
          level: 'info',
          user_id: userId,
          metadata: {
            amount,
            currentClaimed,
            claimDate: today,
            type: 'daily_token_claim'
          }
        });
      
      if (error) {
        logger.error('Error guardando reclamo de tokens diarios:', { error: String(error) });
        throw error;
      }
      
    } catch (error) {
      logger.error('Error en saveDailyTokensClaim:', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Obtiene la cantidad de tokens diarios ya reclamados por un usuario en una fecha
   * @param userId ID del usuario
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Cantidad reclamada
   */
  private async getDailyTokensClaimed(userId: string, date: string): Promise<number> {
    try {
      const { data, error } = await this.blockchainClient
        .from('daily_token_claims')
        .select('amount_claimed')
        .eq('user_id', userId)
        .eq('claim_date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error('Error obteniendo tokens diarios reclamados:', { error: String(error) });
        throw error;
      }
      
      return data?.amount_claimed || 0;
      
    } catch (error) {
      logger.error('Error en getDailyTokensClaimed:', { error: String(error) });
      return 0;
    }
  }
  
  /**
   * Verifica si está en modo demo
   * @returns true si está en modo demo
   */
  public static isDemoMode(): boolean {
    return WalletService.DEMO_MODE;
  }
}

// Exportar instancia singleton
export const walletService = WalletService.getInstance();
