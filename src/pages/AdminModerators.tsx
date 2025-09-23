import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Shield, Eye, Ban, CheckCircle, XCircle, Mail, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { MODERATOR_STATUS, type ModeratorStatus } from "@/lib/roles";

interface Moderator {
  id: string;
  user_id?: string;
  email: string;
  full_name?: string;
  status: ModeratorStatus;
  created_at: string;
  activated_at?: string;
  reports_handled: number;
  suspensions_applied: number;
  last_activity?: string;
}

interface ModeratorRequest {
  id: string;
  full_name: string;
  email: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const AdminModerators = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [requests, setRequests] = useState<ModeratorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("moderators");
  
  // Formulario para crear moderador
  const [newModeratorEmail, setNewModeratorEmail] = useState("");
  const [newModeratorName, setNewModeratorName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Modal de detalles
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ModeratorRequest | null>(null);

  const statusColors = {
    pending: 'bg-yellow-500',
    active: 'bg-green-500',
    suspended: 'bg-red-500',
    inactive: 'bg-gray-500'
  };

  const statusLabels = {
    pending: 'Pendiente',
    active: 'Activo',
    suspended: 'Suspendido',
    inactive: 'Inactivo'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchModerators(), fetchRequests()]);
    } catch (error) {
      logger.error('❌ Error al cargar datos:', { error });
    } finally {
      setLoading(false);
    }
  };

  const fetchModerators = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('moderators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModerators(data || []);
      logger.info('✅ Moderadores cargados:', { count: data?.length || 0 });
    } catch (error: any) {
      logger.error('❌ Error al cargar moderadores:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error al cargar moderadores",
        description: error.message
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('moderator_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      logger.info('✅ Solicitudes cargadas:', { count: data?.length || 0 });
    } catch (error: any) {
      logger.error('❌ Error al cargar solicitudes:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error al cargar solicitudes",
        description: error.message
      });
    }
  };

  const createModerator = async () => {
    if (!newModeratorEmail || !newModeratorName) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa email y nombre"
      });
      return;
    }

    try {
      setIsCreating(true);
      logger.info('👑 Creando nuevo moderador:', { email: newModeratorEmail, name: newModeratorName });

      // Generar token de activación
      const activationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      const { data, error } = await (supabase as any)
        .from('moderators')
        .insert([{
          email: newModeratorEmail.trim().toLowerCase(),
          full_name: newModeratorName.trim(),
          status: 'pending',
          activation_token: activationToken,
          activation_expires_at: expiresAt.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Moderador creado exitosamente",
        description: `Se ha enviado un enlace de activación a ${newModeratorEmail}`,
        duration: 5000
      });

      // Limpiar formulario
      setNewModeratorEmail("");
      setNewModeratorName("");
      
      // Recargar lista
      await fetchModerators();
      
      logger.info('✅ Moderador creado exitosamente:', { id: data[0].id });

    } catch (error: any) {
      logger.error('❌ Error al crear moderador:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error al crear moderador",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateModeratorStatus = async (moderatorId: string, newStatus: ModeratorStatus) => {
    try {
      logger.info('🔄 Actualizando status de moderador:', { moderatorId, newStatus });

      const { error } = await (supabase as any)
        .from('moderators')
        .update({ status: newStatus })
        .eq('id', moderatorId);

      if (error) throw error;

      // Actualizar estado local
      setModerators(prev => 
        prev.map(mod => 
          mod.id === moderatorId ? { ...mod, status: newStatus } : mod
        )
      );

      toast({
        title: "Status actualizado",
        description: `Moderador marcado como ${statusLabels[newStatus]}`
      });

      logger.info('✅ Status actualizado exitosamente');

    } catch (error: any) {
      logger.error('❌ Error al actualizar status:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message
      });
    }
  };

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      logger.info('📋 Procesando solicitud:', { requestId, action, reason });

      const { error } = await (supabase as any)
        .from('moderator_requests')
        .update({
          status: action,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', requestId);

      if (error) throw error;

      // Si se aprueba, crear el moderador
      if (action === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const activationToken = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          await (supabase as any)
            .from('moderators')
            .insert([{
              email: request.email,
              full_name: request.full_name,
              status: 'pending',
              activation_token: activationToken,
              activation_expires_at: expiresAt.toISOString(),
              created_by: (await supabase.auth.getUser()).data.user?.id
            }]);
        }
      }

      toast({
        title: `Solicitud ${action === 'approved' ? 'aprobada' : 'rechazada'}`,
        description: action === 'approved' 
          ? "Se ha creado el moderador y enviado enlace de activación"
          : "La solicitud ha sido rechazada"
      });

      // Recargar datos
      await fetchData();
      setSelectedRequest(null);

      logger.info('✅ Solicitud procesada exitosamente');

    } catch (error: any) {
      logger.error('❌ Error al procesar solicitud:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error al procesar solicitud",
        description: error.message
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
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
        <div className="text-white text-xl">Cargando sistema de moderadores...</div>
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
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Admin
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Gestión de Moderadores 🎭
            </h1>
            <div className="flex items-center gap-2 text-white">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {moderators.length} Moderadores
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {requests.filter(r => r.status === 'pending').length} Solicitudes
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="moderators" className="data-[state=active]:bg-white/20">
                Moderadores Activos
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-white/20">
                Solicitudes Pendientes
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-white/20">
                Crear Moderador
              </TabsTrigger>
            </TabsList>

            {/* Tab: Moderadores Activos */}
            <TabsContent value="moderators" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Moderadores del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {moderators.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <p className="text-white/80">No hay moderadores registrados</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {moderators.map((moderator) => (
                        <Card key={moderator.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-white">
                                    {moderator.full_name || 'Sin nombre'}
                                  </h3>
                                  <Badge className={`${statusColors[moderator.status]} text-white`}>
                                    {statusLabels[moderator.status]}
                                  </Badge>
                                </div>
                                <div className="grid md:grid-cols-2 gap-2 text-white/80 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{moderator.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Creado: {formatDate(moderator.created_at)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    <span>Reportes: {moderator.reports_handled}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Ban className="h-4 w-4" />
                                    <span>Suspensiones: {moderator.suspensions_applied}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedModerator(moderator)}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {moderator.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateModeratorStatus(moderator.id, 'suspended')}
                                    className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                                {moderator.status === 'suspended' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateModeratorStatus(moderator.id, 'active')}
                                    className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Solicitudes Pendientes */}
            <TabsContent value="requests" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Solicitudes de Moderador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <p className="text-white/80">No hay solicitudes pendientes</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {requests.filter(r => r.status === 'pending').map((request) => (
                        <Card key={request.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">{request.full_name}</h3>
                                <div className="text-white/80 text-sm space-y-1">
                                  <p><strong>Email:</strong> {request.email}</p>
                                  <p><strong>Fecha:</strong> {formatDate(request.created_at)}</p>
                                  <p><strong>Motivación:</strong> {request.motivation.substring(0, 100)}...</p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRequest(request)}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRequest(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRequest(request)}
                                  className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                                >
                                  <XCircle className="h-4 w-4" />
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
            </TabsContent>

            {/* Tab: Crear Moderador */}
            <TabsContent value="create" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Crear Nuevo Moderador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Email del Moderador *</Label>
                    <Input
                      type="email"
                      value={newModeratorEmail}
                      onChange={(e) => setNewModeratorEmail(e.target.value)}
                      placeholder="moderador@ejemplo.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Nombre Completo *</Label>
                    <Input
                      value={newModeratorName}
                      onChange={(e) => setNewModeratorName(e.target.value)}
                      placeholder="Nombre del moderador"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-white/80 text-sm">
                      <strong>Nota:</strong> Se enviará un enlace de activación al email especificado. 
                      El moderador tendrá 24 horas para activar su cuenta y definir su contraseña.
                    </p>
                  </div>
                  <Button
                    onClick={createModerator}
                    disabled={isCreating || !newModeratorEmail || !newModeratorName}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3"
                  >
                    {isCreating ? (
                      <>Creando moderador...</>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Crear Moderador
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminModerators;
