// Supabase Edge Function para procesar referidos
// Este archivo está diseñado para ejecutarse en Deno runtime
// Los errores de TypeScript son normales en IDE local - funciona en Supabase

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Declaración global para Deno (solo para IDE local)
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReferralRequest {
  referralCode: string;
  newUserId: string;
}

interface TokenBalance {
  user_id: string;
  cmpx_balance: number;
  monthly_earned: number;
  last_reset_date: string;
  referral_code: string;
  referred_by?: string;
  total_referrals: number;
}

const TOKEN_CONFIG = {
  REFERRAL_REWARD: 50,
  WELCOME_BONUS: 50,
  MONTHLY_LIMIT: 500,
} as const;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { referralCode, newUserId }: ReferralRequest = await req.json()

    // Validar código de referido
    if (!/^CMPX[A-Z0-9]{6}$/.test(referralCode)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Código de referido inválido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Buscar usuario invitador por código
    const { data: inviter, error: inviterError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('referral_code', referralCode)
      .single()

    if (inviterError || !inviter) {
      return new Response(
        JSON.stringify({ success: false, message: 'Código de referido no encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Verificar que no se auto-refiera
    if (inviter.user_id === newUserId) {
      return new Response(
        JSON.stringify({ success: false, message: 'No puedes referirte a ti mismo' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Verificar si el usuario ya fue referido
    const { data: existingUser } = await supabase
      .from('user_token_balances')
      .select('referred_by')
      .eq('user_id', newUserId)
      .single()

    if (existingUser?.referred_by) {
      return new Response(
        JSON.stringify({ success: false, message: 'Este usuario ya fue referido anteriormente' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Verificar límite mensual del invitador
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastResetDate = new Date(inviter.last_reset_date)

    let monthlyEarned = inviter.monthly_earned
    
    // Reset mensual si es necesario
    if (currentMonth !== lastResetDate.getMonth() || currentYear !== lastResetDate.getFullYear()) {
      monthlyEarned = 0
    }

    if (monthlyEarned + TOKEN_CONFIG.REFERRAL_REWARD > TOKEN_CONFIG.MONTHLY_LIMIT) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Límite mensual alcanzado (${TOKEN_CONFIG.MONTHLY_LIMIT} CMPX)` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Generar código de referido para nuevo usuario
    const newUserReferralCode = `CMPX${newUserId.slice(-6).toUpperCase()}`

    // Transacción: actualizar invitador y crear nuevo usuario
    const { error: transactionError } = await supabase.rpc('process_referral_reward', {
      inviter_id: inviter.user_id,
      new_user_id: newUserId,
      new_user_referral_code: newUserReferralCode,
      referral_reward: TOKEN_CONFIG.REFERRAL_REWARD,
      welcome_bonus: TOKEN_CONFIG.WELCOME_BONUS,
      monthly_limit: TOKEN_CONFIG.MONTHLY_LIMIT,
      current_monthly_earned: monthlyEarned
    })

    if (transactionError) {
      console.error('Error en transacción:', transactionError)
      return new Response(
        JSON.stringify({ success: false, message: 'Error interno del servidor' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Registrar en historial de recompensas
    const rewardTimestamp = now.toISOString()
    const rewards = [
      {
        id: `ref_${Date.now()}_${inviter.user_id}`,
        inviter_id: inviter.user_id,
        invited_id: newUserId,
        amount: TOKEN_CONFIG.REFERRAL_REWARD,
        type: 'referral_bonus',
        timestamp: rewardTimestamp,
        status: 'completed'
      },
      {
        id: `wel_${Date.now()}_${newUserId}`,
        inviter_id: inviter.user_id,
        invited_id: newUserId,
        amount: TOKEN_CONFIG.WELCOME_BONUS,
        type: 'welcome_bonus',
        timestamp: rewardTimestamp,
        status: 'completed'
      }
    ]

    await supabase.from('referral_rewards').insert(rewards)

    return new Response(
      JSON.stringify({
        success: true,
        message: `¡Recompensas asignadas! ${TOKEN_CONFIG.REFERRAL_REWARD} CMPX para invitador, ${TOKEN_CONFIG.WELCOME_BONUS} CMPX de bienvenida`,
        rewards
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno del servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
