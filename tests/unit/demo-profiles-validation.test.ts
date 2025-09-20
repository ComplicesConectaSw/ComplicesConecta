/**
 * 🛠️ SUPER PROMPT MAESTRO - VALIDACIÓN PERFILES DEMO
 * Test específico para validar integridad de perfiles demo
 */

import { describe, it, expect } from 'vitest';
import { demoProfiles } from '@/demo/demoData';
import { handleDemoAuth, isDemoCredential } from '@/lib/app-config';

describe('🎭 Validación Perfiles Demo', () => {
  
  describe('Estructura de Datos Demo', () => {
    it('debe tener perfiles demo definidos', () => {
      expect(demoProfiles).toBeDefined();
      expect(Array.isArray(demoProfiles)).toBe(true);
      expect(demoProfiles.length).toBeGreaterThan(0);
    });

    it('debe tener perfil single@outlook.es completo', () => {
      const singleProfile = demoProfiles.find(p => p.email === 'single@outlook.es');
      
      expect(singleProfile).toBeDefined();
      expect(singleProfile?.id).toBe('demo-single-outlook');
      expect(singleProfile?.first_name).toBe('Sofía');
      expect(singleProfile?.last_name).toBe('Mendoza');
      expect(singleProfile?.age).toBe(28);
      expect(singleProfile?.profile_type).toBe('single');
      expect(singleProfile?.is_demo).toBe(true);
      expect(singleProfile?.gender).toBe('female');
      expect(singleProfile?.relationship_status).toBe('single');
      expect(singleProfile?.location).toContain('Ciudad de México');
      expect(Array.isArray(singleProfile?.interests)).toBe(true);
      expect(singleProfile?.interests?.length).toBeGreaterThan(0);
    });

    it('debe tener perfil pareja@outlook.es completo', () => {
      const coupleProfile = demoProfiles.find(p => p.email === 'pareja@outlook.es');
      
      expect(coupleProfile).toBeDefined();
      expect(coupleProfile?.id).toBe('demo-pareja-outlook');
      expect(coupleProfile?.first_name).toBe('Carmen');
      expect(coupleProfile?.display_name).toContain('Roberto');
      expect(coupleProfile?.age).toBe(32);
      expect(coupleProfile?.profile_type).toBe('couple');
      expect(coupleProfile?.is_demo).toBe(true);
      expect(coupleProfile?.gender).toBe('couple');
      expect(coupleProfile?.relationship_status).toBe('couple');
      expect(coupleProfile?.location).toContain('Guadalajara');
      expect(coupleProfile?.is_premium).toBe(true);
    });
  });

  describe('Autenticación Demo', () => {
    it('debe reconocer credenciales demo', () => {
      expect(isDemoCredential('single@outlook.es')).toBe(true);
      expect(isDemoCredential('pareja@outlook.es')).toBe(true);
      expect(isDemoCredential('admin')).toBe(true);
      expect(isDemoCredential('usuario@real.com')).toBe(false);
    });

    it('debe crear sesión demo para single@outlook.es', () => {
      const demoAuth = handleDemoAuth('single@outlook.es', 'single');
      
      expect(demoAuth).toBeDefined();
      expect(demoAuth?.user).toBeDefined();
      expect(demoAuth?.session).toBeDefined();
      
      // Verificar usuario demo
      expect(demoAuth?.user.email).toBe('single@outlook.es');
      expect(demoAuth?.user.first_name).toBe('Sofía');
      expect(demoAuth?.user.is_demo).toBe(true);
      expect(demoAuth?.user.profile_type).toBe('single');
      
      // Verificar sesión
      expect(demoAuth?.session.access_token).toContain('demo-token-');
      expect(demoAuth?.session.expires_at).toBeGreaterThan(Date.now());
    });

    it('debe crear sesión demo para pareja@outlook.es', () => {
      const demoAuth = handleDemoAuth('pareja@outlook.es', 'couple');
      
      expect(demoAuth).toBeDefined();
      expect(demoAuth?.user.email).toBe('pareja@outlook.es');
      expect(demoAuth?.user.first_name).toBe('Carmen');
      expect(demoAuth?.user.profile_type).toBe('couple');
      expect(demoAuth?.user.is_premium).toBe(true);
    });
  });

  describe('Integridad de Datos', () => {
    it('todos los perfiles demo deben tener campos obligatorios', () => {
      const requiredFields = ['id', 'email', 'first_name', 'profile_type', 'is_demo'];
      
      demoProfiles.forEach(profile => {
        requiredFields.forEach(field => {
          expect(profile).toHaveProperty(field);
          expect(profile[field as keyof typeof profile]).toBeDefined();
        });
      });
    });

    it('perfiles demo deben tener IDs únicos', () => {
      const ids = demoProfiles.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('perfiles demo deben tener emails únicos', () => {
      const emails = demoProfiles.map(p => p.email).filter(Boolean);
      const uniqueEmails = [...new Set(emails)];
      
      expect(emails.length).toBe(uniqueEmails.length);
    });

    it('perfiles demo deben tener tipos válidos', () => {
      const validTypes = ['single', 'couple'];
      
      demoProfiles.forEach(profile => {
        if (profile.profile_type) {
          expect(validTypes).toContain(profile.profile_type);
        }
      });
    });
  });

  describe('Capacidades Equivalentes', () => {
    it('perfiles demo deben tener mismas propiedades que reales', () => {
      const singleDemo = demoProfiles.find(p => p.email === 'single@outlook.es');
      const coupleDemo = demoProfiles.find(p => p.email === 'pareja@outlook.es');
      
      // Propiedades esperadas en perfiles
      const expectedProps = [
        'id', 'first_name', 'age', 'bio', 'location', 
        'interests', 'is_verified', 'is_premium', 'profile_type'
      ];
      
      expectedProps.forEach(prop => {
        expect(singleDemo).toHaveProperty(prop);
        expect(coupleDemo).toHaveProperty(prop);
      });
    });

    it('perfiles demo deben tener intereses válidos', () => {
      demoProfiles.forEach(profile => {
        if (profile.interests) {
          expect(Array.isArray(profile.interests)).toBe(true);
          expect(profile.interests.length).toBeGreaterThan(0);
          
          profile.interests.forEach(interest => {
            expect(typeof interest).toBe('string');
            expect(interest.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('Seguridad y Consistencia', () => {
    it('perfiles demo deben estar marcados como demo', () => {
      const demoEmails = ['single@outlook.es', 'pareja@outlook.es'];
      
      demoEmails.forEach(email => {
        const profile = demoProfiles.find(p => p.email === email);
        expect(profile?.is_demo).toBe(true);
      });
    });

    it('no debe haber conflicto con emails reales', () => {
      const demoEmails = demoProfiles.map(p => p.email).filter(Boolean);
      const realEmailPatterns = [
        '@gmail.com', '@hotmail.com', '@yahoo.com', 
        '@complicesconecta.com'
      ];
      
      demoEmails.forEach(email => {
        const hasRealPattern = realEmailPatterns.some(pattern => 
          email?.includes(pattern) && !email?.includes('demo')
        );
        
        // Solo outlook.es debe ser permitido para demos
        if (!email?.includes('outlook.es') && !email?.includes('admin')) {
          expect(hasRealPattern).toBe(false);
        }
      });
    });
  });
});
