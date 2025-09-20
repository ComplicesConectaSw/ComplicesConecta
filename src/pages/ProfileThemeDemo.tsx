import React from 'react';
import { Header } from "@/components/Header";
import Navigation from "@/components/Navigation";
import { ProfileThemeShowcase } from '@/components/demo/ProfileThemeShowcase';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Users, Sparkles } from 'lucide-react';

const ProfileThemeDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Temas Visuales de Perfiles
            </h1>
          </div>
          
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Experimenta con la personalización visual avanzada de ComplicesConecta v2.9.3. 
            Los perfiles se adaptan dinámicamente según el género, tipo de relación y preferencias de tema.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="secondary" className="px-4 py-2">
              <Eye className="h-4 w-4 mr-2" />
              Personalización Visual
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Single & Parejas
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Palette className="h-4 w-4 mr-2" />
              3 Temas Premium
            </Badge>
          </div>
        </div>

        {/* Información de Accesibilidad */}
        <UnifiedCard className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Accesibilidad y Contraste Verificado
              </h3>
              <div className="text-green-700 space-y-2">
                <p>✅ Todos los temas cumplen con WCAG 2.1 AA para contraste de texto</p>
                <p>✅ Colores optimizados para daltonismo y baja visión</p>
                <p>✅ Transiciones suaves y animaciones reducidas disponibles</p>
                <p>✅ Textos siempre legibles con fondos de alto contraste</p>
              </div>
            </div>
          </div>
        </UnifiedCard>

        {/* Showcase Principal */}
        <ProfileThemeShowcase />

        {/* Información Técnica */}
        <div className="grid md:grid-cols-2 gap-6">
          <UnifiedCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Características Técnicas
            </h3>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Temas Dinámicos:</strong> Fondos que se adaptan automáticamente según género y tipo de relación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Animaciones Fluidas:</strong> Transiciones suaves con Framer Motion para una experiencia premium</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Responsive Design:</strong> Optimizado para móviles, tablets y desktop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>TypeScript:</strong> Tipado estricto para máxima confiabilidad</span>
              </li>
            </ul>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Combinaciones de Temas
            </h3>
            <div className="space-y-4 text-white/90">
              <div>
                <h4 className="font-medium text-blue-700 mb-1">👨 Perfiles Masculinos</h4>
                <p className="text-sm">Tonos azules, grises y metálicos que transmiten confianza y elegancia</p>
              </div>
              <div>
                <h4 className="font-medium text-pink-700 mb-1">👩 Perfiles Femeninos</h4>
                <p className="text-sm">Tonos púrpuras, rosas y dorados que evocan calidez y modernidad</p>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-1">💑 Parejas Mixtas</h4>
                <p className="text-sm">Gradientes equilibrados que combinan ambos estilos armoniosamente</p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">✨ Temas Premium</h4>
                <p className="text-sm">Elegante, Moderno y Vibrante - personalizables por cada usuario</p>
              </div>
            </div>
          </UnifiedCard>
        </div>

        {/* Call to Action */}
        <UnifiedCard className="p-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Listo para Personalizar tu Perfil?
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Únete a ComplicesConecta y descubre cómo tu perfil puede destacar con temas visuales únicos 
            que reflejan tu personalidad y estilo de vida.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
              Crear Perfil Gratis
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Ver Más Demos
            </button>
          </div>
        </UnifiedCard>
      </div>
    </div>
  );
};

export default ProfileThemeDemo;
