import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme, getAvailableThemes, getThemeDisplayName } from '@/hooks/useProfileTheme';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/badge';

interface ThemeSelectorProps {
  selectedTheme?: Theme;
  onThemeChange: (theme?: Theme) => void;
  className?: string;
  showPreview?: boolean;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  className,
  showPreview = true,
  compact = false
}) => {
  const themes = getAvailableThemes();

  const getThemePreviewClass = (theme: Theme): string => {
    switch (theme) {
      case 'elegant':
        return 'bg-gradient-to-r from-gray-900 via-gray-800 to-black';
      case 'modern':
        return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
      case 'vibrant':
        return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Palette className="h-4 w-4 text-gray-500" />
        <select
          value={selectedTheme || ''}
          onChange={(e) => onThemeChange(e.target.value as Theme || undefined)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          aria-label="Selector de tema visual"
          title="Selecciona un tema visual para tu perfil"
        >
          <option value="">Por defecto</option>
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Tema Visual</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Tema por defecto */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative p-3 rounded-lg border-2 cursor-pointer transition-all",
            !selectedTheme
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          )}
          onClick={() => onThemeChange(undefined)}
        >
          {showPreview && (
            <div className="h-8 w-full bg-gradient-to-r from-gray-600 to-gray-700 rounded mb-2" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Por defecto
            </span>
            {!selectedTheme && (
              <Check className="h-4 w-4 text-purple-600" />
            )}
          </div>
        </motion.div>

        {/* Temas personalizados */}
        {themes.map((theme) => (
          <motion.div
            key={theme.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-3 rounded-lg border-2 cursor-pointer transition-all",
              selectedTheme === theme.value
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onThemeChange(theme.value)}
          >
            {showPreview && (
              <div className={cn(
                "h-8 w-full rounded mb-2",
                getThemePreviewClass(theme.value)
              )} />
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {theme.label}
              </span>
              {selectedTheme === theme.value && (
                <Check className="h-4 w-4 text-purple-600" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTheme && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Badge variant="secondary" className="text-xs">
            Tema activo: {getThemeDisplayName(selectedTheme)}
          </Badge>
        </motion.div>
      )}
    </div>
  );
};

interface ThemePreviewCardProps {
  theme?: Theme;
  gender: 'male' | 'female';
  accountType: 'single' | 'couple';
  partnerGender?: 'male' | 'female';
  name: string;
  className?: string;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  theme,
  gender,
  accountType,
  partnerGender,
  name,
  className
}) => {
  const genders = accountType === 'couple' && partnerGender 
    ? [gender, partnerGender] 
    : [gender];

  const getBackgroundClass = (): string => {
    if (theme === "elegant") return "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white";
    if (theme === "modern") return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white";
    if (theme === "vibrant") return "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white";

    if (accountType === "single") {
      return gender === "male"
        ? "bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-pink-400 via-purple-500 to-pink-600 text-white";
    }

    if (accountType === "couple") {
      if (genders[0] === "male" && genders[1] === "male") {
        return "bg-gradient-to-br from-blue-900 via-gray-700 to-black text-white";
      }
      if (genders[0] === "female" && genders[1] === "female") {
        return "bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700 text-white";
      }
      return "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 text-white";
    }

    return "bg-gray-800 text-white";
  };

  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl shadow-lg",
        getBackgroundClass(),
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-white/80 text-sm">
            {getThemeDisplayName(theme)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
