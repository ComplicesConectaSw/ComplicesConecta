import { logger } from '@/lib/logger';

/**
 * Sistema de Cache Redis para ComplicesConecta
 * Mejora el performance de consultas frecuentes
 */

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number; // Time to live en segundos
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RedisCache {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private isRedisAvailable = false;

  constructor(config: CacheConfig) {
    this.config = config;
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // En modo demo, usar cache en memoria
      const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
      
      if (isDemoMode) {
        logger.info('🎭 Cache Redis: Modo demo - usando cache en memoria', {});
        this.isRedisAvailable = false;
        return;
      }

      // En producción, intentar conectar a Redis
      logger.info('🔗 Intentando conectar a Redis...', { host: this.config.host, port: this.config.port });
      
      // Simulación de conexión Redis (en producción usar redis client real)
      this.isRedisAvailable = false; // Por ahora usar fallback a memoria
      logger.info('📦 Cache Redis: Usando fallback a memoria por ahora', {});
      
    } catch (error) {
      logger.warn('⚠️ Redis no disponible, usando cache en memoria', { error });
      this.isRedisAvailable = false;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const finalTtl = ttl || this.config.ttl;
    const cacheItem: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: finalTtl
    };

    try {
      if (this.isRedisAvailable) {
        // TODO: Implementar Redis real
        // await this.redisClient.setex(key, finalTtl, JSON.stringify(value));
        logger.info('📦 Cache Redis SET (simulado)', { key, ttl: finalTtl });
      } else {
        // Fallback a memoria
        this.memoryCache.set(key, cacheItem);
        logger.info('🧠 Cache Memoria SET', { key, ttl: finalTtl });
      }
    } catch (error) {
      logger.error('❌ Error al guardar en cache', { key, error });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isRedisAvailable) {
        // TODO: Implementar Redis real
        // const result = await this.redisClient.get(key);
        // return result ? JSON.parse(result) : null;
        logger.info('📦 Cache Redis GET (simulado)', { key });
        return null;
      } else {
        // Fallback a memoria
        const item = this.memoryCache.get(key);
        
        if (!item) {
          logger.info('🧠 Cache Memoria MISS', { key });
          return null;
        }

        // Verificar TTL
        const now = Date.now();
        const isExpired = (now - item.timestamp) > (item.ttl * 1000);
        
        if (isExpired) {
          this.memoryCache.delete(key);
          logger.info('⏰ Cache Memoria EXPIRED', { key });
          return null;
        }

        logger.info('🧠 Cache Memoria HIT', { key });
        return item.data as T;
      }
    } catch (error) {
      logger.error('❌ Error al leer cache', { key, error });
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable) {
        // TODO: Implementar Redis real
        // await this.redisClient.del(key);
        logger.info('📦 Cache Redis DELETE (simulado)', { key });
      } else {
        this.memoryCache.delete(key);
        logger.info('🧠 Cache Memoria DELETE', { key });
      }
    } catch (error) {
      logger.error('❌ Error al eliminar cache', { key, error });
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isRedisAvailable) {
        // TODO: Implementar Redis real
        // await this.redisClient.flushdb();
        logger.info('📦 Cache Redis CLEAR (simulado)', {});
      } else {
        this.memoryCache.clear();
        logger.info('🧠 Cache Memoria CLEAR', {});
      }
    } catch (error) {
      logger.error('❌ Error al limpiar cache', { error });
    }
  }

  // Estadísticas del cache
  getStats() {
    return {
      isRedisAvailable: this.isRedisAvailable,
      memoryItems: this.memoryCache.size,
      config: this.config
    };
  }

  // Limpieza automática de items expirados en memoria
  private cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      const isExpired = (now - item.timestamp) > (item.ttl * 1000);
      if (isExpired) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('🧹 Cache cleanup completado', { itemsEliminados: cleaned });
    }
  }

  // Iniciar limpieza automática cada 5 minutos
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // 5 minutos
  }
}

// Configuración por defecto
const defaultConfig: CacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  ttl: 300 // 5 minutos por defecto
};

// Instancia singleton
export const redisCache = new RedisCache(defaultConfig);

// Iniciar limpieza automática
redisCache.startCleanupInterval();

// Funciones de utilidad para casos específicos
export const CacheKeys = {
  PROFILE: (userId: string) => `profile:${userId}`,
  MATCHES: (userId: string) => `matches:${userId}`,
  CHAT_MESSAGES: (chatId: string) => `chat:${chatId}`,
  TOKEN_BALANCE: (userId: string) => `tokens:${userId}`,
  FEED_POSTS: (userId: string, page: number) => `feed:${userId}:${page}`,
  USER_STATS: (userId: string) => `stats:${userId}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`
};

export const CacheTTL = {
  SHORT: 60,      // 1 minuto
  MEDIUM: 300,    // 5 minutos
  LONG: 1800,     // 30 minutos
  VERY_LONG: 3600 // 1 hora
};

logger.info('🚀 Sistema de Cache Redis inicializado', { config: defaultConfig });
