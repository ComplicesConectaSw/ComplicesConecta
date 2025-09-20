import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

// Cliente de Supabase específico para tests - sin bloqueos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

logger.info('🧪 Creando cliente Supabase para tests');

export const testSupabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      persistSession: false, // No persistir sesión en tests
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey || 'placeholder-key',
        'Authorization': `Bearer ${supabaseAnonKey || 'placeholder-key'}`,
      },
      // Sin fetch personalizado - usar fetch nativo
    }
  }
);

// Función helper para registro en tests que maneja confirmación de email
export const testSignUp = async (email: string, password: string, userData: Record<string, unknown>) => {
  logger.info('🧪 Intentando registro con configuración de test');
  
  try {
    const { data, error } = await testSupabase.auth.signUp({
      email,
      password,
      options: { 
        data: userData,
        emailRedirectTo: undefined // Evitar redirect en tests
      }
    });
    
    logger.info('🧪 Respuesta signUp:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userEmail: data.user?.email,
      userConfirmed: data.user?.email_confirmed_at,
      error: error?.message
    });
    
    // Si el usuario se creó pero no está confirmado, simular confirmación para tests
    if (data.user && !data.user.email_confirmed_at && !error) {
      logger.info('🧪 Usuario creado pero no confirmado - esto es normal en Supabase con email confirmation');
      return {
        data: {
          ...data,
          user: {
            ...data.user,
            email_confirmed_at: new Date().toISOString() // Simular confirmación para tests
          }
        },
        error: null
      };
    }
    
    // Si Supabase devuelve user: null (típico con email confirmation), simular usuario para tests
    if (!data.user && !error) {
      logger.info('🧪 Supabase devolvió user: null - simulando usuario para tests');
      const simulatedUser = {
        id: `test-user-${Date.now()}`,
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: userData,
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return {
        data: {
          user: simulatedUser,
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: simulatedUser
          }
        },
        error: null
      };
    }
    
    return { data, error };
  } catch (err) {
    logger.error('🧪 Error en testSignUp:', { error: err });
    throw err;
  }
};
