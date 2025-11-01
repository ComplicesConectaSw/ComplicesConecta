import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { redisCache, CacheKeys, CacheTTL } from '@/lib/redis-cache';
import { analyticsMetrics, trackPageView, trackInteraction } from '@/lib/analytics-metrics';
// import { mlMatchingEngine, calculateMLMatch } from '@/lib/ml-matching'; // DEPRECATED: Moved to respaldo
import { performManualBackup, getBackupStats } from '@/lib/backup-system';

/**
 * Tests de Integración del Sistema
 * Verifica que todos los nuevos sistemas funcionen correctamente juntos
 */

// Console logging para debugging de tests de integración
const testLogger = {
  info: (message: string, data?: unknown) => console.log(`🧪 [Integration.test] ${message}`, data || ''),
  error: (message: string, error?: unknown) => console.error(`❌ [Integration.test] ${message}`, error || ''),
  warn: (message: string, data?: unknown) => console.warn(`⚠️ [Integration.test] ${message}`, data || '')
};

describe('Sistema de Integración Completo', () => {
  beforeAll(() => {
    testLogger.info('Iniciando tests de integración del sistema');
    // Configurar modo demo para tests
    localStorage.setItem('demo_authenticated', 'true');
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'integration-test-user',
      first_name: 'Test',
      email: 'test@integration.com'
    }));
  });

  afterAll(() => {
    testLogger.info('Finalizando tests de integración');
    localStorage.clear();
  });

  describe('Sistema de Cache Redis', () => {
    test('debe almacenar y recuperar datos correctamente', async () => {
      testLogger.info('Test: Cache Redis - almacenar y recuperar');
      
      try {
        const testData = { userId: 'test-123', name: 'Test User', tokens: 500 };
        const cacheKey = CacheKeys.PROFILE('test-123');
        
        // Almacenar datos
        await redisCache.set(cacheKey, testData, CacheTTL.SHORT);
        testLogger.info('Datos almacenados en cache', { key: cacheKey });
        
        // Recuperar datos
        const retrievedData = await redisCache.get(cacheKey);
        testLogger.info('Datos recuperados del cache', retrievedData);
        
        expect(retrievedData).toEqual(testData);
        testLogger.info('Test de cache completado exitosamente');
      } catch (error) {
        testLogger.error('Error en test de cache', error);
        throw error;
      }
    });

    test('debe manejar expiración de cache correctamente', async () => {
      testLogger.info('Test: Cache Redis - expiración');
      
      try {
        const testData = { temp: 'data' };
        const cacheKey = 'test-expiration';
        
        // Almacenar con TTL muy corto (1 segundo)
        await redisCache.set(cacheKey, testData, 1);
        testLogger.info('Datos almacenados con TTL de 1 segundo');
        
        // Verificar que existe inmediatamente
        let data = await redisCache.get(cacheKey);
        expect(data).toEqual(testData);
        
        // Esperar expiración
        await new Promise(resolve => setTimeout(resolve, 1100));
        testLogger.info('Esperando expiración del cache...');
        
        // Verificar que expiró
        data = await redisCache.get(cacheKey);
        expect(data).toBeNull();
        
        testLogger.info('Test de expiración completado exitosamente');
      } catch (error) {
        testLogger.error('Error en test de expiración', error);
        throw error;
      }
    });

    test('debe obtener estadísticas del cache', () => {
      testLogger.info('Test: Cache Redis - estadísticas');
      
      try {
        const stats = redisCache.getStats();
        testLogger.info('Estadísticas del cache obtenidas', stats);
        
        expect(stats).toHaveProperty('isRedisAvailable');
        expect(stats).toHaveProperty('memoryItems');
        expect(stats).toHaveProperty('config');
        
        testLogger.info('Test de estadísticas completado exitosamente');
      } catch (error) {
        testLogger.error('Error en test de estadísticas', error);
        throw error;
      }
    });
  });

  describe('Sistema de Analytics y Métricas', () => {
    test('debe iniciar sesión de usuario y trackear eventos', () => {
      testLogger.info('Test: Analytics - sesión y eventos');
      
      try {
        const userId = 'analytics-test-user';
        
        // Iniciar sesión
        analyticsMetrics.startUserSession(userId);
        testLogger.info('Sesión iniciada para usuario', { userId });
        
        // Trackear eventos
        trackPageView(userId, '/test-page');
        trackInteraction(userId, 'click', 'test-button');
        testLogger.info('Eventos trackeados exitosamente');
        
        // Obtener métricas del usuario
        const userMetrics = analyticsMetrics.getUserMetrics(userId);
        testLogger.info('Métricas del usuario obtenidas', userMetrics);
        
        expect(userMetrics).toBeTruthy();
        expect(userMetrics?.userId).toBe(userId);
        expect(userMetrics?.pageViews).toBeGreaterThan(0);
        expect(userMetrics?.interactions).toBeGreaterThan(0);
        
        testLogger.info('Test de analytics completado exitosamente');
      } catch (error) {
        testLogger.error('Error en test de analytics', error);
        throw error;
      }
    });

    test('debe obtener métricas del sistema en tiempo real', () => {
      testLogger.info('Test: Analytics - métricas en tiempo real');
      
      try {
        const realTimeMetrics = analyticsMetrics.getRealTimeMetrics();
        testLogger.info('Métricas en tiempo real obtenidas', realTimeMetrics);
        
        expect(realTimeMetrics).toHaveProperty('activeUsers');
        expect(realTimeMetrics).toHaveProperty('recentEvents');
        expect(realTimeMetrics).toHaveProperty('timestamp');
        
        testLogger.info('Test de métricas en tiempo real completado');
      } catch (error) {
        testLogger.error('Error en test de métricas en tiempo real', error);
        throw error;
      }
    });

    test('debe generar reporte detallado', () => {
      testLogger.info('Test: Analytics - reporte detallado');
      
      try {
        const report = analyticsMetrics.getDetailedReport();
        testLogger.info('Reporte detallado generado', report);
        
        expect(report).toHaveProperty('system');
        expect(report).toHaveProperty('sessions');
        expect(report).toHaveProperty('events');
        expect(report).toHaveProperty('topUsers');
        
        testLogger.info('Test de reporte detallado completado');
      } catch (error) {
        testLogger.error('Error en test de reporte detallado', error);
        throw error;
      }
    });
  });

  // DEPRECATED: Sistema de ML Matching movido a respaldo_auditoria
  describe.skip('Sistema de ML Matching', () => {
    test('debe calcular score ML entre perfiles', async () => {
      testLogger.info('Test: ML Matching - cálculo de score');
      
      try {
        const userProfile = {
          id: 'user-1',
          age: 28,
          interests: ['lifestyle', 'swinger', 'parejas'],
          location: { lat: 19.4326, lng: -99.1332 },
          preferences: {
            ageRange: [25, 35] as [number, number],
            maxDistance: 50,
            interests: ['lifestyle', 'swinger']
          },
          behaviorData: {
            likedProfiles: ['profile-1', 'profile-2'],
            passedProfiles: ['profile-3'],
            matchedProfiles: ['profile-1'],
            messagesSent: 10,
            messagesReceived: 8,
            profileViews: 50,
            responseRate: 0.8,
            averageConversationLength: 15,
            preferredInteractionTimes: [19, 20, 21],
            sessionDuration: 3600000
          }
        };

        const candidateProfile = {
          id: 'candidate-1',
          age: 30,
          interests: ['lifestyle', 'parejas', 'eventos'],
          location: { lat: 19.4400, lng: -99.1300 },
          preferences: {
            ageRange: [26, 32] as [number, number],
            maxDistance: 30,
            interests: ['lifestyle']
          },
          behaviorData: {
            likedProfiles: ['profile-4', 'profile-5'],
            passedProfiles: [],
            matchedProfiles: ['profile-4'],
            messagesSent: 15,
            messagesReceived: 12,
            profileViews: 75,
            responseRate: 0.75,
            averageConversationLength: 20,
            preferredInteractionTimes: [20, 21, 22],
            sessionDuration: 4200000
          }
        };

        // DEPRECATED: ML matching moved to respaldo_auditoria
        // testLogger.info('Calculando score ML entre perfiles');
        // const mlScore = await calculateMLMatch(userProfile, candidateProfile);
        // testLogger.info('Score ML calculado', mlScore);
        
        // expect(mlScore).toHaveProperty('profileId', 'candidate-1');
        // expect(mlScore).toHaveProperty('mlScore');
        // expect(mlScore).toHaveProperty('factors');
        // expect(mlScore).toHaveProperty('confidence');
        // expect(mlScore).toHaveProperty('reasoning');
        
        // expect(mlScore.mlScore).toBeGreaterThan(0);
        // expect(mlScore.mlScore).toBeLessThanOrEqual(1);
        
        testLogger.info('Test de ML matching saltado (deprecado)');
      } catch (error) {
        testLogger.error('Error en test de ML matching', error);
        throw error;
      }
    });

    test('debe obtener estadísticas del modelo ML', () => {
      testLogger.info('Test: ML Matching - estadísticas del modelo');
      
      // DEPRECATED: ML matching moved to respaldo_auditoria
      // try {
      //   const modelStats = mlMatchingEngine.getModelStats();
      //   testLogger.info('Estadísticas del modelo ML obtenidas', modelStats);
        
      //   expect(modelStats).toHaveProperty('weights');
      //   expect(modelStats).toHaveProperty('trainingExamples');
      //   expect(modelStats).toHaveProperty('learningRate');
      //   expect(modelStats).toHaveProperty('isTraining');
        
      //   testLogger.info('Test de estadísticas ML completado');
      // } catch (error) {
      //   testLogger.error('Error en test de estadísticas ML', error);
      //   throw error;
      // }
      testLogger.info('Test de estadísticas ML saltado (deprecado)');
    });
  });

  describe('Sistema de Backup Automático', () => {
    test('debe realizar backup incremental', async () => {
      testLogger.info('Test: Backup - backup incremental');
      
      try {
        const backupResult = await performManualBackup('incremental');
        testLogger.info('Backup incremental completado', backupResult);
        
        expect(backupResult).toHaveProperty('id');
        expect(backupResult).toHaveProperty('type', 'incremental');
        expect(backupResult).toHaveProperty('status');
        expect(backupResult).toHaveProperty('timestamp');
        
        testLogger.info('Test de backup incremental completado');
      } catch (error) {
        testLogger.error('Error en test de backup incremental', error);
        throw error;
      }
    });

    test('debe obtener estadísticas de backup', () => {
      testLogger.info('Test: Backup - estadísticas');
      
      try {
        const backupStats = getBackupStats();
        testLogger.info('Estadísticas de backup obtenidas', backupStats);
        
        expect(backupStats).toHaveProperty('total');
        expect(backupStats).toHaveProperty('successful');
        expect(backupStats).toHaveProperty('failed');
        expect(backupStats).toHaveProperty('totalSize');
        expect(backupStats).toHaveProperty('config');
        
        testLogger.info('Test de estadísticas de backup completado');
      } catch (error) {
        testLogger.error('Error en test de estadísticas de backup', error);
        throw error;
      }
    });

    test('debe realizar backup completo', async () => {
      testLogger.info('Test: Backup - backup completo');
      
      try {
        const backupResult = await performManualBackup('full');
        testLogger.info('Backup completo realizado', backupResult);
        
        expect(backupResult).toHaveProperty('id');
        expect(backupResult).toHaveProperty('type', 'full');
        expect(backupResult).toHaveProperty('status');
        expect(backupResult.tables.length).toBeGreaterThan(0);
        
        testLogger.info('Test de backup completo completado');
      } catch (error) {
        testLogger.error('Error en test de backup completo', error);
        throw error;
      }
    });
  });

  describe('Integración entre Sistemas', () => {
    test('debe integrar cache con analytics', async () => {
      testLogger.info('Test: Integración Cache + Analytics');
      
      try {
        const userId = 'integration-cache-analytics';
        
        // Iniciar sesión y trackear eventos
        analyticsMetrics.startUserSession(userId);
        trackPageView(userId, '/integration-test');
        
        // Obtener métricas y cachearlas
        const userMetrics = analyticsMetrics.getUserMetrics(userId);
        const cacheKey = CacheKeys.USER_STATS(userId);
        
        if (userMetrics) {
          await redisCache.set(cacheKey, userMetrics, CacheTTL.MEDIUM);
          testLogger.info('Métricas cacheadas exitosamente');
          
          // Recuperar del cache
          const cachedMetrics = await redisCache.get(cacheKey);
          expect(cachedMetrics).toEqual(userMetrics);
          
          testLogger.info('Integración cache + analytics exitosa');
        }
      } catch (error) {
        testLogger.error('Error en integración cache + analytics', error);
        throw error;
      }
    });

    test('debe integrar ML matching con analytics', async () => {
      testLogger.info('Test: Integración ML Matching + Analytics');
      
      try {
        const userId = 'integration-ml-analytics';
        
        // Trackear evento de matching
        trackInteraction(userId, 'matching_request', 'profile-search');
        
        // Simular cálculo ML
        const mockUserProfile = {
          id: userId,
          age: 25,
          interests: ['test'],
          location: { lat: 0, lng: 0 },
          preferences: { ageRange: [20, 30] as [number, number], maxDistance: 10, interests: [] },
          behaviorData: {
            likedProfiles: [], passedProfiles: [], matchedProfiles: [],
            messagesSent: 0, messagesReceived: 0, profileViews: 0,
            responseRate: 0, averageConversationLength: 0,
            preferredInteractionTimes: [], sessionDuration: 0
          }
        };

        const mockCandidateProfile = { ...mockUserProfile, id: 'candidate-integration' };
        
        // DEPRECATED: ML matching moved to respaldo
        // const mlScore = await calculateMLMatch(mockUserProfile, mockCandidateProfile);
        // testLogger.info('Score ML calculado en integración', { score: mlScore.mlScore });
        
        // Trackear resultado simulado
        trackInteraction(userId, 'matching_result', 'score_0');
        
        testLogger.info('Integración analytics exitosa (ML matching deprecated)');
      } catch (error) {
        testLogger.error('Error en integración ML + analytics', error);
        throw error;
      }
    });

    test('debe integrar backup con cache', async () => {
      testLogger.info('Test: Integración Backup + Cache');
      
      try {
        // Almacenar datos en cache
        const testData = { system: 'integration', timestamp: Date.now() };
        await redisCache.set('integration-test', testData, CacheTTL.LONG);
        
        // Realizar backup
        const backupResult = await performManualBackup('incremental');
        testLogger.info('Backup realizado durante integración', { id: backupResult.id });
        
        // Verificar que el cache sigue funcionando
        const cachedData = await redisCache.get('integration-test');
        expect(cachedData).toEqual(testData);
        
        testLogger.info('Integración backup + cache exitosa');
      } catch (error) {
        testLogger.error('Error en integración backup + cache', error);
        throw error;
      }
    });
  });

  describe('Performance y Estabilidad', () => {
    test('debe manejar múltiples operaciones concurrentes', async () => {
      testLogger.info('Test: Performance - operaciones concurrentes');
      
      try {
        const promises = [];
        
        // Cache operations
        for (let i = 0; i < 5; i++) {
          promises.push(redisCache.set(`concurrent-${i}`, { value: i }, CacheTTL.SHORT));
        }
        
        // Analytics operations
        for (let i = 0; i < 5; i++) {
          promises.push(new Promise<void>(resolve => {
            trackPageView(`concurrent-user-${i}`, `/page-${i}`);
            resolve();
          }));
        }
        
        // Backup operation
        promises.push(performManualBackup('incremental'));
        
        testLogger.info('Ejecutando operaciones concurrentes...');
        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        testLogger.info('Operaciones concurrentes completadas', { successful, failed });
        
        expect(successful).toBeGreaterThan(failed);
        testLogger.info('Test de performance completado');
      } catch (error) {
        testLogger.error('Error en test de performance', error);
        throw error;
      }
    });

    test('debe mantener estabilidad bajo carga', async () => {
      testLogger.info('Test: Estabilidad - carga sostenida');
      
      try {
        const startTime = Date.now();
        const operations = 20;
        
        for (let i = 0; i < operations; i++) {
          // Simular carga mixta
          await redisCache.set(`load-test-${i}`, { iteration: i }, CacheTTL.SHORT);
          trackInteraction(`load-user-${i % 3}`, 'load_test', `iteration_${i}`);
          
          if (i % 5 === 0) {
            await performManualBackup('incremental');
          }
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        testLogger.info('Test de carga completado', { 
          operations, 
          duration: `${duration}ms`,
          avgPerOp: `${duration / operations}ms`
        });
        
        expect(duration).toBeLessThan(30000); // Menos de 30 segundos
        testLogger.info('Test de estabilidad completado');
      } catch (error) {
        testLogger.error('Error en test de estabilidad', error);
        throw error;
      }
    });
  });
});
