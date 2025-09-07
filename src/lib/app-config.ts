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
  const mode = (import.meta.env.VITE_APP_MODE || 'demo') as 'demo' | 'production';
  
  return {
    mode,
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'
    },
    features: {
      demoCredentials: true, // Siempre permitir credenciales demo
      realAuth: true, // Habilitar autenticación real
      adminAccess: true // Permitir acceso admin en demo
    },
    ui: {
      showDemoIndicator: mode === 'demo',
      demoLabel: mode === 'demo' ? '(Demo)' : ''
    }
  };
};

// Credenciales demo permitidas con contraseñas
export const DEMO_CREDENTIALS = [
  'single@outlook.es',
  'pareja@outlook.es', 
  'djwacko28@gmail.com',
  'complicesconectasw@outlook.es'
];

// Contraseñas demo por email
export const DEMO_PASSWORDS = {
  'single@outlook.es': '123456',
  'pareja@outlook.es': '123456',
  'djwacko28@gmail.com': '123456',
  'complicesconectasw@outlook.es': '123456'
};

// Credenciales de producción para admin
export const PRODUCTION_ADMIN_CREDENTIALS = [
  'complicesconectasw@outlook.es'
];

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
  return PRODUCTION_ADMIN_CREDENTIALS.includes(normalizedEmail);
};

// Función para verificar si es admin demo
export const isDemoAdmin = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail === 'djwacko28@gmail.com' || normalizedEmail === 'complicesconectasw@outlook.es';
};

// Función centralizada para manejar autenticación demo
export const handleDemoAuth = (email: string, accountType: string = 'single') => {
  if (!isDemoCredential(email)) return null;
  
  // Configurar accountType específico para admins
  const finalAccountType = isDemoAdmin(email) ? 'admin' : accountType;
  
  const demoUser = {
    id: `demo-${Date.now()}`,
    email: email.toLowerCase().trim(),
    role: isDemoAdmin(email) ? 'admin' : 'user',
    accountType: finalAccountType,
    first_name: email === 'djwacko28@gmail.com' ? 'DJ Wacko' : 
                email === 'complicesconectasw@outlook.es' ? 'Complices Admin' :
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
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  localStorage.setItem('demo_session', JSON.stringify(demoSession));
  localStorage.setItem('userType', demoUser.role);
  
  return { user: demoUser, session: demoSession };
};

// Función para limpiar sesión demo
export const clearDemoAuth = () => {
  localStorage.removeItem('demo_user');
  localStorage.removeItem('demo_session');
  localStorage.removeItem('userType');
};

// Función para verificar sesión demo existente
export const checkDemoSession = () => {
  const demoUser = localStorage.getItem('demo_user');
  const demoSession = localStorage.getItem('demo_session');
  const userType = localStorage.getItem('userType');
  
  if (demoUser && demoSession && userType) {
    try {
      // Verificar que los valores no sean strings simples como "active"
      if (demoUser === 'active' || demoSession === 'active' || userType === 'active') {
        console.warn('🧹 Limpiando datos de sesión demo corruptos');
        clearDemoAuth();
        return null;
      }
      
      const user = JSON.parse(demoUser);
      const session = JSON.parse(demoSession);
      
      // Verificar si la sesión no ha expirado
      if (session.expires_at && Date.now() < session.expires_at) {
        return { user, session: { user } };
      } else {
        clearDemoAuth();
      }
    } catch (error) {
      console.error('Error parsing demo session:', error);
      clearDemoAuth();
    }
  }
  
  return null;
};

// Configuración global de la app
export const appConfig = getAppConfig();
