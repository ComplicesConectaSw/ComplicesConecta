import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateIntegrator } from '@/components/ui/TemplateIntegrator';
import { ChatTemplate } from '@/components/templates/ChatTemplate';
import { ButtonEffectsTemplate } from '@/components/templates/ButtonEffectsTemplate';
import { useProfileTheme } from '@/features/profile/useProfileTheme';
import { ProfileType, Theme } from '@/types';
import HeaderNav from '@/components/HeaderNav';
import { 
  Palette, 
  Smartphone, 
  Monitor, 
  Globe, 
  CheckCircle, 
  XCircle,
  Code,
  Zap,
  Eye
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const TemplateDemo: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern');
  const [profileType, setProfileType] = useState<ProfileType>('single');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState('integrator');

  const themeConfig = useProfileTheme(profileType, [gender], selectedTheme);

  const compatibilityStats = {
    total: 4,
    compatible: 2,
    incompatible: 2,
    adaptable: 2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-4">
      <HeaderNav />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            ?? Demo de Integracin de Plantillas
          </h1>
          <p className="text-gray-300 text-lg">
            Sistema de Temas v2.8.3 + Plantillas React Adaptadas
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4 mt-6">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-4 h-4 mr-1" />
              {compatibilityStats.compatible} Compatibles
            </Badge>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              <XCircle className="w-4 h-4 mr-1" />
              {compatibilityStats.incompatible} No Compatibles
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Code className="w-4 h-4 mr-1" />
              {compatibilityStats.adaptable} Adaptables
            </Badge>
          </div>
        </motion.div>

        {/* Theme Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Configuracin Global de Temas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tema Visual
                  </label>
                  <select 
                    value={selectedTheme} 
                    onChange={(e) => setSelectedTheme(e.target.value as Theme)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="elegant">Elegante</option>
                    <option value="modern">Moderno</option>
                    <option value="vibrant">Vibrante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tipo de Perfil
                  </label>
                  <select 
                    value={profileType} 
                    onChange={(e) => setProfileType(e.target.value as ProfileType)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="single">Individual</option>
                    <option value="couple">Pareja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Gnero
                  </label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="mt-6 p-4 rounded-lg" style={{
                background: themeConfig.backgroundClass.includes('gradient') 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#374151'
              }}>
                <div className="text-center">
                  <h3 className={cn("text-lg font-semibold", themeConfig.textClass)}>
                    Vista Previa del Tema Actual
                  </h3>
                  <p className={cn("text-sm mt-1", themeConfig.accentClass)}>
                    {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}  {profileType}  {gender}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger 
                value="integrator" 
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Auditora
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Chat Demo
              </TabsTrigger>
              <TabsTrigger 
                value="buttons" 
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Botones
              </TabsTrigger>
              <TabsTrigger 
                value="responsive" 
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Responsive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="integrator" className="mt-6">
              <TemplateIntegrator />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    Chat Template - Integrado con Temas v2.8.3
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatTemplate
                    theme={selectedTheme}
                    profileType={profileType}
                    gender={gender}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buttons" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    Button Effects Template - Efectos Modernos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ButtonEffectsTemplate
                    theme={selectedTheme}
                    profileType={profileType}
                    gender={gender}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responsive" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mobile Preview */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Mobile (320px-767px)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-white/20 rounded-lg p-2 bg-gray-900/50">
                      <div className="w-full max-w-xs mx-auto">
                        <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass)}>
                          <h3 className={cn("font-bold mb-2", themeConfig.textClass)}>
                            Vista Mobile
                          </h3>
                          <p className={cn("text-sm", themeConfig.accentClass)}>
                            Optimizado para pantallas pequeas
                          </p>
                          <Button className="w-full mt-3 btn-animated">
                            Accin Mobile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tablet Preview */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Tablet (768px-1023px)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-white/20 rounded-lg p-2 bg-gray-900/50">
                      <div className="w-full max-w-md mx-auto">
                        <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass)}>
                          <h3 className={cn("font-bold mb-2", themeConfig.textClass)}>
                            Vista Tablet
                          </h3>
                          <p className={cn("text-sm", themeConfig.accentClass)}>
                            Diseo adaptativo para tablets
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button className="flex-1 btn-animated">Accin 1</Button>
                            <Button className="flex-1 btn-animated border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                              Accin 2
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Desktop Preview */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Desktop (1024px+)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-white/20 rounded-lg p-2 bg-gray-900/50">
                      <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass)}>
                        <h3 className={cn("font-bold mb-2", themeConfig.textClass)}>
                          Vista Desktop
                        </h3>
                        <p className={cn("text-sm mb-3", themeConfig.accentClass)}>
                          Experiencia completa para escritorio
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button className="btn-animated">Primario</Button>
                          <Button className="w-full btn-animated border border-input bg-background hover:bg-accent hover:text-accent-foreground">Secundario</Button>
                          <Button className="btn-animated hover:bg-accent hover:text-accent-foreground">Ghost</Button>
                          <Button className="btn-animated bg-destructive text-destructive-foreground hover:bg-destructive/90">Destructivo</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-2">
                ?? Integracin Completada
              </h3>
              <p className="text-gray-300 text-sm">
                Las plantillas han sido auditadas, adaptadas e integradas con el Sistema de Temas v2.8.3.
                Todas las mejoras mantienen la compatibilidad con la lgica de negocio existente.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Badge className="bg-green-500/20 text-green-300">
                  ? Responsive Design
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300">
                  ? Multi-Browser
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300">
                  ? Theme Integration
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-300">
                  ? Accessibility
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateDemo;
