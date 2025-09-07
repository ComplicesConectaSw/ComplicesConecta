import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here') || supabaseAnonKey.includes('your-supabase-anon-key-here')) {
  console.warn('⚠️ Variables de Supabase usando valores placeholder - activando modo demo');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
  // No lanzar error, permitir modo demo
}

console.log('🔗 Conectando a Supabase:', supabaseUrl);

// Crear y exportar el cliente de Supabase con valores por defecto
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey || 'placeholder-key',
        'Authorization': `Bearer ${supabaseAnonKey || 'placeholder-key'}`,
      },
      fetch: (url, options = {}) => {
        // Verificar si estamos en modo demo solo para usuarios no admin
        const demoAuth = localStorage.getItem('demo_authenticated');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoAuth === 'true' && demoUser) {
          try {
            const user = JSON.parse(demoUser);
            // Solo bloquear Supabase para usuarios demo no-admin
            if (user.role !== 'admin') {
              console.log('🔄 Modo demo activo - evitando llamadas a Supabase');
              return Promise.reject(new Error('Demo mode active'));
            }
          } catch (error) {
            console.log('🔄 Modo demo activo - evitando llamadas a Supabase');
            return Promise.reject(new Error('Demo mode active'));
          }
        }
        
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'apikey': supabaseAnonKey || 'placeholder-key',
            'Authorization': `Bearer ${supabaseAnonKey || 'placeholder-key'}`,
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
  }
);

// Verificar conectividad inicial y activar modo demo si es necesario
let isDemoMode = false;

// Solo intentar conectar a Supabase si no estamos en modo demo
const checkDemoMode = () => {
  const demoAuth = localStorage.getItem('demo_authenticated');
  return demoAuth === 'true';
};

if (!checkDemoMode()) {
  supabase.auth.getSession().then(({ error }) => {
    if (error) {
      console.warn('⚠️ Problema de conectividad con Supabase:', error.message);
      if (error.message.includes('Failed to fetch') || error.message.includes('CONNECTION_REFUSED') || error.message.includes('Invalid Refresh Token')) {
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
} else {
  isDemoMode = true;
  console.log('🔄 Modo demo activo - evitando conexión a Supabase');
}

export { isDemoMode };