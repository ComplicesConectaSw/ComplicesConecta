import { ArrowLeft, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceptaTerminos) {
      toast({
        variant: "destructive",
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envío de email a ComplicesConectaSw@outlook.es
      // Asunto: Solicitud de Apoyo al Proyecto - [Puesto]
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: "Te responderemos en las próximas 24 horas",
        duration: 5000
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

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "Hubo un problema. Inténtalo de nuevo."
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
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-white">Apoyo al Proyecto</h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Formulario de Solicitud */}
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                <FileText className="h-8 w-8" />
                Solicitud de Apoyo al Proyecto
              </CardTitle>
              <p className="text-white/80 text-center mt-2">
                Únete a ComplicesConecta como colaborador startup. Respuesta garantizada en 24 horas.
              </p>
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
                    <Label className="text-white">Teléfono *</Label>
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
                    <Label className="text-white">Correo Electrónico *</Label>
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
                    <Label className="text-white">Puesto de Interés *</Label>
                    <Select value={formData.puesto} onValueChange={(value) => handleInputChange('puesto', value)}>
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
                    placeholder="Ciudad, Estado, País"
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
                  <Label className="text-white">¿Qué esperas del proyecto? *</Label>
                  <Textarea
                    value={formData.expectativas}
                    onChange={(e) => handleInputChange('expectativas', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                    placeholder="Cuéntanos qué esperas de esta colaboración, tus objetivos y motivaciones..."
                    required
                  />
                </div>

                {/* Términos y Condiciones */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked) => handleInputChange('aceptaTerminos', checked)}
                    className="border-white/30"
                  />
                  <Label htmlFor="terminos" className="text-white/90 text-sm leading-relaxed">
                    Acepto los términos y condiciones. Entiendo que ComplicesConecta es una startup en crecimiento 
                    y que la colaboración será por honorarios basados en el tiempo dedicado, avance del proyecto 
                    y crecimiento de la empresa. La respuesta será enviada en un plazo máximo de 24 horas a mi correo electrónico.
                  </Label>
                </div>

                {/* Información adicional */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/80 text-sm">
                    <strong>Nota:</strong> Tu solicitud será enviada a ComplicesConectaSw@outlook.es con el asunto 
                    "Solicitud de Apoyo al Proyecto - [Puesto Seleccionado]". Nos comprometemos a responder 
                    en un plazo máximo de 24 horas con información detallada sobre la colaboración.
                  </p>
                </div>

                {/* Botón de Envío */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>Enviando solicitud...</>
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