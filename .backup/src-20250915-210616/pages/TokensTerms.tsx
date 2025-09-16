import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertTriangle, Shield, Coins, Users, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function TokensTerms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <AnimatedButton
              variant="ghost"
              onClick={() => navigate('/tokens')}
              className="text-white hover:bg-white/20 flex items-center gap-2 btn-accessible"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline truncate">Regresar a Tokens</span>
              <span className="sm:hidden">Regresar</span>
            </AnimatedButton>
            
            <h1 className="text-lg sm:text-xl font-bold text-white text-center truncate">Términos y Condiciones - Tokens</h1>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">🏠</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Términos y Condiciones
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Programa de Tokens CMPX/GTK
            </span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Lee y comprende los términos que rigen el uso de nuestro sistema de tokens y funciones premium.
          </p>
        </div>

        {/* Información General */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Información General del Acuerdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p><strong className="text-white">Fecha de vigencia:</strong> 3 de septiembre de 2025</p>
            <p><strong className="text-white">Versión:</strong> 1.0 - Fase Beta</p>
            <p>
              Al participar en el programa de tokens CMPX/GTK de ComplicesConecta, aceptas estos términos y condiciones. 
              Este acuerdo complementa nuestros Términos de Servicio generales.
            </p>
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-blue-200">
                <strong>Importante:</strong> Estos términos aplican específicamente durante la fase beta. 
                Se actualizarán antes del lanzamiento de producción con tokens blockchain.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Definiciones */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-400" />
              Definiciones Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Tokens CMPX:</h4>
                <p className="text-sm">
                  Tokens internos digitales sin valor monetario real, utilizados durante la fase beta 
                  para acceder a funciones premium y recompensar participación.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Tokens GTK:</h4>
                <p className="text-sm">
                  Tokens blockchain (ERC20) que reemplazarán a CMPX en producción, 
                  con valor real y transferibilidad completa.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Sistema de Referidos:</h4>
                <p className="text-sm">
                  Programa que otorga 50 CMPX al invitador y 50 CMPX al invitado 
                  por cada registro exitoso usando códigos de referido.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Funciones Premium:</h4>
                <p className="text-sm">
                  Características avanzadas de la plataforma que requieren tokens CMPX 
                  para su activación durante la fase beta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Derechos y Obligaciones */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-purple-400" />
              Derechos y Obligaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-white/80">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Tus Derechos:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Ganar tokens CMPX participando legítimamente en el sistema de referidos</li>
                <li>Usar tokens para acceder a funciones premium durante la fase beta</li>
                <li>Consultar tu balance y historial de transacciones en cualquier momento</li>
                <li>Recibir soporte técnico para problemas relacionados con tokens</li>
                <li>Ser notificado sobre cambios importantes en el sistema</li>
                <li>Migrar tus CMPX a GTK cuando se active la versión de producción</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Tus Obligaciones:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Usar el sistema de manera honesta y sin intentar defraudar</li>
                <li>No crear múltiples cuentas para obtener tokens adicionales</li>
                <li>No vender, transferir o intercambiar CMPX fuera de la plataforma</li>
                <li>Reportar errores o problemas técnicos que encuentres</li>
                <li>Cumplir con los límites mensuales establecidos (500 CMPX/mes)</li>
                <li>Mantener actualizada tu información de contacto</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitaciones y Restricciones */}
        <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 backdrop-blur-sm border border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              Limitaciones y Restricciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-orange-200 mb-2">Valor de los Tokens:</h4>
                <p className="text-sm">
                  Los tokens CMPX NO tienen valor monetario real durante la fase beta. 
                  Son créditos internos de la plataforma sin garantía de conversión a dinero real.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-200 mb-2">Límites del Sistema:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Máximo 500 CMPX ganables por usuario por mes</li>
                  <li>Un solo código de referido por usuario nuevo</li>
                  <li>No se permiten auto-referidos ni cuentas múltiples</li>
                  <li>Funciones premium limitadas a disponibilidad de tokens</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-200 mb-2">Modificaciones del Sistema:</h4>
                <p className="text-sm">
                  ComplicesConecta se reserva el derecho de modificar, suspender o terminar 
                  el programa de tokens con 30 días de aviso previo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsabilidades */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-400" />
              Responsabilidades y Limitación de Responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Nuestra Responsabilidad:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Mantener el sistema de tokens funcionando de manera estable</li>
                  <li>Proteger la información de tokens según nuestra política de privacidad</li>
                  <li>Procesar recompensas de referidos de manera justa y oportuna</li>
                  <li>Proporcionar soporte técnico para problemas legítimos</li>
                  <li>Notificar cambios importantes con anticipación</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Limitación de Responsabilidad:</h4>
                <div className="bg-red-900/30 p-4 rounded-lg">
                  <p className="text-red-200 text-sm">
                    <strong>IMPORTANTE:</strong> ComplicesConecta no será responsable por:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2 ml-4 text-red-200">
                    <li>Pérdidas financieras derivadas del uso de tokens CMPX</li>
                    <li>Interrupciones temporales del servicio durante mantenimiento</li>
                    <li>Cambios en el valor o utilidad de los tokens</li>
                    <li>Decisiones de inversión basadas en la posesión de tokens</li>
                    <li>Problemas técnicos fuera de nuestro control</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violaciones y Sanciones */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-yellow-400" />
              Violaciones y Sanciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Conductas Prohibidas:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Crear múltiples cuentas para obtener tokens adicionales</li>
                  <li>Usar bots o automatización para generar referidos falsos</li>
                  <li>Intentar hackear o manipular el sistema de tokens</li>
                  <li>Vender o intercambiar CMPX fuera de la plataforma</li>
                  <li>Proporcionar información falsa para obtener tokens</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Sanciones Aplicables:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-yellow-200 text-sm">Primera Infracción</h5>
                    <p className="text-xs text-yellow-100 mt-1">Advertencia escrita y congelamiento temporal de tokens</p>
                  </div>
                  <div className="bg-orange-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-orange-200 text-sm">Segunda Infracción</h5>
                    <p className="text-xs text-orange-100 mt-1">Pérdida parcial de tokens y suspensión de funciones premium</p>
                  </div>
                  <div className="bg-red-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-red-200 text-sm">Tercera Infracción</h5>
                    <p className="text-xs text-red-100 mt-1">Pérdida total de tokens y exclusión permanente del programa</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transición a Producción */}
        <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-green-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-6 w-6 text-green-400" />
              Transición a Versión de Producción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <p>
                Cuando ComplicesConecta lance la versión de producción con tokens GTK blockchain:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-200">Migración de Tokens:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>CMPX se convertirán automáticamente a GTK</li>
                    <li>Ratio de conversión será 1:1 inicialmente</li>
                    <li>Proceso gratuito para todos los usuarios beta</li>
                    <li>Notificación 60 días antes de la migración</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-200">Nuevas Funcionalidades:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Pagos reales con Stripe para funciones premium</li>
                    <li>Transferibilidad completa de tokens GTK</li>
                    <li>Nuevos términos y condiciones actualizados</li>
                    <li>Valor de mercado real para los tokens</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-900/30 p-4 rounded-lg">
                <p className="text-green-200">
                  <strong>Garantía:</strong> Todos los tokens CMPX ganados legítimamente durante la beta 
                  serán honrados en la conversión a GTK sin pérdida de valor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto y Resolución de Disputas */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white">Contacto y Resolución de Disputas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Soporte Técnico:</h4>
                <div className="bg-purple-900/30 p-3 rounded-lg text-sm">
                  <p><strong>Email:</strong> tokens@complicesconecta.com</p>
                  <p><strong>Chat:</strong> Disponible 24/7 en la app</p>
                  <p><strong>Respuesta:</strong> Máximo 24 horas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Disputas Legales:</h4>
                <div className="bg-purple-900/30 p-3 rounded-lg text-sm">
                  <p><strong>Jurisdicción:</strong> México</p>
                  <p><strong>Ley aplicable:</strong> Legislación mexicana</p>
                  <p><strong>Mediación:</strong> Preferida antes de litigio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aceptación */}
        <Card className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm border border-purple-400/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Aceptación de Términos</h3>
            <p className="text-white/80 mb-6">
              Al usar el sistema de tokens CMPX/GTK, confirmas que has leído, entendido y aceptado 
              estos términos y condiciones en su totalidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/tokens-privacy')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Ver Política de Privacidad
              </Button>
              <Button
                onClick={() => navigate('/tokens-info')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Volver a Información de Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
