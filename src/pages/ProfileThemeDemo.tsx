import React, { useState } from 'react';
import HeaderNav from "@/components/HeaderNav";
import { ProfileThemeShowcase } from '@/components/demo/ProfileThemeShowcase';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Eye, Users, Sparkles, Settings } from 'lucide-react';
import { useProfileTheme, ProfileType, Gender, Theme, getAvailableThemes } from '@/hooks/useProfileTheme';

const ProfileThemeDemo: React.FC = () => {
  const [selectedProfileType, setSelectedProfileType] = useState<ProfileType>('single');
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>(['male']);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('elegant');
  
  const themeConfig = useProfileTheme(selectedProfileType, selectedGenders, selectedTheme);
  const availableThemes = getAvailableThemes();

  const handleProfileTypeChange = (type: ProfileType) => {
    setSelectedProfileType(type);
    if (type === 'single') {
      setSelectedGenders(['male']);
    } else {
      setSelectedGenders(['male', 'female']);
    }
  };

  const handleGenderChange = (index: number, gender: Gender) => {
    const newGenders = [...selectedGenders];
    newGenders[index] = gender;
    setSelectedGenders(newGenders);
  };

  return (
    <div className={`min-h-screen ${themeConfig.backgroundClass}`}>
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className={`h-10 w-10 ${themeConfig.accentClass}`} />
            <h1 className={`text-4xl md:text-5xl font-bold ${themeConfig.textClass}`}>
              Temas Visuales de Perfiles
            </h1>
          </div>
          
          <p className={`text-xl ${themeConfig.textClass} max-w-3xl mx-auto leading-relaxed opacity-90`}>
            Experimenta con la personalización visual avanzada de ComplicesConecta. 
            Los perfiles se adaptan dinámicamente según el género, tipo de relación y preferencias de tema.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge className="px-4 py-2 bg-white/20 text-white border border-white/30">
              <Eye className="h-4 w-4 mr-2" />
              Personalización Visual
            </Badge>
            <Badge className="px-4 py-2 bg-white/20 text-white border border-white/30">
              <Users className="h-4 w-4 mr-2" />
              Single & Parejas
            </Badge>
            <Badge className="px-4 py-2 bg-white/20 text-white border border-white/30">
              <Palette className="h-4 w-4 mr-2" />
              5 Temas Premium
            </Badge>
          </div>
        </div>

        {/* Configuración de Tema */}
        <UnifiedCard className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Settings className={`h-6 w-6 ${themeConfig.accentClass}`} />
            <h3 className={`text-xl font-semibold ${themeConfig.textClass}`}>
              Configuración de Tema Personalizado
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tipo de Perfil */}
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textClass} mb-2`}>
                Tipo de Perfil
              </label>
              <div className="space-y-2">
                <Button
                  onClick={() => handleProfileTypeChange('single')}
                  className={`w-full ${selectedProfileType === 'single' ? 'bg-white/20 text-white' : 'border border-white/30 text-white hover:bg-white/10 bg-transparent'}`}
                >
                  👤 Single
                </Button>
                <Button
                  onClick={() => handleProfileTypeChange('couple')}
                  className={`w-full ${selectedProfileType === 'couple' ? 'bg-white/20 text-white' : 'border border-white/30 text-white hover:bg-white/10 bg-transparent'}`}
                >
                  💑 Pareja
                </Button>
              </div>
            </div>

            {/* Configuración de Género */}
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textClass} mb-2`}>
                {selectedProfileType === 'single' ? 'Género' : 'Géneros de la Pareja'}
              </label>
              <div className="space-y-2">
                {selectedGenders.map((gender, index) => (
                  <div key={index} className="flex gap-2">
                    <Button
                      onClick={() => handleGenderChange(index, 'male')}
                      className={`flex-1 ${gender === 'male' ? 'bg-blue-500/80 text-white' : 'border border-white/30 text-white hover:bg-white/10 bg-transparent'}`}
                    >
                      👨 Masculino
                    </Button>
                    <Button
                      onClick={() => handleGenderChange(index, 'female')}
                      className={`flex-1 ${gender === 'female' ? 'bg-purple-500/80 text-white' : 'border border-white/30 text-white hover:bg-white/10 bg-transparent'}`}
                    >
                      👩 Femenino
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tema Premium */}
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textClass} mb-2`}>
                Tema Premium
              </label>
              <Select value={selectedTheme} onValueChange={(value: Theme) => setSelectedTheme(value)}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {availableThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value} className="text-white hover:bg-white/10">
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vista Previa del Tema Actual */}
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/20">
            <h4 className={`font-medium ${themeConfig.textClass} mb-2`}>Vista Previa del Tema Actual:</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className={themeConfig.textClass}>
                <strong>Tipo:</strong> {selectedProfileType === 'single' ? '👤 Single' : '💑 Pareja'}
              </span>
              <span className={themeConfig.textClass}>
                <strong>Género(s):</strong> {selectedGenders.map(g => g === 'male' ? '👨' : '👩').join(' ')}
              </span>
              <span className={themeConfig.textClass}>
                <strong>Tema:</strong> {availableThemes.find(t => t.value === selectedTheme)?.label}
              </span>
            </div>
          </div>
        </UnifiedCard>

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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Características Técnicas
            </h3>
            <ul className="space-y-3 text-gray-700">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Combinaciones de Temas
            </h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-blue-700 mb-1">👨 Perfiles Masculinos</h4>
                <p className="text-sm">Tonos azules, grises y metálicos que transmiten confianza y elegancia</p>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-1">👩 Perfiles Femeninos</h4>
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
        <UnifiedCard className="p-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
      
      <HeaderNav />
    </div>
  );
};

export default ProfileThemeDemo;
