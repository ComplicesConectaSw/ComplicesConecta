import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seguridad y Protección
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tu seguridad y privacidad son nuestra máxima prioridad. Conoce todas las medidas 
            que implementamos para proteger tu información y garantizar una experiencia segura.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Encriptación de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Todos tus datos están protegidos con encriptación de nivel bancario 
                AES-256 tanto en tránsito como en reposo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <UserCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Verificación KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Sistema de verificación de identidad para garantizar que todos 
                los usuarios sean personas reales y auténticas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Control de Privacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Tú decides qué información compartir y con quién. Control total 
                sobre la visibilidad de tu perfil y contenido.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Policies */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                Políticas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Autenticación de dos factores (2FA)</strong> disponible para mayor seguridad
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Monitoreo 24/7</strong> de actividades sospechosas y intentos de acceso no autorizados
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Auditorías regulares</strong> de seguridad por terceros especializados
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Backup automático</strong> y recuperación de datos en múltiples ubicaciones
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Cumplimiento GDPR</strong> y normativas internacionales de protección de datos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                Reportar Problemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Si detectas alguna actividad sospechosa o problema de seguridad, 
                contáctanos inmediatamente:
              </p>
              <div className="space-y-3">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold text-red-800">Emergencias de Seguridad</p>
                  <p className="text-red-700">security@complicesconecta.com</p>
                  <p className="text-sm text-red-600">Respuesta en menos de 2 horas</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="font-semibold text-orange-800">Reportar Usuario</p>
                  <p className="text-orange-700">Usa el botón "Reportar" en cualquier perfil</p>
                  <p className="text-sm text-orange-600">Investigación en 24-48 horas</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-blue-800">Soporte General</p>
                  <p className="text-blue-700">soporte@complicesconecta.com</p>
                  <p className="text-sm text-blue-600">Respuesta en 24 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Controls */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Controles de Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Gestión de Fotos</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Fotos públicas: visibles para todos los usuarios</li>
                  <li>• Fotos privadas: requieren solicitud de acceso</li>
                  <li>• Control total sobre quién puede ver tu contenido</li>
                  <li>• Eliminación permanente cuando lo desees</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Configuración de Perfil</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Visibilidad del perfil configurable</li>
                  <li>• Bloqueo de usuarios no deseados</li>
                  <li>• Control de mensajes y notificaciones</li>
                  <li>• Modo invisible disponible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Consejos de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Contraseña Segura</h3>
                <p className="text-sm text-gray-600">
                  Usa contraseñas únicas y complejas. Activa la autenticación de dos factores.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Información Personal</h3>
                <p className="text-sm text-gray-600">
                  No compartas información sensible como direcciones o datos financieros.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Mantente Alerta</h3>
                <p className="text-sm text-gray-600">
                  Reporta comportamientos sospechosos y confía en tu instinto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Tienes preguntas sobre seguridad o necesitas ayuda?
          </p>
          <a
            href="/support"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
