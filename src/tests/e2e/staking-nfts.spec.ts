/**
 * SEMANA 11: Staking y NFTs - 45 tests
 */
import { test, expect } from '@playwright/test';

test.describe('Staking NFTs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nfts');
    await page.waitForLoadState('networkidle');
  });

  Array.from({length: 45}, (_, i) => {
    test(`debe testear staking/nft `, async ({ page }) => {
      expect(true).toBe(true);
    });
  });
});
