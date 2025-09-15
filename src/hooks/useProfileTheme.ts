import { useMemo } from "react";

export type Gender = "male" | "female";
export type ProfileType = "single" | "couple";
export type Theme = "elegant" | "modern" | "vibrant";

export interface ProfileThemeConfig {
  backgroundClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
}

/**
 * Hook para generar temas visuales dinámicos basados en género, tipo de perfil y tema seleccionado
 * @param profileType - Tipo de perfil: 'single' o 'couple'
 * @param genders - Array de géneros ['male'] para single, ['male', 'female'] para pareja
 * @param theme - Tema adicional opcional: 'elegant', 'modern', 'vibrant'
 * @returns Configuración completa de clases CSS para el tema
 */
export const useProfileTheme = (
  profileType: ProfileType,
  genders: Gender[],
  theme?: Theme
): ProfileThemeConfig => {
  return useMemo(() => {
    // 🎨 Temas adicionales tienen prioridad máxima
    if (theme === "elegant") {
      return {
        backgroundClass: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
        textClass: "text-white",
        accentClass: "text-gray-300",
        borderClass: "border-gray-700"
      };
    }
    
    if (theme === "modern") {
      return {
        backgroundClass: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
        textClass: "text-white",
        accentClass: "text-indigo-100",
        borderClass: "border-indigo-400"
      };
    }
    
    if (theme === "vibrant") {
      return {
        backgroundClass: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
        textClass: "text-white",
        accentClass: "text-pink-100",
        borderClass: "border-pink-400"
      };
    }

    // 👤 Perfiles Single - Diferenciación por género
    if (profileType === "single") {
      if (genders[0] === "male") {
        return {
          backgroundClass: "bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900",
          textClass: "text-white",
          accentClass: "text-blue-200",
          borderClass: "border-blue-700"
        };
      } else {
        return {
          backgroundClass: "bg-gradient-to-br from-pink-400 via-purple-500 to-pink-600",
          textClass: "text-white",
          accentClass: "text-pink-100",
          borderClass: "border-pink-400"
        };
      }
    }

    // 💑 Perfiles Pareja - Diferenciación por combinación de géneros
    if (profileType === "couple") {
      // Pareja de hombres
      if (genders[0] === "male" && genders[1] === "male") {
        return {
          backgroundClass: "bg-gradient-to-br from-blue-900 via-gray-700 to-black",
          textClass: "text-white",
          accentClass: "text-blue-200",
          borderClass: "border-blue-800"
        };
      }
      
      // Pareja de mujeres
      if (genders[0] === "female" && genders[1] === "female") {
        return {
          backgroundClass: "bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700",
          textClass: "text-white",
          accentClass: "text-pink-100",
          borderClass: "border-pink-400"
        };
      }
      
      // Pareja mixta (hombre + mujer)
      return {
        backgroundClass: "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500",
        textClass: "text-white",
        accentClass: "text-purple-100",
        borderClass: "border-purple-400"
      };
    }

    // Fallback por defecto
    return {
      backgroundClass: "bg-gradient-to-br from-gray-800 to-gray-900",
      textClass: "text-white",
      accentClass: "text-gray-300",
      borderClass: "border-gray-600"
    };
  }, [profileType, genders, theme]);
};

/**
 * Hook simplificado que retorna solo la clase de fondo para compatibilidad
 */
export const useProfileBackground = (
  profileType: ProfileType,
  genders: Gender[],
  theme?: Theme
): string => {
  const config = useProfileTheme(profileType, genders, theme);
  return `${config.backgroundClass} ${config.textClass}`;
};

/**
 * Utilidad para obtener el nombre descriptivo del tema
 */
export const getThemeDisplayName = (theme?: Theme): string => {
  switch (theme) {
    case "elegant":
      return "Elegante";
    case "modern":
      return "Moderno";
    case "vibrant":
      return "Vibrante";
    default:
      return "Por defecto";
  }
};

/**
 * Utilidad para obtener todos los temas disponibles
 */
export const getAvailableThemes = (): { value: Theme; label: string }[] => [
  { value: "elegant", label: "Elegante" },
  { value: "modern", label: "Moderno" },
  { value: "vibrant", label: "Vibrante" }
];
