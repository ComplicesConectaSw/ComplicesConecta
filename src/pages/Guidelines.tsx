import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield, AlertCircle, CheckCircle, XCircle, Flag } from "lucide-react";

const GuidelinesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Directrices de la Comunidad
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra comunidad se basa en el respeto mutuo, la autenticidad y la diversión responsable. 
            Estas directrices nos ayudan a mantener un ambiente seguro y acogedor para todos.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Respeto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Tratamos a todos los miembros con dignidad, respeto y consideración, 
                independientemente de sus preferencias o estilo de vida.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Autenticidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Valoramos la honestidad y la transparencia. Sé genuino en tu perfil 
                y en tus interacciones con otros miembros.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                La seguridad de nuestra comunidad es prioritaria. Reporta cualquier 
                comportamiento inapropiado o sospechoso.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Community Rules */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-green-700">
                <CheckCircle className="h-6 w-6 mr-3" />
                Comportamientos Permitidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Comunicación respetuosa:</strong> Usa un lenguaje cortés y considerado
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Perfiles auténticos:</strong> Usa fotos reales y información veraz
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Consentimiento mutuo:</strong> Respeta los límites y decisiones de otros
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Privacidad:</strong> Mantén confidencial la información personal compartida
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Diversidad:</strong> Celebra y respeta las diferentes orientaciones y preferencias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-red-700">
                <XCircle className="h-6 w-6 mr-3" />
                Comportamientos Prohibidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Acoso o intimidación:</strong> Cualquier forma de hostigamiento está prohibida
                  </p>
                </div>
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Perfiles falsos:</strong> No uses identidades falsas o fotos de otras personas
                  </p>
                </div>
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Contenido inapropiado:</strong> No compartas material ofensivo o ilegal
                  </p>
                </div>
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Spam o promoción:</strong> No uses la plataforma para publicidad no autorizada
                  </p>
                </div>
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Discriminación:</strong> No toleramos prejuicios por raza, género, orientación, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Guidelines */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Directrices de Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Fotos de Perfil</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Usa fotos claras y recientes (máximo 2 años)</li>
                  <li>• Incluye al menos una foto de rostro visible</li>
                  <li>• Las fotos deben ser tuyas o de tu pareja</li>
                  <li>• Evita contenido excesivamente explícito en fotos públicas</li>
                  <li>• Respeta los derechos de autor</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Mensajes y Chat</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Sé respetuoso desde el primer mensaje</li>
                  <li>• No envíes contenido no solicitado</li>
                  <li>• Respeta si alguien no responde o declina</li>
                  <li>• Mantén las conversaciones apropiadas al contexto</li>
                  <li>• No compartas información de contacto de terceros</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting System */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl justify-center">
              <Flag className="h-6 w-6 text-orange-600 mr-3" />
              Sistema de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2 text-red-700">Reportar Usuario</h3>
                <p className="text-sm text-gray-600">
                  Usa el botón "Reportar" en cualquier perfil para denunciar comportamientos inapropiados.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Flag className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2 text-orange-700">Reportar Contenido</h3>
                <p className="text-sm text-gray-600">
                  Reporta fotos, mensajes o cualquier contenido que viole nuestras directrices.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-blue-700">Emergencias</h3>
                <p className="text-sm text-gray-600">
                  Para situaciones urgentes de seguridad, contacta inmediatamente a nuestro equipo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Consecuencias por Violaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">Primera Advertencia</h3>
                  <p className="text-yellow-700 text-sm">
                    Notificación y orientación sobre las directrices de la comunidad.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Suspensión Temporal</h3>
                  <p className="text-orange-700 text-sm">
                    Restricción de acceso por un período determinado (1-30 días).
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Expulsión Permanente</h3>
                  <p className="text-red-700 text-sm">
                    Eliminación definitiva de la cuenta por violaciones graves o reincidentes.
                  </p>
                </div>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Las decisiones se toman caso por caso, considerando la gravedad y el contexto de cada situación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Appeals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Contacto y Apelaciones</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-6">
              Si tienes preguntas sobre estas directrices o deseas apelar una decisión, 
              no dudes en contactarnos:
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-purple-700">Equipo de Moderación</p>
                <p className="text-gray-600">moderacion@complicesconecta.com</p>
              </div>
              <div>
                <p className="font-semibold text-purple-700">Apelaciones</p>
                <p className="text-gray-600">apelaciones@complicesconecta.com</p>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="/support"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Contactar Soporte
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Estas directrices pueden actualizarse periódicamente. Te notificaremos sobre cambios importantes.
          </p>
          <p className="mt-2">
            Última actualización: Enero 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;
