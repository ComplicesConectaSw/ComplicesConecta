import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimRequest {
  rewardType: 'world_id' | 'referral' | 'beta_feedback' | 'daily_login' | 'profile_completion';
  referralCode?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  worldIdProof?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

const REWARD_LIMITS = {
  world_id: { amount: 50, maxClaims: 1, cooldown: 0 },
  referral: { amount: 30, maxClaims: 10, cooldown: 0 },
  beta_feedback: { amount: 20, maxClaims: 1, cooldown: 0 },
  daily_login: { amount: 5, maxClaims: 1, cooldown: 24 * 60 * 60 * 1000 },
  profile_completion: { amount: 25, maxClaims: 1, cooldown: 0 }
} as const

function validateClaimRequest(request: ClaimRequest): { valid: boolean; error?: string } {
  if (!request.rewardType) {
    return { valid: false, error: 'Tipo de recompensa requerido' }
  }

  if (!Object.keys(REWARD_LIMITS).includes(request.rewardType)) {
    return { valid: false, error: 'Tipo de recompensa no válido' }
  }

  switch (request.rewardType) {
    case 'world_id':
      if (!request.worldIdProof || typeof request.worldIdProof !== 'object') {
        return { valid: false, error: 'Prueba de World ID inválida o faltante' }
      }
      break
    
    case 'referral':
      if (!request.referralCode || typeof request.referralCode !== 'string' || request.referralCode.length < 6) {
        return { valid: false, error: 'Código de referido inválido (mínimo 6 caracteres)' }
      }
      break
    
    case 'beta_feedback':
      if (request.metadata && typeof request.metadata !== 'object') {
        return { valid: false, error: 'Metadata de feedback inválida' }
      }
      break
  }

  return { valid: true }
}

async function checkClaimLimits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any, 
  userId: string, 
  rewardType: string
): Promise<{ canClaim: boolean; error?: string }> {
  const limits = REWARD_LIMITS[rewardType as keyof typeof REWARD_LIMITS]
  
  const { data: previousClaims, error } = await supabaseClient
    .from('transactions')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('transaction_type', 'beta_reward')
    .like('description', `%${rewardType}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error verificando límites:', error)
    return { canClaim: false, error: 'Error verificando historial de reclamaciones' }
  }

  if (previousClaims && previousClaims.length >= limits.maxClaims) {
    return { canClaim: false, error: `Máximo de reclamaciones alcanzado (${limits.maxClaims})` }
  }

  if (limits.cooldown > 0 && previousClaims && previousClaims.length > 0) {
    const lastClaim = new Date(previousClaims[0].created_at)
    const now = new Date()
    const timeDiff = now.getTime() - lastClaim.getTime()
    
    if (timeDiff < limits.cooldown) {
      const remainingHours = Math.ceil((limits.cooldown - timeDiff) / (60 * 60 * 1000))
      return { canClaim: false, error: `Debes esperar ${remainingHours} horas para reclamar nuevamente` }
    }
  }

  return { canClaim: true }
}

async function checkMonthlyLimits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any, 
  userId: string, 
  amount: number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ canClaim: boolean; error?: string; userTokens?: any }> {
  const { data: userTokens } = await supabaseClient
    .from('user_token_balances')
    .select('cmpx_balance, gtk_balance')
    .eq('user_id', userId)
    .single()

  if (!userTokens) {
    return { canClaim: false, error: 'Usuario no encontrado en sistema de tokens' }
  }

  if ((userTokens.monthly_earned + amount) > userTokens.monthly_limit) {
    return { 
      canClaim: false, 
      error: `Límite mensual alcanzado (${userTokens.monthly_earned}/${userTokens.monthly_limit} CMPX)` 
    }
  }

  return { canClaim: true, userTokens }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('❌ Usuario no autenticado:', userError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Usuario no autenticado' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const requestBody: ClaimRequest = await req.json()
    const { rewardType, referralCode, worldIdProof, metadata } = requestBody

    console.log(`🎁 Procesando recompensa tipo: ${rewardType} para usuario: ${user.id}`)

    const validation = validateClaimRequest(requestBody)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: validation.error 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const claimLimitsCheck = await checkClaimLimits(supabaseClient, user.id, rewardType)
    if (!claimLimitsCheck.canClaim) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: claimLimitsCheck.error 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429, 
        }
      )
    }

    const rewardAmount = REWARD_LIMITS[rewardType as keyof typeof REWARD_LIMITS].amount

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userTokens: any = null
    if (!['referral', 'world_id'].includes(rewardType)) {
      const monthlyCheck = await checkMonthlyLimits(supabaseClient, user.id, rewardAmount)
      if (!monthlyCheck.canClaim) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: monthlyCheck.error 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          }
        )
      }
      userTokens = monthlyCheck.userTokens
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = { success: false, message: 'Tipo de recompensa no válido' }

    switch (rewardType) {
      case 'world_id': {
        if (!worldIdProof) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Prueba de World ID requerida' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { data: _updateData, error: updateError } = await supabaseClient
          .from('user_tokens')
          .update({ world_id_verified: true })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('❌ Error actualizando World ID:', updateError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Error verificando World ID' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        const { data: worldIdResult, error: worldIdError } = await supabaseClient
          .rpc('claim_world_id_reward', { user_id_param: user.id })

        if (worldIdError) {
          console.error('❌ Error reclamando World ID:', worldIdError)
          result = { success: false, message: 'Error reclamando recompensa World ID' }
        } else {
          result = worldIdResult
          console.log('✅ World ID recompensa reclamada:', result)
        }
        break
      }

      case 'referral': {
        if (!referralCode) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Código de referido requerido' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { data: referralResult, error: referralError } = await supabaseClient
          .rpc('process_referral_reward', {
            referral_code_param: referralCode,
            new_user_id: user.id
          })

        if (referralError) {
          console.error('❌ Error procesando referido:', referralError)
          result = { success: false, message: 'Error procesando referido' }
        } else {
          result = referralResult
          console.log('✅ Referido procesado:', result)
        }
        break
      }

      case 'beta_feedback': {
        if (!userTokens) {
          result = { success: false, message: 'Error interno: datos de usuario no disponibles' }
          break
        }

        const { error: feedbackError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: userTokens.cmpx_balance + rewardAmount,
            monthly_earned: userTokens.monthly_earned + rewardAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (feedbackError) {
          console.error('❌ Error agregando feedback reward:', feedbackError)
          result = { success: false, message: 'Error procesando recompensa de feedback' }
        } else {
          const { error: transactionError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: rewardAmount,
              balance_before: userTokens.cmpx_balance,
              balance_after: userTokens.cmpx_balance + rewardAmount,
              description: 'Recompensa por feedback beta',
              metadata: { 
                ...metadata, 
                timestamp: new Date().toISOString(),
                validation_passed: true
              }
            })

          if (transactionError) {
            console.error('❌ Error registrando transacción:', transactionError)
            await supabaseClient
              .from('user_tokens')
              .update({
                cmpx_balance: userTokens.cmpx_balance,
                monthly_earned: userTokens.monthly_earned,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
            
            result = { success: false, message: 'Error registrando transacción' }
          } else {
            result = {
              success: true,
              message: `¡Recompensa de feedback reclamada! +${rewardAmount} CMPX`,
              amount: rewardAmount,
              newBalance: userTokens.cmpx_balance + rewardAmount,
              remainingMonthly: userTokens.monthly_limit - (userTokens.monthly_earned + rewardAmount)
            }
            console.log('✅ Feedback reward procesada:', result)
          }
        }
        break
      }

      case 'daily_login': {
        if (!userTokens) {
          result = { success: false, message: 'Error interno: datos de usuario no disponibles' }
          break
        }

        const { error: dailyError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: userTokens.cmpx_balance + rewardAmount,
            monthly_earned: userTokens.monthly_earned + rewardAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (dailyError) {
          console.error('❌ Error agregando daily reward:', dailyError)
          result = { success: false, message: 'Error procesando recompensa diaria' }
        } else {
          const today = new Date().toISOString().split('T')[0]
          const { error: transactionError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: rewardAmount,
              balance_before: userTokens.cmpx_balance,
              balance_after: userTokens.cmpx_balance + rewardAmount,
              description: 'Recompensa por login diario',
              metadata: { 
                type: 'daily_login', 
                date: today,
                timestamp: new Date().toISOString(),
                validation_passed: true
              }
            })

          if (transactionError) {
            console.error('❌ Error registrando transacción diaria:', transactionError)
            await supabaseClient
              .from('user_tokens')
              .update({
                cmpx_balance: userTokens.cmpx_balance,
                monthly_earned: userTokens.monthly_earned,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
            
            result = { success: false, message: 'Error registrando transacción diaria' }
          } else {
            result = {
              success: true,
              message: `¡Recompensa diaria reclamada! +${rewardAmount} CMPX`,
              amount: rewardAmount,
              newBalance: userTokens.cmpx_balance + rewardAmount,
              remainingMonthly: userTokens.monthly_limit - (userTokens.monthly_earned + rewardAmount)
            }
            console.log('✅ Daily login reward procesada:', result)
          }
        }
        break
      }

      case 'profile_completion': {
        if (!userTokens) {
          result = { success: false, message: 'Error interno: datos de usuario no disponibles' }
          break
        }

        const { error: profileError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: userTokens.cmpx_balance + rewardAmount,
            monthly_earned: userTokens.monthly_earned + rewardAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (profileError) {
          console.error('❌ Error agregando profile reward:', profileError)
          result = { success: false, message: 'Error procesando recompensa de perfil' }
        } else {
          const { error: transactionError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: rewardAmount,
              balance_before: userTokens.cmpx_balance,
              balance_after: userTokens.cmpx_balance + rewardAmount,
              description: 'Recompensa por completar perfil',
              metadata: { 
                ...metadata, 
                timestamp: new Date().toISOString(),
                validation_passed: true
              }
            })

          if (transactionError) {
            console.error('❌ Error registrando transacción de perfil:', transactionError)
            await supabaseClient
              .from('user_tokens')
              .update({
                cmpx_balance: userTokens.cmpx_balance,
                monthly_earned: userTokens.monthly_earned,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
            
            result = { success: false, message: 'Error registrando transacción de perfil' }
          } else {
            result = {
              success: true,
              message: `¡Recompensa por completar perfil! +${rewardAmount} CMPX`,
              amount: rewardAmount,
              newBalance: userTokens.cmpx_balance + rewardAmount,
              remainingMonthly: userTokens.monthly_limit - (userTokens.monthly_earned + rewardAmount)
            }
            console.log('✅ Profile completion reward procesada:', result)
          }
        }
        break
      }

      default:
        result = { success: false, message: `Tipo de recompensa no soportado: ${rewardType}` }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      }
    )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error en claim-tokens:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})