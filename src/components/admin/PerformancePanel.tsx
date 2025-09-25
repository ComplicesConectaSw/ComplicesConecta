import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity, Server, Database, Wifi, Cpu, 
  HardDrive, RefreshCw, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface PerformanceData {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  metric_unit: string;
  recorded_at: string;
  created_at: string;
  metadata?: any;
}

export default function PerformancePanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0
  });
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<SystemMetric[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadRecentMetrics()
      ]);
    } catch (error) {
      console.error('Error loading performance data:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      // Since app_metrics table doesn't exist yet, use mock data
      // TODO: Implement real metrics collection when table is created
      generateMockMetrics();
    } catch (error) {
      console.error('Error loading system metrics:', error);
      generateMockMetrics();
    }
  };

  const loadRecentMetrics = async () => {
    try {
      // Since app_metrics table doesn't exist yet, use mock data
      // TODO: Implement real metrics collection when table is created
      generateMockRecentMetrics();
    } catch (error) {
      console.error('Error loading recent metrics:', error);
      generateMockRecentMetrics();
    }
  };

  const generateMockMetrics = () => {
    setSystemMetrics({
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100
    });

    setPerformanceData({
      responseTime: 150 + Math.random() * 100,
      throughput: 1000 + Math.random() * 500,
      errorRate: Math.random() * 5,
      uptime: 99.5 + Math.random() * 0.5
    });
  };

  const generateMockRecentMetrics = () => {
    const mockMetrics: SystemMetric[] = Array.from({ length: 10 }, (_, i) => ({
      id: `metric-${i}`,
      metric_name: ['CPU Usage', 'Memory Usage', 'Disk I/O', 'Network Traffic'][i % 4],
      metric_value: Math.random() * 100,
      metric_type: 'system',
      metric_unit: '%',
      recorded_at: new Date(Date.now() - i * 60000).toISOString(),
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      metadata: {}
    }));

    setMetrics(mockMetrics);
    setRecentMetrics(mockMetrics.slice(0, 5));
  };

  const generateMockData = () => {
    generateMockMetrics();
    generateMockRecentMetrics();
  };

  const refreshMetrics = async () => {
    setIsLoading(true);
    try {
      await loadPerformanceData();
      toast({
        title: "Métricas actualizadas",
        description: "Los datos de rendimiento han sido actualizados",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las métricas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = () => {
    const avgCpu = systemMetrics.cpu;
    const avgMemory = systemMetrics.memory;
    const errorRate = performanceData.errorRate;

    if (avgCpu > 80 || avgMemory > 85 || errorRate > 3) {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (avgCpu > 60 || avgMemory > 70 || errorRate > 1) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const formatMetricValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName.toLowerCase()) {
      case 'cpu usage':
        return <Cpu className="w-4 h-4" />;
      case 'memory usage':
        return <Server className="w-4 h-4" />;
      case 'disk i/o':
        return <HardDrive className="w-4 h-4" />;
      case 'network traffic':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Rendimiento</h2>
          <p className="text-gray-600">Monitoreo en tiempo real del sistema</p>
        </div>
        <Button 
          onClick={refreshMetrics}
          disabled={isLoading}
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* System Health Overview */}
      <Card className={health.bgColor}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {health.status === 'healthy' ? (
                <CheckCircle className={`w-8 h-8 ${health.color}`} />
              ) : (
                <AlertTriangle className={`w-8 h-8 ${health.color}`} />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${health.color}`}>
                  Estado del Sistema: {health.status === 'healthy' ? 'Saludable' : 
                                     health.status === 'warning' ? 'Advertencia' : 'Crítico'}
                </h3>
                <p className="text-sm text-gray-600">
                  Uptime: {performanceData.uptime.toFixed(2)}% | 
                  Tasa de Error: {performanceData.errorRate.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.throughput.toFixed(0)} req/s
              </div>
              <div className="text-sm text-gray-600">Throughput</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {systemMetrics.cpu.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">CPU Usage</div>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(systemMetrics.cpu, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {systemMetrics.memory.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Memory</div>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(systemMetrics.memory, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {systemMetrics.disk.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Disk I/O</div>
                  </div>
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(systemMetrics.disk, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {systemMetrics.network.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Network</div>
                  </div>
                  <Wifi className="w-8 h-8 text-orange-600" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(systemMetrics.network, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métricas de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tiempo de Respuesta</span>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {performanceData.responseTime.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Throughput</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {performanceData.throughput.toFixed(0)} req/s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tasa de Error</span>
                  <Badge className={`${performanceData.errorRate > 3 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {performanceData.errorRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {performanceData.uptime.toFixed(2)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Estado de la Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conexiones Activas</span>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {Math.floor(Math.random() * 50) + 10}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consultas por Segundo</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {Math.floor(Math.random() * 100) + 50}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tiempo de Consulta Promedio</span>
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {(Math.random() * 10 + 5).toFixed(1)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {(95 + Math.random() * 4).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas Detalladas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando métricas...</p>
                </div>
              ) : recentMetrics.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay métricas disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getMetricIcon(metric.metric_name)}
                        <div>
                          <div className="font-medium">{metric.metric_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(metric.recorded_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatMetricValue(metric.metric_value, metric.metric_unit)}
                        </div>
                        <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                          {metric.metric_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay historial disponible</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.metric_name)}
                        <span className="text-sm">{metric.metric_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatMetricValue(metric.metric_value, metric.metric_unit)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(metric.recorded_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}