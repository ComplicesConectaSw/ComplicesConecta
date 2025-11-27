import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Check, X, MessageCircle, Clock, User, CheckCircle } from 'lucide-react';
import { RequestsService } from '@/lib/requests';
import { Database } from '@/types/supabase-generated';
import { logger } from '@/lib/logger';

// Tipos estrictos basados en Supabase
type _ProfileRow = Database['public']['Tables']['profiles']['Row'];
type _InvitationRow = Database['public']['Tables']['invitations']['Row'];
// Definir tipos de enum manualmente ya que no están en el schema
type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
type InvitationType = 'profile' | 'gallery' | 'chat';

// Tipo para solicitud con perfil relacionado (como se obtiene de la consulta)
export interface ConnectionRequestWithProfile {
  id: string;
  from_profile: string;
  to_profile: string;
  message: string | null;
  status: InvitationStatus | null;
  created_at: string | null;
  decided_at: string | null;
  type: InvitationType | null;
  // Perfil relacionado (from o to según el contexto)
  profile?: SafeProfile;
}

interface RequestCardProps {
  request: ConnectionRequestWithProfile;
  type: 'received' | 'sent';
  onRequestUpdated: () => void;
}

// Tipos para perfiles con campos opcionales seguros
interface SafeProfile {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  bio: string | null;
  gender: string;
  interested_in: string;
  is_verified: boolean | null;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  type,
  onRequestUpdated
}) => {
  const [_isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // El perfil ya viene incluido en la consulta desde RequestsService
  const profile = request.profile;
  
  // Mover todos los hooks al inicio antes de cualquier return
  // Cleanup de operaciones async al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Funciones puras memoizadas
  const getStatusColor = useCallback((status: InvitationStatus | null): string => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'revoked': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusText = useCallback((status: InvitationStatus | null): string => {
    switch (status) {
      case 'accepted': return 'Aceptada';
      case 'declined': return 'Rechazada';
      case 'pending': return 'Pendiente';
      case 'revoked': return 'Revocada';
      default: return status ?? 'Desconocido';
    }
  }, []);

  const formatDate = useCallback((dateString: string | null): string => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Hace unos minutos';
      if (diffInHours < 24) return `Hace ${diffInHours}h`;
      if (diffInHours < 48) return 'Ayer';
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return 'Fecha inválida';
    }
  }, []);

  // Memoización de handlers con useCallback
  const handleAccept = useCallback(async () => {
    if (_isLoading) return;
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    
    try {
      const result = await RequestsService.respondToRequest(request.id, 'accepted');
      if (result.success && !abortControllerRef.current.signal.aborted) {
        onRequestUpdated();
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        logger.error('Error accepting request:', { error: error instanceof Error ? error.message : String(error) });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [request.id, onRequestUpdated, _isLoading]);

  const handleDecline = useCallback(async () => {
    if (_isLoading) return;
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    
    try {
      const result = await RequestsService.respondToRequest(request.id, 'declined');
      if (result.success && !abortControllerRef.current.signal.aborted) {
        onRequestUpdated();
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        logger.error('Error declining request:', { error: error instanceof Error ? error.message : String(error) });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [request.id, onRequestUpdated, _isLoading]);

  const handleDelete = useCallback(async () => {
    if (_isLoading) return;
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    
    try {
      const result = await RequestsService.deleteRequest(request.id);
      if (result.success && !abortControllerRef.current.signal.aborted) {
        onRequestUpdated();
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        logger.error('Error deleting request:', { error: error instanceof Error ? error.message : String(error) });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [request.id, onRequestUpdated, _isLoading]);

  // Early return con null-safe check después de todos los hooks
  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar - Campo avatar_url no existe en schema, usando placeholder */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          
          {/* Indicador de perfil verificado */}
          {profile.is_verified && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Verificado</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {profile.first_name} {profile.last_name ?? ''}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mt-1">
                {profile.age && <span>{profile.age} años</span>}
                {profile.bio && (
                  <>
                    {profile.age && <span>•</span>}
                    <span className="truncate">{profile.bio}</span>
                  </>
                )}
              </div>
            </div>

            {/* Estado - null-safe con fallbacks */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status as InvitationStatus)}`}>
                {getStatusText(request.status as InvitationStatus)}
              </span>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(request.created_at)}
              </div>
            </div>
          </div>

          {/* Mensaje - null-safe */}
          {request.message && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {request.message}
                </p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-4">
            {type === 'received' && request.status === 'pending' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={_isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Aceptar
                </button>
                <button
                  onClick={handleDecline}
                  disabled={_isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </>
            )}

            {type === 'sent' && request.status === 'pending' && (
              <button
                onClick={handleDelete}
                disabled={_isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}

            {request.status === 'accepted' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span>¡Conectados! Ahora pueden chatear</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;

/*
 * Refactor Notes v2.1.8:
 * 
 * ✅ Tipos Estrictos:
 * - Importados tipos de Supabase Database
 * - Definidos tipos InvitationStatus y SafeProfile
 * - Eliminadas referencias a campos inexistentes (avatar_url)
 * 
 * ✅ Optional Chaining y Null-Safe:
 * - Reemplazado || por ?? donde corresponde
 * - Agregado ?. en accesos opcionales
 * - Fallbacks seguros (profile.last_name ?? '')
 * 
 * ✅ Memoización y Performance:
 * - useCallback en todos los handlers async
 * - useCallback en funciones puras (getStatusColor, getStatusText, formatDate)
 * - Prevención de operaciones duplicadas con isLoading check
 * 
 * ✅ Cleanup de Estados Async:
 * - AbortController para cancelar operaciones
 * - useEffect con cleanup al desmontar
 * - Verificación de signal.aborted antes de setState
 * 
 * ✅ Compatibilidad:
 * - Mantenidos hooks existentes
 * - Preservada funcionalidad UI/UX
 * - Imports con alias @/ consistentes
 * 
 * ✅ Correcciones Críticas:
 * - Removido campo avatar_url inexistente
 * - Agregado placeholder visual para avatares
 * - Verificación is_verified antes de mostrar badge
 * - Manejo de errores en formatDate con try/catch
 */
