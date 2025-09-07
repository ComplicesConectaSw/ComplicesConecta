import { ArrowLeft, Users, Shield, Heart, Zap, Globe, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-pink-600 hover:text-pink-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Quiénes Somos
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ComplicesConecta
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plataforma líder para la comunidad lifestyle mexicana. Conectamos personas afines 
            de manera segura, discreta y auténtica.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Crear un espacio seguro y discreto donde parejas y solteros liberales puedan 
              conectar auténticamente, explorar nuevas experiencias y formar parte de una 
              comunidad inclusiva y respetuosa.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Ser la plataforma de referencia en Latinoamérica para la comunidad swinger, 
              estableciendo nuevos estándares de seguridad, privacidad y experiencia de usuario 
              en el sector lifestyle.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Nuestros Valores
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Seguridad</h4>
              <p className="text-gray-600">
                Verificación KYC avanzada y tecnología blockchain para máxima protección
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Comunidad</h4>
              <p className="text-gray-600">
                Fomentamos conexiones auténticas y relaciones respetuosas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Excelencia</h4>
              <p className="text-gray-600">
                Innovación constante y la mejor experiencia de usuario del mercado
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Sobre ComplicesConecta</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>ComplicesConecta</strong> nació en 2024 con la visión de revolucionar la forma 
              en que la comunidad lifestyle se conecta en México y Latinoamérica. Somos más que una 
              plataforma de citas: somos un ecosistema completo para personas que buscan experiencias 
              auténticas y conexiones significativas.
            </p>
            <p>
              Nuestro equipo está compuesto por expertos en tecnología, psicología, seguridad digital 
              y experiencia de usuario, todos comprometidos con crear un espacio seguro y discreto 
              para nuestra comunidad.
            </p>
            <p>
              Utilizamos tecnología de vanguardia incluyendo verificación KYC, blockchain para 
              tokens CMPX/GTK, inteligencia artificial para matching, y cifrado end-to-end para 
              garantizar la máxima seguridad y privacidad.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">2024</div>
            <div className="text-gray-600">Año de Fundación</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
            <div className="text-gray-600">Usuarios Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">4.9★</div>
            <div className="text-gray-600">Calificación</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            Únete a Nuestra Comunidad
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
