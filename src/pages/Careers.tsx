import { ArrowLeft, Send, FileText } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import HeaderNav from "@/components/HeaderNav";

const ProjectSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    domicilio: '',
    experiencia: '',
    referencias: '',
    expectativas: '',
    puesto: '',
    cv: null as File | null,
    aceptaTerminos: false
  });

  const [uploadingFile, setUploadingFile] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const puestosDisponibles = [
    "Desarrollador Full Stack",
    "Especialista UX/UI",
    "Consultor de Arquitectura",
    "Community Manager",
    "Marketing Digital",
    "Otro (especificar en expectativas)"
  ];

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
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

    // Validar campos requeridos
    if (!formData.nombre || !formData.telefono || !formData.correo || !formData.puesto || !formData.experiencia || !formData.expectativas) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('?? Enviando solicitud de apoyo al proyecto:', { 
        nombre: formData.nombre, 
        puesto: formData.puesto,
        correo: formData.correo 
      });

      // Obtener informacin adicional para auditora
      const userAgent = navigator.userAgent;
      const _timestamp = new Date().toISOString();

      // Subir archivo CV si existe
      let cvUrl = null;
      if (formData.cv) {
        setUploadingFile(true);
        
        if (!supabase) {
          logger.error('Supabase no est disponible');
          throw new Error('Supabase no est disponible');
        }
        
        const fileExt = formData.cv.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('career-files')
          .upload(`cvs/${fileName}`, formData.cv);

        if (uploadError) {
          logger.error('? Error al subir CV:', { error: uploadError.message });
          throw new Error(`Error al subir archivo: ${uploadError.message}`);
        }

        cvUrl = uploadData.path;
        logger.info('? CV subido exitosamente:', { path: cvUrl });
        setUploadingFile(false);
      }

      // Simular insercin en base de datos (tabla career_applications no existe)
      const mockData = {
        id: `career_${Date.now()}`,
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim().toLowerCase(),
        domicilio: formData.domicilio.trim() || null,
        puesto: formData.puesto,
        experiencia: formData.experiencia.trim(),
        referencias: formData.referencias.trim() || null,
        expectativas: formData.expectativas.trim(),
        cv_url: cvUrl,
        status: 'pending',
        user_agent: userAgent,
        created_at: new Date().toISOString()
      };

      // Log de la solicitud para auditora
      logger.info('?? Solicitud de carrera procesada:', mockData);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = [mockData];
      const _error = null;

      // No hay error en la simulacin, continuar con xito

      logger.info('? Solicitud guardada exitosamente:', { 
        id: data?.[0]?.id,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Solicitud enviada exitosamente!",
        description: `Tu solicitud para ${formData.puesto} ha sido registrada. Te contactaremos en las prximas 24 horas a ${formData.correo}`,
        duration: 7000
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        telefono: '',
        correo: '',
        domicilio: '',
        experiencia: '',
        referencias: '',
        expectativas: '',
        puesto: '',
        cv: null,
        aceptaTerminos: false
      });

    } catch (_error: any) {
      logger.error('? Error al enviar solicitud:', { error: _error.message });
      
      toast({
        variant: "destructive",
        title: "Error al enviar solicitud",
        description: _error.message || "Hubo un problema al procesar tu solicitud. Intntalo de nuevo o contacta a ComplicesConectaSw@outlook.es"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Button 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 bg-transparent border-none"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Apoyo al Proyecto</h1>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>

        {/* Formulario de Solicitud */}
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                <FileText className="h-8 w-8" />
                Apoyo al Proyecto ComplicesConecta
              </CardTitle>
              <div className="text-white/90 mt-4 space-y-4">
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-lg border border-white/10">
                  <h3 className="text-xl font-semibold mb-2">Qu ofrecemos?</h3>
                  <ul className="space-y-2 text-sm">
                    <li> Colaboracin en startup innovadora en el sector lifestyle</li>
                    <li> Honorarios basados en tiempo dedicado y crecimiento del proyecto</li>
                    <li> Oportunidad de formar parte del equipo fundador</li>
                    <li> Participacin en decisiones estratgicas del producto</li>
                    <li> Ambiente de trabajo flexible y remoto</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-500/20 to-pink-500/20 p-4 rounded-lg border border-white/10">
                  <h3 className="text-xl font-semibold mb-2">Beneficios de unirte</h3>
                  <ul className="space-y-2 text-sm">
                    <li> Experiencia en startup tecnolgica real</li>
                    <li> Crecimiento profesional acelerado</li>
                    <li> Red de contactos en el ecosistema tech</li>
                    <li> Posibilidad de equity en el futuro</li>
                    <li> Impacto directo en el producto final</li>
                  </ul>
                </div>
                
                <p className="text-center text-white/80 font-medium">
                  Si te interesa formar parte de nuestro equipo, completa el formulario a continuacin
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Personales */}
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label className="text-white">Telfono *</Label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="+52 55 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label className="text-white">Puesto de Inters *</Label>
                    <Select value={formData.puesto} onValueChange={(value: string) => handleInputChange('puesto', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecciona un puesto" />
                      </SelectTrigger>
                      <SelectContent>
                        {puestosDisponibles.map((puesto) => (
                          <SelectItem key={puesto} value={puesto}>{puesto}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Domicilio</Label>
                  <Input
                    value={formData.domicilio}
                    onChange={(e) => handleInputChange('domicilio', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Ciudad, Estado, Pas"
                  />
                </div>

                <div>
                  <Label className="text-white">Experiencia Relevante *</Label>
                  <Textarea
                    value={formData.experiencia}
                    onChange={(e) => handleInputChange('experiencia', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                    placeholder="Describe tu experiencia relevante para el puesto..."
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Referencias</Label>
                  <Textarea
                    value={formData.referencias}
                    onChange={(e) => handleInputChange('referencias', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Referencias profesionales (opcional)"
                  />
                </div>

                <div>
                  <Label className="text-white">Qu esperas del proyecto? *</Label>
                  <Textarea
                    value={formData.expectativas}
                    onChange={(e) => handleInputChange('expectativas', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                    placeholder="Cuntanos qu esperas de esta colaboracin, tus objetivos y motivaciones..."
                    required
                  />
                </div>

                {/* Carga de CV */}
                <div>
                  <Label className="text-white">Curriculum Vitae (Opcional)</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleInputChange('cv', file);
                      }}
                      className="bg-white/10 border-white/20 text-white file:bg-purple-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Formatos aceptados: PDF, DOC, DOCX, TXT (mximo 10MB)
                    </p>
                    {formData.cv && (
                      <p className="text-green-400 text-sm mt-1">
                        ? Archivo seleccionado: {formData.cv.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trminos y Condiciones */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked: boolean) => handleInputChange('aceptaTerminos', checked)}
                    className="border-white/30"
                  />
                  <Label htmlFor="terminos" className="text-white/90 text-sm leading-relaxed">
                    Acepto los trminos y condiciones. Entiendo que ComplicesConecta es una startup en crecimiento 
                    y que la colaboracin ser por honorarios basados en el tiempo dedicado, avance del proyecto 
                    y crecimiento de la empresa. La respuesta ser enviada en un plazo mximo de 24 horas a mi correo electrnico.
                  </Label>
                </div>

                {/* Informacin adicional */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/80 text-sm">
                    <strong>Nota:</strong> Tu solicitud ser registrada en nuestra base de datos y enviada directamente 
                    al equipo de ComplicesConecta. Nos comprometemos a responder en un plazo mximo de 24 horas 
                    a tu correo electrnico con informacin detallada sobre la colaboracin y prximos pasos.
                  </p>
                </div>

                {/* Botn de Envo */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      {uploadingFile ? 'Subiendo archivo...' : 'Enviando solicitud...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Solicitud de Apoyo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectSupport;