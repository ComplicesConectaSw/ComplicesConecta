import React from 'react';
import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Users, 
  BookOpen,
  Gavel,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Globe,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

const Legal: React.FC = () => {
  const navigate = useNavigate();

  const legalDocuments = [
    {
      title: "Ley Olimpia - Protección contra Violencia Digital",
      description: "Marco legal mexicano que tipifica como delito la violencia digital y la difusión de contenido íntimo sin consentimiento. ComplicesConecta cumple estrictamente con esta normativa.",
      icon: <Shield className="h-6 w-6" />,
      file: "LEY_OLIMPIA.md",
      lastUpdated: "2025-11-09",
      category: "Protección Legal",
      priority: true,
      details: [
        "Artículo 259 Ter: Difusión de contenido íntimo sin consentimiento (3-6 años prisión)",
        "Artículo 259 Quáter: Acoso digital (1-3 años prisión)",
        "Artículo 259 Quinquies: Violación a la intimidad sexual (3-6 años prisión)",
        "Verificador IA de Consentimiento integrado en ComplicesConecta",
        "Canal de denuncias 24/7 disponible"
      ]
    },
    {
      title: "Cumplimiento Legal México",
      description: "Documentación completa del cumplimiento normativo específico para México, incluyendo protección de datos y normativas de contenido adulto.",
      icon: <Gavel className="h-6 w-6" />,
      file: "LEGAL_COMPLIANCE_MEXICO.md",
      lastUpdated: "2025-11-08",
      category: "Cumplimiento",
      details: [
        "Ley Federal de Protección de Datos Personales",
        "Normativas de contenido adulto",
        "Regulaciones de privacidad mexicanas",
        "Protocolos de verificación de edad",
        "Cumplimiento con autoridades locales"
      ]
    },
    {
      title: "Términos de Servicio",
      description: "Condiciones de uso completas de la plataforma ComplicesConecta, derechos y obligaciones de usuarios.",
      icon: <FileText className="h-6 w-6" />,
      file: "TERMS_OF_SERVICE.md",
      lastUpdated: "2025-11-08",
      category: "Términos",
      details: [
        "Condiciones de uso de la plataforma",
        "Derechos y obligaciones de usuarios",
        "Políticas de contenido y comportamiento",
        "Procedimientos de suspensión y cancelación",
        "Resolución de disputas"
      ]
    },
    {
      title: "Política de Privacidad",
      description: "Cómo protegemos, recopilamos y manejamos tu información personal. Cumplimiento con GDPR y normativas mexicanas.",
      icon: <Lock className="h-6 w-6" />,
      file: "PRIVACY_POLICY.md",
      lastUpdated: "2025-11-08",
      category: "Privacidad",
      details: [
        "Recopilación y uso de datos personales",
        "Derechos de los usuarios sobre sus datos",
        "Medidas de seguridad implementadas",
        "Compartición de datos con terceros",
        "Cumplimiento GDPR y normativas mexicanas"
      ]
    },
    {
      title: "Descargo de Responsabilidad",
      description: "Limitaciones de responsabilidad y descargos legales de la plataforma ComplicesConecta.",
      icon: <AlertTriangle className="h-6 w-6" />,
      file: "DISCLAIMER.md",
      lastUpdated: "2025-11-08",
      category: "Responsabilidad",
      details: [
        "Limitaciones de responsabilidad",
        "Uso bajo propio riesgo",
        "Responsabilidad de contenido de usuarios",
        "Limitaciones de garantías",
        "Jurisdicción y ley aplicable"
      ]
    },
    {
      title: "Documentación de API Legal",
      description: "Términos y condiciones específicos para el uso de la API de ComplicesConecta por desarrolladores y terceros.",
      icon: <Globe className="h-6 w-6" />,
      file: "API.md",
      lastUpdated: "2025-11-08",
      category: "Técnico",
      details: [
        "Términos de uso de API",
        "Limitaciones de acceso y uso",
        "Responsabilidades de desarrolladores",
        "Políticas de rate limiting",
        "Cumplimiento de seguridad"
      ]
    }
  ];

  const complianceAreas = [
    {
      title: "México",
      icon: <Shield className="h-8 w-8" />,
      items: [
        "✅ Ley Federal de Protección de Datos Personales",
        "✅ Ley Olimpia (protección contra violencia digital)",
        "✅ Normativas de contenido adulto",
        "✅ Regulaciones de privacidad",
        "✅ Verificación de edad obligatoria"
      ],
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Internacional",
      icon: <Globe className="h-8 w-8" />,
      items: [
        "✅ GDPR (Reglamento General de Protección de Datos)",
        "✅ Normativas de protección de datos internacionales",
        "✅ Estándares de seguridad globales",
        "✅ Protocolos de privacidad internacionales",
        "✅ Cumplimiento multi-jurisdiccional"
      ],
      color: "from-blue-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Background decorativo */}
      <DecorativeHearts count={8} />
      
      <HeaderNav />
      
      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold mb-4">
              ⚖️ MARCO LEGAL COMPLETO
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Documentación
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Legal</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              ComplicesConecta opera bajo estricto cumplimiento del marco legal mexicano e internacional, 
              con especial énfasis en la Ley Olimpia y protección contra violencia digital.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30 px-4 py-2 text-base">
                <Shield className="h-4 w-4 mr-2" />
                Ley Olimpia Compliant
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-base">
                <Lock className="h-4 w-4 mr-2" />
                GDPR Compliant
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-4 py-2 text-base">
                <Gavel className="h-4 w-4 mr-2" />
                México Legal
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/privacy')} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Lock className="w-5 h-5 mr-2" />
                Política de Privacidad
              </Button>
              <Button 
                onClick={() => navigate('/terms')} 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                Términos de Servicio
              </Button>
            </div>
          </motion.div>

          {/* Ley Olimpia Destacada */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <Card className="bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl border-red-400/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  Ley Olimpia - Protección contra Violencia Digital
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    ¿Qué es la Ley Olimpia?
                  </h4>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    La <strong>Ley Olimpia</strong> es una reforma legislativa mexicana vigente desde el 9 de noviembre de 2020 
                    que tipifica como delito la violencia digital, específicamente la difusión de contenido íntimo sin consentimiento. 
                    Es una ley federal que protege contra el acoso, la difusión no consensuada de imágenes íntimas, y la violencia en medios digitales.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-red-400/30">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-red-400" />
                      Artículo 259 Ter
                    </h5>
                    <p className="text-white/80 text-sm mb-2">Difusión de contenido íntimo sin consentimiento</p>
                    <p className="text-red-300 font-semibold text-sm">3-6 años de prisión</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-red-400/30">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      Artículo 259 Quáter
                    </h5>
                    <p className="text-white/80 text-sm mb-2">Acoso digital y hostigamiento</p>
                    <p className="text-red-300 font-semibold text-sm">1-3 años de prisión</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-red-400/30">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-red-400" />
                      Artículo 259 Quinquies
                    </h5>
                    <p className="text-white/80 text-sm mb-2">Violación a la intimidad sexual</p>
                    <p className="text-red-300 font-semibold text-sm">3-6 años de prisión</p>
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-6 border border-green-400/30">
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Cumplimiento en ComplicesConecta
                  </h4>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Verificador IA de Consentimiento:</strong> Sistema automático que detecta y previene contenido no consensuado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Canal de denuncias 24/7:</strong> Reportes inmediatos y respuesta en menos de 2 horas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Protocolo de actuación:</strong> Procedimientos claros para casos de violencia digital</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Cooperación con autoridades:</strong> Colaboración directa con fiscalías especializadas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Documentos Legales */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Documentación Legal Completa
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              Accede a toda nuestra documentación legal, términos y políticas actualizadas
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {legalDocuments.map((doc, index) => (
                <motion.div
                  key={doc.file}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors h-full ${doc.priority ? 'ring-2 ring-red-400/50' : ''}`}>
                    {doc.priority && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-red-500 text-white">
                          Prioritario
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-white flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${doc.priority ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white flex-shrink-0`}>
                          {doc.icon}
                        </div>
                        <div>
                          <div>{doc.title}</div>
                          <Badge className="bg-white/20 text-white/80 text-xs mt-1">
                            {doc.category}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {doc.description}
                      </p>
                      
                      {doc.details && (
                        <div className="space-y-2">
                          <h5 className="text-white font-semibold text-sm">Incluye:</h5>
                          <ul className="space-y-1">
                            {doc.details.slice(0, 3).map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-white/70 text-xs">
                                <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                            {doc.details.length > 3 && (
                              <li className="text-white/60 text-xs">
                                +{doc.details.length - 3} elementos más...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.lastUpdated}
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => window.open(`/docs/legal/${doc.file}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Documento
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Áreas de Cumplimiento */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Cumplimiento Legal
            </h2>
            <p className="text-lg text-white/70 text-center mb-12 max-w-2xl mx-auto">
              ComplicesConecta cumple con las normativas legales más estrictas a nivel nacional e internacional
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {complianceAreas.map((area, index) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 h-full">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${area.color} text-white`}>
                          {area.icon}
                        </div>
                        {area.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {area.items.map((item, idx) => (
                          <li key={idx} className="text-white/90 flex items-start gap-2">
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Información Importante */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-red-600/20 backdrop-blur-xl border-orange-400/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <Info className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Información Importante
                </h2>
                <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Esta documentación legal es de carácter informativo y no constituye asesoría legal. 
                  Para asuntos legales específicos, consulta con un abogado calificado.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    onClick={() => window.open('mailto:legal@complicesconecta.com')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Contactar Legal
                  </Button>
                  <Button 
                    onClick={() => navigate('/support')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Centro de Ayuda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
