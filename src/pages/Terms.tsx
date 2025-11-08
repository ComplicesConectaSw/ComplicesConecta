import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Heart, Lock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';

const Terms = () => {
  const _navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              T�rminos y Condiciones
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ComplicesConecta
              </span>
            </h1>
            <p className="text-xl text-white font-medium max-w-2xl mx-auto">
              Condiciones de uso para nuestra plataforma de conexiones para adultos
            </p>
            <Badge className="mt-4 bg-white/10 border-white/30 text-white backdrop-blur-sm">
              <FileText className="h-4 w-4 mr-1" />
              �ltima actualizaci�n: Noviembre 2025 - v3.5.0
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Aceptaci�n de T�rminos */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5 text-purple-300" />
                  1. Aceptaci�n de T�rminos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  Al acceder y utilizar ComplicesConecta, usted acepta estar sujeto a estos t�rminos y condiciones. 
                  Si no est� de acuerdo con alguna parte de estos t�rminos, no debe utilizar nuestro servicio.
                </p>
                <p className="text-white/80">
                  Esta plataforma est� destinada exclusivamente para adultos mayores de 18 a�os que buscan 
                  conexiones dentro del estilo de vida alternativo para parejas.
                </p>
              </CardContent>
            </Card>

            {/* Elegibilidad */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-purple-300" />
                  2. Elegibilidad y Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Requisitos de edad:</strong> Debe tener al menos 18 a�os para usar este servicio.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Verificaci�n:</strong> Nos reservamos el derecho de solicitar verificaci�n de identidad 
                  y edad en cualquier momento.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Informaci�n veraz:</strong> Debe proporcionar informaci�n precisa y actualizada 
                  durante el registro.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Una cuenta por persona:</strong> No est� permitido crear m�ltiples cuentas.
                </p>
              </CardContent>
            </Card>

            {/* Conducta del Usuario */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 text-purple-300" />
                  3. Conducta del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Respeto mutuo:</strong> Mantenga siempre un trato respetuoso hacia otros usuarios.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Consentimiento:</strong> Todas las interacciones deben ser consensuales. 
                  No se tolerar� el acoso o comportamiento no deseado.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Contenido apropiado:</strong> No publique contenido ilegal, ofensivo o que viole 
                  los derechos de terceros.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Privacidad:</strong> Respete la privacidad de otros usuarios. No comparta informaci�n 
                  personal sin consentimiento.
                </p>
              </CardContent>
            </Card>

            {/* Privacidad y Seguridad */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-purple-300" />
                  4. Privacidad y Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Protecci�n de datos:</strong> Implementamos medidas de seguridad para proteger 
                  su informaci�n personal.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Uso de informaci�n:</strong> Su informaci�n se utiliza �nicamente para mejorar 
                  su experiencia en la plataforma.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Terceros:</strong> No vendemos ni compartimos su informaci�n personal con terceros 
                  sin su consentimiento expl�cito.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cookies:</strong> Utilizamos cookies para mejorar la funcionalidad del sitio.
                </p>
              </CardContent>
            </Card>

            {/* Servicios Premium */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">5. Servicios Premium y Pagos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  <strong className="text-white">Suscripciones:</strong> Los servicios premium requieren suscripci�n mensual o anual.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Tokens CMPX:</strong> Sistema de tokens para funciones especiales y eventos exclusivos.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Reembolsos:</strong> Las pol�ticas de reembolso se aplican seg�n las leyes locales.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Cancelaci�n:</strong> Puede cancelar su suscripci�n en cualquier momento desde su perfil.
                </p>
              </CardContent>
            </Card>

            {/* Limitaci�n de Responsabilidad */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">6. Limitaci�n de Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  ComplicesConecta act�a como plataforma de conexi�n. No somos responsables de:
                </p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                  <li>Encuentros o relaciones que se desarrollen fuera de la plataforma</li>
                  <li>Verificaci�n de la identidad de todos los usuarios</li>
                  <li>Contenido generado por usuarios</li>
                  <li>Problemas t�cnicos o interrupciones del servicio</li>
                </ul>
              </CardContent>
            </Card>

            {/* Modificaciones */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">7. Modificaciones de los T�rminos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  Nos reservamos el derecho de modificar estos t�rminos en cualquier momento. 
                  Los cambios importantes ser�n notificados con al menos 30 d�as de anticipaci�n.
                </p>
                <p className="text-white/80">
                  El uso continuado del servicio despu�s de las modificaciones constituye 
                  la aceptaci�n de los nuevos t�rminos.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">8. Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Para preguntas sobre estos t�rminos, contacte con nosotros a trav�s de:
                </p>
                <p className="text-white/80 mt-2">
                  <strong className="text-white">Email:</strong> <a href="mailto:legal@complicesconecta.com" className="text-purple-300 hover:underline hover:text-purple-200">legal@complicesconecta.com</a><br />
                  <strong className="text-white">Direcci�n:</strong> Madrid, Espa�a
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
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
