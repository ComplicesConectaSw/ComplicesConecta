import React, { useState } from 'react';
import { Bell, BellOff, Settings, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface PushNotificationSettingsProps {
  className?: string;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  className = ''
}) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    isSubscribed,
    canSubscribe: _canSubscribe,
    needsPermission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications({
    userId: user?.id,
    onNotificationReceived: (notification) => {
      logger.info('📨 Notificación recibida:', notification);
    },
    onSubscriptionChange: (sub) => {
      logger.info('🔄 Suscripción cambió:', { status: sub ? 'Activa' : 'Inactiva' });
    }
  });

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (needsPermission) {
        await requestPermission();
      }
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Notificaciones no soportadas
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Tu navegador no soporta notificaciones push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <Bell className="h-6 w-6 text-green-600" />
            ) : (
              <BellOff className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones Push
              </h3>
              <p className="text-sm text-gray-600">
                Recibe notificaciones de mensajes, matches y más
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-900">
              Estado: {isSubscribed ? 'Activas' : 'Inactivas'}
            </span>
          </div>
          
          <button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isSubscribed
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : isSubscribed ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </button>
        </div>

        {/* Permission Status */}
        {permission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {permission === 'denied' 
                  ? 'Permisos denegados. Habilita las notificaciones en la configuración del navegador.'
                  : 'Se requieren permisos para las notificaciones.'
                }
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Test Notification */}
        {isSubscribed && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Probar notificaciones
              </h4>
              <p className="text-sm text-gray-600">
                Envía una notificación de prueba
              </p>
            </div>
            
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">Probar</span>
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Soporte:</span>
                <span className="ml-2 text-gray-600">
                  {isSupported ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Permisos:</span>
                <span className="ml-2 text-gray-600">
                  {permission === 'granted' ? '✅ Concedidos' : 
                   permission === 'denied' ? '❌ Denegados' : '⏳ Pendientes'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Suscripción:</span>
                <span className="ml-2 text-gray-600">
                  {subscription ? '✅ Activa' : '❌ Inactiva'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Usuario:</span>
                <span className="ml-2 text-gray-600">
                  {user?.id ? '✅ Autenticado' : '❌ No autenticado'}
                </span>
              </div>
            </div>
            
            {subscription && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Detalles de suscripción:
                </h5>
                <div className="text-xs text-gray-600 font-mono break-all">
                  {subscription.endpoint.substring(0, 60)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;
