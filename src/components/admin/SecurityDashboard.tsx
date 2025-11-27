import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { securityAuditService, SecurityReport } from '@/services/SecurityAuditService';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  Download,
  Eye,
  Ban,
  Lock
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityReport();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(loadSecurityReport, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const report = await securityAuditService.generateSecurityReport();
      setSecurityReport(report);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Error loading security report');
      console.error('Error loading security report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!securityReport) return;
    
    const reportData = {
      ...securityReport,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a') as HTMLAnchorElement;
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a as Node);
    a.click();
    document.body.removeChild(a as Node);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Reporte exportado",
      description: "El reporte de seguridad ha sido descargado",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard de seguridad...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!securityReport) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No hay datos de seguridad disponibles</AlertDescription>
      </Alert>
    );
  }

  const { metrics, topThreats, recentEvents, recommendations, complianceStatus } = securityReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Dashboard de Seguridad
          </h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de amenazas y eventos de seguridad
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadSecurityReport}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Seguridad</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
              {metrics.securityScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.securityScore >= 80 ? 'Excelente' : metrics.securityScore >= 60 ? 'Bueno' : 'Necesita atención'}
            </p>
            <Progress value={metrics.securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              De {metrics.totalEvents} eventos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Promedio de resolución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amenazas Activas</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{topThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="threats">Amenazas</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay recomendaciones pendientes</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estado de cumplimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GDPR</span>
                    <Badge variant={complianceStatus.gdpr ? 'default' : 'destructive'}>
                      {complianceStatus.gdpr ? 'Cumple' : 'No cumple'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CCPA</span>
                    <Badge variant={complianceStatus.ccpa ? 'default' : 'destructive'}>
                      {complianceStatus.ccpa ? 'Cumple' : 'No cumple'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ISO 27001</span>
                    <Badge variant={complianceStatus.iso27001 ? 'default' : 'destructive'}>
                      {complianceStatus.iso27001 ? 'Cumple' : 'No cumple'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ban className="mr-2 h-5 w-5" />
                Amenazas Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topThreats.length > 0 ? (
                <div className="space-y-4">
                  {topThreats.map((threat) => (
                    <div key={threat.threatId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{threat.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Detectado: {new Date(threat.detectedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {threat.affectedUsers.length} usuarios afectados
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Confianza: {(threat.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Acciones de mitigación:</h5>
                        <ul className="text-sm space-y-1">
                          {threat.mitigationActions.map((action, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No hay amenazas activas</h3>
                  <p className="text-muted-foreground">El sistema está funcionando correctamente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Eventos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-100' :
                        event.severity === 'high' ? 'bg-orange-100' :
                        event.severity === 'medium' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        {event.severity === 'critical' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : event.severity === 'high' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.eventType} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      {event.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Estado de Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">GDPR</h3>
                    <Badge variant={complianceStatus.gdpr ? 'default' : 'destructive'} className="mb-2">
                      {complianceStatus.gdpr ? 'Cumple' : 'No cumple'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Regulación General de Protección de Datos
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">CCPA</h3>
                    <Badge variant={complianceStatus.ccpa ? 'default' : 'destructive'} className="mb-2">
                      {complianceStatus.ccpa ? 'Cumple' : 'No cumple'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Ley de Privacidad del Consumidor de California
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">ISO 27001</h3>
                    <Badge variant={complianceStatus.iso27001 ? 'default' : 'destructive'} className="mb-2">
                      {complianceStatus.iso27001 ? 'Cumple' : 'No cumple'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Sistema de Gestión de Seguridad de la Información
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con última actualización */}
      {lastUpdate && (
        <div className="text-center text-sm text-muted-foreground">
          Última actualización: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  );
};
