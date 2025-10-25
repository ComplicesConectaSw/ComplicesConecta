import { vi } from 'vitest';

// Mock para postsService
export const mockPostsService = {
  getFeed: vi.fn().mockImplementation(async (page = 0, limit = 20) => {
    // Simular datos de posts completamente determinísticos
    const mockPosts = Array.from({ length: limit }, (_, i) => ({
      id: `post-${page * limit + i + 1}`,
      user_id: `user-${i + 1}`,
      profile_id: `user-${i + 1}`,
      content: `Mock post content ${i + 1}`,
      post_type: 'text' as const,
      image_url: undefined,
      video_url: undefined,
      location: 'Mock Location',
      likes_count: (i + 1) * 5, // Valores fijos basados en índice
      comments_count: (i + 1) * 3, // Valores fijos basados en índice
      shares_count: (i + 1) * 2, // Valores fijos basados en índice
      created_at: '2025-10-25T11:30:00.000Z', // Timestamp fijo
      updated_at: '2025-10-25T11:30:00.000Z', // Timestamp fijo
      profile: {
        id: `user-${i + 1}`,
        name: `Usuario ${i + 1}`,
        avatar_url: undefined,
        is_verified: false
      }
    }));

    // Simular tiempo de respuesta fijo
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockPosts;
  })
};

// Mock para TokenAnalyticsService con cache simulado
export const mockTokenAnalyticsService = {
  getInstance: vi.fn().mockReturnValue({
    generateCurrentMetrics: vi.fn().mockImplementation(async () => {
      // Simular cache: primera llamada lenta, segunda rápida
      const callCount = mockTokenAnalyticsService.getInstance().generateCurrentMetrics.mock.calls.length;
      
      if (callCount === 1) {
        // Primera llamada: sin cache (más lenta)
        await new Promise(resolve => setTimeout(resolve, 50));
      } else {
        // Segunda llamada: con cache (más rápida)
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      return {
        success: true,
        metrics: {
          totalSupply: { cmpx: 1000000, gtk: 5000000 },
          circulatingSupply: { cmpx: 500000, gtk: 2500000 },
          transactionVolume: { cmpx: 10000, gtk: 50000, count: 150 },
          stakingMetrics: { totalStaked: 100000, activeStakers: 50, avgDuration: 30 },
          userMetrics: { activeUsers: 200, newUsers: 25 }
        }
      };
    }),
    saveAnalytics: vi.fn().mockResolvedValue({ success: true }),
    getHistoricalAnalytics: vi.fn().mockResolvedValue({ success: true, analytics: [] }),
    generateAutomaticReport: vi.fn().mockResolvedValue({ success: true }),
    startAutomaticAnalytics: vi.fn(),
    stopAutomaticAnalytics: vi.fn()
  })
};

// Mock para performanceMonitor con funciones completas
export const mockPerformanceMonitor = {
  cleanup: vi.fn(),
  recordMetric: vi.fn(),
  recordQuery: vi.fn(),
  generateReport: vi.fn().mockReturnValue({
    totalOperations: 3,
    averageResponseTime: 150,
    slowQueries: [
      { query: 'slow_query', duration: 1500, count: 1 }
    ],
    cacheHitRate: 50,
    errorRate: 33.33,
    recommendations: ['Considerar implementar más cache', 'Revisar consultas lentas', 'Optimizar consultas lentas', 'Optimizar rendimiento general']
  }),
  getRealTimeMetrics: vi.fn().mockReturnValue({
    operationsPerMinute: 10,
    averageResponseTime: 150,
    errorRate: 5,
    cacheHitRate: 75
  }),
  measureExecution: vi.fn().mockImplementation((operation, fn) => fn),
  getInstance: vi.fn().mockReturnValue({
    cleanup: vi.fn(),
    recordMetric: vi.fn(),
    recordQuery: vi.fn(),
    generateReport: vi.fn().mockReturnValue({
      totalOperations: 3,
      averageResponseTime: 150,
      slowQueries: [
        { query: 'slow_query', duration: 1500, count: 1 }
      ],
      cacheHitRate: 50,
      errorRate: 33.33,
      recommendations: ['Considerar implementar más cache', 'Revisar consultas lentas', 'Optimizar consultas lentas', 'Optimizar rendimiento general']
    }),
    getRealTimeMetrics: vi.fn().mockReturnValue({
      operationsPerMinute: 10,
      averageResponseTime: 150,
      errorRate: 5,
      cacheHitRate: 75
    }),
    measureExecution: vi.fn().mockImplementation((operation, fn) => fn),
    stopMonitoring: vi.fn(),
    startMonitoring: vi.fn(),
    collectCurrentMetrics: vi.fn(),
    getMetrics: vi.fn(),
    getAggregatedStats: vi.fn()
  })
};

// Mock para PushNotificationService
export const mockPushNotificationService = {
  getInstance: vi.fn().mockReturnValue({
    registerDeviceToken: vi.fn(),
    getUserPreferences: vi.fn(),
    updateUserPreferences: vi.fn(),
    sendReportNotification: vi.fn(),
    sendTokenNotification: vi.fn(),
    createDefaultPreferences: vi.fn(),
    getNotificationHistory: vi.fn()
  })
};

// Aplicar mocks globales
vi.mock('../../services/postsService', () => ({
  postsService: mockPostsService
}));

vi.mock('../../services/TokenAnalyticsService', () => ({
  TokenAnalyticsService: mockTokenAnalyticsService
}));

vi.mock('../../services/PerformanceMonitoringService', () => ({
  performanceMonitor: mockPerformanceMonitor,
  PerformanceMonitoringService: mockPerformanceMonitor
}));

vi.mock('../../services/PushNotificationService', () => ({
  PushNotificationService: mockPushNotificationService
}));
