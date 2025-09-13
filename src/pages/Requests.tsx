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
  Clock,
  Send,
  MailQuestion,
  GalleryHorizontal, // For gallery access
  MessageSquare // For chat access
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useFeatures } from "@/hooks/useFeatures";
import { invitationService, type Invitation } from "@/lib/invitations";
import { useToast } from "@/hooks/use-toast";

const Requests = () => {
  const { features } = useFeatures();
  const { toast } = useToast();
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const currentUserId = "1"; // Mock current user ID

  const loadInvitations = useCallback(async () => {
    const { received, sent } = await invitationService.getInvitations(currentUserId);
    setReceivedInvitations(received);
    setSentInvitations(sent);
  }, [currentUserId]);

  useEffect(() => {
    // Verificar autenticación demo
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth !== 'true' || !demoUser) {
      window.location.href = '/auth';
      return;
    }
    
    loadInvitations();
  }, [loadInvitations]);

  const handleInvitationAction = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      await invitationService.respondInvitation(invitationId, action);
      toast({
        title: `Invitación ${action === 'accept' ? 'aceptada' : 'rechazada'}`,
        description: `La invitación ha sido procesada correctamente.`,
      });
      loadInvitations(); // Refresh the list
    } catch (error) {
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
        return <Badge variant="outline" className="text-yellow-400 border-yellow-400"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-400 border-green-400"><UserCheck className="h-3 w-3 mr-1" />Aceptada</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-400 border-red-400"><UserX className="h-3 w-3 mr-1" />Rechazada</Badge>;
      case 'revoked':
          return <Badge variant="outline" className="text-white border-white/40"><UserX className="h-3 w-3 mr-1" />Revocada</Badge>;
    }
  };

  const pendingReceivedCount = receivedInvitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = [...receivedInvitations, ...sentInvitations].filter(inv => inv.status === 'accepted').length;

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
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Mis Solicitudes</h1>
              <p className="text-white/80">Gestiona tus invitaciones y solicitudes de conexión</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-white">{pendingReceivedCount}</p>
              </Card>
              
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">Conexiones Activas</span>
                </div>
                <p className="text-2xl font-bold text-white">{acceptedCount}</p>
              </Card>
              
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Send className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-white font-semibold">Enviadas</span>
                </div>
                <p className="text-2xl font-bold text-white">{sentInvitations.length}</p>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-sm">
                <TabsTrigger value="received" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                  Recibidas ({receivedInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                  Enviadas ({sentInvitations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="received" className="mt-6">
                <div className="space-y-4">
                  {receivedInvitations.length === 0 ? (
                    <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
                      <UserPlus className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No hay invitaciones recibidas</h3>
                      <p className="text-white/70">Cuando alguien te envíe una invitación, aparecerá aquí.</p>
                    </Card>
                  ) : (
                    receivedInvitations.map((inv) => (
                      <Card key={inv.id} className="p-4 bg-black/30 backdrop-blur-sm border-white/10 flex flex-col sm:flex-row items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-sm text-white/80">
                              {getInvitationTypeIcon(inv.type)}
                              <span>Invitación de <strong>{inv.from_profile}</strong></span>
                            </div>
                            {getStatusBadge(inv.status)}
                          </div>
                          {inv.message && <p className="text-sm text-white/70 bg-white/10 p-3 rounded-md mb-3">"{inv.message}"</p>}
                          <p className="text-xs text-white/50">Recibido: {new Date(inv.created_at).toLocaleString()}</p>
                        </div>
                        {inv.status === 'pending' && (
                          <div className="flex gap-2 self-stretch sm:self-center">
                            <Button size="sm" onClick={() => handleInvitationAction(inv.id, 'accept')} className="bg-green-500 hover:bg-green-600">
                              <UserCheck className="h-4 w-4 mr-1" /> Aceptar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleInvitationAction(inv.id, 'decline')}>
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
                    <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
                      <Send className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No has enviado invitaciones</h3>
                      <p className="text-white/70">Explora perfiles y envía invitaciones para conectar.</p>
                    </Card>
                  ) : (
                    sentInvitations.map((inv) => (
                      <Card key={inv.id} className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center text-sm text-white/80">
                            {getInvitationTypeIcon(inv.type)}
                            <span>Invitación para <strong>{inv.to_profile}</strong></span>
                          </div>
                          {getStatusBadge(inv.status)}
                        </div>
                        {inv.message && <p className="text-sm text-white/70 bg-white/10 p-3 rounded-md my-3">"{inv.message}"</p>}
                        <p className="text-xs text-white/50">Enviado: {new Date(inv.created_at).toLocaleString()}</p>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

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
