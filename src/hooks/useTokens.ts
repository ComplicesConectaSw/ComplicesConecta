/**
 * Hook useTokens() - Sistema de Tokens CMPX/GTK para fase Beta
 * Gestión completa de balances, transacciones, staking y recompensas
 * NOTA: Mock temporal hasta implementar tablas de tokens en BD
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isDemoMode, shouldUseRealSupabase, getAppConfig } from '../lib/app-config';
import { supabase } from '../integrations/supabase/client';

// Interfaces simplificadas para demo vs real
export interface TokenBalance {
  cmpx: number;
  gtk: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'reward' | 'staking' | 'referral' | 'purchase';
  token_type: 'cmpx' | 'gtk';
  amount: number;
  description: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface StakingRecord {
  id: string;
  user_id: string;
  token_type: 'cmpx' | 'gtk';
  amount: number;
  start_date: string;
  end_date: string;
  apy: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  type: 'daily_login' | 'profile_completion' | 'referral' | 'world_id';
  token_type: 'cmpx' | 'gtk';
  amount: number;
  description: string;
  claimed: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface TokenStats {
  totalUsers: number;
  totalCMPX: number;
  totalGTK: number;
  totalStaked: number;
  totalTransactions: number;
}

export const useTokens = () => {
  const { user, isDemo, appMode } = useAuth();
  const [balance, setBalance] = useState<TokenBalance>({ cmpx: 0, gtk: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakingRecords, setStakingRecords] = useState<StakingRecord[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const config = getAppConfig();

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
      loadTokenData();
    }
  }, [user?.id]);

  const loadTokenData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('💰 Cargando datos de tokens - Modo:', config.mode, 'Demo activo:', isDemo());
      
      // Si es demo o no debemos usar Supabase real, usar datos mock
      if (isDemo() || !shouldUseRealSupabase()) {
        console.log('🎭 Cargando datos de tokens demo para:', user.email || user.id);
        
        // Balance demo basado en tipo de usuario
        const demoUser = localStorage.getItem('demo_user');
        let demoBalance = { cmpx: 1250, gtk: 850 };
        
        if (demoUser) {
          try {
            const parsedUser = JSON.parse(demoUser);
            if (parsedUser.role === 'admin') {
              demoBalance = { cmpx: 10000, gtk: 5000 }; // Admin tiene más tokens
            }
          } catch (error) {
            console.warn('Error parsing demo user for balance');
          }
        }
        
        setBalance(demoBalance);
        
        // Transacciones demo
        const mockTransactions: Transaction[] = [
          {
            id: 'demo-tx-1',
            user_id: user.id,
            type: 'reward',
            token_type: 'cmpx',
            amount: 100,
            description: 'Recompensa por actividad diaria',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed'
          },
          {
            id: 'demo-tx-2',
            user_id: user.id,
            type: 'staking',
            token_type: 'gtk',
            amount: 50,
            description: 'Staking de tokens GTK',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'completed'
          },
          {
            id: 'demo-tx-3',
            user_id: user.id,
            type: 'referral',
            token_type: 'cmpx',
            amount: 25,
            description: 'Bonificación por referido',
            created_at: new Date(Date.now() - 259200000).toISOString(),
            status: 'completed'
          }
        ];
        setTransactions(mockTransactions);
        
        // Registros de staking demo
        const mockStaking: StakingRecord[] = [
          {
            id: 'demo-stake-1',
            user_id: user.id,
            token_type: 'gtk',
            amount: 500,
            start_date: new Date(Date.now() - 604800000).toISOString(),
            end_date: new Date(Date.now() + 2419200000).toISOString(),
            apy: 12.5,
            status: 'active',
            created_at: new Date(Date.now() - 604800000).toISOString()
          }
        ];
        setStakingRecords(mockStaking);
        
        // Recompensas demo
        const mockRewards: Reward[] = [
          {
            id: 'demo-reward-1',
            user_id: user.id,
            type: 'daily_login',
            token_type: 'cmpx',
            amount: 10,
            description: 'Recompensa diaria por login',
            claimed: false,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-reward-2',
            user_id: user.id,
            type: 'profile_completion',
            token_type: 'gtk',
            amount: 25,
            description: 'Completar perfil al 100%',
            claimed: true,
            expires_at: null,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setRewards(mockRewards);
        
        console.log('✅ Datos de tokens demo cargados - Balance:', demoBalance);
      } else {
        // Cargar datos reales desde Supabase
        console.log('🔗 Cargando datos de tokens reales desde Supabase...');
        
        try {
          // Cargar balance real (implementar cuando existan las tablas)
          // const { data: balanceData } = await supabase
          //   .from('user_tokens')
          //   .select('*')
          //   .eq('user_id', user.id);
          
          // Por ahora, usar datos por defecto hasta implementar tablas reales
          setBalance({ cmpx: 0, gtk: 0 });
          setTransactions([]);
          setStakingRecords([]);
          setRewards([]);
          
          console.log('ℹ️ Datos reales no implementados aún - usando valores por defecto');
        } catch (error) {
          console.error('❌ Error cargando datos reales:', error);
          // Fallback a datos vacíos
          setBalance({ cmpx: 0, gtk: 0 });
          setTransactions([]);
          setStakingRecords([]);
          setRewards([]);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando datos de tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar referido
  const processReferral = async (referredUserId: string) => {
    if (!user) return false;
    
    if (isDemo() || !shouldUseRealSupabase()) {
      console.log('🎭 Simulando procesamiento de referido en modo demo');
      // Simular recompensa por referido
      const newTransaction: Transaction = {
        id: `demo-ref-${Date.now()}`,
        user_id: user.id,
        type: 'referral',
        token_type: 'cmpx',
        amount: 50,
        description: `Bonificación por referir usuario`,
        created_at: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => ({ ...prev, cmpx: prev.cmpx + 50 }));
      console.log('✅ Referido procesado en demo - +50 CMPX');
      return true;
    }
    
    try {
      console.log('🔗 Procesando referido real:', referredUserId);
      // TODO: Implementar lógica real de referidos con Supabase Edge Functions
      console.log('ℹ️ Procesamiento de referidos reales no implementado aún');
      return false;
    } catch (error) {
      console.error('❌ Error procesando referido:', error);
      return false;
    }
  };

  // Hacer staking
  const stakeTokens = async (tokenType: 'cmpx' | 'gtk', amount: number, duration: number) => {
    if (!user) return false;
    
    if (isDemo() || !shouldUseRealSupabase()) {
      console.log('🎭 Simulando staking en modo demo:', { tokenType, amount, duration });
      
      // Verificar balance suficiente
      if (balance[tokenType] < amount) {
        throw new Error('Balance insuficiente para staking');
      }
      
      // Crear registro de staking
      const newStaking: StakingRecord = {
        id: `demo-stake-${Date.now()}`,
        user_id: user.id,
        token_type: tokenType,
        amount,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        apy: tokenType === 'gtk' ? 12.5 : 8.0,
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      setStakingRecords(prev => [newStaking, ...prev]);
      setBalance(prev => ({ ...prev, [tokenType]: prev[tokenType] - amount }));
      
      console.log('✅ Staking procesado en demo:', { tokenType, amount, duration });
      return true;
    }
    
    try {
      console.log('🔗 Procesando staking real:', { tokenType, amount, duration });
      console.log('ℹ️ Staking real no implementado aún');
      return false;
    } catch (error) {
      console.error('❌ Error en staking:', error);
      return false;
    }
  };

  // Reclamar recompensa
  const claimReward = async (rewardId: string) => {
    if (!user) return false;
    
    if (isDemo() || !shouldUseRealSupabase()) {
      console.log('🎭 Reclamando recompensa en modo demo:', rewardId);
      
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward || reward.claimed) {
        console.log('❌ Recompensa no encontrada o ya reclamada');
        return false;
      }
      
      // Marcar como reclamada
      setRewards(prev => prev.map(r => 
        r.id === rewardId ? { ...r, claimed: true } : r
      ));
      
      // Añadir al balance
      setBalance(prev => ({
        ...prev,
        [reward.token_type]: prev[reward.token_type] + reward.amount
      }));
      
      // Añadir transacción
      const newTransaction: Transaction = {
        id: `demo-claim-${Date.now()}`,
        user_id: user.id,
        type: 'reward',
        token_type: reward.token_type,
        amount: reward.amount,
        description: `Recompensa reclamada: ${reward.description}`,
        created_at: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      console.log('✅ Recompensa reclamada en demo:', reward.amount, reward.token_type);
      return true;
    }
    
    try {
      console.log('🔗 Reclamando recompensa real:', rewardId);
      console.log('ℹ️ Reclamo de recompensas reales no implementado aún');
      return false;
    } catch (error) {
      console.error('❌ Error reclamando recompensa:', error);
      return false;
    }
  };

  // Refrescar datos
  const refreshTokenData = () => {
    console.log('🔄 Refrescando datos de tokens - Modo:', config.mode);
    loadTokenData();
  };




  return {
    // Estados
    balance,
    transactions,
    stakingRecords,
    rewards,
    loading,

    // Acciones
    refreshTokenData,
    processReferral,
    stakeTokens,
    claimReward,
    loadTokenData,

    // Utilidades
    totalBalance: balance ? balance.cmpx + balance.gtk : 0,
    availableRewards: rewards.filter(r => !r.claimed).length,
    activeStakings: stakingRecords.filter(s => s.status === 'active').length,
    
    // Información del modo
    isDemo: isDemo(),
    appMode: config.mode
  };
};
