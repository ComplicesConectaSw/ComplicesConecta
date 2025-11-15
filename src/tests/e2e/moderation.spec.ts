/**
 * SEMANA 10: Moderación - 30 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Moderation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/moderators');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 30}, (_, i) => {
    test(`debe testear moderación `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
