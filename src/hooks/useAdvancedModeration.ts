import { useState, useEffect, useCallback } from 'react';
import { ContentModerationService, ModerationResult } from '@/services/ContentModerationService';
import { logger } from '@/lib/logger';

export interface ModerationQueueItem {
  id: string;
  type: 'text' | 'image' | 'profile';
  content: string;
  userId: string;
  userName: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  moderationResult?: ModerationResult;
}

export interface ModerationStats {
  totalPending: number;
  totalReviewed: number;
  approvalRate: number;
  averageResponseTime: number;
  criticalItems: number;
  highPriorityItems: number;
}

export interface ModerationSettings {
  toxicityThreshold: number;
  spamThreshold: number;
  explicitThreshold: number;
  autoApproveThreshold: number;
  enableAutoModeration: boolean;
  enableEmailNotifications: boolean;
}

export const useAdvancedModeration = () => {
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalPending: 0,
    totalReviewed: 0,
    approvalRate: 0,
    averageResponseTime: 0,
    criticalItems: 0,
    highPriorityItems: 0
  });
  const [settings, setSettings] = useState<ModerationSettings>({
    toxicityThreshold: 0.7,
    spamThreshold: 0.6,
    explicitThreshold: 0.8,
    autoApproveThreshold: 0.9,
    enableAutoModeration: true,
    enableEmailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar cola de moderación
  const loadModerationQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos reales
      const mockQueue: ModerationQueueItem[] = [
        {
          id: '1',
          type: 'text',
          content: 'Este es un mensaje que necesita moderación',
          userId: 'user1',
          userName: 'Usuario1',
          submittedAt: new Date().toISOString(),
          priority: 'medium',
          status: 'pending'
        },
        {
          id: '2',
          type: 'profile',
          content: 'Perfil con información sospechosa',
          userId: 'user2',
          userName: 'Usuario2',
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'high',
          status: 'pending'
        },
        {
          id: '3',
          type: 'image',
          content: 'Imagen que requiere revisión',
          userId: 'user3',
          userName: 'Usuario3',
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'critical',
          status: 'pending'
        }
      ];
      
      setQueue(mockQueue);
      logger.info('Moderation queue loaded', { count: mockQueue.length });
    } catch (err) {
      setError('Error loading moderation queue');
      logger.error('Error loading moderation queue:', { error: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadModerationStats = useCallback(async () => {
    try {
      // Simular estadísticas reales
      const mockStats: ModerationStats = {
        totalPending: 15,
        totalReviewed: 150,
        approvalRate: 85.5,
        averageResponseTime: 12.3,
        criticalItems: 3,
        highPriorityItems: 7
      };
      
      setStats(mockStats);
      logger.info('Moderation stats loaded', { stats: mockStats });
    } catch (err) {
      logger.error('Error loading moderation stats:', { error: String(err) });
    }
  }, []);

  // Moderar contenido
  const moderateContent = useCallback(async (item: ModerationQueueItem): Promise<ModerationResult> => {
    try {
      let result: ModerationResult;
      
      switch (item.type) {
        case 'text':
          result = await ContentModerationService.moderateText(item.content);
          break;
        case 'image':
          result = await ContentModerationService.moderateImage(item.content);
          break;
        case 'profile':
          result = await ContentModerationService.moderateProfile({ 
            name: item.userName, 
            content: item.content 
          });
          break;
        default:
          throw new Error('Tipo de contenido no soportado');
      }
      
      // Actualizar el elemento en la cola con el resultado
      setQueue(prev => 
        prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, moderationResult: result, status: 'reviewing' as const }
            : queueItem
        )
      );
      
      logger.info('Content moderated', { 
        itemId: item.id, 
        type: item.type, 
        isAppropriate: result.isAppropriate,
        severity: result.severity
      });
      
      return result;
    } catch (err) {
      logger.error('Error moderating content:', { error: String(err) });
      throw err;
    }
  }, []);

  // Aprobar contenido
  const approveContent = useCallback(async (itemId: string) => {
    try {
      setQueue(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'approved' as const }
            : item
        )
      );
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalReviewed: prev.totalReviewed + 1,
        approvalRate: ((prev.totalReviewed + 1) / (prev.totalReviewed + 1)) * 100
      }));
      
      logger.info('Content approved', { itemId });
    } catch (err) {
      logger.error('Error approving content:', { error: String(err) });
      throw err;
    }
  }, []);

  // Rechazar contenido
  const rejectContent = useCallback(async (itemId: string) => {
    try {
      setQueue(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'rejected' as const }
            : item
        )
      );
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalReviewed: prev.totalReviewed + 1,
        approvalRate: (prev.totalReviewed / (prev.totalReviewed + 1)) * 100
      }));
      
      logger.info('Content rejected', { itemId });
    } catch (err) {
      logger.error('Error rejecting content:', { error: String(err) });
      throw err;
    }
  }, []);

  // Moderación automática
  const performAutoModeration = useCallback(async () => {
    if (!settings.enableAutoModeration) return;
    
    try {
      const pendingItems = queue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        const result = await moderateContent(item);
        
        // Auto-aprobar si la confianza es alta y es apropiado
        if (result.isAppropriate && result.confidence >= settings.autoApproveThreshold) {
          await approveContent(item.id);
          logger.info('Content auto-approved', { itemId: item.id, confidence: result.confidence });
        }
        // Auto-rechazar si es inapropiado y la confianza es alta
        else if (!result.isAppropriate && result.confidence >= settings.autoApproveThreshold) {
          await rejectContent(item.id);
          logger.info('Content auto-rejected', { itemId: item.id, confidence: result.confidence });
        }
      }
    } catch (err) {
      logger.error('Error in auto-moderation:', { error: String(err) });
    }
  }, [queue, settings, moderateContent, approveContent, rejectContent]);

  // Actualizar configuración
  const updateSettings = useCallback((newSettings: Partial<ModerationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logger.info('Moderation settings updated', { newSettings });
  }, []);

  // Filtrar cola por estado
  const getQueueByStatus = useCallback((status: ModerationQueueItem['status']) => {
    return queue.filter(item => item.status === status);
  }, [queue]);

  // Filtrar cola por prioridad
  const getQueueByPriority = useCallback((priority: ModerationQueueItem['priority']) => {
    return queue.filter(item => item.priority === priority);
  }, [queue]);

  // Obtener elementos críticos
  const getCriticalItems = useCallback(() => {
    return queue.filter(item => 
      item.priority === 'critical' || 
      (item.moderationResult && item.moderationResult.severity === 'critical')
    );
  }, [queue]);

  // Obtener elementos de alta prioridad
  const getHighPriorityItems = useCallback(() => {
    return queue.filter(item => 
      item.priority === 'high' || 
      (item.moderationResult && item.moderationResult.severity === 'high')
    );
  }, [queue]);

  // Efectos
  useEffect(() => {
    loadModerationQueue();
    loadModerationStats();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadModerationQueue();
      loadModerationStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadModerationQueue, loadModerationStats]);

  // Auto-moderación cada 5 minutos
  useEffect(() => {
    if (!settings.enableAutoModeration) return;
    
    const interval = setInterval(performAutoModeration, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [performAutoModeration, settings.enableAutoModeration]);

  return {
    // Estado
    queue,
    stats,
    settings,
    loading,
    error,
    
    // Acciones
    loadModerationQueue,
    loadModerationStats,
    moderateContent,
    approveContent,
    rejectContent,
    updateSettings,
    performAutoModeration,
    
    // Utilidades
    getQueueByStatus,
    getQueueByPriority,
    getCriticalItems,
    getHighPriorityItems,
    
    // Computed values
    pendingItems: getQueueByStatus('pending'),
    reviewingItems: getQueueByStatus('reviewing'),
    approvedItems: getQueueByStatus('approved'),
    rejectedItems: getQueueByStatus('rejected'),
    criticalItems: getCriticalItems(),
    highPriorityItems: getHighPriorityItems()
  };
};
