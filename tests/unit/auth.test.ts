import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/integrations/supabase/client';

// Mock Supabase
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null
      }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        data: {},
        error: null
      }),
      updateUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })),
      })),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      update: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
    })),
  },
  isDemoMode: false
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
      expect(result.current.isAuthenticated()).toBe(false);
    });

    it('debe detectar sesión demo desde localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo_session') return 'true';
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
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: '2023-01-01T00:00:00Z',
        phone: undefined,
        confirmation_sent_at: undefined,
        confirmed_at: undefined,
        last_sign_in_at: undefined,
        role: 'authenticated',
        recovery_sent_at: undefined,
        email_change_sent_at: undefined,
        new_email: undefined,
        invited_at: undefined,
        action_link: undefined,
        email_change: undefined,
        email_change_confirm_status: 0,
        banned_until: undefined,
        new_phone: undefined,
        phone_change: undefined,
        phone_change_token: undefined,
        phone_change_sent_at: undefined,
        phone_confirmed_at: undefined,
        phone_change_confirm_status: 0,
        email_change_token_new: undefined,
        email_change_token_current: undefined,
        factors: undefined
      } as any;

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { 
            access_token: 'token',
            refresh_token: 'refresh_token',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser,
            expires_at: Date.now() + 3600000
          } 
        },
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
        error: { 
          message: 'Invalid credentials',
          code: 'invalid_credentials',
          status: 400,
          name: 'AuthError'
        } as any
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signIn('wrong@email.com', 'wrongpass');
        expect(response).toBeTruthy();
      });
    });
  });

  describe('Registro de Usuario', () => {
    it('debe manejar registro exitoso', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: undefined,
        phone: undefined,
        confirmation_sent_at: '2023-01-01T00:00:00Z',
        confirmed_at: undefined,
        last_sign_in_at: undefined,
        role: 'authenticated',
        recovery_sent_at: undefined,
        email_change_sent_at: undefined,
        new_email: undefined,
        invited_at: undefined,
        action_link: undefined,
        email_change: undefined,
        email_change_confirm_status: 0,
        banned_until: undefined,
        new_phone: undefined,
        phone_change: undefined,
        phone_change_token: undefined,
        phone_change_sent_at: undefined,
        phone_confirmed_at: undefined,
        phone_change_confirm_status: 0,
        email_change_token_new: undefined,
        email_change_token_current: undefined,
        factors: undefined
      } as any;

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
        const response = await result.current.signUp(
          'newuser@example.com',
          'password123',
          {
            firstName: 'New',
            lastName: 'User',
            accountType: 'single'
          }
        );
        expect(response.error).toBeFalsy();
      });
    });
  });

  describe('Gestión de Roles', () => {
    it('debe identificar correctamente admin', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.setTestState({
          profile: {
            id: 'admin-123',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User'
          } as any
        });
      });

      expect(result.current.isAdmin()).toBe(true);
    });

    it('debe identificar correctamente usuario regular', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.setTestState({
          profile: {
            id: 'user-123',
            role: 'user',
            first_name: 'Regular',
            last_name: 'User'
          } as any
        });
      });

      expect(result.current.isAdmin()).toBe(false);
    });

    it('debe identificar perfil demo', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.setTestState({
          profile: {
            id: 'demo-123',
            role: 'demo',
            is_demo: true,
            first_name: 'Demo',
            last_name: 'User'
          } as any
        });
      });

      expect(result.current.isDemo()).toBe(true);
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
        result.current.setTestState({
          user: { id: 'user-123' } as any,
          profile: { id: 'profile-123' } as any
        });
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.profile).toBeNull();
      expect(result.current.isAuthenticated()).toBe(false);
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
        result.current.setDemoSession('single', demoUser);
      });

      // Mock localStorage.getItem to return the values that setDemoSession would set
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo_user') return JSON.stringify(demoUser);
        if (key === 'demo_session') return 'true';
        if (key === 'userType') return 'single';
        return null;
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_session', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo_user', JSON.stringify(demoUser));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userType', 'single');
      expect(result.current.isDemoSession()).toBe(true);
    });

    it('debe limpiar sesión demo', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearDemoSession();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo_session');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userType');
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
        result.current.setTestState({
          profile: {
            id: 'single-123',
            profile_type: 'single'
          } as any
        });
      });

      expect(result.current.getProfileType()).toBe('single');
    });

    it('debe identificar perfil couple', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.setTestState({
          profile: {
            id: 'couple-123',
            profile_type: 'couple'
          } as any
        });
      });

      expect(result.current.getProfileType()).toBe('couple');
    });
  });
});
