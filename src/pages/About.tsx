import { Heart, Users, Shield, Zap, Star, Award, Target, Camera, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

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

      <Header />
      {/* Content */}
      <div className="relative z-10 min-h-screen">

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
              <h2 className="text-4xl font-bold text-white mb-4">ComplicesConecta</h2>
              <p className="text-xl text-white/90 font-medium leading-relaxed mb-6">
                La plataforma social líder en México para adultos que buscan conexiones auténticas 
                en el lifestyle swinger. Conecta con parejas y solteros verificados en un ambiente 
                seguro, discreto y completamente respetuoso.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold text-sm">+5,000 Miembros</h3>
                  <p className="text-white/70 text-xs">Comunidad activa y verificada</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold text-sm">100% Seguro</h3>
                  <p className="text-white/70 text-xs">Verificación de identidad obligatoria</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold text-sm">Desde 2024</h3>
                  <p className="text-white/70 text-xs">Plataforma confiable y establecida</p>
                </div>
              </div>
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
                <p className="text-white font-medium leading-relaxed">
                  Crear un espacio seguro donde parejas y solteros del lifestyle swinger puedan 
                  conectar de manera auténtica, explorando nuevas experiencias con total 
                  discreción y respeto mutuo.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Nuestra Visión</h3>
                </div>
                <p className="text-white font-medium leading-relaxed">
                  Convertirnos en una plataforma confiable para la comunidad lifestyle en México, 
                  reconocida por brindar un ambiente seguro, tecnología moderna y compromiso 
                  con la privacidad de nuestros usuarios.
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
                    Sistema de verificación de usuarios y protección de datos personales.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Comunidad</h4>
                  <p className="text-white/70 text-sm">
                    Comunidad lifestyle con códigos de respeto y ética bien definidos.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovación</h4>
                  <p className="text-white/70 text-sm">
                    Sistema de matching inteligente basado en compatibilidad e intereses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades Principales */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Funcionalidades Principales</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Camera className="h-8 w-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Historias Efímeras</h4>
                  <p className="text-white/70 text-sm">Comparte momentos que desaparecen en 24 horas con total privacidad</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Users className="h-8 w-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Matching Inteligente</h4>
                  <p className="text-white/70 text-sm">Algoritmo avanzado que conecta según compatibilidad y preferencias</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Shield className="h-8 w-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Verificación Biométrica</h4>
                  <p className="text-white/70 text-sm">Sistema 2FA con autenticación facial y huella digital</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Eye className="h-8 w-8 text-pink-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Fotos Privadas</h4>
                  <p className="text-white/70 text-sm">Sistema de solicitud de acceso a contenido íntimo con watermarks</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Play className="h-8 w-8 text-orange-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Chat Multimedia</h4>
                  <p className="text-white/70 text-sm">Mensajes, fotos y videos con cifrado end-to-end</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Award className="h-8 w-8 text-yellow-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Eventos Exclusivos</h4>
                  <p className="text-white/70 text-sm">Acceso a fiestas y encuentros lifestyle verificados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas y Logros */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Nuestra Comunidad en Números</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">5,247</div>
                  <div className="text-white/70 text-sm">Miembros Verificados</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">12,891</div>
                  <div className="text-white/70 text-sm">Matches Exitosos</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">98.7%</div>
                  <div className="text-white/70 text-sm">Satisfacción Usuario</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/70 text-sm">Soporte Técnico</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad y Privacidad */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Compromiso con la Seguridad</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Encriptación AES-GCM</h4>
                      <p className="text-white/70 text-sm">Todos los datos están protegidos con cifrado militar de grado empresarial</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Cumplimiento GDPR/LFPDPPP</h4>
                      <p className="text-white/70 text-sm">Certificados en protección de datos europea y mexicana</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Eye className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Moderación IA + Humana</h4>
                      <p className="text-white/70 text-sm">Sistema híbrido de detección de contenido inapropiado</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Verificación Obligatoria</h4>
                      <p className="text-white/70 text-sm">Documento oficial + selfie + verificación telefónica</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Detección de Fraude</h4>
                      <p className="text-white/70 text-sm">IA avanzada para identificar perfiles falsos y comportamiento sospechoso</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Equipo de Moderadores</h4>
                      <p className="text-white/70 text-sm">Moderadores humanos especializados en lifestyle y relaciones</p>
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
              <p className="text-white font-medium mb-6">
                Únete a nuestra creciente comunidad lifestyle en México. 
                Estamos construyendo algo especial juntos.
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
