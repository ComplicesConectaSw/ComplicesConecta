import React, { useState } from 'react';
import { Check, X, MessageCircle, Clock, User, Users } from 'lucide-react';
import { ConnectionRequest, RequestsService } from '@/lib/requests';

interface RequestCardProps {
  request: ConnectionRequest;
  type: 'received' | 'sent';
  onRequestUpdated: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  type,
  onRequestUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const profile = type === 'received' ? request.sender_profile : request.receiver_profile;
  
  if (!profile) return null;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const result = await RequestsService.respondToRequest(request.id, 'accepted');
      if (result.success) {
        onRequestUpdated();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      const result = await RequestsService.respondToRequest(request.id, 'declined');
      if (result.success) {
        onRequestUpdated();
      }
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await RequestsService.deleteRequest(request.id);
      if (result.success) {
        onRequestUpdated();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'accepted': return 'Aceptada';
      case 'declined': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          
          {/* Indicador de perfil verificado */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-green-500">
            <User className="w-3 h-3" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {profile.first_name} {profile.last_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                {profile.age && <span>{profile.age} años</span>}
                {profile.bio && (
                  <>
                    {profile.age && <span>•</span>}
                    <span className="truncate">{profile.bio}</span>
                  </>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status ?? 'pending')}`}>
                {getStatusText(request.status ?? 'pending')}
              </span>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(request.created_at ?? '')}
              </div>
            </div>
          </div>

          {/* Mensaje */}
          {request.message && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
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
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Aceptar
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isLoading}
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
                disabled={isLoading}
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
