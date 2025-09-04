import { ArrowLeft, Heart, Users, Shield, Zap, Star, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

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
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-white">Quiénes Somos</h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                  <Heart className="h-12 w-12 text-white" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">ComplicesConecta</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                La plataforma social premium más innovadora para adultos que buscan conexiones auténticas 
                y experiencias únicas en un ambiente seguro y discreto.
              </p>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-pink-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Nuestra Misión</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Crear un espacio seguro y verificado donde personas adultas puedan explorar 
                  conexiones auténticas, compartir experiencias y vivir su lifestyle con total 
                  libertad y respeto mutuo.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Nuestra Visión</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Ser la plataforma líder en Latinoamérica para la comunidad lifestyle, 
                  reconocida por su innovación tecnológica, seguridad y compromiso con 
                  la privacidad de nuestros usuarios.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Nuestros Valores</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Seguridad</h4>
                  <p className="text-white/70 text-sm">
                    Verificación KYC, encriptación end-to-end y protección total de datos personales.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Comunidad</h4>
                  <p className="text-white/70 text-sm">
                    Fomentamos el respeto, la inclusión y conexiones genuinas entre nuestros miembros.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovación</h4>
                  <p className="text-white/70 text-sm">
                    Tecnología de vanguardia con IA para matching inteligente y experiencias únicas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">¿Por Qué ComplicesConecta?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Verificación Premium</h4>
                      <p className="text-white/70 text-sm">Sistema KYC que garantiza perfiles auténticos y seguros.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Privacidad Total</h4>
                      <p className="text-white/70 text-sm">Chat encriptado y control completo sobre tu información.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Comunidad Exclusiva</h4>
                      <p className="text-white/70 text-sm">Acceso a eventos y experiencias únicas para miembros.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Matching Inteligente</h4>
                      <p className="text-white/70 text-sm">IA avanzada para encontrar conexiones compatibles.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Experiencia Premium</h4>
                      <p className="text-white/70 text-sm">Interfaz elegante y funciones avanzadas sin publicidad.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Soporte 24/7</h4>
                      <p className="text-white/70 text-sm">Equipo dedicado para resolver cualquier consulta.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-md border-pink-300/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">¿Listo para Conectar?</h3>
              <p className="text-white/90 mb-6">
                Únete a miles de personas que ya viven experiencias únicas en ComplicesConecta
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
                >
                  Crear Cuenta Gratis
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/support')}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3 transition-all duration-300 hover:scale-105"
                >
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
