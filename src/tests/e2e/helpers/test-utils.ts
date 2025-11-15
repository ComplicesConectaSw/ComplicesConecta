/**
 * Test utilities para E2E con Playwright
 * Fecha: 15 Noviembre 2025
 * Propósito: Funciones helper para tests E2E
 */

import { Page, expect } from '@playwright/test';

/**
 * Espera a que la página esté completamente cargada
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Navega a una ruta y espera carga completa
 */
export async function navigateAndWait(page: Page, path: string) {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Simula login demo
 */
export async function loginDemo(page: Page, type: 'single' | 'couple' = 'single') {
  await navigateAndWait(page, '/demo');
  
  const buttonText = type === 'single' ? /explorar como single/i : /explorar como pareja/i;
  const button = await page.getByRole('button', { name: buttonText }).first();
  
  if (await button.isVisible()) {
    await button.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Verifica que un elemento esté visible con timeout
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  const element = await page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
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
 * Espera a que desaparezca un loader
 */
export async function waitForLoader(page: Page, timeout = 30000) {
  const loader = await page.locator('[class*="loading"], [class*="spinner"]');
  
  if (await loader.count() > 0) {
    await expect(loader).not.toBeVisible({ timeout });
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
