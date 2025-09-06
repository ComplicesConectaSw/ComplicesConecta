import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
    })),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialización', () => {
    it('debe inicializar con estado por defecto', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.profile).toBeNull();
      expect(result.current.state.loading).toBe(true);
      expect(result.current.state.isAuthenticated).toBe(false);
    });

    it('debe detectar sesión demo desde localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo_authenticated') return 'true';
        if (key === 'demo_user') return JSON.stringify({
          id: 'demo-123',
          email: 'demo@test.com',
          accountType: 'single'
        });
        return null;
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isDemoSession()).toBe(true);
    });
  });

  describe('Autenticación con Email/Password', () => {
    it('debe manejar login exitoso', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {}
      };

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      } as any);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('debe manejar error de login', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signIn('wrong@email.com', 'wrongpass');
        expect(response.error).toBeTruthy();
      });
    });
  });

  describe('Registro de Usuario', () => {
    it('debe manejar registro exitoso', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        user_metadata: {}
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [{ id: 'profile-123' }],
          error: null
        })
      } as any);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signUp({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          accountType: 'single'
        });
        expect(response.error).toBeFalsy();
      });
    });
  });

  describe('Gestión de Roles', () => {
    it('debe identificar correctamente admin', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.state.profile = {
          id: 'admin-123',
          role: 'admin',
          first_name: 'Admin',
          last_name: 'User'
        } as any;
      });

      expect(result.current.isAdmin()).toBe(true);
    });

    it('debe identificar correctamente usuario regular', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.state.profile = {
          id: 'user-123',
          role: 'user',
          first_name: 'Regular',
          last_name: 'User'
        } as any;
      });

      expect(result.current.isAdmin()).toBe(false);
    });

    it('debe identificar perfil demo', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.state.profile = {
          id: 'demo-123',
          role: 'demo',
          is_demo: true,
          first_name: 'Demo',
          last_name: 'User'
        } as any;
      });

      expect(result.current.isDemoProfile()).toBe(true);
    });
  });

  describe('Logout', () => {
    it('debe limpiar estado al hacer logout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      });

      const { result } = renderHook(() => useAuth());

      // Simular usuario logueado
      act(() => {
        result.current.state.user = { id: 'user-123' } as any;
        result.current.state.profile = { id: 'profile-123' } as any;
        result.current.state.isAuthenticated = true;
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.profile).toBeNull();
      expect(result.current.state.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_session');
    });
  });

  describe('Sesión Demo', () => {
    it('debe configurar sesión demo correctamente', () => {
      const { result } = renderHook(() => useAuth());

      const demoUser = {
        id: 'demo-single',
        email: 'single@outlook.es',
        accountType: 'single',
        firstName: 'Demo',
        lastName: 'Single'
      };

      act(() => {
        result.current.setDemoSession(demoUser);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_authenticated', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_user', JSON.stringify(demoUser));
      expect(result.current.isDemoSession()).toBe(true);
    });

    it('debe limpiar sesión demo', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearDemoSession();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_authenticated');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_session');
    });
  });

  describe('Validación de Email', () => {
    it('debe validar formato de email correctamente', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.validateEmail('test@example.com')).toBe(true);
      expect(result.current.validateEmail('invalid-email')).toBe(false);
      expect(result.current.validateEmail('')).toBe(false);
      expect(result.current.validateEmail('test@')).toBe(false);
    });
  });

  describe('Tipos de Perfil', () => {
    it('debe identificar perfil single', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.state.profile = {
          id: 'single-123',
          profile_type: 'single'
        } as any;
      });

      expect(result.current.getProfileType()).toBe('single');
    });

    it('debe identificar perfil couple', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.state.profile = {
          id: 'couple-123',
          profile_type: 'couple'
        } as any;
      });

      expect(result.current.getProfileType()).toBe('couple');
    });
  });
});
