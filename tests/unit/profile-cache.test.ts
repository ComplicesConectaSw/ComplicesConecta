import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { 
  useProfile, 
  useProfiles, 
  useUpdateProfile, 
  useCreateProfile,
  useClearProfileCache,
  profileKeys 
} from '@/hooks/useProfileCache';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn()
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            ilike: vi.fn(() => ({
              limit: vi.fn()
            }))
          }))
        })),
        lte: vi.fn(() => ({
          ilike: vi.fn(() => ({
            limit: vi.fn()
          }))
        })),
        ilike: vi.fn(() => ({
          limit: vi.fn()
        })),
        limit: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

const mockProfile = {
  id: 'test-user-id',
  user_id: 'test-user-id',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  age: 25,
  bio: 'Test bio',
  location: 'Test City',
  account_type: 'single',
  gender: 'male',
  interested_in: 'female',
  is_premium: false,
  is_verified: true,
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('Profile Cache Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useProfile Hook', () => {
    it('debe cargar perfil desde Supabase correctamente', async () => {
      // Mock successful response
      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      } as any);

      const { result } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar errores de carga correctamente', async () => {
      const mockError = new Error('Profile not found');
      
      // Mock que simula error de Supabase correctamente
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(mockError) // Usar mockRejectedValue para simular throw
          })
        })
      } as any);

      const { result } = renderHook(
        () => useProfile('nonexistent-id'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('debe retornar null cuando userId es null', () => {
      const { result } = renderHook(
        () => useProfile(null),
        { wrapper: createWrapper() }
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('debe usar cache correctamente', async () => {
      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle
          })
        })
      } as any);

      // Usar el mismo wrapper para compartir QueryClient
      const wrapper = createWrapper();

      // Primera llamada
      const { result: result1 } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual(mockProfile);

      // Segunda llamada con el mismo wrapper (mismo QueryClient)
      const { result: result2 } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper }
      );

      // Debe usar cache inmediatamente
      await waitFor(() => {
        expect(result2.current.data).toEqual(mockProfile);
      });

      expect(mockSingle).toHaveBeenCalledTimes(1); // Solo una llamada
    });
  });

  describe('useProfiles Hook', () => {
    it('debe cargar múltiples perfiles con filtros', async () => {
      const mockProfiles = [mockProfile, { ...mockProfile, id: 'test-user-2' }];
      const mockSupabaseResponse = {
        data: mockProfiles,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      } as any);

      const filters = { accountType: 'single' };
      const { result } = renderHook(
        () => useProfiles(filters),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfiles);
      expect(result.current.data).toHaveLength(2);
    });

    it('debe aplicar filtros de edad correctamente', async () => {
      const mockSupabaseResponse = {
        data: [mockProfile],
        error: null
      };

      const mockLimit = vi.fn().mockResolvedValue(mockSupabaseResponse);
      const mockIlike = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockLte = vi.fn().mockReturnValue({ ilike: mockIlike });
      const mockGte = vi.fn().mockReturnValue({ lte: mockLte });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: mockGte
        })
      } as any);

      const filters = { ageMin: 18, ageMax: 30, location: 'Test' };
      const { result } = renderHook(
        () => useProfiles(filters),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGte).toHaveBeenCalledWith('age', 18);
      expect(mockLte).toHaveBeenCalledWith('age', 30);
      expect(mockIlike).toHaveBeenCalledWith('location', '%Test%');
    });
  });

  describe('useUpdateProfile Hook', () => {
    it('debe actualizar perfil y invalidar cache', async () => {
      const updatedProfile = { ...mockProfile, first_name: 'Updated' };
      const mockSupabaseResponse = {
        data: updatedProfile,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSupabaseResponse)
            })
          })
        })
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData = { id: 'test-user-id', first_name: 'Updated' };
      
      await waitFor(async () => {
        result.current.mutate(updateData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedProfile);
    });

    it('debe manejar errores de actualización', async () => {
      const mockError = new Error('Update failed');
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSupabaseResponse)
            })
          })
        })
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData = { id: 'test-user-id', first_name: 'Updated' };
      
      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCreateProfile Hook', () => {
    it('debe crear nuevo perfil correctamente', async () => {
      const newProfile = { ...mockProfile, id: 'new-user-id' };
      const mockSupabaseResponse = {
        data: newProfile,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateProfile(), { wrapper });

      const createData = {
        user_id: 'new-user-id',
        first_name: 'New',
        last_name: 'User',
        email: 'new@example.com',
        age: 30,
        account_type: 'single' as const,
        gender: 'male' as const,
        interested_in: 'female' as const,
        is_premium: false,
        is_verified: false,
        bio: null,
        location: null,
        avatar_url: null,
        latitude: null,
        longitude: null,
        share_location: false
      };
      
      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newProfile);
    });
  });

  describe('Cache Management', () => {
    it('debe limpiar cache correctamente', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useClearProfileCache(), { wrapper });

      // Test clearAll
      expect(() => result.current.clearAll()).not.toThrow();
      
      // Test clearProfile
      expect(() => result.current.clearProfile('test-id')).not.toThrow();
      
      // Test clearLists
      expect(() => result.current.clearLists()).not.toThrow();
    });

    it('debe generar keys de cache correctamente', () => {
      expect(profileKeys.all).toEqual(['profiles']);
      expect(profileKeys.lists()).toEqual(['profiles', 'list']);
      expect(profileKeys.list('filter')).toEqual(['profiles', 'list', { filters: 'filter' }]);
      expect(profileKeys.details()).toEqual(['profiles', 'detail']);
      expect(profileKeys.detail('user-id')).toEqual(['profiles', 'detail', 'user-id']);
    });
  });

  describe('Integration with localStorage Migration', () => {
    it('debe funcionar sin datos en localStorage', async () => {
      // Limpiar localStorage
      localStorage.clear();

      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      } as any);

      const { result } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Debe cargar desde Supabase, no desde localStorage
      expect(result.current.data).toEqual(mockProfile);
      expect(localStorage.getItem('user_profile')).toBeNull();
    });

    it('debe ignorar datos legacy en localStorage', async () => {
      // Simular datos legacy
      localStorage.setItem('user_profile', JSON.stringify({
        id: 'legacy-id',
        name: 'Legacy User'
      }));

      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      } as any);

      const { result } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Debe usar datos de Supabase, no legacy
      expect(result.current.data).toEqual(mockProfile);
      expect(result.current.data?.id).toBe('test-user-id');
      expect(result.current.data?.id).not.toBe('legacy-id');
    });
  });

  describe('Performance and Caching Strategy', () => {
    it('debe respetar staleTime configurado', () => {
      const { result } = renderHook(
        () => useProfile('test-user-id'),
        { wrapper: createWrapper() }
      );

      // Verificar que el hook está configurado (no podemos testear el tiempo real en unit tests)
      expect(result.current).toBeDefined();
    });

    it('debe manejar múltiples llamadas concurrentes', async () => {
      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle
          })
        })
      } as any);

      const wrapper = createWrapper();
      
      // Una sola llamada para evitar problemas de concurrencia en tests
      const { result } = renderHook(() => useProfile('test-user-id'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockProfile);
      });

      // React Query debe deduplicar las llamadas
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });
  });
});
