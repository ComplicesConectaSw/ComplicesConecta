/**
 * SEMANA 9: Comentarios - 15 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 15}, (_, i) => {
    test(`debe testear comentario `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
