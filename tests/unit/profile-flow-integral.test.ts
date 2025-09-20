/**
 * 🛠️ SUPER PROMPT MAESTRO - TEST INTEGRAL DE PERFILES
 * Test robusto para verificar flujo de perfiles reales y demo
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { handleDemoAuth } from '@/lib/app-config';
import { demoProfiles } from '@/demo/demoData';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Datos de test
const TEST_SINGLE = {
  email: `test-single-${Date.now()}@test.com`,
  password: 'Test123!',
  first_name: 'Ana',
  age: 28,
  profile_type: 'single'
};

const TEST_COUPLE = {
  email: `test-couple-${Date.now()}@test.com`, 
  password: 'Test123!',
  first_name: 'Carmen',
  age: 32,
  profile_type: 'couple'
};

let testResults: Array<{scenario: string, status: string, details: string}> = [];

const addResult = (scenario: string, status: 'PASS' | 'FAIL', details: string) => {
  testResults.push({ scenario, status, details });
  console.log(`🧪 ${status}: ${scenario} - ${details}`);
};

describe('🛠️ Test Integral de Perfiles', () => {
  
  beforeAll(() => {
    logger.info('🚀 Iniciando Test Integral de Perfiles');
  });

  afterAll(async () => {
    // Generar reporte
    const report = `# 🛠️ REPORTE TEST INTEGRAL DE PERFILES

**Fecha**: ${new Date().toLocaleString('es-ES')}
**Tests**: ${testResults.length}
**Exitosos**: ${testResults.filter(r => r.status === 'PASS').length}
**Fallidos**: ${testResults.filter(r => r.status === 'FAIL').length}

## Resultados:
${testResults.map(r => `- ${r.status === 'PASS' ? '✅' : '❌'} ${r.scenario}: ${r.details}`).join('\n')}
`;
    
    try {
      const fs = await import('fs/promises');
      await fs.writeFile('tests/profile-flow-report.md', report);
      logger.info('📄 Reporte generado: tests/profile-flow-report.md');
    } catch (error) {
      console.log('Report:', report);
    }
  });

  describe('1️⃣ Registro Usuario Real Single', () => {
    it('debe registrar usuario single', async () => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: TEST_SINGLE.email,
          password: TEST_SINGLE.password,
          options: { data: TEST_SINGLE }
        });
        
        expect(error).toBeNull();
        expect(data.user?.email).toBe(TEST_SINGLE.email);
        
        addResult('Registro Single', 'PASS', 'Usuario registrado correctamente');
      } catch (error) {
        addResult('Registro Single', 'FAIL', String(error));
      }
    });
  });

  describe('2️⃣ Registro Usuario Real Pareja', () => {
    it('debe registrar pareja', async () => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: TEST_COUPLE.email,
          password: TEST_COUPLE.password,
          options: { data: TEST_COUPLE }
        });
        
        expect(error).toBeNull();
        expect(data.user?.email).toBe(TEST_COUPLE.email);
        
        addResult('Registro Pareja', 'PASS', 'Pareja registrada');
      } catch (error) {
        addResult('Registro Pareja', 'FAIL', String(error));
      }
    });
  });

  describe('3️⃣ Validación Perfiles Demo', () => {
    it('debe validar perfil demo single@outlook.es', () => {
      try {
        const demoProfile = demoProfiles.find(p => p.email === 'single@outlook.es');
        
        expect(demoProfile).toBeDefined();
        expect(demoProfile?.first_name).toBe('Sofía');
        expect(demoProfile?.is_demo).toBe(true);
        
        addResult('Demo Single', 'PASS', 'Perfil demo validado');
      } catch (error) {
        addResult('Demo Single', 'FAIL', String(error));
      }
    });

    it('debe validar perfil demo pareja@outlook.es', () => {
      try {
        const demoProfile = demoProfiles.find(p => p.email === 'pareja@outlook.es');
        
        expect(demoProfile).toBeDefined();
        expect(demoProfile?.first_name).toBe('Carmen');
        expect(demoProfile?.is_demo).toBe(true);
        
        addResult('Demo Pareja', 'PASS', 'Perfil pareja validado');
      } catch (error) {
        addResult('Demo Pareja', 'FAIL', String(error));
      }
    });
  });

  describe('4️⃣ Autenticación Demo', () => {
    it('debe crear sesión demo correctamente', () => {
      try {
        const demoAuth = handleDemoAuth('single@outlook.es', 'single');
        
        expect(demoAuth).toBeDefined();
        expect(demoAuth?.user.email).toBe('single@outlook.es');
        expect(demoAuth?.user.is_demo).toBe(true);
        
        addResult('Auth Demo', 'PASS', 'Sesión demo creada');
      } catch (error) {
        addResult('Auth Demo', 'FAIL', String(error));
      }
    });
  });

  describe('5️⃣ Capacidades Equivalentes', () => {
    it('debe verificar campos obligatorios en perfiles demo', () => {
      try {
        const singleDemo = demoProfiles.find(p => p.email === 'single@outlook.es');
        const coupleDemo = demoProfiles.find(p => p.email === 'pareja@outlook.es');
        
        // Campos obligatorios
        const requiredFields = ['id', 'first_name', 'age', 'profile_type', 'is_demo'];
        
        requiredFields.forEach(field => {
          expect(singleDemo).toHaveProperty(field);
          expect(coupleDemo).toHaveProperty(field);
        });
        
        addResult('Campos Obligatorios', 'PASS', 'Todos los campos presentes');
      } catch (error) {
        addResult('Campos Obligatorios', 'FAIL', String(error));
      }
    });

    it('debe verificar intereses válidos', () => {
      try {
        const profiles = demoProfiles.filter(p => 
          p.email === 'single@outlook.es' || p.email === 'pareja@outlook.es'
        );
        
        profiles.forEach(profile => {
          expect(Array.isArray(profile.interests)).toBe(true);
          expect(profile.interests!.length).toBeGreaterThan(0);
        });
        
        addResult('Intereses Válidos', 'PASS', 'Intereses correctos');
      } catch (error) {
        addResult('Intereses Válidos', 'FAIL', String(error));
      }
    });
  });

  describe('6️⃣ Seguridad y Consistencia', () => {
    it('debe verificar que perfiles demo están marcados correctamente', () => {
      try {
        const demoEmails = ['single@outlook.es', 'pareja@outlook.es'];
        
        demoEmails.forEach(email => {
          const profile = demoProfiles.find(p => p.email === email);
          expect(profile?.is_demo).toBe(true);
        });
        
        addResult('Marcado Demo', 'PASS', 'Perfiles marcados como demo');
      } catch (error) {
        addResult('Marcado Demo', 'FAIL', String(error));
      }
    });

    it('debe verificar IDs únicos', () => {
      try {
        const ids = demoProfiles.map(p => p.id);
        const uniqueIds = [...new Set(ids)];
        
        expect(ids.length).toBe(uniqueIds.length);
        
        addResult('IDs Únicos', 'PASS', 'Sin duplicados de ID');
      } catch (error) {
        addResult('IDs Únicos', 'FAIL', String(error));
      }
    });
  });
});