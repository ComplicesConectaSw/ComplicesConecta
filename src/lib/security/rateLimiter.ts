/**
 * Sistema de rate limiting para APIs críticas
 * Protege endpoints sin modificar lógica de autenticación existente
 */

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  windowMs: number;     // Ventana de tiempo en ms
  maxRequests: number;  // Máximo de requests por ventana
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// Configuraciones por endpoint
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // APIs críticas de autenticación
  '/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,            // 5 intentos por IP
    skipSuccessfulRequests: true
  },
  
  '/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,            // 3 registros por IP
    skipSuccessfulRequests: true
  },
  
  '/auth/reset-password': {
    windowMs: 60 * 60 * 1000, // 1 hora  
    maxRequests: 3,            // 3 resets por email
    skipSuccessfulRequests: false
  },
  
  // APIs de perfil y matching
  '/api/profiles/search': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 30,          // 30 búsquedas por minuto
    skipSuccessfulRequests: false
  },
  
  '/api/invitations/send': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,          // 10 invitaciones por hora
    skipSuccessfulRequests: false
  },
  
  '/api/chat/messages': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 60,          // 1 mensaje por segundo promedio
    skipSuccessfulRequests: false
  },
  
  // APIs de tokens (críticas)
  '/api/tokens/transfer': {
    windowMs: 5 * 60 * 1000,  // 5 minutos
    maxRequests: 5,           // 5 transferencias cada 5 min
    skipSuccessfulRequests: false
  },
  
  '/api/staking/start': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,          // 10 stakings por hora
    skipSuccessfulRequests: false
  },
  
  // APIs de archivos
  '/api/upload/image': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 20,          // 20 uploads por hora
    skipSuccessfulRequests: false
  }
};

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('🧹 Rate limiter cleanup completado', { 
        entriesRemoved: cleaned,
        remainingEntries: this.store.size
      });
    }
  }

  private generateKey(endpoint: string, identifier: string): string {
    const config = RATE_LIMIT_CONFIGS[endpoint];
    if (config?.keyGenerator) {
      return config.keyGenerator(identifier);
    }
    return `${endpoint}:${identifier}`;
  }

  public checkLimit(
    endpoint: string, 
    identifier: string, 
    isSuccess?: boolean
  ): { 
    allowed: boolean; 
    remaining: number; 
    resetTime: number;
    retryAfter?: number;
  } {
    const config = RATE_LIMIT_CONFIGS[endpoint];
    
    if (!config) {
      // Si no hay configuración, permitir la request
      return { 
        allowed: true, 
        remaining: Infinity, 
        resetTime: 0 
      };
    }

    const key = this.generateKey(endpoint, identifier);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    // Si no existe entrada o ha expirado, crear nueva
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
    }

    // Verificar si debemos contar esta request
    const shouldCount = isSuccess !== undefined ? 
      (isSuccess ? !config.skipSuccessfulRequests : !config.skipFailedRequests) :
      true;

    if (shouldCount) {
      entry.count++;
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;
    
    const result = {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    };

    // Log de rate limiting
    if (!allowed) {
      logger.warn('🚫 Rate limit excedido', {
        endpoint,
        identifier: identifier.substring(0, 8) + '***', // Parcialmente oculto
        count: entry.count,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
        retryAfter: result.retryAfter
      });
    } else if (remaining <= 2) {
      logger.info('⚠️ Rate limit cerca del límite', {
        endpoint,
        remaining,
        maxRequests: config.maxRequests
      });
    }

    return result;
  }

  public resetLimit(endpoint: string, identifier: string): void {
    const key = this.generateKey(endpoint, identifier);
    this.store.delete(key);
    
    logger.info('🔄 Rate limit reseteado manualmente', {
      endpoint,
      identifier: identifier.substring(0, 8) + '***'
    });
  }

  public getStats(): {
    totalEntries: number;
    endpoints: Record<string, number>;
  } {
    const endpoints: Record<string, number> = {};
    
    for (const key of this.store.keys()) {
      const endpoint = key.split(':')[0];
      endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
    }
    
    return {
      totalEntries: this.store.size,
      endpoints
    };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Instancia singleton
const rateLimiter = new RateLimiter();

// Función helper para uso en componentes React
export const useRateLimit = () => {
  const checkLimit = (endpoint: string, identifier?: string) => {
    // Usar IP del cliente o user ID como identificador
    const id = identifier || 
               (typeof window !== 'undefined' ? 
                 localStorage.getItem('user_id') || 'anonymous' : 
                 'server');
    
    return rateLimiter.checkLimit(endpoint, id);
  };

  const resetLimit = (endpoint: string, identifier?: string) => {
    const id = identifier || 
               (typeof window !== 'undefined' ? 
                 localStorage.getItem('user_id') || 'anonymous' : 
                 'server');
    
    rateLimiter.resetLimit(endpoint, id);
  };

  return { checkLimit, resetLimit };
};

// Middleware para interceptar requests
export const rateLimitMiddleware = (
  endpoint: string,
  identifier: string,
  onLimitExceeded?: (retryAfter: number) => void
) => {
  const result = rateLimiter.checkLimit(endpoint, identifier);
  
  if (!result.allowed && onLimitExceeded) {
    onLimitExceeded(result.retryAfter || 60);
  }
  
  return result;
};

// Hook para mostrar información de rate limit en UI
export const useRateLimitInfo = (endpoint: string) => {
  const [info, setInfo] = useState<{
    remaining: number;
    resetTime: number;
    isNearLimit: boolean;
  } | null>(null);

  const checkInfo = () => {
    const identifier = localStorage.getItem('user_id') || 'anonymous';
    const result = rateLimiter.checkLimit(endpoint, identifier, true); // No contar esta verificación
    
    setInfo({
      remaining: result.remaining,
      resetTime: result.resetTime,
      isNearLimit: result.remaining <= 3
    });
  };

  useEffect(() => {
    checkInfo();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(checkInfo, 30000);
    return () => clearInterval(interval);
  }, [endpoint]);

  return info;
};

export { rateLimiter, RATE_LIMIT_CONFIGS };
export default RateLimiter;
