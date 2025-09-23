import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest';
import EditProfileSingle from '@/pages/EditProfileSingle';

// Mock de hooks y servicios
vi.mock('@/lib/data', () => ({
  generateMockSingle: () => ({
    id: 'mock-single-1',
    first_name: 'Ana',
    last_name: 'García',
    age: 28,
    bio: 'Bio de prueba',
    location: 'Ciudad de México',
    profession: 'Diseñadora',
    interests: ['Arte', 'Música'],
    avatar: '/placeholder.svg'
  })
}));

vi.mock('@/hooks/useProfileTheme', () => ({
  useDemoThemeConfig: () => ({
    demoTheme: 'default',
    setDemoTheme: vi.fn(),
    navbarStyle: 'modern',
    setNavbarStyle: vi.fn()
  }),
  useProfileTheme: () => ({
    backgroundClass: 'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900',
    textClass: 'text-white'
  }),
  getNavbarStyles: () => ({})
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

describe('EditProfileSingle', () => {
  beforeEach(() => {
    localStorage.setItem('demo_authenticated', 'true');
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-user-1',
      first_name: 'Ana',
      accountType: 'single'
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('debe cargar y mostrar el formulario de edición', async () => {
    renderWithRouter(<EditProfileSingle />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Ana García')).toBeInTheDocument();
    expect(screen.getByDisplayValue('28')).toBeInTheDocument();
  });

  test('debe permitir editar campos del formulario', async () => {
    renderWithRouter(<EditProfileSingle />);
    
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Ana García');
      fireEvent.change(nameInput, { target: { value: 'Ana María García' } });
      expect(nameInput).toHaveValue('Ana María García');
    });
  });

  test('debe mostrar botón de guardar habilitado', async () => {
    renderWithRouter(<EditProfileSingle />);
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).not.toBeDisabled();
    });
  });

  test('debe ser responsive para diferentes tamaños de pantalla', () => {
    // Simular tablet
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    renderWithRouter(<EditProfileSingle />);
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('container', 'mx-auto');
  });

  test('debe manejar intereses correctamente', async () => {
    renderWithRouter(<EditProfileSingle />);
    
    await waitFor(() => {
      expect(screen.getByText('Arte')).toBeInTheDocument();
      expect(screen.getByText('Música')).toBeInTheDocument();
    });
  });

  test('debe mostrar mensaje de éxito al guardar en modo demo', async () => {
    renderWithRouter(<EditProfileSingle />);
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/modo demo/i)).toBeInTheDocument();
    });
  });
});
