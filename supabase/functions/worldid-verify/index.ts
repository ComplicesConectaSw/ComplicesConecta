// @ts-nocheck
// World ID Verification Edge Function
// Integrates with existing CMPX token system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Global Deno declaration for IDE compatibility
declare global {
  const Deno: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorldIDProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
  action: string;
  signal: string;
}

interface VerificationRequest {
  proof: WorldIDProof;
  user_id: string;
  invited_by?: string;
}

interface WorldcoinVerifyResponse {
  success: boolean;
  action: string;
  nullifier_hash: string;
  created_at: string;
  verification_level: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { proof, user_id, invited_by }: VerificationRequest = await req.json()

    // Validate required fields
    if (!proof || !user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'MISSING_FIELDS',
          message: 'proof and user_id are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if nullifier hash already exists in our system
    const { data: existingVerification } = await supabaseClient
      .from('user_token_balances')
      .select('worldid_verified, user_id')
      .eq('worldid_nullifier_hash', proof.nullifier_hash)
      .single()

    if (existingVerification) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ALREADY_VERIFIED',
          message: 'This World ID has already been used for verification' 
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify proof with Worldcoin
    const worldcoinResponse = await fetch(
      Deno.env.get('WORLD_VERIFY_ENDPOINT') ?? 'https://developer.worldcoin.org/api/v1/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('WORLD_APP_SECRET')}`
        },
        body: JSON.stringify({
          nullifier_hash: proof.nullifier_hash,
          merkle_root: proof.merkle_root,
          proof: proof.proof,
          verification_level: proof.verification_level,
          action: proof.action,
          signal: proof.signal || user_id
        })
      }
    )

    if (!worldcoinResponse.ok) {
      const errorData = await worldcoinResponse.text()
      console.error('Worldcoin verification failed:', errorData)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WORLDCOIN_VERIFICATION_FAILED',
          message: 'World ID verification failed with Worldcoin service',
          details: errorData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const worldcoinData: WorldcoinVerifyResponse = await worldcoinResponse.json()

    if (!worldcoinData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'INVALID_PROOF',
          message: 'World ID proof is invalid' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process World ID verification reward using our unified function
    const { data: rewardResult, error: rewardError } = await supabaseClient
      .rpc('process_worldid_verification_reward', {
        p_user_id: user_id,
        p_nullifier_hash: proof.nullifier_hash,
        p_proof: {
          worldcoin_response: worldcoinData,
          original_proof: proof,
          verified_at: new Date().toISOString()
        },
        p_invited_by: invited_by || null
      })

    if (rewardError) {
      console.error('Reward processing error:', rewardError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'REWARD_PROCESSING_FAILED',
          message: 'Failed to process World ID verification reward',
          details: rewardError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!rewardResult.success) {
      return new Response(
        JSON.stringify(rewardResult),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful verification for monitoring
    console.log('World ID verification successful:', {
      user_id,
      nullifier_hash: proof.nullifier_hash,
      verification_level: worldcoinData.verification_level,
      invited_by,
      reward_amount: rewardResult.worldid_reward + rewardResult.referral_reward
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'World ID verification completed successfully',
        data: {
          user_id,
          worldid_verified: true,
          verification_level: worldcoinData.verification_level,
          nullifier_hash: proof.nullifier_hash,
          rewards: {
            worldid_reward: rewardResult.worldid_reward,
            referral_reward: rewardResult.referral_reward,
            total: rewardResult.worldid_reward + rewardResult.referral_reward
          },
          verified_at: rewardResult.verified_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('World ID verification error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'Internal server error during World ID verification',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
