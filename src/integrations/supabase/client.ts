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

// Crear y exportar el cliente de Supabase con valores por defecto
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});