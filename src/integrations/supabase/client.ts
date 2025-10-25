import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { logger } from '@/lib/logger';

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here') || supabaseAnonKey.includes('your-supabase-anon-key-here')) {
  logger.warn('⚠️ Variables de Supabase usando valores placeholder - activando modo demo', {});
  logger.info('VITE_SUPABASE_URL:', { status: supabaseUrl ? '✅ Configurada' : '❌ Faltante' });
  logger.info('VITE_SUPABASE_ANON_KEY:', { status: supabaseAnonKey ? '✅ Configurada' : '❌ Faltante' });
  // No lanzar error, permitir modo demo
}

logger.info('🔗 Conectando a Supabase:', { url: supabaseUrl });

// Variable global para almacenar la instancia única del cliente
let supabaseInstance: SupabaseClient<Database> | null = null;

// Función para crear o retornar la instancia única del cliente
function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    logger.info('♻️ Reutilizando instancia existente de Supabase', {});
    return supabaseInstance;
  }

  logger.info('🆕 Creando nueva instancia de Supabase', {});
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
              logger.info('🚫 Bloqueando Supabase para usuario demo no-admin:', { email: user.email });
              return Promise.reject(new Error('Demo mode active - non-admin user'));
            } else {
              logger.info('✅ Permitiendo Supabase para admin demo:', { email: user.email });
            }
          } catch {
            logger.info('🚫 Bloqueando Supabase - error parsing demo user', {});
            return Promise.reject(new Error('Demo mode active - parse error'));
          }
        }
        
        // Para usuarios de producción o admins demo, permitir Supabase
        logger.info('🔗 Permitiendo llamada a Supabase:', { url: typeof url === 'string' ? url.substring(0, 50) + '...' : url });
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

const initializeSupabase = async () => {
  if (!checkDemoMode()) {
    try {
      const { data: _data, error: _error } = await supabase.auth.getSession();
      if (_error) {
        logger.warn('⚠️ Problema de conectividad con Supabase:', { error: _error.message });
        if (_error.message.includes('Failed to fetch') || _error.message.includes('CONNECTION_REFUSED') || _error.message.includes('Invalid Refresh Token')) {
          isDemoMode = true;
          logger.info('🔄 Activando modo demo offline', {});
        } else {
          logger.info('✅ Conectado exitosamente a Supabase', {});
        }
      }
    } catch (err) {
      logger.warn('⚠️ No se pudo verificar la sesión de Supabase:', { error: err instanceof Error ? err.message : String(err) });
      isDemoMode = true;
      logger.info('🔄 Activando modo demo offline', {});
    }
  } else {
    isDemoMode = true;
    logger.info('🔄 Modo demo activo - evitando conexión a Supabase', {});
  }
};

// Initialize on module load
initializeSupabase();

export { isDemoMode };