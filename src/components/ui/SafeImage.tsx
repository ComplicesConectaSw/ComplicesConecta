import React, { useState } from 'react';
import { User, Users, Heart } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: 'profile' | 'couple' | 'generic';
  width?: number;
  height?: number;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'generic',
  width,
  height
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const getFallbackIcon = () => {
    switch (fallbackType) {
      case 'profile':
        return <User className="w-8 h-8 text-white/60" />;
      case 'couple':
        return <Users className="w-8 h-8 text-white/60" />;
      default:
        return <Heart className="w-8 h-8 text-white/60" />;
    }
  };

  const getFallbackGradient = () => {
    switch (fallbackType) {
      case 'profile':
        return 'bg-gradient-to-br from-purple-500/20 to-pink-500/20';
      case 'couple':
        return 'bg-gradient-to-br from-blue-500/20 to-purple-500/20';
      default:
        return 'bg-gradient-to-br from-gray-500/20 to-gray-600/20';
    }
  };

  if (hasError) {
    return (
      <div 
        className={`${getFallbackGradient()} border border-white/20 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          {getFallbackIcon()}
          <p className="text-xs text-white/70 mt-1">Sin imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className={`absolute inset-0 ${getFallbackGradient()} animate-pulse flex items-center justify-center`}
        >
          {getFallbackIcon()}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default SafeImage;
