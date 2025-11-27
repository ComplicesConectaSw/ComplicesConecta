import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Users, Heart, Shield, AlertCircle, CheckCircle, XCircle, Flag, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import HeaderNav from "@/components/HeaderNav";

const GuidelinesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HeaderNav />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Header con botn de regreso */}
        <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md border-b border-purple-300/30 p-3 sm:p-4 shadow-lg flex-shrink-0 rounded-t-xl mb-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              className="relative overflow-hidden text-white hover:bg-white/20 flex items-center gap-2 btn-accessible"
              variant="ghost"
            >
              <div className="absolute inset-0 bg-white/20 rounded-md pointer-events-none opacity-0 scale-0 transition-all duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline truncate">Regresar al Inicio</span>
                <span className="sm:hidden">Inicio</span>
              </span>
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white text-center">
              ?? Directrices de la Comunidad
            </h1>
            <div className="w-[120px] sm:w-[180px]"></div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 text-white">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Directrices de la Comunidad
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Nuestra comunidad se basa en el respeto mutuo, la autenticidad y la diversin responsable. 
              Estas directrices nos ayudan a mantener un ambiente seguro y acogedor para todos.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-white">Respeto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-center">
                  Tratamos a todos los miembros con dignidad, respeto y consideracin, 
                  independientemente de sus preferencias o estilo de vida.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-white">Autenticidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-center">
                  Valoramos la honestidad y la transparencia. S genuino en tu perfil 
                  y en tus interacciones con otros miembros.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-white">Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-center">
                  La seguridad de nuestra comunidad es prioritaria. Reporta cualquier 
                  comportamiento inapropiado o sospechoso.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Community Rules */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-green-400">
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Comportamientos Permitidos
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-white/80">
                    <strong>Comunicacin respetuosa:</strong> Usa un lenguaje corts y considerado
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Perfiles autnticos:</strong> Usa fotos reales y informacin veraz
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Consentimiento mutuo:</strong> Respeta los lmites y decisiones de otros
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Privacidad:</strong> Mantn confidencial la informacin personal compartida
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

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-red-400">
                  <XCircle className="h-6 w-6 mr-3" />
                  Comportamientos Prohibidos
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Acoso o intimidacin:</strong> Cualquier forma de hostigamiento est prohibida
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
                    <strong>Spam o promocin:</strong> No uses la plataforma para publicidad no autorizada
                  </p>
                </div>
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Discriminacin:</strong> No toleramos prejuicios por raza, gnero, orientacin, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Guidelines */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Directrices de Contenido</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Fotos de Perfil</h3>
                <ul className="space-y-2 text-gray-700">
                  <li> Usa fotos claras y recientes (mximo 2 aos)</li>
                  <li> Incluye al menos una foto de rostro visible</li>
                  <li> Las fotos deben ser tuyas o de tu pareja</li>
                  <li> Evita contenido excesivamente explcito en fotos pblicas</li>
                  <li> Respeta los derechos de autor</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Mensajes y Chat</h3>
                <ul className="space-y-2 text-gray-700">
                  <li> S respetuoso desde el primer mensaje</li>
                  <li> No enves contenido no solicitado</li>
                  <li> Respeta si alguien no responde o declina</li>
                  <li> Mantn las conversaciones apropiadas al contexto</li>
                  <li> No compartas informacin de contacto de terceros</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting System */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl justify-center text-white">
                <Flag className="h-6 w-6 text-orange-400 mr-3" />
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
                  Usa el botn "Reportar" en cualquier perfil para denunciar comportamientos inapropiados.
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
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Consecuencias por Violaciones</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">Primera Advertencia</h3>
                  <p className="text-yellow-700 text-sm">
                    Notificacin y orientacin sobre las directrices de la comunidad.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Suspensin Temporal</h3>
                  <p className="text-orange-700 text-sm">
                    Restriccin de acceso por un perodo determinado (1-30 das).
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Expulsin Permanente</h3>
                  <p className="text-red-700 text-sm">
                    Eliminacin definitiva de la cuenta por violaciones graves o reincidentes.
                  </p>
                </div>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Las decisiones se toman caso por caso, considerando la gravedad y el contexto de cada situacin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Appeals */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Contacto y Apelaciones</CardTitle>
            </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/80 mb-6">
              Si tienes preguntas sobre estas directrices o deseas apelar una decisin, 
              no dudes en contactarnos:
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-purple-300">Equipo de Moderacin</p>
                <p className="text-white/70">moderacion@complicesconecta.com</p>
              </div>
              <div>
                <p className="font-semibold text-purple-300">Apelaciones</p>
                <p className="text-white/70">apelaciones@complicesconecta.com</p>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="/support"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                Contactar Soporte
              </a>
            </div>
          </CardContent>
        </Card>

          {/* Footer Note */}
          <div className="text-center mt-12 text-white/70 text-sm">
            <p>
              Estas directrices pueden actualizarse peridicamente. Te notificaremos sobre cambios importantes.
            </p>
            <p className="mt-2">
              ltima actualizacin: Enero 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;
