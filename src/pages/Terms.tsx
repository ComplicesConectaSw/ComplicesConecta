import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Heart, Lock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Terms = () => {
  const navigate = useNavigate();

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
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Términos y Condiciones
              <span className="block bg-love-gradient bg-clip-text text-transparent">
                ComplicesConecta
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Condiciones de uso para nuestra plataforma de conexiones para adultos
            </p>
            <Badge variant="secondary" className="mt-4">
              <FileText className="h-4 w-4 mr-1" />
              Última actualización: Agosto 2024
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Aceptación de Términos */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  1. Aceptación de Términos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  Al acceder y utilizar ComplicesConecta, usted acepta estar sujeto a estos términos y condiciones. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
                </p>
                <p className="text-white/90">
                  Esta plataforma está destinada exclusivamente para adultos mayores de 18 años que buscan 
                  conexiones dentro del estilo de vida alternativo para parejas.
                </p>
              </CardContent>
            </Card>

            {/* Elegibilidad */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  2. Elegibilidad y Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  <strong>Requisitos de edad:</strong> Debe tener al menos 18 años para usar este servicio.
                </p>
                <p className="text-white/90">
                  <strong>Verificación:</strong> Nos reservamos el derecho de solicitar verificación de identidad 
                  y edad en cualquier momento.
                </p>
                <p className="text-white/90">
                  <strong>Información veraz:</strong> Debe proporcionar información precisa y actualizada 
                  durante el registro.
                </p>
                <p className="text-white/90">
                  <strong>Una cuenta por persona:</strong> No está permitido crear múltiples cuentas.
                </p>
              </CardContent>
            </Card>

            {/* Conducta del Usuario */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  3. Conducta del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  <strong>Respeto mutuo:</strong> Mantenga siempre un trato respetuoso hacia otros usuarios.
                </p>
                <p className="text-white/90">
                  <strong>Consentimiento:</strong> Todas las interacciones deben ser consensuales. 
                  No se tolerará el acoso o comportamiento no deseado.
                </p>
                <p className="text-white/90">
                  <strong>Contenido apropiado:</strong> No publique contenido ilegal, ofensivo o que viole 
                  los derechos de terceros.
                </p>
                <p className="text-white/90">
                  <strong>Privacidad:</strong> Respete la privacidad de otros usuarios. No comparta información 
                  personal sin consentimiento.
                </p>
              </CardContent>
            </Card>

            {/* Privacidad y Seguridad */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  4. Privacidad y Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  <strong>Protección de datos:</strong> Implementamos medidas de seguridad para proteger 
                  su información personal.
                </p>
                <p className="text-white/90">
                  <strong>Uso de información:</strong> Su información se utiliza únicamente para mejorar 
                  su experiencia en la plataforma.
                </p>
                <p className="text-white/90">
                  <strong>Terceros:</strong> No vendemos ni compartimos su información personal con terceros 
                  sin su consentimiento explícito.
                </p>
                <p className="text-white/90">
                  <strong>Cookies:</strong> Utilizamos cookies para mejorar la funcionalidad del sitio.
                </p>
              </CardContent>
            </Card>

            {/* Servicios Premium */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>5. Servicios Premium y Pagos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  <strong>Suscripciones:</strong> Los servicios premium requieren suscripción mensual o anual.
                </p>
                <p className="text-white/90">
                  <strong>Tokens CMPX:</strong> Sistema de tokens para funciones especiales y eventos exclusivos.
                </p>
                <p className="text-white/90">
                  <strong>Reembolsos:</strong> Las políticas de reembolso se aplican según las leyes locales.
                </p>
                <p className="text-white/90">
                  <strong>Cancelación:</strong> Puede cancelar su suscripción en cualquier momento desde su perfil.
                </p>
              </CardContent>
            </Card>

            {/* Limitación de Responsabilidad */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>6. Limitación de Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  ComplicesConecta actúa como plataforma de conexión. No somos responsables de:
                </p>
                <ul className="list-disc list-inside text-white/90 space-y-2">
                  <li>Encuentros o relaciones que se desarrollen fuera de la plataforma</li>
                  <li>Verificación de la identidad de todos los usuarios</li>
                  <li>Contenido generado por usuarios</li>
                  <li>Problemas técnicos o interrupciones del servicio</li>
                </ul>
              </CardContent>
            </Card>

            {/* Modificaciones */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>7. Modificaciones de los Términos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/90">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios importantes serán notificados con al menos 30 días de anticipación.
                </p>
                <p className="text-white/90">
                  El uso continuado del servicio después de las modificaciones constituye 
                  la aceptación de los nuevos términos.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>8. Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Para preguntas sobre estos términos, contacte con nosotros a través de:
                </p>
                <p className="text-white/90 mt-2">
                  <strong>Email:</strong> <a href="mailto:legal@complicesconecta.com" className="text-primary hover:underline">legal@complicesconecta.com</a><br />
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

export default Terms;
