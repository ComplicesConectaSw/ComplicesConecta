import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  MessageSquare,
  Image,
  BarChart3,
  Filter,
  RefreshCw
} from 'lucide-react';
import { reportService, type Report } from '@/services/ReportService';
import { logger } from '@/lib/logger';

interface ReportWithDetails extends Report {
  reporter_email?: string;
  reported_user_email?: string;
}

export const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'warning' | 'suspension' | 'ban' | 'dismiss'>('dismiss');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await reportService.getPendingReports();
      
      if (result.success && result.reports) {
        setReports(result.reports);
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudieron cargar los reportes",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('Error loading reports:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "Error al cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await reportService.getReportStatistics();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      logger.error('Error loading stats:', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  const handleResolveReport = async () => {
    if (!selectedReport || !resolutionAction) {
      toast({
        title: "Error",
        description: "Selecciona una acción para resolver el reporte",
        variant: "destructive"
      });
      return;
    }

    setIsResolving(true);

    try {
      const result = await reportService.resolveReport(
        selectedReport.id,
        resolutionAction,
        resolutionNotes
      );

      if (result.success) {
        toast({
          title: "Reporte resuelto",
          description: "El reporte ha sido resuelto exitosamente"
        });

        // Actualizar la lista de reportes
        setReports(prev => prev.filter(r => r.id !== selectedReport.id));
        setShowResolveDialog(false);
        setSelectedReport(null);
        setResolutionAction('dismiss');
        setResolutionNotes('');
        
        // Recargar estadísticas
        loadStats();
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo resolver el reporte",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('Error resolving report:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "Error al resolver el reporte",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: string | undefined) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'fake-profile': return <User className="w-4 h-4" />;
      case 'inappropriate-content': return <Image className="w-4 h-4" />;
      case 'harassment': return <MessageSquare className="w-4 h-4" />;
      case 'spam': return <AlertTriangle className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'fake-profile': 'Perfil falso',
      'inappropriate-content': 'Contenido inapropiado',
      'harassment': 'Acoso',
      'spam': 'Spam',
      'underage': 'Menor de edad',
      'scam': 'Estafa',
      'explicit-content': 'Contenido explícito',
      'impersonation': 'Suplantación',
      'other': 'Otro'
    };
    return labels[reason] || reason;
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && report.severity !== filterSeverity) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando reportes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reportes</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resueltos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Falsos Positivos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.falsePositives}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="reviewing">En revisión</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="dismissed">Desestimado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadReports} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Pendientes ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay reportes que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(report.severity).replace('bg-', '#') }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getReasonIcon(report.reason)}
                          <span className="font-medium">{getReasonLabel(report.reason)}</span>
                          <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white`}>
                            {report.severity}
                          </Badge>
                          <Badge variant="secondary">
                            {report.content_type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>Reportado por:</strong> {report.reporter_email || 'Usuario anónimo'}</p>
                            <p><strong>Usuario reportado:</strong> {report.reported_user_email || 'N/A'}</p>
                          </div>
                          <div>
                            <p><strong>Fecha:</strong> {report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}</p>
                            <p><strong>Estado:</strong> {report.status}</p>
                          </div>
                        </div>

                        {report.description && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm"><strong>Descripción:</strong></p>
                            <p className="text-sm mt-1">{report.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowResolveDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para resolver reporte */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolver Reporte</DialogTitle>
            <DialogDescription>
              Revisa los detalles del reporte y toma una acción apropiada.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Detalles del Reporte</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Motivo:</strong> {getReasonLabel(selectedReport.reason)}</p>
                    <p><strong>Severidad:</strong> {selectedReport.severity}</p>
                  </div>
                  <div>
                    <p><strong>Tipo:</strong> {selectedReport.content_type}</p>
                    <p><strong>Fecha:</strong> {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                {selectedReport.description && (
                  <div className="mt-3">
                    <p><strong>Descripción:</strong></p>
                    <p className="mt-1">{selectedReport.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Acción a tomar:</label>
                <Select value={resolutionAction} onValueChange={(value) => setResolutionAction(value as 'warning' | 'suspension' | 'ban' | 'dismiss')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin acción (falso positivo)</SelectItem>
                    <SelectItem value="warning">Advertencia al usuario</SelectItem>
                    <SelectItem value="content_removed">Remover contenido</SelectItem>
                    <SelectItem value="temporary_ban">Suspensión temporal</SelectItem>
                    <SelectItem value="permanent_ban">Suspensión permanente</SelectItem>
                    <SelectItem value="account_suspended">Suspender cuenta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Notas de resolución:</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explica la razón de tu decisión..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
              disabled={isResolving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolveReport}
              disabled={!resolutionAction || isResolving}
            >
              {isResolving ? "Resolviendo..." : "Resolver Reporte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
