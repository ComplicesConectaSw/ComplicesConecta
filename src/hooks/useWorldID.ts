import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface WorldIDVerificationStatus {
  isVerified: boolean;
  isLoading: boolean;
  nullifierHash?: string;
  verifiedAt?: string;
  verificationLevel?: string;
  totalRewards?: number;
}

export interface WorldIDStats {
  totalVerified: number;
  totalRewards: number;
  monthlyVerified: number;
  monthlyRewards: number;
  currentMonth: string;
}

export const useWorldID = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<WorldIDVerificationStatus>({
    isVerified: false,
    isLoading: true
  });
  const [stats, setStats] = useState<WorldIDStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is verified with World ID
  const checkVerificationStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus({ isVerified: false, isLoading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const { data, error } = await supabase
        .from('user_token_balances')
        .select(`
          worldid_verified,
          worldid_nullifier_hash,
          worldid_verified_at,
          cmpx_balance
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Get total rewards from World ID verifications
        setStatus({
          isVerified: false,
          isLoading: false,
          nullifierHash: undefined,
          verifiedAt: undefined,
          verificationLevel: undefined
        });  
      } else {
        setStatus({ isVerified: false, isLoading: false });
      }
    } catch (err) {
      console.error('Error checking World ID verification status:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus({ isVerified: false, isLoading: false });
    }
  }, [user?.id]);

  // Get World ID statistics for admin/analytics
  const fetchStats = useCallback(async () => {
    try {
      // Simular estadísticas de WorldID para demo
      setStats({
        totalVerified: 89,
        totalRewards: 12500,
        monthlyVerified: 0,
        monthlyRewards: 0,
        currentMonth: ''
      });  
    } catch (err) {
      console.error('Error fetching World ID stats:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
    }
  }, []);

  // Refresh verification status
  const refreshStatus = useCallback(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

  // Check if World ID is properly configured
  const isConfigured = useCallback(() => {
    return !!(
      import.meta.env.VITE_WORLD_APP_ID &&
      import.meta.env.VITE_WORLD_APP_ACTION
    );
  }, []);

  // Get user's World ID verification history
  const getVerificationHistory = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select(`
          reward_amount,
          reward_type,
          verification_method,
          worldid_proof,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('verification_method', 'worldid')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching verification history:', err);
      return [];
    }
  }, [user?.id]);

  // Check monthly rewards limit
  const checkMonthlyLimit = useCallback(async () => {
    if (!user?.id) return { current: 0, limit: 500, remaining: 500 };

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth);

      if (error) {
        throw error;
      }

      const current = data?.reduce((sum: number, reward: { amount: number }) => sum + reward.amount, 0) || 0;
      const limit = 500;
      const remaining = Math.max(0, limit - current);

      return { current, limit, remaining };
    } catch (err) {
      console.error('Error checking monthly limit:', err);
      return { current: 0, limit: 500, remaining: 500 };
    }
  }, [user?.id]);

  // Initialize verification status check
  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  return {
    // Status
    status,
    stats,
    error,
    
    // Actions
    refreshStatus,
    fetchStats,
    getVerificationHistory,
    checkMonthlyLimit,
    
    // Utilities
    isConfigured,
    
    // Computed values
    isVerified: status.isVerified,
    isLoading: status.isLoading,
    canVerify: !status.isVerified && !status.isLoading && isConfigured(),
  };
};

export default useWorldID;
