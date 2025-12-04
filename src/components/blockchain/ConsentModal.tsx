import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  Lock, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';
import { nftService } from '@/services/NFTService';
import { logger } from '@/lib/logger';

/**
 * Modal de consentimiento doble para NFTs de pareja
 * Maneja el proceso de aprobación entre ambos miembros de la pareja
 */

interface CoupleNFTRequest {
  id: string;
  requestId: string;
  partner1_address: string;
  partner2_address: string;
  initiator_address: string;
  metadata_uri: string;
  consent1_timestamp?: string;
  consent2_timestamp?: string;
  status: 'pending' | 'approved' | 'minted' | 'cancelled' | 'expired';
  created_at: string;
  expires_at: string;
  transaction_hash?: string;
}

interface ConsentModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Solicitud de NFT de pareja */
  request: CoupleNFTRequest | null;
  /** ID del usuario actual */
  currentUserId: string;
  /** Función callback cuando se aprueba la solicitud */
  onApprove?: (requestId: string) => void;
  /** Función callback cuando se rechaza la solicitud */
  onReject?: (requestId: string) => void;
  /** Función callback cuando se cancela la solicitud */
  onCancel?: (requestId: string) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUserId,
  onApprove,
  onReject,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'approving' | 'rejecting' | 'cancelling' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calcular tiempo restante hasta expiración
  useEffect(() => {
    if (!request?.expires_at) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(request.expires_at);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m restantes`);
      } else {
        setTimeRemaining(`${minutes}m restantes`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [request?.expires_at]);

  /**
   * Maneja la aprobación de la solicitud
   */
  const handleApprove = async () => {
    if (!request || !currentUserId) return;

    setIsProcessing(true);
    setActionStatus('approving');
    setErrorMessage('');

    try {
      await nftService.approveCoupleNFT(request.id, currentUserId);
      
      logger.info('Solicitud de NFT de pareja aprobada:', { requestId: request.id });
      setActionStatus('success');
      onApprove?.(request.id);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setActionStatus('idle');
      }, 2000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al aprobar solicitud';
      logger.error('Error aprobando solicitud:', { error: String(error) });
      setErrorMessage(errorMsg);
      setActionStatus('error');
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setActionStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Maneja el rechazo de la solicitud
   */
  const handleReject = async () => {
    if (!request || !currentUserId) return;

    setIsProcessing(true);
    setActionStatus('rejecting');
    setErrorMessage('');

    try {
      // TODO: Implementar función de rechazo en NFTService
      logger.info('Solicitud de NFT de pareja rechazada:', { requestId: request.id });
      setActionStatus('success');
      onReject?.(request.id);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setActionStatus('idle');
      }, 2000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al rechazar solicitud';
      logger.error('Error rechazando solicitud:', { error: String(error) });
      setErrorMessage(errorMsg);
      setActionStatus('error');
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setActionStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Maneja la cancelación de la solicitud
   */
  const handleCancel = async () => {
    if (!request || !currentUserId) return;

    setIsProcessing(true);
    setActionStatus('cancelling');
    setErrorMessage('');

    try {
      // TODO: Implementar función de cancelación en NFTService
      logger.info('Solicitud de NFT de pareja cancelada:', { requestId: request.id });
      setActionStatus('success');
      onCancel?.(request.id);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setActionStatus('idle');
      }, 2000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al cancelar solicitud';
      logger.error('Error cancelando solicitud:', { error: String(error) });
      setErrorMessage(errorMsg);
      setActionStatus('error');
      
      // Reset después de 5 segundos
      setTimeout(() => {
        setActionStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Determina si el usuario actual es el iniciador
   */
  const isInitiator = request?.initiator_address === currentUserId;

  /**
   * Determina si el usuario actual ya dio consentimiento
   */
  const hasUserConsented = () => {
    if (!request) return false;
    
    // Verificar si alguno de los timestamps de consentimiento corresponde al usuario actual
    // En una implementación real, esto se determinaría por la dirección de wallet
    return request.consent1_timestamp || request.consent2_timestamp;
  };

  /**
   * Obtiene el estado visual de la solicitud
   */
  const getStatusBadge = () => {
    if (!request) return null;

    switch (request.status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-400/30">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full mx-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold">NFT de Pareja</h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Información de la solicitud */}
        <div className="space-y-4 mb-6">
          <div className="p-3 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Solicitud #{request.requestId}</span>
            </div>
            <div className="text-xs text-white/70 space-y-1">
              <div>Iniciador: {isInitiator ? 'Tú' : 'Tu pareja'}</div>
              <div>Creado: {new Date(request.created_at).toLocaleDateString('es-MX')}</div>
            </div>
          </div>

          {/* Tiempo restante */}
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">{timeRemaining}</span>
          </div>

          {/* Estado de consentimientos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Estado de Consentimientos
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-xs text-white/70 mb-1">Pareja 1</div>
                <div className="flex items-center justify-center">
                  {request.consent1_timestamp ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
              
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-xs text-white/70 mb-1">Pareja 2</div>
                <div className="flex items-center justify-center">
                  {request.consent2_timestamp ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-300">
                <div className="font-medium mb-1">Sistema de Consentimiento Doble</div>
                <div>
                  Ambos miembros de la pareja deben aprobar esta solicitud. 
                  Una vez aprobado por ambos, se creará automáticamente el NFT de pareja.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {request.status === 'pending' && !hasUserConsented() && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-500/20 hover:bg-green-600/30 text-green-200 border-green-400/30 flex items-center justify-center gap-2"
              >
                {actionStatus === 'approving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Aprobar
              </Button>
              
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 flex items-center justify-center gap-2"
              >
                {actionStatus === 'rejecting' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Rechazar
              </Button>
            </div>
          )}

          {request.status === 'pending' && isInitiator && (
            <Button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full bg-gray-500/20 hover:bg-gray-600/30 text-gray-200 border-gray-400/30 flex items-center justify-center gap-2"
            >
              {actionStatus === 'cancelling' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Cancelar Solicitud
            </Button>
          )}

          <Button
            onClick={onClose}
            disabled={isProcessing}
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            Cerrar
          </Button>
        </div>

        {/* Mensajes de estado */}
        {actionStatus === 'error' && errorMessage && (
          <div className="mt-4 text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
            {errorMessage}
          </div>
        )}

        {actionStatus === 'success' && (
          <div className="mt-4 text-green-400 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
            Operación completada exitosamente
          </div>
        )}

        {/* Advertencia de expiración */}
        {timeRemaining === 'Expirado' && (
          <div className="mt-4 text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Esta solicitud ha expirado y ya no puede ser procesada.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentModal;

