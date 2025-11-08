import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileTheme } from '@/features/profile/useProfileTheme';
import { ProfileType, Theme } from '@/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Palette, Smartphone, Monitor, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Template compatibility types
interface TemplateCompatibility {
  id: string;
  name: string;
  type: 'chat' | 'button' | 'card' | 'navigation' | 'form';
  compatible: boolean;
  issues: string[];
  adaptations: string[];
  tailwindSupport: boolean;
  framerMotionSupport: boolean;
  themeSupport: boolean;
  responsiveSupport: boolean;
}

// Available HTML templates from the directory
const AVAILABLE_TEMPLATES: TemplateCompatibility[] = [
  {
    id: 'chat-template',
    name: 'Chat Interface',
    type: 'chat',
    compatible: true,
    issues: ['Uses vanilla CSS instead of Tailwind', 'No dark theme support'],
    adaptations: ['Convert CSS to Tailwind classes', 'Add theme integration', 'Implement responsive design'],
    tailwindSupport: false,
    framerMotionSupport: false,
    themeSupport: false,
    responsiveSupport: true
  },
  {
    id: 'button-hover-effects',
    name: 'Button Hover Effects',
    type: 'button',
    compatible: true,
    issues: ['Custom CSS animations', 'No theme variables'],
    adaptations: ['Convert to Tailwind hover classes', 'Add theme color support', 'Integrate with existing button component'],
    tailwindSupport: false,
    framerMotionSupport: false,
    themeSupport: false,
    responsiveSupport: true
  },
  {
    id: 'animated-chart-cards',
    name: 'Animated Chart Cards',
    type: 'card',
    compatible: false,
    issues: ['Heavy dependency on Chart.js', 'Not compatible with existing card structure', 'No TypeScript support'],
    adaptations: [],
    tailwindSupport: false,
    framerMotionSupport: false,
    themeSupport: false,
    responsiveSupport: false
  },
  {
    id: 'css-accordion',
    name: 'CSS Accordion',
    type: 'navigation',
    compatible: true,
    issues: ['Pure CSS implementation', 'No accessibility features'],
    adaptations: ['Add ARIA attributes', 'Convert to React component', 'Integrate theme system'],
    tailwindSupport: false,
    framerMotionSupport: false,
    themeSupport: false,
    responsiveSupport: true
  }
];

interface TemplateIntegratorProps {
  className?: string;
}

export const TemplateIntegrator: React.FC<TemplateIntegratorProps> = ({ className }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCompatibility | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern');
  const [profileType, setProfileType] = useState<ProfileType>('single');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Get theme configuration for preview
  const themeConfig = useProfileTheme(profileType, [gender], selectedTheme);

  const compatibleTemplates = useMemo(() => 
    AVAILABLE_TEMPLATES.filter(template => template.compatible),
    []
  );

  const incompatibleTemplates = useMemo(() => 
    AVAILABLE_TEMPLATES.filter(template => !template.compatible),
    []
  );

  const getCompatibilityScore = (template: TemplateCompatibility): number => {
    let score = 0;
    if (template.tailwindSupport) score += 25;
    if (template.framerMotionSupport) score += 25;
    if (template.themeSupport) score += 25;
    if (template.responsiveSupport) score += 25;
    return score;
  };

  const renderCompatibilityBadges = (template: TemplateCompatibility) => (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge variant={template.tailwindSupport ? "default" : "secondary"} className="text-xs">
        {template.tailwindSupport ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        Tailwind
      </Badge>
      <Badge variant={template.framerMotionSupport ? "default" : "secondary"} className="text-xs">
        {template.framerMotionSupport ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        Framer Motion
      </Badge>
      <Badge variant={template.themeSupport ? "default" : "secondary"} className="text-xs">
        {template.themeSupport ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        Temas v2.8.3
      </Badge>
      <Badge variant={template.responsiveSupport ? "default" : "secondary"} className="text-xs">
        {template.responsiveSupport ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        Responsive
      </Badge>
    </div>
  );

  const renderTemplatePreview = (template: TemplateCompatibility) => {
    if (template.type === 'chat') {
      return (
        <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20"></div>
            <div>
              <div className={cn("font-medium", themeConfig.textClass)}>Chat Preview</div>
              <div className={cn("text-sm", themeConfig.accentClass)}>En línea</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className={cn("p-2 rounded-lg bg-white/10", themeConfig.textClass)}>
              Mensaje de ejemplo con tema aplicado
            </div>
            <div className={cn("p-2 rounded-lg bg-white/20 ml-8", themeConfig.textClass)}>
              Respuesta con estilo temático
            </div>
          </div>
        </div>
      );
    }

    if (template.type === 'button') {
      return (
        <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass)}>
          <div className="grid grid-cols-2 gap-3">
            <Button className={cn("btn-animated hover:scale-105", themeConfig.accentClass)}>
              Hover Effect
            </Button>
            <Button variant="outline" className="btn-animated">
              Outline Style
            </Button>
            <Button className="btn-animated bg-gradient-to-r from-purple-500 to-pink-500">
              Gradient
            </Button>
            <Button variant="ghost" className={cn("btn-animated", themeConfig.textClass)}>
              Ghost Style
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("p-4 rounded-lg", themeConfig.backgroundClass, themeConfig.textClass)}>
        <div className="text-center">
          <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-75">Vista previa no disponible</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Integrador de Plantillas React</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Auditoría y compatibilidad con Sistema de Temas v2.8.3
        </p>
      </div>

      {/* Theme Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Configuración de Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tema</label>
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value as Theme)}
                className="w-full p-2 border rounded-md"
              >
                <option value="elegant">Elegante</option>
                <option value="modern">Moderno</option>
                <option value="vibrant">Vibrante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Perfil</label>
              <select 
                value={profileType} 
                onChange={(e) => setProfileType(e.target.value as ProfileType)}
                className="w-full p-2 border rounded-md"
              >
                <option value="single">Individual</option>
                <option value="couple">Pareja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Género</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full p-2 border rounded-md"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatible Templates */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Plantillas Compatibles ({compatibleTemplates.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compatibleTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <Card className={cn(
                "transition-all duration-300 hover:shadow-lg",
                selectedTemplate?.id === template.id && "ring-2 ring-purple-500"
              )}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {template.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {getCompatibilityScore(template)}%
                      </div>
                      <div className="text-xs text-gray-500">Compatibilidad</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderCompatibilityBadges(template)}
                  
                  {template.issues.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-orange-600 mb-1">Problemas:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {template.adaptations.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-blue-600 mb-1">Adaptaciones:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.adaptations.map((adaptation, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                            {adaptation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Vista Previa: {selectedTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Mobile Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">Mobile</span>
                    </div>
                    <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                      <div className="w-full max-w-xs mx-auto">
                        {renderTemplatePreview(selectedTemplate)}
                      </div>
                    </div>
                  </div>

                  {/* Tablet Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                      <div className="w-full max-w-md mx-auto">
                        {renderTemplatePreview(selectedTemplate)}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                      {renderTemplatePreview(selectedTemplate)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incompatible Templates */}
      {incompatibleTemplates.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Plantillas No Compatibles ({incompatibleTemplates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incompatibleTemplates.map((template) => (
              <Card key={template.id} className="opacity-60">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="destructive" className="mt-1">
                        {template.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {getCompatibilityScore(template)}%
                      </div>
                      <div className="text-xs text-gray-500">Compatibilidad</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderCompatibilityBadges(template)}
                  
                  <div className="mt-3">
                    <div className="text-sm font-medium text-red-600 mb-1">Razones de incompatibilidad:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {template.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <XCircle className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
