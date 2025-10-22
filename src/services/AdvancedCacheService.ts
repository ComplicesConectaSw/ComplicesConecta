/**
 * AdvancedCacheService - Sistema de caché avanzado con múltiples estrategias
 * Implementa técnicas avanzadas de caché:
 * - Cache en memoria con LRU
 * - Cache persistente con IndexedDB
 * - Cache distribuido con Redis (futuro)
 * - Invalidación inteligente
 * - Compresión de datos
 */

import { logger } from '@/lib/logger';

export interface CacheConfig {
  maxMemorySize: number; // MB
  maxPersistentSize: number; // MB
  defaultTTL: number; // seconds
  compressionEnabled: boolean;
  enablePersistentCache: boolean;
  enableMemoryCache: boolean;
  cleanupInterval: number; // seconds
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  compressed: boolean;
  size: number;
}

export interface CacheStats {
  memoryEntries: number;
  persistentEntries: number;
  memorySize: number; // bytes
  persistentSize: number; // bytes
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  averageAccessTime: number;
  compressionRatio: number;
}

export interface CacheInvalidationRule {
  pattern: string;
  strategy: 'exact' | 'prefix' | 'regex';
  priority: number;
}

class AdvancedCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private persistentCache: IDBDatabase | null = null;
  private config: CacheConfig = {
    maxMemorySize: 50, // 50MB
    maxPersistentSize: 200, // 200MB
    defaultTTL: 300, // 5 minutes
    compressionEnabled: true,
    enablePersistentCache: true,
    enableMemoryCache: true,
    cleanupInterval: 60 // 1 minute
  };

  private stats = {
    hits: 0,
    misses: 0,
    totalAccessTime: 0,
    compressedSize: 0,
    originalSize: 0
  };

  private invalidationRules: CacheInvalidationRule[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializePersistentCache();
    this.startCleanupInterval();
    this.setupDefaultInvalidationRules();
  }

  /**
   * Inicializa el cache persistente con IndexedDB
   */
  private async initializePersistentCache(): Promise<void> {
    if (!this.config.enablePersistentCache) return;

    try {
      const request = indexedDB.open('ComplicesConectaCache', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.persistentCache = request.result;
        logger.info('✅ Persistent cache initialized');
      };

      request.onerror = () => {
        logger.warn('⚠️ Failed to initialize persistent cache');
      };
    } catch (error) {
      logger.warn('⚠️ Persistent cache not available', { error: String(error) });
    }
  }

  /**
   * Obtiene un valor del cache con estrategia multi-nivel
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // 1. Intentar desde cache en memoria
      if (this.config.enableMemoryCache) {
        const memoryResult = this.getFromMemoryCache<T>(key);
        if (memoryResult !== null) {
          this.stats.hits++;
          this.stats.totalAccessTime += Date.now() - startTime;
          logger.debug('✅ Memory cache hit', { key });
          return memoryResult;
        }
      }

      // 2. Intentar desde cache persistente
      if (this.config.enablePersistentCache && this.persistentCache) {
        const persistentResult = await this.getFromPersistentCache<T>(key);
        if (persistentResult !== null) {
          // Promover a cache en memoria
          this.setToMemoryCache(key, persistentResult, this.config.defaultTTL);
          this.stats.hits++;
          this.stats.totalAccessTime += Date.now() - startTime;
          logger.debug('✅ Persistent cache hit', { key });
          return persistentResult;
        }
      }

      // Cache miss
      this.stats.misses++;
      this.stats.totalAccessTime += Date.now() - startTime;
      logger.debug('❌ Cache miss', { key });
      return null;

    } catch (error) {
      logger.error('❌ Cache get error', { key, error: String(error) });
      return null;
    }
  }

  /**
   * Establece un valor en el cache con estrategia multi-nivel
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const actualTTL = ttl || this.config.defaultTTL;
    
    try {
      // 1. Establecer en cache en memoria
      if (this.config.enableMemoryCache) {
        this.setToMemoryCache(key, value, actualTTL);
      }

      // 2. Establecer en cache persistente
      if (this.config.enablePersistentCache && this.persistentCache) {
        await this.setToPersistentCache(key, value, actualTTL);
      }

      logger.debug('✅ Cache set', { key, ttl: actualTTL });

    } catch (error) {
      logger.error('❌ Cache set error', { key, error: String(error) });
    }
  }

  /**
   * Elimina un valor del cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Eliminar de ambos caches
      if (this.config.enableMemoryCache) {
        this.memoryCache.delete(key);
      }

      if (this.config.enablePersistentCache && this.persistentCache) {
        await this.deleteFromPersistentCache(key);
      }

      logger.debug('🗑️ Cache deleted', { key });

    } catch (error) {
      logger.error('❌ Cache delete error', { key, error: String(error) });
    }
  }

  /**
   * Invalida cache basado en reglas
   */
  async invalidate(pattern: string, strategy: 'exact' | 'prefix' | 'regex' = 'prefix'): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      // Encontrar claves que coincidan con el patrón
      if (strategy === 'exact') {
        keysToDelete.push(pattern);
      } else if (strategy === 'prefix') {
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(pattern)) {
            keysToDelete.push(key);
          }
        }
      } else if (strategy === 'regex') {
        const regex = new RegExp(pattern);
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            keysToDelete.push(key);
          }
        }
      }

      // Eliminar claves encontradas
      for (const key of keysToDelete) {
        await this.delete(key);
      }

      logger.info('🔄 Cache invalidated', { 
        pattern, 
        strategy, 
        keysDeleted: keysToDelete.length 
      });

    } catch (error) {
      logger.error('❌ Cache invalidation error', { pattern, error: String(error) });
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;
    const averageAccessTime = totalRequests > 0 ? this.stats.totalAccessTime / totalRequests : 0;
    const compressionRatio = this.stats.originalSize > 0 
      ? this.stats.compressedSize / this.stats.originalSize 
      : 1;

    return {
      memoryEntries: this.memoryCache.size,
      persistentEntries: 0, // TODO: Implementar conteo de entradas persistentes
      memorySize: this.calculateMemorySize(),
      persistentSize: 0, // TODO: Implementar cálculo de tamaño persistente
      hitRate,
      missRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      averageAccessTime,
      compressionRatio
    };
  }

  /**
   * Limpia el cache expirado
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Limpiar cache en memoria
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.memoryCache.delete(key);
    }

    // Limpiar cache persistente
    if (this.persistentCache) {
      await this.cleanupPersistentCache();
    }

    logger.info('🧹 Cache cleanup completed', { 
      expiredKeys: expiredKeys.length,
      memoryEntries: this.memoryCache.size
    });
  }

  /**
   * Obtiene valor del cache en memoria
   */
  private getFromMemoryCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = now;

    // Descomprimir si es necesario
    if (entry.compressed) {
      try {
        return this.decompress(entry.data);
      } catch (error) {
        logger.warn('⚠️ Failed to decompress cache entry', { key, error: String(error) });
        this.memoryCache.delete(key);
        return null;
      }
    }

    return entry.data;
  }

  /**
   * Establece valor en cache en memoria
   */
  private setToMemoryCache<T>(key: string, value: T, ttl: number): void {
    const now = Date.now();
    let data = value;
    let compressed = false;
    let size = this.calculateSize(value);

    // Comprimir si está habilitado y el tamaño es significativo
    if (this.config.compressionEnabled && size > 1024) { // > 1KB
      try {
        data = this.compress(value) as any;
        compressed = true;
        size = this.calculateSize(data);
        this.stats.compressedSize += size;
        this.stats.originalSize += this.calculateSize(value);
      } catch (error) {
        logger.warn('⚠️ Compression failed, storing uncompressed', { key, error: String(error) });
      }
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
      compressed,
      size
    };

    this.memoryCache.set(key, entry);

    // Verificar límite de tamaño y limpiar si es necesario
    this.enforceMemoryLimit();
  }

  /**
   * Obtiene valor del cache persistente
   */
  private async getFromPersistentCache<T>(key: string): Promise<T | null> {
    if (!this.persistentCache) return null;

    return new Promise((resolve) => {
      const transaction = this.persistentCache!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T>;
        if (!entry) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl * 1000) {
          // Eliminar entrada expirada
          this.deleteFromPersistentCache(key);
          resolve(null);
          return;
        }

        // Descomprimir si es necesario
        if (entry.compressed) {
          try {
            resolve(this.decompress(entry.data as string));
          } catch (error) {
            logger.warn('⚠️ Failed to decompress persistent cache entry', { key, error: String(error) });
            this.deleteFromPersistentCache(key);
            resolve(null);
          }
        } else {
          resolve(entry.data);
        }
      };

      request.onerror = () => {
        logger.warn('⚠️ Failed to get from persistent cache', { key });
        resolve(null);
      };
    });
  }

  /**
   * Establece valor en cache persistente
   */
  private async setToPersistentCache<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.persistentCache) return;

    const now = Date.now();
    let data = value;
    let compressed = false;
    let size = this.calculateSize(value);

    // Comprimir si está habilitado
    if (this.config.compressionEnabled && size > 1024) {
      try {
        data = this.compress(value) as any;
        compressed = true;
        size = this.calculateSize(data);
      } catch (error) {
        logger.warn('⚠️ Compression failed for persistent cache', { key, error: String(error) });
      }
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
      compressed,
      size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.persistentCache!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Elimina valor del cache persistente
   */
  private async deleteFromPersistentCache(key: string): Promise<void> {
    if (!this.persistentCache) return;

    return new Promise((resolve, reject) => {
      const transaction = this.persistentCache!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpia cache persistente expirado
   */
  private async cleanupPersistentCache(): Promise<void> {
    if (!this.persistentCache) return;

    return new Promise((resolve) => {
      const transaction = this.persistentCache!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('timestamp');
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now - this.config.defaultTTL * 1000);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => resolve();
    });
  }

  /**
   * Comprime datos usando JSON y base64
   */
  private compress(data: any): string {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }

  /**
   * Descomprime datos
   */
  private decompress<T>(compressedData: string): T {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  }

  /**
   * Calcula el tamaño aproximado de un objeto
   */
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Calcula el tamaño total del cache en memoria
   */
  private calculateMemorySize(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Aplica límite de memoria y elimina entradas menos usadas
   */
  private enforceMemoryLimit(): void {
    const maxSizeBytes = this.config.maxMemorySize * 1024 * 1024;
    let currentSize = this.calculateMemorySize();

    if (currentSize > maxSizeBytes) {
      // Ordenar por frecuencia de acceso y eliminar los menos usados
      const entries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.accessCount - b.accessCount);

      for (const [key, entry] of entries) {
        this.memoryCache.delete(key);
        currentSize -= entry.size;
        
        if (currentSize <= maxSizeBytes * 0.8) { // Mantener 80% del límite
          break;
        }
      }

      logger.info('🧹 Memory cache cleaned due to size limit', { 
        entriesRemoved: entries.length,
        newSize: this.calculateMemorySize()
      });
    }
  }

  /**
   * Inicia el intervalo de limpieza automática
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  /**
   * Configura reglas de invalidación por defecto
   */
  private setupDefaultInvalidationRules(): void {
    this.invalidationRules = [
      { pattern: 'profiles:', strategy: 'prefix', priority: 1 },
      { pattern: 'stories:', strategy: 'prefix', priority: 2 },
      { pattern: 'analytics:', strategy: 'prefix', priority: 3 },
      { pattern: 'user:', strategy: 'prefix', priority: 1 }
    ];
  }

  /**
   * Actualiza configuración del cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('⚙️ Cache config updated', { config: this.config });
  }

  /**
   * Limpia todo el cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.persistentCache) {
      const transaction = this.persistentCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.clear();
    }

    this.stats = {
      hits: 0,
      misses: 0,
      totalAccessTime: 0,
      compressedSize: 0,
      originalSize: 0
    };

    logger.info('🧹 All cache cleared');
  }

  /**
   * Destruye el servicio y limpia recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.memoryCache.clear();
    
    if (this.persistentCache) {
      this.persistentCache.close();
    }

    logger.info('🔚 Cache service destroyed');
  }
}

export const advancedCacheService = new AdvancedCacheService();
