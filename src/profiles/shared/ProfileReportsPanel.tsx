import React, { useState, useEffect } from 'react';
import { Shield, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { profileReportService } from '@/features/profile/ProfileReportService';
import { toast } from 'sonner';

interface ProfileReport {
  id: string;
  reported_user_id: string;
  reporter_user_id: string;
  reason: string;
  status: string | null;
  description?: string;
  created_at: string;
  reported_user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
  };
  reporter_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const REASON_LABELS = {
  harassment: 'Acoso o intimidación',
  impersonation: 'Suplantación de identidad',
  'fake-profile': 'Perfil falso',
  fraud: 'Fraude o estafa',
  underage: 'Menor de edad',
  other: 'Otro motivo'
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  confirmed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
};

export const ProfileReportsPanel: React.FC = () => {
  const [reports, setReports] = useState<ProfileReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ProfileReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await profileReportService.getPendingProfileReports();
      if (result.success && result.reports) {
        setReports(result.reports as unknown as ProfileReport[]);
      } else {
        toast.error(result.error || 'Error al cargar reportes');
      }
    } catch {
      toast.error('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (
    reportId: string,
    action: 'dismiss' | 'confirm',
    resolutionNotes?: string
  ) => {
    setActionLoading(reportId);

    try {
      const result = await profileReportService.resolveProfileReport(
        reportId,
        action === 'confirm' ? 'resolved' : 'dismissed',
        resolutionNotes
      );

      if (result.success) {
        toast.success(action === 'dismiss' ? 'Reporte desestimado' : 'Reporte confirmado');
        setSelectedReport(null);
        loadReports(); // Recargar lista
      } else {
        toast.error(result.error || 'Error al procesar reporte');
      }
    } catch {
      toast.error('Error interno del servidor');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status === 'pending';
    if (filter === 'reviewed') return report.status && ['dismissed', 'confirmed'].includes(report.status);
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reportes de Perfiles
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'reviewed')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="reviewed">Revisados</option>
          </select>

          <button
            onClick={loadReports}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Confirmados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {reports.filter(r => r.status === 'confirmed').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Desestimados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {reports.filter(r => r.status === 'dismissed').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {reports.length}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay reportes
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron reportes con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {report.reported_user?.full_name || 'Usuario desconocido'}
                        </span>
                      </div>

                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[report.status as keyof typeof STATUS_COLORS]}`}>
                        {report.status === 'pending' ? 'Pendiente' :
                          report.status === 'confirmed' ? 'Confirmado' :
                          report.status === 'dismissed' ? 'Desestimado' : 'Revisado'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        <span className="font-medium">Motivo:</span> {REASON_LABELS[report.reason as keyof typeof REASON_LABELS] || report.reason}
                      </p>
                      <p>
                        <span className="font-medium">Reportado por:</span> {report.reporter_user?.full_name || 'Usuario desconocido'}
                      </p>
                      <p>
                        <span className="font-medium">Fecha:</span> {formatDate(report.created_at)}
                      </p>
                      {report.description && (
                        <p>
                          <span className="font-medium">Descripción:</span> {report.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedReport(null)}
          />

          <div
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalles del Reporte
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usuario Reportado</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Nombre:</span> {selectedReport.reported_user?.full_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedReport.reported_user?.email}</p>
                    <p><span className="font-medium">Registro:</span> {selectedReport.reported_user?.created_at ? formatDate(selectedReport.reported_user.created_at) : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reportado por</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Nombre:</span> {selectedReport.reporter_user?.full_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedReport.reporter_user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalles del Reporte</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Motivo:</span> {REASON_LABELS[selectedReport.reason as keyof typeof REASON_LABELS]}</p>
                  <p><span className="font-medium">Fecha:</span> {formatDate(selectedReport.created_at)}</p>
                  {selectedReport.description && (
                    <div>
                      <span className="font-medium">Descripción:</span>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {selectedReport.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'dismiss', 'Reporte desestimado - no se encontró violación')}
                    disabled={actionLoading === selectedReport.id}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedReport.id ? 'Procesando...' : 'Desestimar'}
                  </button>

                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'confirm', 'Advertencia por violación de normas')}
                    disabled={actionLoading === selectedReport.id}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Advertir
                  </button>

                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'confirm', 'Suspensión temporal por violación')}
                    disabled={actionLoading === selectedReport.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Suspender
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
