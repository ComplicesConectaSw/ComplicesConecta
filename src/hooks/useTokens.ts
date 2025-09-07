/**
 * Hook useTokens() - Sistema de Tokens CMPX/GTK para fase Beta
 * Gestión completa de balances, transacciones, staking y recompensas
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

  // 💰 Cargar balance actual
  const loadBalance = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Error cargando balance:', error);
      return;
    }

    if (data) {
      setBalance({
        cmpxBalance: data.cmpx_balance,
        gtkBalance: data.gtk_balance,
        cmpxStaked: data.cmpx_staked,
        monthlyEarned: data.monthly_earned,
        monthlyLimit: data.monthly_limit,
        monthlyRemaining: data.monthly_limit - data.monthly_earned,
        totalReferrals: data.total_referrals,
        referralCode: data.referral_code,
        worldIdVerified: data.world_id_verified,
        worldIdClaimed: data.world_id_claimed
      });
    }
  };

  // 📋 Cargar historial de transacciones
  const loadTransactions = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error cargando transacciones:', error);
      return;
    }

    if (data) {
      setTransactions(data.map(t => ({
        id: t.id,
        transactionType: t.transaction_type,
        tokenType: t.token_type,
        amount: t.amount,
        balanceBefore: t.balance_before,
        balanceAfter: t.balance_after,
        description: t.description,
        createdAt: t.created_at,
        relatedUserId: t.related_user_id
      })));
    }
  };

  // 🔒 Cargar registros de staking
  const loadStakingRecords = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_staking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error cargando staking:', error);
      return;
    }

    if (data) {
      const now = new Date();
      setStakingRecords(data.map(s => {
        const endDate = new Date(s.end_date);
        const daysRemaining = s.status === 'active' 
          ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          id: s.id,
          amount: s.amount,
          startDate: s.start_date,
          endDate: s.end_date,
          rewardPercentage: s.reward_percentage,
          status: s.status,
          rewardClaimed: s.reward_claimed,
          daysRemaining
        };
      }));
    }
  };

  // 🎁 Cargar recompensas pendientes
  const loadPendingRewards = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('pending_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('claimed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error cargando recompensas:', error);
      return;
    }

    if (data) {
      setPendingRewards(data.map(r => ({
        id: r.id,
        rewardType: r.reward_type,
        amount: r.amount,
        tokenType: r.token_type,
        description: r.description,
        expiresAt: r.expires_at,
        claimed: r.claimed
      })));
    }
  };

  // 🎯 Procesar referido
  const processReferral = async (referralCode: string) => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      const { data, error } = await supabase.rpc('process_referral_reward', {
        referral_code_param: referralCode,
        new_user_id: user.id
      });

      if (error) {
        console.error('❌ Error procesando referido:', error);
        return { success: false, message: 'Error procesando referido' };
      }

      if (data?.success) {
        await loadTokenData(); // Recargar datos
        return {
          success: true,
          message: data.message,
          inviterReward: data.inviter_reward,
          welcomeBonus: data.welcome_bonus
        };
      }

      return { success: false, message: data?.message || 'Error desconocido' };
    } catch (err) {
      console.error('❌ Error en processReferral:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // 🌍 Reclamar recompensa World ID
  const claimWorldIdReward = async () => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      const { data, error } = await supabase.rpc('claim_world_id_reward', {
        user_id_param: user.id
      });

      if (error) {
        console.error('❌ Error reclamando World ID:', error);
        return { success: false, message: 'Error reclamando recompensa' };
      }

      if (data?.success) {
        await loadTokenData(); // Recargar datos
        return {
          success: true,
          message: data.message,
          amount: data.amount,
          newBalance: data.new_balance
        };
      }

      return { success: false, message: data?.message || 'Error desconocido' };
    } catch (err) {
      console.error('❌ Error en claimWorldIdReward:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // 🔒 Iniciar staking
  const startStaking = async (amount: number, durationDays: number = 30) => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      const { data, error } = await supabase.rpc('start_staking', {
        user_id_param: user.id,
        amount_param: amount,
        duration_days: durationDays
      });

      if (error) {
        console.error('❌ Error iniciando staking:', error);
        return { success: false, message: 'Error iniciando staking' };
      }

      if (data?.success) {
        await loadTokenData(); // Recargar datos
        return {
          success: true,
          message: data.message,
          amount: data.amount,
          endDate: data.end_date,
          rewardPercentage: data.reward_percentage
        };
      }

      return { success: false, message: data?.message || 'Error desconocido' };
    } catch (err) {
      console.error('❌ Error en startStaking:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // 🔓 Completar staking
  const completeStaking = async (stakingId: string) => {
    try {
      const { data, error } = await supabase.rpc('complete_staking', {
        staking_id_param: stakingId
      });

      if (error) {
        console.error('❌ Error completando staking:', error);
        return { success: false, message: 'Error completando staking' };
      }

      if (data?.success) {
        await loadTokenData(); // Recargar datos
        return {
          success: true,
          message: data.message,
          originalAmount: data.original_amount,
          rewardAmount: data.reward_amount,
          totalReturn: data.total_return
        };
      }

      return { success: false, message: data?.message || 'Error desconocido' };
    } catch (err) {
      console.error('❌ Error en completeStaking:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // 📊 Obtener estadísticas generales (solo admins)
  const getTokenStats = async (): Promise<TokenStats | null> => {
    try {
      const { data: tokensData } = await supabase
        .from('user_tokens')
        .select('cmpx_balance, gtk_balance, cmpx_staked');

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('id');

      if (tokensData && transactionsData) {
        const totalCMPX = tokensData.reduce((sum, t) => sum + t.cmpx_balance, 0);
        const totalGTK = tokensData.reduce((sum, t) => sum + t.gtk_balance, 0);
        const totalStaked = tokensData.reduce((sum, t) => sum + t.cmpx_staked, 0);

        return {
          totalUsers: tokensData.length,
          totalCMPX,
          totalGTK,
          totalStaked,
          totalTransactions: transactionsData.length
        };
      }

      return null;
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err);
      return null;
    }
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
