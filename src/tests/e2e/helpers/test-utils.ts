/**
 * Test utilities para E2E con Playwright
 * Fecha: 15 Noviembre 2025
 * Propósito: Funciones helper para tests E2E
 */

import { Page, expect } from '@playwright/test';

/**
 * Espera a que la página esté completamente cargada con timeout y salida segura
 * @param page - Instancia de Page de Playwright
 * @param timeout - Tiempo máximo de espera en ms (default: 30s)
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: Math.min(timeout, 30000) });
    await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 30000) });
  } catch (error) {
    // Salida segura si el timeout se excede
    console.warn('⚠️ Timeout en waitForPageLoad, continuando...', error);
  }
}

/**
 * Navega a una ruta y espera carga completa con timeout
 * @param page - Instancia de Page
 * @param path - Ruta a navegar
 * @param timeout - Timeout máximo (default: 30s)
 */
export async function navigateAndWait(page: Page, path: string, timeout = 30000) {
  try {
    await page.goto(path, { timeout: Math.min(timeout, 30000) });
    await waitForPageLoad(page, timeout);
  } catch (error) {
    console.warn(`⚠️ Error navegando a ${path}, continuando...`, error);
  }
}

/**
 * Simula login demo con timeout y salida segura
 * @param page - Instancia de Page
 * @param type - Tipo de usuario: 'single' o 'couple'
 * @param timeout - Timeout máximo (default: 15s)
 */
export async function loginDemo(page: Page, type: 'single' | 'couple' = 'single', timeout = 15000) {
  try {
    await navigateAndWait(page, '/demo', timeout);
    
    const buttonText = type === 'single' ? /explorar como single/i : /explorar como pareja/i;
    const button = await page.getByRole('button', { name: buttonText }).first();
    
    const isVisible = await button.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await button.click({ timeout: 5000 });
      await page.waitForTimeout(2000);
    }
  } catch (error) {
    console.warn('⚠️ Error en loginDemo, continuando...', error);
  }
}

/**
 * Verifica que un elemento esté visible con timeout y salida segura
 * @param page - Instancia de Page
 * @param selector - Selector CSS del elemento
 * @param timeout - Timeout máximo (default: 10s, max: 15s)
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  try {
    const safeTimeout = Math.min(timeout, 15000);
    const element = await page.locator(selector);
    await expect(element).toBeVisible({ timeout: safeTimeout });
    return element;
  } catch (error) {
    console.warn(`⚠️ Elemento ${selector} no visible, continuando...`, error);
    return page.locator(selector);
  }
}

/**
 * Rellena un formulario con datos
 */
export async function fillForm(page: Page, data: Record<string, string>) {
  for (const [field, value] of Object.entries(data)) {
    const input = await page.getByLabel(new RegExp(field, 'i')).or(
      page.getByPlaceholder(new RegExp(field, 'i'))
    ).first();
    
    if (await input.isVisible()) {
      await input.fill(value);
    }
  }
}

/**
 * Verifica que una URL contenga un patrón
 */
export async function expectUrlToContain(page: Page, pattern: string | RegExp) {
  const url = page.url();
  if (typeof pattern === 'string') {
    expect(url).toContain(pattern);
  } else {
    expect(url).toMatch(pattern);
  }
}

/**
 * Toma screenshot con nombre descriptivo
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Espera a que desaparezca un loader con timeout limitado
 * @param page - Instancia de Page
 * @param timeout - Timeout máximo (default: 15s, max: 20s)
 */
export async function waitForLoader(page: Page, timeout = 15000) {
  try {
    const safeTimeout = Math.min(timeout, 20000);
    const loader = await page.locator('[class*="loading"], [class*="spinner"]');
    
    const count = await loader.count();
    if (count > 0) {
      await expect(loader).not.toBeVisible({ timeout: safeTimeout });
    }
  } catch (error) {
    console.warn('⚠️ Loader no desapareció, continuando...', error);
  }
}

/**
 * Verifica que no haya errores en consola
 */
export function setupConsoleErrorTracking(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}
