/**
 * =====================================================
 * WEBHOOK CONFIG PANEL
 * =====================================================
 * Panel de configuración de webhooks
 * Fecha: 2025-10-30
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import webhookService, {
  type WebhookConfig,
  type WebhookProvider,
  type WebhookEventType
} from '@/services/WebhookService';

// =====================================================
// COMPONENT
// =====================================================

export const WebhookConfigPanel: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    provider: WebhookProvider;
    url: string;
    enabled: boolean;
    events: WebhookEventType[];
    minSeverity: 'low' | 'medium' | 'high' | 'critical';
    rateLimit: number;
  }>({
    name: '',
    provider: 'slack',
    url: '',
    enabled: true,
    events: ['error', 'alert'],
    minSeverity: 'medium',
    rateLimit: 60
  });

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    loadWebhooks();
  }, []);

  // =====================================================
  // FUNCTIONS
  // =====================================================

  const loadWebhooks = () => {
    setWebhooks(webhookService.getAllWebhooks());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      webhookService.updateWebhook(editingId, formData);
    } else {
      webhookService.registerWebhook(formData);
    }

    resetForm();
    loadWebhooks();
  };

  const handleEdit = (webhook: WebhookConfig) => {
    setFormData({
      name: webhook.name,
      provider: webhook.provider,
      url: webhook.url,
      enabled: webhook.enabled,
      events: webhook.events,
      minSeverity: webhook.minSeverity || 'medium',
      rateLimit: webhook.rateLimit || 60
    });
    setEditingId(webhook.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este webhook?')) {
      webhookService.deleteWebhook(id);
      loadWebhooks();
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    webhookService.updateWebhook(id, { enabled });
    loadWebhooks();
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await webhookService.testWebhook(id);
      if (result.success) {
        alert('✅ Test exitoso! Verifica tu canal de notificaciones.');
      } else {
        alert(`❌ Test fallido: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      alert(`❌ Error: ${String(error)}`);
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'slack',
      url: '',
      enabled: true,
      events: ['error', 'alert'],
      minSeverity: 'medium',
      rateLimit: 60
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleEvent = (event: WebhookEventType) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔔 Configuración de Webhooks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configura notificaciones a Slack, Discord y otros servicios
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Agregar Webhook</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Editar Webhook' : 'Nuevo Webhook'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Mi Webhook"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value as WebhookProvider })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>

            {/* Eventos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eventos
              </label>
              <div className="flex flex-wrap gap-2">
                {(['error', 'alert', 'report', 'performance', 'security'] as WebhookEventType[]).map(event => (
                  <button
                    key={event}
                    type="button"
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      formData.events.includes(event)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severidad mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severidad Mínima
                </label>
                <select
                  value={formData.minSeverity}
                  onChange={(e) => setFormData({ ...formData, minSeverity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              {/* Rate Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rate Limit (msg/min)
                </label>
                <input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
                  min={1}
                  max={600}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Habilitado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Habilitar webhook
              </label>
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Webhook'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Webhooks */}
      <div className="space-y-3">
        {webhooks.length === 0 && !showForm && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400">
              No hay webhooks configurados. Haz clic en "Agregar Webhook" para comenzar.
            </p>
          </div>
        )}

        {webhooks.map(webhook => (
          <div
            key={webhook.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {webhook.name}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    webhook.enabled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {webhook.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    {webhook.provider}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {webhook.url}
                </p>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map(event => (
                    <span
                      key={event}
                      className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                {webhook.lastUsed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Último uso: {new Date(webhook.lastUsed).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggle(webhook.id, !webhook.enabled)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title={webhook.enabled ? 'Desactivar' : 'Activar'}
                >
                  {webhook.enabled ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <XCircleIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(webhook)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Editar"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleTest(webhook.id)}
                  disabled={testingId === webhook.id}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Probar webhook"
                >
                  {testingId === webhook.id ? '⏳' : '🧪 Test'}
                </button>
                <button
                  onClick={() => handleDelete(webhook.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  title="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebhookConfigPanel;

