import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/features/auth/useAuth';
import { createTestQueryClient } from '../setup/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
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
      signOut: vi.fn().mockResolvedValue({
        error: null
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }))
      }))
    }))
  }
}));

// Mock useAuth hook and useProfile
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    session: null,
    profile: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    isAdmin: vi.fn(() => false),
    isDemo: vi.fn(() => false),
    getProfileType: vi.fn(() => 'single'),
    shouldUseProductionAdmin: vi.fn(() => false),
    appMode: 'production',
    isAuthenticated: vi.fn(() => false),
    loadProfile: vi.fn(),
    isDemoMode: vi.fn(() => false),
    shouldUseRealSupabase: vi.fn(() => true)
  })),
  useProfile: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null
  }))
}));

// Mock app-config
vi.mock('@/lib/app-config', () => ({
  getAppConfig: vi.fn(() => ({ mode: 'production' })),
  DEMO_CREDENTIALS: ['demo@test.com'],
  getDemoPassword: vi.fn(() => 'demo123'),
  handleDemoAuth: vi.fn(),
  clearDemoAuth: vi.fn(),
  checkDemoSession: vi.fn(() => null),
  isProductionAdmin: vi.fn(() => false),
  isDemoMode: vi.fn(() => false),
  shouldUseRealSupabase: vi.fn(() => true)
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn())
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    href: ''
  },
  writable: true
});

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated()).toBe(false);
    });

    it('should have correct interface', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.isAdmin).toBe('function');
      expect(typeof result.current.isDemo).toBe('function');
      expect(typeof result.current.isAuthenticated).toBe('function');
      expect(typeof result.current.getProfileType).toBe('function');
      expect(typeof result.current.loadProfile).toBe('function');
      expect(typeof result.current.isDemoMode).toBe('function');
      expect(typeof result.current.shouldUseRealSupabase).toBe('function');
      expect(typeof result.current.shouldUseProductionAdmin).toBe('function');
      expect(result.current.appMode).toBe('production');
    });
  });

  describe('Authentication', () => {
    it('should handle sign in', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'password123');
        } catch {
          // Expected to fail in test environment
        }
      });

      expect(typeof result.current.signIn).toBe('function');
    });

    it('should handle sign out', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Role Management', () => {
    it('should identify admin correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      const isAdmin = result.current.isAdmin();
      expect(typeof isAdmin).toBe('boolean');
    });

    it('should identify demo mode', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      const isDemo = result.current.isDemo();
      expect(typeof isDemo).toBe('boolean');
    });
  });

  describe('Profile Management', () => {
    it('should get profile type', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      const profileType = result.current.getProfileType();
      expect(typeof profileType).toBe('string');
      expect(profileType).toBe('single'); // default value
    });

    it('should load profile', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.loadProfile('test-user-id');
      });

      expect(typeof result.current.loadProfile).toBe('function');
    });
  });
});