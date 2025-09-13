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

// Obtener configuración desde variables de entorno
export const getAppConfig = (): AppConfig => {
  const mode = (import.meta.env.VITE_APP_MODE || 'production') as 'demo' | 'production';
  
  console.log('🔧 Configuración de aplicación:', {
    mode,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante'
  });
  
  return {
    mode,
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || 'https://axtvqnozatbmllvwzuim.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ5MDYsImV4cCI6MjA2MTY2MDkwNn0.yzrgK-Z-DR7lsUqftnVUA0GMsWQuf62zSAmDNxZKG9Y'
    },
    features: {
      demoCredentials: true, // Siempre permitir credenciales demo
      realAuth: mode === 'production', // Solo auth real en producción
      adminAccess: true // Permitir acceso admin en ambos modos
    },
    ui: {
      showDemoIndicator: mode === 'demo',
      demoLabel: mode === 'demo' ? '(Demo)' : ''
    }
  };
};

// Credenciales demo permitidas (INCLUIR djwacko28@gmail.com)
export const DEMO_CREDENTIALS = [
  'single@outlook.es',
  'pareja@outlook.es', 
  'admin',
  'djwacko28@gmail.com',        // Admin DEMO - usa datos demo
  'apoyofinancieromexicano@gmail.com'
];

// Contraseñas demo por email (INCLUIR djwacko28@gmail.com)
export const DEMO_PASSWORDS: Record<string, string> = {
  'single@outlook.es': '123456',
  'pareja@outlook.es': '123456',
  'admin': '123456',
  'djwacko28@gmail.com': 'Magy_Wacko_nala28', // Admin DEMO
  'apoyofinancieromexicano@gmail.com': '123456'
};

// Lista de emails admin para verificación rápida - CORREGIDA
const ADMIN_EMAILS = [
  'admin',                      // Admin demo solamente
  'djwacko28@gmail.com',        // Admin DEMO (no producción)
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
    console.log('❌ Email no es credencial demo:', email);
    return null;
  }
  
  // Bloquear complicesconectasw@outlook.es en modo demo
  if (email.toLowerCase().trim() === 'complicesconectasw@outlook.es') {
    console.log('🚫 complicesconectasw@outlook.es es SOLO para producción real');
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
                email === 'single@outlook.es' ? 'Single Demo' :
                email === 'pareja@outlook.es' ? 'Pareja Demo' :
                email === 'djwacko28@gmail.com' ? 'DJ Wacko' :
                email === 'apoyofinancieromexicano@gmail.com' ? 'Apoyo Financiero' :
                email.split('@')[0],
    is_demo: true,
    created_at: new Date().toISOString()
  };
  
  const demoSession = {
    user: demoUser,
    access_token: `demo-token-${Date.now()}`,
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // Store in localStorage
  localStorage.setItem('demo_authenticated', 'true');
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  localStorage.setItem('demo_session', JSON.stringify(demoSession));
  localStorage.setItem('userType', demoUser.role);
  
  console.log('🎭 Sesión demo creada para:', email, 'Tipo:', finalAccountType);
  
  return { user: demoUser, session: demoSession };
};

// Función para limpiar sesión demo
export const clearDemoAuth = () => {
  localStorage.removeItem('demo_authenticated');
  localStorage.removeItem('demo_user');
  localStorage.removeItem('demo_session');
  localStorage.removeItem('userType');
  console.log('🧹 Sesión demo limpiada');
};

// Función para verificar sesión demo existente
export const checkDemoSession = () => {
  const demoAuth = localStorage.getItem('demo_authenticated');
  const demoUser = localStorage.getItem('demo_user');
  const demoSession = localStorage.getItem('demo_session');
  
  if (demoAuth === 'true' && demoUser && demoSession) {
    try {
      // Verificar que los valores no sean strings simples como "active"
      if (demoUser === 'active' || demoSession === 'active') {
        console.warn('🧹 Limpiando datos de sesión demo corruptos');
        clearDemoAuth();
        return null;
      }
      
      const user = JSON.parse(demoUser);
      const session = JSON.parse(demoSession);
      
      // Verificar si la sesión no ha expirado
      if (session.expires_at && Date.now() < session.expires_at) {
        console.log('✅ Sesión demo válida encontrada para:', user.email);
        return { user, session: { user } };
      } else {
        console.log('⏰ Sesión demo expirada, limpiando...');
        clearDemoAuth();
      }
    } catch (error) {
      console.error('❌ Error parsing demo session:', error);
      clearDemoAuth();
    }
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
  
  console.log('🔍 shouldUseRealSupabase - Modo:', config.mode, 'DemoAuth:', demoAuth);
  
  // En modo producción, SIEMPRE usar Supabase real
  // No importa si hay datos demo en localStorage
  if (config.mode === 'production') {
    console.log('🏢 Modo producción - usando Supabase real siempre');
    return true;
  }
  
  // En modo demo, solo usar Supabase para admins
  if (demoAuth === 'true') {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        const useSupabase = user.role === 'admin';
        console.log('🎭 Usuario demo:', user.email, 'Admin:', user.role === 'admin', 'Usar Supabase:', useSupabase);
        return useSupabase;
      } catch (error) {
        console.error('❌ Error parsing demo user:', error);
        return false;
      }
    }
  }
  
  console.log('✅ Usando Supabase real por defecto');
  return true;
};

// Configuración global de la app
export const appConfig = getAppConfig();

// Log de configuración inicial
console.log('🚀 ComplicesConecta iniciado en modo:', appConfig.mode);
if (appConfig.mode === 'demo') {
  console.log('🎭 Modo demo activo - credenciales de prueba habilitadas');
  console.log('📝 Credenciales demo:', DEMO_CREDENTIALS);
} else {
  console.log('🔐 Modo producción activo - autenticación real requerida');
  console.log('🏢 Credenciales producción:', { email: 'complicesconectasw@outlook.es' });
}
