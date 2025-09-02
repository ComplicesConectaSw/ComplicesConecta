// Supabase Edge Function for sending emails
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  template: 'welcome' | 'confirmation' | 'reset-password' | 'match' | 'event'
  data?: Record<string, unknown>
}

// Edge Function handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, template, data = {} }: EmailRequest = await req.json()

    // Here you would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll return a success response
    
    const emailData = {
      to,
      template,
      subject: getSubjectByTemplate(template),
      html: await generateEmailHTML(template, data),
      ...data
    }

    console.log('Email would be sent:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        template,
        to 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}

function getSubjectByTemplate(template: string): string {
  const subjects = {
    welcome: '¡Bienvenido a ComplicesConecta! 🔥',
    confirmation: 'Confirma tu email - ComplicesConecta ✨',
    'reset-password': 'Restablecer tu contraseña - ComplicesConecta 🔐',
    match: '¡Tienes un nuevo match! 💕 - ComplicesConecta',
    event: '🌟 Invitación Exclusiva VIP - ComplicesConecta'
  }
  return subjects[template] || 'ComplicesConecta'
}

async function generateEmailHTML(template: string, data: Record<string, unknown>): Promise<string> {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
      .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #ff6b6b, #ee5a24, #fd79a8); padding: 40px 30px; text-align: center; }
      .logo { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; }
      .logo-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
      .logo-text { font-size: 28px; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
      .content { background: white; padding: 40px 30px; }
      .title { font-size: 24px; font-weight: 700; color: #2d3436; margin-bottom: 20px; text-align: center; }
      .subtitle { font-size: 16px; color: #636e72; margin-bottom: 30px; text-align: center; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; text-align: center; margin: 20px auto; display: block; width: fit-content; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); }
      .footer { background: #2d3436; color: #b2bec3; padding: 30px; text-align: center; }
    </style>
  `

  const templates = {
    welcome: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>Bienvenido</title>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">❤️</div>
              <div class="logo-text">ComplicesConecta</div>
            </div>
            <h1 style="color: white; font-size: 32px; margin: 0;">¡Bienvenido! 🔥</h1>
          </div>
          <div class="content">
            <h2 class="title">Tu aventura comienza ahora</h2>
            <p class="subtitle">Únete a miles de personas explorando conexiones auténticas.</p>
            <a href="${data.confirmationUrl || '#'}" class="cta-button">Confirmar Cuenta 🚀</a>
          </div>
          <div class="footer">
            <p>© 2024 ComplicesConecta. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    
    confirmation: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>Confirma tu Email</title>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">✨</div>
              <div class="logo-text">ComplicesConecta</div>
            </div>
            <h1 style="color: white; font-size: 28px; margin: 0;">Confirma tu Email 📧</h1>
          </div>
          <div class="content">
            <h2 class="title">Solo un paso más...</h2>
            <p class="subtitle">Verifica tu email para activar tu cuenta.</p>
            <div style="background: linear-gradient(135deg, #74b9ff, #0984e3); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; color: white;">
              <h3>🎯 Tu código de verificación</h3>
              <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                ${data.token || 'XXXXXX'}
              </div>
            </div>
            <a href="${data.confirmationUrl || '#'}" class="cta-button">Verificar Email ✅</a>
          </div>
          <div class="footer">
            <p>© 2024 ComplicesConecta. La plataforma líder para conexiones auténticas.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  return templates[template] || templates.welcome
}
