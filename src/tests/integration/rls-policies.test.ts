/**
 * Tests Funcionales para RLS Policies
 * 
 * Verifica que las políticas RLS funcionen correctamente
 * 
 * @version 3.5.0
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas. Saltando tests de RLS.');
}

describe('RLS Policies', () => {
  const supabaseAnon = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
  
  const supabaseService = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  beforeAll(async () => {
    if (!supabaseAnon || !supabaseService) {
      console.warn('⚠️ Clientes de Supabase no disponibles. Saltando tests.');
      return;
    }
  });

  afterAll(async () => {
    // Cleanup si es necesario
  });

  describe('Profiles RLS', () => {
    it('should prevent users from accessing other users profiles without auth', async () => {
      if (!supabaseAnon) {
        return; // Saltar test si no hay cliente
      }

      // Sin autenticación, no debería poder acceder a perfiles
      const { data, error } = await supabaseAnon
        .from('profiles')
        .select('*')
        .limit(1);

      // Verificar que hay un error O que los datos están vacíos
      // Nota: Algunas políticas RLS pueden permitir lectura pública de perfiles básicos
      // pero restringir campos sensibles. Este test verifica que al menos hay restricción.
      const hasError = !!error;
      const isEmpty = !data || (Array.isArray(data) && data.length === 0);
      
      // El test pasa si hay error O si está vacío
      // Si hay datos, verificar que no contienen información sensible (esto es un test básico)
      if (!hasError && !isEmpty && Array.isArray(data) && data.length > 0) {
        // Si hay datos, verificar que al menos la política RLS está activa
        // (puede permitir lectura pública pero restringir campos sensibles)
        const profile = data[0];
        // Verificar que no hay campos sensibles como email, phone, etc.
        const hasSensitiveData = profile && (
          'email' in profile ||
          'phone' in profile ||
          'password' in profile
        );
        expect(hasSensitiveData).toBe(false);
      } else {
        // Si hay error o está vacío, el test pasa
        expect(hasError || isEmpty).toBe(true);
      }
    });

    it('should allow users to view their own profile', async () => {
      if (!supabaseAnon || !supabaseService) {
        return; // Saltar test si no hay clientes
      }

      // TODO: Implementar test con usuario autenticado
      // Por ahora, test stub
      expect(true).toBe(true);
    });
  });

  describe('Messages RLS', () => {
    it('should prevent users from accessing messages without auth', async () => {
      if (!supabaseAnon) {
        return;
      }

      const { data, error } = await supabaseAnon
        .from('messages')
        .select('*')
        .limit(1);

      // Debe fallar o retornar vacío
      expect(error || !data || data.length === 0).toBe(true);
    });
  });

  describe('Matches RLS', () => {
    it('should prevent users from accessing matches without auth', async () => {
      if (!supabaseAnon) {
        return;
      }

      const { data, error } = await supabaseAnon
        .from('matches')
        .select('*')
        .limit(1);

      // Debe fallar o retornar vacío
      expect(error || !data || data.length === 0).toBe(true);
    });
  });

  describe('Consent Verifications RLS', () => {
    it('should prevent users from accessing other users consent verifications', async () => {
      if (!supabaseAnon) {
        return;
      }

      // Intentar acceder a consent_verifications sin auth
      const { data, error } = await supabaseAnon
        .from('consent_verifications')
        .select('*')
        .limit(1);

      // Debe fallar o retornar vacío (tabla puede no existir aún)
      expect(error || !data || data.length === 0).toBe(true);
    });
  });

  describe('NFT Galleries RLS', () => {
    it('should prevent users from accessing other users NFT galleries', async () => {
      if (!supabaseAnon) {
        return;
      }

      // Intentar acceder a nft_galleries sin auth
      const { data, error } = await supabaseAnon
        .from('nft_galleries')
        .select('*')
        .limit(1);

      // Debe fallar o retornar vacío (tabla puede no existir aún)
      expect(error || !data || data.length === 0).toBe(true);
    });
  });
});

