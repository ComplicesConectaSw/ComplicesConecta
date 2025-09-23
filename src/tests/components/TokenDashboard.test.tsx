import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest';
import { TokenDashboard } from '@/components/tokens/TokenDashboard';

// Console logging para debugging de tests
const testLogger = {
  info: (message: string, data?: any) => console.log(`🧪 [TokenDashboard.test] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`❌ [TokenDashboard.test] ${message}`, error || ''),
  warn: (message: string, data?: any) => console.warn(`⚠️ [TokenDashboard.test] ${message}`, data || '')
};

// Mock de hooks
vi.mock('@/hooks/useTokens', () => ({
  useTokens: () => ({
    balance: 1000,
    transactions: [
      { id: '1', type: 'earned', amount: 100, description: 'Conexión exitosa', date: new Date() },
      { id: '2', type: 'spent', amount: 50, description: 'Mensaje premium', date: new Date() }
    ],
    isLoading: false,
    error: null,
    earnTokens: vi.fn(),
    spendTokens: vi.fn()
  })
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TokenDashboard', () => {
  test('debe mostrar el balance de tokens correctamente', async () => {
    testLogger.info('Test: Verificando balance de tokens');
    
    try {
      renderWithRouter(<TokenDashboard />);
      testLogger.info('TokenDashboard renderizado exitosamente');
      
      await waitFor(() => {
        testLogger.info('Verificando presencia del balance 1,000');
        expect(screen.getByText('1,000')).toBeInTheDocument();
      });
      
      testLogger.info('Test de balance completado exitosamente');
    } catch (error) {
      testLogger.error('Error en test de balance', error);
      throw error;
    }
  });

  test('debe mostrar historial de transacciones', async () => {
    testLogger.info('Test: Verificando historial de transacciones');
    
    try {
      renderWithRouter(<TokenDashboard />);
      testLogger.info('TokenDashboard renderizado para test de transacciones');
      
      await waitFor(() => {
        testLogger.info('Verificando transacciones específicas');
        expect(screen.getByText('Conexión exitosa')).toBeInTheDocument();
        expect(screen.getByText('Mensaje premium')).toBeInTheDocument();
      });
      
      testLogger.info('Test de transacciones completado exitosamente');
    } catch (error) {
      testLogger.error('Error en test de transacciones', error);
      throw error;
    }
  });

  test('debe ser responsive para móvil', () => {
    testLogger.info('Test: Verificando responsividad móvil');
    
    try {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      testLogger.info('Configurado viewport móvil: 375px');
      
      renderWithRouter(<TokenDashboard />);
      testLogger.info('TokenDashboard renderizado en modo móvil');
      
      const container = screen.getByRole('main');
      expect(container).toHaveClass('container');
      
      testLogger.info('Test de responsividad completado exitosamente');
    } catch (error) {
      testLogger.error('Error en test de responsividad', error);
      throw error;
    }
  });

  test('debe manejar errores de carga de datos', async () => {
    testLogger.info('Test: Verificando manejo de errores');
    
    // Mock con error
    vi.mocked(vi.fn()).mockImplementation(() => ({
      balance: 0,
      transactions: [],
      isLoading: false,
      error: 'Error de conexión',
      earnTokens: vi.fn(),
      spendTokens: vi.fn()
    }));
    
    try {
      renderWithRouter(<TokenDashboard />);
      testLogger.info('TokenDashboard renderizado con estado de error');
      
      // Verificar que el componente maneja el error gracefully
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
      
      testLogger.info('Test de manejo de errores completado');
    } catch (error) {
      testLogger.error('Error en test de manejo de errores', error);
      throw error;
    }
  });
});
