/**
 * 🛠️ SUPER PROMPT MAESTRO - TEST E2E PERFILES
 */

import { test, expect } from '@playwright/test';

test.describe('🛠️ Test E2E Perfiles', () => {
  
  test('Debe hacer login demo single@outlook.es', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[data-testid="email-input"]', 'single@outlook.es');
    await page.fill('[data-testid="password-input"]', '123456');
    await page.click('[data-testid="login-submit"]');
    
    await page.waitForURL('**/discover', { timeout: 10000 });
    await expect(page.locator('text=Sofía')).toBeVisible();
  });

  test('Debe navegar a perfil single', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[data-testid="email-input"]', 'single@outlook.es');
    await page.fill('[data-testid="password-input"]', '123456');
    await page.click('[data-testid="login-submit"]');
    
    await page.waitForURL('**/discover');
    await page.click('[data-testid="nav-profile"]');
    
    await expect(page.locator('text=Sofía')).toBeVisible();
    await expect(page.locator('text=28')).toBeVisible();
  });
});
