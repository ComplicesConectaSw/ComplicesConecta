import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { ArrowLeft, Scale, AlertTriangle, Shield, FileText, Gavel, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import HeaderNav from '@/components/HeaderNav';

export default function TokensLegal() {
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
            
            <h1 className="text-xl font-bold text-white">Responsabilidad Legal - Tokens</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Responsabilidad Legal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Sistema de Tokens CMPX/GTK
            </span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Informacin importante sobre responsabilidades legales, limitaciones y consideraciones 
            regulatorias del programa de tokens.
          </p>
        </div>

        {/* Aviso Legal Principal */}
        <Card className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-purple-300" />
              Aviso Legal Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="bg-purple-900/50 p-4 rounded-lg border border-purple-400/30">
              <h4 className="font-bold text-purple-200 mb-3">DESCARGO DE RESPONSABILIDAD</h4>
              <p className="text-purple-100 mb-3">
                Los tokens CMPX son crditos digitales internos SIN VALOR MONETARIO REAL durante la fase beta. 
                ComplicesConecta no garantiza ningn valor econmico presente o futuro de estos tokens.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                <li>NO son instrumentos financieros regulados</li>
                <li>NO constituyen inversin ni activos digitales</li>
                <li>NO tienen garanta de conversin a dinero real</li>
                <li>Su valor puede cambiar o eliminarse sin previo aviso</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Marco Regulatorio */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gavel className="h-6 w-6 text-blue-400" />
              Marco Regulatorio y Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Jurisdiccin Aplicable:</h4>
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <ul className="space-y-2 text-sm">
                    <li><strong className="text-purple-200">Pas:</strong> <span className="text-purple-100">Estados Unidos Mexicanos</span></li>
                    <li><strong className="text-purple-200">Legislacin:</strong> <span className="text-purple-100">Ley Federal de Proteccin de Datos Personales</span></li>
                    <li><strong className="text-purple-200">Regulador:</strong> <span className="text-purple-100">CONDUSEF (servicios financieros)</span></li>
                    <li><strong className="text-purple-200">Tribunales:</strong> <span className="text-purple-100">Federales de Mxico</span></li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Cumplimiento Normativo:</h4>
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <ul className="space-y-2 text-sm">
                    <li><strong className="text-purple-200">KYC:</strong> <span className="text-purple-100">Verificacin de identidad requerida</span></li>
                    <li><strong className="text-purple-200">AML:</strong> <span className="text-purple-100">Monitoreo anti-lavado de dinero</span></li>
                    <li><strong className="text-purple-200">Reportes:</strong> <span className="text-purple-100">Transacciones sospechosas a autoridades</span></li>
                    <li><strong className="text-purple-200">Auditoras:</strong> <span className="text-purple-100">Revisiones peridicas del sistema</span></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
              <p className="text-blue-200">
                <strong>Nota:</strong> <span className="text-blue-100">El marco regulatorio puede cambiar. ComplicesConecta se compromete 
                a cumplir con todas las regulaciones aplicables y notificar cambios importantes.</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitaciones de Responsabilidad */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-400" />
              Limitaciones de Responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-white/80">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">ComplicesConecta NO ser responsable por:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <h5 className="font-semibold text-purple-200 mb-2">Prdidas Econmicas:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                    <li>Prdida de valor de tokens CMPX</li>
                    <li>Oportunidades de inversin perdidas</li>
                    <li>Gastos incurridos por uso del sistema</li>
                    <li>Daos indirectos o consecuenciales</li>
                  </ul>
                </div>
                
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <h5 className="font-semibold text-purple-200 mb-2">Problemas Tcnicos:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                    <li>Interrupciones del servicio</li>
                    <li>Errores en el sistema de tokens</li>
                    <li>Prdida de datos por fallas tcnicas</li>
                    <li>Problemas de conectividad</li>
                  </ul>
                </div>
                
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <h5 className="font-semibold text-purple-200 mb-2">Acciones de Terceros:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                    <li>Hackeos o ataques cibernticos</li>
                    <li>Fraudes por parte de usuarios</li>
                    <li>Cambios regulatorios gubernamentales</li>
                    <li>Problemas con proveedores externos</li>
                  </ul>
                </div>
                
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <h5 className="font-semibold text-purple-200 mb-2">Decisiones del Usuario:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                    <li>Mal uso del sistema de referidos</li>
                    <li>Compartir credenciales de acceso</li>
                    <li>Violacin de trminos de uso</li>
                    <li>Decisiones basadas en tokens</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
              <p className="text-blue-200">
                <strong>Lmite Mximo de Responsabilidad:</strong> <span className="text-blue-100">En ningn caso la responsabilidad total 
                de ComplicesConecta exceder el equivalente a $100 USD por usuario afectado.</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consideraciones Fiscales */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-400" />
              Consideraciones Fiscales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                <h4 className="font-semibold text-purple-200 mb-2">Responsabilidades del Usuario:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-purple-100">
                  <li>Consultar con un asesor fiscal sobre implicaciones tributarias</li>
                  <li>Declarar beneficios obtenidos segn legislacin local</li>
                  <li>Mantener registros de transacciones para efectos fiscales</li>
                  <li>Cumplir con obligaciones fiscales en su jurisdiccin</li>
                </ul>
              </div>
              
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
                <h4 className="font-semibold text-blue-200 mb-2">Posicin de ComplicesConecta:</h4>
                <p className="text-blue-100 text-sm">
                  ComplicesConecta NO proporciona asesoramiento fiscal ni garantiza el tratamiento 
                  tributario de los tokens. Los usuarios son responsables de cumplir con sus 
                  obligaciones fiscales locales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolucin de Disputas */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-orange-400" />
              Resolucin de Disputas y Procedimientos Legales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-white/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Proceso de Resolucin:</h4>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-400/20">
                    <h5 className="font-semibold text-purple-200 text-sm">1. Contacto Directo</h5>
                    <p className="text-xs text-purple-100 mt-1">
                      Comunicacin directa con soporte tcnico (24-48 horas)
                    </p>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-400/20">
                    <h5 className="font-semibold text-purple-200 text-sm">2. Mediacin</h5>
                    <p className="text-xs text-purple-100 mt-1">
                      Proceso de mediacin con tercero neutral (30 das)
                    </p>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-400/20">
                    <h5 className="font-semibold text-purple-200 text-sm">3. Arbitraje</h5>
                    <p className="text-xs text-purple-100 mt-1">
                      Arbitraje vinculante segn reglas de CANACO (90 das)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Informacin Legal:</h4>
                <div className="bg-purple-900/30 p-4 rounded-lg text-sm border border-purple-400/20">
                  <p><strong className="text-purple-200">Empresa:</strong> <span className="text-purple-100">ComplicesConecta S.A. de C.V.</span></p>
                  <p><strong className="text-purple-200">RFC:</strong> <span className="text-purple-100">CCO240901ABC</span></p>
                  <p><strong className="text-purple-200">Domicilio:</strong> <span className="text-purple-100">Ciudad de Mxico, Mxico</span></p>
                  <p><strong className="text-purple-200">Representante Legal:</strong> <span className="text-purple-100">Ing. Juan Carlos Mndez Nataren</span></p>
                  <p><strong className="text-purple-200">Email Legal:</strong> <span className="text-purple-100">legal@complicesconecta.com</span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
              <h4 className="font-semibold text-blue-200 mb-2">Derechos del Usuario:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-100">
                <li>Derecho a la informacin clara y transparente</li>
                <li>Derecho a la proteccin de datos personales</li>
                <li>Derecho a la resolucin justa de disputas</li>
                <li>Derecho a cancelar la participacin en cualquier momento</li>
                <li>Derecho a recibir soporte tcnico adecuado</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cambios y Actualizaciones */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-6 w-6 text-cyan-400" />
              Cambios y Actualizaciones Legales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Procedimiento para Cambios:</h4>
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <ul className="list-disc list-inside space-y-2 text-sm text-purple-100">
                    <li><strong className="text-purple-200">Cambios Menores:</strong> Notificacin por email con 7 das de anticipacin</li>
                    <li><strong className="text-purple-200">Cambios Importantes:</strong> Notificacin con 30 das de anticipacin</li>
                    <li><strong className="text-purple-200">Cambios Crticos:</strong> Consentimiento explcito requerido</li>
                    <li><strong className="text-purple-200">Emergencias:</strong> Implementacin inmediata con notificacin posterior</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Historial de Versiones:</h4>
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-400/20">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-200 font-semibold">Versin 1.0</span>
                      <span className="text-purple-100">3 de septiembre de 2025</span>
                    </div>
                    <p className="text-purple-100">Versin inicial para fase beta</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto Legal */}
        <Card className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm border border-purple-400/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Contacto Legal</h3>
            <p className="text-white/80 mb-6">
              Para consultas legales, disputas o asuntos regulatorios relacionados con el sistema de tokens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-200 mb-2">Departamento Legal</h4>
                <p className="text-sm text-purple-100">legal@complicesconecta.com</p>
                <p className="text-sm text-purple-100">+52 55 1234 5678</p>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-200 mb-2">Cumplimiento</h4>
                <p className="text-sm text-purple-100">compliance@complicesconecta.com</p>
                <p className="text-sm text-purple-100">Horario: L-V 9:00-18:00</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/tokens-terms')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Trminos y Condiciones
              </Button>
              <Button
                onClick={() => navigate('/tokens-info')}
                className="border-white/20 text-white hover:bg-white/10 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                Volver a Informacin de Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
