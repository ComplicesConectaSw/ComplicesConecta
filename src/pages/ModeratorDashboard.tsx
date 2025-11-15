import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminNav from '@/components/AdminNav';
import { logger } from '@/lib/logger';
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
  User,
  Fingerprint,
  Globe
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Modal';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/useAuth';
import { ReportType, ReportStatus, ModerationAction } from '@/lib/roles';
import { createPermanentBan, getPermanentBans, liftPermanentBan, type PermanentBanData } from '@/services/permanentBan';
import { Database } from '@/types/supabase-generated';

// Tipos helper basados en Database
type ReportRow = Database['public']['Tables']['reports']['Row'];
type ModerationLogRow = Database['public']['Tables']['moderation_logs']['Row'];
type UserSuspensionRow = Database['public']['Tables']['user_suspensions']['Row'];
type PermanentBanRow = Database['public']['Tables']['permanent_bans']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Tipos helper para relaciones de Supabase (usados en mapeo)
type _ModerationLogWithRelations = ModerationLogRow & {
  moderator?: ProfileRow;
  target_user?: ProfileRow;
};

type _UserSuspensionWithRelations = UserSuspensionRow & {
  user?: ProfileRow;
  suspended_by_user?: ProfileRow;
};

interface Report extends ReportRow {
  reporter_email?: string;
  reported_user_email?: string;
  report_type?: ReportType;
}

interface ModerationLog extends Omit<ModerationLogRow, 'action_type'> {
  action: ModerationAction;
  moderator_email?: string;
  target_user_email?: string;
  moderator?: ProfileRow;
  target_user?: ProfileRow;
}

interface UserSuspension extends Omit<UserSuspensionRow, 'suspension_type' | 'ends_at' | 'moderator_id'> {
  suspended_by: string;
  suspended_until?: string;
  is_permanent: boolean;
  status: 'active' | 'lifted';
  user_email?: string;
  suspended_by_email?: string;
  user?: ProfileRow;
  suspended_by_user?: ProfileRow;
}

const ModeratorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [suspensions, setSuspensions] = useState<UserSuspension[]>([]);
  const [permanentBans, setPermanentBans] = useState<(PermanentBanRow & { user?: { name: string }; banned_by_user?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [banSeverity, setBanSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [userToBan, setUserToBan] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReports(),
        fetchModerationLogs(),
        fetchSuspensions(),
        fetchPermanentBans()
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

  const fetchPermanentBans = async () => {
    try {
      const bans = await getPermanentBans();
      setPermanentBans(bans);
    } catch (error: any) {
      logger.error('Error obteniendo baneos permanentes:', { error: error?.message || String(error) });
    }
  };

  const fetchReports = async () => {
    if (!supabase) {
      console.error('Supabase no est disponible');
      return;
    }
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    // Obtener emails de reporter y reported_user desde profiles
    const reportsWithEmails: Report[] = (data || []).map((report: ReportRow) => ({
      ...report,
      reporter_email: report.reporter_user_id || undefined,
      reported_user_email: report.reported_user_id || undefined,
      report_type: (report.content_type || report.reason) as ReportType,
    }));

    setReports(reportsWithEmails);
  };

  const fetchModerationLogs = async () => {
    if (!supabase) {
      logger.error('Supabase no est disponible');
      return;
    }
    
    const { data, error } = await supabase
      .from('moderation_logs')
      .select(`
        *,
        moderator:profiles!moderation_logs_moderator_id_fkey(name),
        target_user:profiles!moderation_logs_target_user_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching moderation logs:', error);
      return;
    }

    const logsWithEmails: ModerationLog[] = (data || []).map((log: any) => {
      const logRow = log as ModerationLogRow;
      return {
        ...logRow,
        action: (logRow.action_type || 'unknown') as ModerationAction,
        moderator_email: (log as any).moderator?.name || logRow.moderator_id || 'Moderador',
        target_user_email: (log as any).target_user?.name || logRow.target_user_id || 'Usuario',
        moderator: (log as any).moderator,
        target_user: (log as any).target_user,
      };
    });

    setModerationLogs(logsWithEmails);
  };

  const fetchSuspensions = async () => {
    if (!supabase) {
      console.error('Supabase no est disponible');
      return;
    }
    
    const { data, error } = await supabase
      .from('user_suspensions')
      .select(`
        *,
        user:profiles!user_suspensions_user_id_fkey(name),
        suspended_by_user:profiles!user_suspensions_moderator_id_fkey(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suspensions:', error);
      return;
    }

    const suspensionsWithEmails: UserSuspension[] = (data || []).map((suspension: any) => {
      const suspensionRow = suspension as UserSuspensionRow;
      return {
        ...suspensionRow,
        suspended_by: suspensionRow.moderator_id,
        suspended_until: suspensionRow.ends_at || undefined,
        is_permanent: suspensionRow.suspension_type === 'permanent',
        status: suspensionRow.is_active ? 'active' : 'lifted',
        user_email: suspension.user?.name || suspensionRow.user_id || 'Usuario',
        suspended_by_email: suspension.suspended_by_user?.name || suspensionRow.moderator_id || 'Sistema',
        user: suspension.user,
        suspended_by_user: suspension.suspended_by_user,
      };
    });

    setSuspensions(suspensionsWithEmails);
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    if (!actionReason.trim()) {
      toast({
        title: "Error",
        description: "Por favor proporciona una razn para esta accin",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!supabase) {
        logger.error('Supabase no est disponible');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Actualizar el estado del reporte
      const newStatus = action === 'approve' ? 'resolved' : 'dismissed';
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Registrar la accin en los logs
      const moderationAction = action === 'approve' ? 'report_approved' : 'report_dismissed';
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert([{
          moderator_id: session.user.id,
          action_type: moderationAction,
          target_type: 'report',
          target_id: reportId,
          target_user_id: report.reported_user_id,
          description: actionReason,
          reason: actionReason,
          created_at: new Date().toISOString()
        }]);

      if (logError) throw logError;

      // Si se aprueba el reporte, crear suspensin
      if (action === 'approve') {
        const suspendedUntil = suspensionDays > 0 
          ? new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { error: suspensionError } = await supabase
          .from('user_suspensions')
          .insert([{
            user_id: report.reported_user_id,
            moderator_id: session.user.id,
            reason: actionReason,
            ends_at: suspendedUntil,
            suspension_type: suspensionDays === 0 ? 'permanent' : 'temporary',
            duration_days: suspensionDays > 0 ? suspensionDays : null,
            is_active: true,
            created_at: new Date().toISOString()
          }]);

        if (suspensionError) throw suspensionError;
      }

      toast({
        title: "xito",
        description: `Reporte ${action === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`
      });
      setActionReason('');
      setSelectedReport(null);
      fetchData();
    } catch (error) {
      console.error('Error handling report action:', error);
      toast({
        title: "Error",
        description: "Error al procesar la accin",
        variant: "destructive"
      });
    }
  };

  const handlePermanentBan = async (userId: string, reason: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase no est disponible');
      }

      // Obtener WorldID nullifier hash si est disponible
      const { data: worldIdData } = await supabase
        .from('worldid_verifications')
        .select('nullifier_hash')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      const banData: PermanentBanData = {
        userId,
        banReason: reason,
        severity: banSeverity,
        worldIdNullifierHash: worldIdData?.nullifier_hash,
        evidence: {
          reported_by: selectedReport?.reporter_user_id,
          report_id: selectedReport?.id,
        },
      };

      await createPermanentBan(banData, user.id);

      toast({
        title: "Baneo permanente creado",
        description: "El usuario ha sido baneado permanentemente con huella digital",
      });

      setShowBanDialog(false);
      setUserToBan(null);
      setActionReason('');
      fetchData();
    } catch (error: any) {
      logger.error('Error creando baneo permanente:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el baneo permanente",
        variant: "destructive"
      });
    }
  };

  const liftSuspension = async (suspensionId: string) => {
    try {
      if (!supabase) {
        logger.error('Supabase no est disponible');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('user_suspensions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', suspensionId);

      if (error) throw error;

      // Registrar la accin en los logs
      const suspension = suspensions.find(s => s.id === suspensionId);
      if (suspension) {
        await supabase
          .from('moderation_logs')
          .insert([{
            moderator_id: session.user.id,
            action_type: 'suspension_lifted',
            target_type: 'user',
            target_id: suspension.user_id,
            target_user_id: suspension.user_id,
            description: 'Suspensin levantada por moderador',
            reason: 'Suspensin levantada por moderador',
            created_at: new Date().toISOString()
          }]);
      }

      toast({
        title: "xito",
        description: "Suspensin levantada exitosamente"
      });
      fetchData();
    } catch (error) {
      console.error('Error lifting suspension:', error);
      toast({
        title: "Error",
        description: "Error al levantar la suspensin",
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
      terms_violation: 'Violacin de trminos'
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
      under_review: 'En revisin',
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
          <p className="text-white">Cargando panel de moderacin...</p>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending');
  const activeSuspensions = suspensions.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-hero-gradient">
      <AdminNav userRole="moderator" />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Panel de Moderacin
          </h1>
          <p className="text-white/80">
            Gestiona reportes de usuarios y mantn la comunidad segura
          </p>
        </div>

        {/* Estadsticas rpidas */}
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
            <TabsTrigger value="permanent-bans" className="data-[state=active]:bg-white/20">
              <Fingerprint className="w-4 h-4 mr-2" />
              Baneos Permanentes ({permanentBans.length})
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
                  <p className="text-white/60">Excelente trabajo manteniendo la comunidad segura!</p>
                </CardContent>
              </Card>
            ) : (
              pendingReports.map((report) => (
                <Card key={report.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        {getReportTypeLabel(report.report_type || 'spam')}
                      </CardTitle>
                      {getStatusBadge((report.status || 'pending') as ReportStatus)}
                    </div>
                    <CardDescription className="text-white/70">
                      Reportado el {report.created_at ? new Date(report.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
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
                      <p className="text-white/80 text-sm mb-1">Razn:</p>
                      <p className="text-white">{report.reason}</p>
                    </div>
                    
                    {report.description && (
                      <div>
                        <p className="text-white/80 text-sm mb-1">Descripcin:</p>
                        <p className="text-white">{report.description}</p>
                      </div>
                    )}

                    {selectedReport?.id === report.id ? (
                      <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                        <div>
                          <label className="text-white text-sm mb-2 block">
                            Razn de la decisin:
                          </label>
                          <textarea
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                            placeholder="Explica la razn de tu decisin..."
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="text-white text-sm mb-2 block">
                            Das de suspensin (0 = permanente):
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

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => handleReportAction(report.id, 'approve')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Aprobar y Suspender
                          </Button>
                          <Button
                            onClick={() => {
                              setUserToBan(report.reported_user_id);
                              setSelectedReport(report);
                              setShowBanDialog(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Fingerprint className="h-4 w-4 mr-2" />
                            Baneo Permanente
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
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionReason(report.reason);
                          }}
                          variant="outline"
                          className="bg-white/20 hover:bg-white/30 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar Reporte
                        </Button>
                        <Button
                          onClick={() => {
                            setUserToBan(report.reported_user_id);
                            setSelectedReport(report);
                            setShowBanDialog(true);
                          }}
                          variant="destructive"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Fingerprint className="h-4 w-4 mr-2" />
                          Baneo Permanente
                        </Button>
                      </div>
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
                  <p className="text-white/60">Todos los usuarios estn en buen estado</p>
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
                      Suspendido el {suspension.created_at ? new Date(suspension.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
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
                      <p className="text-white/80 text-sm mb-1">Razn:</p>
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
                      Levantar Suspensin
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="permanent-bans" className="space-y-4">
            {permanentBans.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <Fingerprint className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-white text-lg">No hay baneos permanentes</p>
                  <p className="text-white/60">Los baneos permanentes con huella digital aparecern aqu</p>
                </CardContent>
              </Card>
            ) : (
              permanentBans.map((ban) => (
                <Card key={ban.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-purple-400" />
                      Baneo Permanente
                      <Badge className={`ml-auto ${
                        ban.severity === 'critical' ? 'bg-red-600' :
                        ban.severity === 'high' ? 'bg-orange-600' :
                        ban.severity === 'medium' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {ban.severity}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Baneado el {ban.banned_at ? new Date(ban.banned_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Usuario:</p>
                        <p className="text-white font-medium">{ban.user?.name || ban.user_id || 'Usuario'}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Baneado por:</p>
                        <p className="text-white font-medium">{ban.banned_by_user?.name || 'Admin'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-white/80 text-sm mb-1">Razn:</p>
                      <p className="text-white">{ban.ban_reason}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {ban.worldid_nullifier_hash && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-400" />
                          <span className="text-white/70 text-sm">WorldID vinculado</span>
                        </div>
                      )}
                      {ban.canvas_hash && (
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-purple-400" />
                          <span className="text-white/70 text-sm">Canvas fingerprint</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={async () => {
                        if (confirm('Ests seguro de levantar este baneo permanente?')) {
                          try {
                            await liftPermanentBan(ban.id, user?.id || '', 'Levantado por moderador');
                            toast({
                              title: "Baneo levantado",
                              description: "El baneo permanente ha sido levantado",
                            });
                            fetchData();
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.message || "No se pudo levantar el baneo",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Levantar Baneo
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
                  <p className="text-white text-lg">No hay historial de moderacin</p>
                  <p className="text-white/60">Las acciones de moderacin aparecern aqu</p>
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
                          <p className="text-white/60 text-sm">Razn: {log.description || 'Sin razn especificada'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">
                          {log.created_at ? new Date(log.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                        </p>
                        <p className="text-white/60 text-xs">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString('es-ES') : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog para baneo permanente */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-purple-400" />
                Baneo Permanente con Huella Digital
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Este baneo utilizar canvas fingerprint + WorldID para prevenir que el usuario vuelva a registrarse
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Razn del baneo permanente:
                </label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="Explica la razn del baneo permanente..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-white text-sm mb-2 block">
                  Severidad:
                </label>
                <Select value={banSeverity} onValueChange={(value: any) => setBanSeverity(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="low" className="text-white">Baja</SelectItem>
                    <SelectItem value="medium" className="text-white">Media</SelectItem>
                    <SelectItem value="high" className="text-white">Alta</SelectItem>
                    <SelectItem value="critical" className="text-white">Crtica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  ?? Este baneo es permanente y utilizar huella digital (canvas + WorldID). 
                  El usuario no podr crear nuevas cuentas con el mismo dispositivo o WorldID.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!userToBan || !actionReason.trim()) {
                      toast({
                        title: "Error",
                        description: "Completa todos los campos",
                        variant: "destructive"
                      });
                      return;
                    }
                    await handlePermanentBan(userToBan, actionReason);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Confirmar Baneo
                </Button>
                <Button
                  onClick={() => {
                    setShowBanDialog(false);
                    setUserToBan(null);
                    setActionReason('');
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
