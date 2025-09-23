import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Chat from '@/pages/Chat';

// Mock de hooks y servicios
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-1' },
    isAuthenticated: true
  })
}));

vi.mock('@/hooks/useFeatures', () => ({
  useFeatures: () => ({
    features: { chat: true }
  })
}));

vi.mock('@/lib/simpleChatService', () => ({
  simpleChatService: {
    getUserChatRooms: vi.fn().mockResolvedValue({
      success: true,
      publicRooms: [],
      privateRooms: []
    }),
    getRoomMessages: vi.fn().mockResolvedValue({
      success: true,
      messages: []
    }),
    sendMessage: vi.fn().mockResolvedValue({
      success: true,
      message: { id: '1', content: 'Test message', created_at: new Date().toISOString() }
    }),
    subscribeToRoomMessages: vi.fn()
  }
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

describe('Chat', () => {
  beforeEach(() => {
    localStorage.setItem('demo_authenticated', 'true');
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-user-1',
      first_name: 'Usuario'
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('debe cargar la interfaz de chat en modo demo', async () => {
    renderWithRouter(<Chat />);
    
    await waitFor(() => {
      expect(screen.getByText('🔥 Sala General Lifestyle')).toBeInTheDocument();
    });
    
    expect(screen.getByText('💑 Parejas CDMX')).toBeInTheDocument();
    expect(screen.getByText('Anabella & Julio')).toBeInTheDocument();
  });

  test('debe mostrar pestañas de chat privado y público', async () => {
    renderWithRouter(<Chat />);
    
    await waitFor(() => {
      expect(screen.getByText('Privados')).toBeInTheDocument();
      expect(screen.getByText('Públicos')).toBeInTheDocument();
    });
  });

  test('debe permitir cambiar entre pestañas', async () => {
    renderWithRouter(<Chat />);
    
    await waitFor(() => {
      const publicTab = screen.getByText('Públicos');
      fireEvent.click(publicTab);
      expect(screen.getByText('🔥 Sala General Lifestyle')).toBeInTheDocument();
    });
  });

  test('debe ser responsive para móvil', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Chat />);
    
    const container = screen.getByRole('main');
    expect(container).toBeInTheDocument();
  });

  test('debe mostrar estado online de usuarios', async () => {
    renderWithRouter(<Chat />);
    
    await waitFor(() => {
      // Verificar indicadores de estado online
      const onlineIndicators = screen.getAllByTestId('online-indicator');
      expect(onlineIndicators.length).toBeGreaterThan(0);
    });
  });

  test('debe manejar acceso a chats en modo demo', async () => {
    renderWithRouter(<Chat />);
    
    await waitFor(() => {
      const chatItems = screen.getAllByRole('button');
      expect(chatItems.length).toBeGreaterThan(0);
    });
  });

  test('debe ser adaptativo para tablet', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    renderWithRouter(<Chat />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('debe ser compatible con APK nativo', () => {
    // Simular entorno APK
    Object.defineProperty(window, 'ReactNativeWebView', {
      value: {},
      writable: true
    });
    
    renderWithRouter(<Chat />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
