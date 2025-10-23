/**
 * Rate Limiting Service - Sistema de limitación de velocidad
 * Implementa rate limiting para prevenir abuso y mejorar seguridad
 */

import { logger } from '@/lib/logger';
import { RateLimiter } from '@/lib/errorHandling';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private rateLimiter: RateLimiter;
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.rateLimiter = RateLimiter.getInstance();
    this.setupDefaultConfigs();
  }

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  private setupDefaultConfigs(): void {
    // Configuración para matching
    this.configs.set('matching', {
      maxRequests: 50,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `matching:${req.userId}`
    });

    // Configuración para chat
    this.configs.set('chat', {
      maxRequests: 100,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `chat:${req.userId}`
    });

    // Configuración para likes
    this.configs.set('likes', {
      maxRequests: 30,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `likes:${req.userId}`
    });

    // Configuración para super likes
    this.configs.set('superlikes', {
      maxRequests: 5,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `superlikes:${req.userId}`
    });

    // Configuración para reportes
    this.configs.set('reports', {
      maxRequests: 10,
      windowMs: 300000, // 5 minutos
      keyGenerator: (req) => `reports:${req.userId}`
    });

    // Configuración para autenticación
    this.configs.set('auth', {
      maxRequests: 5,
      windowMs: 300000, // 5 minutos
      keyGenerator: (req) => `auth:${req.ip || req.userId}`
    });

    // Configuración para tokens
    this.configs.set('tokens', {
      maxRequests: 20,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `tokens:${req.userId}`
    });

    // Configuración para admin
    this.configs.set('admin', {
      maxRequests: 200,
      windowMs: 60000, // 1 minuto
      keyGenerator: (req) => `admin:${req.userId}`
    });
  }

  /**
   * Verificar rate limit para una acción específica
   */
  checkRateLimit(
    action: string,
    userId: string,
    customConfig?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const config = this.configs.get(action);
    if (!config) {
      logger.warn(`No rate limit config found for action: ${action}`);
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000
      };
    }

    const finalConfig = { ...config, ...customConfig };
    const key = finalConfig.keyGenerator 
      ? finalConfig.keyGenerator({ userId })
      : `${action}:${userId}`;

    const allowed = this.rateLimiter.checkRateLimit(
      key,
      action,
      finalConfig.maxRequests,
      finalConfig.windowMs
    );

    const resetTime = Date.now() + finalConfig.windowMs;
    const remaining = allowed ? finalConfig.maxRequests - 1 : 0;
    const retryAfter = allowed ? undefined : Math.ceil(finalConfig.windowMs / 1000);

    if (!allowed) {
      logger.warn(`Rate limit exceeded for ${action}:`, {
        userId,
        action,
        maxRequests: finalConfig.maxRequests,
        windowMs: finalConfig.windowMs,
        retryAfter
      });
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter
    };
  }

  /**
   * Middleware para rate limiting en servicios
   */
  createRateLimitMiddleware(action: string, customConfig?: Partial<RateLimitConfig>) {
    return async (req: any, res: any, next: any) => {
      const userId = req.user?.id || req.userId || 'anonymous';
      const result = this.checkRateLimit(action, userId, customConfig);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests for ${action}`,
          retryAfter: result.retryAfter,
          resetTime: result.resetTime
        });
      }

      // Agregar headers de rate limit
      res.set({
        'X-RateLimit-Limit': this.configs.get(action)?.maxRequests || 0,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000)
      });

      next();
    };
  }

  /**
   * Wrapper para funciones con rate limiting
   */
  withRateLimit<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    action: string,
    userId: string,
    customConfig?: Partial<RateLimitConfig>
  ) {
    return async (...args: T): Promise<R> => {
      const result = this.checkRateLimit(action, userId, customConfig);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded for ${action}. Retry after ${result.retryAfter} seconds.`);
      }

      return await fn(...args);
    };
  }

  /**
   * Reset rate limit para un usuario específico
   */
  resetRateLimit(action: string, userId: string): void {
    const _key = `${action}:${userId}`;
    this.rateLimiter.reset(userId, action);
    logger.info(`Rate limit reset for ${action}:`, { userId, action });
  }

  /**
   * Obtener estadísticas de rate limiting
   */
  getRateLimitStats(action: string, userId: string): {
    action: string;
    userId: string;
    config: RateLimitConfig | undefined;
    isLimited: boolean;
  } {
    const config = this.configs.get(action);
    const key = `${action}:${userId}`;
    const isLimited = !this.rateLimiter.checkRateLimit(key, action, 1, 1000);

    return {
      action,
      userId,
      config,
      isLimited
    };
  }

  /**
   * Configurar rate limit personalizado
   */
  setRateLimitConfig(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
    logger.info(`Rate limit config updated for ${action}:`, config);
  }

  /**
   * Obtener todas las configuraciones de rate limit
   */
  getAllConfigs(): Map<string, RateLimitConfig> {
    return new Map(this.configs);
  }
}

// Instancia singleton
export const rateLimitService = RateLimitService.getInstance();

// Funciones de conveniencia
export const checkMatchingRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('matching', userId);

export const checkChatRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('chat', userId);

export const checkLikesRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('likes', userId);

export const checkSuperLikesRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('superlikes', userId);

export const checkReportsRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('reports', userId);

export const checkAuthRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('auth', userId);

export const checkTokensRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('tokens', userId);

export const checkAdminRateLimit = (userId: string) => 
  rateLimitService.checkRateLimit('admin', userId);

export default rateLimitService;
