import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Scale, 
  AlertTriangle, 
  Users, 
  Lock,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Gavel,
  Download,
  Eye,
  Calendar,
  ArrowLeft,
  Heart
} from 'lucide-react';

const Legal: React.FC = () => {
  const navigate = useNavigate();

  const legalDocuments = [
    {
      title: "Términos de Servicio",
      description: "Condiciones de uso de la plataforma ComplicesConecta",
      icon: <Gavel className="h-6 w-6" />,
      file: "TERMS_OF_SERVICE.md",
      lastUpdated: "2025-09-23",
      category: "Términos"
    },
    {
      title: "Política de Privacidad", 
      description: "Cómo protegemos y manejamos tu información personal",
      icon: <Shield className="h-6 w-6" />,
      file: "PRIVACY_POLICY.md",
      lastUpdated: "2025-09-23",
      category: "Privacidad"
    },
    {
      title: "Cumplimiento Legal México",
      description: "Marco regulatorio y cumplimiento en territorio mexicano",
      icon: <Scale className="h-6 w-6" />,
      file: "LEGAL_COMPLIANCE_MEXICO.md", 
      lastUpdated: "2025-09-23",
      category: "Cumplimiento"
    },
    {
      title: "Descargo de Responsabilidad",
      description: "Limitaciones y exclusiones de responsabilidad",
      icon: <AlertTriangle className="h-6 w-6" />,
      file: "DISCLAIMER.md",
      lastUpdated: "2025-09-23", 
      category: "Legal"
    },
    {
      title: "Auditoría de Seguridad",
      description: "Resumen de medidas de seguridad implementadas",
      icon: <Lock className="h-6 w-6" />,
      file: "SECURITY_AUDIT_OVERVIEW.md",
      lastUpdated: "2025-09-23",
      category: "Seguridad"
    },
    {
      title: "Guía de Contribución",
      description: "Cómo contribuir al desarrollo de la plataforma",
      icon: <Users className="h-6 w-6" />,
      file: "CONTRIBUTING.md",
      lastUpdated: "2025-09-23",
      category: "Desarrollo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <Header />
      
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Regresar</span>
          </Button>
          
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Marco Legal
          </h1>
          
          <div className="w-20" />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Introducción */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5" />
              Información Legal de ComplicesConecta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/90 leading-relaxed">
              ComplicesConecta opera bajo estricto cumplimiento del marco legal mexicano e internacional. 
              Esta sección proporciona información transparente sobre nuestras obligaciones legales, 
              derechos de los usuarios y políticas de cumplimiento.
            </p>
          </CardContent>
        </Card>

        {/* Cumplimiento Legal */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Cumplimiento Normativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-pink-300">Legislación Mexicana</h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• Ley Federal de Protección de Datos Personales (LFPDPPP)</li>
                  <li>• Código Civil Federal</li>
                  <li>• Ley Federal del Consumidor</li>
                  <li>• Ley de Instituciones de Crédito</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-300">Normativas Internacionales</h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• GDPR (Reglamento General de Protección de Datos)</li>
                  <li>• CCPA (California Consumer Privacy Act)</li>
                  <li>• SOX (Sarbanes-Oxley Act)</li>
                  <li>• ISO 27001 (Seguridad de la Información)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Derechos de los Usuarios */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Derechos de los Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                  Derechos ARCO
                </Badge>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li><strong>Acceso:</strong> Conocer qué datos personales tenemos</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                  <li><strong>Cancelación:</strong> Eliminar datos cuando no sean necesarios</li>
                  <li><strong>Oposición:</strong> Oponerse al tratamiento de datos</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  Derechos Adicionales
                </Badge>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li><strong>Portabilidad:</strong> Transferir datos a otro servicio</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento</li>
                  <li><strong>Transparencia:</strong> Información clara sobre el uso</li>
                  <li><strong>Consentimiento:</strong> Control sobre el uso de datos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsabilidades Legales */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5" />
              Responsabilidades y Limitaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <h3 className="font-semibold text-yellow-300 mb-2">Uso Responsable</h3>
                <p className="text-white/80 text-sm">
                  Los usuarios son responsables del uso apropiado de la plataforma, incluyendo 
                  el respeto hacia otros usuarios y el cumplimiento de las normas comunitarias.
                </p>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                <h3 className="font-semibold text-red-300 mb-2">Limitaciones de Responsabilidad</h3>
                <p className="text-white/80 text-sm">
                  ComplicesConecta no se hace responsable por las interacciones entre usuarios 
                  fuera de la plataforma. Los encuentros presenciales son bajo responsabilidad 
                  exclusiva de los participantes.
                </p>
              </div>
              
              <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <h3 className="font-semibold text-purple-300 mb-2">Contenido del Usuario</h3>
                <p className="text-white/80 text-sm">
                  Los usuarios mantienen la propiedad de su contenido pero otorgan a ComplicesConecta 
                  una licencia para usar, mostrar y distribuir dicho contenido dentro de la plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos Legales Disponibles */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5" />
              Documentos Legales Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalDocuments.map((doc, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/10 rounded-lg text-white">
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/80 text-xs mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.lastUpdated}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(`/legal/${doc.file}`, '_blank')}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs"
                        size="sm"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/legal/${doc.file}`;
                          link.download = doc.file;
                          link.click();
                        }}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 text-xs"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contacto Legal */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-5 w-5" />
              Contacto Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-pink-300">Departamento Legal</h3>
                <p className="text-white/80 text-sm">legal@complicesconecta.com</p>
                <p className="text-white/80 text-sm">+52 55 1234-5678</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-300">Oficial de Protección de Datos</h3>
                <p className="text-white/80 text-sm">dpo@complicesconecta.com</p>
                <p className="text-white/80 text-sm">Tiempo de respuesta: 72 horas</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/30 rounded-lg">
              <p className="text-white/90 text-sm text-center">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => navigate('/terms')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Términos y Condiciones
          </Button>
          
          <Button
            onClick={() => navigate('/privacy')}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Política de Privacidad
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Legal;
