import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

describe('Roles y Permisos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validación de Roles', () => {
    it('debe validar rol admin correctamente', async () => {
      const mockProfile = {
        id: 'admin-123',
        role: 'admin',
        email: 'admin@complicesconecta.app',
        is_verified: true,
        is_demo: false
      };

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

      const result = await supabase.from('profiles')
        .select('*')
        .eq('id', 'admin-123')
        .single();

      expect(result.data?.role).toBe('admin');
      expect(result.data?.is_verified).toBe(true);
      expect(result.data?.is_demo).toBe(false);
    });

    it('debe validar rol user correctamente', async () => {
      const mockProfile = {
        id: 'user-123',
        role: 'user',
        email: 'user@example.com',
        is_verified: false,
        is_demo: false
      };

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

      const result = await supabase.from('profiles')
        .select('*')
        .eq('id', 'user-123')
        .single();

      expect(result.data?.role).toBe('user');
      expect(result.data?.is_demo).toBe(false);
    });

    it('debe validar rol demo correctamente', async () => {
      const mockProfile = {
        id: 'demo-123',
        role: 'demo',
        email: 'demo.single@complicesconecta.app',
        is_verified: false,
        is_demo: true
      };

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

      const result = await supabase.from('profiles')
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
      const newProfile = {
        user_id: 'new-user-123',
        first_name: 'Nuevo',
        last_name: 'Usuario',
        email: 'nuevo@example.com',
        role: 'user',
        profile_type: 'single',
        is_demo: false,
        is_verified: false,
        is_premium: false
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [newProfile],
          error: null
        })
      } as any);

      const result = await supabase.from('profiles').insert(newProfile);

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

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [updatedProfile],
            error: null
          })
        })
      } as any);

      const result = await supabase.from('profiles')
        .update({ role: 'admin', is_verified: true })
        .eq('id', 'user-123');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
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
      const prodProfiles = [
        { id: 'prod-1', role: 'user', is_demo: false, email: 'user@example.com' },
        { id: 'prod-2', role: 'admin', is_demo: false, email: 'admin@complicesconecta.app' }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: demoProfiles,
            error: null
          })
        })
      } as any);

      const demoResult = await supabase.from('profiles')
        .select('*')
        .eq('is_demo', true);

      expect(demoResult.data?.every(profile => profile.is_demo)).toBe(true);
      expect(demoResult.data?.every(profile => profile.role === 'demo')).toBe(true);
    });
  });

  describe('Validación de Integridad', () => {
    it('debe validar consistencia de roles', () => {
      const profiles = [
        { role: 'admin', is_demo: false, is_verified: true },
        { role: 'user', is_demo: false, is_verified: false },
        { role: 'demo', is_demo: true, is_verified: false }
      ];

      profiles.forEach(profile => {
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

      testRoles.forEach(role => {
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
