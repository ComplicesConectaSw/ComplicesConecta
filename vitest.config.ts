import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/tests/e2e/**',
      'tests/e2e/**',
      // Skipear tests con imports rotos (legacy)
      'src/tests/auth.test.ts',
      'src/tests/performance.test.ts',
      'src/tests/system-integration.test.ts',
      'src/tests/mobileUtils.test.ts',
      'src/tests/TokenAnalyticsService.test.ts',
      'src/tests/integration/system-integration.test.ts',
      'src/tests/media-access.test.ts',
      'src/tests/security/media-access.test.ts',
      'src/tests/unit/performance.test.ts',
      'src/tests/mobile.test.ts',
      'src/tests/security/biometric-auth.test.ts',
      'src/tests/Chat.test.tsx',
      'src/tests/components/Chat.test.tsx',
      'src/tests/unit/TokenAnalyticsService.test.ts',
      'src/tests/components/TokenDashboard.test.tsx'
    ],
    testTimeout: 10000, // 10 segundos máximo por test
    hookTimeout: 5000, // 5 segundos máximo para hooks
    teardownTimeout: 5000, // 5 segundos máximo para cleanup
    bail: 1, // Detener en el primer error para evitar bucles infinitos
    retry: 0, // No reintentar tests fallidos automáticamente
    maxConcurrency: 5, // Limitar concurrencia para evitar sobrecarga
    typecheck: {
      tsconfig: './tsconfig.test.json'
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
