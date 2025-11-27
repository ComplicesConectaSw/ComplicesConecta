/**
 * =====================================================
 * DESKTOP NOTIFICATION SETTINGS COMPONENT
 * =====================================================
 * Panel de configuración de notificaciones de escritorio
 * Específico para administradores - configuración avanzada
 * Fecha: 2025-01-29
 * Versión: v3.5.0
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, TestTube } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { desktopNotificationService } from '@/services/DesktopNotificationService';
import type { NotificationConfig } from '@/services/DesktopNotificationService';
import { logger } from '@/lib/logger';

// =====================================================
// COMPONENT
// =====================================================

export const DesktopNotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<NotificationConfig>(desktopNotificationService.getConfig());
  const [permission, setPermission] = useState<NotificationPermission>(desktopNotificationService.getPermissionStatus());
  const [isSupported, setIsSupported] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setIsSupported(desktopNotificationService.isSupported());
  }, []);

  /**
   * Solicitar permisos
   */
  const handleRequestPermission = async () => {
    const granted = await desktopNotificationService.requestPermission();
    
    if (granted) {
      setPermission('granted');
      setConfig(desktopNotificationService.getConfig());
      
      toast({
        title: "✅ Permisos otorgados",
        description: "Las notificaciones de escritorio están habilitadas",
      });
    } else {
      toast({
        title: "❌ Permisos denegados",
        description: "No se pudieron habilitar las notificaciones",
        variant: "destructive",
      });
    }
  };

  /**
   * Actualizar configuración
   */
  const handleConfigChange = (key: keyof NotificationConfig, value: boolean | number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    desktopNotificationService.updateConfig({ [key]: value });
    
    logger.info('Notification config updated', { [key]: value });
  };

  /**
   * Test de notificación
   */
  const handleTest = async () => {
    setIsTesting(true);
    
    try {
      const success = await desktopNotificationService.testNotification();
      
      if (success) {
        toast({
          title: "✅ Test exitoso",
          description: "Deberías ver una notificación de prueba",
        });
      } else {
        toast({
          title: "❌ Test fallido",
          description: "No se pudo enviar la notificación de prueba",
          variant: "destructive",
        });
      }
    } catch (err) {
      logger.error('Error probando notificaciones:', { error: err instanceof Error ? err.message : String(err) });
      toast({
        title: "Error",
        description: "Error al probar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Habilitar/deshabilitar notificaciones
   */
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      if (permission !== 'granted') {
        await handleRequestPermission();
      } else {
        await desktopNotificationService.enable();
        setConfig(desktopNotificationService.getConfig());
      }
    } else {
      desktopNotificationService.disable();
      setConfig(desktopNotificationService.getConfig());
    }
  };

  // Si no hay soporte, mostrar mensaje
  if (!isSupported) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <BellOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                Notificaciones no soportadas
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Tu navegador no soporta notificaciones de escritorio. 
                Actualiza a la última versión o usa Chrome/Firefox/Edge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notificaciones de Escritorio
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Configura alertas nativas del navegador para errores críticos y problemas de performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado de Permisos */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Estado de Permisos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {permission === 'granted' && '✅ Concedidos'}
                {permission === 'denied' && '❌ Denegados'}
                {permission === 'default' && '⏸️ No solicitados'}
              </p>
            </div>
            
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Solicitar Permisos
              </Button>
            )}
          </div>
        </div>

        {/* Configuración General */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Habilitar Notificaciones
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Recibe alertas nativas en tu escritorio
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={handleToggleNotifications}
              disabled={permission !== 'granted'}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Solo Errores Críticos
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Notificar únicamente alertas de severidad crítica
              </p>
            </div>
            <Switch
              checked={config.criticalOnly}
              onCheckedChange={(checked) => handleConfigChange('criticalOnly', checked)}
              disabled={!config.enabled}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {config.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sonido de Alerta
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Reproducir sonido con cada notificación
              </p>
            </div>
            <Switch
              checked={config.sound}
              onCheckedChange={(checked) => handleConfigChange('sound', checked)}
              disabled={!config.enabled}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>

        {/* Frecuencia */}
        <div>
          <Label className="text-base font-medium text-gray-900 dark:text-white">
            Frecuencia de Notificaciones
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
            Intervalo mínimo entre notificaciones
          </p>
          <select
            value={config.frequency}
            onChange={(e) => handleConfigChange('frequency', Number(e.target.value))}
            disabled={!config.enabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value={30000}>30 segundos</option>
            <option value={60000}>1 minuto</option>
            <option value={120000}>2 minutos</option>
            <option value={300000}>5 minutos</option>
            <option value={600000}>10 minutos</option>
          </select>
        </div>

        {/* Criterios de Alerta */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            📋 Criterios de Alerta
          </h3>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>• Errores con severidad crítica</li>
            <li>• Caída de performance &gt; 50%</li>
            <li>• Errores repetidos &gt; 5 veces en 1 minuto</li>
            <li>• Uso de memoria &gt; 90%</li>
          </ul>
        </div>

        {/* Botón de Test */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleTest}
            disabled={!config.enabled || isTesting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Enviando Test...' : 'Probar Notificación'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopNotificationSettings;

