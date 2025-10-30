import { logger } from '@/lib/logger';
// Configuración de la aplicación - Separación Demo vs Producción
export interface AppConfig {
  mode: 'demo' | 'production';
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    demoCredentials: boolean;
    realAuth: boolean;
    adminAccess: boolean;
  };
  ui: {
    showDemoIndicator: boolean;
    demoLabel: string;
  };
}

// Cache para evitar múltiples llamadas y logs repetitivos
let cachedConfig: AppConfig | null = null;

// Obtener configuración desde variables de entorno
export const getAppConfig = (): AppConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }
  
  const mode = (import.meta.env.VITE_APP_MODE || 'production') as 'demo' | 'production';
  
  // Usar modo configurado directamente
  const realMode = mode;
  
  logger.info('🔧 Configuración de aplicación:', {
    mode,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante'
  });
  
  cachedConfig = {
    mode: realMode,
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder'
    },
    features: {
      demoCredentials: true, // Siempre permitir credenciales demo
      realAuth: realMode === 'production', // Solo auth real en producción
      adminAccess: true // Permitir acceso admin en ambos modos
    },
    ui: {
      showDemoIndicator: mode === 'demo',
      demoLabel: mode === 'demo' ? '(Demo)' : ''
    }
  };
  
  return cachedConfig;
};

// Credenciales demo permitidas (INCLUIR djwacko28@gmail.com)
export const DEMO_CREDENTIALS = [
  'single@outlook.es',
  'pareja@outlook.es', 
  'admin',
  'djwacko28@gmail.com'        // Admin DEMO - usa datos demo
];

// Contraseñas demo por email - MIGRADO A VARIABLES DE ENTORNO
// Fallback a valores por defecto solo para desarrollo
const DEFAULT_DEMO_PASSWORDS: Record<string, string> = {
  'single@outlook.es': '123456',
  'pareja@outlook.es': '123456',
  'admin': '123456',
  'djwacko28@gmail.com': 'Magy_Wacko_nala28' // Admin DEMO
};

// Función auxiliar para obtener contraseña desde env o fallback
const getPasswordFromEnv = (email: string): string | null => {
  // Convertir email a formato de variable de entorno
  // Ejemplo: single@outlook.es -> SINGLE_OUTLOOK_ES
  const envKey = email.toUpperCase()
    .replace('@', '_')
    .replace('.', '_')
    .replace('-', '_');
  
  // Buscar en variables de entorno primero
  const envPassword = import.meta.env[`VITE_DEMO_PASSWORD_${envKey}`];
  
  // Si no existe en env, usar fallback (solo desarrollo)
  return envPassword || DEFAULT_DEMO_PASSWORDS[email] || null;
};

// Lista de emails admin para verificación rápida - CORREGIDA
const _ADMIN_EMAILS = [
  'admin',                      // Admin demo solamente
  'djwacko28@gmail.com',        // Admin DEMO (no producción)
  'complicesconectasw@outlook.es'  // ÚNICO admin producción REAL
];

// Configuración de credenciales para modo producción - MIGRADO A VARIABLES DE ENTORNO
// Fallback a valor por defecto solo para desarrollo
export const productionCredentials = {
  email: 'complicesconectasw@outlook.es',
  password: import.meta.env.VITE_PROD_PASSWORD_COMPLICESCONECTASW || 'Magy_Wacko_nala28' // Fallback
};

// Función para verificar si es credencial demo
export const isDemoCredential = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim()
    .replace('@otlook.es', '@outlook.es')
    .replace('@outllok.es', '@outlook.es')
    .replace('@outlok.es', '@outlook.es')
    .replace('@outook.es', '@outlook.es');
    
  return DEMO_CREDENTIALS.includes(normalizedEmail);
};

// Función para verificar si es admin de producción
export const isProductionAdmin = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail === 'complicesconectasw@outlook.es';
};

// Función para verificar si es admin demo (admin Y djwacko28@gmail.com)
export const isDemoAdmin = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail === 'admin' || normalizedEmail === 'djwacko28@gmail.com';
};

// Función para obtener contraseña demo - USA VARIABLES DE ENTORNO
export const getDemoPassword = (email: string): string | null => {
  const normalizedEmail = email.toLowerCase().trim()
    .replace('@otlook.es', '@outlook.es')
    .replace('@outllok.es', '@outlook.es')
    .replace('@outlok.es', '@outlook.es')
    .replace('@outook.es', '@outlook.es');
  
  // Usar función auxiliar que consulta env primero, luego fallback
  return getPasswordFromEnv(normalizedEmail);
};



// Función para obtener contraseña de producción - USA VARIABLES DE ENTORNO
export const getProductionPassword = (email: string): string | null => {
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail === 'complicesconectasw@outlook.es') {
    // Prioridad: variable de entorno, luego fallback
    return import.meta.env.VITE_PROD_PASSWORD_COMPLICESCONECTASW || 'Magy_Wacko_nala28';
  }
  return null;
};

// Función centralizada para manejar autenticación demo (SIN complicesconectasw@outlook.es)
export const handleDemoAuth = (email: string, accountType: string = 'single') => {
  const _config = getAppConfig();
  
  if (!isDemoCredential(email)) {
    logger.info('❌ Email no es credencial demo:', { email });
    return null;
  }
  
  // Bloquear complicesconectasw@outlook.es en modo demo
  if (email.toLowerCase().trim() === 'complicesconectasw@outlook.es') {
    logger.info('🚫 complicesconectasw@outlook.es es SOLO para producción real');
    return null;
  }
  
  // Configurar accountType específico para admins
  const finalAccountType = isDemoAdmin(email) ? 'admin' : accountType;
  
  const demoUser = {
    id: `demo-${Date.now()}`,
    email: email.toLowerCase().trim(),
    role: isDemoAdmin(email) ? 'admin' : 'user',
    accountType: finalAccountType,
    first_name: email === 'admin' ? 'Admin Demo' : 
                email === 'single@outlook.es' ? 'Sofía' :
                email === 'pareja@outlook.es' ? 'Carmen & Roberto' :
                email === 'djwacko28@gmail.com' ? 'DJ Wacko' :
                email.split('@')[0],
    is_demo: true,
    created_at: new Date().toISOString()
  };
  
  const demoSession = {
    user: demoUser,
    access_token: `demo-token-${Date.now()}`,
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // Store authentication flag AND user data in localStorage for Navigation
  localStorage.setItem('demo_authenticated', 'true');
  localStorage.setItem('userType', demoUser.accountType || demoUser.role);
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  
  logger.info('🎭 Demo user stored in localStorage:', { email, demoUser });
  
  logger.info('🎭 Sesión demo creada', { email, tipo: finalAccountType });
  
  return { user: demoUser, session: demoSession };
};

// Función para limpiar sesión demo
export const clearDemoAuth = () => {
  localStorage.removeItem('demo_authenticated');
  localStorage.removeItem('userType');
  localStorage.removeItem('demo_user');
  logger.info('🧹 Sesión demo limpiada');
};

// Función para verificar sesión demo existente
export const checkDemoSession = () => {
  const demoAuth = localStorage.getItem('demo_authenticated');
  
  // Solo verificar flag de autenticación - datos no se almacenan en localStorage
  if (demoAuth === 'true') {
    // Retornar null para forzar recreación de sesión demo
    // Los datos se mantienen solo en memoria durante la sesión activa
    return null;
  }
  
  return null;
};

// Función para verificar si estamos en modo demo
export const isDemoMode = () => {
  const config = getAppConfig();
  const demoAuth = localStorage.getItem('demo_authenticated');
  return config.mode === 'demo' || demoAuth === 'true';
};

// Función para verificar si debemos usar Supabase real
export const shouldUseRealSupabase = () => {
  const config = getAppConfig();
  const demoAuth = localStorage.getItem('demo_authenticated');
  
  logger.info('🔍 shouldUseRealSupabase', { modo: config.mode, demoAuth });
  
  // En modo producción, SIEMPRE usar Supabase real
  // No importa si hay datos demo en localStorage
  if (config.mode === 'production') {
    logger.info('🏢 Modo producción - usando Supabase real siempre');
    return true;
  }
  
  // En modo demo, solo usar Supabase para admins
  if (demoAuth === 'true') {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        const useSupabase = user.role === 'admin';
        logger.info('🎭 Usuario demo', { email: user.email, admin: user.role === 'admin', usarSupabase: useSupabase });
        return useSupabase;
      } catch (error) {
        logger.error('❌ Error parsing demo user', { error: error instanceof Error ? error.message : String(error) });
        return false;
      }
    }
  }
  
  logger.info('✅ Usando Supabase real por defecto');
  return true;
};

// Configuración global de la app
export const appConfig = getAppConfig();

// Log de configuración inicial
logger.info('🚀 ComplicesConecta iniciado', { modo: appConfig.mode });
if (appConfig.mode === 'demo') {
  logger.info('🎭 Modo demo activo - credenciales de prueba habilitadas');
  logger.info('📝 Credenciales demo:', DEMO_CREDENTIALS);
} else {
  logger.info('🔐 Modo producción activo - autenticación real requerida');
  logger.info('🏢 Credenciales producción:', { email: 'complicesconectasw@outlook.es' });
}
