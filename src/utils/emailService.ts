// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06
// Cambios: Reemplazado process.env con import.meta.env para compatibilidad Vite
// Logs informativos agregados para monitoreo en producción

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface TemplateData {
  confirmationUrl?: string;
  token?: string;
  resetUrl?: string;
  matchName?: string;
  matchAge?: number;
  matchLocation?: string;
  commonInterests?: string;
  chatUrl?: string;
  matchScore?: number;
  distance?: number;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventPrice?: string;
  eventUrl?: string;
  userName?: string;
}

export class EmailService {
  static {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error("Supabase URL or Anon Key is not defined in environment variables.");
    }
  }
  private static baseUrl = import.meta.env.VITE_SUPABASE_URL;
  private static anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  static async sendEmail(template: string, to: string, data: TemplateData = {}) {
    try {
      console.info(`📨 Enviando email con template: ${template} a ${to}`);
      
      const response = await fetch(`${this.baseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: JSON.stringify({
          to,
          template,
          data
        })
      });

      if (!response.ok) {
        console.error(`❌ Error HTTP en send-email: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.info(`✅ Email enviado exitosamente con template: ${template}`);
      return result;
    } catch (error) {
      console.error(`❌ Error enviando email con template ${template}:`, error);
      throw error;
    }
  }

  static async sendWelcomeEmail(to: string, confirmationUrl: string, userName?: string) {
    console.info(`👋 Enviando email de bienvenida a ${userName || 'usuario'} (${to})`);
    return this.sendEmail('welcome', to, { confirmationUrl, userName });
  }

  static async sendConfirmationEmail(to: string, confirmationUrl: string, token: string) {
    const result = await this.sendEmail('confirmation', to, { confirmationUrl, token });
    return result.success === true;
  }

  static async sendPasswordResetEmail(to: string, resetUrl: string) {
    console.info(`🔐 Enviando email de reset de contraseña a ${to}`);
    const result = await this.sendEmail('reset-password', to, { resetUrl });
    return result.success === true;
  }

  static async sendMatchNotification(to: string, matchData: {
    matchName: string;
    matchAge: number;
    matchLocation: string;
    commonInterests: string;
    chatUrl: string;
    matchScore?: number;
    distance?: number;
  }) {
    console.info(`💕 Enviando notificación de match a ${to} - Match: ${matchData.matchName}`);
    return this.sendEmail('match', to, matchData);
  }

  static async sendEventInvitation(to: string, eventData: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventPrice: string;
    eventUrl: string;
  }) {
    console.info(`🎉 Enviando invitación de evento a ${to} - Evento: ${eventData.eventName}`);
    return this.sendEmail('event', to, eventData);
  }
}
