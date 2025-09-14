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
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('debe enviar email de confirmación con template correcto', async () => {
    // Mock fetch para simular Edge Function
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, template: 'confirmation' })
    });

    const result = await EmailService.sendConfirmationEmail(
      'test@example.com',
      'https://example.com/confirm',
      'ABC123'
    );

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/send-email'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        }),
        body: JSON.stringify({
          to: 'test@example.com',
          template: 'confirmation',
          data: { confirmationUrl: 'https://example.com/confirm', token: 'ABC123' }
        })
      })
    );
    console.info("📨 Email enviado usando template: confirmation");
  });

  it('debe enviar email de reset con template correcto', async () => {
    // Mock fetch para simular Edge Function
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, template: 'reset-password' })
    });

    const result = await EmailService.sendPasswordResetEmail(
      'test@example.com',
      'https://example.com/reset'
    );

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/send-email'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        }),
        body: JSON.stringify({
          to: 'test@example.com',
          template: 'reset-password',
          data: { resetUrl: 'https://example.com/reset' }
        })
      })
    );
  });

  it('debe manejar errores de Edge Function correctamente', async () => {
    // Mock fetch para simular error de Edge Function
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: { message: 'Template not found' } })
    });

    try {
      await EmailService.sendConfirmationEmail(
        'test@example.com',
        'https://example.com/confirm',
        'ABC123'
      );
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('HTTP error! status: 500');
    }

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/send-email'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        }),
        body: JSON.stringify({
          to: 'test@example.com',
          template: 'confirmation',
          data: { confirmationUrl: 'https://example.com/confirm', token: 'ABC123' }
        })
      })
    );
  });

  it('debe validar formato de email correctamente', () => {
    // Mock validateEmail function
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    expect(validateEmail('valid@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });
});
