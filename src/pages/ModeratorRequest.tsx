import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import AdminNav from '@/components/AdminNav';
import { 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  Mail, 
  Shield, 
  User, 
  Clock, 
  DollarSign,
  MessageSquare
} from "lucide-react";
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';
import { validateModeratorRequest } from '@/lib/validations/moderator';

interface FormData {
  fullName: string;
  email: string;
  experience: string;
  motivation: string;
  availability: string;
  previousModeration: string;
  agreeToTerms: boolean;
}

const ModeratorRequest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    experience: '',
    motivation: '',
    availability: '',
    previousModeration: '',
    agreeToTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar datos con Zod
    const validation = validateModeratorRequest(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({
        title: "Error de validacin",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Verificar si ya existe una solicitud pendiente para este email
      const { data: existingRequest, error: _checkError } = await (supabase as any)
        .from('moderator_requests')
        .select('*')
        .eq('email', formData.email)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast({
          title: "Solicitud duplicada",
          description: "Ya tienes una solicitud pendiente. Por favor espera la respuesta del equipo.",
          variant: "destructive"
        });
        return;
      }

      // Crear nueva solicitud
      const { error } = await (supabase as any)
        .from('moderator_requests')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          experience: formData.experience,
          motivation: formData.motivation,
          availability: formData.availability,
          previous_moderation: formData.previousModeration,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "xito!",
        description: "Solicitud enviada exitosamente"
      });
    } catch (error) {
      console.error('Error submitting moderator request:', error);
      toast({
        title: "Error",
        description: "Error al enviar la solicitud. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient">
        <AdminNav userRole="moderator" />
        <div className="max-w-2xl mx-auto p-6 pt-24">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Solicitud Enviada!
              </h2>
              <p className="text-white/80 mb-6">
                Tu solicitud para convertirte en moderador ha sido enviada exitosamente. 
                Nuestro equipo la revisar y te contactaremos pronto.
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Qu sigue?</h3>
                  <ul className="text-white/70 text-sm space-y-2 text-left">
                    <li> Revisaremos tu solicitud en 2-3 das hbiles</li>
                    <li> Te contactaremos por email con la decisin</li>
                    <li> Si eres aprobado, recibirs un enlace de activacin</li>
                    <li> Podrs acceder al panel de moderacin una vez activado</li>
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
    <div className="min-h-screen bg-hero-gradient">
      <AdminNav userRole="moderator" />
      <div className="max-w-2xl mx-auto p-6 pt-24">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Solicitud de Moderador
          </h1>
          <p className="text-white/80">
            nete a nuestro equipo de moderacin y ayuda a mantener la comunidad segura
          </p>
        </div>

        {/* Informacin detallada sobre el rol */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-400" />
              Programa de Moderadores ComplicesConecta
            </CardTitle>
            <CardDescription className="text-white/80">
              nete a nuestro equipo de moderacin y ayuda a crear un espacio seguro y respetuoso para todos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descripcin del programa */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-400/20">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                Por qu necesitamos moderadores?
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                ComplicesConecta es una plataforma para adultos que facilita conexiones autnticas y respetuosas. 
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
                  <li> <strong>Revisar reportes:</strong> Analizar denuncias de usuarios de manera imparcial</li>
                  <li> <strong>Moderar contenido:</strong> Evaluar fotos, mensajes y perfiles reportados</li>
                  <li> <strong>Aplicar sanciones:</strong> Advertencias, suspensiones temporales o permanentes</li>
                  <li> <strong>Apoyo a usuarios:</strong> Resolver consultas sobre polticas de la comunidad</li>
                  <li> <strong>Prevencin:</strong> Identificar patrones de comportamiento problemtico</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  Retribucin Monetaria
                </h3>
                <div className="text-white/70 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Compensacin base mensual:</span>
                    <span className="text-green-400 font-semibold">$2,500 - $4,000 MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bono por desempeo:</span>
                    <span className="text-green-400 font-semibold">Hasta $1,500 MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bono por casos complejos:</span>
                    <span className="text-green-400 font-semibold">$50 - $200 MXN</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60">
                      * Pagos quincenales va transferencia bancaria
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
                  <li> <strong>Edad:</strong> Mayor de 21 aos (preferible)</li>
                  <li> <strong>Disponibilidad:</strong> Mnimo 8-10 horas semanales</li>
                  <li> <strong>Experiencia:</strong> Moderacin online, atencin al cliente o psicologa</li>
                  <li> <strong>Habilidades:</strong> Comunicacin emptica y toma de decisiones</li>
                  <li> <strong>Compromiso:</strong> Mnimo 6 meses en el programa</li>
                </ul>
              </div>
            </div>

            {/* Beneficios y compensacin */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-400/20">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Badge className="h-5 w-5 text-yellow-400" />
                Beneficios del Programa
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="text-green-300 font-medium mb-1">Compensacin</h4>
                  <p className="text-white/70">Tokens CMPX mensuales segn horas dedicadas</p>
                </div>
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">Acceso Premium</h4>
                  <p className="text-white/70">Funciones exclusivas mientras seas moderador activo</p>
                </div>
                <div>
                  <h4 className="text-purple-300 font-medium mb-1">Experiencia</h4>
                  <p className="text-white/70">Certificado de moderacin y referencias profesionales</p>
                </div>
              </div>
            </div>

            {/* Proceso de seleccin */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Proceso de Seleccin
              </h3>
              <div className="grid md:grid-cols-4 gap-3 text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">1</div>
                  <p className="text-white/70">Solicitud</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div>
                  <p className="text-white/70">Revisin (2-3 das)</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div>
                  <p className="text-white/70">Entrevista virtual</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">4</div>
                  <p className="text-white/70">Capacitacin</p>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informacin personal */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informacin Personal
                </h3>
                
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="tu@email.com"
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
                    Experiencia Relevante
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Describe tu experiencia en moderacin, administracin de comunidades, atencin al cliente, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Experiencia Previa en Moderacin
                  </label>
                  <textarea
                    name="previousModeration"
                    value={formData.previousModeration}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Has sido moderador en otras plataformas? Describe tu experiencia."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Disponibilidad Semanal
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Ej: 10 horas/semana, tardes y fines de semana"
                  />
                </div>
              </div>

              {/* Motivacin */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Motivacin
                </h3>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Por qu quieres ser moderador? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="Explica tu motivacin para unirte al equipo de moderacin y cmo planeas contribuir a la comunidad."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Trminos */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <label className="text-white/80 text-sm">
                    Acepto los trminos y condiciones del programa de moderacin. 
                    Entiendo que como moderador debo mantener la confidencialidad, 
                    actuar de manera imparcial y seguir las polticas de la comunidad. *
                  </label>
                </div>
              </div>

              {/* Botn de envo */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.agreeToTerms}
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
                * Campos obligatorios. Tu informacin ser revisada por nuestro equipo.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorRequest;
