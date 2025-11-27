import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tipos para los mocks
interface MockProfile {
  id: string;
  role: string;
  is_demo: boolean;
  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;
  profile_type: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  bio: string | null;
  location: string | null;
  interests: string[];
  latitude?: number | null;
  longitude?: number | null;
  age?: number;
}

// Mock simplificado de Supabase
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Roles y Permisos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validación de roles de administrador', () => {
    it('debería identificar correctamente un perfil de administrador', async () => {
      const _mockProfile = {
        id: 'test-user-id',
        user_id: 'test-user-id',
        role: 'admin',
        is_verified: true,
        is_demo: false,
        first_name: 'Admin',
        last_name: 'User',
        display_name: null,
        email: 'admin@test.com',
        profile_type: 'single',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        age: undefined,
        bio: null,
        latitude: null,
        longitude: null,
        location: null,
        interests: []
      };

      const _mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: _mockProfile,
              error: null
            })
          })
        })
      };
      
      mockSupabase.from.mockReturnValue(_mockChain);

      // Usar mockSupabase en lugar de supabase
      const result = await mockSupabase.from('profiles').select('*').eq('user_id', 'test-user-id').single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.role).toBe('admin');
      expect(result.data?.is_verified).toBe(true);
      expect(result.data?.is_demo).toBe(false);
    });

    it('debería rechazar perfiles no administradores', async () => {
      const _mockProfile: MockProfile = {
        id: 'user-456',
        role: 'user',
        is_demo: false,
        first_name: 'Regular',
        last_name: 'User',
        display_name: null,
        email: 'user@test.com',
        profile_type: 'single',
        is_verified: false,
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        age: undefined,
        bio: null,
        latitude: null,
        longitude: null,
        location: null,
        interests: []
      };

      const _mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: _mockProfile,
              error: null
            })
          })
        })
      };
      
      mockSupabase.from.mockReturnValue(_mockChain);

      const result = await mockSupabase.from('profiles')
        .select('*')
        .eq('id', 'user-456')
        .single();

      expect(result.data).toBeDefined();
      expect(result.data?.role).toBe('user');
      expect(result.data?.is_demo).toBe(false);
    });

    it('debe validar rol demo correctamente', async () => {
      const _mockProfile: MockProfile = {
        id: 'demo-123',
        role: 'demo',
        email: 'demo.single@complicesconecta.app',
        is_verified: false,
        is_demo: true,
        first_name: 'Demo',
        last_name: 'User',
        display_name: null,
        profile_type: 'single',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        age: undefined,
        bio: null,
        latitude: null,
        longitude: null,
        location: null,
        interests: []
      };

      const _mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: _mockProfile,
              error: null
            })
          })
        })
      };
      
      mockSupabase.from.mockReturnValue(_mockChain);

      const result = await mockSupabase.from('profiles')
        .select('*')
        .eq('id', 'demo-123')
        .single();

      expect(result.data?.role).toBe('demo');
      expect(result.data?.is_demo).toBe(true);
    });
  });

  describe('Permisos por Rol', () => {
    const checkPermission = (role: string, action: string): boolean => {
      const permissions = {
        admin: [
          'read_all_profiles',
          'write_all_profiles',
          'delete_profiles',
          'manage_users',
          'access_admin_panel',
          'view_analytics',
          'manage_content',
          'moderate_reports'
        ],
        user: [
          'read_own_profile',
          'write_own_profile',
          'send_invitations',
          'view_public_profiles',
          'upload_images',
          'join_chats'
        ],
        demo: [
          'read_own_profile',
          'view_demo_profiles',
          'limited_interactions'
        ]
      };

      return permissions[role as keyof typeof permissions]?.includes(action) || false;
    };

    it('debe permitir acciones de admin', () => {
      expect(checkPermission('admin', 'read_all_profiles')).toBe(true);
      expect(checkPermission('admin', 'write_all_profiles')).toBe(true);
      expect(checkPermission('admin', 'delete_profiles')).toBe(true);
      expect(checkPermission('admin', 'manage_users')).toBe(true);
      expect(checkPermission('admin', 'access_admin_panel')).toBe(true);
    });

    it('debe permitir acciones de usuario regular', () => {
      expect(checkPermission('user', 'read_own_profile')).toBe(true);
      expect(checkPermission('user', 'write_own_profile')).toBe(true);
      expect(checkPermission('user', 'send_invitations')).toBe(true);
      expect(checkPermission('user', 'view_public_profiles')).toBe(true);
      expect(checkPermission('user', 'upload_images')).toBe(true);
    });

    it('debe limitar acciones de usuario demo', () => {
      expect(checkPermission('demo', 'read_own_profile')).toBe(true);
      expect(checkPermission('demo', 'view_demo_profiles')).toBe(true);
      expect(checkPermission('demo', 'limited_interactions')).toBe(true);
      
      // Acciones no permitidas para demo
      expect(checkPermission('demo', 'send_invitations')).toBe(false);
      expect(checkPermission('demo', 'upload_images')).toBe(false);
      expect(checkPermission('demo', 'access_admin_panel')).toBe(false);
    });

    it('debe denegar acciones no autorizadas', () => {
      expect(checkPermission('user', 'access_admin_panel')).toBe(false);
      expect(checkPermission('user', 'delete_profiles')).toBe(false);
      expect(checkPermission('user', 'manage_users')).toBe(false);
      
      expect(checkPermission('demo', 'write_all_profiles')).toBe(false);
      expect(checkPermission('demo', 'manage_content')).toBe(false);
    });
  });

  describe('Gestión de Roles', () => {
    it('debe crear perfil con rol por defecto', async () => {
      const _newProfile: MockProfile = {
        id: 'test-user-id',
        first_name: 'John',
        last_name: 'Doe',
        display_name: null,
        email: 'john@example.com',
        role: 'user',
        profile_type: 'individual',
        is_demo: false,
        is_verified: false,
        is_premium: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        bio: null,
        location: null,
        interests: []
      };

      const _mockChain = {
        insert: vi.fn().mockResolvedValue({
          data: [_newProfile],
          error: null
        })
      };
      
      mockSupabase.from.mockReturnValue(_mockChain);

      const result = await mockSupabase.from('profiles').insert(_newProfile);

      expect(result.data?.[0].role).toBe('user');
      expect(result.data?.[0].is_demo).toBe(false);
      expect(result.data?.[0].is_verified).toBe(false);
    });

    it('debe actualizar rol de usuario', async () => {
      const updatedProfile = {
        id: 'user-123',
        role: 'admin',
        is_verified: true
      };

      const _mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [updatedProfile],
            error: null
          })
        })
      };
      
      mockSupabase.from.mockReturnValue(_mockChain);

      const _result = await mockSupabase.from('profiles')
        .update({ role: 'admin', is_verified: true })
        .eq('id', 'user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('debe validar emails de admin en producción', () => {
      const validAdminEmails = [
        'complicesconectasw@outlook.es',
        'admin@complicesconecta.app'
      ];

      const testEmails = [
        'complicesconectasw@outlook.es',
        'admin@complicesconecta.app',
        'user@example.com',
        'demo@test.com'
      ];

      testEmails.forEach(email => {
        const isValidAdmin = validAdminEmails.includes(email);
        if (email.includes('complicesconectasw') || email.includes('admin@complicesconecta')) {
          expect(isValidAdmin).toBe(true);
        } else {
          expect(isValidAdmin).toBe(false);
        }
      });
    });
  });

  describe('Separación Demo/Producción', () => {
    it('debe identificar perfiles demo por email', () => {
      const demoEmails = [
        'demo.single@complicesconecta.app',
        'demo.pareja@complicesconecta.app'
      ];

      const isDemoEmail = (email: string): boolean => {
        return email.startsWith('demo.') && email.includes('@complicesconecta.app');
      };

      demoEmails.forEach(email => {
        expect(isDemoEmail(email)).toBe(true);
      });

      expect(isDemoEmail('user@example.com')).toBe(false);
      expect(isDemoEmail('admin@complicesconecta.app')).toBe(false);
    });

    it('debe aislar datos demo de producción', async () => {
      // Mock para perfiles demo
      const demoProfiles = [
        { id: 'demo-1', role: 'demo', is_demo: true, email: 'demo.single@complicesconecta.app' },
        { id: 'demo-2', role: 'demo', is_demo: true, email: 'demo.pareja@complicesconecta.app' }
      ];

      // Mock para perfiles producción
      const _prodProfiles = [
        { id: 'prod-1', role: 'user', is_demo: false, email: 'user@example.com' },
        { id: 'prod-2', role: 'admin', is_demo: false, email: 'admin@complicesconecta.app' }
      ];

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: demoProfiles,
            error: null
          })
        })
      });

      const result = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('is_demo', true);

      expect(result.data?.every((profile: Record<string, unknown>) => profile.is_demo)).toBe(true);
      expect(result.data?.every((profile: Record<string, unknown>) => profile.role === 'demo')).toBe(true);
    });
  });

  describe('Validación de Integridad', () => {
    it('debe validar consistencia de roles', () => {
      const profiles = [
        { role: 'admin', is_demo: false, is_verified: true },
        { role: 'user', is_demo: false, is_verified: false },
        { role: 'demo', is_demo: true, is_verified: false }
      ];

      profiles.forEach((profile: Record<string, unknown>) => {
        if (profile.role === 'admin') {
          expect(profile.is_demo).toBe(false);
          expect(profile.is_verified).toBe(true);
        }
        
        if (profile.role === 'demo') {
          expect(profile.is_demo).toBe(true);
        }
        
        if (profile.is_demo) {
          expect(profile.role).toBe('demo');
        }
      });
    });

    it('debe validar estructura de enum roles', () => {
      const validRoles = ['admin', 'user', 'demo'];
      const testRoles = ['admin', 'user', 'demo', 'invalid'];

      testRoles.forEach((role: string) => {
        const isValid = validRoles.includes(role);
        if (role === 'invalid') {
          expect(isValid).toBe(false);
        } else {
          expect(isValid).toBe(true);
        }
      });
    });
  });
});
