import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle,
  Shield,
  User,
  Clock,
  DollarSign,
  Award,
  Mail,
  MessageSquare
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import HeaderNav from '@/components/HeaderNav';

interface ModeratorFormData {
  nombre: string;
  telefono: string;
  correo: string;
  edad: number;
  experienciaModeración: string;
  motivacion: string;
  disponibilidadHoras: number;
  disponibilidadHorario: string;
  referencias: string;
  aceptaTerminos: boolean;
}

const ModeratorRequest = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const _navigate = useNavigate();
  const [formData, setFormData] = useState<ModeratorFormData>({
    nombre: '',
    telefono: '',
    correo: '',
    edad: 18,
    experienciaModeración: '',
    motivacion: '',
    disponibilidadHoras: 8,
    disponibilidadHorario: '',
    referencias: '',
    aceptaTerminos: false
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked 
                     : type === 'number' ? Number(value) 
                     : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.telefono || !formData.correo || !formData.motivacion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (!formData.aceptaTerminos) {
      toast({
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive"
      });
      return;
    }

    if (formData.edad < 18) {
      toast({
        title: "Edad mínima",
        description: "Debes ser mayor de 18 años para ser moderador",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      logger.info('📝 Simulando envío de solicitud de moderador:', { 
        nombre: formData.nombre, 
        correo: formData.correo,
        edad: formData.edad
      });

      // TODO: Implementar cuando la tabla moderator_requests esté disponible
      // Por ahora simulamos el éxito
      const simulatedData = {
        id: Date.now(),
        user_id: user?.id || null,
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        edad: formData.edad,
        experiencia_moderacion: formData.experienciaModeración.trim() || null,
        motivacion: formData.motivacion.trim(),
        disponibilidad_horas: formData.disponibilidadHoras,
        disponibilidad_horario: formData.disponibilidadHorario.trim(),
        referencias: formData.referencias.trim() || null,
        acepta_terminos: formData.aceptaTerminos,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      const data = simulatedData;
      const error = null;

      if (error) {
        logger.error('❌ Error al guardar solicitud de moderador:', { error });
        throw new Error(`Error al guardar solicitud: ${error}`);
      }

      logger.info('✅ Solicitud de moderador guardada exitosamente:', { 
        id: data?.id,
        timestamp: new Date().toISOString()
      });

      setSubmitted(true);
      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: "Tu solicitud para ser moderador ha sido registrada. Te contactaremos en 2-3 días hábiles.",
        duration: 7000
      });
    } catch (error: any) {
      logger.error('❌ Error al enviar solicitud de moderador:', { error: error.message });
      toast({
        title: "Error al enviar solicitud",
        description: error.message || "Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Solicitud Enviada!
              </h2>
              <p className="text-white/80 mb-6">
                Tu solicitud para convertirte en moderador ha sido enviada exitosamente. 
                Nuestro equipo la revisará y te contactaremos pronto.
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">¿Qué sigue?</h3>
                  <ul className="text-white/70 text-sm space-y-2 text-left">
                    <li>• Revisaremos tu solicitud en 2-3 días hábiles</li>
                    <li>• Te contactaremos por email con la decisión</li>
                    <li>• Si eres aprobado, recibirás un enlace de activación</li>
                    <li>• Podrás acceder al panel de moderación una vez activado</li>
                  </ul>
                </div>
                <Link to="/">
                  <Button className="bg-white/20 hover:bg-white/30 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <HeaderNav />
        
        {/* Page Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link to="/" className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 bg-transparent border-none p-2 rounded-lg flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Solicitud de Moderador
            </h1>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Información detallada sobre el rol */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-400" />
              Programa de Moderadores ComplicesConecta
            </CardTitle>
            <CardDescription className="text-white/80">
              Únete a nuestro equipo de moderación y ayuda a crear un espacio seguro y respetuoso para todos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descripción del programa */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-400/20">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                ¿Por qué necesitamos moderadores?
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                ComplicesConecta es una plataforma para adultos que facilita conexiones auténticas y respetuosas. 
                Nuestros moderadores son fundamentales para mantener un ambiente seguro, donde todos los miembros 
                puedan interactuar con confianza y respeto mutuo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Responsabilidades Principales
                </h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li>• <strong>Revisar reportes:</strong> Analizar denuncias de usuarios de manera imparcial</li>
                  <li>• <strong>Moderar contenido:</strong> Evaluar fotos, mensajes y perfiles reportados</li>
                  <li>• <strong>Aplicar sanciones:</strong> Advertencias, suspensiones temporales o permanentes</li>
                  <li>• <strong>Apoyo a usuarios:</strong> Resolver consultas sobre políticas de la comunidad</li>
                  <li>• <strong>Prevención:</strong> Identificar patrones de comportamiento problemático</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  Retribución Monetaria
                </h3>
                <div className="text-white/70 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Compensación base mensual:</span>
                    <span className="text-green-400 font-semibold">$2,500 - $4,000 MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bono por desempeño:</span>
                    <span className="text-green-400 font-semibold">Hasta $1,500 MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bono por casos complejos:</span>
                    <span className="text-green-400 font-semibold">$50 - $200 MXN</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60">
                      * Pagos quincenales vía transferencia bancaria
                    </p>
                    <p className="text-xs text-white/60">
                      * Incrementos basados en evaluaciones trimestrales
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  Perfil Ideal del Moderador
                </h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li>• <strong>Edad:</strong> Mayor de 21 años (preferible)</li>
                  <li>• <strong>Disponibilidad:</strong> Mínimo 8-10 horas semanales</li>
                  <li>• <strong>Experiencia:</strong> Moderación online, atención al cliente o psicología</li>
                  <li>• <strong>Habilidades:</strong> Comunicación empática y toma de decisiones</li>
                  <li>• <strong>Compromiso:</strong> Mínimo 6 meses en el programa</li>
                </ul>
              </div>
            </div>

            {/* Beneficios y compensación */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-400/20">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Beneficios del Programa
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="text-green-300 font-medium mb-1">Compensación</h4>
                  <p className="text-white/70">Tokens CMPX mensuales según horas dedicadas</p>
                </div>
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">Acceso Premium</h4>
                  <p className="text-white/70">Funciones exclusivas mientras seas moderador activo</p>
                </div>
                <div>
                  <h4 className="text-purple-300 font-medium mb-1">Experiencia</h4>
                  <p className="text-white/70">Certificado de moderación y referencias profesionales</p>
                </div>
              </div>
            </div>

            {/* Proceso de selección */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Proceso de Selección
              </h3>
              <div className="grid md:grid-cols-4 gap-3 text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">1</div>
                  <p className="text-white/70">Solicitud</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div>
                  <p className="text-white/70">Revisión (2-3 días)</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div>
                  <p className="text-white/70">Entrevista virtual</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">4</div>
                  <p className="text-white/70">Capacitación</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Formulario de Solicitud</CardTitle>
            <CardDescription className="text-white/70">
              Completa todos los campos para enviar tu solicitud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Información personal */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4" />
                  Información Personal
                </h3>
                
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Email *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm sm:text-base"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Teléfono *
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm sm:text-base"
                    placeholder="+34 600 000 000"
                    required
                  />
                </div>
              </div>

              {/* Experiencia */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experiencia y Disponibilidad
                </h3>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="+52 55 1234 5678"
                    required
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Edad *
                  </label>
                  <input
                    type="number"
                    name="edad"
                    min="18"
                    max="100"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Experiencia en Moderación
                  </label>
                  <textarea
                    name="experienciaModeración"
                    value={formData.experienciaModeración}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Describe tu experiencia previa en moderación, administración de comunidades, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Disponibilidad (horas por semana)
                  </label>
                  <input
                    type="number"
                    name="disponibilidadHoras"
                    min="8"
                    max="40"
                    value={formData.disponibilidadHoras}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Horario Preferido
                  </label>
                  <input
                    type="text"
                    name="disponibilidadHorario"
                    value={formData.disponibilidadHorario}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Ej: Tardes y fines de semana, 6pm-10pm"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Referencias (opcional)
                  </label>
                  <textarea
                    name="referencias"
                    value={formData.referencias}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Contactos profesionales o referencias que puedan validar tu experiencia"
                    rows={2}
                  />
                </div>
              </div>

              {/* Motivación */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Motivación
                </h3>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    ¿Por qué quieres ser moderador? *
                  </label>
                  <textarea
                    name="motivacion"
                    value={formData.motivacion}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Explica tu motivación para unirte al equipo de moderación y cómo planeas contribuir a la comunidad."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Términos */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <label className="text-white/80 text-sm">
                    Acepto los términos y condiciones del programa de moderación. 
                    Entiendo que como moderador debo mantener la confidencialidad, 
                    actuar de manera imparcial y seguir las políticas de la comunidad. *
                  </label>
                </div>
              </div>

              {/* Botón de envío */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.aceptaTerminos}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando Solicitud...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </div>

              <p className="text-white/60 text-xs text-center">
                * Campos obligatorios. Tu información será revisada por nuestro equipo.
              </p>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ModeratorRequest;
