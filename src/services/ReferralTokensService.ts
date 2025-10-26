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
        return String(data) || `REF${userId.slice(-8).toUpperCase()}`;
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

      const { data, error } = await supabase
        .from('user_referral_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          // Crear balance inicial si no existe
          const referralCode = await this.generateReferralCode(userId);
          const { data: newBalance, error: createError } = await supabase
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

          // Mapear a UserReferralBalance incluyendo campos faltantes
          const balance: UserReferralBalance = {
            id: newBalance.id,
            user_id: newBalance.user_id,
            referral_code: newBalance.referral_code,
            total_referrals: newBalance.total_referrals,
            total_earned: newBalance.total_earned,
            monthly_earned: newBalance.monthly_earned,
            cmpx_balance: newBalance.cmpx_balance,
            gtk_balance: 0, // Valor por defecto
            created_at: newBalance.created_at || new Date().toISOString(),
            updated_at: newBalance.updated_at || new Date().toISOString()
          };

          return balance;
        }
        logger.error('Error getting referral balance:', error);
        return null;
      }

      logger.info('✅ Referral balance loaded successfully', { balance: data });
      // Mapear a UserReferralBalance incluyendo gtk_balance
      return {
        ...data,
        gtk_balance: 0, // Valor por defecto
        id: data.id,
        user_id: data.user_id,
        referral_code: data.referral_code,
        total_referrals: data.total_referrals,
        total_earned: data.total_earned,
        monthly_earned: data.monthly_earned,
        cmpx_balance: data.cmpx_balance,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };
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

      const { data, error } = await supabase
        .from('referral_rewards')
        .insert({
          user_id: rewardData.referrer_id, // Usuario que refiere
          invited_id: rewardData.referee_id, // Usuario referido
          amount: rewardData.amount,
          description: `Referral reward for ${rewardData.amount} ${rewardData.reward_type}`,
          claimed: false
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating referral reward:', error);
        return null;
      }

      logger.info('✅ Referral reward created successfully', { rewardId: data.id });
      
      // Mapear a ReferralReward interface
      const reward: ReferralReward = {
        id: data.id,
        referrer_id: rewardData.referrer_id,
        referee_id: rewardData.referee_id,
        reward_type: rewardData.reward_type,
        amount: data.amount,
        status: data.claimed ? 'confirmed' : 'pending',
        created_at: data.created_at || new Date().toISOString(),
        confirmed_at: data.claimed_at || undefined
      };
      
      return reward;
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

      const { error } = await supabase
        .from('referral_rewards')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString()
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

      const { data, error } = await supabase
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
      
      // Mapear a ReferralTransaction incluyendo token_type
      return (data || []).map((tx: any) => ({
        id: tx.id,
        user_id: tx.user_id,
        transaction_type: tx.transaction_type,
        token_type: 'cmpx', // Por defecto CMPX
        amount: tx.amount,
        description: tx.description,
        metadata: tx.metadata,
        created_at: tx.created_at
      }));
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

      const { data, error } = await supabase
        .from('referral_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          // Crear estadísticas iniciales si no existen
          const balance = await this.getUserReferralBalance(userId);
          if (!balance) return null;

          const { data: newStats, error: createError } = await supabase
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
      
      // Mapear a ReferralStatistics incluyendo campos faltantes
      return {
        id: data.id,
        user_id: data.user_id,
        referral_code: data.referral_code,
        total_referrals: 0, // Por defecto
        active_referrals: 0, // Por defecto
        total_earned: data.monthly_earned,
        monthly_earned: data.monthly_earned,
        conversion_rate: data.conversion_rate || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };
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

      // Usar user_referral_balances en lugar de referral_leaderboard que no existe
      const { data, error } = await supabase
        .from('user_referral_balances')
        .select('*')
        .order('total_earned', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error getting referral leaderboard:', error);
        return [];
      }

      logger.info('✅ Referral leaderboard loaded successfully', { count: data?.length || 0 });
      
      // Mapear a formato de leaderboard
      return (data || []).map((balance: any, index: number) => ({
        user_id: balance.user_id,
        referral_code: balance.referral_code,
        total_referrals: balance.total_referrals,
        total_earned: balance.total_earned,
        monthly_earned: balance.monthly_earned,
        rank: index + 1
      }));
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
      const { data: referrerBalance, error: balanceError } = await supabase
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

      // Obtener balance actual
      const { data: currentBalance, error: balanceError } = await supabase
        .from('user_referral_balances')
        .select('total_referrals, total_earned, monthly_earned, cmpx_balance')
        .eq('user_id', referrerBalance.user_id)
        .single();

      if (balanceError) {
        logger.error('Error getting current balance:', balanceError);
        return false;
      }

      // Actualizar balance del referidor
      const { error: updateError } = await supabase
        .from('user_referral_balances')
        .update({
          total_referrals: (currentBalance.total_referrals || 0) + 1,
          total_earned: (currentBalance.total_earned || 0) + rewardData.amount,
          monthly_earned: (currentBalance.monthly_earned || 0) + rewardData.amount,
          cmpx_balance: (currentBalance.cmpx_balance || 0) + rewardData.amount
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
