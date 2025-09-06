// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HCaptchaRequest {
  token: string
  remoteip?: string
}

interface HCaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  credit?: boolean
  'error-codes'?: string[]
  score?: number
  score_reason?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get hCaptcha secret from environment
    const HCAPTCHA_SECRET = Deno.env.get('HCAPTCHA_SECRET')
    if (!HCAPTCHA_SECRET) {
      console.error('HCAPTCHA_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { token, remoteip }: HCaptchaRequest = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare form data for hCaptcha API
    const formData = new FormData()
    formData.append('secret', HCAPTCHA_SECRET)
    formData.append('response', token)
    
    if (remoteip) {
      formData.append('remoteip', remoteip)
    }

    // Verify with hCaptcha API
    const hcaptchaResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      body: formData,
    })

    if (!hcaptchaResponse.ok) {
      console.error('hCaptcha API error:', hcaptchaResponse.status)
      return new Response(
        JSON.stringify({ error: 'Verification service unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result: HCaptchaResponse = await hcaptchaResponse.json()

    // Log verification attempt (without sensitive data)
    console.log('hCaptcha verification:', {
      success: result.success,
      hostname: result.hostname,
      timestamp: new Date().toISOString(),
      errors: result['error-codes']
    })

    // Return verification result
    return new Response(
      JSON.stringify({
        success: result.success,
        timestamp: result.challenge_ts,
        hostname: result.hostname,
        score: result.score,
        errors: result['error-codes'] || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('hCaptcha verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
