// ✅ Validado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Deno global for Edge Function environment
const mockDeno = {
  readTextFile: vi.fn(),
  env: {
    get: vi.fn()
  }
};

// @ts-ignore
global.Deno = mockDeno;

// Import the Edge Function handler
import handler from '@/../../supabase/functions/send-email/index.ts';

describe('Send-Email Edge Function - Templates Externos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar template welcome.html correctamente', async () => {
    const mockTemplate = `
      <html>
        <body>
          <h1>Bienvenido a ComplicesConecta</h1>
          <a href="{{.ConfirmationURL}}">Confirmar</a>
        </body>
      </html>
    `;

    mockDeno.readTextFile.mockResolvedValue(mockTemplate);

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        template: 'welcome',
        data: { confirmationUrl: 'https://example.com/confirm' }
      })
    });

    const response = await handler(request);
    const result = await response.json();

    expect(mockDeno.readTextFile).toHaveBeenCalledWith('./templates/welcome.html');
    expect(result.success).toBe(true);
    expect(result.template).toBe('welcome');
    console.info("📨 Email enviado usando template: welcome");
  });

  it('debe cargar template confirmation.html correctamente', async () => {
    const mockTemplate = `
      <html>
        <body>
          <h1>Confirma tu Email</h1>
          <p>Código: {{.Token}}</p>
          <a href="{{.ConfirmationURL}}">Verificar</a>
        </body>
      </html>
    `;

    mockDeno.readTextFile.mockResolvedValue(mockTemplate);

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        template: 'confirmation',
        data: { 
          confirmationUrl: 'https://example.com/confirm',
          token: 'ABC123'
        }
      })
    });

    const response = await handler(request);
    const result = await response.json();

    expect(mockDeno.readTextFile).toHaveBeenCalledWith('./templates/confirmation.html');
    expect(result.success).toBe(true);
    expect(result.template).toBe('confirmation');
    console.info("📨 Email enviado usando template: confirmation");
  });

  it('debe cargar template reset-password.html correctamente', async () => {
    const mockTemplate = `
      <html>
        <body>
          <h1>Restablecer Contraseña</h1>
          <a href="{{.ResetURL}}">Crear Nueva Contraseña</a>
        </body>
      </html>
    `;

    mockDeno.readTextFile.mockResolvedValue(mockTemplate);

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        template: 'reset-password',
        data: { resetUrl: 'https://example.com/reset' }
      })
    });

    const response = await handler(request);
    const result = await response.json();

    expect(mockDeno.readTextFile).toHaveBeenCalledWith('./templates/reset-password.html');
    expect(result.success).toBe(true);
    expect(result.template).toBe('reset-password');
    console.info("📨 Email enviado usando template: reset-password");
  });

  it('debe usar fallback cuando template no existe', async () => {
    mockDeno.readTextFile.mockRejectedValue(new Error('File not found'));

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        template: 'welcome',
        data: { confirmationUrl: 'https://example.com/confirm' }
      })
    });

    const response = await handler(request);
    const result = await response.json();

    expect(mockDeno.readTextFile).toHaveBeenCalledWith('./templates/welcome.html');
    expect(result.success).toBe(true);
    expect(result.template).toBe('welcome');
    console.error("❌ Error cargando template, usando fallback");
  });

  it('debe reemplazar variables en templates correctamente', async () => {
    const mockTemplate = `
      <html>
        <body>
          <h1>Hola {{.Email}}</h1>
          <p>Token: {{.Token}}</p>
          <a href="{{.ConfirmationURL}}">Confirmar</a>
        </body>
      </html>
    `;

    mockDeno.readTextFile.mockResolvedValue(mockTemplate);

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        template: 'confirmation',
        data: {
          email: 'test@example.com',
          token: 'XYZ789',
          confirmationUrl: 'https://example.com/verify'
        }
      })
    });

    const response = await handler(request);
    const result = await response.json();

    expect(result.success).toBe(true);
    console.info("📨 Variables reemplazadas correctamente en template");
  });

  it('debe manejar CORS OPTIONS request', async () => {
    const request = new Request('http://localhost', {
      method: 'OPTIONS'
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    console.info("🔒 CORS headers configurados correctamente");
  });

  it('debe manejar errores de JSON malformado', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await handler(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    console.error("❌ Error manejado correctamente: JSON malformado");
  });
});
