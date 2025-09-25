import { test, expect, Page, BrowserContext } from '@playwright/test';
import { EnhancedAuthHelper } from '../helpers/EnhancedAuthHelper';
import { 
  SINGLE_TEST_USER, 
  COUPLE_TEST_USER, 
  ADMIN_TEST_USER,
  DEMO_CREDENTIALS,
  TEST_CONFIGS 
} from '../fixtures/auth-fixtures';

/**
 * Suite mejorada de tests E2E para flujos de autenticación
 * Aislada, determinística y sin dependencias externas
 */

test.describe('🔐 Flujos de Autenticación E2E - Mejorados', () => {
  let authHelper: EnhancedAuthHelper;

  test.beforeEach(async ({ page, context }) => {
    authHelper = new EnhancedAuthHelper(page, context);
    await authHelper.setup();
  });

  test.afterEach(async () => {
    await authHelper.teardown();
  });

  test.describe('👤 Autenticación Usuario Single', () => {
    test('debe permitir login exitoso como single', async ({ page }) => {
      // Navegar a página de auth
      await page.goto('/auth');
      
      // Ejecutar login mock
      await authHelper.loginAsSingle();
      
      // Verificar      // Navegar al dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      // Debug: Verificar que estamos en la URL correcta
      console.log('🔍 URL actual:', page.url());
      
      // Debug: Verificar el contenido de la página
      const bodyText = await page.locator('body').textContent();
      console.log('🔍 Contenido de body:', bodyText?.substring(0, 200));
      
      // Debug: Verificar si hay errores en consola
      page.on('console', msg => console.log('🔍 Console:', msg.text()));
      
      // Esperar a que el Dashboard se cargue
      await page.waitForTimeout(3000);
      
      // Debug: Verificar localStorage
      const localStorageData = await page.evaluate((): { userProfile: string | null; authToken: string | null; authMode: string | null } => {
        return {
          userProfile: localStorage.getItem('user-profile'),
          authToken: localStorage.getItem('supabase.auth.token'),
          authMode: localStorage.getItem('auth-mode')
        };
      });
      console.log('🔍 LocalStorage:', localStorageData);

      // Verificar elementos de UI específicos de single
      await expect(page.locator('[data-testid="user-type"]')).toContainText('single');
      await expect(page.locator('[data-testid="profile-name"]')).toContainText(SINGLE_TEST_USER.profile.name);
      
      // Verificar estado de autenticación
      const isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBe(true);
      
      const profile = await authHelper.getCurrentProfile();
      expect(profile.type).toBe('single');
    });

    test('debe mostrar rutas correctas para usuario single', async ({ page }) => {
      await authHelper.loginAsSingle();
      
      const config = TEST_CONFIGS.single;
      
      // Verificar rutas permitidas
      for (const route of config.expectedRoutes) {
        await page.goto(route);
        await expect(page).not.toHaveURL(/\/auth/);
        console.log(`✅ Ruta permitida: ${route}`);
      }
      
      // Verificar rutas restringidas
      for (const route of config.restrictedRoutes) {
        await page.goto(route);
        // Debe redirigir o mostrar error 403
        await expect(page.locator('body')).toContainText(/403|No autorizado|Acceso denegado/i);
        console.log(`🚫 Ruta restringida correctamente: ${route}`);
      }
    });

    test('debe manejar logout correctamente para single', async ({ page }) => {
      await authHelper.loginAsSingle();
      await page.goto('/dashboard');
      
      // Ejecutar logout
      await authHelper.logout();
      
      // Verificar redirección a auth
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth/);
      
      // Verificar estado limpio
      const isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  test.describe('👫 Autenticación Usuario Couple', () => {
    test('debe permitir login exitoso como couple', async ({ page }) => {
      await page.goto('/auth');
      
      await authHelper.loginAsCouple();
      
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verificar elementos específicos de couple
      await expect(page.locator('[data-testid="user-type"]')).toContainText('couple');
      await expect(page.locator('[data-testid="profile-name"]')).toContainText(COUPLE_TEST_USER.profile.name);
      
      // Verificar campo partner_name si existe
      const profile = await authHelper.getCurrentProfile();
      expect(profile.type).toBe('couple');
      expect(profile.partner_name).toBeDefined();
    });

    test('debe mostrar funcionalidades específicas de couple', async ({ page }) => {
      await authHelper.loginAsCouple();
      await page.goto('/dashboard');
      
      // Verificar elementos UI específicos de parejas
      const partnerElements = page.locator('[data-testid*="partner"], [data-testid*="couple"]');
      await expect(partnerElements.first()).toBeVisible();
      
      // Verificar acceso a funciones de pareja
      await page.goto('/matches');
      await expect(page.locator('[data-testid="couple-matching"]')).toBeVisible();
    });
  });

  test.describe('👑 Autenticación Usuario Admin', () => {
    test('debe permitir login exitoso como admin', async ({ page }) => {
      await page.goto('/auth');
      
      await authHelper.loginAsAdmin();
      
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verificar elementos específicos de admin
      const profile = await authHelper.getCurrentProfile();
      expect(profile.type).toBe('admin');
      expect(profile.role).toBe('administrator');
      expect(profile.permissions).toContain('admin');
    });

    test('debe tener acceso a rutas administrativas', async ({ page }) => {
      await authHelper.loginAsAdmin();
      
      // Verificar acceso a panel admin
      await page.goto('/admin');
      await expect(page).not.toHaveURL(/\/auth/);
      await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
      
      // Verificar funciones administrativas
      await expect(page.locator('[data-testid="admin-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-reports"]')).toBeVisible();
    });

    test('debe mostrar permisos correctos de admin', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await page.goto('/admin');
      
      const config = TEST_CONFIGS.admin;
      
      // Verificar todas las rutas están disponibles
      for (const route of config.expectedRoutes) {
        await page.goto(route);
        await expect(page).not.toHaveURL(/\/auth/);
        console.log(`✅ Admin acceso a: ${route}`);
      }
    });
  });

  test.describe('🎭 Modo Demo', () => {
    test('debe funcionar con credenciales demo single', async ({ page }) => {
      await page.goto('/auth');
      
      // Simular login demo
      await page.evaluate(() => {
        localStorage.setItem('auth-mode', 'demo');
        localStorage.setItem('demo-user', 'single');
      });
      
      await authHelper.loginAsSingle();
      
      // Verificar modo demo activo
      const authMode = await page.evaluate(() => localStorage.getItem('auth-mode'));
      expect(authMode).toBe('demo');
      
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('debe funcionar con credenciales demo couple', async ({ page }) => {
      await page.goto('/auth');
      
      await page.evaluate(() => {
        localStorage.setItem('auth-mode', 'demo');
        localStorage.setItem('demo-user', 'couple');
      });
      
      await authHelper.loginAsCouple();
      
      const authMode = await page.evaluate(() => localStorage.getItem('auth-mode'));
      expect(authMode).toBe('demo');
      
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('🔄 Transiciones de Estado', () => {
    test('debe manejar cambio de single a couple', async ({ page }) => {
      // Login como single
      await authHelper.loginAsSingle();
      await page.goto('/dashboard');
      
      let profile = await authHelper.getCurrentProfile();
      expect(profile.type).toBe('single');
      
      // Cambiar a couple (simulando actualización de perfil)
      await authHelper.logout();
      await authHelper.loginAsCouple();
      
      profile = await authHelper.getCurrentProfile();
      expect(profile.type).toBe('couple');
    });

    test('debe preservar estado durante navegación', async ({ page }) => {
      await authHelper.loginAsSingle();
      
      // Navegar por múltiples páginas
      const routes = ['/dashboard', '/profile', '/matches', '/chat'];
      
      for (const route of routes) {
        await page.goto(route);
        
        // Verificar que sigue autenticado
        const isAuth = await authHelper.isAuthenticated();
        expect(isAuth).toBe(true);
        
        const profile = await authHelper.getCurrentProfile();
        expect(profile.type).toBe('single');
      }
    });
  });

  test.describe('🛡️ Seguridad y Validaciones', () => {
    test('debe rechazar acceso sin autenticación', async ({ page }) => {
      // Intentar acceder sin login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth/);
      
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/auth/);
      
      await page.goto('/admin');
      await expect(page).toHaveURL(/\/auth/);
    });

    test('debe limpiar estado en logout', async ({ page }) => {
      await authHelper.loginAsSingle();
      
      // Verificar estado inicial
      let isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBe(true);
      
      // Logout
      await authHelper.logout();
      
      // Verificar limpieza completa
      isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBe(false);
      
      const profile = await authHelper.getCurrentProfile();
      expect(profile).toBeNull();
    });

    test('debe manejar tokens expirados', async ({ page }) => {
      await authHelper.loginAsSingle();
      
      // Simular token expirado
      await page.evaluate(() => {
        const expiredSession = {
          access_token: 'expired-token',
          refresh_token: 'expired-refresh',
          expires_at: Date.now() - 1000 // Expirado hace 1 segundo
        };
        localStorage.setItem('supabase.auth.token', JSON.stringify(expiredSession));
      });
      
      // Intentar acceder a ruta protegida
      await page.goto('/dashboard');
      
      // Debe redirigir a auth por token expirado
      await expect(page).toHaveURL(/\/auth/);
    });
  });
});
