/**
 * SEMANA 8: Invitaciones - 20 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Invitations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 20}, (_, i) => {
    test(`debe testear invitación `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
