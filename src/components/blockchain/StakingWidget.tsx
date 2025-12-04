import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Calendar, 
  Percent,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { walletService, WalletService } from '@/services/WalletService';
import { logger } from '@/lib/logger';

/**
 * Widget reutilizable para staking de tokens GTK y NFTs
 * Muestra información de staking, APY y permite stake/unstake
 */

interface StakingPosition {
  id: string;
  type: 'token' | 'nft';
  amount?: number; // Para tokens GTK
  tokenId?: number; // Para NFTs
  stakingContract: string;
  stakedAt: string;
  vestingPeriodDays: number;
  rarityMultiplier?: number; // Solo para NFTs
  totalRewardsClaimed: number;
  isActive: boolean;
  unstakedAt?: string;
}

interface StakingWidgetProps {
  /** ID del usuario */
  userId: string;
  /** Tipo de staking: 'token' para GTK, 'nft' para NFTs */
  type: 'token' | 'nft';
  /** Balance disponible para stake (solo para tokens) */
  availableBalance?: number;
  /** Lista de NFTs disponibles para stake (solo para NFTs) */
  availableNFTs?: any[];
  /** Posiciones de staking actuales */
  stakingPositions?: StakingPosition[];
  /** Función callback cuando se actualiza el staking */
  onStakingUpdate?: () => void;
  /** Clase CSS personalizada */
  className?: string;
  /** Mostrar información detallada */
  showDetails?: boolean;
}

export const StakingWidget: React.FC<StakingWidgetProps> = ({
  userId,
  type,
  availableBalance = 0,
  availableNFTs = [],
  stakingPositions = [],
  onStakingUpdate,
  className = '',
  showDetails = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [vestingPeriod, setVestingPeriod] = useState<number>(30);
  const [actionStatus, setActionStatus] = useState<'idle' | 'staking' | 'unstaking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDemoMode] = useState(WalletService.isDemoMode());

  // Calcular APY basado en el período de vesting
  const calculateAPY = (days: number): number => {
    if (days >= 365) return 20; // 20% APY para 1 año
    if (days >= 180) return 15; // 15% APY para 6 meses
    if (days >= 90) return 12;  // 12% APY para 3 meses
    return 10; // 10% APY para 30 días
  };

  // Calcular rewards pendientes
  const calculatePendingRewards = (position: StakingPosition): number => {
    const now = new Date();
    const stakedDate = new Date(position.stakedAt);
    const daysPassed = Math.floor((now.getTime() - stakedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (position.type === 'token' && position.amount) {
      const apy = calculateAPY(position.vestingPeriodDays);
      const dailyRate = apy / 365 / 100;
      return position.amount * dailyRate * daysPassed;
    } else if (position.type === 'nft') {
      // Para NFTs, rewards base + multiplicador de rareza
      const baseReward = 10; // 10 CMPX por día base
      const multiplier = position.rarityMultiplier || 100;
      return (baseReward * multiplier / 100) * daysPassed;
    }
    
    return 0;
  };

  /**
   * Maneja el staking de tokens o NFTs
   */
  const handleStake = async () => {
    if (!userId) return;

    if (type === 'token' && (!stakeAmount || parseFloat(stakeAmount) <= 0)) {
      setErrorMessage('Ingresa una cantidad válida para stakear');
      setActionStatus('error');
      return;
    }

    if (type === 'nft' && !selectedNFT) {
      setErrorMessage('Selecciona un NFT para stakear');
      setActionStatus('error');
      return;
    }

    setIsLoading(true);
    setActionStatus('staking');
    setErrorMessage('');

    try {
      if (isDemoMode) {
        // Modo demo - simular staking
        const result = await walletService.executeDemoAction(userId, 'stake_nft', { amount: parseFloat(stakeAmount), type });
        logger.info(`${type} stakeado (DEMO):`, result);
      } else {
        // Modo real - staking real
        if (type === 'token') {
          // TODO: Implementar staking de tokens cuando el contrato esté deployado
          logger.info('Staking de tokens GTK:', { amount: stakeAmount, vestingPeriod });
        } else {
          // TODO: Implementar staking de NFT cuando el contrato esté deployado
          logger.info('Staking de NFT:', { tokenId: selectedNFT, vestingPeriod });
        }
      }

      setActionStatus('success');
      setStakeAmount('');
      setSelectedNFT('');
      onStakingUpdate?.();
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setActionStatus('idle');
      }, 3000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al stakear';
      logger.error(`Error stakeando ${type}:`, { error: String(error) });
      setErrorMessage(errorMsg);
      setActionStatus('error');
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setActionStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el unstaking
   */
  const handleUnstake = async (positionId: string) => {
    if (!userId) return;

    setIsLoading(true);
    setActionStatus('unstaking');
    setErrorMessage('');

    try {
      if (isDemoMode) {
        // Modo demo - simular unstaking
        const result = await walletService.executeDemoAction(userId, 'send_tokens', {
          positionId,
          action: 'unstake'
        });
        
        logger.info('Unstaking (DEMO):', result);
      } else {
        // Modo real - unstaking real
        // TODO: Implementar unstaking cuando el contrato esté deployado
        logger.info('Unstaking:', { positionId });
      }

      setActionStatus('success');
      onStakingUpdate?.();
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setActionStatus('idle');
      }, 3000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al hacer unstake';
      logger.error('Error en unstaking:', { error: String(error) });
      setErrorMessage(errorMsg);
      setActionStatus('error');
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setActionStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene el icono según el estado
   */
  const getActionIcon = () => {
    switch (actionStatus) {
      case 'staking':
      case 'unstaking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border-blue-400/30 text-white ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Staking {type === 'token' ? 'GTK' : 'NFT'}
          {isDemoMode && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">
              DEMO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de APY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">APY Actual</span>
            </div>
            <div className="text-lg font-bold">{calculateAPY(vestingPeriod)}%</div>
          </div>
          
          <div className="p-3 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Período</span>
            </div>
            <div className="text-lg font-bold">{vestingPeriod}d</div>
          </div>
        </div>

        {/* Formulario de Staking */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            Nuevo Staking
          </h4>
          
          {type === 'token' ? (
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Cantidad GTK (Disponible: {availableBalance})
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 text-sm"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Seleccionar NFT ({availableNFTs.length} disponibles)
              </label>
              <select
                value={selectedNFT}
                onChange={(e) => setSelectedNFT(e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                disabled={isLoading}
              >
                <option value="">Seleccionar NFT...</option>
                {availableNFTs.map((nft) => (
                  <option key={nft.id} value={nft.token_id}>
                    NFT #{nft.token_id} ({nft.rarity})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-xs text-white/70 mb-1">
              Período de Vesting (días)
            </label>
            <select
              value={vestingPeriod}
              onChange={(e) => setVestingPeriod(Number(e.target.value))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              disabled={isLoading}
            >
              <option value={30}>30 días (10% APY)</option>
              <option value={90}>90 días (12% APY)</option>
              <option value={180}>180 días (15% APY)</option>
              <option value={365}>365 días (20% APY)</option>
            </select>
          </div>
          
          <Button
            onClick={handleStake}
            disabled={isLoading || actionStatus === 'staking'}
            className="w-full bg-blue-500/20 hover:bg-blue-600/30 text-blue-200 border-blue-400/30 flex items-center justify-center gap-2"
          >
            {getActionIcon()}
            {actionStatus === 'staking' ? 'Stakeando...' : 'Stakear'}
          </Button>
        </div>

        {/* Posiciones Activas */}
        {stakingPositions.length > 0 && showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              Posiciones Activas ({stakingPositions.length})
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stakingPositions.map((position) => (
                <div key={position.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {position.type === 'token' ? (
                        <Coins className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="text-sm font-medium">
                        {position.type === 'token' 
                          ? `${position.amount} GTK`
                          : `NFT #${position.tokenId}`
                        }
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleUnstake(position.id)}
                      disabled={isLoading}
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 text-xs px-2 py-1"
                    >
                      <Unlock className="w-3 h-3 mr-1" />
                      Unstake
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/70">APY:</span>
                      <div className="font-medium">{calculateAPY(position.vestingPeriodDays)}%</div>
                    </div>
                    <div>
                      <span className="text-white/70">Rewards:</span>
                      <div className="font-medium text-green-400">
                        {calculatePendingRewards(position).toFixed(2)} CMPX
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes de Estado */}
        {actionStatus === 'error' && errorMessage && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
            {errorMessage}
          </div>
        )}

        {actionStatus === 'success' && (
          <div className="text-green-400 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
            Operación completada exitosamente
          </div>
        )}

        {/* Información de Modo Demo */}
        {isDemoMode && (
          <div className="text-yellow-400 text-sm bg-yellow-500/10 p-2 rounded border border-yellow-500/20 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Modo Demo Activo</div>
              <div className="text-xs text-yellow-300/80">
                Las operaciones son simuladas. No se consumen tokens reales.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StakingWidget;

