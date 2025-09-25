import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page initially', async ({ page }) => {
    // Verify login elements are present
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Try invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Should show validation error
    await expect(page.locator('text=email válido')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for short password', async ({ page }) => {
    // Try short password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');
    
    // Should show validation error
    await expect(page.locator('text=6 caracteres')).toBeVisible({ timeout: 5000 });
  });

  test('should handle demo login successfully', async ({ page }) => {
    // Click demo login
    await page.click('[data-testid="demo-login-button"]');
    
    // Should redirect to main app
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('should toggle between login and register modes', async ({ page }) => {
    // Should start in login mode
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Switch to register
    await page.click('[data-testid="switch-to-register"]');
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    
    // Switch back to login
    await page.click('[data-testid="switch-to-login"]');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should validate password confirmation in register mode', async ({ page }) => {
    // Switch to register mode
    await page.click('[data-testid="switch-to-register"]');
    
    // Fill form with mismatched passwords
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'different123');
    await page.click('[data-testid="register-button"]');
    
    // Should show password mismatch error
    await expect(page.locator('text=contraseñas no coinciden')).toBeVisible({ timeout: 5000 });
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.click('[data-testid="demo-login-button"]');
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should return to login page
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login
    await page.click('[data-testid="demo-login-button"]');
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle session expiration', async ({ page }) => {
    // Login
    await page.click('[data-testid="demo-login-button"]');
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
    
    // Simulate session expiration by clearing localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Navigate to a protected page
    await page.goto('/discover');
    
    // Should redirect to login
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Start login process
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible({ timeout: 1000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/auth/**', route => route.abort());
    
    // Try to login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('text=Error de conexión')).toBeVisible({ timeout: 5000 });
  });

  test('should handle hCaptcha verification', async ({ page }) => {
    // Switch to register mode
    await page.click('[data-testid="switch-to-register"]');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    
    // Should show hCaptcha widget
    await expect(page.locator('[data-testid="hcaptcha-widget"]')).toBeVisible();
    
    // Note: In real tests, you'd need to handle hCaptcha verification
    // For now, just verify the widget is present
  });

  test('should validate required profile fields after registration', async ({ page }) => {
    // Complete demo registration flow
    await page.click('[data-testid="demo-login-button"]');
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
    
    // Navigate to profile
    await page.click('[data-testid="profile-link"]');
    
    // Should show profile completion form if incomplete
    const profileForm = page.locator('[data-testid="profile-form"]');
    if (await profileForm.isVisible()) {
      await expect(page.locator('[data-testid="profile-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-age-input"]')).toBeVisible();
    }
  });
});
