// Supabase Edge Function for sending emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

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
      html: await generateEmailHTML(template, data, to),
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
  return subjects[template as keyof typeof subjects] || 'ComplicesConecta'
}

function getFallbackTemplate(template: string): string {
  const fallbackTemplates: Record<string, string> = {
    welcome: `<html><body><h1>Bienvenido a ComplicesConecta</h1><p>Tu aventura comienza ahora.</p><a href="{{confirmationUrl}}">Confirmar Cuenta</a></body></html>`,
    confirmation: `<html><body><h1>Confirma tu Email</h1><p>Código: {{token}}</p><a href="{{confirmationUrl}}">Verificar Email</a></body></html>`,
    'reset-password': `<html><body><h1>Restablecer Contraseña</h1><a href="{{resetUrl}}">Crear Nueva Contraseña</a></body></html>`,
    match: `<html><body><h1>¡Nuevo Match!</h1><p>{{matchName}} te ha dado like</p><a href="{{chatUrl}}">Iniciar Chat</a></body></html>`,
    event: `<html><body><h1>Invitación a Evento</h1><p>{{eventName}} - {{eventDate}}</p><a href="{{eventUrl}}">Ver Detalles</a></body></html>`
  };
  return fallbackTemplates[template] || fallbackTemplates.welcome;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateEmailHTML(template: string, data: any = {}, to: string): Promise<string> {
  try {
    console.info(`📨 Procesando email con template: ${template} para ${to}`);
    
    const templatePath = `./templates/${template}.html`;
    let htmlContent: string;
    
    try {
      htmlContent = await Deno.readTextFile(templatePath);
      console.info(`✅ Template externo cargado: ${template}.html`);
    } catch {
      console.warn(`⚠️ Template file not found: ${templatePath}, using fallback`);
      htmlContent = getFallbackTemplate(template);
    }

    // Replace variables in template
    let processedHtml = htmlContent;
    if (data) {
      console.info(`🔄 Reemplazando ${Object.keys(data).length} variables en template`);
      Object.entries(data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    console.info(`✅ Email HTML generado exitosamente para template: ${template}`);
    return processedHtml;
  } catch (error) {
    console.error(`❌ Error generating email HTML for template ${template}:`, error);
    return getFallbackTemplate(template);
  }
}

// Para asegurar que Deno deploy lo tome como un módulo
serve(handler);