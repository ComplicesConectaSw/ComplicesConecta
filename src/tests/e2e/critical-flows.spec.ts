/**
 * Tests E2E críticos para completar cobertura >90%
 * ComplicesConecta v3.0.0 - Flows esenciales
 */

import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar viewport para mobile-first
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('Authentication Flow - Demo Mode', async ({ page }) => {
    await page.goto('/');
    
    // Verificar landing page carga
    await expect(page.locator('h1')).toContainText('ComplicesConecta');
    
    // Entrar en modo demo
    await page.click('[data-testid="demo-mode-button"]');
    
    // Verificar navegación a dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verificar badge demo visible
    await expect(page.locator('[data-testid="demo-badge"]')).toBeVisible();
  });

  test('Navigation Between Pages', async ({ page }) => {
    // Iniciar en modo demo
    await page.goto('/dashboard?mode=demo');
    
    // Verificar NavigationEnhanced está presente
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    
    // Navegar a perfiles
    await page.click('[aria-label="Ver perfiles de usuarios"]');
    await expect(page).toHaveURL(/.*profiles/);
    
    // Navegar a chat
    await page.click('[aria-label="Abrir mensajes de chat"]');
    await expect(page).toHaveURL(/.*chat/);
    
    // Navegar a matches
    await page.click('[aria-label="Ver conexiones y matches"]');
    await expect(page).toHaveURL(/.*matches/);
    
    // Verificar navegación móvil funciona
    if (await page.locator('.md\\:hidden').isVisible()) {
      await page.click('[aria-label="Abrir menú"]');
      await expect(page.locator('[aria-label="Menú de navegación móvil"]')).toBeVisible();
    }
  });

  test('Responsive Design Breakpoints', async ({ page }) => {
    await page.goto('/dashboard?mode=demo');
    
    // Test mobile (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.md\\:hidden')).toBeVisible(); // Mobile nav
    
    // Test tablet (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for responsive changes
    
    // Test desktop (1024px)
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.hidden.md\\:flex')).toBeVisible(); // Desktop nav
    
    // Test large desktop (1280px)
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.waitForTimeout(500);
  });

  test('Profile Navigation and Functionality', async ({ page }) => {
    await page.goto('/profile?mode=demo');
    
    // Verificar perfil carga
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
    
    // Verificar botones de acción
    await expect(page.locator('[data-testid="edit-profile-button"]')).toBeVisible();
    
    // Test navegación entre perfiles single/couple
    const profileTypeButtons = page.locator('[data-testid="profile-type-toggle"]');
    if (await profileTypeButtons.count() > 0) {
      await profileTypeButtons.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('Chat Basic Functionality', async ({ page }) => {
    await page.goto('/chat?mode=demo');
    
    // Verificar lista de chats
    await expect(page.locator('[data-testid="chat-list"]')).toBeVisible();
    
    // Abrir primer chat si existe
    const firstChat = page.locator('[data-testid="chat-item"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      
      // Verificar chat window abre
      await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
      
      // Verificar input de mensaje
      await expect(page.locator('[placeholder="Escribe un mensaje..."]')).toBeVisible();
    }
  });

  test('Security Features - Android', async ({ page }) => {
    // Mock Capacitor environment
    await page.addInitScript(() => {
      (window as any).Capacitor = {
        isNativePlatform: () => true,
        getPlatform: () => 'android'
      };
    });
    
    await page.goto('/dashboard');
    
    // Verificar que la app carga normalmente en entorno seguro
    await expect(page.locator('body')).not.toContainText('Advertencia de Seguridad');
  });

  test('Performance and Loading', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard?mode=demo');
    
    // Verificar carga rápida (<3s)
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Verificar elementos críticos cargan
    await expect(page.locator('[role="navigation"]')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 2000 });
  });

  test('Accessibility Features', async ({ page }) => {
    await page.goto('/dashboard?mode=demo');
    
    // Verificar navegación por teclado
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Verificar ARIA labels
    const navElements = page.locator('[role="navigation"]');
    await expect(navElements).toHaveAttribute('aria-label');
    
    // Verificar contraste (elementos principales visibles)
    await expect(page.locator('h1, h2, h3')).toBeVisible();
  });

  test('Error Handling and Fallbacks', async ({ page }) => {
    // Test página inexistente
    await page.goto('/nonexistent-page');
    
    // Debería redirigir o mostrar 404
    await page.waitForTimeout(2000);
    
    // Test sin conexión (simulado) - Método correcto para Playwright
    const context = page.context();
    await context.setOffline(true);
    await page.reload();
    await context.setOffline(false);
  });
});

test.describe('Mobile-Specific Tests', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  });

  test('Touch Interactions', async ({ page }) => {
    await page.goto('/dashboard?mode=demo');
    
    // Verificar touch targets son >48px
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44); // iOS minimum
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('Mobile Navigation Bottom Bar', async ({ page }) => {
    await page.goto('/dashboard?mode=demo');
    
    // Verificar navegación inferior fija
    const bottomNav = page.locator('[aria-label="Navegación inferior"]');
    await expect(bottomNav).toBeVisible();
    
    // Verificar posición fija
    const box = await bottomNav.boundingBox();
    expect(box?.y).toBeGreaterThan(500); // Should be near bottom
  });
});
