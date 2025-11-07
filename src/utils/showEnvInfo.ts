/**
 * Utilidad para mostrar información de variables de entorno en consola
 * Versión: 3.5.1
 * 
 * Uso: Importar y llamar showEnvInfo() en la consola del navegador
 */

export function showEnvInfo(): void {
  console.group('🔐 Variables de Entorno - ComplicesConecta v3.5.1');
  
  // Mostrar todas las variables de entorno
  const env = import.meta.env;
  
  console.log('📋 Todas las variables de entorno:');
  console.table(env);
  
  // Mostrar variables VITE_* específicas
  console.log('\n🔑 Variables VITE_* (CONTRASEÑAS COMPLETAS):');
  const viteVars: Record<string, string> = {};
  
  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      const value = env[key];
      viteVars[key] = value; // Mostrar valores completos en desarrollo
    }
  });
  
  console.table(viteVars);
  
  // Mostrar contraseñas específicas
  console.log('\n🔐 Contraseñas disponibles:');
  const passwordKeys = Object.keys(env).filter(key => 
    key.match(/PASSWORD/i) && key.startsWith('VITE_')
  );
  
  passwordKeys.forEach((key) => {
    console.log(`  ${key}:`, env[key]);
  });
  
  // Información adicional
  console.log('\n📊 Información del entorno:');
  console.log('Mode:', env.MODE);
  console.log('Dev:', env.DEV);
  console.log('Prod:', env.PROD);
  console.log('Base URL:', env.BASE_URL);
  
  console.groupEnd();
  
  // Retornar objeto con información (para uso en consola)
  return {
    env,
    viteVars,
    mode: env.MODE,
    dev: env.DEV,
    prod: env.PROD,
    baseUrl: env.BASE_URL
  };
}

// Hacer disponible globalmente para uso en consola
// CRÍTICO: Asegurar que las funciones estén disponibles inmediatamente
if (typeof window !== 'undefined') {
  const exposeEnvFunctions = () => {
    (window as any).showEnvInfo = showEnvInfo;
    (window as any).env = import.meta.env;
    (window as any).getPassword = (key: string) => {
      const value = import.meta.env[key];
      if (value) {
        console.log(`🔑 ${key}:`, value);
        return value;
      } else {
        console.warn(`⚠️ Variable ${key} no encontrada`);
        return null;
      }
    };
    
    // Verificar que las funciones se expusieron correctamente
    if ((window as any).showEnvInfo) {
      console.log('✅ Utilidad de variables de entorno cargada');
      console.log('💡 Usa showEnvInfo() en la consola para ver información');
      console.log('💡 Usa window.env para acceder a todas las variables');
      console.log('💡 Usa getPassword("VITE_XXX") para ver una contraseña específica');
      console.log('💡 Ejemplo: getPassword("VITE_DEMO_PASSWORD_SINGLE_OUTLOOK_ES")');
    }
  };
  
  // Exponer inmediatamente
  exposeEnvFunctions();
  
  // También exponer cuando el DOM esté listo (por si acaso)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', exposeEnvFunctions);
  } else {
    // DOM ya está listo, exponer de nuevo para asegurar
    exposeEnvFunctions();
  }
}

