import { useState } from "react";
import HeaderNav from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Star, Send, Heart, Shield, Crown, Bug, AlertTriangle, UserCheck, Lock, GalleryHorizontal, MessageCircle, Gift, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { logger } from '@/lib/logger';

const FAQ = () => {
  const _navigate = useNavigate();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  
  // Bug Report Form State
  const [bugReport, setBugReport] = useState({
    type: "",
    severity: "",
    description: "",
    steps: "",
    device: "",
    browser: "",
    email: ""
  });

  const faqCategories = {
    verificacion: {
      title: "Verificacin KYC",
      icon: UserCheck,
      color: "text-blue-500",
      faqs: [
        {
          question: "Cmo funciona la verificacin KYC?",
          answer: "Utilizamos tecnologa blockchain avanzada y verificacin de identidad para verificar la identidad de todos nuestros miembros. El sistema incluye verificacin de documentos oficiales, selfie biomtrica y verificacin telefnica. Este proceso garantiza que solo personas reales y verificadas accedan a la plataforma."
        },
        {
          question: "Qu documentos necesito para verificarme?",
          answer: "Necesitas una identificacin oficial vigente (INE, pasaporte o cdula profesional) y una selfie clara. El proceso es completamente seguro y tus datos estn protegidos."
        },
        {
          question: "Cunto tarda la verificacin?",
          answer: "La verificacin KYC toma entre 24-48 horas hbiles. Los miembros Premium tienen verificacin prioritaria en menos de 12 horas."
        }
      ]
    },
    privacidad: {
      title: "Privacidad y Seguridad",
      icon: Lock,
      color: "text-green-500",
      faqs: [
        {
          question: "Es seguro el chat privado?",
          answer: "Absolutamente. Todas las conversaciones estn encriptadas end-to-end con AES-GCM. Adems, implementamos el Verificador IA de Consentimiento que detecta proactivamente patrones de consentimiento en los mensajes, cumpliendo con la Ley Olimpia. Tu privacidad y discrecin son nuestra mxima prioridad."
        },
        {
          question: "Cmo protegen mis datos personales?",
          answer: "Utilizamos encriptacin de grado militar y cumplimos con GDPR. Nunca compartimos tu informacin personal con terceros sin tu consentimiento explcito."
        },
        {
          question: "Puedo controlar quin ve mi perfil?",
          answer: "S, tienes control total sobre tu privacidad. Puedes configurar quin puede ver tu perfil, fotos privadas y contactarte."
        }
      ]
    },
    galerias: {
      title: "Galeras Privadas",
      icon: GalleryHorizontal,
      color: "text-purple-500",
      faqs: [
        {
          question: "Cmo funcionan las galeras privadas?",
          answer: "Las galeras privadas te permiten compartir fotos ntimas solo con personas que hayas autorizado. Tienes control total sobre quin puede acceder. Adems, puedes crear Galeras NFT-Verificadas usando tokens GTK, lo que garantiza autenticidad y verificacin de tus galeras."
        },
        {
          question: "Cmo envo una invitacin de galera?",
          answer: "Desde cualquier perfil, puedes enviar una invitacin para acceder a tu galera privada. La persona debe aceptar la invitacin para ver tu contenido privado."
        },
        {
          question: "Puedo revocar el acceso a mi galera?",
          answer: "S, puedes revocar el acceso a tu galera privada en cualquier momento desde tu configuracin de privacidad."
        }
      ]
    },
    invitaciones: {
      title: "Sistema de Invitaciones",
      icon: MessageCircle,
      color: "text-pink-500",
      faqs: [
        {
          question: "Cmo funcionan las invitaciones?",
          answer: "Puedes enviar invitaciones para conectar, acceder a galeras privadas o chatear. Las invitaciones incluyen un mensaje personalizado y requieren aceptacin."
        },
        {
          question: "Qu tipos de invitaciones existen?",
          answer: "Hay tres tipos: invitaciones de perfil (para conectar), de galera (para ver fotos privadas) y de chat (para conversaciones privadas)."
        },
        {
          question: "Puedo rechazar una invitacin?",
          answer: "Por supuesto. Tienes control total para aceptar o rechazar cualquier invitacin. Las personas rechazadas no pueden volver a enviarte invitaciones del mismo tipo."
        }
      ]
    },
    eventos: {
      title: "Eventos VIP",
      icon: Crown,
      color: "text-yellow-500",
      faqs: [
        {
          question: "Qu son los eventos VIP?",
          answer: "Son fiestas privadas y encuentros exclusivos organizados para miembros verificados. Incluyen clubs exclusivos, cenas ntimas y experiencias nicas para la comunidad swinger."
        },
        {
          question: "Cmo puedo acceder a eventos VIP?",
          answer: "Los eventos VIP estn disponibles para miembros Premium verificados. Recibirs invitaciones exclusivas basadas en tu ubicacin y preferencias."
        },
        {
          question: "Los eventos son seguros y discretos?",
          answer: "Absolutamente. Todos los eventos son organizados en ubicaciones seguras y discretas, con estrictos protocolos de privacidad y consentimiento."
        }
      ]
    },
    tokens: {
      title: "Tokens y Regalos",
      icon: Gift,
      color: "text-orange-500",
      faqs: [
        {
          question: "Qu son los tokens?",
          answer: "Los tokens son nuestra moneda virtual que puedes usar para enviar regalos, destacar tu perfil y acceder a funciones premium especiales."
        },
        {
          question: "Cmo obtengo tokens?",
          answer: "Puedes comprar tokens o ganarlos completando tu perfil, verificndote, siendo activo en la comunidad y recibiendo valoraciones positivas."
        },
        {
          question: "Los tokens caducan?",
          answer: "No, tus tokens no caducan. Puedes usarlos cuando quieras para mejorar tu experiencia en la plataforma."
        }
      ]
    },
    seguridad: {
      title: "Seguridad y Reportes",
      icon: Shield,
      color: "text-red-500",
      faqs: [
        {
          question: "Cmo puedo reportar un perfil?",
          answer: "Puedes reportar cualquier perfil sospechoso directamente desde su pgina. Nuestro equipo de moderacin revisa todos los reportes en menos de 24 horas."
        },
        {
          question: "Qu hago si alguien me acosa?",
          answer: "Reporta inmediatamente el comportamiento inapropiado. Tenemos tolerancia cero al acoso y tomamos medidas rpidas para proteger a nuestra comunidad."
        },
        {
          question: "Hay moderadores activos?",
          answer: "S, tenemos un equipo de moderacin 24/7 que supervisa la plataforma y responde rpidamente a reportes y situaciones de seguridad."
        }
      ]
    },
    soporte: {
      title: "Soporte Tcnico",
      icon: Zap,
      color: "text-cyan-500",
      faqs: [
        {
          question: "?? Encontraste un error en la versin Beta?",
          answer: "Como estamos en fase beta, algunos errores pueden ocurrir. Por favor, utiliza el formulario de reporte de errores ms abajo para ayudarnos a identificar y corregir cualquier problema que encuentres."
        },
        {
          question: "?? Problemas con la aplicacin mvil?",
          answer: "Si experimentas crashes, pantallas en blanco, o funciones que no responden en la app mvil, reprtalo detalladamente en el formulario de errores especificando tu dispositivo y sistema operativo."
        },
        {
          question: "?? Problemas con pagos o suscripciones?",
          answer: "Si tienes inconvenientes con donaciones, suscripciones premium, o procesamiento de pagos, contctanos inmediatamente a travs del formulario con todos los detalles de la transaccin."
        }
      ]
    }
  };

  const handleSubmitFeedback = () => {
    // Aqu se enviara el feedback al backend
    logger.info("Feedback enviado:", { email, feedback, rating });
    toast({
      title: "Comentarios enviados!",
      description: "Gracias por tu feedback. Nos ayuda a mejorar la plataforma.",
    });
    setFeedback("");
    setEmail("");
    setRating(0);
  };

  const handleBugReportSubmit = () => {
    // Enviar reporte de bug por email
    const emailBody = `
REPORTE DE ERROR BETA - ComplicesConecta

Tipo de Error: ${bugReport.type}
Severidad: ${bugReport.severity}
Dispositivo/Navegador: ${bugReport.device} - ${bugReport.browser}

DESCRIPCIN DEL PROBLEMA:
${bugReport.description}

PASOS PARA REPRODUCIR:
${bugReport.steps}

Email de contacto: ${bugReport.email}
Fecha: ${new Date().toLocaleString()}
    `.trim();

    const mailtoLink = `mailto:support@complicesconecta.com?subject=?? Reporte de Error Beta&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Reporte enviado!",
      description: "Se abri tu cliente de email con el reporte. Envalo para que podamos ayudarte.",
    });

    // Reset form
    setBugReport({
      type: "",
      severity: "",
      description: "",
      steps: "",
      device: "",
      browser: "",
      email: ""
    });
  };

  const handleBugReportChange = (field: string, value: string) => {
    setBugReport(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Heart 
              key={i}
              className={`absolute text-primary/10 animate-float-slow`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
              fill="currentColor"
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8">

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Centro de Ayuda
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                FAQ & Comentarios
              </span>
            </h1>
            <p className="text-xl text-white font-medium max-w-2xl mx-auto">
              Encuentra respuestas a tus preguntas y aydanos a mejorar tu experiencia en ComplicesConecta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div>
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    Preguntas Frecuentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(faqCategories).map(([key, category]) => {
                      const IconComponent = category.icon;
                      return (
                        <AccordionItem key={key} value={key} className="border-primary/10">
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-3">
                              <IconComponent className={`h-5 w-5 ${category.color}`} />
                              <span className="font-semibold">{category.title}</span>
                              <span className="text-sm text-white/80">({category.faqs.length})</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-4">
                              {category.faqs.map((faq, index) => (
                                <div key={index} className="border-l-2 border-primary/20 pl-4 py-2">
                                  <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                                  <p className="text-white/90 text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Bug Report & Feedback Section */}
            <div className="space-y-6">
              {/* Bug Report Form */}
              <Card className="bg-card/80 backdrop-blur-sm border border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-red-600 dark:text-red-400">
                    <HelpCircle className="h-6 w-6" />
                    ?? Reporte de Errores Beta
                  </CardTitle>
                  <p className="text-white/90">
                    Aydanos a mejorar reportando errores, bugs o problemas que encuentres
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bug Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tipo de Error
                    </label>
                    <Select onValueChange={(value: string) => handleBugReportChange("type", value)}>
                      <SelectTrigger className="bg-background/50 border-red-200 dark:border-red-800">
                        <SelectValue placeholder="Selecciona el tipo de error" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ui">?? Problema de Interfaz</SelectItem>
                        <SelectItem value="functionality">?? Funcionalidad no funciona</SelectItem>
                        <SelectItem value="performance">?? Problema de Rendimiento</SelectItem>
                        <SelectItem value="mobile">?? Error en Mvil</SelectItem>
                        <SelectItem value="payment">?? Problema de Pagos</SelectItem>
                        <SelectItem value="auth">?? Error de Login/Registro</SelectItem>
                        <SelectItem value="chat">?? Problema en Chat</SelectItem>
                        <SelectItem value="other">?? Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Severidad
                    </label>
                    <Select onValueChange={(value: string) => handleBugReportChange("severity", value)}>
                      <SelectTrigger className="bg-background/50 border-red-200 dark:border-red-800">
                        <SelectValue placeholder="Qu tan grave es?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">?? Crtico - La app no funciona</SelectItem>
                        <SelectItem value="high">?? Alto - Funcionalidad importante rota</SelectItem>
                        <SelectItem value="medium">?? Medio - Inconveniente menor</SelectItem>
                        <SelectItem value="low">?? Bajo - Sugerencia de mejora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Device & Browser */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Dispositivo
                      </label>
                      <Input
                        placeholder="iPhone 12, Samsung S21, PC..."
                        value={bugReport.device}
                        onChange={(e) => handleBugReportChange("device", e.target.value)}
                        className="bg-background/50 border-red-200 dark:border-red-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Navegador/App
                      </label>
                      <Input
                        placeholder="Chrome, Safari, App mvil..."
                        value={bugReport.browser}
                        onChange={(e) => handleBugReportChange("browser", e.target.value)}
                        className="bg-background/50 border-red-200 dark:border-red-800"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descripcin del Problema
                    </label>
                    <Textarea
                      placeholder="Describe detalladamente qu error encontraste..."
                      value={bugReport.description}
                      onChange={(e) => handleBugReportChange("description", e.target.value)}
                      rows={3}
                      className="bg-background/50 border-red-200 dark:border-red-800 resize-none"
                    />
                  </div>

                  {/* Steps to reproduce */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pasos para Reproducir el Error
                    </label>
                    <Textarea
                      placeholder="1. Entr a la seccin de... &#10;2. Hice clic en... &#10;3. Entonces apareci..."
                      value={bugReport.steps}
                      onChange={(e) => handleBugReportChange("steps", e.target.value)}
                      rows={3}
                      className="bg-background/50 border-red-200 dark:border-red-800 resize-none"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email de Contacto
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={bugReport.email}
                      onChange={(e) => handleBugReportChange("email", e.target.value)}
                      className="bg-background/50 border-red-200 dark:border-red-800"
                    />
                  </div>

                  {/* Submit Bug Report */}
                  <Button 
                    onClick={handleBugReportSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={!bugReport.type || !bugReport.description}
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Enviar Reporte de Error
                  </Button>

                  <div className="text-xs text-white/90 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 inline mr-1" />
                    Este formulario abrir tu cliente de email con el reporte pre-llenado para enviarlo a support@complicesconecta.com
                  </div>
                </CardContent>
              </Card>
              
              {/* General Feedback */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MessageSquare className="h-6 w-6 text-accent" />
                    ?? Comentarios Generales
                  </CardTitle>
                  <p className="text-white/90">
                    Tu opinin nos ayuda a crear la mejor experiencia swinger
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Califica tu experiencia
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-colors duration-200"
                          aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                        >
                          <Star 
                            className={`h-6 w-6 ${
                              star <= rating 
                                ? 'text-accent fill-current' 
                                : 'text-white/60 hover:text-accent'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email (opcional)
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tus comentarios y sugerencias
                    </label>
                    <Textarea
                      placeholder="Cuntanos qu te gusta, qu mejoraras, o cualquier sugerencia para hacer ComplicesConecta an mejor..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="bg-background/50 border-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full bg-love-gradient hover:opacity-90 transition-opacity"
                    disabled={!feedback.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Comentarios
                  </Button>

                  {/* Privacy Note */}
                  <div className="text-xs text-white/90 bg-muted/20 p-3 rounded-lg">
                    <Crown className="h-4 w-4 text-accent inline mr-1" />
                    Tus comentarios son confidenciales y nos ayudan a mejorar la experiencia para toda la comunidad swinger.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default FAQ;
