import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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

      // Verificar contra tabla worldid_verifications
      if (!supabase) {
        logger.warn('Supabase no está disponible para verificación World ID');
        setStatus({
          isVerified: false,
          isLoading: false,
          nullifierHash: undefined,
          verifiedAt: undefined,
          verificationLevel: undefined
        });
        return;
      }

      const { data, error } = await supabase
        .from('worldid_verifications')
        .select('id, nullifier_hash, verified_at, verification_level, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('verified_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no hay verificación, no es un error crítico
        if (error.code === 'PGRST116') {
          logger.debug('Usuario no tiene verificación World ID activa');
          setStatus({
            isVerified: false,
            isLoading: false,
            nullifierHash: undefined,
            verifiedAt: undefined,
            verificationLevel: undefined
          });
          return;
        }
        throw error;
      }

      // Verificar si la verificación no ha expirado
      const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
      
      if (isExpired) {
        logger.debug('Verificación World ID expirada');
        setStatus({
          isVerified: false,
          isLoading: false,
          nullifierHash: undefined,
          verifiedAt: undefined,
          verificationLevel: undefined
        });
        return;
      }

      // Usuario verificado
      logger.info('✅ Usuario verificado con World ID', {
        nullifierHash: data.nullifier_hash?.substring(0, 8) + '***',
        level: data.verification_level
      });

      setStatus({
        isVerified: true,
        isLoading: false,
        nullifierHash: data.nullifier_hash,
        verifiedAt: data.verified_at || undefined,
        verificationLevel: data.verification_level || undefined
      });
    } catch (err) {
      logger.error('Error checking verification status:', { error: String(err) });
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus({ isVerified: false, isLoading: false });
    }
  }, [user?.id]);

  // Get World ID statistics for admin/analytics
  const fetchStats = useCallback(async () => {
    try {
      if (!supabase) {
        setStats({
          totalVerified: 0,
          totalRewards: 0,
          monthlyVerified: 0,
          monthlyRewards: 0,
          currentMonth: new Date().toISOString().slice(0, 7)
        });
        return;
      }

      // Obtener estadísticas de worldid_statistics
      const { data: statsData, error: statsError } = await supabase
        .from('worldid_statistics')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        logger.warn('Error fetching WorldID statistics:', { error: statsError.message });
      }

      // Obtener recompensas de worldid_rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('worldid_rewards')
        .select('amount')
        .eq('is_active', true);

      if (rewardsError) {
        logger.warn('Error fetching WorldID rewards:', { error: rewardsError.message });
      }

      const totalRewards = rewardsData?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0;
      const currentMonth = new Date().toISOString().slice(0, 7);

      setStats({
        totalVerified: statsData?.total_verified || 0,
        totalRewards,
        monthlyVerified: statsData?.monthly_verified || 0,
        monthlyRewards: statsData?.monthly_rewards || 0,
        currentMonth
      });
    } catch (err) {
      logger.error('Error initializing WorldID:', { error: String(err) });
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      setStats({
        totalVerified: 0,
        totalRewards: 0,
        monthlyVerified: 0,
        monthlyRewards: 0,
        currentMonth: new Date().toISOString().slice(0, 7)
      });
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
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }
      
      const { data, error } = await supabase
        .from('referral_rewards')
        .select(`
          amount,
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
      logger.error('Error getting verification history:', { error: String(err) });
      return [];
    }
  }, [user?.id]);

  // Check monthly rewards limit
  const checkMonthlyLimit = useCallback(async () => {
    if (!user?.id) return { current: 0, limit: 500, remaining: 500 };

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { current: 0, limit: 500, remaining: 500 };
      }
      
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth);

      if (error) {
        throw error;
      }

      const current = data?.reduce((sum: number, reward: any) => {
        const amount = typeof reward.amount === 'string' ? parseFloat(reward.amount) : reward.amount;
        return sum + (amount || 0);
      }, 0) || 0;
      const limit = 500;
      const remaining = Math.max(0, limit - current);

      return { current, limit, remaining };
    } catch (err) {
      logger.error('Error checking monthly limit:', { error: String(err) });
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
