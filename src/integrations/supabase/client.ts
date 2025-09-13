import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// Variable global para almacenar la instancia única del cliente
let supabaseInstance: SupabaseClient<Database> | null = null;

// Función para crear o retornar la instancia única del cliente
function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    console.log('♻️ Reutilizando instancia existente de Supabase');
    return supabaseInstance;
  }

  console.log('🆕 Creando nueva instancia de Supabase');
  supabaseInstance = createClient<Database>(
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
        // Solo bloquear Supabase para usuarios demo no-admin
        const demoAuth = localStorage.getItem('demo_authenticated');
        const demoUser = localStorage.getItem('demo_user');
        
        // Si hay sesión demo activa, verificar si es admin
        if (demoAuth === 'true' && demoUser) {
          try {
            const user = JSON.parse(demoUser);
            // Solo bloquear para usuarios demo no-admin
            if (user.role !== 'admin') {
              console.log('🚫 Bloqueando Supabase para usuario demo no-admin:', user.email);
              return Promise.reject(new Error('Demo mode active - non-admin user'));
            } else {
              console.log('✅ Permitiendo Supabase para admin demo:', user.email);
            }
          } catch (error) {
            console.log('🚫 Bloqueando Supabase - error parsing demo user');
            return Promise.reject(new Error('Demo mode active - parse error'));
          }
        }
        
        // Para usuarios de producción o admins demo, permitir Supabase
        console.log('🔗 Permitiendo llamada a Supabase:', typeof url === 'string' ? url.substring(0, 50) + '...' : url);
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
  });

  return supabaseInstance;
}

// Exportar la instancia única del cliente
export const supabase = getSupabaseClient();

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