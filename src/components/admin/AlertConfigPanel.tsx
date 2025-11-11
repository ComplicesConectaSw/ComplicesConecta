/**
 * =====================================================
 * ALERT CONFIG PANEL
 * =====================================================
 * Panel de configuración de alertas y umbrales
 * Fecha: 2025-10-29
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Modal';
import { logger } from '@/lib/logger';
import errorAlertService, { AlertRule } from '@/services/ErrorAlertService';
import { useToast } from '@/hooks/useToast';
import { safeGetItem, safeSetItem } from '@/utils/safeLocalStorage';
// performanceMonitoring - preparado para uso futuro en configuración avanzada
// import performanceMonitoring from '@/services/PerformanceMonitoringService';

// =====================================================
// INTERFACES
// =====================================================

interface AlertConfig {
  id: string;
  name: string;
  type: 'performance' | 'error';
  enabled: boolean;
  conditions: {
    metric?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    threshold?: number;
    operator?: '>' | '<' | '=' | '>=' | '<=';
  };
  actions: {
    notification: boolean;
    email: boolean;
    console: boolean;
  };
}

// =====================================================
// PRESETS DE CONFIGURACIÓN
// =====================================================

const ALERT_PRESETS: AlertConfig[] = [
  {
    id: 'performance-critical',
    name: 'Performance Crítico',
    type: 'performance',
    enabled: true,
    conditions: {
      metric: 'pageLoadTime',
      threshold: 4000,
      operator: '>='
    },
    actions: {
      notification: true,
      email: false,
      console: true
    }
  },
  {
    id: 'error-critical',
    name: 'Error Crítico',
    type: 'error',
    enabled: true,
    conditions: {
      severity: 'critical'
    },
    actions: {
      notification: true,
      email: false,
      console: true
    }
  },
  {
    id: 'performance-warning',
    name: 'Performance Advertencia',
    type: 'performance',
    enabled: true,
    conditions: {
      metric: 'pageLoadTime',
      threshold: 2000,
      operator: '>='
    },
    actions: {
      notification: false,
      email: false,
      console: true
    }
  },
  {
    id: 'memory-high',
    name: 'Uso de Memoria Alto',
    type: 'performance',
    enabled: true,
    conditions: {
      metric: 'memoryUsage',
      threshold: 200,
      operator: '>='
    },
    actions: {
      notification: true,
      email: false,
      console: true
    }
  }
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const AlertConfigPanel: React.FC = () => {
  const [configs, setConfigs] = useState<AlertConfig[]>(ALERT_PRESETS);
  const [activeTab, setActiveTab] = useState<'performance' | 'error'>('performance');
  const [editingConfig, setEditingConfig] = useState<AlertConfig | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<AlertConfig>>({
    name: '',
    type: 'performance',
    enabled: true,
    conditions: {},
    actions: {
      notification: true,
      email: false,
      console: true
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
    logger.info('📋 Alert Config Panel loaded');
  }, []);

  // =====================================================
  // MÉTODOS PRINCIPALES
  // =====================================================

  const loadConfigs = () => {
    try {
      const saved = safeGetItem<AlertConfig[]>('alert-configs', { validate: false, defaultValue: null });
      if (saved && Array.isArray(saved)) {
        setConfigs(saved);
        applyConfigs(saved);
      } else {
        applyConfigs(ALERT_PRESETS);
      }
    } catch (error) {
      logger.error('Error loading alert configs:', { error: String(error) });
    }
  };

  const saveConfigs = (newConfigs: AlertConfig[]) => {
    try {
      safeSetItem('alert-configs', newConfigs, { validate: false, sanitize: true });
      setConfigs(newConfigs);
      applyConfigs(newConfigs);
      logger.info('✅ Alert configs saved');
    } catch (error) {
      logger.error('Error saving alert configs:', { error: String(error) });
    }
  };

  const applyConfigs = (configs: AlertConfig[]) => {
    // Aplicar configuraciones a los servicios
    configs.forEach((config) => {
      if (config.type === 'error' && config.enabled) {
        // Configurar reglas de error
        const rule: AlertRule = {
          id: config.id,
          name: config.name,
          enabled: config.enabled,
          condition: (alert) => {
            if (config.conditions.severity) {
              return alert.severity === config.conditions.severity;
            }
            return false;
          },
          actions: []
        };

        if (config.actions.console) {
          rule.actions.push({ type: 'console', level: 'error' });
        }

        if (config.actions.notification) {
          rule.actions.push({
            type: 'notification',
            title: `Alerta: ${config.name}`,
            body: 'Se ha detectado una alerta crítica'
          });
        }

        // Agregar regla al servicio
        errorAlertService.addRule(rule);
      }
    });
  };

  const toggleConfig = (id: string) => {
    const newConfigs = configs.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    saveConfigs(newConfigs);
  };

  const deleteConfig = (id: string) => {
    const newConfigs = configs.filter((c) => c.id !== id);
    saveConfigs(newConfigs);
  };

  const addConfig = () => {
    if (!newConfig.name || !newConfig.type) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    if (editingConfig) {
      // Modo edición
      const updatedConfig: AlertConfig = {
        ...editingConfig,
        name: newConfig.name!,
        type: newConfig.type!,
        enabled: newConfig.enabled ?? true,
        conditions: newConfig.conditions || {},
        actions: newConfig.actions || {
          notification: true,
          email: false,
          console: true
        }
      };
      updateConfig(updatedConfig);
    } else {
      // Modo creación
      const config: AlertConfig = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newConfig.name!,
        type: newConfig.type!,
        enabled: newConfig.enabled ?? true,
        conditions: newConfig.conditions || {},
        actions: newConfig.actions || {
          notification: true,
          email: false,
          console: true
        }
      };

      const newConfigs = [...configs, config];
      saveConfigs(newConfigs);
      toast({
        title: "Éxito",
        description: "Alerta creada exitosamente"
      });
    }

    setShowAddDialog(false);
    setEditingConfig(null);
    setNewConfig({
      name: '',
      type: 'performance',
      enabled: true,
      conditions: {},
      actions: {
        notification: true,
        email: false,
        console: true
      }
    });
  };

  const updateConfig = (config: AlertConfig) => {
    const newConfigs = configs.map((c) => (c.id === config.id ? config : c));
    saveConfigs(newConfigs);
    setEditingConfig(null);
    toast({
      title: "Éxito",
      description: "Alerta actualizada exitosamente"
    });
  };

  const testAlert = (config: AlertConfig) => {
    logger.info(`🧪 Testing alert: ${config.name}`);

    if (config.type === 'error') {
      errorAlertService.createAlert({
        severity: config.conditions.severity || 'medium',
        category: 'unknown',
        message: `TEST: ${config.name}`,
        error: 'Test alert triggered manually'
      });
    }

    if (config.actions.notification && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Test: ${config.name}`, {
          body: 'Esta es una alerta de prueba',
          icon: '/icon.png'
        });
      } else {
        alert(`Alerta de prueba: ${config.name}`);
      }
    }
  };

  // =====================================================
  // RENDERIZADO
  // =====================================================

  const filteredConfigs = configs.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración de Alertas</h2>
          <p className="text-gray-400 mt-1">
            Configura umbrales y acciones para las alertas del sistema
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Alerta
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Performance</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('error')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'error'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Errores</span>
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Configuraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredConfigs.map((config) => (
          <div
            key={config.id}
            className={`bg-slate-700/50 rounded-lg border p-4 transition-all ${
              config.enabled
                ? 'border-slate-600 hover:border-blue-500'
                : 'border-slate-700/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    config.type === 'performance'
                      ? 'bg-blue-500/20'
                      : 'bg-red-500/20'
                  }`}
                >
                  {config.type === 'performance' ? (
                    <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{config.name}</h3>
                  <p className="text-sm text-gray-400">
                    {config.type === 'performance' && config.conditions.metric
                      ? `${config.conditions.metric} ${config.conditions.operator} ${config.conditions.threshold}`
                      : `Severidad: ${config.conditions.severity}`}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => toggleConfig(config.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Acciones Activas */}
            <div className="flex items-center space-x-2 mb-3 text-sm">
              <span className="text-gray-400">Acciones:</span>
              {config.actions.notification && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                  <BellIcon className="h-4 w-4 inline mr-1" />
                  Notificación
                </span>
              )}
              {config.actions.console && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                  Console
                </span>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => testAlert(config)}
                variant="outline"
                size="sm"
                className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                🧪 Probar
              </Button>
              <Button
                onClick={() => {
                  setEditingConfig(config);
                  setNewConfig({
                    name: config.name,
                    type: config.type,
                    enabled: config.enabled,
                    conditions: config.conditions,
                    actions: config.actions
                  });
                  setShowAddDialog(true);
                }}
                variant="outline"
                size="sm"
                className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                ✏️ Editar
              </Button>
              <Button
                onClick={() => deleteConfig(config.id)}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-600 hover:bg-red-900/20"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConfigs.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No hay alertas configuradas para {activeTab}</p>
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            className="mt-4"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Primera Alerta
          </Button>
        </div>
      )}

      {/* Dialog para Agregar/Editar Alerta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Editar Alerta' : 'Nueva Alerta'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingConfig
                ? 'Modifica la configuración de la alerta'
                : 'Crea una nueva alerta personalizada para monitorear el sistema'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="alert-name">Nombre de la Alerta</Label>
              <Input
                id="alert-name"
                value={newConfig.name || ''}
                onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                placeholder="Ej: Tiempo de carga crítico"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="alert-type">Tipo de Alerta</Label>
              <Select
                value={newConfig.type}
                onValueChange={(value) => setNewConfig({ ...newConfig, type: value as 'performance' | 'error' })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condiciones para Performance */}
            {newConfig.type === 'performance' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="alert-metric">Métrica</Label>
                  <Select
                    value={newConfig.conditions?.metric || ''}
                    onValueChange={(value) => setNewConfig({
                      ...newConfig,
                      conditions: { ...newConfig.conditions, metric: value }
                    })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecciona la métrica" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pageLoadTime">Tiempo de Carga de Página</SelectItem>
                      <SelectItem value="apiResponseTime">Tiempo de Respuesta API</SelectItem>
                      <SelectItem value="memoryUsage">Uso de Memoria</SelectItem>
                      <SelectItem value="cpuUsage">Uso de CPU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-operator">Operador</Label>
                    <Select
                      value={newConfig.conditions?.operator || '>='}
                      onValueChange={(value) => setNewConfig({
                        ...newConfig,
                        conditions: { ...newConfig.conditions, operator: value as '>' | '<' | '=' | '>=' | '<=' }
                      })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                        <SelectItem value="<">Menor que (&lt;)</SelectItem>
                        <SelectItem value=">=">Mayor o igual (&gt;=)</SelectItem>
                        <SelectItem value="<=">Menor o igual (&lt;=)</SelectItem>
                        <SelectItem value="=">Igual (=)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Umbral</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      value={newConfig.conditions?.threshold || ''}
                      onChange={(e) => setNewConfig({
                        ...newConfig,
                        conditions: { ...newConfig.conditions, threshold: Number(e.target.value) }
                      })}
                      placeholder="1000"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Condiciones para Error */}
            {newConfig.type === 'error' && (
              <div className="space-y-2">
                <Label htmlFor="alert-severity">Severidad</Label>
                <Select
                  value={newConfig.conditions?.severity || 'medium'}
                  onValueChange={(value) => setNewConfig({
                    ...newConfig,
                    conditions: { ...newConfig.conditions, severity: value as 'low' | 'medium' | 'high' | 'critical' }
                  })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-3 border-t border-slate-700 pt-4">
              <Label>Acciones a Ejecutar</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Notificación del navegador</span>
                <Switch
                  checked={newConfig.actions?.notification ?? true}
                  onCheckedChange={(checked) => setNewConfig({
                    ...newConfig,
                    actions: {
                      notification: checked,
                      console: newConfig.actions?.console ?? true,
                      email: newConfig.actions?.email ?? false
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Registro en consola</span>
                <Switch
                  checked={newConfig.actions?.console ?? true}
                  onCheckedChange={(checked) => setNewConfig({
                    ...newConfig,
                    actions: {
                      notification: newConfig.actions?.notification ?? true,
                      console: checked,
                      email: newConfig.actions?.email ?? false
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enviar por email</span>
                <Switch
                  checked={newConfig.actions?.email ?? false}
                  onCheckedChange={(checked) => setNewConfig({
                    ...newConfig,
                    actions: {
                      notification: newConfig.actions?.notification ?? true,
                      console: newConfig.actions?.console ?? true,
                      email: checked
                    }
                  })}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between border-t border-slate-700 pt-4">
              <span className="text-sm text-gray-300">Alerta Habilitada</span>
              <Switch
                checked={newConfig.enabled ?? true}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, enabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingConfig(null);
                setNewConfig({
                  name: '',
                  type: 'performance',
                  enabled: true,
                  conditions: {},
                  actions: {
                    notification: true,
                    email: false,
                    console: true
                  }
                });
              }}
              className="text-gray-300 border-slate-600 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={addConfig}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingConfig ? 'Actualizar' : 'Crear'} Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertConfigPanel;

