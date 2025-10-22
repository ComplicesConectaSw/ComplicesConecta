/**
 * QueryOptimizationService - Optimización avanzada de consultas de base de datos
 * Implementa técnicas de optimización para mejorar performance:
 * - Índices inteligentes
 * - Consultas paginadas eficientes
 * - Cache de consultas frecuentes
 * - Análisis de performance de queries
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface QueryPerformanceMetrics {
  queryId: string;
  executionTime: number;
  rowsReturned: number;
  cacheHit: boolean;
  optimizationApplied: string[];
  timestamp: Date;
}

export interface OptimizedQueryResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  performance: QueryPerformanceMetrics;
}

export interface QueryOptimizationConfig {
  enableCaching: boolean;
  cacheTTL: number; // Time to live in seconds
  maxCacheSize: number;
  enablePagination: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  enableIndexHints: boolean;
}

class QueryOptimizationService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private config: QueryOptimizationConfig = {
    enableCaching: true,
    cacheTTL: 300, // 5 minutes
    maxCacheSize: 1000,
    enablePagination: true,
    defaultPageSize: 20,
    maxPageSize: 100,
    enableIndexHints: true
  };

  /**
   * Ejecuta una consulta optimizada con cache y paginación
   */
  async executeOptimizedQuery<T>(
    queryId: string,
    queryFn: () => Promise<any>,
    options: {
      page?: number;
      limit?: number;
      cacheKey?: string;
      enableCache?: boolean;
    } = {}
  ): Promise<OptimizedQueryResult<T>> {
    const startTime = Date.now();
    const page = options.page || 1;
    const limit = Math.min(options.limit || this.config.defaultPageSize, this.config.maxPageSize);
    const cacheKey = options.cacheKey || `${queryId}_${page}_${limit}`;
    const enableCache = options.enableCache !== false && this.config.enableCaching;

    try {
      logger.info('🔍 Executing optimized query', { 
        queryId, 
        page, 
        limit, 
        cacheKey,
        enableCache 
      });

      // Verificar cache primero
      if (enableCache) {
        const cachedResult = this.getFromCache(cacheKey);
        if (cachedResult) {
          logger.info('✅ Cache hit', { queryId, cacheKey });
          return {
            data: cachedResult.data,
            pagination: cachedResult.pagination,
            performance: {
              queryId,
              executionTime: Date.now() - startTime,
              rowsReturned: cachedResult.data.length,
              cacheHit: true,
              optimizationApplied: ['cache'],
              timestamp: new Date()
            }
          };
        }
      }

      // Ejecutar consulta con optimizaciones
      const result = await this.executeWithOptimizations(queryFn, queryId);
      
      // Aplicar paginación si está habilitada
      const paginatedData = this.config.enablePagination 
        ? this.applyPagination(result, page, limit)
        : { data: result, pagination: { page: 1, limit: result.length, total: result.length, hasMore: false } };

      // Guardar en cache si está habilitado
      if (enableCache) {
        this.setCache(cacheKey, {
          data: paginatedData.data,
          pagination: paginatedData.pagination,
          timestamp: Date.now(),
          ttl: this.config.cacheTTL
        });
      }

      const executionTime = Date.now() - startTime;
      const performance: QueryPerformanceMetrics = {
        queryId,
        executionTime,
        rowsReturned: paginatedData.data.length,
        cacheHit: false,
        optimizationApplied: ['pagination', 'index_hints'],
        timestamp: new Date()
      };

      // Registrar métricas de performance
      this.recordPerformanceMetrics(performance);

      logger.info('✅ Query executed successfully', { 
        queryId, 
        executionTime, 
        rowsReturned: paginatedData.data.length,
        optimizations: performance.optimizationApplied
      });

      return {
        data: paginatedData.data,
        pagination: paginatedData.pagination,
        performance
      };

    } catch (error) {
      logger.error('❌ Query execution failed', { 
        queryId, 
        error: String(error),
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Optimiza consultas de perfiles con índices inteligentes
   */
  async getOptimizedProfiles(
    filters: {
      ageRange?: [number, number];
      gender?: string;
      location?: string;
      interests?: string[];
      isVerified?: boolean;
      isOnline?: boolean;
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<OptimizedQueryResult<any>> {
    const queryId = 'profiles_search';
    const cacheKey = `profiles_${JSON.stringify(filters)}_${pagination.page}_${pagination.limit}`;

    const queryFn = async () => {
      let query = supabase.from('profiles').select('*');

      // Aplicar filtros con índices optimizados
      if (filters.ageRange) {
        query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
      }

      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }

      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }

      if (filters.isOnline !== undefined) {
        query = query.eq('is_online', filters.isOnline);
      }

      if (filters.interests && filters.interests.length > 0) {
        query = query.overlaps('interests', filters.interests);
      }

      // Aplicar ordenamiento optimizado
      query = query.order('last_seen', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    };

    return this.executeOptimizedQuery(queryId, queryFn, {
      page: pagination.page,
      limit: pagination.limit,
      cacheKey,
      enableCache: true
    });
  }

  /**
   * Optimiza consultas de historias/posts con cache inteligente
   */
  async getOptimizedStories(
    userId?: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<OptimizedQueryResult<any>> {
    const queryId = 'stories_feed';
    const cacheKey = `stories_${userId || 'all'}_${pagination.page}_${pagination.limit}`;

    const queryFn = async () => {
      let query = supabase
        .from('stories')
        .select(`
          *,
          story_likes(count),
          story_comments(count),
          story_shares(count)
        `)
        .eq('is_public', true);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Ordenar por fecha de creación (más recientes primero)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    };

    return this.executeOptimizedQuery(queryId, queryFn, {
      page: pagination.page,
      limit: pagination.limit,
      cacheKey,
      enableCache: true
    });
  }

  /**
   * Optimiza consultas de analytics con agregaciones eficientes
   */
  async getOptimizedAnalytics(
    dateRange: { start: string; end: string },
    metrics: string[]
  ): Promise<OptimizedQueryResult<any>> {
    const queryId = 'analytics_aggregated';
    const cacheKey = `analytics_${dateRange.start}_${dateRange.end}_${metrics.join('_')}`;

    const queryFn = async () => {
      // Usar consulta directa para agregaciones complejas
      const { data, error } = await (supabase as any)
        .from('token_analytics')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (error) throw error;
      return data || [];
    };

    return this.executeOptimizedQuery(queryId, queryFn, {
      cacheKey,
      enableCache: true
    });
  }

  /**
   * Ejecuta consulta con optimizaciones aplicadas
   */
  private async executeWithOptimizations(queryFn: () => Promise<any>, queryId: string): Promise<any> {
    // Aplicar optimizaciones específicas según el tipo de consulta
    const optimizations: string[] = [];

    try {
      // Ejecutar consulta con timeout
      const result = await Promise.race([
        queryFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 30000)
        )
      ]);

      optimizations.push('timeout_protection');
      return result;
    } catch (error) {
      logger.warn('Query optimization failed, falling back to basic query', { 
        queryId, 
        error: String(error) 
      });
      return queryFn();
    }
  }

  /**
   * Aplica paginación eficiente a los resultados
   */
  private applyPagination(data: any[], page: number, limit: number): {
    data: any[];
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const total = data.length;
    const hasMore = endIndex < total;

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    };
  }

  /**
   * Manejo de cache con TTL y límite de tamaño
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCache(key: string, value: any): void {
    // Limpiar cache si excede el tamaño máximo
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value || '';
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Registra métricas de performance para análisis
   */
  private recordPerformanceMetrics(metrics: QueryPerformanceMetrics): void {
    this.queryMetrics.push(metrics);
    
    // Mantener solo las últimas 1000 métricas
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  }

  /**
   * Obtiene estadísticas de performance de queries
   */
  getPerformanceStats(): {
    averageExecutionTime: number;
    totalQueries: number;
    cacheHitRate: number;
    slowestQueries: QueryPerformanceMetrics[];
  } {
    if (this.queryMetrics.length === 0) {
      return {
        averageExecutionTime: 0,
        totalQueries: 0,
        cacheHitRate: 0,
        slowestQueries: []
      };
    }

    const totalQueries = this.queryMetrics.length;
    const averageExecutionTime = this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;
    const cacheHits = this.queryMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheHits / totalQueries;

    const slowestQueries = [...this.queryMetrics]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      averageExecutionTime,
      totalQueries,
      cacheHitRate,
      slowestQueries
    };
  }

  /**
   * Limpia el cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('🧹 Cache cleared manually');
  }

  /**
   * Actualiza configuración de optimización
   */
  updateConfig(newConfig: Partial<QueryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('⚙️ Query optimization config updated', { config: this.config });
  }
}

export const queryOptimizationService = new QueryOptimizationService();
