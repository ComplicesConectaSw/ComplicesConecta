import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Heart, Users, Sparkles, Palette } from 'lucide-react'

interface ThemeOption {
  id: string
  name: string
  description: string
  gradient: string
  profileType: 'single' | 'couple' | 'both'
  gender?: 'masculine' | 'feminine' | 'mixed'
  isPremium?: boolean
}

const themeOptions: ThemeOption[] = [
  // Temas Masculinos
  {
    id: 'blue-steel',
    name: 'Acero Azul',
    description: 'Tonos azules y grises que transmiten confianza',
    gradient: 'from-blue-600 via-slate-500 to-blue-800',
    profileType: 'single',
    gender: 'masculine'
  },
  {
    id: 'metallic-gray',
    name: 'Gris Metálico',
    description: 'Elegancia en tonos grises y metálicos',
    gradient: 'from-gray-600 via-slate-400 to-gray-800',
    profileType: 'single',
    gender: 'masculine'
  },
  
  // Temas Femeninos
  {
    id: 'purple-rose',
    name: 'Rosa Púrpura',
    description: 'Tonos púrpuras y rosas que evocan calidez',
    gradient: 'from-purple-500 via-pink-400 to-purple-700',
    profileType: 'single',
    gender: 'feminine'
  },
  {
    id: 'golden-pink',
    name: 'Rosa Dorado',
    description: 'Modernidad en rosas y dorados',
    gradient: 'from-pink-400 via-yellow-300 to-pink-600',
    profileType: 'single',
    gender: 'feminine'
  },
  
  // Temas para Parejas
  {
    id: 'mixed-harmony',
    name: 'Armonía Mixta',
    description: 'Gradientes equilibrados que combinan ambos estilos',
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
    profileType: 'couple',
    gender: 'mixed'
  },
  {
    id: 'couple-sunset',
    name: 'Atardecer de Pareja',
    description: 'Colores cálidos que representan la unión',
    gradient: 'from-orange-400 via-red-400 to-purple-500',
    profileType: 'couple',
    gender: 'mixed'
  },
  
  // Temas Premium
  {
    id: 'elegant-premium',
    name: 'Elegante Premium',
    description: 'Sofisticación en negro y dorado',
    gradient: 'from-black via-gray-800 to-yellow-600',
    profileType: 'both',
    isPremium: true
  },
  {
    id: 'modern-premium',
    name: 'Moderno Premium',
    description: 'Vanguardia en tonos vibrantes',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    profileType: 'both',
    isPremium: true
  },
  {
    id: 'vibrant-premium',
    name: 'Vibrante Premium',
    description: 'Energía en colores intensos',
    gradient: 'from-green-400 via-blue-500 to-purple-600',
    profileType: 'both',
    isPremium: true
  }
]

interface ProfileThemeDemoProps {
  profileType: 'single' | 'couple'
  gender?: 'masculine' | 'feminine'
  onThemeSelect?: (themeId: string) => void
  selectedTheme?: string
}

export default function ProfileThemeDemo({ 
  profileType, 
  gender, 
  onThemeSelect, 
  selectedTheme 
}: ProfileThemeDemoProps) {
  const [previewTheme, setPreviewTheme] = useState<string>(selectedTheme || '')

  const getFilteredThemes = () => {
    return themeOptions.filter(theme => {
      if (theme.profileType === 'both') return true
      if (theme.profileType === profileType) {
        if (profileType === 'single' && gender) {
          return theme.gender === gender
        }
        return true
      }
      return false
    })
  }

  const handleThemeSelect = (themeId: string) => {
    setPreviewTheme(themeId)
    onThemeSelect?.(themeId)
  }

  const getPreviewTheme = () => {
    return themeOptions.find(theme => theme.id === previewTheme) || themeOptions[0]
  }

  const filteredThemes = getFilteredThemes()
  const currentTheme = getPreviewTheme()

  return (
    <div className="space-y-6">
      {/* Información de Temas por Perfil */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Temas Personalizados por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-300 mb-1 flex items-center gap-1">
                👨 Perfiles Masculinos
              </h4>
              <p className="text-sm text-gray-300">
                Tonos azules, grises y metálicos que transmiten confianza y elegancia
              </p>
            </div>
            <div>
              <h4 className="font-medium text-pink-300 mb-1 flex items-center gap-1">
                👩 Perfiles Femeninos
              </h4>
              <p className="text-sm text-gray-300">
                Tonos púrpuras, rosas y dorados que evocan calidez y modernidad
              </p>
            </div>
            <div>
              <h4 className="font-medium text-purple-300 mb-1 flex items-center gap-1">
                💑 Parejas Mixtas
              </h4>
              <p className="text-sm text-gray-300">
                Gradientes equilibrados que combinan ambos estilos armoniosamente
              </p>
            </div>
            <div>
              <h4 className="font-medium text-yellow-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Temas Premium
              </h4>
              <p className="text-sm text-gray-300">
                Elegante, Moderno y Vibrante - personalizables por cada usuario
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa del Tema */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Vista Previa del Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`bg-gradient-to-br ${currentTheme.gradient} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {profileType === 'couple' ? <Users className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {profileType === 'couple' ? 'Perfil de Pareja' : 'Perfil Individual'}
                  </h3>
                  <p className="text-sm opacity-80">{currentTheme.name}</p>
                </div>
              </div>
              {currentTheme.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm opacity-90">{currentTheme.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Selector de Temas */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Temas Disponibles para {profileType === 'couple' ? 'Parejas' : 'Perfiles Individuales'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  previewTheme === theme.id 
                    ? 'ring-2 ring-white/50 scale-105' 
                    : 'hover:scale-102'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div className={`bg-gradient-to-br ${theme.gradient} rounded-lg p-4 text-white h-24 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{theme.name}</h4>
                    {theme.isPremium && (
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    )}
                  </div>
                  <p className="text-xs opacity-80 line-clamp-2">{theme.description}</p>
                </div>
                {previewTheme === theme.id && (
                  <div className="absolute inset-0 bg-white/10 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => handleThemeSelect(previewTheme)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          disabled={!previewTheme}
        >
          Aplicar Tema
        </Button>
        <Button
          className="border border-white/30 bg-transparent text-white hover:bg-white/10"
          onClick={() => setPreviewTheme('')}
        >
          Restablecer
        </Button>
      </div>
    </div>
  )
}
