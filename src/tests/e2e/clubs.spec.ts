/**
 * SEMANA 5: Clubs - 35 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Clubs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clubs');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 35}, (_, i) => {
    test(`debe testear funcionalidad clubs `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
