import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  TrendingUp, 
  Settings, 
  Trash2, 
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useCacheStats, useCacheConfig } from '@/hooks/useAdvancedCache';
import { logger } from '@/lib/logger';

export function CacheDashboard() {
  const { stats, performanceAnalysis, refreshStats, optimizeCache, clearCache, cleanupCache } = useCacheStats();
  const { config: _config, updateConfig: _updateConfig, resetConfig } = useCacheConfig();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await optimizeCache();
      logger.info('Cache optimization completed');
    } catch (error) {
      logger.error('Error optimizing cache:', { error: String(error) });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Error clearing cache:', { error: String(error) });
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupCache();
      logger.info('Cache cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up cache:', { error: String(error) });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const _getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando estadísticas del cache...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard del Cache</h2>
          <p className="text-muted-foreground">
            Monitoreo y optimización del sistema de caché avanzado
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            onClick={handleOptimize} 
            disabled={isOptimizing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizando...' : 'Optimizar'}
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.hitRate)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHits} hits / {stats.totalMisses} misses
            </p>
            <Progress value={stats.hitRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAccessTime.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de acceso promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compresión</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.compressionRatio)}</div>
            <p className="text-xs text-muted-foreground">
              Ratio de compresión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Rendimiento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={getPerformanceBadgeVariant(stats.performanceScore)}>
                {stats.performanceScore.toFixed(0)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Puntuación general
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Estadísticas detalladas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entradas en Memoria:</span>
                  <span className="font-medium">{stats.memoryEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entradas Persistentes:</span>
                  <span className="font-medium">{stats.persistentEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Predicciones Exitosas:</span>
                  <span className="font-medium">{stats.predictiveHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ajustes TTL:</span>
                  <span className="font-medium">{stats.adaptiveTTLAdjustments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Evicciones:</span>
                  <span className="font-medium">{stats.evictionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pre-cargas:</span>
                  <span className="font-medium">{stats.warmingHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sincronizaciones:</span>
                  <span className="font-medium">{stats.distributedSyncs}</span>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análisis de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceAnalysis && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <Badge variant={getPerformanceBadgeVariant(performanceAnalysis.score)}>
                        {performanceAnalysis.score.toFixed(0)}
                      </Badge>
                    </div>
                    
                    {performanceAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recomendaciones:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {performanceAnalysis.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {performanceAnalysis.bottlenecks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cuellos de Botella:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {performanceAnalysis.bottlenecks.map((bottleneck: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              {bottleneck}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Eficiencia del Cache</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hit Rate</span>
                        <span>{formatPercentage(stats.hitRate)}</span>
                      </div>
                      <Progress value={stats.hitRate * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Miss Rate</span>
                        <span>{formatPercentage(stats.missRate)}</span>
                      </div>
                      <Progress value={stats.missRate * 100} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Velocidad</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tiempo Promedio:</span>
                      <span className="font-medium">{stats.averageAccessTime.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Hits:</span>
                      <span className="font-medium">{stats.totalHits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Misses:</span>
                      <span className="font-medium">{stats.totalMisses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Uso de Almacenamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Memoria</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tamaño:</span>
                      <span className="font-medium">{formatBytes(stats.memorySize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entradas:</span>
                      <span className="font-medium">{stats.memoryEntries}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Persistente</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tamaño:</span>
                      <span className="font-medium">{formatBytes(stats.persistentSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entradas:</span>
                      <span className="font-medium">{stats.persistentEntries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Cache
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Acciones de Mantenimiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Gestiona el cache y optimiza el rendimiento
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCleanup}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                    <Button variant="destructive" onClick={handleClearCache}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar Todo
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Configuración Avanzada</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Las configuraciones avanzadas están disponibles a través de la API del servicio de cache.
                  </p>
                  <Button variant="outline" onClick={resetConfig}>
                    <Settings className="h-4 w-4 mr-2" />
                    Restaurar Configuración
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CacheDashboard;
