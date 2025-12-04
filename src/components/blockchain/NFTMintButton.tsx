import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Camera, Heart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { walletService, WalletService } from '@/services/WalletService';
import { nftService } from '@/services/NFTService';
import { logger } from '@/lib/logger';

/**
 * Componente reutilizable para mintear NFTs
 * Soporta tanto NFTs individuales como de pareja con consentimiento doble
 */

interface NFTMintButtonProps {
  /** ID del usuario que solicita el mint */
  userId: string;
  /** Tipo de NFT: 'single' para individual, 'couple' para pareja */
  type: 'single' | 'couple';
  /** Email de la pareja (solo para tipo 'couple') */
  partnerEmail?: string;
  /** Nombre del NFT */
  nftName: string;
  /** Descripción del NFT */
  nftDescription: string;
  /** Archivo de imagen para el NFT */
  imageFile?: File;
  /** Función callback cuando el mint es exitoso */
  onMintSuccess?: (nft: any) => void;
  /** Función callback cuando hay error */
  onMintError?: (error: string) => void;
  /** Clase CSS personalizada */
  className?: string;
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Variante del botón */
  variant?: 'default' | 'outline' | 'ghost';
  /** Texto personalizado del botón */
  buttonText?: string;
  /** Mostrar modo demo */
  showDemoMode?: boolean;
}

export const NFTMintButton: React.FC<NFTMintButtonProps> = ({
  userId,
  type,
  partnerEmail,
  nftName,
  nftDescription,
  imageFile,
  onMintSuccess,
  onMintError,
  className = '',
  size: _size = 'md',
  variant = 'default',
  buttonText,
  showDemoMode = true
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDemoMode] = useState(WalletService.isDemoMode());

  /**
   * Maneja el proceso de minteo de NFT
   */
  const handleMintNFT = async () => {
    if (!userId) {
      const error = 'ID de usuario requerido';
      setErrorMessage(error);
      setMintStatus('error');
      onMintError?.(error);
      return;
    }

    if (type === 'couple' && !partnerEmail) {
      const error = 'Email de pareja requerido para NFT de pareja';
      setErrorMessage(error);
      setMintStatus('error');
      onMintError?.(error);
      return;
    }

    setIsMinting(true);
    setMintStatus('minting');
    setErrorMessage('');

    try {
      let result;

      if (isDemoMode) {
        // Modo demo - simular minteo
        const demoAction = type === 'couple' ? 'couple_nft' : 'mint_nft';
        result = await walletService.executeDemoAction(userId, demoAction, {
          name: nftName,
          description: nftDescription,
          partnerEmail: partnerEmail || undefined
        });
        
        logger.info(`NFT ${type} minteado (DEMO):`, result);
        
        // Crear objeto NFT simulado
        const mockNFT = {
          id: `demo-${Date.now()}`,
          token_id: result.tokenId || Date.now() % 10000, // Usar timestamp en lugar de Math.random() para seguridad
          metadata_uri: 'ipfs://demo-metadata-hash',
          rarity: 'common',
          is_couple: type === 'couple',
          partner_address: type === 'couple' ? 'demo-partner-address' : null,
          created_at: new Date().toISOString()
        };
        
        result = mockNFT;
      } else {
        // Modo real - minteo real
        if (type === 'couple') {
          // NFT de pareja con consentimiento doble
          const fileToUse = imageFile || new File(['demo'], 'couple-nft.jpg', { type: 'image/jpeg' });
          result = await nftService.requestCoupleNFT(
            userId,
            partnerEmail!,
            nftName,
            nftDescription,
            fileToUse
          );
          logger.info('Solicitud de NFT de pareja creada:', result);
        } else {
          // NFT individual
          if (!imageFile) {
            // Crear archivo simulado si no se proporciona
            const mockFile = new File(['demo'], 'nft-image.jpg', { type: 'image/jpeg' });
            result = await nftService.mintSingleNFT(
              userId,
              nftName,
              nftDescription,
              mockFile
            );
          } else {
            result = await nftService.mintSingleNFT(
              userId,
              nftName,
              nftDescription,
              imageFile
            );
          }
          logger.info('NFT individual minteado:', result);
        }
      }

      setMintStatus('success');
      onMintSuccess?.(result);
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setMintStatus('idle');
      }, 3000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al mintear NFT';
          logger.error('Error minteando NFT:', { error: String(error) });
      setErrorMessage(errorMsg);
      setMintStatus('error');
      onMintError?.(errorMsg);
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setMintStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsMinting(false);
    }
  };

  /**
   * Obtiene el texto del botón según el estado
   */
  const getButtonText = () => {
    if (buttonText && mintStatus === 'idle') return buttonText;
    
    switch (mintStatus) {
      case 'minting':
        return type === 'couple' ? 'Creando Solicitud...' : 'Minteando NFT...';
      case 'success':
        return type === 'couple' ? 'Solicitud Creada!' : 'NFT Minteado!';
      case 'error':
        return 'Error - Reintentar';
      default:
        return type === 'couple' ? 'Crear NFT de Pareja' : 'Mintear NFT';
    }
  };

  /**
   * Obtiene el icono según el estado
   */
  const getIcon = () => {
    switch (mintStatus) {
      case 'minting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return type === 'couple' ? <Heart className="w-4 h-4" /> : <Camera className="w-4 h-4" />;
    }
  };

  /**
   * Obtiene las clases CSS del botón según el estado
   */
  const getButtonClasses = () => {
    const baseClasses = `flex items-center gap-2 transition-all duration-200 ${className}`;
    
    switch (mintStatus) {
      case 'success':
        return `${baseClasses} bg-green-500/20 hover:bg-green-600/30 text-green-200 border-green-400/30`;
      case 'error':
        return `${baseClasses} bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30`;
      case 'minting':
        return `${baseClasses} bg-blue-500/20 text-blue-200 border-blue-400/30 cursor-not-allowed`;
      default:
        if (type === 'couple') {
          return `${baseClasses} bg-pink-500/20 hover:bg-pink-600/30 text-pink-200 border-pink-400/30`;
        }
        return `${baseClasses} bg-purple-500/20 hover:bg-purple-600/30 text-purple-200 border-purple-400/30`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleMintNFT}
          disabled={isMinting || mintStatus === 'minting'}
          size="default"
          variant={variant}
          className={getButtonClasses()}
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        
        {showDemoMode && isDemoMode && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">
            DEMO
          </Badge>
        )}
      </div>

      {/* Mensaje de error */}
      {mintStatus === 'error' && errorMessage && (
        <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
          {errorMessage}
        </div>
      )}

      {/* Información adicional para NFT de pareja */}
      {type === 'couple' && mintStatus === 'success' && (
        <div className="text-green-400 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
          Solicitud enviada. La pareja debe aprobar en 24 horas.
        </div>
      )}

      {/* Información de modo demo */}
      {isDemoMode && mintStatus === 'success' && (
        <div className="text-yellow-400 text-sm bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
          Modo demo: No se consumieron tokens reales.
        </div>
      )}
    </div>
  );
};

export default NFTMintButton;

