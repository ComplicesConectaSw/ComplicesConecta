import { Heart, Users, Shield, Zap, Star, Award, Target, Camera, Play, Eye } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { useNavigate } from "react-router-dom";
import HeaderNav from "@/components/HeaderNav";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Elementos fantasma deshabilitados para evitar aparicin/desaparicin */}
        {/* <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div> */}
      </div>

      <HeaderNav />
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
                La plataforma social lder en Mxico para adultos que buscan conexiones autnticas 
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
                  <p className="text-white/70 text-xs">Verificacin de identidad obligatoria</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold text-sm">v3.5.0 Beta</h3>
                  <p className="text-white/70 text-xs">AI-Native - Neo4j - Production Ready</p>
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
                  <h3 className="text-xl font-bold text-white">Nuestra Misin</h3>
                </div>
                <p className="text-white font-medium leading-relaxed">
                  Crear un espacio seguro donde parejas y solteros del lifestyle swinger puedan 
                  conectar de manera autntica, explorando nuevas experiencias con total 
                  discrecin y respeto mutuo.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Nuestra Visin</h3>
                </div>
                <p className="text-white font-medium leading-relaxed">
                  Convertirnos en una plataforma confiable para la comunidad lifestyle en Mxico, 
                  reconocida por brindar un ambiente seguro, tecnologa moderna y compromiso 
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
                    Sistema de verificacin de usuarios y proteccin de datos personales.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Comunidad</h4>
                  <p className="text-white/70 text-sm">
                    Comunidad lifestyle con cdigos de respeto y tica bien definidos.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovacin</h4>
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
                  <h4 className="font-semibold text-white mb-2">Historias Efmeras</h4>
                  <p className="text-white/70 text-sm">Comparte momentos que desaparecen en 24 horas con total privacidad</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Users className="h-8 w-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Matching Inteligente</h4>
                  <p className="text-white/70 text-sm">Algoritmo avanzado que conecta segn compatibilidad y preferencias</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Shield className="h-8 w-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Verificacin Biomtrica</h4>
                  <p className="text-white/70 text-sm">Sistema 2FA con autenticacin facial y huella digital</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Eye className="h-8 w-8 text-pink-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Galeras NFT-Verificadas</h4>
                  <p className="text-white/70 text-sm">Perfiles y galeras como NFTs mintados con GTK tokens</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Play className="h-8 w-8 text-orange-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Verificador IA de Consentimiento</h4>
                  <p className="text-white/70 text-sm">Deteccin proactiva de consentimiento en chats con IA</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Award className="h-8 w-8 text-yellow-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Matching Predictivo con Graphs</h4>
                  <p className="text-white/70 text-sm">Neo4j + IA para conexiones "friends-of-friends" emocionales</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <Zap className="h-8 w-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Eventos Virtuales Sostenibles</h4>
                  <p className="text-white/70 text-sm">Eventos eco-friendly con recompensas CMPX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadsticas y Logros */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Nuestra Comunidad en Nmeros</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">v3.5.0</div>
                  <div className="text-white/70 text-sm">Versin Actual</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">107</div>
                  <div className="text-white/70 text-sm">Tablas Base de Datos</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/70 text-sm">Tests Pasando</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">AI</div>
                  <div className="text-white/70 text-sm">Nativo + Neo4j</div>
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
                      <h4 className="font-semibold text-white">Encriptacin AES-GCM</h4>
                      <p className="text-white/70 text-sm">Todos los datos estn protegidos con cifrado militar de grado empresarial</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Cumplimiento GDPR/LFPDPPP</h4>
                      <p className="text-white/70 text-sm">Certificados en proteccin de datos europea y mexicana</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Eye className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Moderacin IA + Humana</h4>
                      <p className="text-white/70 text-sm">Sistema hbrido de deteccin de contenido inapropiado</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Verificacin Obligatoria</h4>
                      <p className="text-white/70 text-sm">Documento oficial + selfie + verificacin telefnica</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Deteccin de Fraude</h4>
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
              <h3 className="text-2xl font-bold text-white mb-4">Listo para Conectar?</h3>
              <p className="text-white font-medium mb-6">
                nete a nuestra creciente comunidad lifestyle en Mxico. 
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
                  onClick={() => navigate('/support')}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3 transition-all duration-300 hover:scale-105 border bg-transparent"
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
