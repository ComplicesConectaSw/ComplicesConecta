import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  User, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { validateModeratorRequest, type ModeratorRequestInput } from '@/lib/validations/moderator';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos con Zod
    const validation = validateModeratorRequest(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    try {
      setLoading(true);

      // Verificar si ya existe una solicitud pendiente para este email
      const { data: existingRequest, error: checkError } = await (supabase as any)
        .from('moderator_requests')
        .select('*')
        .eq('email', formData.email)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast.error('Ya tienes una solicitud pendiente. Por favor espera la respuesta del equipo.');
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
      toast.success('¡Solicitud enviada exitosamente!');
    } catch (error) {
      console.error('Error submitting moderator request:', error);
      toast.error('Error al enviar la solicitud. Por favor intenta nuevamente.');
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
    <div className="min-h-screen bg-hero-gradient p-6">
      <div className="max-w-2xl mx-auto">
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
            Únete a nuestro equipo de moderación y ayuda a mantener la comunidad segura
          </p>
        </div>

        {/* Información sobre el rol */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              ¿Qué hace un moderador?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Responsabilidades</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Revisar reportes de usuarios</li>
                  <li>• Moderar contenido inapropiado</li>
                  <li>• Aplicar suspensiones cuando sea necesario</li>
                  <li>• Mantener la comunidad segura</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Requisitos</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Ser mayor de 18 años</li>
                  <li>• Disponibilidad de al menos 5 horas/semana</li>
                  <li>• Experiencia en moderación (preferible)</li>
                  <li>• Compromiso con la comunidad</li>
                </ul>
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
              {/* Información personal */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información Personal
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
                    placeholder="Describe tu experiencia en moderación, administración de comunidades, atención al cliente, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Experiencia Previa en Moderación
                  </label>
                  <textarea
                    name="previousModeration"
                    value={formData.previousModeration}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    placeholder="¿Has sido moderador en otras plataformas? Describe tu experiencia."
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
                    name="motivation"
                    value={formData.motivation}
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
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
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
                * Campos obligatorios. Tu información será revisada por nuestro equipo.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorRequest;
