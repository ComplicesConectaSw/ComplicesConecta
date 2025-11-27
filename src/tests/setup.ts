import '@testing-library/jest-dom'
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Import Supabase mock
import './mocks/supabase';
// Import Performance mocks
import './mocks/performance';
// Import TensorFlow mock
import './mocks/tensorflow';

// Mock ThemeProvider para tests
vi.mock('@/components/ui/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'theme-provider' }, children),
  useTheme: () => ({
    theme: 'light' as const,
    setTheme: vi.fn(),
    actualTheme: 'light' as const
  })
}));

// Mock ThemeToggle para tests
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => React.createElement('div', { 'data-testid': 'theme-toggle' }, 'ThemeToggle')
}));

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Configuración global de timeouts para evitar bucles infinitos
const MAX_TEST_TIMEOUT = 10000; // 10 segundos máximo por test
const MAX_WAIT_FOR_TIMEOUT = 5000; // 5 segundos máximo para waitFor
const MAX_RETRIES = 3; // Máximo 3 reintentos

// Configurar timeout global para tests
vi.setConfig({
  testTimeout: MAX_TEST_TIMEOUT,
  hookTimeout: MAX_WAIT_FOR_TIMEOUT,
});

// Helper para waitFor con prevención de bucles
export const safeWaitFor = async (
  callback: () => void | Promise<void>,
  options?: { timeout?: number; maxRetries?: number }
) => {
  const timeout = options?.timeout || MAX_WAIT_FOR_TIMEOUT;
  const maxRetries = options?.maxRetries || MAX_RETRIES;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      await waitFor(callback, { timeout });
      return; // Éxito, salir del loop
    } catch (error) {
      lastError = error as Error;
      retries++;
      if (retries >= maxRetries) {
        throw new Error(
          `waitFor falló después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`
        );
      }
      // Esperar un poco antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

// Helper para validar que un archivo existe antes de importarlo
export const validateFileExists = (filePath: string): boolean => {
  try {
    // En el entorno de tests, validamos que el path sea válido
    if (!filePath || filePath.includes('undefined') || filePath.includes('null')) {
      console.warn(`⚠️ [Test] Ruta inválida detectada: ${filePath}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`❌ [Test] Error validando archivo: ${filePath}`, error);
    return false;
  }
};

// Helper para prevenir bucles infinitos en tests
export const preventInfiniteLoop = (maxIterations: number = 100) => {
  let iterations = 0;
  return {
    check: () => {
      iterations++;
      if (iterations > maxIterations) {
        throw new Error(`⚠️ [Test] Prevención de bucle infinito: ${maxIterations} iteraciones alcanzadas`);
      }
      return iterations;
    },
    reset: () => {
      iterations = 0;
    }
  };
};

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  // Limpiar timeouts pendientes
  vi.clearAllTimers();
});

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Resetear timers
  vi.useFakeTimers();
});

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
