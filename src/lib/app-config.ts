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

// Credenciales demo permitidas (SOLO perfiles demo esenciales)
export const DEMO_CREDENTIALS = [
  'single@outlook.es',
  'pareja@outlook.es', 
  'admin'
];

// Contraseñas demo por email (SOLO perfiles demo esenciales)
export const DEMO_PASSWORDS: Record<string, string> = {
  'single@outlook.es': '123456',
  'pareja@outlook.es': '123456',
  'admin': '123456'
};

// Lista de emails admin para verificación rápida - PRODUCCIÓN
const ADMIN_EMAILS = [
  'admin',                      // Admin demo solamente
  'complicesconectasw@outlook.es'  // ÚNICO admin producción REAL
];

// Configuración de credenciales para modo producción
export const productionCredentials = {
  email: 'complicesconectasw@outlook.es',
  password: 'Magy_Wacko_nala28'
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

// Función para obtener contraseña demo
export const getDemoPassword = (email: string): string | null => {
  const normalizedEmail = email.toLowerCase().trim()
    .replace('@otlook.es', '@outlook.es')
    .replace('@outllok.es', '@outlook.es')
    .replace('@outlok.es', '@outlook.es')
    .replace('@outook.es', '@outlook.es');
  
  return DEMO_PASSWORDS[normalizedEmail] || null;
};

// Función para obtener contraseña de producción
export const getProductionPassword = (email: string): string | null => {
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail === 'complicesconectasw@outlook.es') {
    return 'Magy_Wacko_nala28';
  }
  return null;
};

// Función centralizada para manejar autenticación demo (SIN complicesconectasw@outlook.es)
export const handleDemoAuth = (email: string, accountType: string = 'single') => {
  const config = getAppConfig();
  
  if (!isDemoCredential(email)) {
    logger.info('❌ Email no es credencial demo:', { email });
    return null;
  }
  
  // Bloquear complicesconectasw@outlook.es en modo demo
  if (email.toLowerCase().trim() === 'complicesconectasw@outlook.es') {
    logger.info('🚫 complicesconectasw@outlook.es es SOLO para producción real');
    return null;
  }
  
  // Importar datos demo para perfiles completos usando require síncrono
  let demoProfiles: any[] = [];
  try {
    const demoData = require('../demo/demoData');
    demoProfiles = demoData.demoProfiles || [];
  } catch (error) {
    logger.warn('No se pudieron cargar datos demo:', { error: String(error) });
    demoProfiles = [];
  }
  
  // Buscar perfil demo completo por email
  const fullDemoProfile = demoProfiles.find((profile: any) => 
    profile.email === email.toLowerCase().trim()
  );
  
  // Configurar accountType específico para admins
  const finalAccountType = isDemoAdmin(email) ? 'admin' : accountType;
  
  const demoUser = fullDemoProfile ? {
    ...fullDemoProfile,
    role: isDemoAdmin(email) ? 'admin' : fullDemoProfile.role || 'user',
    accountType: finalAccountType,
    is_demo: true,
    created_at: fullDemoProfile.created_at || new Date().toISOString()
  } : {
    id: `demo-${Date.now()}`,
    email: email.toLowerCase().trim(),
    role: isDemoAdmin(email) ? 'admin' : 'user',
    accountType: finalAccountType,
    first_name: email === 'admin' ? 'Admin Demo' : 
                email === 'single@outlook.es' ? 'Sofía' :
                email === 'pareja@outlook.es' ? 'Carmen & Roberto' :
                email.split('@')[0],
    is_demo: true,
    created_at: new Date().toISOString()
  };
  
  const demoSession = {
    user: demoUser,
    access_token: `demo-token-${Date.now()}`,
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // Store authentication flag and demo user profile in localStorage
  localStorage.setItem('demo_authenticated', 'true');
  localStorage.setItem('userType', demoUser.role);
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  
  logger.info('💾 Perfil demo guardado:', { 
    email: demoUser.email, 
    name: demoUser.first_name,
    hasFullProfile: !!fullDemoProfile 
  });
  
  logger.info('🎭 Sesión demo creada', { email, tipo: finalAccountType });
  
  return { user: demoUser, session: demoSession };
};

// Función para limpiar sesión demo
export const clearDemoAuth = () => {
  localStorage.removeItem('demo_authenticated');
  localStorage.removeItem('userType');
  // ELIMINADO: Limpiar datos de usuario que ya no se almacenan
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
  logger.info('📝 Credenciales demo:', { credentials: DEMO_CREDENTIALS });
} else {
  logger.info('🔐 Modo producción activo - autenticación real requerida');
  logger.info('🏢 Credenciales producción:', { email: 'complicesconectasw@outlook.es' });
}
