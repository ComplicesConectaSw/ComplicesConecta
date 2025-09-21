import { z } from 'zod';

// Esquemas de validación para props visuales
export const ColorScheme = z.enum([
  'purple', 'pink', 'blue', 'green', 'red', 'yellow', 'gray'
]);

export const ContrastLevel = z.enum([
  'low', 'medium', 'high', 'wcag-aa', 'wcag-aaa'
]);

export const BackgroundType = z.enum([
  'gradient', 'solid', 'transparent', 'image'
]);

export const ButtonVariant = z.enum([
  'default', 'outline', 'ghost', 'love', 'destructive', 'secondary'
]);

export const ButtonSize = z.enum([
  'sm', 'md', 'lg', 'xl'
]);

// Validación de colores - NO permitir blancos/negros puros
export const ColorValidator = z.string().refine((color) => {
  const forbiddenColors = [
    'bg-white', 'bg-black', 'text-white', 'text-black',
    '#ffffff', '#000000', 'white', 'black'
  ];
  return !forbiddenColors.some(forbidden => color.includes(forbidden));
}, {
  message: "No se permiten colores blancos o negros puros. Usar gradientes o colores con transparencia."
});

// Validación de contraste WCAG
export const ContrastValidator = z.object({
  foreground: z.string(),
  background: z.string(),
  level: ContrastLevel,
  ratio: z.number().min(3).max(21) // WCAG AA mínimo 3:1, AAA mínimo 4.5:1
});

// Props de componentes visuales
export const VisualComponentProps = z.object({
  className: z.string().optional(),
  variant: ButtonVariant.optional(),
  size: ButtonSize.optional(),
  gradient: z.boolean().optional(),
  contrast: ContrastValidator.optional(),
  accessible: z.boolean().default(true)
});

// Validación de botones funcionales
export const ButtonProps = z.object({
  onClick: z.function().optional(),
  href: z.string().optional(),
  disabled: z.boolean().optional(),
  type: z.enum(['button', 'submit', 'reset']).optional()
}).refine((props) => {
  // Al menos debe tener onClick o href para ser funcional
  return props.onClick || props.href;
}, {
  message: "El botón debe tener onClick o href para ser funcional"
});

// Validación de navegación
export const NavigationProps = z.object({
  showLegacy: z.boolean(),
  isDemoMode: z.boolean(),
  hideHeader: z.boolean().optional(),
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    path: z.string(),
    icon: z.any(),
    onClick: z.function().optional()
  }))
});

// Validación de texto accesible
export const TextProps = z.object({
  content: z.string(),
  className: z.string(),
  contrast: z.enum(['low', 'medium', 'high']).default('medium')
}).refine((props) => {
  // Verificar que no use text-gray-500 o menor
  const lowContrastClasses = [
    'text-gray-400', 'text-gray-500', 'text-gray-300'
  ];
  return !lowContrastClasses.some(cls => props.className.includes(cls));
}, {
  message: "Usar text-gray-700 dark:text-gray-200 o superior para mejor contraste"
});

// Función de validación principal
export const validateVisualProps = (component: string, props: any) => {
  try {
    switch (component) {
      case 'Button':
        return ButtonProps.parse(props);
      case 'Text':
        return TextProps.parse(props);
      case 'Navigation':
        return NavigationProps.parse(props);
      default:
        return VisualComponentProps.parse(props);
    }
  } catch (error) {
    console.error(`❌ Validación visual falló para ${component}:`, error);
    throw error;
  }
};

// Utilidades de contraste
export const calculateContrast = (fg: string, bg: string): number => {
  // Implementación simplificada - en producción usar una librería como chroma-js
  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
};

const getLuminance = (color: string): number => {
  // Implementación simplificada
  if (color.includes('gray-700')) return 0.3;
  if (color.includes('gray-500')) return 0.5;
  if (color.includes('gray-400')) return 0.6;
  if (color.includes('white')) return 1;
  if (color.includes('black')) return 0;
  return 0.5; // Default
};

export const isWCAGCompliant = (contrast: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
  return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
};
