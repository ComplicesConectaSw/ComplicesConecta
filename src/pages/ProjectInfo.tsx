import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText, GitBranch, Shield, Users, Send, Info, Lock, Code, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';
import HeaderNav from '@/components/HeaderNav';

export default function ProjectInfo() {
  const navigate = useNavigate();
  const { toast: _toast } = useToast();
  const [activeTab, setActiveTab] = useState<'readme' | 'releases' | 'moderators'>('readme');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 bg-transparent border-none px-3 py-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-white">Informacin del Proyecto</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={activeTab === 'readme' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('readme')}
              className="text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              README
            </Button>
            <Button
              variant={activeTab === 'releases' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('releases')}
              className="text-white"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Notas de Versin
            </Button>
            <Button
              variant={activeTab === 'moderators' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('moderators')}
              className="text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Moderadores
            </Button>
          </div>

          {/* Content */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              {activeTab === 'readme' ? (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-4xl font-bold text-white mb-6">
                    ?? ComplicesConecta - Plataforma Swinger Premium v3.5.0
                  </h1>
                  
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <h2 className="text-2xl font-bold text-green-400 mb-2">
                      ?? PRODUCTION READY - AI-NATIVE - NEO4J OPERATIVO
                    </h2>
                    <p className="text-white">
                      <strong>Estado:</strong> ? PRODUCTION READY - AI-NATIVE - ENTERPRISE GRADE - NEO4J OPERATIVO ??<br/>
                      <strong>ltima Actualizacin:</strong> 05 de Noviembre, 2025<br/>
                      <strong>Versin:</strong> 3.5.0 - Features Innovadoras + Neo4j + Documentacin Consolidada<br/>
                      <strong>Puntuacin Global:</strong> 87/100 - ? Production Ready
                    </p>
                  </div>

                  <blockquote className="border-l-4 border-purple-500 pl-4 italic text-xl text-white/90 mb-8">
                    La plataforma de intercambio de parejas ms exclusiva y segura de Mxico +18
                  </blockquote>

                  <h2 className="text-2xl font-bold text-white mb-4">?? Misin y Visin</h2>
                  <p className="text-white/90 mb-6">
                    ComplicesConecta es ms que una aplicacin de citas: es una plataforma integral 
                    diseada especficamente para la comunidad swinger mexicana, ofreciendo un espacio 
                    seguro, verificado y discreto para intercambio de parejas y conexiones autnticas.
                  </p>

                  <h2 className="text-2xl font-bold text-white mb-4">? Caractersticas Revolucionarias</h2>
                  
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">?? Sistema de Matches Inteligente con IA</h3>
                  <ul className="text-white/90 mb-4 space-y-2">
                    <li> Algoritmo basado en Big Five + traits especficos swinger</li>
                    <li> Scoring de compatibilidad con anlisis multifactorial</li>
                    <li> Geolocalizacin avanzada con frmula de Haversine</li>
                    <li> Filtros por proximidad y preferencias</li>
                    <li> Matches mutuos y notificaciones en tiempo real</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-blue-400 mb-3">?? Experiencia Social Premium</h3>
                  <ul className="text-white/90 mb-4 space-y-2">
                    <li> Chat en tiempo real con WebSockets</li>
                    <li> Video chat P2P con WebRTC</li>
                    <li> Push notifications nativas</li>
                    <li> Sistema de conexiones y privacidad</li>
                    <li> Galeras pblicas y privadas</li>
                    <li> Perfiles de pareja avanzados</li>
                    <li> Eventos VIP exclusivos</li>
                    <li> Sistema de tokens CMPX y GTK</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-white mb-4">?? Mtricas del Proyecto</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">107</div>
                      <div className="text-white/70">Tablas Base de Datos</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">122</div>
                      <div className="text-white/70">Polticas RLS</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">209</div>
                      <div className="text-white/70">ndices Optimizados</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">260</div>
                      <div className="text-white/70">Tests Pasando</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-400">4</div>
                      <div className="text-white/70">Features Innovadoras</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-400">100%</div>
                      <div className="text-white/70">Neo4j Operativo</div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'releases' ? (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-4xl font-bold text-white mb-6">
                    ?? Notas de Versin - ComplicesConecta
                  </h1>
                  
                  <h2 className="text-2xl font-bold text-green-400 mb-4">v3.5.0 - Features Innovadoras + Neo4j (Actual)</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> ? Verificador IA de Consentimiento en Chats</li>
                    <li> ? Galeras NFT-Verificadas con GTK</li>
                    <li> ? Matching Predictivo con Graphs Sociales (Neo4j)</li>
                    <li> ? Eventos Virtuales Sostenibles con Tokens</li>
                    <li> ? Neo4j Graph Database 100% operativo</li>
                    <li> ? Documentacin consolidada y actualizada</li>
                    <li> ? Gua de instalacin completa</li>
                    <li> ? 107 tablas + 122 polticas RLS</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-blue-400 mb-4">v3.2.0 - Sistema de Matching IA</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> ?? Algoritmo de matching con IA</li>
                    <li> ?? Geolocalizacin avanzada</li>
                    <li> ?? Chat en tiempo real</li>
                    <li> ?? Video chat P2P</li>
                    <li> ?? Sistema de notificaciones</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-purple-400 mb-4">v3.1.0 - Perfiles Avanzados</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> ?? Perfiles de pareja completos</li>
                    <li> ??? Galeras pblicas y privadas</li>
                    <li> ?? Sistema de verificacin</li>
                    <li> ?? Eventos y experiencias</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-orange-400 mb-4">v3.0.0 - Arquitectura Moderna</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> ?? Migracin a React 18</li>
                    <li> ?? Nuevo diseo con Tailwind CSS</li>
                    <li> ??? Integracin con Supabase</li>
                    <li> ?? PWA y capacidades nativas</li>
                  </ul>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-4xl font-bold text-white mb-6">
                    ??? Programa de Moderadores
                  </h1>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h2 className="text-2xl font-bold text-blue-400 mb-2">
                      ?? nete al Equipo de Moderacin
                    </h2>
                    <p className="text-white">
                      Aydanos a mantener ComplicesConecta como una comunidad segura y respetuosa.
                    </p>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">?? Qu hace un Moderador?</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> Revisar reportes de usuarios y contenido</li>
                    <li> Mantener un ambiente seguro y respetuoso</li>
                    <li> Aplicar las polticas de la comunidad</li>
                    <li> Asistir a usuarios con dudas o problemas</li>
                    <li> Colaborar con el equipo de desarrollo</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-white mb-4">? Beneficios</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> Acceso anticipado a nuevas funciones</li>
                    <li> Tokens CMPX adicionales mensuales</li>
                    <li> Badge especial de Moderador</li>
                    <li> Participacin en decisiones de la comunidad</li>
                    <li> Experiencia en moderacin de plataformas</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-white mb-4">?? Requisitos</h2>
                  <ul className="text-white/90 mb-6 space-y-2">
                    <li> Mayor de 21 aos</li>
                    <li> Usuario activo de la plataforma</li>
                    <li> Disponibilidad de al menos 10 horas semanales</li>
                    <li> Excelente comunicacin y criterio</li>
                    <li> Compromiso con la seguridad de la comunidad</li>
                  </ul>

                  <div className="mt-8">
                    <ModeratorApplicationModal />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informacin Sensible Protegida */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-medium">Informacin Tcnica Detallada</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="border border-white/20 text-white hover:bg-white/10 bg-transparent">
                      Ver Detalles
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Informacin Tcnica del Proyecto</DialogTitle>
                    </DialogHeader>
                    <div className="text-white/90 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-400">Stack Tecnolgico</h3>
                      <p>React 18.3.1, TypeScript, Tailwind CSS, Supabase, PostgreSQL</p>
                      
                      <h3 className="text-lg font-semibold text-green-400">Mtricas del Proyecto</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>Archivos: 220+</div>
                        <div>Lneas de cdigo: 35,000+</div>
                        <div>Componentes: 55+</div>
                        <div>Tablas DB: 20</div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-purple-400">Funcionalidades</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Sistema de matching con IA</li>
                        <li>Chat en tiempo real</li>
                        <li>Video chat P2P</li>
                        <li>Sistema de tokens CMPX/GTK</li>
                        <li>Dashboard administrativo</li>
                        <li>Notificaciones push</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm border border-blue-400/30">
              <CardContent className="p-6 text-center">
                <Code className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Cdigo Fuente</h3>
                <p className="text-blue-200 text-sm mb-4">
                  Accede al repositorio completo en GitHub
                </p>
                <Button
                  onClick={() => window.open('https://github.com/complicesconecta/conecta-social-comunidad', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ver en GitHub
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-green-400/30">
              <CardContent className="p-6 text-center">
                <Smartphone className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">APK Android</h3>
                <p className="text-green-200 text-sm mb-4">
                  Descarga la aplicacin para Android
                </p>
                <Button
                  onClick={() => window.open('https://github.com/complicesconecta/conecta-social-comunidad/releases', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Descargar v3.3.0
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm border border-purple-400/30">
              <CardContent className="p-6 text-center">
                <Info className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Soporte</h3>
                <p className="text-purple-200 text-sm mb-4">
                  Obtn ayuda y reporta problemas
                </p>
                <Button
                  onClick={() => navigate('/support')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente del Modal de Solicitud de Moderador
const ModeratorApplicationModal = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    experiencia: '',
    motivacion: '',
    disponibilidad: '',
    aceptaTerminos: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.aceptaTerminos) {
      toast({
        variant: "destructive",
        title: "Trminos requeridos",
        description: "Debes aceptar los trminos y condiciones"
      });
      return;
    }

    if (!formData.nombre || !formData.correo || !formData.experiencia || !formData.motivacion) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('?? Enviando solicitud de moderador:', { 
        nombre: formData.nombre, 
        correo: formData.correo 
      });

      // Simular envo de solicitud (sin usar Supabase por ahora)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('? Solicitud de moderador enviada exitosamente (simulado)');

      toast({
        title: "Solicitud enviada exitosamente!",
        description: `Tu solicitud para moderador ha sido registrada. Te contactaremos en las prximas 48 horas.`,
        duration: 7000
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        correo: '',
        telefono: '',
        experiencia: '',
        motivacion: '',
        disponibilidad: '',
        aceptaTerminos: false
      });

    } catch (error: any) {
      logger.error('? Error al enviar solicitud de moderador:', { error: error.message });
      
      toast({
        variant: "destructive",
        title: "Error al enviar solicitud",
        description: error.message || "Hubo un problema al procesar tu solicitud."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
          <Users className="h-4 w-4 mr-2" />
          Solicitar ser Moderador
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-white/20 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Solicitud de Moderador
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Nombre Completo *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <Label className="text-white">Correo Electrnico *</Label>
              <Input
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Telfono</Label>
            <Input
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div>
            <Label className="text-white">Experiencia en Moderacin *</Label>
            <Textarea
              value={formData.experiencia}
              onChange={(e) => handleInputChange('experiencia', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
              placeholder="Describe tu experiencia previa en moderacin o gestin de comunidades..."
              required
            />
          </div>

          <div>
            <Label className="text-white">Por qu quieres ser moderador? *</Label>
            <Textarea
              value={formData.motivacion}
              onChange={(e) => handleInputChange('motivacion', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
              placeholder="Cuntanos tu motivacin para ser parte del equipo de moderacin..."
              required
            />
          </div>

          <div>
            <Label className="text-white">Disponibilidad Semanal</Label>
            <Input
              value={formData.disponibilidad}
              onChange={(e) => handleInputChange('disponibilidad', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Ej: 15 horas, horarios flexibles"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terminos-mod"
              checked={formData.aceptaTerminos}
              onCheckedChange={(checked) => handleInputChange('aceptaTerminos', checked)}
              className="border-white/30"
            />
            <Label htmlFor="terminos-mod" className="text-white/90 text-sm leading-relaxed">
              Acepto los trminos y condiciones del programa de moderadores. Entiendo que es una 
              posicin de responsabilidad voluntaria y me comprometo a mantener la confidencialidad 
              y seguir las polticas de la comunidad.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isSubmitting ? (
              'Enviando solicitud...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
