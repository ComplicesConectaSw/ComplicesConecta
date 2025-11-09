import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Shield, Lock, Eye, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import HeaderNav from "@/components/HeaderNav";

const SecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      <HeaderNav />
      <div className="container mx-auto px-4 py-8">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Seguridad y Proteccin
          </h1>
          <p className="text-xl text-white font-medium max-w-3xl mx-auto">
            Tu seguridad y privacidad son nuestra mxima prioridad. Conoce todas las medidas 
            que implementamos para proteger tu informacin y garantizar una experiencia segura.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden min-h-[250px]">
            <CardHeader className="text-center pb-3">
              <Lock className="h-12 w-12 text-white mx-auto mb-4 flex-shrink-0" />
              <CardTitle className="text-lg sm:text-xl text-white break-words px-2">Encriptacin de Datos</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-sm sm:text-base text-white font-medium text-center break-words leading-relaxed">
                Todos tus datos estn protegidos con encriptacin de nivel bancario 
                AES-GCM tanto en trnsito como en reposo. 122 polticas RLS activas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden min-h-[250px]">
            <CardHeader className="text-center pb-3">
              <UserCheck className="h-12 w-12 text-white mx-auto mb-4 flex-shrink-0" />
              <CardTitle className="text-lg sm:text-xl text-white break-words px-2">Verificacin KYC</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-sm sm:text-base text-white font-medium text-center break-words leading-relaxed">
                Sistema de verificacin de identidad para garantizar que todos 
                los usuarios sean personas reales y autnticas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="text-center">
              <Eye className="h-12 w-12 text-white mx-auto mb-4 flex-shrink-0" />
              <CardTitle className="text-xl text-white break-words px-2">Control de Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-white font-medium text-center break-words leading-relaxed">
                T decides qu informacin compartir y con quin. Control total 
                sobre la visibilidad de tu perfil y contenido.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Policies */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-white font-medium">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                Polticas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Autenticacin de dos factores (2FA)</strong> disponible para mayor seguridad
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Monitoreo 24/7</strong> de actividades sospechosas y intentos de acceso no autorizados
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Auditoras regulares</strong> de seguridad por terceros especializados
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Backup automtico</strong> y recuperacin de datos en mltiples ubicaciones
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Cumplimiento GDPR/LFPDPPP + Ley Olimpia</strong> y normativas internacionales de proteccin de datos. Verificador IA de Consentimiento implementado.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Row Level Security (RLS):</strong> 122 polticas RLS activas protegiendo acceso a datos sensibles
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white font-medium">
                    <strong>Neo4j Graph Database:</strong> Anlisis de conexiones sospechosas y deteccin de fraude avanzada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-white font-medium">
                <AlertTriangle className="h-6 w-6 text-orange-400 mr-3" />
                Reportar Problemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white font-medium">
                Si detectas alguna actividad sospechosa o problema de seguridad, 
                contctanos inmediatamente:
              </p>
              <div className="space-y-3">
                <div className="bg-red-500/20 p-4 rounded-lg border border-red-400/30">
                  <p className="font-semibold text-red-300">Emergencias de Seguridad</p>
                  <p className="text-red-200">security@complicesconecta.com</p>
                  <p className="text-sm text-red-200/80">Respuesta en menos de 2 horas</p>
                </div>
                <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-400/30">
                  <p className="font-semibold text-orange-300">Reportar Usuario</p>
                  <p className="text-orange-200">Usa el botn "Reportar" en cualquier perfil</p>
                  <p className="text-sm text-orange-200/80">Investigacin en 24-48 horas</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
                  <p className="font-semibold text-blue-300">Soporte General</p>
                  <p className="text-blue-200">soporte@complicesconecta.com</p>
                  <p className="text-sm text-blue-200/80">Respuesta en 24 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Controls */}
        <Card className="bg-white/10 border-white/20 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Controles de Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-300">Gestin de Fotos</h3>
                <ul className="space-y-2 text-white font-medium">
                  <li> Fotos pblicas: visibles para todos los usuarios</li>
                  <li> Fotos privadas: requieren solicitud de acceso</li>
                  <li> Control total sobre quin puede ver tu contenido</li>
                  <li> Eliminacin permanente cuando lo desees</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-300">Configuracin de Perfil</h3>
                <ul className="space-y-2 text-white font-medium">
                  <li> Visibilidad del perfil configurable</li>
                  <li> Bloqueo de usuarios no deseados</li>
                  <li> Control de mensajes y notificaciones</li>
                  <li> Modo invisible disponible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="bg-white/10 border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Consejos de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-purple-400/30">
                  <Lock className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Contrasea Segura</h3>
                <p className="text-sm text-white font-medium">
                  Usa contraseas nicas y complejas. Activa la autenticacin de dos factores.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-purple-400/30">
                  <Eye className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Informacin Personal</h3>
                <p className="text-sm text-white font-medium">
                  No compartas informacin sensible como direcciones o datos financieros.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-purple-400/30">
                  <AlertTriangle className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Mantnte Alerta</h3>
                <p className="text-sm text-white font-medium">
                  Reporta comportamientos sospechosos y confa en tu instinto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-white font-medium mb-4">
            Tienes preguntas sobre seguridad o necesitas ayuda?
          </p>
          <Button
            onClick={() => navigate('/support')}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-6 py-3 transition-all duration-300 hover:scale-105"
          >
            Contactar Soporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
