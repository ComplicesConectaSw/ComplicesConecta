// Playwright setup para ComplicesConecta v3.0.0
// Configuración global para tests E2E

import { test as base } from '@playwright/test';

// Mock hCaptcha globalmente para todos los tests
export const test = base.extend({
  page: async ({ page }, use) => {
    // Interceptar y mockear hCaptcha antes de cada test
    await page.addInitScript(() => {
      // Mock hCaptcha API
      (window as any).hcaptcha = {
        render: (_container: string | HTMLElement, _config: Record<string, unknown>) => {
          console.log('hCaptcha mock: render called');
          return 'mock-widget-id';
        },
        execute: async (_widgetId: string) => {
          console.log('hCaptcha mock: execute called');
          return 'mock-captcha-token';
        },
        reset: (_widgetId?: string) => {
          console.log('hCaptcha mock: reset called');
        },
        remove: (_widgetId: string) => {
          console.log('hCaptcha mock: remove called');
        },
        getResponse: (_widgetId?: string) => {
          console.log('hCaptcha mock: getResponse called');
          return 'mock-captcha-response';
        }
      };
    });

    // Interceptar requests a hCaptcha API
    await page.route('**/api.js*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.hcaptcha = {
            render: () => 'mock-widget-id',
            execute: () => Promise.resolve('mock-token'),
            reset: () => {},
            remove: () => {},
            getResponse: () => 'mock-response'
          };
        `
      });
    });

    // Interceptar requests de verificación hCaptcha
    await page.route('**/siteverify*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          challenge_ts: new Date().toISOString(),
          hostname: 'localhost'
        })
      });
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';
