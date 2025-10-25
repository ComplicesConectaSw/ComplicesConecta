import { vi } from 'vitest';

// Mock para postsService
export const mockPostsService = {
  getFeed: vi.fn().mockImplementation(async (page = 0, limit = 20) => {
    // Simular datos de posts consistentes para cache testing
    const mockPosts = Array.from({ length: limit }, (_, i) => ({
      id: `post-${page * limit + i + 1}`,
      user_id: `user-${i + 1}`,
      profile_id: `user-${i + 1}`,
      content: `Mock post content ${i + 1}`,
      post_type: 'text' as const,
      image_url: undefined,
      video_url: undefined,
      location: 'Mock Location',
      likes_count: Math.floor(Math.random() * 50),
      comments_count: Math.floor(Math.random() * 20),
      shares_count: Math.floor(Math.random() * 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: `user-${i + 1}`,
        name: `Usuario ${i + 1}`,
        avatar_url: undefined,
        is_verified: false
      }
    }));

    // Simular tiempo de respuesta consistente para cache testing
    const delay = 100; // Tiempo fijo para resultados consistentes
    await new Promise(resolve => setTimeout(resolve, delay));
    return mockPosts;
  })
};

// Mock para TokenAnalyticsService
export const mockTokenAnalyticsService = {
  getInstance: vi.fn().mockReturnValue({
    generateCurrentMetrics: vi.fn().mockImplementation(async () => {
      // Simular tiempo de respuesta
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
      
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
    recommendations: ['Considerar implementar más cache', 'Revisar consultas lentas', 'Optimizar consultas lentas']
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
      recommendations: ['Considerar implementar más cache', 'Revisar consultas lentas', 'Optimizar consultas lentas']
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
