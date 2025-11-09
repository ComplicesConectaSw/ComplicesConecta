import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { ArrowLeft, FileText, AlertTriangle, Shield, Coins, Users, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import HeaderNav from '@/components/HeaderNav';

export default function TokensTerms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <HeaderNav />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-purple-800/90 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <AnimatedButton
              onClick={() => navigate('/tokens')}
              className="text-white hover:bg-white/20 flex items-center gap-2 btn-accessible bg-transparent border-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline truncate">Regresar a Tokens</span>
              <span className="sm:hidden">Regresar</span>
            </AnimatedButton>
            
            <h1 className="text-lg sm:text-xl font-bold text-white text-center truncate">T�rminos y Condiciones - Tokens</h1>
            
            <Button
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 bg-transparent border-none"
            >
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">??</span>
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
            T�rminos y Condiciones
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Programa de Tokens CMPX/GTK
            </span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Lee y comprende los t�rminos que rigen el uso de nuestro sistema de tokens y funciones premium.
          </p>
        </div>

        {/* Informaci�n General */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Informaci�n General del Acuerdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p><strong className="text-white">Fecha de vigencia:</strong> 3 de septiembre de 2025</p>
            <p><strong className="text-white">Versi�n:</strong> 1.0 - Fase Beta</p>
            <p>
              Al participar en el programa de tokens CMPX/GTK de ComplicesConecta, aceptas estos t�rminos y condiciones. 
              Este acuerdo complementa nuestros T�rminos de Servicio generales.
            </p>
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-blue-200">
                <strong>Importante:</strong> Estos t�rminos aplican espec�ficamente durante la fase beta. 
                Se actualizar�n antes del lanzamiento de producci�n con tokens blockchain.
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
                  para acceder a funciones premium y recompensar participaci�n.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Tokens GTK:</h4>
                <p className="text-sm">
                  Tokens blockchain (ERC20) que reemplazar�n a CMPX en producci�n, 
                  con valor real y transferibilidad completa.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Sistema de Referidos:</h4>
                <p className="text-sm">
                  Programa que otorga 50 CMPX al invitador y 50 CMPX al invitado 
                  por cada registro exitoso usando c�digos de referido.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Funciones Premium:</h4>
                <p className="text-sm">
                  Caracter�sticas avanzadas de la plataforma que requieren tokens CMPX 
                  para su activaci�n durante la fase beta.
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
                <li>Ganar tokens CMPX participando leg�timamente en el sistema de referidos</li>
                <li>Usar tokens para acceder a funciones premium durante la fase beta</li>
                <li>Consultar tu balance y historial de transacciones en cualquier momento</li>
                <li>Recibir soporte t�cnico para problemas relacionados con tokens</li>
                <li>Ser notificado sobre cambios importantes en el sistema</li>
                <li>Migrar tus CMPX a GTK cuando se active la versi�n de producci�n</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Tus Obligaciones:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Usar el sistema de manera honesta y sin intentar defraudar</li>
                <li>No crear m�ltiples cuentas para obtener tokens adicionales</li>
                <li>No vender, transferir o intercambiar CMPX fuera de la plataforma</li>
                <li>Reportar errores o problemas t�cnicos que encuentres</li>
                <li>Cumplir con los l�mites mensuales establecidos (500 CMPX/mes)</li>
                <li>Mantener actualizada tu informaci�n de contacto</li>
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
                  Son cr�ditos internos de la plataforma sin garant�a de conversi�n a dinero real.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-200 mb-2">L�mites del Sistema:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>M�ximo 500 CMPX ganables por usuario por mes</li>
                  <li>Un solo c�digo de referido por usuario nuevo</li>
                  <li>No se permiten auto-referidos ni cuentas m�ltiples</li>
                  <li>Funciones premium limitadas a disponibilidad de tokens</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-200 mb-2">Modificaciones del Sistema:</h4>
                <p className="text-sm">
                  ComplicesConecta se reserva el derecho de modificar, suspender o terminar 
                  el programa de tokens con 30 d�as de aviso previo.
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
              Responsabilidades y Limitaci�n de Responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Nuestra Responsabilidad:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Mantener el sistema de tokens funcionando de manera estable</li>
                  <li>Proteger la informaci�n de tokens seg�n nuestra pol�tica de privacidad</li>
                  <li>Procesar recompensas de referidos de manera justa y oportuna</li>
                  <li>Proporcionar soporte t�cnico para problemas leg�timos</li>
                  <li>Notificar cambios importantes con anticipaci�n</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Limitaci�n de Responsabilidad:</h4>
                <div className="bg-red-900/30 p-4 rounded-lg">
                  <p className="text-red-200 text-sm">
                    <strong>IMPORTANTE:</strong> ComplicesConecta no ser� responsable por:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2 ml-4 text-red-200">
                    <li>P�rdidas financieras derivadas del uso de tokens CMPX</li>
                    <li>Interrupciones temporales del servicio durante mantenimiento</li>
                    <li>Cambios en el valor o utilidad de los tokens</li>
                    <li>Decisiones de inversi�n basadas en la posesi�n de tokens</li>
                    <li>Problemas t�cnicos fuera de nuestro control</li>
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
                  <li>Crear m�ltiples cuentas para obtener tokens adicionales</li>
                  <li>Usar bots o automatizaci�n para generar referidos falsos</li>
                  <li>Intentar hackear o manipular el sistema de tokens</li>
                  <li>Vender o intercambiar CMPX fuera de la plataforma</li>
                  <li>Proporcionar informaci�n falsa para obtener tokens</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Sanciones Aplicables:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-yellow-200 text-sm">Primera Infracci�n</h5>
                    <p className="text-xs text-yellow-100 mt-1">Advertencia escrita y congelamiento temporal de tokens</p>
                  </div>
                  <div className="bg-orange-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-orange-200 text-sm">Segunda Infracci�n</h5>
                    <p className="text-xs text-orange-100 mt-1">P�rdida parcial de tokens y suspensi�n de funciones premium</p>
                  </div>
                  <div className="bg-red-900/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-red-200 text-sm">Tercera Infracci�n</h5>
                    <p className="text-xs text-red-100 mt-1">P�rdida total de tokens y exclusi�n permanente del programa</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transici�n a Producci�n */}
        <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-green-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-6 w-6 text-green-400" />
              Transici�n a Versi�n de Producci�n
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <p>
                Cuando ComplicesConecta lance la versi�n de producci�n con tokens GTK blockchain:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-200">Migraci�n de Tokens:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>CMPX se convertir�n autom�ticamente a GTK</li>
                    <li>Ratio de conversi�n ser� 1:1 inicialmente</li>
                    <li>Proceso gratuito para todos los usuarios beta</li>
                    <li>Notificaci�n 60 d�as antes de la migraci�n</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-200">Nuevas Funcionalidades:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Pagos reales con Stripe para funciones premium</li>
                    <li>Transferibilidad completa de tokens GTK</li>
                    <li>Nuevos t�rminos y condiciones actualizados</li>
                    <li>Valor de mercado real para los tokens</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-900/30 p-4 rounded-lg">
                <p className="text-green-200">
                  <strong>Garant�a:</strong> Todos los tokens CMPX ganados leg�timamente durante la beta 
                  ser�n honrados en la conversi�n a GTK sin p�rdida de valor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto y Resoluci�n de Disputas */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white">Contacto y Resoluci�n de Disputas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Soporte T�cnico:</h4>
                <div className="bg-purple-900/30 p-3 rounded-lg text-sm">
                  <p><strong>Email:</strong> tokens@complicesconecta.com</p>
                  <p><strong>Chat:</strong> Disponible 24/7 en la app</p>
                  <p><strong>Respuesta:</strong> M�ximo 24 horas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Disputas Legales:</h4>
                <div className="bg-purple-900/30 p-3 rounded-lg text-sm">
                  <p><strong>Jurisdicci�n:</strong> M�xico</p>
                  <p><strong>Ley aplicable:</strong> Legislaci�n mexicana</p>
                  <p><strong>Mediaci�n:</strong> Preferida antes de litigio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aceptaci�n */}
        <Card className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm border border-purple-400/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Aceptaci�n de T�rminos</h3>
            <p className="text-white/80 mb-6">
              Al usar el sistema de tokens CMPX/GTK, confirmas que has le�do, entendido y aceptado 
              estos t�rminos y condiciones en su totalidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/tokens-privacy')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Ver Pol�tica de Privacidad
              </Button>
              <Button
                onClick={() => navigate('/tokens-info')}
                className="border border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Volver a Informaci�n de Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
