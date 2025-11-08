/**
 * Gestor de PWA (Progressive Web App) para mejoras mobile-first
 * Implementa funcionalidades nativas sin modificar lógica de negocio existente
 */

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  notificationsEnabled: boolean;
  updateAvailable: boolean;
}

// Hook para gestionar estado PWA
export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    notificationsEnabled: false,
    updateAvailable: false
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Detectar si ya está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    
    setStatus(prev => ({ ...prev, isInstalled }));

    // Listener para evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setStatus(prev => ({ ...prev, isInstallable: true }));
      
      logger.info('📱 PWA instalable detectada');
    };

    // Listeners para estado de conexión
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "🌐 Conexión restaurada",
        description: "Ya puedes usar todas las funciones"
      });
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "📡 Sin conexión",
        description: "Algunas funciones pueden estar limitadas",
        variant: "destructive"
      });
    };

    // Verificar permisos de notificaciones
    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        const enabled = Notification.permission === 'granted';
        setStatus(prev => ({ ...prev, notificationsEnabled: enabled }));
      }
    };

    // Registrar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    checkNotificationPermission();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        logger.info('✅ PWA instalada por el usuario');
        toast({
          title: "📱 App instalada",
          description: "ComplicesConecta ahora está en tu dispositivo"
        });
        setStatus(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      } else {
        logger.info('❌ Usuario rechazó instalación PWA');
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
      
    } catch (error) {
      logger.error('❌ Error instalando PWA', { error });
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "❌ Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      
      setStatus(prev => ({ ...prev, notificationsEnabled: enabled }));
      
      if (enabled) {
        toast({
          title: "🔔 Notificaciones habilitadas",
          description: "Recibirás alertas de nuevos mensajes y matches"
        });
        
        // Enviar notificación de prueba
        new Notification('ComplicesConecta', {
          body: '¡Notificaciones configuradas correctamente!',
          icon: '/compliceslogo.png',
          badge: '/compliceslogo.png'
        });
      } else {
        toast({
          title: "🔕 Notificaciones bloqueadas",
          description: "Puedes habilitarlas desde la configuración del navegador",
          variant: "destructive"
        });
      }
      
      return enabled;
      
    } catch (error) {
      logger.error('❌ Error solicitando permisos de notificación', { error });
      return false;
    }
  };

  return {
    status,
    installPWA,
    requestNotificationPermission
  };
};

// Componente para mostrar estado PWA
export const PWAStatus: React.FC = () => {
  const { status, installPWA, requestNotificationPermission } = usePWA();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Estado de la App
        </CardTitle>
        <CardDescription>
          Funcionalidades móviles y PWA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de instalación */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Instalación</span>
          {status.isInstalled ? (
            <Badge variant="default" className="bg-green-500">
              <Smartphone className="h-3 w-3 mr-1" />
              Instalada
            </Badge>
          ) : status.isInstallable ? (
            <Button 
              size="sm" 
              onClick={installPWA}
              className="h-6 px-2 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Instalar
            </Button>
          ) : (
            <Badge variant="secondary">No disponible</Badge>
          )}
        </div>

        {/* Estado de conexión */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Conexión</span>
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                En línea
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Sin conexión
              </>
            )}
          </Badge>
        </div>

        {/* Estado de notificaciones */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notificaciones</span>
          {status.notificationsEnabled ? (
            <Badge variant="default" className="bg-blue-500">
              <Bell className="h-3 w-3 mr-1" />
              Habilitadas
            </Badge>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={requestNotificationPermission}
              className="h-6 px-2 text-xs"
            >
              <BellOff className="h-3 w-3 mr-1" />
              Habilitar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para banner de instalación
export const InstallBanner: React.FC = () => {
  const { status, installPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // No mostrar si ya está instalada, no es instalable, o fue descartada
  if (status.isInstalled || !status.isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Instalar ComplicesConecta
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Accede más rápido desde tu pantalla de inicio
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={installPWA}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Instalar
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Ahora no
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Service Worker Manager
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  public async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('⚠️ Service Worker no soportado');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      
      logger.info('✅ Service Worker registrado', {
        scope: this.registration.scope
      });

      // Listener para actualizaciones
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('🔄 Actualización de PWA disponible');
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      return true;
      
    } catch (error) {
      logger.error('❌ Error registrando Service Worker', { error });
      return false;
    }
  }

  private notifyUpdateAvailable(): void {
    // Enviar evento personalizado para notificar actualización
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  public async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      logger.info('🔄 Service Worker actualizado');
    } catch (error) {
      logger.error('❌ Error actualizando Service Worker', { error });
    }
  }
}

// Hook para gestionar actualizaciones de PWA
export const usePWAUpdates = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      toast({
        title: "🔄 Actualización disponible",
        description: "Una nueva versión de la app está lista",
        action: (
          <Button 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Actualizar
          </Button>
        )
      });
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [toast]);

  const applyUpdate = () => {
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
};

export default PWAStatus;
