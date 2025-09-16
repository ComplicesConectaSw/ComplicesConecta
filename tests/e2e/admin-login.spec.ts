import { test, expect } from '@playwright/test';

test.describe('Login de Administrador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('debe permitir login de admin con credenciales válidas', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Usar credenciales de admin
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Verificar redirección al panel de admin
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
  });

  test('debe mostrar panel de administración completo', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Verificar secciones del panel de admin
    await expect(page.locator('[data-testid="users-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="profiles-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="analytics-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="reports-section"]')).toBeVisible();
  });

  test('debe mostrar estadísticas de usuarios', async ({ page }) => {
    // Login como admin y navegar al panel
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Verificar métricas
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-registrations"]')).toBeVisible();
    await expect(page.locator('[data-testid="premium-users"]')).toBeVisible();
  });

  test('debe permitir gestión de usuarios', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Navegar a gestión de usuarios
    await page.click('[data-testid="users-section"]');
    
    // Verificar tabla de usuarios
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-row"]').first()).toBeVisible();
    
    // Verificar acciones disponibles
    await expect(page.locator('[data-testid="edit-user-btn"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="delete-user-btn"]').first()).toBeVisible();
  });

  test('debe permitir moderación de contenido', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Navegar a moderación
    await page.click('[data-testid="moderation-section"]');
    
    // Verificar herramientas de moderación
    await expect(page.locator('[data-testid="reported-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-approvals"]')).toBeVisible();
  });

  test('debe denegar acceso a usuarios no admin', async ({ page }) => {
    // Login como usuario regular
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Intentar acceder al panel de admin directamente
    await page.goto('/admin');
    
    // Verificar redirección o mensaje de acceso denegado
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('debe manejar logout de admin correctamente', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Hacer logout
    await page.click('[data-testid="logout-btn"]');
    
    // Verificar redirección a página de login
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('debe mostrar logs de actividad admin', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Navegar a logs
    await page.click('[data-testid="logs-section"]');
    
    // Verificar tabla de logs
    await expect(page.locator('[data-testid="activity-logs"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-entry"]').first()).toBeVisible();
  });

  test('debe validar permisos específicos de admin', async ({ page }) => {
    // Login como admin
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL(/\/admin/);
    
    // Verificar acciones que solo admin puede hacer
    await expect(page.locator('[data-testid="delete-user-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="ban-user-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-settings-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="backup-data-btn"]')).toBeVisible();
  });

  test('debe manejar errores de autenticación admin', async ({ page }) => {
    // Intentar login con credenciales incorrectas
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'complicesconectasw@outlook.es');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Credenciales incorrectas');
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
