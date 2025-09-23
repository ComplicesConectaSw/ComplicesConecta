import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente para configuración de autenticación biométrica
 * Permite al usuario activar/desactivar biometría desde su perfil
 */

export const BiometricSettings: React.FC = () => {
  const {
    isLoading,
    isEnabled,
    checkBiometricAvailability,
    getBiometricConfig,
    setBiometricEnabled,
    registerBiometric,
    clearBiometricSessions
  } = useBiometricAuth();

  const { toast } = useToast();
  const [availability, setAvailability] = useState<{ available: boolean; methods: string[] }>({ 
    available: false, 
    methods: [] 
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeBiometricSettings();
  }, []);

  const initializeBiometricSettings = async () => {
    setIsInitializing(true);
    
    try {
      // Verificar disponibilidad del dispositivo
      const deviceAvailability = await checkBiometricAvailability();
      setAvailability(deviceAvailability);
      
      // Obtener configuración actual del usuario
      await getBiometricConfig();
    } catch (error) {
      console.error('Error inicializando configuración biométrica:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración biométrica",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (!availability.available) {
      toast({
        title: "No disponible",
        description: "Tu dispositivo no soporta autenticación biométrica",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!isEnabled) {
        // Activar biometría - registrar credencial
        const result = await registerBiometric();
        
        if (result.success) {
          const success = await setBiometricEnabled(true);
          if (success) {
            toast({
              title: "✅ Biometría activada",
              description: "La autenticación biométrica ha sido configurada exitosamente",
              variant: "default"
            });
          }
        } else {
          toast({
            title: "Error de registro",
            description: result.error || "No se pudo registrar la autenticación biométrica",
            variant: "destructive"
          });
        }
      } else {
        // Desactivar biometría
        const success = await setBiometricEnabled(false);
        if (success) {
          // Limpiar sesiones activas
          await clearBiometricSessions();
          
          toast({
            title: "Biometría desactivada",
            description: "La autenticación biométrica ha sido deshabilitada",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error configurando biometría:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración biométrica",
        variant: "destructive"
      });
    }
  };

  const handleClearSessions = async () => {
    try {
      const success = await clearBiometricSessions();
      if (success) {
        toast({
          title: "Sesiones limpiadas",
          description: "Todas las sesiones biométricas han sido cerradas",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error limpiando sesiones:', error);
      toast({
        title: "Error",
        description: "No se pudieron limpiar las sesiones biométricas",
        variant: "destructive"
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando configuración biométrica...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Fingerprint className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Autenticación Biométrica
          </h3>
          <p className="text-sm text-gray-600">
            Configura el acceso con huella dactilar o reconocimiento facial
          </p>
        </div>
      </div>

      {/* Estado de disponibilidad */}
      <div className={`p-4 rounded-lg border ${
        availability.available 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {availability.available ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <div>
            <p className={`font-medium ${
              availability.available ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {availability.available 
                ? 'Biometría disponible en este dispositivo' 
                : 'Biometría no disponible'}
            </p>
            <p className={`text-sm ${
              availability.available ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {availability.available 
                ? `Métodos soportados: ${availability.methods.join(', ')}`
                : 'Tu dispositivo no soporta autenticación biométrica'}
            </p>
          </div>
        </div>
      </div>

      {/* Control principal */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Shield className={`h-5 w-5 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
          <div>
            <p className="font-medium text-gray-900">
              Autenticación biométrica
            </p>
            <p className="text-sm text-gray-600">
              {isEnabled 
                ? 'Activada - Se requerirá biometría para acceder a la app'
                : 'Desactivada - Solo se usará login tradicional'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggleBiometric}
          disabled={!availability.available || isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEnabled 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
          } ${
            (!availability.available || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Información adicional */}
      {isEnabled && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              🔐 Seguridad Activada
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La app solicitará autenticación biométrica al iniciar</li>
              <li>• Tus datos están protegidos con encriptación adicional</li>
              <li>• Las sesiones expiran automáticamente por seguridad</li>
            </ul>
          </div>

          <button
            onClick={handleClearSessions}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              'Cerrar todas las sesiones biométricas'
            )}
          </button>
        </div>
      )}

      {/* Información de seguridad */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          ℹ️ Información de Seguridad
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Tus datos biométricos nunca salen de tu dispositivo</li>
          <li>• Solo se almacenan referencias encriptadas en nuestros servidores</li>
          <li>• Puedes desactivar esta función en cualquier momento</li>
          <li>• Compatible con Touch ID, Face ID y lectores de huella</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricSettings;
