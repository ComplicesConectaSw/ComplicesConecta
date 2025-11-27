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
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token de hCaptcha requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const secret = Deno.env.get('HCAPTCHA_SECRET_KEY')
    if (!secret) {
      return new Response(
        JSON.stringify({ success: false, message: 'Configuración de servidor incompleta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar con hCaptcha API
    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)

    const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      body: formData,
    })

    const verifyData = await verifyResponse.json()

    return new Response(
      JSON.stringify({
        success: verifyData.success,
        message: verifyData.success ? 'Verificación exitosa' : 'Verificación falló',
        data: verifyData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error interno de verificación',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
