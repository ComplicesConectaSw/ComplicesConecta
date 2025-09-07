// ✅ Validado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock app-config functions
const mockHandleDemoAuth = vi.fn();
const mockClearDemoAuth = vi.fn();
const mockCheckDemoSession = vi.fn();

vi.mock('@/lib/app-config', () => ({
  handleDemoAuth: mockHandleDemoAuth,
  clearDemoAuth: mockClearDemoAuth,
  checkDemoSession: mockCheckDemoSession
}));

// Mock supabase client
const mockSupabaseClient = {
  auth: {
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useAuth - Lógica Demo Centralizada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('debe usar checkDemoSession de app-config al inicializar', () => {
    mockCheckDemoSession.mockReturnValue({
      user: { id: 'demo-1', email: 'demo@example.com', role: 'user' }
    });

    const { result } = renderHook(() => useAuth());

    expect(mockCheckDemoSession).toHaveBeenCalled();
    expect(result.current.user).toEqual({
      id: 'demo-1',
      email: 'demo@example.com',
      role: 'user'
    });
    console.info("🔐 DemoAuth validado para usuario: demo@example.com");
  });

  it('debe usar handleDemoAuth al crear sesión demo', () => {
    const mockDemoUser = {
      id: 'demo-2',
      email: 'admin@demo.com',
      role: 'admin'
    };

    mockHandleDemoAuth.mockReturnValue({
      user: mockDemoUser
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.setDemoSession('admin', mockDemoUser);
    });

    expect(mockHandleDemoAuth).toHaveBeenCalledWith('admin@demo.com');
    expect(result.current.user).toEqual(mockDemoUser);
    console.info("🔐 DemoAuth creado para usuario: admin@demo.com");
  });

  it('debe usar clearDemoAuth al cerrar sesión', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockClearDemoAuth).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    console.info("🔐 DemoAuth limpiado correctamente");
  });

  it('debe manejar autenticación real cuando no hay demo', async () => {
    mockCheckDemoSession.mockReturnValue(null);
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'real-1', email: 'real@example.com' } },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    const loginResult = await act(async () => {
      return await result.current.signIn('real@example.com', 'password123');
    });

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'real@example.com',
      password: 'password123'
    });
    expect(loginResult.error).toBeNull();
    console.info("🔐 Autenticación real exitosa para: real@example.com");
  });

  it('debe validar emails correctamente', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.validateEmail('valid@example.com')).toBe(true);
    expect(result.current.validateEmail('invalid-email')).toBe(false);
    expect(result.current.validateEmail('')).toBe(false);
    expect(result.current.validateEmail('test@')).toBe(false);
    expect(result.current.validateEmail('@example.com')).toBe(false);
  });

  it('debe detectar correctamente si es sesión demo', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'demo_user') return JSON.stringify({ id: 'demo-1' });
      if (key === 'demo_session') return 'true';
      return null;
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isDemoSession()).toBe(true);
  });

  it('debe manejar errores de autenticación correctamente', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });

    const { result } = renderHook(() => useAuth());

    const loginResult = await act(async () => {
      return await result.current.signIn('wrong@example.com', 'wrongpass');
    });

    expect(loginResult.error).toEqual({ message: 'Invalid credentials' });
    console.error("❌ Error en autenticación:", 'Invalid credentials');
  });

  it('debe resetear contraseña correctamente', async () => {
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null
    });

    const { result } = renderHook(() => useAuth());

    const resetResult = await act(async () => {
      return await result.current.resetPassword('user@example.com');
    });

    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com');
    expect(resetResult.error).toBeNull();
  });

  it('debe actualizar contraseña correctamente', async () => {
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    const updateResult = await act(async () => {
      return await result.current.updatePassword('newpassword123');
    });

    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    expect(updateResult.error).toBeNull();
  });

  it('debe registrar nuevo usuario correctamente', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-1', email: 'new@example.com' } },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    const signUpResult = await act(async () => {
      return await result.current.signUp('new@example.com', 'password123', { name: 'Test User' });
    });

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: {
        data: { name: 'Test User' }
      }
    });
    expect(signUpResult.error).toBeNull();
  });
});
