import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración dedicada para tests E2E con entorno aislado
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e-playwright',
  
  /* Configuración de paralelismo optimizada para E2E */
  fullyParallel: false, // Deshabilitado para evitar conflictos de estado
  workers: 1, // Un worker para garantizar aislamiento
  
  /* Configuración de reintentos y CI */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Un reintento en desarrollo
  
  /* Reporter optimizado para debugging */
  reporter: [
    ['html', { outputFolder: 'playwright-report-e2e' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['list']
  ],
  
  /* Configuración global para tests E2E */
  use: {
    /* Base URL dedicada para tests */
    baseURL: 'http://localhost:4173',
    
    /* Timeouts optimizados para E2E */
    actionTimeout: 15000, // 15 segundos para acciones
    navigationTimeout: 30000, // 30 segundos para navegación
    
    /* Configuración de trazas y screenshots */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Headers para compatibilidad */
    extraHTTPHeaders: {
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'X-Test-Mode': 'e2e'
    },
    
    /* Configuración de viewport estándar */
    viewport: { width: 1280, height: 720 },
    
    /* Configuración de contexto aislado */
    storageState: undefined, // Sin estado persistente entre tests
  },

  /* Proyectos optimizados para E2E */
  projects: [
    {
      name: 'e2e-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para E2E
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox'
          ]
        }
      },
    },
    // Proyecto adicional para Firefox solo en CI
    ...(process.env.CI ? [{
      name: 'e2e-firefox',
      use: { ...devices['Desktop Firefox'] },
    }] : [])
  ],

  /* Configuración del servidor web para E2E */
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos
    env: {
      NODE_ENV: 'test', // Entorno dedicado para tests
      VITE_MOCK_MODE: 'true', // Activar mocks
      VITE_SKIP_REAL_AUTH: 'true', // Saltar autenticación real
    },
  },

  /* Configuración global de timeouts */
  timeout: 60000, // 1 minuto por test
  expect: {
    timeout: 10000, // 10 segundos para assertions
  },

  /* Configuración de archivos de setup */
  globalSetup: './tests/e2e-playwright/setup/global-setup.ts',
  globalTeardown: './tests/e2e-playwright/setup/global-teardown.ts',
});
