/**
 * Componente de Imagen con Fallback Elegante
 * Maneja errores de carga con glassmorphism profesional
 */

import React, { useState } from 'react';
import { Lock, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: 'private' | 'public' | 'error';
  fallbackText?: string;
  onClick?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'public',
  fallbackText,
  onClick,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const getFallbackConfig = () => {
    switch (fallbackType) {
      case 'private':
        return {
          gradient: 'from-purple-900/90 via-purple-800/90 to-blue-900/90',
          icon: <Lock className="h-8 w-8 text-purple-300 mb-2" />,
          title: '🔒 Contenido Privado',
          subtitle: fallbackText || 'Imagen no disponible',
          border: 'border-purple-400/30'
        };
      case 'error':
        return {
          gradient: 'from-red-900/90 via-red-800/90 to-orange-900/90',
          icon: <AlertCircle className="h-8 w-8 text-red-300 mb-2" />,
          title: '⚠️ Error de Carga',
          subtitle: fallbackText || 'No se pudo cargar la imagen',
          border: 'border-red-400/30'
        };
      default: // public
        return {
          gradient: 'from-gray-900/90 via-gray-800/90 to-slate-900/90',
          icon: <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />,
          title: '🖼️ Imagen',
          subtitle: fallbackText || 'Contenido no disponible',
          border: 'border-gray-400/30'
        };
    }
  };

  const fallbackConfig = getFallbackConfig();

  if (hasError) {
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br ${fallbackConfig.gradient} backdrop-blur-sm rounded-lg border ${fallbackConfig.border} flex flex-col items-center justify-center text-center p-4 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''} ${className}`}
        onClick={onClick}
      >
        {fallbackConfig.icon}
        <span className="text-xs text-white/80 font-medium mb-1">
          {fallbackConfig.title}
        </span>
        <span className="text-xs text-white/60">
          {fallbackConfig.subtitle}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg border border-gray-400/30 flex flex-col items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin mb-2"></div>
          <span className="text-xs text-white/60">Cargando...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
    </div>
  );
};

export default ImageWithFallback;
