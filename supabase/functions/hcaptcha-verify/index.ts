import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, action = 'login', userId } = await req.json()
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar hCaptcha con el servicio oficial
    const hcaptchaSecret = Deno.env.get('HCAPTCHA_SECRET')
    if (!hcaptchaSecret) {
      console.error('❌ HCAPTCHA_SECRET no configurado en variables de entorno')
      throw new Error('HCAPTCHA_SECRET no configurado')
    }

    const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: hcaptchaSecret,
        response: token,
      }),
    })

    const verifyData = await verifyResponse.json()
    
    if (!verifyData.success) {
      console.error('❌ hCaptcha verification failed:', verifyData['error-codes'])
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Verificación hCaptcha fallida',
          details: verifyData['error-codes'] || []
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log de verificación exitosa para auditoría
    console.log(`✅ hCaptcha verificado exitosamente para acción: ${action}`, {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      action
    })

    // Return verification result
    return new Response(
      JSON.stringify({
        success: true,
        action,
        timestamp: new Date().toISOString(),
        message: 'Verificación hCaptcha exitosa'
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