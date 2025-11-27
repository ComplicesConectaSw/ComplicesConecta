import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('demo_authenticated', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'test-user-1',
        type: 'single',
        email: 'test@example.com'
      }));
    });
  });

  test('should navigate to single profile edit page', async ({ page }) => {
    await page.goto('/edit-profile-single');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Editar Perfil');
    
    // Check form fields are present
    await expect(page.locator('input[placeholder*="nombre"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="edad"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="bio"]')).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/edit-profile-single');
    
    // Fill out form
    await page.fill('input[placeholder*="nombre"]', 'Ana García');
    await page.fill('input[placeholder*="edad"]', '28');
    await page.fill('textarea[placeholder*="bio"]', 'Me encanta el lifestyle swinger y conocer gente nueva');
    
    // Save profile
    await page.click('button:has-text("Guardar")');
    
    // Should show success message or redirect
    await expect(page.locator('text=guardado')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/edit-profile-single');
    
    // Clear required fields
    await page.fill('input[placeholder*="nombre"]', '');
    await page.fill('input[placeholder*="edad"]', '');
    
    // Try to save
    await page.click('button:has-text("Guardar")');
    
    // Should show validation errors
    await expect(page.locator('text=requerido')).toBeVisible();
  });

  test('should navigate to couple profile edit page', async ({ page }) => {
    // Update demo user to couple type
    await page.evaluate(() => {
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'test-couple-1',
        type: 'couple',
        email: 'couple@example.com'
      }));
    });
    
    await page.goto('/edit-profile-couple');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Editar Perfil de Pareja');
    
    // Check couple-specific fields
    await expect(page.locator('input[placeholder*="Nombre de él"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Nombre de ella"]')).toBeVisible();
  });

  test('should handle location updates', async ({ page }) => {
    await page.goto('/edit-profile-single');
    
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 19.4326, longitude: -99.1332 });
    
    // Click location button if present
    const locationButton = page.locator('button:has-text("Ubicación")');
    if (await locationButton.isVisible()) {
      await locationButton.click();
      
      // Should update location field
      await expect(page.locator('input[placeholder*="ubicación"]')).not.toBeEmpty();
    }
  });
});
