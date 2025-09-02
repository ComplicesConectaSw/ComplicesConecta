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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase URL or Anon Key is not defined in environment variables.");
    }
  }
  private static baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private static anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  static async sendEmail(template: string, to: string, data: TemplateData = {}) {
    try {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(to: string, confirmationUrl: string, userName?: string) {
    return this.sendEmail('welcome', to, { confirmationUrl, userName });
  }

  static async sendConfirmationEmail(to: string, confirmationUrl: string, token: string) {
    return this.sendEmail('confirmation', to, { confirmationUrl, token });
  }

  static async sendPasswordResetEmail(to: string, resetUrl: string) {
    return this.sendEmail('reset-password', to, { resetUrl });
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
    return this.sendEmail('event', to, eventData);
  }
}
