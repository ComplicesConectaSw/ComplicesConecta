import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import HeaderNav from '@/components/HeaderNav';

export default function TokensPrivacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      <HeaderNav />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-blue-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <AnimatedButton
              onClick={() => navigate('/tokens')}
              className="text-white hover:bg-white/10 btn-accessible bg-transparent border-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="truncate">Regresar</span>
            </AnimatedButton>
            
            <h1 className="text-xl font-bold text-white">Política de Privacidad - Tokens</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Política de Privacidad
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Sistema de Tokens CMPX/GTK
            </span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Tu privacidad y seguridad son nuestra prioridad. Conoce cómo protegemos tu información en nuestro sistema de tokens.
          </p>
        </div>

        {/* Información General */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p><strong className="text-white">Última actualización:</strong> 3 de septiembre de 2025</p>
            <p><strong className="text-white">Vigencia:</strong> Esta política aplica durante la fase beta y se actualizará para la versión de producción.</p>
            <p>
              Esta política describe cómo ComplicesConecta recopila, usa y protege la información relacionada 
              con nuestro sistema de tokens CMPX/GTK durante la fase beta.
            </p>
          </CardContent>
        </Card>

        {/* Datos Recopilados */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-6 w-6 text-green-400" />
              Datos que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Información de Tokens:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Balance actual de tokens CMPX</li>
                <li>Historial de transacciones y recompensas</li>
                <li>Códigos de referido generados y utilizados</li>
                <li>Límites mensuales y fechas de reset</li>
                <li>Compras de funciones premium con tokens</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Información de Referidos:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Relaciones de referido entre usuarios</li>
                <li>Fechas y montos de recompensas otorgadas</li>
                <li>Estadísticas de referidos exitosos</li>
              </ul>
            </div>

            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-blue-200">
                <strong>Importante:</strong> NO recopilamos información financiera personal como números de tarjeta 
                o cuentas bancarias durante la fase beta, ya que el sistema funciona únicamente con tokens internos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uso de la Información */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-6 w-6 text-purple-400" />
              Uso de la Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p>Utilizamos la información de tokens para:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Operación del Sistema:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Procesar recompensas por referidos</li>
                  <li>Mantener balances actualizados</li>
                  <li>Aplicar límites mensuales</li>
                  <li>Prevenir fraudes y abusos</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Mejora del Servicio:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Análisis de uso y estadísticas</li>
                  <li>Optimización del sistema</li>
                  <li>Desarrollo de nuevas funciones</li>
                  <li>Soporte técnico personalizado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-400" />
              Medidas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Protección de Datos:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Encriptación de datos en tránsito y reposo</li>
                  <li>Acceso restringido a información sensible</li>
                  <li>Auditorías regulares de seguridad</li>
                  <li>Respaldos seguros y redundantes</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Prevención de Fraudes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Validación automática de transacciones</li>
                  <li>Monitoreo de patrones sospechosos</li>
                  <li>Límites de seguridad automáticos</li>
                  <li>Registro completo de actividades</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Derechos del Usuario */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-400" />
              Tus Derechos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p>Como usuario del sistema de tokens, tienes derecho a:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong className="text-white">Acceso:</strong> Ver tu historial completo de tokens</li>
                <li><strong className="text-white">Rectificación:</strong> Corregir información incorrecta</li>
                <li><strong className="text-white">Eliminación:</strong> Solicitar borrado de datos</li>
                <li><strong className="text-white">Portabilidad:</strong> Exportar tu información</li>
              </ul>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong className="text-white">Oposición:</strong> Rechazar ciertos usos de datos</li>
                <li><strong className="text-white">Limitación:</strong> Restringir el procesamiento</li>
                <li><strong className="text-white">Transparencia:</strong> Información clara sobre el uso</li>
                <li><strong className="text-white">Soporte:</strong> Asistencia con tus datos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Fase Beta */}
        <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 backdrop-blur-sm border border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              Consideraciones Especiales - Fase Beta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-3">
              <p><strong className="text-orange-200">Sistema en Desarrollo:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Los tokens CMPX son internos y no tienen valor monetario real</li>
                <li>El sistema puede experimentar cambios y actualizaciones</li>
                <li>Los datos se migrarán al sistema de producción</li>
                <li>Algunas funciones pueden estar limitadas o en prueba</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <p><strong className="text-orange-200">Transición a Producción:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Los CMPX se convertirán en tokens GTK blockchain</li>
                <li>Se implementarán pagos reales con Stripe</li>
                <li>Esta política se actualizará con nuevos términos</li>
                <li>Se notificará a todos los usuarios sobre cambios</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white">Contacto y Soporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p>Para consultas sobre esta política de privacidad o el manejo de tus datos:</p>
            <div className="bg-purple-900/30 p-4 rounded-lg space-y-2">
              <p><strong className="text-white">Email:</strong> privacy@complicesconecta.com</p>
              <p><strong className="text-white">Soporte:</strong> Disponible 24/7 en la aplicación</p>
              <p><strong className="text-white">Tiempo de respuesta:</strong> Máximo 48 horas</p>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/tokens-terms')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Términos de Uso
            </Button>
            <Button
              onClick={() => navigate('/tokens-info')}
              className="border border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              Volver a Información de Tokens
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
