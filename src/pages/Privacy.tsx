import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Database, Cookie, Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';

const Privacy = () => {
  const _navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Poltica de Privacidad
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ComplicesConecta
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Cmo protegemos y utilizamos su informacin personal
            </p>
            <Badge variant="secondary" className="mt-4 bg-white/10 border-white/30 text-white backdrop-blur-sm">
              <Shield className="h-4 w-4 mr-1" />
              ltima actualizacin: Noviembre 2025 - v3.5.0
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introduccin */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="h-5 w-5 text-purple-300" />
                  1. Introduccin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  En ComplicesConecta, valoramos profundamente su privacidad. Esta poltica explica cmo 
                  recopilamos, utilizamos y protegemos su informacin personal cuando utiliza nuestra plataforma 
                  de conexiones para adultos.
                </p>
                <p className="text-white/80">
                  Nos comprometemos a mantener la confidencialidad y seguridad de sus datos personales, 
                  especialmente considerando la naturaleza sensible de nuestra plataforma.
                </p>
              </CardContent>
            </Card>

            {/* Informacin que Recopilamos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-purple-300" />
                  2. Informacin que Recopilamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Informacin de Registro:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Nombre, edad y ubicacin</li>
                    <li>Direccin de correo electrnico</li>
                    <li>Preferencias y orientacin</li>
                    <li>Fotografas de perfil</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Informacin de Uso:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Actividad en la plataforma</li>
                    <li>Mensajes y comunicaciones</li>
                    <li>Preferencias de bsqueda</li>
                    <li>Datos de geolocalizacin (con su consentimiento)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Informacin Tcnica:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Direccin IP y datos del dispositivo</li>
                    <li>Informacin del navegador</li>
                    <li>Cookies y tecnologas similares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cmo Utilizamos su Informacin */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">3. Cmo Utilizamos su Informacin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Servicios de la plataforma:</strong> Para facilitar conexiones, mostrar perfiles 
                  compatibles y gestionar su cuenta.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Comunicacin:</strong> Para enviar notificaciones importantes, actualizaciones 
                  del servicio y responder a sus consultas.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Seguridad:</strong> Para verificar identidades, prevenir fraudes y mantener 
                  un ambiente seguro.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Mejoras del servicio:</strong> Para analizar el uso de la plataforma y mejorar 
                  nuestras funcionalidades.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cumplimiento legal:</strong> Cumplimos con GDPR, LFPDPPP (Mxico) y Ley 
                  Olimpia. Cuando sea requerido por ley o para proteger nuestros derechos legales.
                </p>
              </CardContent>
            </Card>

            {/* Compartir Informacin */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">4. Compartir su Informacin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Con otros usuarios:</strong> Su perfil e informacin bsica son visibles para 
                  otros usuarios segn sus configuraciones de privacidad.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Proveedores de servicios:</strong> Compartimos datos limitados con proveedores 
                  que nos ayudan a operar la plataforma (hosting, pagos, anlisis).
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cumplimiento legal:</strong> Podemos divulgar informacin cuando sea requerido 
                  por autoridades legales o para proteger la seguridad.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Nunca vendemos:</strong> No vendemos su informacin personal a terceros para 
                  fines comerciales.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Cookie className="h-5 w-5 text-purple-300" />
                  5. Cookies y Tecnologas Similares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Cookies esenciales:</strong> Necesarias para el funcionamiento bsico del sitio.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cookies de rendimiento:</strong> Nos ayudan a entender cmo los usuarios 
                  interactan con la plataforma.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cookies de personalizacin:</strong> Permiten recordar sus preferencias y 
                  configuraciones.
                </p>
                <p className="text-white/80">
                  Puede gestionar sus preferencias de cookies en la configuracin de su navegador.
                </p>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-purple-300" />
                  6. Seguridad de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Encriptacin AES-GCM:</strong> Utilizamos encriptacin de grado militar 
                  para proteger la transmisin y almacenamiento de datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Row Level Security (RLS):</strong> 122 polticas RLS activas protegiendo 
                  acceso a datos sensibles a nivel de base de datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Verificacin IA de Consentimiento:</strong> Sistema proactivo de deteccin 
                  de consentimiento en chats (Ley Olimpia compliance).
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Monitoreo 24/7:</strong> Supervisamos continuamente nuestros sistemas 
                  con Sentry, New Relic y Datadog para detectar vulnerabilidades.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Respaldo seguro:</strong> Sus datos se almacenan de forma segura con 
                  copias de seguridad regulares y geo-redundancia.
                </p>
              </CardContent>
            </Card>

            {/* Sus Derechos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">7. Sus Derechos de Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Acceso:</strong> Puede solicitar una copia de sus datos personales.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Correccin:</strong> Puede actualizar o corregir informacin inexacta.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Eliminacin:</strong> Puede solicitar la eliminacin de su cuenta y datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Portabilidad:</strong> Puede solicitar sus datos en un formato transferible.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Objecin:</strong> Puede oponerse al procesamiento de sus datos para 
                  ciertos fines.
                </p>
              </CardContent>
            </Card>

            {/* Retencin de Datos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">8. Retencin de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  Conservamos su informacin personal solo durante el tiempo necesario para 
                  proporcionar nuestros servicios y cumplir con obligaciones legales.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cuenta activa:</strong> Mientras mantenga su cuenta activa.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Despus de la eliminacin:</strong> Algunos datos pueden conservarse 
                  por razones legales o de seguridad hasta 7 aos.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-purple-300" />
                  9. Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Para preguntas sobre esta poltica de privacidad o para ejercer sus derechos:
                </p>
                <p className="text-white/80 mt-2">
                  <strong className="text-white">Email:</strong> <a href="mailto:privacy@complicesconecta.com" className="text-purple-300 hover:underline hover:text-purple-200">privacy@complicesconecta.com</a><br />
                  <strong className="text-white">Responsable de Protección de Datos:</strong> <a href="mailto:dpo@complicesconecta.com" className="text-purple-300 hover:underline hover:text-purple-200">dpo@complicesconecta.com</a><br />
                  <strong className="text-white">Dirección:</strong> Ciudad de México, México
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Privacy;
