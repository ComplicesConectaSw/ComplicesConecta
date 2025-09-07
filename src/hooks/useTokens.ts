/**
 * Hook useTokens() - Sistema de Tokens CMPX/GTK para fase Beta
 * Gestión completa de balances, transacciones, staking y recompensas
 * NOTA: Mock temporal hasta implementar tablas de tokens en BD
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface TokenBalance {
  cmpxBalance: number;
  gtkBalance: number;
  cmpxStaked: number;
  monthlyEarned: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  totalReferrals: number;
  referralCode: string;
  worldIdVerified: boolean;
  worldIdClaimed: boolean;
}

export interface Transaction {
  id: string;
  transactionType: string;
  tokenType: 'CMPX' | 'GTK';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  relatedUserId?: string;
}

export interface StakingRecord {
  id: string;
  amount: number;
  startDate: string;
  endDate: string;
  rewardPercentage: number;
  status: 'active' | 'completed' | 'cancelled';
  rewardClaimed: boolean;
  daysRemaining?: number;
}

export interface PendingReward {
  id: string;
  rewardType: string;
  amount: number;
  tokenType: 'CMPX' | 'GTK';
  description: string;
  expiresAt?: string;
  claimed: boolean;
}

export interface TokenStats {
  totalUsers: number;
  totalCMPX: number;
  totalGTK: number;
  totalStaked: number;
  totalTransactions: number;
}

export function useTokens() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakingRecords, setStakingRecords] = useState<StakingRecord[]>([]);
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
      loadTokenData();
    }
  }, [user?.id]);

  // 📊 Cargar todos los datos de tokens
  const loadTokenData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadBalance(),
        loadTransactions(),
        loadStakingRecords(),
        loadPendingRewards()
      ]);

      console.log('🪙 Datos de tokens cargados exitosamente');
    } catch (err) {
      console.error('❌ Error cargando datos de tokens:', err);
      setError('Error cargando datos de tokens');
    } finally {
      setLoading(false);
    }
  };

  // 💰 Cargar balance actual (Mock temporal)
  const loadBalance = async () => {
    if (!user?.id) return;

    // Mock data temporal hasta implementar tablas de tokens
    const mockBalance = {
      cmpxBalance: 150,
      gtkBalance: 0,
      cmpxStaked: 50,
      monthlyEarned: 200,
      monthlyLimit: 500,
      monthlyRemaining: 300,
      totalReferrals: 3,
      referralCode: `REF_${user.id.slice(0, 8)}`,
      worldIdVerified: false,
      worldIdClaimed: false
    };

    setBalance(mockBalance);
  };

  // 📋 Cargar historial de transacciones (Mock temporal)
  const loadTransactions = async () => {
    if (!user?.id) return;

    // Mock data temporal
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        transactionType: 'referral_reward',
        tokenType: 'CMPX',
        amount: 50,
        balanceBefore: 100,
        balanceAfter: 150,
        description: 'Recompensa por referido exitoso',
        createdAt: new Date().toISOString(),
        relatedUserId: 'ref_user_123'
      },
      {
        id: '2',
        transactionType: 'staking_start',
        tokenType: 'CMPX',
        amount: -50,
        balanceBefore: 150,
        balanceAfter: 100,
        description: 'Inicio de staking por 30 días',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setTransactions(mockTransactions);
  };

  // 🔒 Cargar registros de staking (Mock temporal)
  const loadStakingRecords = async () => {
    if (!user?.id) return;

    // Mock data temporal
    const now = new Date();
    const endDate = new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000)); // 25 días restantes
    
    const mockStaking: StakingRecord[] = [
      {
        id: '1',
        amount: 50,
        startDate: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
        endDate: endDate.toISOString(),
        rewardPercentage: 10,
        status: 'active',
        rewardClaimed: false,
        daysRemaining: 25
      }
    ];

    setStakingRecords(mockStaking);
  };

  // 🎁 Cargar recompensas pendientes (Mock temporal)
  const loadPendingRewards = async () => {
    if (!user?.id) return;

    // Mock data temporal
    const mockRewards: PendingReward[] = [
      {
        id: '1',
        rewardType: 'world_id_verification',
        amount: 100,
        tokenType: 'CMPX',
        description: 'Recompensa por verificación World ID',
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
        claimed: false
      }
    ];

    setPendingRewards(mockRewards);
  };

  // 🎯 Procesar referido (Mock temporal)
  const processReferral = async (referralCode: string) => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (referralCode.startsWith('REF_')) {
      await loadTokenData();
      return {
        success: true,
        message: '¡Referido procesado exitosamente!',
        inviterReward: 50,
        welcomeBonus: 50
      };
    }

    return { success: false, message: 'Código de referido inválido' };
  };

  // 🌍 Reclamar recompensa World ID (Mock temporal)
  const claimWorldIdReward = async () => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (balance && !balance.worldIdClaimed) {
      await loadTokenData();
      return {
        success: true,
        message: '¡Recompensa World ID reclamada!',
        amount: 100,
        newBalance: balance.cmpxBalance + 100
      };
    }

    return { success: false, message: 'Ya has reclamado esta recompensa' };
  };

  // 🔒 Iniciar staking (Mock temporal)
  const startStaking = async (amount: number, durationDays: number = 30) => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (balance && balance.cmpxBalance >= amount) {
      const endDate = new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000));
      await loadTokenData();
      return {
        success: true,
        message: `¡Staking iniciado por ${amount} CMPX!`,
        amount,
        endDate: endDate.toISOString(),
        rewardPercentage: 10
      };
    }

    return { success: false, message: 'Balance insuficiente para staking' };
  };

  // 🔓 Completar staking (Mock temporal)
  const completeStaking = async (stakingId: string) => {
    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stakingRecord = stakingRecords.find(s => s.id === stakingId);
    if (stakingRecord && stakingRecord.status === 'active') {
      const originalAmount = stakingRecord.amount;
      const rewardAmount = Math.floor(originalAmount * (stakingRecord.rewardPercentage / 100));
      const totalReturn = originalAmount + rewardAmount;
      
      await loadTokenData();
      return {
        success: true,
        message: '¡Staking completado exitosamente!',
        originalAmount,
        rewardAmount,
        totalReturn
      };
    }

    return { success: false, message: 'Staking no encontrado o ya completado' };
  };

  // 📊 Obtener estadísticas generales (Mock temporal)
  const getTokenStats = async (): Promise<TokenStats | null> => {
    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalUsers: 1250,
      totalCMPX: 125000,
      totalGTK: 0,
      totalStaked: 25000,
      totalTransactions: 3500
    };
  };

  // 🔄 Refrescar datos
  const refreshTokens = () => {
    if (user?.id) {
      loadTokenData();
    }
  };

  // 🎯 Formatear mensajes amigables
  const getBalanceMessage = () => {
    if (!balance) return '🪙 Cargando tu balance...';

    const available = balance.cmpxBalance;
    const staked = balance.cmpxStaked;
    const pending = pendingRewards.reduce((sum, r) => sum + r.amount, 0);

    return `🪙 Tu balance actual:
- CMPX: ${balance.cmpxBalance + balance.cmpxStaked} (${available} disponibles, ${staked} en staking${pending > 0 ? `, ${pending} pendientes` : ''})
- GTK: ${balance.gtkBalance} (todos disponibles)

🎁 Límite mensual: ${balance.monthlyRemaining}/${balance.monthlyLimit} CMPX restantes
📊 Referidos exitosos: ${balance.totalReferrals}`;
  };

  const getStakingMessage = () => {
    return `🔒 El staking es como una alcancía especial: guardas tus CMPX por 30 días,
y al final recibes un +10% de recompensa.

Ejemplo: si pones 100 CMPX en staking, al terminar tendrás 110 CMPX.

👉 ¿Quieres poner tus tokens en staking ahora?`;
  };

  return {
    // Estado
    balance,
    transactions,
    stakingRecords,
    pendingRewards,
    loading,
    error,

    // Acciones
    processReferral,
    claimWorldIdReward,
    startStaking,
    completeStaking,
    refreshTokens,
    getTokenStats,

    // Mensajes amigables
    getBalanceMessage,
    getStakingMessage,

    // Utilidades
    canEarnMore: balance ? balance.monthlyRemaining > 0 : false,
    hasActiveStaking: stakingRecords.some(s => s.status === 'active'),
    hasPendingRewards: pendingRewards.length > 0,
    isWorldIdEligible: balance ? balance.worldIdVerified && !balance.worldIdClaimed : false
  };
}
