import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referee_id: string;
  reward_type: 'cmpx' | 'gtk';
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  confirmed_at?: string;
}

export interface UserReferralBalance {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  total_earned: number;
  monthly_earned: number;
  cmpx_balance: number;
  gtk_balance: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'transfer';
  token_type: 'cmpx' | 'gtk';
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ReferralStatistics {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_earned: number;
  monthly_earned: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralRewardData {
  referrer_id: string;
  referee_id: string;
  reward_type: 'cmpx' | 'gtk';
  amount: number;
}

class ReferralTokensService {
  constructor() {
    logger.info('ReferralTokensService initialized');
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        return user.id || 'demo-user-id';
      } catch {
        return 'demo-user-id';
      }
    }
    throw new Error('No authenticated user found');
  }

  /**
   * Generar código de referido único usando datos reales de Supabase
   */
  async generateReferralCode(userId: string): Promise<string> {
    try {
      logger.info('Generating referral code in Supabase', { userId });

      // Usar la función de Supabase para generar código único
      const { data, error } = await (supabase as any).rpc('generate_referral_code', {
        user_id: userId
      });

      if (error) {
        logger.error('Error generating referral code:', error);
        // Fallback: generar código simple
        return `REF${userId.slice(-8).toUpperCase()}`;
      }

      logger.info('✅ Referral code generated successfully', { code: data });
      return data || `REF${userId.slice(-8).toUpperCase()}`;
    } catch (error) {
      logger.error('Error in generateReferralCode:', { error: String(error) });
      return `REF${userId.slice(-8).toUpperCase()}`;
    }
  }

  /**
   * Obtener balance de referidos del usuario usando datos reales de Supabase
   */
  async getUserReferralBalance(userId: string): Promise<UserReferralBalance | null> {
    try {
      logger.info('Getting user referral balance from Supabase', { userId });

      const { data, error } = await (supabase as any)
        .from('user_referral_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          // Crear balance inicial si no existe
          const referralCode = await this.generateReferralCode(userId);
          const { data: newBalance, error: createError } = await (supabase as any)
            .from('user_referral_balances')
            .insert({
              user_id: userId,
              referral_code: referralCode,
              total_referrals: 0,
              total_earned: 0,
              monthly_earned: 0,
              cmpx_balance: 0,
              gtk_balance: 0
            })
            .select()
            .single();

          if (createError) {
            logger.error('Error creating referral balance:', createError);
            return null;
          }

          return newBalance as UserReferralBalance;
        }
        logger.error('Error getting referral balance:', error);
        return null;
      }

      logger.info('✅ Referral balance loaded successfully', { balance: data });
      return data as UserReferralBalance;
    } catch (error) {
      logger.error('Error in getUserReferralBalance:', { error: String(error) });
      return null;
    }
  }

  /**
   * Crear recompensa de referido usando datos reales de Supabase
   */
  async createReferralReward(rewardData: CreateReferralRewardData): Promise<ReferralReward | null> {
    try {
      logger.info('Creating referral reward in Supabase', { rewardData });

      const { data, error } = await (supabase as any)
        .from('referral_rewards')
        .insert({
          referrer_id: rewardData.referrer_id,
          referee_id: rewardData.referee_id,
          reward_type: rewardData.reward_type,
          amount: rewardData.amount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating referral reward:', error);
        return null;
      }

      logger.info('✅ Referral reward created successfully', { rewardId: data.id });
      return data as ReferralReward;
    } catch (error) {
      logger.error('Error in createReferralReward:', { error: String(error) });
      return null;
    }
  }

  /**
   * Confirmar recompensa de referido usando datos reales de Supabase
   */
  async confirmReferralReward(rewardId: string): Promise<boolean> {
    try {
      logger.info('Confirming referral reward in Supabase', { rewardId });

      const { error } = await (supabase as any)
        .from('referral_rewards')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', rewardId);

      if (error) {
        logger.error('Error confirming referral reward:', error);
        return false;
      }

      logger.info('✅ Referral reward confirmed successfully', { rewardId });
      return true;
    } catch (error) {
      logger.error('Error in confirmReferralReward:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener transacciones de referidos del usuario usando datos reales de Supabase
   */
  async getUserReferralTransactions(
    userId: string,
    page = 0,
    limit = 20
  ): Promise<ReferralTransaction[]> {
    try {
      logger.info('Getting user referral transactions from Supabase', { userId, page, limit });

      const { data, error } = await (supabase as any)
        .from('referral_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('Error getting referral transactions:', error);
        return [];
      }

      logger.info('✅ Referral transactions loaded successfully', { count: data?.length || 0 });
      return (data || []) as ReferralTransaction[];
    } catch (error) {
      logger.error('Error in getUserReferralTransactions:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener estadísticas de referidos usando datos reales de Supabase
   */
  async getReferralStatistics(userId: string): Promise<ReferralStatistics | null> {
    try {
      logger.info('Getting referral statistics from Supabase', { userId });

      const { data, error } = await (supabase as any)
        .from('referral_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          // Crear estadísticas iniciales si no existen
          const balance = await this.getUserReferralBalance(userId);
          if (!balance) return null;

          const { data: newStats, error: createError } = await (supabase as any)
            .from('referral_statistics')
            .insert({
              user_id: userId,
              referral_code: balance.referral_code,
              total_referrals: 0,
              active_referrals: 0,
              total_earned: 0,
              monthly_earned: 0,
              conversion_rate: 0
            })
            .select()
            .single();

          if (createError) {
            logger.error('Error creating referral statistics:', createError);
            return null;
          }

          return newStats as ReferralStatistics;
        }
        logger.error('Error getting referral statistics:', error);
        return null;
      }

      logger.info('✅ Referral statistics loaded successfully', { stats: data });
      return data as ReferralStatistics;
    } catch (error) {
      logger.error('Error in getReferralStatistics:', { error: String(error) });
      return null;
    }
  }

  /**
   * Obtener leaderboard de referidos usando datos reales de Supabase
   */
  async getReferralLeaderboard(limit = 10): Promise<Array<{
    user_id: string;
    referral_code: string;
    total_referrals: number;
    total_earned: number;
    monthly_earned: number;
    rank: number;
  }>> {
    try {
      logger.info('Getting referral leaderboard from Supabase', { limit });

      const { data, error } = await (supabase as any)
        .from('referral_leaderboard')
        .select('*')
        .limit(limit);

      if (error) {
        logger.error('Error getting referral leaderboard:', error);
        return [];
      }

      logger.info('✅ Referral leaderboard loaded successfully', { count: data?.length || 0 });
      return (data || []) as Array<{
        user_id: string;
        referral_code: string;
        total_referrals: number;
        total_earned: number;
        monthly_earned: number;
        rank: number;
      }>;
    } catch (error) {
      logger.error('Error in getReferralLeaderboard:', { error: String(error) });
      return [];
    }
  }

  /**
   * Procesar referido usando datos reales de Supabase
   */
  async processReferral(referralCode: string, newUserId: string): Promise<boolean> {
    try {
      logger.info('Processing referral in Supabase', { referralCode, newUserId });

      // Buscar el usuario que tiene el código de referido
      const { data: referrerBalance, error: balanceError } = await (supabase as any)
        .from('user_referral_balances')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single();

      if (balanceError || !referrerBalance) {
        logger.error('Referral code not found:', { referralCode });
        return false;
      }

      // Crear recompensa para el referidor
      const rewardData: CreateReferralRewardData = {
        referrer_id: referrerBalance.user_id,
        referee_id: newUserId,
        reward_type: 'cmpx',
        amount: 100 // Recompensa base
      };

      const reward = await this.createReferralReward(rewardData);
      if (!reward) {
        logger.error('Failed to create referral reward');
        return false;
      }

      // Actualizar balance del referidor usando SQL directo
      const { error: updateError } = await (supabase as any)
        .from('user_referral_balances')
        .update({
          total_referrals: (supabase as any).sql`total_referrals + 1`,
          total_earned: (supabase as any).sql`total_earned + ${rewardData.amount}`,
          monthly_earned: (supabase as any).sql`monthly_earned + ${rewardData.amount}`,
          cmpx_balance: (supabase as any).sql`cmpx_balance + ${rewardData.amount}`
        })
        .eq('user_id', referrerBalance.user_id);

      if (updateError) {
        logger.error('Error updating referrer balance:', updateError);
        return false;
      }

      // Confirmar la recompensa
      await this.confirmReferralReward(reward.id);

      logger.info('✅ Referral processed successfully', { referralCode, newUserId });
      return true;
    } catch (error) {
      logger.error('Error in processReferral:', { error: String(error) });
      return false;
    }
  }
}

export const referralTokensService = new ReferralTokensService();
export default referralTokensService;
