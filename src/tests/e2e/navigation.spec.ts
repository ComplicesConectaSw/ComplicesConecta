import { test, expect } from '@playwright/test';

test.describe('Navigation and Authentication', () => {
  test('should navigate to main pages without authentication', async ({ page }) => {
    await page.goto('/');
    
    // Check landing page loads
    await expect(page.locator('h1')).toContainText('Cómplices');
    
    // Navigate to public pages
    await page.goto('/profiles');
    await expect(page.locator('h1')).toContainText('Perfiles');
    
    await page.goto('/events');
    await expect(page.locator('h1')).toContainText('Eventos');
    
    await page.goto('/chat');
    await expect(page.locator('h1')).toContainText('Chat');
  });

  test('should handle demo authentication flow', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill demo registration form
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Select single profile type
    await page.click('button:has-text("Single")');
    
    // Submit form
    await page.click('button:has-text("Registrarse")');
    
    // Should redirect to profiles or dashboard
    await expect(page.url()).toMatch(/(profiles|dashboard)/);
  });

  test('should show authenticated navigation after login', async ({ page }) => {
    // Set up demo authentication
    await page.evaluate(() => {
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'test-user-1',
        type: 'single',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/');
    
    // Should show authenticated navigation
    await expect(page.locator('text=Matches')).toBeVisible();
    await expect(page.locator('text=Solicitudes')).toBeVisible();
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=página no encontrada')).toBeVisible();
    
    // Should have navigation back to home
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test('should navigate between main sections', async ({ page }) => {
    // Set up demo authentication
    await page.evaluate(() => {
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'test-user-1',
        type: 'single',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/profiles');
    
    // Navigate to matches
    await page.click('a[href="/matches"]');
    await expect(page.url()).toContain('/matches');
    await expect(page.locator('h1')).toContainText('Matches');
    
    // Navigate to discover
    await page.click('a[href="/discover"]');
    await expect(page.url()).toContain('/discover');
    await expect(page.locator('h1')).toContainText('Descubrir');
    
    // Navigate to requests
    await page.click('a[href="/requests"]');
    await expect(page.url()).toContain('/requests');
    await expect(page.locator('h1')).toContainText('Solicitudes');
  });
});
