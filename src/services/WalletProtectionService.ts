/**
 * Wallet Protection Service
 * Protege contra conflictos de extensiones de wallet
 */

import { logger } from '@/lib/logger';
import type { WindowWithWallets } from '@/types/wallet.types';

export class WalletProtectionService {
  private static instance: WalletProtectionService;
  private protectedProperties: Set<string> = new Set();

  static getInstance(): WalletProtectionService {
    if (!WalletProtectionService.instance) {
      WalletProtectionService.instance = new WalletProtectionService();
    }
    return WalletProtectionService.instance;
  }

  constructor() {
    this.initializeProtection();
  }

  private initializeProtection(): void {
    // Proteger propiedades críticas del window object
    this.protectWindowProperties();
    
    // Detectar y manejar conflictos de wallet
    this.detectWalletConflicts();
  }

  private protectWindowProperties(): void {
    const criticalProperties = ['ethereum', 'solana', 'tronWeb', 'bybit'];
    
    criticalProperties.forEach(prop => {
      if (prop in window) {
        this.protectedProperties.add(prop);
        
        // Hacer la propiedad configurable para evitar errores
        try {
          const descriptor = Object.getOwnPropertyDescriptor(window, prop);
          if (descriptor && !descriptor.configurable) {
            Object.defineProperty(window, prop, {
              ...descriptor,
              configurable: true,
              writable: true
            });
          }
        } catch (error) {
          logger.warn(`No se pudo proteger la propiedad ${prop}`, { error });
        }
      }
    });
  }

  private detectWalletConflicts(): void {
    const win = window as WindowWithWallets;
    
    // Detectar MetaMask
    if (win.ethereum && win.ethereum.isMetaMask) {
      logger.debug('MetaMask detectado');
      this.handleMetaMaskConflicts();
    }

    // Detectar Solana
    if (win.solana) {
      logger.debug('Solana detectado');
      this.handleSolanaConflicts();
    }

    // Detectar TronLink
    if (win.tronWeb) {
      logger.debug('TronLink detectado');
      this.handleTronLinkConflicts();
    }

    // Detectar Bybit
    if (win.bybit) {
      logger.debug('Bybit detectado');
      this.handleBybitConflicts();
    }
  }

  private handleMetaMaskConflicts(): void {
    // Prevenir errores de redefinición de ethereum
    try {
      const win = window as WindowWithWallets;
      if (win.ethereum) {
        Object.defineProperty(window, 'ethereum', {
          value: win.ethereum,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      logger.warn('MetaMask conflict handled', { error });
    }
  }

  private handleSolanaConflicts(): void {
    // Prevenir errores de redefinición de solana
    try {
      const win = window as WindowWithWallets;
      if (win.solana) {
        Object.defineProperty(window, 'solana', {
          value: win.solana,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      logger.warn('Solana conflict handled', { error });
    }
  }

  private handleTronLinkConflicts(): void {
    // Prevenir errores de redefinición de tronWeb
    try {
      const win = window as WindowWithWallets;
      if (win.tronWeb) {
        Object.defineProperty(window, 'tronWeb', {
          value: win.tronWeb,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      logger.warn('TronLink conflict handled', { error });
    }
  }

  private handleBybitConflicts(): void {
    // Prevenir errores de redefinición de bybit
    try {
      const win = window as WindowWithWallets;
      if (win.bybit) {
        Object.defineProperty(window, 'bybit', {
          value: win.bybit,
          writable: false,
          configurable: true
        });
      }
    } catch (error) {
      logger.warn('Bybit conflict handled', { error });
    }
  }

  // Método público para verificar si hay conflictos
  public hasConflicts(): boolean {
    return this.protectedProperties.size > 0;
  }

  // Método público para obtener lista de wallets detectados
  public getDetectedWallets(): string[] {
    const wallets: string[] = [];
    const win = window as WindowWithWallets;
    
    if (win.ethereum && win.ethereum.isMetaMask) wallets.push('MetaMask');
    if (win.solana) wallets.push('Solana');
    if (win.tronWeb) wallets.push('TronLink');
    if (win.bybit) wallets.push('Bybit');
    
    return wallets;
  }

  // Método para limpiar conflictos si es necesario
  public clearConflicts(): void {
    this.protectedProperties.clear();
    logger.debug('Conflictos de wallet limpiados');
  }
}

// Inicializar protección automáticamente
if (typeof window !== 'undefined') {
  WalletProtectionService.getInstance();
}

export default WalletProtectionService;
