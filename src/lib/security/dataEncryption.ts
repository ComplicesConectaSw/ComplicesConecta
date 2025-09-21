/**
 * Sistema de encriptación para datos sensibles en localStorage y Supabase
 * Protege información crítica sin modificar lógica de autenticación existente
 */

import { logger } from '@/lib/logger';

// Configuración de encriptación
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 16,
  iterations: 100000, // PBKDF2 iterations
  saltLength: 16
} as const;

// Tipos de datos que requieren encriptación
const SENSITIVE_DATA_TYPES = {
  // Datos de perfil sensibles
  PROFILE_PRIVATE: 'profile_private',
  CONTACT_INFO: 'contact_info', 
  LOCATION_DATA: 'location_data',
  
  // Datos de tokens y transacciones
  TOKEN_BALANCE: 'token_balance',
  TRANSACTION_HISTORY: 'transaction_history',
  STAKING_INFO: 'staking_info',
  
  // Datos de chat y comunicación
  CHAT_MESSAGES: 'chat_messages',
  PRIVATE_NOTES: 'private_notes',
  
  // Configuraciones sensibles
  USER_PREFERENCES: 'user_preferences',
  SECURITY_SETTINGS: 'security_settings'
} as const;

interface EncryptedData {
  data: string;           // Datos encriptados en base64
  iv: string;            // Vector de inicialización
  salt: string;          // Salt para derivación de clave
  type: string;          // Tipo de dato encriptado
  timestamp: number;     // Timestamp de encriptación
  version: string;       // Versión del algoritmo
}

interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

class DataEncryption {
  private keyCache = new Map<string, EncryptionKey>();
  private isSupported: boolean;

  constructor() {
    this.isSupported = this.checkCryptoSupport();
    
    if (!this.isSupported) {
      logger.warn('⚠️ Web Crypto API no soportada, usando fallback');
    }
  }

  /**
   * Verifica soporte de Web Crypto API
   */
  private checkCryptoSupport(): boolean {
    return typeof window !== 'undefined' && 
           window.crypto && 
           window.crypto.subtle !== undefined;
  }

  /**
   * Genera una clave de encriptación derivada de contraseña
   */
  private async deriveKey(
    password: string, 
    salt: Uint8Array
  ): Promise<CryptoKey> {
    if (!this.isSupported) {
      throw new Error('Encriptación no soportada en este navegador');
    }

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Importar contraseña como clave base
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derivar clave final usando PBKDF2
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    return key;
  }

  /**
   * Obtiene o genera una clave de encriptación
   */
  private async getEncryptionKey(userId: string): Promise<EncryptionKey> {
    // Verificar cache
    if (this.keyCache.has(userId)) {
      return this.keyCache.get(userId)!;
    }

    // Generar salt único por usuario
    const salt = window.crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
    
    // Usar ID de usuario como base para la contraseña
    // En producción, esto debería combinarse con datos adicionales del usuario
    const password = `complices_${userId}_encryption_key`;
    
    const key = await this.deriveKey(password, salt);
    
    const encryptionKey = { key, salt };
    this.keyCache.set(userId, encryptionKey);
    
    return encryptionKey;
  }

  /**
   * Encripta datos sensibles
   */
  public async encryptData(
    data: any, 
    userId: string, 
    dataType: string
  ): Promise<EncryptedData> {
    try {
      if (!this.isSupported) {
        // Fallback: retornar datos sin encriptar pero marcados
        logger.warn('🔓 Datos no encriptados (crypto no soportado)', { dataType });
        return {
          data: btoa(JSON.stringify(data)),
          iv: '',
          salt: '',
          type: dataType,
          timestamp: Date.now(),
          version: 'fallback'
        };
      }

      const { key, salt } = await this.getEncryptionKey(userId);
      
      // Generar IV aleatorio
      const iv = window.crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
      
      // Convertir datos a buffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      // Encriptar
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv
        },
        key,
        dataBuffer
      );
      
      const result: EncryptedData = {
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
        salt: this.arrayBufferToBase64(salt.buffer as ArrayBuffer),
        type: dataType,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      logger.info('🔐 Datos encriptados exitosamente', { 
        dataType, 
        userId: userId.substring(0, 8) + '***',
        size: encryptedBuffer.byteLength 
      });
      
      return result;
      
    } catch (error) {
      logger.error('❌ Error encriptando datos', { dataType, error });
      throw new Error(`Error de encriptación: ${error}`);
    }
  }

  /**
   * Desencripta datos
   */
  public async decryptData<T = any>(
    encryptedData: EncryptedData, 
    userId: string
  ): Promise<T> {
    try {
      // Manejar fallback
      if (encryptedData.version === 'fallback') {
        const jsonString = atob(encryptedData.data);
        return JSON.parse(jsonString);
      }

      if (!this.isSupported) {
        throw new Error('No se puede desencriptar: crypto no soportado');
      }

      // Reconstruir clave usando el salt almacenado
      const saltBuffer = this.base64ToArrayBuffer(encryptedData.salt);
      const password = `complices_${userId}_encryption_key`;
      const key = await this.deriveKey(password, new Uint8Array(saltBuffer));
      
      // Reconstruir IV y datos
      const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);
      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      
      // Desencriptar datos
      const iv = new Uint8Array(ivBuffer);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // Convertir de vuelta a objeto
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);
      const result = JSON.parse(jsonString);
      
      logger.info('🔓 Datos desencriptados exitosamente', { 
        dataType: encryptedData.type,
        userId: userId.substring(0, 8) + '***'
      });
      
      return result;
      
    } catch (error) {
      logger.error('❌ Error desencriptando datos', { 
        dataType: encryptedData.type, 
        error 
      });
      throw new Error(`Error de desencriptación: ${error}`);
    }
  }

  /**
   * Convierte ArrayBuffer a Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Limpia cache de claves (para logout)
   */
  public clearKeyCache(userId?: string): void {
    if (userId) {
      this.keyCache.delete(userId);
      logger.info('🧹 Cache de clave limpiado para usuario', { 
        userId: userId.substring(0, 8) + '***' 
      });
    } else {
      this.keyCache.clear();
      logger.info('🧹 Cache de claves completamente limpiado');
    }
  }
}

// Instancia singleton
const dataEncryption = new DataEncryption();

/**
 * Wrapper para localStorage con encriptación automática
 */
export class SecureStorage {
  
  /**
   * Guarda datos encriptados en localStorage
   */
  public static async setItem(
    key: string, 
    value: any, 
    userId: string, 
    dataType: string = SENSITIVE_DATA_TYPES.USER_PREFERENCES
  ): Promise<void> {
    try {
      const encryptedData = await dataEncryption.encryptData(value, userId, dataType);
      localStorage.setItem(`encrypted_${key}`, JSON.stringify(encryptedData));
      
      logger.info('💾 Datos guardados encriptados en localStorage', { 
        key, 
        dataType,
        userId: userId.substring(0, 8) + '***'
      });
      
    } catch (error) {
      logger.error('❌ Error guardando datos encriptados', { key, error });
      // Fallback: guardar sin encriptar
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Recupera y desencripta datos de localStorage
   */
  public static async getItem<T = any>(
    key: string, 
    userId: string
  ): Promise<T | null> {
    try {
      // Intentar cargar versión encriptada primero
      const encryptedItem = localStorage.getItem(`encrypted_${key}`);
      
      if (encryptedItem) {
        const encryptedData: EncryptedData = JSON.parse(encryptedItem);
        return await dataEncryption.decryptData<T>(encryptedData, userId);
      }
      
      // Fallback: cargar versión no encriptada
      const plainItem = localStorage.getItem(key);
      if (plainItem) {
        logger.info('📖 Cargando datos no encriptados (fallback)', { key });
        return JSON.parse(plainItem);
      }
      
      return null;
      
    } catch (error) {
      logger.error('❌ Error cargando datos de localStorage', { key, error });
      return null;
    }
  }

  /**
   * Elimina datos encriptados
   */
  public static removeItem(key: string): void {
    localStorage.removeItem(`encrypted_${key}`);
    localStorage.removeItem(key); // También remover versión no encriptada
    
    logger.info('🗑️ Datos eliminados de localStorage', { key });
  }

  /**
   * Migra datos existentes a formato encriptado
   */
  public static async migrateToEncrypted(
    key: string, 
    userId: string, 
    dataType: string
  ): Promise<boolean> {
    try {
      const plainItem = localStorage.getItem(key);
      if (!plainItem) return false;
      
      const data = JSON.parse(plainItem);
      await this.setItem(key, data, userId, dataType);
      
      // Remover versión no encriptada después de migrar
      localStorage.removeItem(key);
      
      logger.info('🔄 Datos migrados a formato encriptado', { key, dataType });
      return true;
      
    } catch (error) {
      logger.error('❌ Error migrando datos a encriptado', { key, error });
      return false;
    }
  }
}

/**
 * Hook para usar encriptación en componentes React
 */
export const useDataEncryption = (userId: string) => {
  const encryptAndStore = async (
    key: string, 
    data: any, 
    dataType: string = SENSITIVE_DATA_TYPES.USER_PREFERENCES
  ) => {
    await SecureStorage.setItem(key, data, userId, dataType);
  };

  const decryptAndLoad = async <T = any>(key: string): Promise<T | null> => {
    return await SecureStorage.getItem<T>(key, userId);
  };

  const removeSecure = (key: string) => {
    SecureStorage.removeItem(key);
  };

  const migrateData = async (key: string, dataType: string) => {
    return await SecureStorage.migrateToEncrypted(key, userId, dataType);
  };

  const clearUserCache = () => {
    dataEncryption.clearKeyCache(userId);
  };

  return {
    encryptAndStore,
    decryptAndLoad,
    removeSecure,
    migrateData,
    clearUserCache
  };
};

export { 
  dataEncryption, 
  SENSITIVE_DATA_TYPES, 
  ENCRYPTION_CONFIG,
  type EncryptedData 
};
export default DataEncryption;
