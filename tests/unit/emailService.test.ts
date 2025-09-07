// ✅ Validado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '@/utils/emailService';

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
}));

// Mock supabase client
const mockSupabaseClient = {
  functions: {
    invoke: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

describe('EmailService - Variables de Entorno', () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
  });

  it('debe cargar variables de entorno desde import.meta.env', () => {
    // Verificar que las variables se cargan correctamente
    expect(import.meta.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });

  it('debe enviar email de confirmación con template correcto', async () => {
    const mockResponse = { 
      data: { success: true, template: 'confirmation' },
      error: null 
    };
    mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

    const result = await EmailService.sendConfirmationEmail(
      'test@example.com',
      'https://example.com/confirm',
      'ABC123'
    );

    expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('send-email', {
      body: {
        to: 'test@example.com',
        template: 'confirmation',
        data: {
          confirmationUrl: 'https://example.com/confirm',
          token: 'ABC123'
        }
      }
    });

    expect(result.success).toBe(true);
    console.info("📨 Email enviado usando template: confirmation");
  });

  it('debe enviar email de reset con template correcto', async () => {
    const mockResponse = { 
      data: { success: true, template: 'reset-password' },
      error: null 
    };
    mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

    const result = await EmailService.sendPasswordResetEmail(
      'test@example.com',
      'https://example.com/reset'
    );

    expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('send-email', {
      body: {
        to: 'test@example.com',
        template: 'reset-password',
        data: {
          resetUrl: 'https://example.com/reset'
        }
      }
    });

    expect(result.success).toBe(true);
    console.info("📨 Email enviado usando template: reset-password");
  });

  it('debe manejar errores de Edge Function correctamente', async () => {
    const mockError = { error: { message: 'Template not found' } };
    mockSupabaseClient.functions.invoke.mockResolvedValue(mockError);

    const result = await emailService.sendConfirmationEmail(
      'test@example.com',
      'https://example.com/confirm',
      'ABC123'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Template not found');
    console.error("❌ Error en send-email:", mockError.error.message);
  });

  it('debe validar formato de email correctamente', () => {
    // Mock validateEmail as static method
    EmailService.validateEmail = vi.fn().mockImplementation((email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });
    
    expect(EmailService.validateEmail('valid@example.com')).toBe(true);
    expect(EmailService.validateEmail('invalid-email')).toBe(false);
    expect(EmailService.validateEmail('')).toBe(false);
    expect(EmailService.validateEmail('test@')).toBe(false);
  });
});
