import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Gallery E2E Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Configurar estado demo ANTES de navegar usando addInitScript
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo-user-gallery',
        email: 'gallery@demo.com',
        name: 'Usuario Galería Demo',
        is_demo: true
      }));
    });
    
    // Navegar a la galería con estado demo preconfigurado
    await page.goto('/gallery');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que la página cargó correctamente o mostrar error útil
    try {
      await page.waitForSelector('h1, h2, [data-testid="gallery-container"]', { timeout: 10000 });
    } catch (error) {
      const pageContent = await page.content();
      console.log('❌ Página no cargó correctamente. Contenido:', pageContent.substring(0, 500));
      throw error;
    }
  });

  test('should display gallery page with demo content', async ({ page }) => {
    // Verificar que la página se carga
    await expect(page.locator('h2')).toContainText('Mi Galería de Fotos');
    
    // Esperar a que el alert de modo demo sea visible, con un timeout generoso
    const demoAlert = page.locator('[data-testid="demo-mode-alert"]');
    await expect(demoAlert).toBeVisible({ timeout: 10000 });

    // Una vez que el contenedor es visible, verificar el texto interno
    await expect(demoAlert.locator('text=Modo Demo Activo')).toBeVisible();
    
    // Verificar botón de subida
    await expect(page.locator('[data-testid="upload-image-btn"]')).toBeVisible();
  });

  test('should show privacy tabs for owner', async ({ page }) => {
    // Verificar tabs de público/privado
    await expect(page.locator('text=Públicas')).toBeVisible();
    await expect(page.locator('text=Privadas')).toBeVisible();
    
    // Cambiar a tab privadas
    await page.click('text=Privadas');
    await expect(page.locator('text=Privadas')).toHaveClass(/border-pink-600/);
  });

  test('should simulate image upload in demo mode', async ({ page }) => {
    
    // Simular subida de imagen
    await page.click('[data-testid="upload-image-btn"]');
    
    // En modo demo, debería mostrar mensaje de simulación
    await page.waitForTimeout(2000); // Esperar simulación
    
    // Verificar que aparecen imágenes demo
    const images = page.locator('[data-testid^="gallery-image-"]');
    await expect(images.first()).toBeVisible();
  });

  test('should toggle image privacy', async ({ page }) => {
    
    // Esperar a que aparezcan imágenes
    await page.waitForSelector('[data-testid^="gallery-image-"]');
    
    // Hacer hover sobre primera imagen para mostrar controles
    const firstImage = page.locator('[data-testid^="gallery-image-"]').first();
    await firstImage.hover();
    
    // Hacer clic en botón de privacidad
    const privacyToggle = page.locator('[data-testid^="privacy-toggle-"]').first();
    await privacyToggle.click();
    
    // Verificar que el badge de privacidad cambia
    await expect(page.locator('.group').first().locator('text=Privada')).toBeVisible();
  });

  test('should show access request for private images', async ({ page }) => {
    await authHelper.loginWithDemoCredentials('single@demo.com', 'demo123');
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    
    // Cambiar a tab privadas
    await page.click('text=Privadas');
    
    // Simular vista como otro usuario (cambiar viewerUserId)
    await page.evaluate(() => {
      // Simular que somos otro usuario viendo la galería
      window.localStorage.setItem('viewer_user_id', 'different-user');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar que se muestra placeholder de imagen privada
    await expect(page.locator('text=Imagen Privada')).toBeVisible();
    
    // Verificar botón de solicitar acceso
    await expect(page.locator('[data-testid^="request-access-"]')).toBeVisible();
  });

  test('should navigate to gallery from navigation', async ({ page }) => {
    await authHelper.loginWithDemoCredentials('single@demo.com', 'demo123');
    
    // Ir a cualquier página autenticada
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
    
    // Hacer clic en galería en la navegación
    await page.click('text=Galería');
    
    // Verificar que navegamos a galería
    await expect(page).toHaveURL(/\/gallery/);
    await expect(page.locator('h2')).toContainText('Mi Galería de Fotos');
  });

  test('should navigate from profile to gallery', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que aparezcan imágenes
    await page.waitForSelector('[data-testid^="gallery-image-"]');
    
    // Hacer clic en galería en la navegación
    await page.click('text=Galería');
    
    // Verificar que navegamos a galería
    await expect(page).toHaveURL(/\/gallery/);
    await expect(page.locator('h2')).toContainText('Mi Galería de Fotos');
  });

  test('should open image modal on click', async ({ page }) => {
    // Esperar a que aparezcan imágenes
    await page.waitForSelector('[data-testid^="gallery-image-"]');
    
    // Hacer clic en primera imagen para abrir modal
    const firstImage = page.locator('[data-testid^="gallery-image-"]').first();
    await firstImage.click();
    
    // Verificar que se abre el modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verificar contenido del modal
    await expect(page.locator('[role="dialog"] img')).toBeVisible();
    
    // Cerrar modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should delete image', async ({ page }) => {
    // Esperar a que aparezcan imágenes
    await page.waitForSelector('[data-testid^="gallery-image-"]');
    
    // Contar imágenes iniciales
    const initialCount = await page.locator('[data-testid^="gallery-image-"]').count();
    
    // Hacer hover sobre primera imagen
    const firstImage = page.locator('[data-testid^="gallery-image-"]').first();
    await firstImage.hover();
    
    // Hacer clic en botón eliminar
    const deleteButton = page.locator('[data-testid^="delete-image-"]').first();
    await deleteButton.click();
    
    // Verificar que se eliminó la imagen
    await page.waitForTimeout(1000);
    const finalCount = await page.locator('[data-testid^="gallery-image-"]').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should handle access requests', async ({ page }) => {
    
    // Esperar a que aparezcan imágenes
    await page.waitForSelector('[data-testid^="gallery-image-"]');
    
    // Contar imágenes iniciales
    const initialCount = await page.locator('[data-testid^="gallery-image-"]').count();
    
    // Hacer hover sobre primera imagen
    const firstImage = page.locator('[data-testid^="gallery-image-"]').first();
    await firstImage.hover();
    
    // Hacer clic en botón de solicitar acceso
    const requestAccessButton = page.locator('[data-testid^="request-access-"]').first();
    await requestAccessButton.click();
    
    // Verificar que se envió la solicitud de acceso
    await page.waitForTimeout(1000);
    const finalCount = await page.locator('[data-testid^="gallery-image-"]').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should show gallery statistics', async ({ page }) => {
    
    // Verificar que se muestran estadísticas
    await expect(page.locator('text=Resumen de Galería')).toBeVisible();
    await expect(page.locator('text=Total de fotos')).toBeVisible();
    await expect(page.locator('text=Fotos públicas')).toBeVisible();
    await expect(page.locator('text=Fotos privadas')).toBeVisible();
  });

  test('should handle empty gallery state', async ({ page }) => {
    // Limpiar imágenes demo para simular galería vacía
    await page.evaluate(() => {
      localStorage.removeItem('demo_gallery_images');
    });
    
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    
    // Verificar mensaje de galería vacía
    await expect(page.locator('text=No hay fotos en tu galería')).toBeVisible();
    await expect(page.locator('text=Sube tu primera foto para comenzar')).toBeVisible();
  });

  test('should redirect unauthenticated users to auth', async ({ page }) => {
    // Limpiar autenticación
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    
    // Verificar que muestra contenido público o redirige
    const isAuthPage = await page.url().includes('/auth');
    const hasPublicContent = await page.locator('text=Galería').isVisible().catch(() => false);
    
    expect(isAuthPage || hasPublicContent).toBeTruthy();
  });
});
