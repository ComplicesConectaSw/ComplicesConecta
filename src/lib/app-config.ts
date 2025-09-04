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
      demoCredentials: mode === 'demo',
      realAuth: mode === 'production',
      adminAccess: mode === 'production' || import.meta.env.VITE_APP_ENV === 'development'
    },
    ui: {
      showDemoIndicator: mode === 'demo',
      demoLabel: mode === 'demo' ? '(Demo)' : ''
    }
  };
};

// Credenciales demo permitidas
export const DEMO_CREDENTIALS = [
  'single@outlook.es',
  'pareja@outlook.es', 
  'djwacko28@gmail.com'
];

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
  return normalizedEmail === 'djwacko28@gmail.com';
};

// Configuración global de la app
export const appConfig = getAppConfig();
