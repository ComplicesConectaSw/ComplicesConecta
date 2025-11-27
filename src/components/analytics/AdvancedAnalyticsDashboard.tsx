import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Target,
  Cpu,
  HardDrive,
  Bell
} from 'lucide-react';
import { 
  useAdvancedAnalytics, 
  useAnalyticsMetrics, 
  usePredictiveInsights, 
  useAnalyticsAlerts,
  usePerformanceMetrics
} from '@/hooks/useAdvancedAnalytics';
import { logger } from '@/lib/logger';

export function AdvancedAnalyticsDashboard() {
  const { dashboard, isLoading, error, refreshDashboard, resolveAlert } = useAdvancedAnalytics({
    enableRealTimeUpdates: true,
    updateInterval: 30000,
    enableUserTracking: true,
    enablePredictiveInsights: true,
    onAlert: (alert) => {
      logger.warn('Analytics alert received:', { alert });
    },
    onInsight: (insight) => {
      logger.info('Predictive insight generated:', { insight });
    }
  });

  const { realTimeMetrics, trends } = useAnalyticsMetrics();
  const { allInsights, retentionInsights, conversionInsights } = usePredictiveInsights();
  const { unresolvedAlerts, criticalAlerts, highAlerts } = useAnalyticsAlerts();
  const { cachePerformance, memoryUsage } = usePerformanceMetrics();

  const [_selectedTimeRange, _setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'user_retention': return <Users className="h-5 w-5" />;
      case 'conversion': return <Target className="h-5 w-5" />;
      case 'churn': return <TrendingDown className="h-5 w-5" />;
      case 'engagement': return <Activity className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (isLoading && !dashboard) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando analytics avanzados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avanzados</h2>
          <p className="text-muted-foreground">
            Dashboard completo de métricas, insights predictivos y alertas en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDashboard}>
            <Activity className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alertas críticas */}
      {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Alertas Activas</AlertTitle>
          <AlertDescription>
            {criticalAlerts.length} alertas críticas y {highAlerts.length} alertas de alta prioridad
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics ? formatNumber(realTimeMetrics.activeUsers) : '0'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends && getTrendIcon(trends.userGrowth)}
              <span className="ml-1">
                {trends ? Math.abs(trends.userGrowth).toFixed(1) + '%' : '0%'} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics ? formatNumber(realTimeMetrics.pageViews) : '0'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends && getTrendIcon(trends.engagementTrend)}
              <span className="ml-1">
                {trends ? Math.abs(trends.engagementTrend).toFixed(1) + '%' : '0%'} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics ? formatPercentage(realTimeMetrics.errorRate) : '0%'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends && getTrendIcon(-trends.errorTrend)}
              <span className="ml-1">
                {trends ? Math.abs(trends.errorTrend).toFixed(1) + '%' : '0%'} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics ? realTimeMetrics.averageResponseTime.toFixed(0) + 'ms' : '0ms'}
            </div>
            <Progress 
              value={realTimeMetrics ? Math.min((realTimeMetrics.averageResponseTime / 2000) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="insights">Insights Predictivos</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Métricas en tiempo real */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {realTimeMetrics && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">API Calls:</span>
                      <span className="font-medium">{formatNumber(realTimeMetrics.apiCalls)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cache Hit Rate:</span>
                      <span className="font-medium">{formatPercentage(realTimeMetrics.cacheHitRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Uso de Memoria:</span>
                      <span className="font-medium">{formatPercentage(realTimeMetrics.memoryUsage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Uso de CPU:</span>
                      <span className="font-medium">{formatPercentage(realTimeMetrics.cpuUsage)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Última actualización: {new Date(realTimeMetrics.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Insights predictivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights Predictivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allInsights.length > 0 ? (
                  allInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="text-blue-600">
                        {getInsightIcon(insight.predictionType)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm capitalize">
                          {insight.predictionType.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Probabilidad: {formatPercentage(insight.probability)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confianza: {formatPercentage(insight.confidence)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No hay insights predictivos disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Retención de usuarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Retención de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {retentionInsights.length > 0 ? (
                  retentionInsights.map((insight, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Probabilidad:</span>
                        <Badge variant="outline">
                          {formatPercentage(insight.probability)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Factores:</strong> {insight.factors.join(', ')}
                      </div>
                      <div className="text-sm">
                        <strong>Recomendaciones:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i} className="text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No hay insights de retención disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversiones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Conversiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversionInsights.length > 0 ? (
                  conversionInsights.map((insight, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Probabilidad:</span>
                        <Badge variant="outline">
                          {formatPercentage(insight.probability)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Factores:</strong> {insight.factors.join(', ')}
                      </div>
                      <div className="text-sm">
                        <strong>Recomendaciones:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i} className="text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No hay insights de conversión disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rendimiento del cache */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Rendimiento del Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cachePerformance && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hit Rate</span>
                        <span>{formatPercentage(cachePerformance.hitRate)}</span>
                      </div>
                      <Progress value={cachePerformance.hitRate * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Miss Rate</span>
                        <span>{formatPercentage(cachePerformance.missRate)}</span>
                      </div>
                      <Progress value={cachePerformance.missRate * 100} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tiempo Promedio:</span>
                      <span className="font-medium">{cachePerformance.averageAccessTime.toFixed(1)}ms</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Uso de memoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Uso de Memoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {memoryUsage && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Heap Usado:</span>
                      <span className="font-medium">{formatBytes(memoryUsage.heapUsed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Heap Total:</span>
                      <span className="font-medium">{formatBytes(memoryUsage.heapTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">External:</span>
                      <span className="font-medium">{formatBytes(memoryUsage.external)}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uso</span>
                        <span>{formatPercentage(memoryUsage.heapUsed / memoryUsage.heapTotal)}</span>
                      </div>
                      <Progress value={(memoryUsage.heapUsed / memoryUsage.heapTotal) * 100} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unresolvedAlerts.length > 0 ? (
                <div className="space-y-3">
                  {unresolvedAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                            className="ml-auto"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No hay alertas activas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
