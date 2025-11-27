import { test, expect } from '@playwright/test';

test.describe('Registro de Usuario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('debe mostrar formulario de registro', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bienvenido a ComplicesConecta');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe registrar usuario single exitosamente', async ({ page }) => {
    const testEmail = `test-single-${Date.now()}@example.com`;
    
    // Llenar formulario de registro
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    // Seleccionar tipo de cuenta
    await page.click('button[data-testid="account-type-single"]');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección o mensaje de éxito
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('debe registrar usuario couple exitosamente', async ({ page }) => {
    const testEmail = `test-couple-${Date.now()}@example.com`;
    
    // Llenar formulario de registro
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Couple');
    
    // Seleccionar tipo de cuenta
    await page.click('button[data-testid="account-type-couple"]');
    
    // Llenar campos específicos de pareja
    await page.fill('input[name="partnerName"]', 'Partner Name');
    await page.fill('input[name="partnerAge"]', '28');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección o mensaje de éxito
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('debe validar email único', async ({ page }) => {
    const duplicateEmail = 'existing@example.com';
    
    // Intentar registrar con email existente
    await page.fill('input[type="email"]', duplicateEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    await page.click('button[data-testid="account-type-single"]');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email ya registrado');
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar mensajes de validación
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[type="password"]:invalid')).toBeVisible();
  });

  test('debe validar formato de email', async ({ page }) => {
    // Probar email inválido
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar validación HTML5
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
  });

  test('debe validar longitud mínima de contraseña', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123'); // Contraseña muy corta
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error de contraseña
    await expect(page.locator('[data-testid="password-error"]')).toContainText('mínimo 6 caracteres');
  });

  test('debe mostrar términos y condiciones', async ({ page }) => {
    await expect(page.locator('a[href*="terms"]')).toBeVisible();
    await expect(page.locator('a[href*="privacy"]')).toBeVisible();
  });

  test('debe alternar entre login y registro', async ({ page }) => {
    // Verificar que está en modo registro por defecto
    await expect(page.locator('button[data-testid="toggle-auth-mode"]')).toContainText('¿Ya tienes cuenta?');
    
    // Cambiar a modo login
    await page.click('button[data-testid="toggle-auth-mode"]');
    await expect(page.locator('button[data-testid="toggle-auth-mode"]')).toContainText('¿No tienes cuenta?');
    
    // Verificar que los campos de registro se ocultan
    await expect(page.locator('input[name="firstName"]')).not.toBeVisible();
    await expect(page.locator('input[name="lastName"]')).not.toBeVisible();
  });

  test('debe manejar errores de red', async ({ page }) => {
    // Simular error de red
    await page.route('**/auth/v1/signup', route => route.abort());
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    await page.click('button[data-testid="account-type-single"]');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error de conexión
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test('debe mostrar indicador de carga durante registro', async ({ page }) => {
    // Retrasar respuesta del servidor
    await page.route('**/auth/v1/signup', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    await page.click('button[data-testid="account-type-single"]');
    await page.click('button[type="submit"]');
    
    // Verificar indicador de carga
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});
