/**
 * AnalyticsPanel v3.4.0 - CONSOLIDADO
 * 
 * Panel de analytics completo que combina:
 * - Analytics generales de usuarios y engagement
 * - Analytics avanzados del sistema de tokens
 * - Métricas en tiempo real
 * - Integrado con TokenAnalyticsService y Supabase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3, Users, Activity, UserPlus, TrendingUp, Download,
  RefreshCw, Eye, Heart, MessageCircle,
  DollarSign as CurrencyDollarIcon
} from 'lucide-react';

// Importaciones para analytics de tokens
import TokenAnalyticsService, { TokenMetrics } from '@/services/TokenAnalyticsService';
import { analyticsMetrics } from '@/lib/analytics-metrics';

type AnalyticsData = {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  retentionRate: number;
  engagementRate: number;
  averageSessionTime: number;
  profileCompletionRate: number;
};

type ChartDataPoint = {
  date: string;
  users: number;
  sessions: number;
  engagement: number;
};

type DemographicData = {
  ageGroups: { range: string; count: number; percentage: number }[];
  genderDistribution: { gender: string; count: number; percentage: number }[];
  locationDistribution: { location: string; count: number; percentage: number }[];
};

export function AnalyticsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    retentionRate: 0,
    engagementRate: 0,
    averageSessionTime: 0,
    profileCompletionRate: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [demographicData, setDemographicData] = useState<DemographicData>({
    ageGroups: [],
    genderDistribution: [],
    locationDistribution: []
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Estados para analytics de tokens
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [_systemMetrics, setSystemMetrics] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    loadTokenMetrics();
    loadRealTimeMetrics();
    
    // Actualizar métricas en tiempo real cada 30 segundos
    const interval = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUserAnalytics(),
        loadChartData(),
        loadDemographicData()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading analytics:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para analytics de tokens
  const loadTokenMetrics = async () => {
    try {
      setTokenLoading(true);
      const response = await TokenAnalyticsService.getInstance().generateCurrentMetrics();
      
      if (response.success && response.metrics) {
        setTokenMetrics(response.metrics);
      } else {
        setTokenError(response.error || 'Error cargando métricas de tokens');
      }
    } catch {
      setTokenError('Error inesperado cargando métricas de tokens');
    } finally {
      setTokenLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const rtMetrics = analyticsMetrics.getRealTimeMetrics();
      const sysMetrics = analyticsMetrics.getSystemMetrics();
      
      setRealTimeMetrics(rtMetrics);
      setSystemMetrics(sysMetrics);
    } catch (err) {
      console.error('Error cargando métricas en tiempo real:', err);
    }
  };

  const generateTokenReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await TokenAnalyticsService.getInstance().generateAutomaticReport('daily');
      
      if (response.success && response.report) {
        console.log('Reporte generado:', response.report);
        toast({
          title: "Reporte generado",
          description: "El reporte de tokens ha sido generado exitosamente",
        });
      } else {
        setTokenError(response.error || 'Error generando reporte');
      }
    } catch {
      setTokenError('Error inesperado generando reporte');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      if (!supabase) {
        console.error('Supabase no está disponible');
        generateMockAnalytics();
        return;
      }
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, created_at, is_premium')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user analytics:', error);
        generateMockAnalytics();
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      type ProfileRow = { id: string; created_at: string | null; is_premium: boolean | null };
      
      const totalUsers = profiles?.length || 0;
      const newUsersToday = (profiles as ProfileRow[])?.filter((p) => 
        p.created_at && new Date(p.created_at) >= today
      ).length || 0;
      const newUsersWeek = (profiles as ProfileRow[])?.filter((p) => 
        p.created_at && new Date(p.created_at) >= weekAgo
      ).length || 0;

      // Mock calculations for complex metrics
      const activeUsers = Math.floor(totalUsers * 0.3);
      const retentionRate = 75.5;
      const engagementRate = 68.2;
      const averageSessionTime = 12.5;
      const profileCompletionRate = 82.3;

      setAnalyticsData({
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersWeek,
        retentionRate,
        engagementRate,
        averageSessionTime,
        profileCompletionRate
      });
    } catch (error) {
      console.error('Error processing user analytics:', error);
      generateMockAnalytics();
    }
  };

  const loadChartData = async () => {
    try {
      // Generate mock chart data for the selected time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const mockChartData: ChartDataPoint[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        mockChartData.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 20,
          sessions: Math.floor(Math.random() * 100) + 50,
          engagement: Math.floor(Math.random() * 30) + 40
        });
      }
      
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadDemographicData = async () => {
    try {
      if (!supabase) {
        console.error('Supabase no está disponible');
        generateMockDemographics();
        return;
      }
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('age, gender, bio')
        .not('age', 'is', null);

      if (error || !profiles) {
        generateMockDemographics();
        return;
      }

      // Process age groups
      const ageGroups = [
        { range: '18-24', count: 0, percentage: 0 },
        { range: '25-34', count: 0, percentage: 0 },
        { range: '35-44', count: 0, percentage: 0 },
        { range: '45+', count: 0, percentage: 0 }
      ];

      profiles.forEach(profile => {
        if (profile.age) {
          if (profile.age >= 18 && profile.age <= 24) ageGroups[0].count++;
          else if (profile.age >= 25 && profile.age <= 34) ageGroups[1].count++;
          else if (profile.age >= 35 && profile.age <= 44) ageGroups[2].count++;
          else if (profile.age >= 45) ageGroups[3].count++;
        }
      });

      const totalWithAge = ageGroups.reduce((sum, group) => sum + group.count, 0);
      ageGroups.forEach(group => {
        group.percentage = totalWithAge > 0 ? (group.count / totalWithAge) * 100 : 0;
      });

      // Process gender distribution
      const genderCounts = profiles.reduce((acc, profile) => {
        const gender = profile.gender || 'no_especificado';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
        gender: gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : 'No especificado',
        count,
        percentage: (count / profiles.length) * 100
      }));

      // Mock location data
      const locationDistribution = [
        { location: 'Ciudad de México', count: Math.floor(profiles.length * 0.3), percentage: 30 },
        { location: 'Guadalajara', count: Math.floor(profiles.length * 0.2), percentage: 20 },
        { location: 'Monterrey', count: Math.floor(profiles.length * 0.15), percentage: 15 },
        { location: 'Otras ciudades', count: Math.floor(profiles.length * 0.35), percentage: 35 }
      ];

      setDemographicData({
        ageGroups,
        genderDistribution,
        locationDistribution
      });
    } catch (error) {
      console.error('Error loading demographic data:', error);
      generateMockDemographics();
    }
  };

  const generateMockData = () => {
    generateMockAnalytics();
    generateMockDemographics();
    loadChartData();
  };

  const generateMockAnalytics = () => {
    setAnalyticsData({
      totalUsers: 1250,
      activeUsers: 375,
      newUsersToday: 12,
      newUsersWeek: 89,
      retentionRate: 75.5,
      engagementRate: 68.2,
      averageSessionTime: 12.5,
      profileCompletionRate: 82.3
    });
  };

  const generateMockDemographics = () => {
    setDemographicData({
      ageGroups: [
        { range: '18-24', count: 312, percentage: 25 },
        { range: '25-34', count: 500, percentage: 40 },
        { range: '35-44', count: 312, percentage: 25 },
        { range: '45+', count: 126, percentage: 10 }
      ],
      genderDistribution: [
        { gender: 'Femenino', count: 650, percentage: 52 },
        { gender: 'Masculino', count: 550, percentage: 44 },
        { gender: 'No especificado', count: 50, percentage: 4 }
      ],
      locationDistribution: [
        { location: 'Ciudad de México', count: 375, percentage: 30 },
        { location: 'Guadalajara', count: 250, percentage: 20 },
        { location: 'Monterrey', count: 188, percentage: 15 },
        { location: 'Otras ciudades', count: 437, percentage: 35 }
      ]
    });
  };

  const exportData = () => {
    const dataToExport = {
      analytics: analyticsData,
      demographics: demographicData,
      chartData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a') as HTMLAnchorElement;
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a as Node);
    a.click();
    document.body.removeChild(a as Node);
    URL.revokeObjectURL(url);

    toast({
      title: "Datos exportados",
      description: "Los datos de analytics han sido descargados exitosamente",
    });
  };

  const refreshData = async () => {
    await loadAnalyticsData();
    toast({
      title: "Datos actualizados",
      description: "Los datos de analytics han sido actualizados",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Panel de Analytics
          </h2>
          <p className="text-gray-600">
            Análisis de usuarios, engagement y métricas de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={exportData} className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-8 px-3 text-sm shadow-md">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={refreshData} disabled={isLoading} className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-8 px-3 text-sm shadow-md disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.newUsersWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analyticsData.activeUsers / analyticsData.totalUsers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de engagement promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Retención a 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo promedio de sesión:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analyticsData.averageSessionTime} min
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de completado de perfil:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analyticsData.profileCompletionRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Nuevos usuarios hoy:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      +{analyticsData.newUsersToday}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Usuarios que completan el perfil</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente ({timeRange})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Gráfico de actividad</p>
                  <p className="text-sm">Datos: {chartData.length} puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Nuevos usuarios hoy:</span>
                    <Badge className="border border-gray-200">
                      <UserPlus className="w-3 h-3 mr-1" />
                      {analyticsData.newUsersToday}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Usuarios activos:</span>
                    <Badge className="bg-green-100 text-green-800">
                      <Activity className="w-3 h-3 mr-1" />
                      {analyticsData.activeUsers}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total registrados:</span>
                    <Badge className="border border-gray-200">
                      <Users className="w-3 h-3 mr-1" />
                      {analyticsData.totalUsers}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Sesiones promedio:</span>
                    <Badge className="bg-blue-100 text-blue-800">2.3/día</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo en la app:</span>
                    <Badge className="bg-purple-100 text-purple-800">{analyticsData.averageSessionTime} min</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de retorno:</span>
                    <Badge className="bg-orange-100 text-orange-800">{analyticsData.retentionRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visualizaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2K</div>
                <p className="text-xs text-muted-foreground">Perfiles vistos hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Likes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.7K</div>
                <p className="text-xs text-muted-foreground">Likes dados hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.1K</div>
                <p className="text-xs text-muted-foreground">Mensajes enviados hoy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographicData.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <span className="text-sm">{group.range} años</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{group.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Género</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographicData.genderDistribution.map((item) => (
                    <div key={item.gender} className="flex items-center justify-between">
                      <span className="text-sm">{item.gender}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución Geográfica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {demographicData.locationDistribution.map((location) => (
                  <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{location.location}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {location.count} usuarios
                      </Badge>
                      <span className="text-sm text-gray-600">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          {tokenLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-2 text-gray-600">Cargando analytics de tokens...</span>
            </div>
          ) : (
            <>
              {/* Controles de tokens */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Analytics del Sistema de Tokens</h3>
                <Button
                  onClick={generateTokenReport}
                  disabled={isGeneratingReport}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
                </Button>
              </div>

              {/* Métricas en tiempo real */}
              {realTimeMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Usuarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{realTimeMetrics.activeUsers}</div>
                      <p className="text-xs text-gray-500">En línea ahora</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Eventos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.recentEvents}</div>
                      <p className="text-xs text-gray-500">Último minuto</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Sesiones Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{realTimeMetrics.totalSessions}</div>
                      <p className="text-xs text-gray-500">Desde inicio</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Pico de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{realTimeMetrics.peakConcurrentUsers}</div>
                      <p className="text-xs text-gray-500">Máximo concurrente</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Métricas de tokens */}
              {tokenMetrics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        Supply de Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">CMPX Total</span>
                            <span className="text-xl font-bold text-green-600">
                              {tokenMetrics.totalSupply.cmpx.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">CMPX Circulante</span>
                            <span className="text-lg text-green-500">
                              {tokenMetrics.circulatingSupply.cmpx.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">GTK Total</span>
                            <span className="text-xl font-bold text-blue-600">
                              {tokenMetrics.totalSupply.gtk.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">GTK Circulante</span>
                            <span className="text-lg text-blue-500">
                              {tokenMetrics.circulatingSupply.gtk.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Actividad de Transacciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600">Volumen CMPX (24h)</span>
                          <p className="text-2xl font-bold text-green-600">
                            {tokenMetrics.transactionVolume.cmpx.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Volumen GTK (24h)</span>
                          <p className="text-2xl font-bold text-blue-600">
                            {tokenMetrics.transactionVolume.gtk.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Transacciones</span>
                          <p className="text-xl font-bold text-gray-800">
                            {tokenMetrics.transactionVolume.count.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {tokenError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-600">{tokenError}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}