/**
 * Utilidad segura para localStorage con validación y sanitización
 * Versión: 3.6.3
 * 
 * Proporciona funciones seguras para leer y escribir en localStorage
 * con validación de esquema, sanitización de datos y manejo de errores
 */

import { z } from 'zod';

/**
 * Esquemas de validación comunes para localStorage
 */
export const localStorageSchemas = {
  demo_authenticated: z.enum(['true', 'false']),
  demo_user: z.string().optional(),
  user_id: z.string().uuid().optional(),
  backup_history: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).max(5).optional(),
};

/**
 * Tipo para las claves válidas de localStorage
 */
export type LocalStorageKey = keyof typeof localStorageSchemas | string;

/**
 * Opciones para operaciones de localStorage
 */
interface LocalStorageOptions {
  validate?: boolean;
  schema?: z.ZodSchema;
  defaultValue?: unknown;
  sanitize?: boolean;
}

/**
 * Lee un valor de localStorage de forma segura
 * 
 * @param key - Clave del valor a leer
 * @param options - Opciones de lectura (validación, esquema, valor por defecto)
 * @returns Valor leído o valor por defecto si no existe o es inválido
 */
export function safeGetItem<T = unknown>(
  key: LocalStorageKey,
  options: LocalStorageOptions = {}
): T | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return (options.defaultValue as T) ?? null;
    }

    const rawValue = window.localStorage.getItem(key);
    
    if (rawValue === null) {
      return (options.defaultValue as T) ?? null;
    }

    // Intentar parsear JSON
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(rawValue);
    } catch {
      // Si no es JSON válido, usar el valor raw
      parsedValue = rawValue;
    }

    // Validar con esquema si se proporciona
    if (options.validate && options.schema) {
      const validationResult = options.schema.safeParse(parsedValue);
      if (!validationResult.success) {
        console.warn(`⚠️ Valor inválido en localStorage para clave "${key}":`, validationResult.error);
        return (options.defaultValue as T) ?? null;
      }
      return validationResult.data as T;
    }

    // Validar con esquema predefinido si existe
    if (options.validate && localStorageSchemas[key as keyof typeof localStorageSchemas]) {
      const schema = localStorageSchemas[key as keyof typeof localStorageSchemas];
      const validationResult = schema.safeParse(parsedValue);
      if (!validationResult.success) {
        console.warn(`⚠️ Valor inválido en localStorage para clave "${key}":`, validationResult.error);
        return (options.defaultValue as T) ?? null;
      }
      return validationResult.data as T;
    }

    return parsedValue as T;
  } catch (error) {
    console.error(`❌ Error leyendo de localStorage para clave "${key}":`, error);
    return (options.defaultValue as T) ?? null;
  }
}

/**
 * Escribe un valor en localStorage de forma segura
 * 
 * @param key - Clave del valor a escribir
 * @param value - Valor a escribir
 * @param options - Opciones de escritura (validación, esquema, sanitización)
 * @returns true si se escribió correctamente, false en caso contrario
 */
export function safeSetItem<T = unknown>(
  key: LocalStorageKey,
  value: T,
  options: LocalStorageOptions = {}
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('⚠️ localStorage no está disponible');
      return false;
    }

    // Validar con esquema si se proporciona
    if (options.validate && options.schema) {
      const validationResult = options.schema.safeParse(value);
      if (!validationResult.success) {
        console.error(`❌ Valor inválido para localStorage clave "${key}":`, validationResult.error);
        return false;
      }
      value = validationResult.data as T;
    }

    // Validar con esquema predefinido si existe
    if (options.validate && localStorageSchemas[key as keyof typeof localStorageSchemas]) {
      const schema = localStorageSchemas[key as keyof typeof localStorageSchemas];
      const validationResult = schema.safeParse(value);
      if (!validationResult.success) {
        console.error(`❌ Valor inválido para localStorage clave "${key}":`, validationResult.error);
        return false;
      }
      value = validationResult.data as T;
    }

    // Sanitizar si se solicita
    let sanitizedValue = value;
    if (options.sanitize && typeof value === 'string') {
      // Eliminar caracteres peligrosos para XSS
      sanitizedValue = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim() as T;
    }

    // Serializar a JSON si es un objeto
    const serializedValue = typeof sanitizedValue === 'string' 
      ? sanitizedValue 
      : JSON.stringify(sanitizedValue);

    // Verificar tamaño (localStorage tiene límite de ~5-10MB)
    if (serializedValue.length > 5 * 1024 * 1024) {
      console.error(`❌ Valor demasiado grande para localStorage clave "${key}" (${serializedValue.length} bytes)`);
      return false;
    }

    window.localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`❌ Error escribiendo en localStorage para clave "${key}":`, error);
    return false;
  }
}

/**
 * Elimina un valor de localStorage de forma segura
 * 
 * @param key - Clave del valor a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export function safeRemoveItem(key: LocalStorageKey): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando de localStorage para clave "${key}":`, error);
    return false;
  }
}

/**
 * Limpia todo el localStorage de forma segura
 * 
 * @returns true si se limpió correctamente, false en caso contrario
 */
export function safeClear(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('❌ Error limpiando localStorage:', error);
    return false;
  }
}

/**
 * Obtiene todas las claves de localStorage de forma segura
 * 
 * @returns Array de claves o array vacío si hay error
 */
export function safeGetKeys(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('❌ Error obteniendo claves de localStorage:', error);
    return [];
  }
}

