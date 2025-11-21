/**
 * CoupleDisputeManager.tsx - UI para Protocolo de Disolución
 * 
 * Propósito: Interfaz de "Zona de Peligro" con cuenta regresiva
 * Autor: Lead Architect & Legal Engineer
 * Versión: v3.7.2 - Dissolution Protocol UI
 * Fecha: 21 Noviembre 2025
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Snowflake, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import CoupleDissolutionService, { DisputeStatus } from '@/services/legal/CoupleDissolutionService';
import { logger } from '@/lib/logger';

interface CoupleDisputeManagerProps {
  coupleId: string;
  partner1Id: string;
  partner2Id: string;
  currentStatus: 'ACTIVE' | 'FROZEN_DISPUTE' | 'DISSOLVED';
  onStatusChange?: (newStatus: string) => void;
}

export const CoupleDisputeManager: React.FC<CoupleDisputeManagerProps> = ({
  coupleId,
  partner1Id,
  partner2Id,
  currentStatus,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [disputeStatus, setDisputeStatus] = useState<DisputeStatus | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');

  // Actualizar timer cada segundo
  useEffect(() => {
    if (currentStatus === 'FROZEN_DISPUTE' && disputeStatus) {
      const interval = setInterval(async () => {
        try {
          const updated = await CoupleDissolutionService.getDisputeStatus(disputeStatus.id);
          setDisputeStatus(updated);
        } catch (error) {
          logger.error('Error actualizando timer', { error });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStatus, disputeStatus?.id]);

  // Cargar estado de disputa si existe
  useEffect(() => {
    const loadDisputeStatus = async () => {
      if (currentStatus === 'FROZEN_DISPUTE') {
        // Buscar disputa activa para esta pareja
        // En un caso real, necesitarías una función para obtener la disputa por coupleId
        // Por ahora, asumimos que tienes el disputeId
      }
    };

    loadDisputeStatus();
  }, [currentStatus, coupleId]);

  // Iniciar proceso de separación
  const handleInitiateSeparation = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const dispute = await CoupleDissolutionService.freezeAccount(coupleId, user.id);
      setDisputeStatus(dispute);
      setShowConfirmModal(false);
      onStatusChange?.('FROZEN_DISPUTE');
      
      logger.info('Separación iniciada', { coupleId, disputeId: dispute.id });
      
    } catch (error) {
      logger.error('Error iniciando separación', { error });
      alert('Error al iniciar la separación. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Proponer ganador
  const handleProposeWinner = async () => {
    if (!user || !disputeStatus || !selectedWinner) return;

    setIsProcessing(true);
    try {
      const updated = await CoupleDissolutionService.proposeWinner(
        disputeStatus.id, 
        selectedWinner, 
        user.id
      );
      setDisputeStatus(updated);
      
    } catch (error) {
      logger.error('Error proponiendo ganador', { error });
      alert('Error al proponer ganador.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Aceptar propuesta
  const handleAcceptProposal = async () => {
    if (!user || !disputeStatus) return;

    setIsProcessing(true);
    try {
      const updated = await CoupleDissolutionService.acceptProposal(disputeStatus.id, user.id);
      setDisputeStatus(updated);
      
      if (updated.status === 'RESOLVED_TRANSFERRED') {
        onStatusChange?.('DISSOLVED');
      }
      
    } catch (error) {
      logger.error('Error aceptando propuesta', { error });
      alert('Error al aceptar propuesta.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatear tiempo restante
  const formatTimeRemaining = (timeRemaining: DisputeStatus['timeRemaining']) => {
    if (timeRemaining.isExpired) return '00:00:00';
    
    const hours = timeRemaining.hours.toString().padStart(2, '0');
    const minutes = timeRemaining.minutes.toString().padStart(2, '0');
    const seconds = timeRemaining.seconds.toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  // Renderizar estado activo (sin disputa)
  if (currentStatus === 'ACTIVE') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            Gestión de Pareja
          </h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Activa
          </span>
        </div>

        <div className="border-t border-red-200 pt-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium text-red-900">Zona de Peligro</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Si necesitas separarte de tu pareja, puedes iniciar el proceso de disolución. 
            Esto congelará todos los activos por 72 horas para que puedan llegar a un acuerdo.
          </p>
          
          <button
            onClick={() => setShowConfirmModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            💔 Iniciar Separación
          </button>
        </div>

        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center mb-4">
                <Snowflake className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">
                  ❄️ ALERTA: CONGELAMIENTO PREVENTIVO DE CUENTA
                </h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  <strong>Estás a punto de iniciar el proceso de separación. Al confirmar:</strong>
                </p>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Congelamiento Inmediato:</strong> Todos los Tokens CMPX, GTK y NFTs serán 
                      bloqueados temporalmente. Nadie podrá retirar ni gastar nada a partir de este segundo.
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Timer className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Periodo de Resolución (72 Horas):</strong> Se abrirá una ventana de 3 días 
                      para que tú y tu pareja decidan de mutuo acuerdo quién conservará la titularidad de los activos.
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Consecuencia por Inacción:</strong> Si el contador llega a cero y no han registrado 
                      un acuerdo en el sistema, se aplicará la Cláusula de Abandono. Los activos congelados serán 
                      transferidos automáticamente a la plataforma como cargo administrativo por cancelación y la 
                      cuenta será cerrada irreversiblemente.
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium text-center">
                    ¿Deseas proceder con el congelamiento y activar el cronómetro?
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleInitiateSeparation}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Congelando...
                    </span>
                  ) : (
                    'Sí, Congelar Cuenta'
                  )}
                </button>
                
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderizar estado de disputa (cuenta congelada)
  if (currentStatus === 'FROZEN_DISPUTE' && disputeStatus) {
    const timeRemaining = formatTimeRemaining(disputeStatus.timeRemaining);
    const isExpired = disputeStatus.timeRemaining.isExpired;
    const isCurrentUserInitiator = user?.id === disputeStatus.initiatedBy;
    const hasProposal = !!disputeStatus.proposedWinnerId;
    const canPropose = !hasProposal && !isExpired;
    const canAccept = hasProposal && !isCurrentUserInitiator && !isExpired;

    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        {/* Banner de alerta */}
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Snowflake className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-lg font-bold">CUENTA EN DISPUTA</h2>
                <p className="text-red-100">Todos los activos están congelados</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {isExpired ? '⏰ EXPIRADO' : timeRemaining}
              </div>
              <p className="text-red-100 text-sm">Tiempo restante</p>
            </div>
          </div>
        </div>

        {/* Información de activos congelados */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            Activos Congelados
          </h3>
          
          {disputeStatus.frozenAssetsSnapshot && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Partner 1</p>
                <div className="text-sm text-gray-600">
                  <p>CMPX: {disputeStatus.frozenAssetsSnapshot.partner_1?.assets?.cmpx_balance || 0}</p>
                  <p>GTK: {disputeStatus.frozenAssetsSnapshot.partner_1?.assets?.gtk_balance || 0}</p>
                  <p>NFTs: {disputeStatus.frozenAssetsSnapshot.partner_1?.assets?.nfts_count || 0}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Partner 2</p>
                <div className="text-sm text-gray-600">
                  <p>CMPX: {disputeStatus.frozenAssetsSnapshot.partner_2?.assets?.cmpx_balance || 0}</p>
                  <p>GTK: {disputeStatus.frozenAssetsSnapshot.partner_2?.assets?.gtk_balance || 0}</p>
                  <p>NFTs: {disputeStatus.frozenAssetsSnapshot.partner_2?.assets?.nfts_count || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones de resolución */}
        {!isExpired && (
          <div className="space-y-4">
            {canPropose && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Proponer Ganador</h3>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="winner"
                        value={partner1Id}
                        checked={selectedWinner === partner1Id}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="mr-2"
                      />
                      Partner 1 se queda todo
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="winner"
                        value={partner2Id}
                        checked={selectedWinner === partner2Id}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="mr-2"
                      />
                      Partner 2 se queda todo
                    </label>
                  </div>
                  
                  <button
                    onClick={handleProposeWinner}
                    disabled={!selectedWinner || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isProcessing ? 'Proponiendo...' : 'Proponer'}
                  </button>
                </div>
              </div>
            )}

            {canAccept && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Propuesta Recibida</h3>
                <p className="text-gray-600 mb-3">
                  Tu pareja propone que {disputeStatus.proposedWinnerId === partner1Id ? 'Partner 1' : 'Partner 2'} se quede con todos los activos.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleAcceptProposal}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Aceptando...' : 'Aceptar'}
                  </button>
                  
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {hasProposal && isCurrentUserInitiator && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Esperando que tu pareja acepte la propuesta...
                </p>
              </div>
            )}
          </div>
        )}

        {isExpired && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Tiempo Agotado</p>
            <p className="text-gray-600">Los activos serán confiscados automáticamente.</p>
          </div>
        )}
      </div>
    );
  }

  // Estado disuelto
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
      <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Cuenta Disuelta</h3>
      <p className="text-gray-600">Esta cuenta de pareja ha sido disuelta.</p>
    </div>
  );
};

export default CoupleDisputeManager;
