/**
 * ConsentIndicator - Componente para mostrar estado de consentimiento en chat
 * 
 * Muestra score de consentimiento, estado y permite reanudar si está pausado
 * 
 * @version 3.5.0
 * @date 2025-11-06
 */

import React from 'react';
import { useConsentVerification } from '@/hooks/useConsentVerification';
import { AlertCircle, CheckCircle2, AlertTriangle, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';

interface ConsentIndicatorProps {
  chatId: string;
  userId1: string;
  userId2: string;
  currentUserId: string;
  onPauseChange?: (isPaused: boolean) => void;
}

export function ConsentIndicator({
  chatId,
  userId1,
  userId2,
  currentUserId,
  onPauseChange
}: ConsentIndicatorProps) {
  const {
    verification,
    isLoading,
    error,
    isPaused,
    startMonitoring,
    resumeChat,
    refresh
  } = useConsentVerification(chatId);

  // Iniciar monitoreo si no existe verificación
  React.useEffect(() => {
    if (!verification && !isLoading && chatId) {
      startMonitoring(chatId, userId1, userId2).catch((err) => {
        logger.error('Error iniciando monitoreo', { error: err, chatId });
      });
    }
  }, [verification, isLoading, chatId, userId1, userId2, startMonitoring]);

  // Notificar cambios de pausa
  React.useEffect(() => {
    if (onPauseChange) {
      onPauseChange(isPaused);
    }
  }, [isPaused, onPauseChange]);

  if (isLoading && !verification) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
            <p className="text-sm text-yellow-800">Iniciando verificación de consentimiento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">Error en verificación: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verification) {
    return null;
  }

  const { currentScore } = verification;
  const { score, status, reasoning, confidence } = currentScore;

  // Determinar color y icono según estado
  let colorClass = 'border-gray-200 bg-gray-50';
  let icon = <AlertCircle className="h-4 w-4 text-gray-600" />;
  let statusText = 'Verificando...';

  if (status === 'consent' && score >= 80) {
    colorClass = 'border-green-200 bg-green-50';
    icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
    statusText = 'Consentimiento verificado';
  } else if (status === 'non_consent' || score < 30) {
    colorClass = 'border-red-200 bg-red-50';
    icon = <AlertTriangle className="h-4 w-4 text-red-600" />;
    statusText = 'Consentimiento no verificado';
  } else if (status === 'uncertain' || (score >= 30 && score < 80)) {
    colorClass = 'border-yellow-200 bg-yellow-50';
    icon = <AlertCircle className="h-4 w-4 text-yellow-600" />;
    statusText = 'Consentimiento incierto';
  } else if (status === 'insufficient_data') {
    colorClass = 'border-blue-200 bg-blue-50';
    icon = <AlertCircle className="h-4 w-4 text-blue-600" />;
    statusText = 'Datos insuficientes';
  }

  const handleResume = async () => {
    const resumed = await resumeChat(chatId, currentUserId);
    if (resumed) {
      await refresh();
    }
  };

  return (
    <Card className={colorClass}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">
              {isPaused ? 'Chat Pausado' : statusText}
            </CardTitle>
          </div>
          {isPaused && (
            <PauseCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
          )}
        </div>
        {verification.pauseReason && (
          <CardDescription className="text-xs text-yellow-800 mt-1">
            {verification.pauseReason}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score de consentimiento */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Score de Consentimiento</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Confianza: {Math.round(confidence * 100)}%</span>
            <span>{verification.messageCount} mensajes analizados</span>
          </div>
        </div>

        {/* Razón del análisis */}
        {reasoning && (
          <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
            <strong>Análisis:</strong> {reasoning}
          </div>
        )}

        {/* Botón para reanudar si está pausado */}
        {isPaused && (
          <Button
            onClick={handleResume}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={score < 80}
          >
            {score >= 80 ? 'Reanudar Chat' : 'Esperando mejor consenso...'}
          </Button>
        )}

        {/* Advertencia si score bajo */}
        {!isPaused && score < 80 && score >= 30 && (
          <div className="text-xs text-yellow-800 bg-yellow-100 p-2 rounded">
            ⚠️ Score de consentimiento bajo. El chat se pausará automáticamente si baja de 80%.
          </div>
        )}
      </CardContent>
    </Card>
  );
}


