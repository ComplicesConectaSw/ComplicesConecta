import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, // For photo access
  GalleryHorizontal, // For gallery access
  MessageSquare, // For chat access
  MailQuestion,
  Send
} from "lucide-react";
import NavigationEnhanced from "@/components/NavigationEnhanced";
import { useFeatures } from "@/hooks/useFeatures";
import { invitationService, type Invitation } from "@/lib/invitations";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';

const Requests = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { features } = useFeatures();
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Migración localStorage → usePersistedState
  const [_demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [_demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  const [_currentUserId, _setCurrentUserId] = useState<string | null>(null);

  const loadDemoInvitations = () => {
    // Solicitudes demo recibidas
    const demoReceived: Invitation[] = [
      {
        id: 'demo-inv-1',
        from_profile: 'Anabella & Julio',
        to_profile: 'Sofía',
        type: 'chat',
        status: 'pending',
        message: '¡Hola! Nos encantaría conocerte mejor. ¿Te gustaría chatear con nosotros?',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        decided_at: null
      },
      {
        id: 'demo-inv-2',
        from_profile: 'Carmen & Roberto',
        to_profile: 'Sofía',
        type: 'gallery',
        status: 'pending',
        message: 'Hola guapa, nos gustó mucho tu perfil. ¿Nos permites ver tu galería privada?',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
        decided_at: null
      },
      {
        id: 'demo-inv-3',
        from_profile: 'Raúl',
        to_profile: 'Sofía',
        type: 'profile',
        status: 'accepted',
        message: '¿Qué tal si nos conocemos mejor?',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        decided_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Solicitudes demo enviadas
    const demoSent: Invitation[] = [
      {
        id: 'demo-sent-1',
        from_profile: 'Sofía',
        to_profile: 'Miguel & Laura',
        type: 'chat',
        status: 'accepted',
        message: 'Hola, me encantó su perfil. ¿Les gustaría platicar?',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
        decided_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-sent-2',
        from_profile: 'Sofía',
        to_profile: 'Carlos',
        type: 'profile',
        status: 'pending',
        message: 'Hola, me pareces muy interesante. ¿Te gustaría conocernos?',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
        decided_at: null
      }
    ];
    
    setReceivedInvitations(demoReceived);
    setSentInvitations(demoSent);
    logger.info('🎭 Solicitudes demo cargadas:', { received: demoReceived.length, sent: demoSent.length });
  };
  
  const loadInvitations = useCallback(async () => {
    if (!_currentUserId) return;
    
    // Si es modo demo, no hacer llamadas reales
    if (_demoAuth === 'true') {
      loadDemoInvitations();
      return;
    }
    
    const { received, sent } = await invitationService.getInvitations(_currentUserId);
    setReceivedInvitations(received);
    setSentInvitations(sent);
  }, [_currentUserId, _demoAuth]);

  useEffect(() => {
    if (_currentUserId) {
      loadInvitations();
    }
  }, [_currentUserId, loadInvitations, navigate, _demoAuth, _demoUser]);

  useEffect(() => {
    // Detectar modo demo
    const isDemoMode = _demoAuth === 'true' && _demoUser;
    
    if (isDemoMode) {
      // Modo demo - usar datos mock
      try {
        const parsedDemoUser = typeof _demoUser === 'string' ? JSON.parse(_demoUser) : _demoUser;
        _setCurrentUserId(parsedDemoUser.id || 'demo-user-1');
        loadDemoInvitations();
      } catch (error) {
        console.error('Error parsing demo user:', error);
        _setCurrentUserId('demo-user-1');
        loadDemoInvitations();
      }
      return;
    }
    
    
    // Verificar autenticación real - solo redirigir si realmente no está autenticado
    try {
      if (!isAuthenticated) {
        logger.info('❌ Usuario no autenticado en Requests, redirigiendo a /auth');
        navigate('/auth');
        return;
      }
    } catch (error) {
      logger.error('❌ Error verificando autenticación en Requests:', { error });
      // No redirigir automáticamente en caso de error, permitir que el usuario permanezca
      toast({
        title: "Advertencia",
        description: "Hubo un problema verificando la autenticación. Si persiste, intenta cerrar y abrir sesión.",
        variant: "destructive"
      });
    }
    
    // Usuario real autenticado
    const userId = user?.id;
    if (userId) {
      _setCurrentUserId(userId);
      logger.info('✅ Usuario real autenticado en Requests con ID:', { userId });
    } else {
      logger.info('❌ No se pudo obtener userId, redirigiendo a /auth');
      navigate('/auth');
    }
  }, [_demoAuth, _demoUser, user]);

  const handleInvitationAction = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      // Si es modo demo, simular la acción
      if (_demoAuth === 'true') {
        // Actualizar el estado local para demo
        setReceivedInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: action === 'accept' ? 'accepted' : 'declined' as const }
              : inv
          )
        );
        
        toast({
          title: `Invitación ${action === 'accept' ? 'aceptada' : 'rechazada'}`,
          description: `La invitación ha sido procesada correctamente (modo demo).`,
        });
        
        logger.info('🎭 Acción demo en invitación:', { invitationId, action });
        return;
      }
      
      // Modo real
      await invitationService.respondInvitation(invitationId, action);
      toast({
        title: `Invitación ${action === 'accept' ? 'aceptada' : 'rechazada'}`,
        description: `La invitación ha sido procesada correctamente.`,
      });
      loadInvitations(); // Refresh the list
    } catch {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getInvitationTypeIcon = (type: Invitation['type']) => {
    switch (type) {
      case 'gallery':
        return <GalleryHorizontal className="h-4 w-4 mr-2" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'profile':
        return <UserPlus className="h-4 w-4 mr-2" />;
      default:
        return <MailQuestion className="h-4 w-4 mr-2" />;
    }
  };

  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="text-yellow-400 border border-yellow-400 bg-transparent"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'accepted':
        return <Badge className="text-green-400 border border-green-400 bg-transparent"><UserCheck className="h-3 w-3 mr-1" />Aceptada</Badge>;
      case 'declined':
        return <Badge className="text-red-400 border border-red-400 bg-transparent"><UserX className="h-3 w-3 mr-1" />Rechazada</Badge>;
      case 'revoked':
          return <Badge className="text-white border border-white/40 bg-transparent"><UserX className="h-3 w-3 mr-1" />Revocada</Badge>;
    }
  };

  const _pendingReceivedCount = receivedInvitations.filter(inv => inv.status === 'pending').length;
  const _acceptedCount = [...receivedInvitations, ...sentInvitations].filter(inv => inv.status === 'accepted').length;

  if (!features.requests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <Card className="p-8 text-center bg-card/80 backdrop-blur-sm">
          <UserX className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Función no disponible</h2>
          <p className="text-muted-foreground">Las solicitudes de conexión no están habilitadas en esta versión.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header removido para usuarios demo - solo NavigationLegacy */}
      {_demoAuth !== 'true' && <Header />}
      
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Invitaciones</h1>
            <p className="text-white/80 text-lg">Gestiona tus invitaciones recibidas y enviadas</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-red-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm rounded-lg mb-6">
                <TabsTrigger 
                  value="received" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white flex items-center gap-2"
                >
                  <MailQuestion className="h-4 w-4" />
                  Recibidas
                  {receivedInvitations.length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {receivedInvitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="sent" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Enviadas
                  {sentInvitations.length > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      {sentInvitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="received" className="mt-6">
                <div className="space-y-4">
                  {receivedInvitations.length === 0 ? (
                    <Card className="p-8 text-center bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-red-900/30 backdrop-blur-sm border-white/10">
                      <UserPlus className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No hay invitaciones recibidas</h3>
                      <p className="text-white/70">Cuando alguien te envíe una invitación, aparecerá aquí.</p>
                    </Card>
                  ) : (
                    receivedInvitations.map((inv) => (
                      <Card key={inv.id} className="p-4 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-red-900/30 backdrop-blur-sm border-white/10 flex flex-col sm:flex-row items-start gap-4 card-accessible">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-sm text-white/80">
                              {getInvitationTypeIcon(inv.type)}
                              <span>Invitación de <strong>{inv.from_profile}</strong></span>
                            </div>
                            {getStatusBadge(inv.status)}
                          </div>
                          {inv.message && <p className="text-sm text-white/70 bg-white/10 p-3 rounded-md mb-3">"{inv.message}"</p>}
                          <p className="text-xs text-white/50">Recibido: {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'Fecha no disponible'}</p>
                        </div>
                        {inv.status === 'pending' && (
                          <div className="flex gap-2 self-stretch sm:self-center">
                            <Button onClick={() => handleInvitationAction(inv.id, 'accept')} className="bg-green-500 hover:bg-green-600 px-3 py-1 text-sm">
                              <UserCheck className="h-4 w-4 mr-1" /> Aceptar
                            </Button>
                            <Button onClick={() => handleInvitationAction(inv.id, 'decline')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">
                              <UserX className="h-4 w-4 mr-1" /> Rechazar
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sent" className="mt-6">
                <div className="space-y-4">
                  {sentInvitations.length === 0 ? (
                    <Card className="p-8 text-center bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-red-900/30 backdrop-blur-sm border-white/10">
                      <Send className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No has enviado invitaciones</h3>
                      <p className="text-white/70">Explora perfiles y envía invitaciones para conectar.</p>
                    </Card>
                  ) : (
                    sentInvitations.map((inv) => (
                      <Card key={inv.id} className="p-4 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-red-900/30 backdrop-blur-sm border-white/10 card-accessible">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center text-sm text-white/80">
                            {getInvitationTypeIcon(inv.type)}
                            <span>Invitación para <strong>{inv.to_profile}</strong></span>
                          </div>
                          {getStatusBadge(inv.status)}
                        </div>
                        {inv.message && <p className="text-sm text-white/70 bg-white/10 p-3 rounded-md my-3">"{inv.message}"</p>}
                        <p className="text-xs text-white/50">Enviado: {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'Fecha no disponible'}</p>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <NavigationEnhanced />
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Requests;
