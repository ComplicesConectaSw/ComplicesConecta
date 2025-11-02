/**
 * TokenService - Servicio unificado de gestión de tokens CMPX/GTK
 * 
 * Centraliza toda la lógica de tokens:
 * - Balances (CMPX y GTK)
 * - Transacciones
 * - Staking
 * - Recompensas
 * - Referidos
 * 
 * Integra:
 * - TokenAnalyticsService (analytics)
 * - ReferralTokensService (referidos)
 * - useTokens hook (estado de React)
 * 
 * @version 3.5.0
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { TokenAnalyticsService } from '@/services/TokenAnalyticsService';
import { referralTokensService } from '@/services/ReferralTokensService';

export interface TokenBalance {
  cmpx: number;
  gtk: number;
  totalValue?: number; // Valor total en USD o moneda fiat
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'transfer' | 'reward' | 'stake' | 'unstake';
  token_type: 'cmpx' | 'gtk';
  amount: number;
  balance_after: number;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StakingRecord {
  id: string;
  user_id: string;
  token_type: 'cmpx' | 'gtk';
  amount: number;
  apy: number; // Annual Percentage Yield
  duration_days: number;
  start_date: string;
  end_date?: string;
  rewards_earned: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  reward_type: 'world_id' | 'referral' | 'daily_login' | 'activity' | 'premium';
  token_type: 'cmpx' | 'gtk';
  amount: number;
  claimed: boolean;
  claimed_at?: string;
  expires_at?: string;
  created_at: string;
}

class TokenService {
  private static instance: TokenService;
  private analyticsService: TokenAnalyticsService;
  private referralService: typeof referralTokensService;

  private constructor() {
    this.analyticsService = TokenAnalyticsService.getInstance();
    this.referralService = referralTokensService;
  }

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Obtiene balance de tokens del usuario
   */
  async getBalance(userId: string): Promise<TokenBalance | null> {
    try {
      logger.info('💰 Obteniendo balance de tokens', { userId: userId.substring(0, 8) + '***' });

      const { data, error } = await supabase
        .from('user_token_balances')
        .select('cmpx_balance, gtk_balance')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        logger.warn('Balance no encontrado, creando balance inicial', { userId });
        // Crear balance inicial si no existe
        return await this.createInitialBalance(userId);
      }

      return {
        cmpx: data.cmpx_balance || 0,
        gtk: data.gtk_balance || 0
      };
    } catch (error) {
      logger.error('Error obteniendo balance:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Crea balance inicial para usuario nuevo
   */
  private async createInitialBalance(userId: string): Promise<TokenBalance> {
    try {
      const initialBalance: TokenBalance = {
        cmpx: 100, // Tokens de bienvenida
        gtk: 0
      };

      const { error } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: userId,
          cmpx_balance: initialBalance.cmpx,
          gtk_balance: initialBalance.gtk
        });

      if (error) {
        logger.error('Error creando balance inicial:', { error: error.message });
      } else {
        logger.info('✅ Balance inicial creado', { userId: userId.substring(0, 8) + '***' });
      }

      return initialBalance;
    } catch (error) {
      logger.error('Error crítico creando balance inicial:', { error: error instanceof Error ? error.message : String(error) });
      return { cmpx: 0, gtk: 0 };
    }
  }

  /**
   * Agrega tokens al balance del usuario
   */
  async addTokens(
    userId: string,
    tokenType: 'cmpx' | 'gtk',
    amount: number,
    transactionType: 'earn' | 'reward',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      logger.info('➕ Agregando tokens', {
        userId: userId.substring(0, 8) + '***',
        tokenType,
        amount,
        transactionType
      });

      // Obtener balance actual
      const balance = await this.getBalance(userId);
      if (!balance) {
        throw new Error('Balance no encontrado');
      }

      const newBalance = tokenType === 'cmpx'
        ? balance.cmpx + amount
        : balance.gtk + amount;

      // Actualizar balance
      const updateField = tokenType === 'cmpx' ? 'cmpx_balance' : 'gtk_balance';
      const { error: updateError } = await supabase
        .from('user_token_balances')
        .update({ [updateField]: newBalance })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Registrar transacción
      await this.recordTransaction({
        user_id: userId,
        transaction_type: transactionType,
        token_type: tokenType,
        amount,
        balance_after: newBalance,
        description,
        metadata
      });

      logger.info('✅ Tokens agregados exitosamente', {
        userId: userId.substring(0, 8) + '***',
        amount,
        newBalance
      });

      return true;
    } catch (error) {
      logger.error('Error agregando tokens:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Resta tokens del balance (gasto)
   */
  async spendTokens(
    userId: string,
    tokenType: 'cmpx' | 'gtk',
    amount: number,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      logger.info('➖ Gastando tokens', {
        userId: userId.substring(0, 8) + '***',
        tokenType,
        amount
      });

      const balance = await this.getBalance(userId);
      if (!balance) {
        throw new Error('Balance no encontrado');
      }

      const currentBalance = tokenType === 'cmpx' ? balance.cmpx : balance.gtk;
      
      if (currentBalance < amount) {
        logger.warn('Balance insuficiente', {
          userId: userId.substring(0, 8) + '***',
          required: amount,
          available: currentBalance
        });
        return false;
      }

      const newBalance = currentBalance - amount;

      // Actualizar balance
      const updateField = tokenType === 'cmpx' ? 'cmpx_balance' : 'gtk_balance';
      const { error: updateError } = await supabase
        .from('user_token_balances')
        .update({ [updateField]: newBalance })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Registrar transacción
      await this.recordTransaction({
        user_id: userId,
        transaction_type: 'spend',
        token_type: tokenType,
        amount: -amount,
        balance_after: newBalance,
        description,
        metadata
      });

      logger.info('✅ Tokens gastados exitosamente', {
        userId: userId.substring(0, 8) + '***',
        amount,
        newBalance
      });

      return true;
    } catch (error) {
      logger.error('Error gastando tokens:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Registra una transacción
   */
  private async recordTransaction(data: {
    user_id: string;
    transaction_type: TokenTransaction['transaction_type'];
    token_type: 'cmpx' | 'gtk';
    amount: number;
    balance_after: number;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await (supabase as any)
        .from('token_transactions')
        .insert({
          ...data,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      logger.error('Error registrando transacción:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Obtiene historial de transacciones
   */
  async getTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      tokenType?: 'cmpx' | 'gtk';
      transactionType?: TokenTransaction['transaction_type'];
    }
  ): Promise<TokenTransaction[]> {
    try {
      let query = (supabase as any)
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.tokenType) {
        query = query.eq('token_type', options.tokenType);
      }

      if (options?.transactionType) {
        query = query.eq('transaction_type', options.transactionType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as TokenTransaction[];
    } catch (error) {
      logger.error('Error obteniendo transacciones:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Inicia staking de tokens
   */
  async startStaking(
    userId: string,
    tokenType: 'cmpx' | 'gtk',
    amount: number,
    durationDays: number
  ): Promise<StakingRecord | null> {
    try {
      logger.info('🔒 Iniciando staking', {
        userId: userId.substring(0, 8) + '***',
        tokenType,
        amount,
        durationDays
      });

      // Verificar balance
      const balance = await this.getBalance(userId);
      if (!balance) {
        throw new Error('Balance no encontrado');
      }

      const currentBalance = tokenType === 'cmpx' ? balance.cmpx : balance.gtk;
      if (currentBalance < amount) {
        throw new Error('Balance insuficiente para staking');
      }

      // Calcular APY según tipo de token
      const apy = tokenType === 'cmpx' ? 8.0 : 12.5;

      // Restar tokens del balance (bloquear)
      await this.spendTokens(userId, tokenType, amount, 'Staking - Tokens bloqueados', {
        staking_duration: durationDays
      });

      // Crear registro de staking
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      const { data, error } = await (supabase as any)
        .from('user_staking')
        .insert({
          user_id: userId,
          token_type: tokenType,
          amount,
          apy,
          duration_days: durationDays,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          rewards_earned: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Staking iniciado exitosamente', {
        userId: userId.substring(0, 8) + '***',
        stakingId: data.id
      });

      return data as StakingRecord;
    } catch (error) {
      logger.error('Error iniciando staking:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Completa staking y libera tokens + recompensas
   */
  async completeStaking(stakingId: string, userId: string): Promise<boolean> {
    try {
      logger.info('✅ Completando staking', { stakingId, userId: userId.substring(0, 8) + '***' });

      // Obtener registro de staking
      const { data: staking, error: fetchError } = await (supabase as any)
        .from('user_staking')
        .select('*')
        .eq('id', stakingId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !staking) {
        throw new Error('Staking no encontrado');
      }

      // Calcular recompensas
      const daysStaked = Math.floor(
        (new Date(staking.end_date).getTime() - new Date(staking.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailyRate = staking.apy / 365 / 100;
      const rewardsEarned = staking.amount * dailyRate * daysStaked;

      // Actualizar staking
      await (supabase as any)
        .from('user_staking')
        .update({
          status: 'completed',
          rewards_earned: rewardsEarned,
          completed_at: new Date().toISOString()
        })
        .eq('id', stakingId);

      // Agregar tokens de vuelta + recompensas
      await this.addTokens(userId, staking.token_type, staking.amount, 'reward', 'Staking completado - Tokens liberados');
      if (rewardsEarned > 0) {
        await this.addTokens(userId, staking.token_type, rewardsEarned, 'reward', 'Recompensas de staking');
      }

      logger.info('✅ Staking completado exitosamente', {
        stakingId,
        rewardsEarned
      });

      return true;
    } catch (error) {
      logger.error('Error completando staking:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Obtiene analytics de tokens
   */
  async getAnalytics(userId: string, _period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily') {
    return this.analyticsService.generateCurrentMetrics();
  }

  /**
   * Obtiene servicio de referidos
   */
  getReferralService() {
    return this.referralService;
  }
}

// Exportar instancia singleton
export const tokenService = TokenService.getInstance();

// Exportar también como clase para testing
export { TokenService };

