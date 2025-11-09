import HeaderNav from "@/components/HeaderNav";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  ArrowLeft, 
  Lock, 
  Globe, 
  Shield, 
  Users, 
  Heart,
  Zap,
  Eye,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen android-fix relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
      {/* Background matching other pages */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-indigo-600/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-purple-400/20 to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <HeaderNav />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="h-12 w-12 text-white mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Sistema de Chat ComplicesConecta
              </h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Conecta de forma segura y discreta con la comunidad lifestyle ms exclusiva de Mxico
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Private Chats Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-purple-300" />
                  Chats Privados
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-300/30">
                    Encriptado E2E
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  Conversaciones ntimas y seguras con tus conexiones verificadas del lifestyle swinger.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Encriptacin de extremo a extremo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-blue-400" />
                    <span>Solo conexiones aceptadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-purple-400" />
                    <span>Control total de privacidad</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Public Chats Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-green-300" />
                  Salas Pblicas
                  <Badge className="bg-green-500/20 text-green-200 border-green-300/30">
                    Moderadas 24/7
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  nete a la conversacin comunitaria en salas temticas del lifestyle mexicano.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-400" />
                    <span>Comunidad activa 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>Moderacin profesional</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-purple-400" />
                    <span>Ambiente respetuoso</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Rooms Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-400" />
                Salas Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      ??
                    </div>
                    <div>
                      <h4 className="font-semibold">Sala General Lifestyle</h4>
                      <p className="text-sm text-white/70">Conversacin general de la comunidad</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      ??
                    </div>
                    <div>
                      <h4 className="font-semibold">Parejas CDMX</h4>
                      <p className="text-sm text-white/70">Exclusivo para parejas de la Ciudad de Mxico</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      ??
                    </div>
                    <div>
                      <h4 className="font-semibold">Singles Lifestyle</h4>
                      <p className="text-sm text-white/70">Espacio para solteros del lifestyle</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      ??
                    </div>
                    <div>
                      <h4 className="font-semibold">Eventos Privados</h4>
                      <p className="text-sm text-white/70">Organizacin de eventos exclusivos</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-400" />
                Seguridad y Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Encriptacin E2E</h4>
                  <p className="text-sm text-white/70">Tus mensajes privados estn protegidos con encriptacin de extremo a extremo</p>
                </div>
                <div className="text-center">
                  <UserCheck className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Verificacin KYC</h4>
                  <p className="text-sm text-white/70">Solo usuarios verificados pueden acceder al sistema de chat</p>
                </div>
                <div className="text-center">
                  <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Control de Privacidad</h4>
                  <p className="text-sm text-white/70">T decides quin puede contactarte y cmo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/chat-authenticated')}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Comenzar a Chatear
            </Button>
            <p className="text-white/70 text-sm mt-4">
              nete a la comunidad lifestyle ms exclusiva y segura de Mxico
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
