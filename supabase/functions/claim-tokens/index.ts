// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimRequest {
  rewardType: 'world_id' | 'referral' | 'beta_feedback' | 'daily_login' | 'profile_completion';
  referralCode?: string;
  worldIdProof?: any;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
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

    // Parse request body
    const { rewardType, referralCode, worldIdProof, metadata }: ClaimRequest = await req.json()

    console.log(`🎁 Procesando recompensa tipo: ${rewardType} para usuario: ${user.id}`)

    let result: any = { success: false, message: 'Tipo de recompensa no válido' }

    // Process different reward types
    switch (rewardType) {
      case 'world_id':
        // Validate World ID proof (simplified for beta)
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

        // Mark as verified and claim reward
        const { data: updateData, error: updateError } = await supabaseClient
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

        // Claim World ID reward
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

      case 'referral':
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

        // Process referral reward
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

      case 'beta_feedback':
        // Beta feedback reward (20 CMPX)
        const { data: userTokens } = await supabaseClient
          .from('user_tokens')
          .select('cmpx_balance, monthly_earned, monthly_limit')
          .eq('user_id', user.id)
          .single()

        if (!userTokens) {
          result = { success: false, message: 'Usuario no encontrado' }
          break
        }

        const feedbackAmount = 20
        if ((userTokens.monthly_earned + feedbackAmount) > userTokens.monthly_limit) {
          result = { 
            success: false, 
            message: `Límite mensual alcanzado (${userTokens.monthly_limit} CMPX)` 
          }
          break
        }

        // Add feedback reward
        const { error: feedbackError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: userTokens.cmpx_balance + feedbackAmount,
            monthly_earned: userTokens.monthly_earned + feedbackAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (feedbackError) {
          console.error('❌ Error agregando feedback reward:', feedbackError)
          result = { success: false, message: 'Error procesando recompensa' }
        } else {
          // Record transaction
          await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: feedbackAmount,
              balance_before: userTokens.cmpx_balance,
              balance_after: userTokens.cmpx_balance + feedbackAmount,
              description: 'Recompensa por feedback beta',
              metadata: metadata || {}
            })

          result = {
            success: true,
            message: `¡Recompensa de feedback reclamada! +${feedbackAmount} CMPX`,
            amount: feedbackAmount,
            newBalance: userTokens.cmpx_balance + feedbackAmount
          }
          console.log('✅ Feedback reward procesada:', result)
        }
        break

      case 'daily_login':
        // Daily login bonus (5 CMPX)
        const dailyAmount = 5
        
        // Check if already claimed today
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTransaction } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('transaction_type', 'beta_reward')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)
          .single()

        if (todayTransaction) {
          result = { success: false, message: 'Ya reclamaste tu recompensa diaria' }
          break
        }

        // Get user tokens for daily reward
        const { data: dailyUserTokens } = await supabaseClient
          .from('user_tokens')
          .select('cmpx_balance, monthly_earned, monthly_limit')
          .eq('user_id', user.id)
          .single()

        if (!dailyUserTokens) {
          result = { success: false, message: 'Usuario no encontrado' }
          break
        }

        if ((dailyUserTokens.monthly_earned + dailyAmount) > dailyUserTokens.monthly_limit) {
          result = { 
            success: false, 
            message: `Límite mensual alcanzado (${dailyUserTokens.monthly_limit} CMPX)` 
          }
          break
        }

        // Add daily reward
        const { error: dailyError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: dailyUserTokens.cmpx_balance + dailyAmount,
            monthly_earned: dailyUserTokens.monthly_earned + dailyAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (dailyError) {
          console.error('❌ Error agregando daily reward:', dailyError)
          result = { success: false, message: 'Error procesando recompensa diaria' }
        } else {
          // Record transaction
          await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: dailyAmount,
              balance_before: dailyUserTokens.cmpx_balance,
              balance_after: dailyUserTokens.cmpx_balance + dailyAmount,
              description: 'Recompensa por login diario',
              metadata: { type: 'daily_login', date: today }
            })

          result = {
            success: true,
            message: `¡Recompensa diaria reclamada! +${dailyAmount} CMPX`,
            amount: dailyAmount,
            newBalance: dailyUserTokens.cmpx_balance + dailyAmount
          }
          console.log('✅ Daily login reward procesada:', result)
        }
        break

      case 'profile_completion':
        // Profile completion bonus (25 CMPX)
        const profileAmount = 25
        
        // Check if already claimed
        const { data: profileTransaction } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('transaction_type', 'beta_reward')
          .eq('description', 'Recompensa por completar perfil')
          .single()

        if (profileTransaction) {
          result = { success: false, message: 'Ya reclamaste la recompensa por completar perfil' }
          break
        }

        // Get user tokens for profile reward
        const { data: profileUserTokens } = await supabaseClient
          .from('user_tokens')
          .select('cmpx_balance, monthly_earned, monthly_limit')
          .eq('user_id', user.id)
          .single()

        if (!profileUserTokens) {
          result = { success: false, message: 'Usuario no encontrado' }
          break
        }

        if ((profileUserTokens.monthly_earned + profileAmount) > profileUserTokens.monthly_limit) {
          result = { 
            success: false, 
            message: `Límite mensual alcanzado (${profileUserTokens.monthly_limit} CMPX)` 
          }
          break
        }

        // Add profile completion reward
        const { error: profileError } = await supabaseClient
          .from('user_tokens')
          .update({
            cmpx_balance: profileUserTokens.cmpx_balance + profileAmount,
            monthly_earned: profileUserTokens.monthly_earned + profileAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (profileError) {
          console.error('❌ Error agregando profile reward:', profileError)
          result = { success: false, message: 'Error procesando recompensa de perfil' }
        } else {
          // Record transaction
          await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'beta_reward',
              token_type: 'CMPX',
              amount: profileAmount,
              balance_before: profileUserTokens.cmpx_balance,
              balance_after: profileUserTokens.cmpx_balance + profileAmount,
              description: 'Recompensa por completar perfil',
              metadata: metadata || {}
            })

          result = {
            success: true,
            message: `¡Recompensa por completar perfil! +${profileAmount} CMPX`,
            amount: profileAmount,
            newBalance: profileUserTokens.cmpx_balance + profileAmount
          }
          console.log('✅ Profile completion reward procesada:', result)
        }
        break

      default:
        result = { success: false, message: `Tipo de recompensa no soportado: ${rewardType}` }
    }

    // Return result
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      }
    )

  } catch (error) {
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
