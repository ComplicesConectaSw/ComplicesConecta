import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
  throw new Error('Variables de entorno de Supabase no configuradas. Verifica tu archivo .env');
}

console.log('🔗 Conectando a Supabase:', supabaseUrl);

// Crear y exportar el cliente de Supabase con valores por defecto
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Access-Control-Allow-Origin': '*',
        },
      });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Verificar conectividad inicial y activar modo demo si es necesario
let isDemoMode = false;

supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.warn('⚠️ Problema de conectividad con Supabase:', error.message);
    if (error.message.includes('Failed to fetch') || error.message.includes('CONNECTION_REFUSED')) {
      isDemoMode = true;
      console.log('🔄 Activando modo demo offline');
    }
  } else {
    console.log('✅ Conectado exitosamente a Supabase');
  }
}).catch((err) => {
  console.warn('⚠️ No se pudo verificar la sesión de Supabase:', err.message);
  isDemoMode = true;
  console.log('🔄 Activando modo demo offline');
});

export { isDemoMode };