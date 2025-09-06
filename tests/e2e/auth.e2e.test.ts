import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de autenticación
    await page.goto('/auth');
  });

  test('should display login form by default', async ({ page }) => {
    // Verificar que el formulario de login esté visible
    await expect(page.locator('h2')).toContainText('Iniciar Sesión');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should switch to register form', async ({ page }) => {
    // Hacer clic en el enlace de registro
    await page.click('text=¿No tienes cuenta? Regístrate');
    
    // Verificar que el formulario de registro esté visible
    await expect(page.locator('h2')).toContainText('Crear Cuenta');
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que se muestren errores de validación
    await expect(page.locator('text=Email es requerido')).toBeVisible();
    await expect(page.locator('text=Contraseña es requerida')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Ingresar email inválido
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar error de formato de email
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should attempt login with demo credentials', async ({ page }) => {
    // Llenar formulario con credenciales demo
    await page.fill('input[type="email"]', 'single@outlook.es');
    await page.fill('input[type="password"]', 'password123');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestre loading o redirección
    await expect(page.locator('text=Iniciando sesión...')).toBeVisible();
  });

  test('should complete registration flow', async ({ page }) => {
    // Cambiar a formulario de registro
    await page.click('text=¿No tienes cuenta? Regístrate');
    
    // Llenar formulario de registro
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="age"]', '25');
    
    // Seleccionar tipo de usuario
    await page.click('text=👤 Single');
    
    // Verificar que el botón de envío esté habilitado
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should handle hCaptcha widget', async ({ page }) => {
    // Verificar que el widget de hCaptcha esté presente
    await expect(page.locator('.hcaptcha-container')).toBeVisible();
    
    // En un entorno de testing, el hCaptcha podría estar en modo test
    // Verificar que se cargue correctamente
    await page.waitForSelector('.hcaptcha-container iframe', { timeout: 5000 });
  });

  test('should redirect after successful login', async ({ page }) => {
    // Mock de respuesta exitosa de login
    await page.route('**/auth/signin', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'single@outlook.es' },
          session: { access_token: 'mock-token' }
        })
      });
    });
    
    // Realizar login
    await page.fill('input[type="email"]', 'single@outlook.es');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar redirección a dashboard o perfil
    await expect(page).toHaveURL(/\/(profile|dashboard|discover)/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock de error de red
    await page.route('**/auth/signin', (route) => {
      route.abort('failed');
    });
    
    // Intentar login
    await page.fill('input[type="email"]', 'single@outlook.es');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar que se muestre error de conexión
    await expect(page.locator('text=Error de conexión')).toBeVisible();
  });
});
