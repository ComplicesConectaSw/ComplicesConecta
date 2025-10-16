import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Database, Cookie, Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import HeaderNav from '@/components/HeaderNav';

const Privacy = () => {
  const _navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <HeaderNav />
        <Header />
        
        <main className="container mx-auto px-4 py-8">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Política de Privacidad
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                ComplicesConecta
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cómo protegemos y utilizamos su información personal
            </p>
            <Badge variant="secondary" className="mt-4">
              <Shield className="h-4 w-4 mr-1" />
              Última actualización: Agosto 2025
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introducción */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  1. Introducción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  En ComplicesConecta, valoramos profundamente su privacidad. Esta política explica cómo 
                  recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestra plataforma 
                  de conexiones para adultos.
                </p>
                <p className="text-muted-foreground">
                  Nos comprometemos a mantener la confidencialidad y seguridad de sus datos personales, 
                  especialmente considerando la naturaleza sensible de nuestra plataforma.
                </p>
              </CardContent>
            </Card>

            {/* Información que Recopilamos */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  2. Información que Recopilamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Información de Registro:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Nombre, edad y ubicación</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Preferencias y orientación</li>
                    <li>Fotografías de perfil</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Información de Uso:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Actividad en la plataforma</li>
                    <li>Mensajes y comunicaciones</li>
                    <li>Preferencias de búsqueda</li>
                    <li>Datos de geolocalización (con su consentimiento)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Información Técnica:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Dirección IP y datos del dispositivo</li>
                    <li>Información del navegador</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cómo Utilizamos su Información */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>3. Cómo Utilizamos su Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Servicios de la plataforma:</strong> Para facilitar conexiones, mostrar perfiles 
                  compatibles y gestionar su cuenta.
                </p>
                <p className="text-muted-foreground">
                  <strong>Comunicación:</strong> Para enviar notificaciones importantes, actualizaciones 
                  del servicio y responder a sus consultas.
                </p>
                <p className="text-muted-foreground">
                  <strong>Seguridad:</strong> Para verificar identidades, prevenir fraudes y mantener 
                  un ambiente seguro.
                </p>
                <p className="text-muted-foreground">
                  <strong>Mejoras del servicio:</strong> Para analizar el uso de la plataforma y mejorar 
                  nuestras funcionalidades.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger 
                  nuestros derechos legales.
                </p>
              </CardContent>
            </Card>

            {/* Compartir Información */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>4. Compartir su Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Con otros usuarios:</strong> Su perfil e información básica son visibles para 
                  otros usuarios según sus configuraciones de privacidad.
                </p>
                <p className="text-muted-foreground">
                  <strong>Proveedores de servicios:</strong> Compartimos datos limitados con proveedores 
                  que nos ayudan a operar la plataforma (hosting, pagos, análisis).
                </p>
                <p className="text-muted-foreground">
                  <strong>Cumplimiento legal:</strong> Podemos divulgar información cuando sea requerido 
                  por autoridades legales o para proteger la seguridad.
                </p>
                <p className="text-muted-foreground">
                  <strong>Nunca vendemos:</strong> No vendemos su información personal a terceros para 
                  fines comerciales.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  5. Cookies y Tecnologías Similares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo los usuarios 
                  interactúan con la plataforma.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cookies de personalización:</strong> Permiten recordar sus preferencias y 
                  configuraciones.
                </p>
                <p className="text-muted-foreground">
                  Puede gestionar sus preferencias de cookies en la configuración de su navegador.
                </p>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  6. Seguridad de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Encriptación:</strong> Utilizamos encriptación SSL/TLS para proteger 
                  la transmisión de datos.
                </p>
                <p className="text-muted-foreground">
                  <strong>Acceso limitado:</strong> Solo el personal autorizado tiene acceso a 
                  información personal.
                </p>
                <p className="text-muted-foreground">
                  <strong>Monitoreo:</strong> Supervisamos continuamente nuestros sistemas para 
                  detectar vulnerabilidades.
                </p>
                <p className="text-muted-foreground">
                  <strong>Respaldo seguro:</strong> Sus datos se almacenan de forma segura con 
                  copias de seguridad regulares.
                </p>
              </CardContent>
            </Card>

            {/* Sus Derechos */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>7. Sus Derechos de Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Acceso:</strong> Puede solicitar una copia de sus datos personales.
                </p>
                <p className="text-muted-foreground">
                  <strong>Corrección:</strong> Puede actualizar o corregir información inexacta.
                </p>
                <p className="text-muted-foreground">
                  <strong>Eliminación:</strong> Puede solicitar la eliminación de su cuenta y datos.
                </p>
                <p className="text-muted-foreground">
                  <strong>Portabilidad:</strong> Puede solicitar sus datos en un formato transferible.
                </p>
                <p className="text-muted-foreground">
                  <strong>Objeción:</strong> Puede oponerse al procesamiento de sus datos para 
                  ciertos fines.
                </p>
              </CardContent>
            </Card>

            {/* Retención de Datos */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>8. Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Conservamos su información personal solo durante el tiempo necesario para 
                  proporcionar nuestros servicios y cumplir con obligaciones legales.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cuenta activa:</strong> Mientras mantenga su cuenta activa.
                </p>
                <p className="text-muted-foreground">
                  <strong>Después de la eliminación:</strong> Algunos datos pueden conservarse 
                  por razones legales o de seguridad hasta 7 años.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  9. Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Para preguntas sobre esta política de privacidad o para ejercer sus derechos:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Email:</strong> <a href="mailto:privacy@complicesconecta.com" className="text-primary hover:underline">privacy@complicesconecta.com</a><br />
                  <strong>Responsable de Protección de Datos:</strong> <a href="mailto:dpo@complicesconecta.com" className="text-primary hover:underline">dpo@complicesconecta.com</a><br />
                  <strong>Dirección:</strong> Madrid, España
                </p>
              </CardContent>
            </Card>
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
        
        .animate-blob {
          animation: blob 7s infinite;
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

export default Privacy;
