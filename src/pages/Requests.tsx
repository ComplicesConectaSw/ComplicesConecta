import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  MessageCircle, 
  Heart, 
  Clock,
  Send,
  Users,
  User
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useFeatures } from "@/hooks/useFeatures";
import { 
  mockConnectionRequests, 
  ConnectionRequest, 
  ConnectionRequestStatus 
} from "@/lib/data";

const Requests = () => {
  const { features } = useFeatures();
  const [requests, setRequests] = useState<ConnectionRequest[]>(mockConnectionRequests);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Filtrar solicitudes por estado
  const receivedRequests = requests.filter(req => req.toUserId === 1); // Usuario actual
  const sentRequests = requests.filter(req => req.fromUserId === 1);
  const pendingReceived = receivedRequests.filter(req => req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted');

  const handleRequestAction = (requestId: number, action: ConnectionRequestStatus, message?: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: action, updatedAt: new Date().toISOString() }
        : req
    ));
    setSelectedRequest(null);
    setResponseMessage('');
  };

  const getStatusBadge = (status: ConnectionRequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><UserCheck className="h-3 w-3 mr-1" />Aceptada</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-600"><UserX className="h-3 w-3 mr-1" />Rechazada</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Solicitudes de Conexión</h1>
              <p className="text-white/70">Gestiona tus conexiones y solicitudes</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-white">{pendingReceived.length}</p>
              </Card>
              
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">Conexiones</span>
                </div>
                <p className="text-2xl font-bold text-white">{acceptedRequests.length}</p>
              </Card>
              
              <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Send className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-white font-semibold">Enviadas</span>
                </div>
                <p className="text-2xl font-bold text-white">{sentRequests.length}</p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-sm">
                <TabsTrigger 
                  value="received" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  Recibidas ({receivedRequests.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="sent" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  Enviadas ({sentRequests.length})
                </TabsTrigger>
              </TabsList>

              {/* Solicitudes Recibidas */}
              <TabsContent value="received" className="mt-6">
                <div className="space-y-4">
                  {receivedRequests.length === 0 ? (
                    <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
                      <UserPlus className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No hay solicitudes</h3>
                      <p className="text-white/70">Cuando alguien quiera conectar contigo, aparecerá aquí.</p>
                    </Card>
                  ) : (
                    receivedRequests.map((request) => (
                      <Card key={request.id} className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img 
                              src={request.fromUser.avatar} 
                              alt={request.fromUser.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                            />
                            <div className="absolute -bottom-1 -right-1">
                              {request.fromUser.type === 'couple' ? (
                                <Users className="h-5 w-5 text-pink-400 bg-black rounded-full p-1" />
                              ) : (
                                <User className="h-5 w-5 text-blue-400 bg-black rounded-full p-1" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-white">{request.fromUser.name}</h3>
                                <p className="text-sm text-white/60">{request.fromUser.location}</p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(request.status)}
                                <p className="text-xs text-white/50 mt-1">{formatDate(request.createdAt)}</p>
                              </div>
                            </div>
                            
                            {request.message && (
                              <div className="bg-white/10 rounded-lg p-3 mb-4">
                                <p className="text-white/90 text-sm">{request.message}</p>
                              </div>
                            )}
                            
                            {request.status === 'pending' && (
                              <div className="flex space-x-3">
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'accepted')}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Aceptar
                                </Button>
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'declined')}
                                  variant="outline"
                                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Rechazar
                                </Button>
                                <Button
                                  onClick={() => setSelectedRequest(request)}
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Responder
                                </Button>
                              </div>
                            )}
                            
                            {request.status === 'accepted' && (
                              <Button
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar Mensaje
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Solicitudes Enviadas */}
              <TabsContent value="sent" className="mt-6">
                <div className="space-y-4">
                  {sentRequests.length === 0 ? (
                    <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
                      <Send className="h-16 w-16 mx-auto mb-4 text-white/50" />
                      <h3 className="text-xl font-semibold text-white mb-2">No has enviado solicitudes</h3>
                      <p className="text-white/70">Explora perfiles y envía solicitudes de conexión.</p>
                    </Card>
                  ) : (
                    sentRequests.map((request) => (
                      <Card key={request.id} className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img 
                              src={request.toUser.avatar} 
                              alt={request.toUser.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                            />
                            <div className="absolute -bottom-1 -right-1">
                              {request.toUser.type === 'couple' ? (
                                <Users className="h-5 w-5 text-pink-400 bg-black rounded-full p-1" />
                              ) : (
                                <User className="h-5 w-5 text-blue-400 bg-black rounded-full p-1" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-white">{request.toUser.name}</h3>
                                <p className="text-sm text-white/60">{request.toUser.location}</p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(request.status)}
                                <p className="text-xs text-white/50 mt-1">{formatDate(request.createdAt)}</p>
                              </div>
                            </div>
                            
                            {request.message && (
                              <div className="bg-white/10 rounded-lg p-3 mb-4">
                                <p className="text-white/90 text-sm">{request.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal para responder solicitud */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 backdrop-blur-sm border-white/20">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Responder a {selectedRequest.fromUser.name}
                </h3>
                
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 mb-4"
                  rows={4}
                />
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleRequestAction(selectedRequest.id, 'accepted', responseMessage)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Aceptar y Responder
                  </Button>
                  <Button
                    onClick={() => setSelectedRequest(null)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Navigation />
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Requests;
