import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Download,
  BarChart3,
  Activity,
  UserCheck,
  Mail,
  Settings,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  reportsCount: number;
  moderatorsCount: number;
  newUsersToday: number;
  matchesToday: number;
  careerApplications: number;
  moderatorRequests: number;
}

interface UserActivity {
  id: string;
  email: string;
  full_name?: string;
  last_sign_in_at?: string;
  created_at: string;
  is_active: boolean;
}

interface SystemReport {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: _user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    reportsCount: 0,
    moderatorsCount: 0,
    newUsersToday: 0,
    matchesToday: 0,
    careerApplications: 0,
    moderatorRequests: 0
  });
  
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [systemReports, setSystemReports] = useState<SystemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [__filterType, _setFilterType] = useState('all');

  // Verificar permisos de admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      if (!supabase) {
        logger.error('Supabase no est disponible');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Obtener estadsticas de usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at')
        .order('created_at', { ascending: false }) as { data: any[] | null, error: any };

      if (usersError) throw usersError;

      // Calcular estadsticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalUsers = usersData?.length || 0;
      const newUsersToday = usersData?.filter((u: any) => 
        new Date(u.created_at) >= today
      ).length || 0;
      
      const activeUsers = usersData?.filter((u: any) => 
        u.updated_at && new Date(u.updated_at) >= weekAgo
      ).length || 0;

      // Obtener estadsticas de matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, created_at');

      if (matchesError) throw matchesError;

      type MatchRow = Database['public']['Tables']['matches']['Row'];
      const matches = (matchesData || []) as MatchRow[];

      const totalMatches = matches.length;
      const matchesToday = matches.filter((m) => 
        m.created_at && new Date(m.created_at) >= today
      ).length;

      // Obtener estadsticas de mensajes
      const { data: messagesData, error: _messagesError } = await supabase
        .from('messages')
        .select('id');

      const totalMessages = messagesData?.length || 0;

      // Obtener reportes
      const { data: reportsData, error: _reportsError } = await supabase
        .from('reports')
        .select('id')
        .eq('resolved', false);

      const reportsCount = reportsData?.length || 0;

      // Obtener moderadores
      const { data: moderatorsData, error: _moderatorsError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'moderator');

      const moderatorsCount = moderatorsData?.length || 0;

      // Obtener solicitudes de carrera
      const { data: careerData, error: _careerError } = await supabase
        .from('career_applications')
        .select('id');

      const careerApplications = careerData?.length || 0;

      // Obtener solicitudes de moderadores
      const { data: moderatorRequestsData, error: _moderatorRequestsError } = await supabase
        .from('moderator_requests')
        .select('id');

      const moderatorRequests = moderatorRequestsData?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalMatches,
        totalMessages,
        reportsCount,
        moderatorsCount,
        newUsersToday,
        matchesToday,
        careerApplications,
        moderatorRequests
      });

      // Cargar actividad de usuarios recientes
      const { data: recentUsers, error: recentUsersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, name, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!recentUsersError && recentUsers) {
        type RecentProfileRow = Database['public']['Tables']['profiles']['Row'];
        const recentProfiles = (recentUsers || []) as RecentProfileRow[];
        setUserActivity(recentProfiles.map((u) => ({
          id: u.id,
          email: '', // Email no está disponible en profiles directamente
          full_name: u.name || (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : 'Usuario'),
          last_sign_in_at: u.updated_at || undefined,
          created_at: u.created_at || new Date().toISOString(),
          is_active: u.updated_at ? new Date(u.updated_at) >= weekAgo : false
        })));
      }

      // Generar reportes del sistema simulados
      setSystemReports([
        {
          id: '1',
          type: 'security',
          message: 'Mltiples intentos de login fallidos detectados',
          severity: 'medium',
          created_at: new Date().toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'performance',
          message: 'Tiempo de respuesta de la base de datos elevado',
          severity: 'low',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'content',
          message: 'Contenido inapropiado reportado por usuarios',
          severity: 'high',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          resolved: false
        }
      ]);

    } catch (error) {
      logger.error('Error loading dashboard data:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const exportData = async (type: string) => {
    try {
      if (!supabase) {
        logger.error('Supabase no est disponible');
        toast({
          title: "Error",
          description: "Supabase no est disponible",
          variant: "destructive"
        });
        return;
      }
      
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'users': {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('*');
          data = usersData || [];
          filename = 'usuarios_export.json';
          break;
        }
        case 'matches': {
          const { data: matchesData } = await supabase
            .from('matches')
            .select('*');
          data = matchesData || [];
          filename = 'matches_export.json';
          break;
        }
        case 'reports': {
          data = systemReports;
          filename = 'reportes_export.json';
          break;
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a') as HTMLAnchorElement;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a as Node);
      a.click();
      document.body.removeChild(a as Node);
      URL.revokeObjectURL(url);

      toast({
        title: "xito",
        description: `Datos exportados como ${filename}`,
      });
    } catch (error) {
      logger.error('Error exporting data:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive"
      });
    }
  };

  const resolveReport = async (reportId: string) => {
    setSystemReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, resolved: true }
          : report
      )
    );
    
    toast({
      title: "xito",
      description: "Reporte marcado como resuelto",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-7xl mx-auto gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Volver
              </Button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                Dashboard Administrativo v3.2
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => loadDashboardData()}
                disabled={refreshing}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm px-3 py-1.5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Total Usuarios</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-green-400 text-xs">+{stats.newUsersToday} hoy</p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Usuarios Activos</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.activeUsers}</p>
                    <p className="text-blue-400 text-xs">ltima semana</p>
                  </div>
                  <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Total Matches</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalMatches}</p>
                    <p className="text-pink-400 text-xs">+{stats.matchesToday} hoy</p>
                  </div>
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Mensajes</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalMessages}</p>
                    <p className="text-blue-400 text-xs">Total enviados</p>
                  </div>
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Solicitudes Carrera</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.careerApplications}</p>
                    <p className="text-orange-400 text-xs">Pendientes revisin</p>
                  </div>
                  <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm">Solicitudes Moderador</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.moderatorRequests}</p>
                    <p className="text-purple-400 text-xs">En evaluacin</p>
                  </div>
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-white data-[state=active]:bg-white/20">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reportes</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="text-white data-[state=active]:bg-white/20">
                <Activity className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estadsticas Generales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Reportes Pendientes</span>
                      <Badge className="bg-red-500 text-white">{stats.reportsCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Moderadores Activos</span>
                      <Badge className="bg-green-500 text-white">{stats.moderatorsCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Tasa de Conversin</span>
                      <Badge className="bg-blue-500">
                        {stats.totalUsers > 0 ? ((stats.totalMatches / stats.totalUsers) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Exportar Datos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => exportData('users')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Exportar Usuarios
                    </Button>
                    <Button
                      onClick={() => exportData('matches')}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Exportar Matches
                    </Button>
                    <Button
                      onClick={() => exportData('reports')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Exportar Reportes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Actividad de Usuarios Recientes
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">Hoy</SelectItem>
                          <SelectItem value="7d">7 das</SelectItem>
                          <SelectItem value="30d">30 das</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userActivity.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <div>
                            <p className="text-white font-medium">{user.full_name || user.email}</p>
                            <p className="text-white/60 text-sm">
                              ltimo acceso: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}
                            </p>
                          </div>
                        </div>
                        <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Reportes del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemReports.filter(report => !report.resolved).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`} />
                          <div>
                            <p className="text-white font-medium">{report.message}</p>
                            <p className="text-white/60 text-sm">
                              {formatDate(report.created_at)}  {report.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Button
                            onClick={() => resolveReport(report.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Estado del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Base de Datos</span>
                      <Badge className="bg-green-500">Operativo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">API</span>
                      <Badge className="bg-green-500">Operativo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Notificaciones</span>
                      <Badge className="bg-green-500">Operativo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Almacenamiento</span>
                      <Badge className="bg-yellow-500">Advertencia</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Acciones Rpidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => navigate('/admin/moderators')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Gestionar Moderadores
                    </Button>
                    <Button
                      onClick={() => navigate('/admin/career-applications')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Solicitudes de Carrera
                    </Button>
                    <Button
                      onClick={() => loadDashboardData()}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar Datos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
