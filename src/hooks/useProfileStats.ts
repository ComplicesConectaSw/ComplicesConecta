/**
 * =====================================================
 * USE PROFILE STATS HOOK
 * =====================================================
 * Hook optimizado para gestionar estadísticas de perfiles
 * Features: Memoización, lazy loading, cache
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { profileStatsService, type ProfileStats, type ActivityItem, type Achievement } from '@/services/ProfileStatsService';
import { logger } from '@/lib/logger';

interface UseProfileStatsOptions {
  profileId?: string;
  autoLoad?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // en milisegundos
}

interface UseProfileStatsReturn {
  stats: ProfileStats | null;
  activity: ActivityItem[];
  achievements: Achievement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  incrementViews: () => Promise<void>;
  incrementLikes: () => Promise<void>;
}

// Cache simple en memoria
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos por defecto

export function useProfileStats(options: UseProfileStatsOptions = {}): UseProfileStatsReturn {
  const {
    profileId,
    autoLoad = true,
    cacheKey = profileId || 'default',
    cacheDuration = CACHE_DURATION
  } = options;

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Verificar si hay datos en caché válidos
   */
  const getCachedData = useCallback((key: string) => {
    const cached = statsCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
      return cached.data;
    }
    return null;
  }, [cacheDuration]);

  /**
   * Guardar datos en caché
   */
  const setCachedData = useCallback((key: string, data: any) => {
    statsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Cargar todas las estadísticas
   */
  const loadAllStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar caché primero
      const cachedStats = getCachedData(`stats-${cacheKey}`);
      const cachedActivity = getCachedData(`activity-${cacheKey}`);
      const cachedAchievements = getCachedData(`achievements-${cacheKey}`);

      if (cachedStats && cachedActivity && cachedAchievements) {
        logger.info('[useProfileStats] Using cached data');
        setStats(cachedStats);
        setActivity(cachedActivity);
        setAchievements(cachedAchievements);
        setIsLoading(false);
        return;
      }

      logger.info('[useProfileStats] Loading fresh data');

      // Cargar datos en paralelo para mejor performance
      const [statsData, activityData, achievementsData] = await Promise.all([
        profileStatsService.loadProfileStats(profileId),
        profileStatsService.loadRecentActivity(profileId),
        profileStatsService.loadAchievements(profileId)
      ]);

      // Actualizar estados
      setStats(statsData);
      setActivity(activityData);
      setAchievements(achievementsData);

      // Guardar en caché
      setCachedData(`stats-${cacheKey}`, statsData);
      setCachedData(`activity-${cacheKey}`, activityData);
      setCachedData(`achievements-${cacheKey}`, achievementsData);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading profile stats');
      logger.error('[useProfileStats] Error:', { error });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, cacheKey, getCachedData, setCachedData]);

  /**
   * Incrementar vistas
   */
  const incrementViews = useCallback(async () => {
    try {
      if (profileId) {
        await profileStatsService.incrementViews(profileId);
        // Invalidar caché
        statsCache.delete(`stats-${cacheKey}`);
        // Recargar
        await loadAllStats();
      }
    } catch (err) {
      logger.error('[useProfileStats] Error incrementing views:', { error: err });
    }
  }, [profileId, cacheKey, loadAllStats]);

  /**
   * Incrementar likes
   */
  const incrementLikes = useCallback(async () => {
    try {
      if (profileId) {
        await profileStatsService.incrementLikes(profileId);
        // Invalidar caché
        statsCache.delete(`stats-${cacheKey}`);
        // Recargar
        await loadAllStats();
      }
    } catch (err) {
      logger.error('[useProfileStats] Error incrementing likes:', { error: err });
    }
  }, [profileId, cacheKey, loadAllStats]);

  /**
   * Auto-cargar datos al montar el componente
   */
  useEffect(() => {
    if (autoLoad) {
      loadAllStats();
    }
  }, [autoLoad, loadAllStats]);

  /**
   * Memoizar los logros desbloqueados
   */
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlocked);
  }, [achievements]);

  /**
   * Memoizar el total de tokens ganados
   */
  const totalTokensEarned = useMemo(() => {
    return unlockedAchievements.reduce((total, achievement) => {
      return total + (achievement.reward?.tokens || 0);
    }, 0);
  }, [unlockedAchievements]);

  return {
    stats,
    activity,
    achievements,
    isLoading,
    error,
    refetch: loadAllStats,
    incrementViews,
    incrementLikes
  };
}

/**
 * Limpiar toda la caché
 */
export function clearProfileStatsCache(): void {
  statsCache.clear();
  logger.info('[useProfileStats] Cache cleared');
}

/**
 * Limpiar caché específica
 */
export function clearProfileStatsCacheFor(cacheKey: string): void {
  statsCache.delete(`stats-${cacheKey}`);
  statsCache.delete(`activity-${cacheKey}`);
  statsCache.delete(`achievements-${cacheKey}`);
  logger.info('[useProfileStats] Cache cleared for:', { cacheKey });
}
