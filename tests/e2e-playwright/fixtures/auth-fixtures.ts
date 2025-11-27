/**
 * Fixtures de autenticación para tests E2E
 * Usuarios conocidos y controlados para testing
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  profile: {
    id: string;
    name: string;
    type: 'single' | 'couple' | 'admin';
    age?: number;
    location?: string;
    verified: boolean;
    role?: string;
    permissions?: string[];
    partner_name?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

/**
 * Usuario Single para tests
 */
export const SINGLE_TEST_USER: TestUser = {
  id: 'single-test-user-001',
  email: 'single@test.com',
  password: 'TestPassword123!',
  profile: {
    id: 'single-profile-001',
    name: 'Usuario Single Test',
    type: 'single',
    age: 25,
    location: 'Ciudad de Prueba',
    verified: true
  },
  session: {
    access_token: 'mock-single-token-12345',
    refresh_token: 'mock-single-refresh-12345',
    expires_at: Date.now() + 3600000 // 1 hora
  }
};

/**
 * Usuario Couple para tests
 */
export const COUPLE_TEST_USER: TestUser = {
  id: 'couple-test-user-001',
  email: 'couple@test.com',
  password: 'TestPassword123!',
  profile: {
    id: 'couple-profile-001',
    name: 'Pareja Test',
    type: 'couple',
    age: 30,
    location: 'Ciudad de Prueba',
    verified: true,
    partner_name: 'Compañero/a Test'
  },
  session: {
    access_token: 'mock-couple-token-12345',
    refresh_token: 'mock-couple-refresh-12345',
    expires_at: Date.now() + 3600000
  }
};

/**
 * Usuario Admin para tests
 */
export const ADMIN_TEST_USER: TestUser = {
  id: 'admin-test-user-001',
  email: 'admin@test.com',
  password: 'AdminPassword123!',
  profile: {
    id: 'admin-profile-001',
    name: 'Administrador Test',
    type: 'admin',
    verified: true,
    role: 'administrator',
    permissions: ['read', 'write', 'delete', 'admin', 'moderate']
  },
  session: {
    access_token: 'mock-admin-token-12345',
    refresh_token: 'mock-admin-refresh-12345',
    expires_at: Date.now() + 3600000
  }
};

/**
 * Usuario Single no verificado para tests de verificación
 */
export const UNVERIFIED_SINGLE_USER: TestUser = {
  id: 'unverified-single-001',
  email: 'unverified@test.com',
  password: 'TestPassword123!',
  profile: {
    id: 'unverified-profile-001',
    name: 'Usuario No Verificado',
    type: 'single',
    age: 22,
    location: 'Ciudad de Prueba',
    verified: false
  },
  session: {
    access_token: 'mock-unverified-token-12345',
    refresh_token: 'mock-unverified-refresh-12345',
    expires_at: Date.now() + 3600000
  }
};

/**
 * Credenciales de demo mode
 */
export const DEMO_CREDENTIALS = {
  single: {
    email: 'single@outlook.es',
    password: 'demo123'
  },
  couple: {
    email: 'pareja@outlook.es', 
    password: 'demo123'
  }
};

/**
 * Datos mock para respuestas de API
 */
export const MOCK_API_RESPONSES = {
  authSuccess: {
    data: {
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        confirmed_at: new Date().toISOString()
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600
      }
    },
    error: null
  },
  
  authError: {
    data: { user: null, session: null },
    error: {
      message: 'Invalid login credentials',
      status: 400
    }
  },
  
  profileSuccess: {
    data: [
      {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        name: 'Test User',
        type: 'single',
        verified: true
      }
    ],
    error: null
  }
};

/**
 * Estados de localStorage para diferentes escenarios
 */
export const STORAGE_STATES = {
  authenticated: {
    'supabase.auth.token': JSON.stringify(SINGLE_TEST_USER.session),
    'user-profile': JSON.stringify(SINGLE_TEST_USER.profile),
    'auth-mode': 'demo'
  },
  
  unauthenticated: {},
  
  admin: {
    'supabase.auth.token': JSON.stringify(ADMIN_TEST_USER.session),
    'user-profile': JSON.stringify(ADMIN_TEST_USER.profile),
    'auth-mode': 'real',
    'admin-session': 'true'
  }
};

/**
 * Configuraciones de test por tipo de usuario
 */
export const TEST_CONFIGS = {
  single: {
    user: SINGLE_TEST_USER,
    expectedRoutes: ['/dashboard', '/profile', '/matches', '/chat'],
    restrictedRoutes: ['/admin']
  },
  
  couple: {
    user: COUPLE_TEST_USER,
    expectedRoutes: ['/dashboard', '/profile', '/matches', '/chat'],
    restrictedRoutes: ['/admin']
  },
  
  admin: {
    user: ADMIN_TEST_USER,
    expectedRoutes: ['/dashboard', '/profile', '/admin', '/reports'],
    restrictedRoutes: []
  }
};
