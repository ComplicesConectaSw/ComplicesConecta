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
              Pol�tica de Privacidad
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ComplicesConecta
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              C�mo protegemos y utilizamos su informaci�n personal
            </p>
            <Badge variant="secondary" className="mt-4 bg-white/10 border-white/30 text-white backdrop-blur-sm">
              <Shield className="h-4 w-4 mr-1" />
              �ltima actualizaci�n: Noviembre 2025 - v3.5.0
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introducci�n */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="h-5 w-5 text-purple-300" />
                  1. Introducci�n
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  En ComplicesConecta, valoramos profundamente su privacidad. Esta pol�tica explica c�mo 
                  recopilamos, utilizamos y protegemos su informaci�n personal cuando utiliza nuestra plataforma 
                  de conexiones para adultos.
                </p>
                <p className="text-white/80">
                  Nos comprometemos a mantener la confidencialidad y seguridad de sus datos personales, 
                  especialmente considerando la naturaleza sensible de nuestra plataforma.
                </p>
              </CardContent>
            </Card>

            {/* Informaci�n que Recopilamos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-purple-300" />
                  2. Informaci�n que Recopilamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Informaci�n de Registro:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Nombre, edad y ubicaci�n</li>
                    <li>Direcci�n de correo electr�nico</li>
                    <li>Preferencias y orientaci�n</li>
                    <li>Fotograf�as de perfil</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Informaci�n de Uso:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Actividad en la plataforma</li>
                    <li>Mensajes y comunicaciones</li>
                    <li>Preferencias de b�squeda</li>
                    <li>Datos de geolocalizaci�n (con su consentimiento)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Informaci�n T�cnica:</h4>
                  <ul className="list-disc list-inside text-white/80 space-y-1">
                    <li>Direcci�n IP y datos del dispositivo</li>
                    <li>Informaci�n del navegador</li>
                    <li>Cookies y tecnolog�as similares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* C�mo Utilizamos su Informaci�n */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">3. C�mo Utilizamos su Informaci�n</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Servicios de la plataforma:</strong> Para facilitar conexiones, mostrar perfiles 
                  compatibles y gestionar su cuenta.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Comunicaci�n:</strong> Para enviar notificaciones importantes, actualizaciones 
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
                  <strong className="text-white">Cumplimiento legal:</strong> Cumplimos con GDPR, LFPDPPP (M�xico) y Ley 
                  Olimpia. Cuando sea requerido por ley o para proteger nuestros derechos legales.
                </p>
              </CardContent>
            </Card>

            {/* Compartir Informaci�n */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">4. Compartir su Informaci�n</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Con otros usuarios:</strong> Su perfil e informaci�n b�sica son visibles para 
                  otros usuarios seg�n sus configuraciones de privacidad.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Proveedores de servicios:</strong> Compartimos datos limitados con proveedores 
                  que nos ayudan a operar la plataforma (hosting, pagos, an�lisis).
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cumplimiento legal:</strong> Podemos divulgar informaci�n cuando sea requerido 
                  por autoridades legales o para proteger la seguridad.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Nunca vendemos:</strong> No vendemos su informaci�n personal a terceros para 
                  fines comerciales.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Cookie className="h-5 w-5 text-purple-300" />
                  5. Cookies y Tecnolog�as Similares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Cookies esenciales:</strong> Necesarias para el funcionamiento b�sico del sitio.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cookies de rendimiento:</strong> Nos ayudan a entender c�mo los usuarios 
                  interact�an con la plataforma.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cookies de personalizaci�n:</strong> Permiten recordar sus preferencias y 
                  configuraciones.
                </p>
                <p className="text-white/80">
                  Puede gestionar sus preferencias de cookies en la configuraci�n de su navegador.
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
                  <strong className="text-white">Encriptaci�n AES-GCM:</strong> Utilizamos encriptaci�n de grado militar 
                  para proteger la transmisi�n y almacenamiento de datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Row Level Security (RLS):</strong> 122 pol�ticas RLS activas protegiendo 
                  acceso a datos sensibles a nivel de base de datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Verificaci�n IA de Consentimiento:</strong> Sistema proactivo de detecci�n 
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
                  <strong className="text-white">Correcci�n:</strong> Puede actualizar o corregir informaci�n inexacta.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Eliminaci�n:</strong> Puede solicitar la eliminaci�n de su cuenta y datos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Portabilidad:</strong> Puede solicitar sus datos en un formato transferible.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Objeci�n:</strong> Puede oponerse al procesamiento de sus datos para 
                  ciertos fines.
                </p>
              </CardContent>
            </Card>

            {/* Retenci�n de Datos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">8. Retenci�n de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  Conservamos su informaci�n personal solo durante el tiempo necesario para 
                  proporcionar nuestros servicios y cumplir con obligaciones legales.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cuenta activa:</strong> Mientras mantenga su cuenta activa.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Despu�s de la eliminaci�n:</strong> Algunos datos pueden conservarse 
                  por razones legales o de seguridad hasta 7 a�os.
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
                  Para preguntas sobre esta pol�tica de privacidad o para ejercer sus derechos:
                </p>
                <p className="text-white/80 mt-2">
                  <strong className="text-white">Email:</strong> <a href="mailto:privacy@complicesconecta.com" className="text-purple-300 hover:underline hover:text-purple-200">privacy@complicesconecta.com</a><br />
                  <strong className="text-white">Responsable de Protecci�n de Datos:</strong> <a href="mailto:dpo@complicesconecta.com" className="text-purple-300 hover:underline hover:text-purple-200">dpo@complicesconecta.com</a><br />
                  <strong className="text-white">Direcci�n:</strong> Madrid, Espa�a
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
