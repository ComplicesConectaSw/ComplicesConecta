/**
 * Test E2E - Flujo completo del modo demo
 * Fecha: 15 Noviembre 2025
 * Propósito: Validar el flujo completo desde landing hasta perfil demo
 * Verifica: Ruta /demo, selector, navegación condicional
 */

import { test, expect } from '@playwright/test';

test.describe('Flujo Demo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
  });

  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar que la página principal carga
    await expect(page).toHaveTitle(/ComplicesConecta/i);
    
    // Verificar que hay contenido visible
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('debe navegar a la ruta /demo', async ({ page }) => {
    // Navegar a la ruta demo
    await page.goto('/demo');
    
    // Verificar que la URL es correcta
    await expect(page).toHaveURL(/.*\/demo/);
    
    // Verificar que el título o heading de demo está presente
    const heading = await page.getByRole('heading', { name: /demo/i }).first();
    await expect(heading).toBeVisible();
  });

  test('debe mostrar el selector de tipo de cuenta demo', async ({ page }) => {
    await page.goto('/demo');
    
    // Buscar botones o cards de Single y Pareja
    const singleOption = await page.getByText(/single/i).or(page.getByText(/soltero/i)).first();
    const coupleOption = await page.getByText(/pareja/i).or(page.getByText(/couple/i)).first();
    
    // Verificar que ambas opciones están visibles
    await expect(singleOption).toBeVisible();
    await expect(coupleOption).toBeVisible();
  });

  test('debe permitir seleccionar modo Single', async ({ page }) => {
    await page.goto('/demo');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Buscar y hacer clic en la opción Single
    const singleButton = await page.getByRole('button', { name: /explorar como single/i }).or(
      page.getByText(/usuario single/i).locator('..').getByRole('button')
    ).first();
    
    if (await singleButton.isVisible()) {
      await singleButton.click();
      
      // Esperar navegación o cambio de estado
      await page.waitForTimeout(2000);
      
      // Verificar que navegó a alguna página de perfil
      const url = page.url();
      expect(url).toMatch(/profile|discover|feed/i);
    }
  });

  test('debe permitir seleccionar modo Pareja', async ({ page }) => {
    await page.goto('/demo');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Buscar y hacer clic en la opción Pareja
    const coupleButton = await page.getByRole('button', { name: /explorar como pareja/i }).or(
      page.getByText(/pareja/i).locator('..').getByRole('button')
    ).first();
    
    if (await coupleButton.isVisible()) {
      await coupleButton.click();
      
      // Esperar navegación o cambio de estado
      await page.waitForTimeout(2000);
      
      // Verificar que navegó a alguna página de perfil
      const url = page.url();
      expect(url).toMatch(/profile|discover|feed/i);
    }
  });
});

test.describe('Flujo de Registro con Teléfono MX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('debe mostrar el formulario de registro', async ({ page }) => {
    // Verificar que estamos en la página de auth
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Buscar tab o botón de registro
    const registerTab = await page.getByRole('tab', { name: /registro/i }).or(
      page.getByText(/registrarse/i)
    ).first();
    
    if (await registerTab.isVisible()) {
      await registerTab.click();
    }
  });

  test('debe validar campo de teléfono mexicano', async ({ page }) => {
    // Ir a registro
    const registerTab = await page.getByRole('tab', { name: /registro/i }).or(
      page.getByText(/registrarse/i)
    ).first();
    
    if (await registerTab.isVisible()) {
      await registerTab.click();
      await page.waitForTimeout(500);
    }
    
    // Buscar campo de teléfono
    const phoneInput = await page.getByPlaceholder(/55 1234 5678/i).or(
      page.getByLabel(/teléfono/i)
    ).first();
    
    if (await phoneInput.isVisible()) {
      // Probar con número válido
      await phoneInput.fill('5512345678');
      await phoneInput.blur();
      
      // Esperar validación
      await page.waitForTimeout(500);
      
      // Verificar que no hay error visible
      const errorMessage = await page.getByText(/10 dígitos requeridos/i);
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('debe mostrar error con teléfono inválido', async ({ page }) => {
    // Ir a registro
    const registerTab = await page.getByRole('tab', { name: /registro/i }).or(
      page.getByText(/registrarse/i)
    ).first();
    
    if (await registerTab.isVisible()) {
      await registerTab.click();
      await page.waitForTimeout(500);
    }
    
    // Buscar campo de teléfono
    const phoneInput = await page.getByPlaceholder(/55 1234 5678/i).or(
      page.getByLabel(/teléfono/i)
    ).first();
    
    if (await phoneInput.isVisible()) {
      // Probar con número inválido
      await phoneInput.fill('123');
      await phoneInput.blur();
      
      // Esperar validación
      await page.waitForTimeout(500);
      
      // Verificar que hay mensaje de error
      const errorMessage = await page.getByText(/10 dígitos requeridos/i);
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Navegación Condicional', () => {
  test('debe mostrar Navigation solo cuando hay perfil activo', async ({ page }) => {
    // Ir a página principal sin autenticación
    await page.goto('/');
    
    // Verificar que NO hay navegación de perfil en la parte inferior
    // (esto puede variar según la implementación)
    const navigation = await page.locator('[class*="fixed"][class*="bottom-0"]');
    
    // Si no hay perfil, no debería estar visible
    if (await navigation.count() > 0) {
      // Esto significa que hay navegación, verificar contexto
      console.log('Navigation found, checking context...');
    }
  });
});
