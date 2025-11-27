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

  // Helper function para crear una cadena de query builder mockeada
  const createQueryBuilder = (mockData: any = null, isCountQuery: boolean = false) => {
    // Determinar datos de respuesta según el tipo de query
    let responseData: any;
    if (isCountQuery) {
      // Para queries de count, retornar estructura con count
      responseData = {
        count: Array.isArray(mockData) ? mockData.length : (mockData ? 1 : 0),
        error: null
      };
    } else {
      // Para queries normales, retornar estructura con data
      responseData = {
        data: mockData,
        error: null
      };
    }

    // Crear una Promise que se resuelve con los datos mock
    const resolvedPromise = Promise.resolve(responseData);

    // Crear objeto base primero
    const queryChain: any = {
      // Internal flags
      _isCountQuery: isCountQuery,
      _responseData: responseData,
      _resolvedPromise: resolvedPromise
    };

    // Asignar métodos que necesitan referenciar queryChain
    queryChain.select = vi.fn((columns?: string, options?: { count?: string; head?: boolean }) => {
      if (options?.count) {
        // Es una query de count
        queryChain._isCountQuery = true;
        queryChain._responseData = {
          count: Array.isArray(mockData) ? mockData.length : (mockData ? 1 : 0),
          error: null
        };
        queryChain._resolvedPromise = Promise.resolve(queryChain._responseData);
      }
      return queryChain;
    });

    // Filter methods - todos retornan la misma cadena para permitir chaining
    queryChain.eq = vi.fn().mockReturnValue(queryChain);
    queryChain.neq = vi.fn().mockReturnValue(queryChain);
    queryChain.gt = vi.fn().mockReturnValue(queryChain);
    queryChain.gte = vi.fn().mockReturnValue(queryChain);
    queryChain.lt = vi.fn().mockReturnValue(queryChain);
    queryChain.lte = vi.fn().mockReturnValue(queryChain);
    queryChain.like = vi.fn().mockReturnValue(queryChain);
    queryChain.ilike = vi.fn().mockReturnValue(queryChain);
    queryChain.is = vi.fn().mockReturnValue(queryChain);
    queryChain.in = vi.fn().mockReturnValue(queryChain);
    queryChain.contains = vi.fn().mockReturnValue(queryChain);
    queryChain.containedBy = vi.fn().mockReturnValue(queryChain);
    queryChain.rangeGt = vi.fn().mockReturnValue(queryChain);
    queryChain.rangeGte = vi.fn().mockReturnValue(queryChain);
    queryChain.rangeLt = vi.fn().mockReturnValue(queryChain);
    queryChain.rangeLte = vi.fn().mockReturnValue(queryChain);
    queryChain.rangeAdjacent = vi.fn().mockReturnValue(queryChain);
    queryChain.overlaps = vi.fn().mockReturnValue(queryChain);
    queryChain.textSearch = vi.fn().mockReturnValue(queryChain);
    queryChain.match = vi.fn().mockReturnValue(queryChain);
    queryChain.not = vi.fn().mockReturnValue(queryChain);
    queryChain.or = vi.fn().mockReturnValue(queryChain);
    queryChain.filter = vi.fn().mockReturnValue(queryChain);
    
    // Ordering methods
    queryChain.order = vi.fn().mockReturnValue(queryChain);
    queryChain.limit = vi.fn().mockReturnValue(queryChain);
    queryChain.range = vi.fn().mockReturnValue(queryChain);
    
    // Mutation methods
    queryChain.insert = vi.fn().mockReturnValue(queryChain);
    queryChain.update = vi.fn().mockReturnValue(queryChain);
    queryChain.upsert = vi.fn().mockReturnValue(queryChain);
    queryChain.delete = vi.fn().mockReturnValue(queryChain);
    
    // Final execution methods
    queryChain.single = vi.fn().mockResolvedValue({
      data: Array.isArray(mockData) ? mockData[0] : mockData,
      error: null
    });
    queryChain.maybeSingle = vi.fn().mockResolvedValue({
      data: Array.isArray(mockData) ? mockData[0] : mockData,
      error: null
    });
    
    // Implementar Promise-like interface
    queryChain.then = (onResolve?: any, onReject?: any) => {
      const promise = queryChain._resolvedPromise || resolvedPromise;
      return promise.then(onResolve, onReject);
    };
    queryChain.catch = (onReject?: any) => {
      const promise = queryChain._resolvedPromise || resolvedPromise;
      return promise.catch(onReject);
    };
    queryChain.finally = (onFinally?: any) => {
      const promise = queryChain._resolvedPromise || resolvedPromise;
      return promise.finally(onFinally);
    };
    
    // Hacer el objeto thenable (implementar Promise-like interface)
    Object.setPrototypeOf(queryChain, Promise.prototype);
    
    return queryChain;
  };

  // Mock data para AILayerService tests
  const mockProfiles = [
    {
      id: 'test-user-1',
      name: 'Test User 1',
      age: 30,
      gender: 'male',
      interests: [],
      swinger_interests: []
    },
    {
      id: 'test-user-2',
      name: 'Test User 2',
      age: 28,
      gender: 'female',
      interests: [],
      swinger_interests: []
    }
  ];

  const mockFrom = vi.fn((table: string) => {
    // Para AILayerService tests, retornar mock data apropiado
    if (table === 'profiles') {
      return createQueryBuilder(mockProfiles);
    }
    if (table === 'couple_profile_likes' || table === 'story_comments') {
      // Para queries de count, retornar estructura apropiada
      const countBuilder = createQueryBuilder([], true);
      // Override select para detectar queries de count
      countBuilder.select = vi.fn((columns?: string, options?: { count?: string; head?: boolean }) => {
        if (options?.count) {
          countBuilder._responseData = { count: 0, error: null };
          countBuilder._resolvedPromise = Promise.resolve(countBuilder._responseData);
        } else {
          countBuilder._responseData = { data: [], error: null };
          countBuilder._resolvedPromise = Promise.resolve(countBuilder._responseData);
        }
        return countBuilder;
      });
      return countBuilder;
    }
    // Para compatibility_predictions (tabla de logs)
    if (table === 'compatibility_predictions') {
      const insertBuilder = createQueryBuilder(null);
      insertBuilder.select = vi.fn().mockReturnValue(insertBuilder);
      return insertBuilder;
    }
    // Default mock
    return createQueryBuilder([]);
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
