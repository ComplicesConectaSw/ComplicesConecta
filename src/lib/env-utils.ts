/**
 * Environment Utilities - Funciones para obtener variables de entorno
 * Compatible con Vite (import.meta.env) y Node.js (process.env)
 * 
 * @version 3.5.0
 */

/**
 * Obtiene una variable de entorno, funcionando tanto en Vite como en Node.js
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  // Verificar si estamos en contexto Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // Si estamos en Node.js, usar process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
}

/**
 * Verifica si estamos en modo desarrollo
 */
export function isDevelopment(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  }
  
  return false;
}

/**
 * Verifica si estamos en modo producción
 */
export function isProduction(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PROD === true;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  
  return false;
}

/**
 * Obtiene una variable de entorno con prefijo VITE_ (para compatibilidad)
 */
export function getViteEnv(key: string, defaultValue?: string): string | undefined {
  // Intentar con prefijo VITE_ primero
  const withPrefix = `VITE_${key}`;
  const value = getEnvVar(withPrefix, undefined);
  
  if (value !== undefined) {
    return value;
  }
  
  // Si no tiene prefijo, intentar sin él
  return getEnvVar(key, defaultValue);
}

