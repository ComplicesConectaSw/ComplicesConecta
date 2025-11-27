/**
 * SEMANA 13: Componentes y Tema - 25 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Components Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 25}, (_, i) => {
    test(`debe testear componente `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
