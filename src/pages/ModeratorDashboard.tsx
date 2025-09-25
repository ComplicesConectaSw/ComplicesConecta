import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Ban,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole, ModerationAction, ReportType, ReportStatus } from '@/lib/roles';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: ReportType;
  reason: string;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  reporter_email?: string;
  reported_user_email?: string;
}

interface ModerationLog {
  id: string;
  moderator_id: string;
  action: ModerationAction;
  target_user_id: string;
  reason: string;
  created_at: string;
  moderator_email?: string;
  target_user_email?: string;
}

interface UserSuspension {
  id: string;
  user_id: string;
  suspended_by: string;
  reason: string;
  suspended_until?: string;
  is_permanent: boolean;
  status: 'active' | 'lifted';
  created_at: string;
  user_email?: string;
  suspended_by_email?: string;
}

const ModeratorDashboard = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [suspensions, setSuspensions] = useState<UserSuspension[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReports(),
        fetchModerationLogs(),
        fetchSuspensions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select(`
        *,
        reporter:profiles!user_reports_reporter_id_fkey(email),
        reported_user:profiles!user_reports_reported_user_id_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    const reportsWithEmails = data?.map((report: any) => ({
      ...report,
      reporter_email: report.reporter?.email,
      reported_user_email: report.reported_user?.email
    })) || [];

    setReports(reportsWithEmails);
  };

  const fetchModerationLogs = async () => {
    const { data, error } = await (supabase as any)
      .from('moderation_logs')
      .select(`
        *,
        moderator:profiles!moderation_logs_moderator_id_fkey(email),
        target_user:profiles!moderation_logs_target_user_id_fkey(email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching moderation logs:', error);
      return;
    }

    const logsWithEmails = data?.map((log: any) => ({
      ...log,
      moderator_email: log.moderator?.email,
      target_user_email: log.target_user?.email
    })) || [];

    setModerationLogs(logsWithEmails);
  };

  const fetchSuspensions = async () => {
    const { data, error } = await (supabase as any)
      .from('user_suspensions')
      .select(`
        *,
        user:profiles!user_suspensions_user_id_fkey(email),
        suspended_by_user:profiles!user_suspensions_suspended_by_fkey(email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suspensions:', error);
      return;
    }

    const suspensionsWithEmails = data?.map((suspension: any) => ({
      ...suspension,
      user_email: suspension.user?.email,
      suspended_by_email: suspension.suspended_by_user?.email
    })) || [];

    setSuspensions(suspensionsWithEmails);
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    if (!actionReason.trim()) {
      toast({
        title: "Error",
        description: "Por favor proporciona una razón para esta acción",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Actualizar el estado del reporte
      const newStatus = action === 'approve' ? 'resolved' : 'dismissed';
      const { error: updateError } = await (supabase as any)
        .from('user_reports')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Registrar la acción en los logs
      const moderationAction = action === 'approve' ? 'report_approved' : 'report_dismissed';
      const { error: logError } = await (supabase as any)
        .from('moderation_logs')
        .insert([{
          moderator_id: session.user.id,
          action: moderationAction,
          target_user_id: report.reported_user_id,
          reason: actionReason,
          created_at: new Date().toISOString()
        }]);

      if (logError) throw logError;

      // Si se aprueba el reporte, crear suspensión
      if (action === 'approve') {
        const suspendedUntil = suspensionDays > 0 
          ? new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { error: suspensionError } = await (supabase as any)
          .from('user_suspensions')
          .insert([{
            user_id: report.reported_user_id,
            suspended_by: session.user.id,
            reason: actionReason,
            suspended_until: suspendedUntil,
            is_permanent: suspensionDays === 0,
            status: 'active',
            created_at: new Date().toISOString()
          }]);

        if (suspensionError) throw suspensionError;
      }

      toast({
        title: "Éxito",
        description: `Reporte ${action === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`
      });
      setActionReason('');
      setSelectedReport(null);
      fetchData();
    } catch (error) {
      console.error('Error handling report action:', error);
      toast({
        title: "Error",
        description: "Error al procesar la acción",
        variant: "destructive"
      });
    }
  };

  const liftSuspension = async (suspensionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await (supabase as any)
        .from('user_suspensions')
        .update({ 
          status: 'lifted',
          updated_at: new Date().toISOString()
        })
        .eq('id', suspensionId);

      if (error) throw error;

      // Registrar la acción en los logs
      const suspension = suspensions.find(s => s.id === suspensionId);
      if (suspension) {
        await (supabase as any)
          .from('moderation_logs')
          .insert([{
            moderator_id: session.user.id,
            action: 'suspension_lifted',
            target_user_id: suspension.user_id,
            reason: 'Suspensión levantada por moderador',
            created_at: new Date().toISOString()
          }]);
      }

      toast({
        title: "Éxito",
        description: "Suspensión levantada exitosamente"
      });
      fetchData();
    } catch (error) {
      console.error('Error lifting suspension:', error);
      toast({
        title: "Error",
        description: "Error al levantar la suspensión",
        variant: "destructive"
      });
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    const labels: Record<ReportType, string> = {
      inappropriate_content: 'Contenido inapropiado',
      harassment: 'Acoso',
      spam: 'Spam',
      fake_profile: 'Perfil falso',
      underage: 'Menor de edad',
      terms_violation: 'Violación de términos'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, 'secondary' | 'default' | 'destructive'> = {
      pending: 'secondary',
      under_review: 'default',
      resolved: 'default',
      dismissed: 'destructive'
    };

    const labels: Record<ReportStatus, string> = {
      pending: 'Pendiente',
      under_review: 'En revisión',
      resolved: 'Resuelto',
      dismissed: 'Desestimado'
    };

    return (
      <Badge className={`${variants[status] === 'destructive' ? 'bg-red-500 text-white' : variants[status] === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando panel de moderación...</p>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending');
  const activeSuspensions = suspensions.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-hero-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Panel de Moderación
          </h1>
          <p className="text-white/80">
            Gestiona reportes de usuarios y mantén la comunidad segura
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Reportes Pendientes</p>
                  <p className="text-2xl font-bold text-white">{pendingReports.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Suspensiones Activas</p>
                  <p className="text-2xl font-bold text-white">{activeSuspensions.length}</p>
                </div>
                <Ban className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Reportes</p>
                  <p className="text-2xl font-bold text-white">{reports.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Acciones Hoy</p>
                  <p className="text-2xl font-bold text-white">
                    {moderationLogs.filter(log => 
                      new Date(log.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="reports" className="data-[state=active]:bg-white/20">
              Reportes ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="suspensions" className="data-[state=active]:bg-white/20">
              Suspensiones ({activeSuspensions.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white/20">
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {pendingReports.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-white text-lg">No hay reportes pendientes</p>
                  <p className="text-white/60">¡Excelente trabajo manteniendo la comunidad segura!</p>
                </CardContent>
              </Card>
            ) : (
              pendingReports.map((report) => (
                <Card key={report.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        {getReportTypeLabel(report.report_type)}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription className="text-white/70">
                      Reportado el {new Date(report.created_at).toLocaleDateString('es-ES')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Usuario reportado:</p>
                        <p className="text-white font-medium">{report.reported_user_email || 'Email no disponible'}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Reportado por:</p>
                        <p className="text-white font-medium">{report.reporter_email || 'Email no disponible'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-white/80 text-sm mb-1">Razón:</p>
                      <p className="text-white">{report.reason}</p>
                    </div>
                    
                    {report.description && (
                      <div>
                        <p className="text-white/80 text-sm mb-1">Descripción:</p>
                        <p className="text-white">{report.description}</p>
                      </div>
                    )}

                    {selectedReport?.id === report.id ? (
                      <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                        <div>
                          <label className="text-white text-sm mb-2 block">
                            Razón de la decisión:
                          </label>
                          <textarea
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                            placeholder="Explica la razón de tu decisión..."
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="text-white text-sm mb-2 block">
                            Días de suspensión (0 = permanente):
                          </label>
                          <input
                            type="number"
                            value={suspensionDays}
                            onChange={(e) => setSuspensionDays(parseInt(e.target.value) || 0)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            min="0"
                            max="365"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReportAction(report.id, 'approve')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Aprobar y Suspender
                          </Button>
                          <Button
                            onClick={() => handleReportAction(report.id, 'reject')}
                            className="border-white/20 text-white hover:bg-white/10 border bg-transparent"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar Reporte
                          </Button>
                          <Button
                            onClick={() => setSelectedReport(null)}
                            className="text-white hover:bg-white/10 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedReport(report)}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Revisar Reporte
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="suspensions" className="space-y-4">
            {activeSuspensions.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-white text-lg">No hay suspensiones activas</p>
                  <p className="text-white/60">Todos los usuarios están en buen estado</p>
                </CardContent>
              </Card>
            ) : (
              activeSuspensions.map((suspension) => (
                <Card key={suspension.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-400" />
                      Usuario Suspendido
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Suspendido el {new Date(suspension.created_at).toLocaleDateString('es-ES')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Usuario:</p>
                        <p className="text-white font-medium">{suspension.user_email || 'Email no disponible'}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Suspendido por:</p>
                        <p className="text-white font-medium">{suspension.suspended_by_email || 'Email no disponible'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-white/80 text-sm mb-1">Razón:</p>
                      <p className="text-white">{suspension.reason}</p>
                    </div>
                    
                    <div>
                      <p className="text-white/80 text-sm mb-1">Tipo:</p>
                      <Badge className={suspension.is_permanent ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}>
                        {suspension.is_permanent ? 'Permanente' : 'Temporal'}
                      </Badge>
                    </div>

                    {!suspension.is_permanent && suspension.suspended_until && (
                      <div>
                        <p className="text-white/80 text-sm mb-1">Expira:</p>
                        <p className="text-white">
                          {new Date(suspension.suspended_until).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => liftSuspension(suspension.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Levantar Suspensión
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {moderationLogs.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg">No hay historial de moderación</p>
                  <p className="text-white/60">Las acciones de moderación aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              moderationLogs.map((log) => (
                <Card key={log.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">
                            {log.moderator_email || 'Moderador'} - {log.action.replace('_', ' ')}
                          </p>
                          <p className="text-white/60 text-sm">
                            Usuario: {log.target_user_email || 'Email no disponible'}
                          </p>
                          <p className="text-white/60 text-sm">Razón: {log.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">
                          {new Date(log.created_at).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-white/60 text-xs">
                          {new Date(log.created_at).toLocaleTimeString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
