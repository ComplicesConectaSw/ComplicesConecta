import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async loginAsUser(email: string = 'single@demo.com', password: string = 'demo123') {
    // Navegar a auth
    await this.page.goto('/auth');
    await this.page.waitForLoadState('networkidle');
    
    // Verificar que la página cargó
    await expect(this.page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab de login
    const loginTab = this.page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Verificar si ya está seleccionada
    const isSelected = await loginTab.getAttribute('aria-selected');
    if (isSelected !== 'true') {
      await loginTab.click();
    }
    
    // Llenar formulario
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Iniciar Sesión")');
    
    // Esperar redirección (más flexible)
    await this.page.waitForURL(/\/(profile-single|profile-couple|discover|admin)/, { 
      timeout: 30000 
    });
  }

  async loginAsAdmin() {
    await this.loginAsUser('complicesconectasw@outlook.es', 'admin123');
    await expect(this.page).toHaveURL(/\/admin/);
  }

  async logout() {
    const logoutBtn = this.page.locator('[data-testid="logout-btn"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(this.page).toHaveURL(/\/auth/);
    }
  }

  async skipAuthAndGoTo(path: string) {
    // Para tests que no requieren autenticación real
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }
}
