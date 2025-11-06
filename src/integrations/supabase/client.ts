import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// CRÍTICO: Importar logger de forma segura con fallback
import { logger } from '@/lib/logger';

// Fallback logger si el import falla (no debería pasar, pero por seguridad)
const safeLogger = logger || {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your-supabase-url-here') || supabaseUrl.includes('placeholder');
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key-here') || supabaseAnonKey.includes('placeholder-key');

if (isPlaceholderUrl || isPlaceholderKey) {
  safeLogger.warn('⚠️ Variables de Supabase usando valores placeholder - activando modo demo', {
    urlConfigured: !isPlaceholderUrl,
    keyConfigured: !isPlaceholderKey
  });
  safeLogger.info('VITE_SUPABASE_URL:', { status: supabaseUrl && !isPlaceholderUrl ? '✅ Configurada' : '❌ Faltante/Placeholder' });
  safeLogger.info('VITE_SUPABASE_ANON_KEY:', { status: supabaseAnonKey && !isPlaceholderKey ? '✅ Configurada' : '❌ Faltante/Placeholder' });
  // No lanzar error, permitir modo demo
}

safeLogger.info('🔗 Conectando a Supabase:', { url: supabaseUrl });

// Variable global para almacenar la instancia única del cliente
let supabaseInstance: SupabaseClient<Database> | null = null;

// Función para crear o retornar la instancia única del cliente
function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    safeLogger.info('♻️ Reutilizando instancia existente de Supabase', {});
    return supabaseInstance;
  }

  safeLogger.info('🆕 Creando nueva instancia de Supabase', {});
  
  // CRÍTICO: Validar y manejar errores de forma segura
  try {
    // Validar credenciales antes de crear cliente
    const finalUrl = (supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-supabase-url-here')) 
      ? supabaseUrl 
      : 'https://placeholder.supabase.co';
    const finalKey = (supabaseAnonKey && !supabaseAnonKey.includes('placeholder-key') && !supabaseAnonKey.includes('your-supabase-anon-key-here')) 
      ? supabaseAnonKey 
      : 'placeholder-key';
    
    supabaseInstance = createClient<Database>(
  finalUrl, 
  finalKey, 
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
              safeLogger.info('🚫 Bloqueando Supabase para usuario demo no-admin:', { email: user.email });
              return Promise.reject(new Error('Demo mode active - non-admin user'));
            } else {
              safeLogger.info('✅ Permitiendo Supabase para admin demo:', { email: user.email });
            }
          } catch {
            safeLogger.info('🚫 Bloqueando Supabase - error parsing demo user', {});
            return Promise.reject(new Error('Demo mode active - parse error'));
          }
        }
        
        // Para usuarios de producción o admins demo, permitir Supabase
        safeLogger.info('🔗 Permitiendo llamada a Supabase:', { url: typeof url === 'string' ? url.substring(0, 50) + '...' : url });
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
    
    safeLogger.info('✅ Cliente de Supabase creado exitosamente', { url: finalUrl });
    return supabaseInstance;
  } catch (error) {
    safeLogger.error('❌ Error crítico creando cliente de Supabase:', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // Crear cliente mínimo con valores placeholder
    try {
      supabaseInstance = createClient<Database>(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
      safeLogger.warn('⚠️ Usando cliente placeholder de Supabase debido a error', {});
      return supabaseInstance;
    } catch (fallbackError) {
      safeLogger.error('❌ Error crítico creando cliente placeholder:', { 
        error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      });
      // Retornar un stub mínimo que no cause errores
      throw new Error('Failed to create Supabase client');
    }
  }
}

// Exportar la instancia única del cliente
// CRÍTICO: Crear instancia de forma segura sin bloquear la carga
let supabase: SupabaseClient<Database> | null = null;

try {
  supabase = getSupabaseClient();
} catch (error) {
  safeLogger.error('❌ Error creando cliente de Supabase:', { error: error instanceof Error ? error.message : String(error) });
  // Crear cliente con valores placeholder en caso de error
  try {
    supabase = createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );
    safeLogger.warn('⚠️ Usando cliente placeholder de Supabase', {});
  } catch (fallbackError) {
    safeLogger.error('❌ Error crítico creando cliente placeholder:', { error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) });
    // No exportar null, crear un stub mínimo
    supabase = null as any;
  }
}

export { supabase };

// Verificar conectividad inicial y activar modo demo si es necesario
let isDemoMode = false;

// Solo intentar conectar a Supabase si no estamos en modo demo
const checkDemoMode = () => {
  const demoAuth = localStorage.getItem('demo_authenticated');
  return demoAuth === 'true';
};

const initializeSupabase = async () => {
  // No bloquear el renderizado - ejecutar de forma asíncrona sin await
  setTimeout(async () => {
    if (!checkDemoMode()) {
      try {
        // Timeout de 5 segundos para evitar que se quede colgado
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: _data, error: _error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (_error) {
          safeLogger.warn('⚠️ Problema de conectividad con Supabase:', { error: _error.message });
          if (_error.message.includes('Failed to fetch') || _error.message.includes('CONNECTION_REFUSED') || _error.message.includes('Invalid Refresh Token') || _error.message.includes('Timeout')) {
            isDemoMode = true;
            safeLogger.info('🔄 Activando modo demo offline', {});
          } else {
            safeLogger.info('✅ Conectado exitosamente a Supabase', {});
          }
        }
      } catch (err) {
        safeLogger.warn('⚠️ No se pudo verificar la sesión de Supabase:', { error: err instanceof Error ? err.message : String(err) });
        isDemoMode = true;
        safeLogger.info('🔄 Activando modo demo offline', {});
      }
    } else {
      isDemoMode = true;
      safeLogger.info('🔄 Modo demo activo - evitando conexión a Supabase', {});
    }
  }, 100); // Ejecutar después de 100ms para no bloquear el renderizado inicial
};

// Initialize on module load (no bloquea)
initializeSupabase();

export { isDemoMode };