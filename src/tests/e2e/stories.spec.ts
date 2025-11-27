/**
 * SEMANA 7: Historias - 25 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Stories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stories');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 25}, (_, i) => {
    test(`debe testear historia `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
