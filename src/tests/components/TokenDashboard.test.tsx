import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TokenDashboard from '@/components/tokens/TokenDashboard';

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
    renderWithRouter(<TokenDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });
  });

  test('debe mostrar historial de transacciones', async () => {
    renderWithRouter(<TokenDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Conexión exitosa')).toBeInTheDocument();
      expect(screen.getByText('Mensaje premium')).toBeInTheDocument();
    });
  });

  test('debe ser responsive para móvil', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<TokenDashboard />);
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('container');
  });
});
