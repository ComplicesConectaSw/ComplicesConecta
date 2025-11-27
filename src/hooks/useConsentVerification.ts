/**
 * useConsentVerification - Hook para verificación de consentimiento en chats
 * 
 * Proporciona estado y métodos para monitoreo de consentimiento en tiempo real
 * 
 * @version 3.5.0
 * @date 2025-11-06
 */

import { useState, useEffect, useCallback } from 'react';
import { consentVerificationService, type ConsentVerification } from '@/services/ai/ConsentVerificationService';
import { logger } from '@/lib/logger';

export interface UseConsentVerificationReturn {
  verification: ConsentVerification | null;
  isLoading: boolean;
  error: Error | null;
  isPaused: boolean;
  startMonitoring: (chatId: string, userId1: string, userId2: string) => Promise<void>;
  stopMonitoring: (chatId: string) => Promise<void>;
  resumeChat: (chatId: string, userId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook para verificación de consentimiento
 */
export function useConsentVerification(chatId?: string): UseConsentVerificationReturn {
  const [verification, setVerification] = useState<ConsentVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Carga verificación actual
   */
  const loadVerification = useCallback(async () => {
    if (!chatId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const current = await consentVerificationService.getVerification(chatId);
      setVerification(current);
      setIsPaused(current?.isPaused || false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Error cargando verificación', { error, chatId });
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  /**
   * Inicia monitoreo
   */
  const startMonitoring = useCallback(async (
    chatId: string,
    userId1: string,
    userId2: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await consentVerificationService.startMonitoring(chatId, userId1, userId2);
      await loadVerification();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Error iniciando monitoreo', { error, chatId });
    } finally {
      setIsLoading(false);
    }
  }, [loadVerification]);

  /**
   * Detiene monitoreo
   */
  const stopMonitoring = useCallback(async (chatId: string) => {
    try {
      await consentVerificationService.stopMonitoring(chatId);
      setVerification(null);
      setIsPaused(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Error deteniendo monitoreo', { error, chatId });
    }
  }, []);

  /**
   * Reanuda chat pausado
   */
  const resumeChat = useCallback(async (chatId: string, userId: string) => {
    try {
      const resumed = await consentVerificationService.resumeChat(chatId, userId);
      if (resumed) {
        await loadVerification();
      }
      return resumed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Error reanudando chat', { error, chatId });
      return false;
    }
  }, [loadVerification]);

  /**
   * Refresca verificación
   */
  const refresh = useCallback(async () => {
    await loadVerification();
  }, [loadVerification]);

  // Cargar verificación cuando cambia chatId
  useEffect(() => {
    if (chatId) {
      loadVerification();

      // Refrescar cada 5 segundos si está activo
      const interval = setInterval(() => {
        loadVerification();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [chatId, loadVerification]);

  return {
    verification,
    isLoading,
    error,
    isPaused,
    startMonitoring,
    stopMonitoring,
    resumeChat,
    refresh
  };
}

