import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest';
import ProfileSingle from '@/pages/ProfileSingle';

// Mock de hooks y servicios
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-1', email: 'test@example.com' },
    profile: { id: 'test-profile-1', is_demo: true },
    isAuthenticated: true
  })
}));

vi.mock('@/hooks/useProfileQuery', () => ({
  useProfileQuery: () => ({
    data: null,
    isLoading: false,
    error: null
  })
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProfileSingle', () => {
  beforeEach(() => {
    // Configurar localStorage para modo demo
    localStorage.setItem('demo_authenticated', 'true');
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-user-1',
      first_name: 'Sofía',
      accountType: 'single'
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('debe cargar el perfil demo correctamente', async () => {
    renderWithRouter(<ProfileSingle />);
    
    await waitFor(() => {
      expect(screen.getByText('Sofía')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Explorando nuevas conexiones/)).toBeInTheDocument();
    expect(screen.getByText('Ciudad de México, México')).toBeInTheDocument();
  });

  test('debe mostrar la edad correcta', async () => {
    renderWithRouter(<ProfileSingle />);
    
    await waitFor(() => {
      expect(screen.getByText('28 años')).toBeInTheDocument();
    });
  });

  test('debe mostrar los intereses del perfil', async () => {
    renderWithRouter(<ProfileSingle />);
    
    await waitFor(() => {
      expect(screen.getByText('Viajes')).toBeInTheDocument();
      expect(screen.getByText('Música')).toBeInTheDocument();
      expect(screen.getByText('Arte')).toBeInTheDocument();
    });
  });

  test('debe ser responsive en móvil', () => {
    // Simular viewport móvil
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<ProfileSingle />);
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4');
  });

  test('debe manejar errores de carga gracefully', async () => {
    // Simular error en localStorage
    localStorage.removeItem('demo_user');
    
    renderWithRouter(<ProfileSingle />);
    
    // Debe seguir renderizando sin crashear
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
