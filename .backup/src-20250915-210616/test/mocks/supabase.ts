import { vi } from 'vitest';

// Mock Supabase client for tests
export const createMockSupabaseClient = () => {
  const mockAuth = {
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
  };

  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    })
  });

  return {
    auth: mockAuth,
    from: mockFrom
  };
};

// Global mock for @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient())
}));
