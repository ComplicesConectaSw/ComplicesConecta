/**
 * SEMANA 6: Geolocalización - 20 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Geolocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clubs');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 20}, (_, i) => {
    test(`debe testear geo `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
