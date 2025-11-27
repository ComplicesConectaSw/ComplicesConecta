import React, { useState, memo, useMemo, useCallback } from 'react';
import { Heart, MapPin, Verified, Star, X, Zap } from "lucide-react";
import { useUserOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { logger } from '@/lib/logger';
import { useProfileTheme, Gender, ProfileType, Theme } from '@/features/profile/useProfileTheme';
import { cn } from '@/shared/lib/cn';
import { validateProfileCard } from '@/lib/zod-schemas';

interface ProfileCardProps {
  profile: {
    id: string | number;
    name: string;
    age?: number;
    location?: string;
    image?: string;
    interests?: string[];
    bio?: string;
    isOnline?: boolean;
    lastSeen?: string;
    verified?: boolean;
    rating?: number;
    // Propiedades para personalización visual
    gender?: Gender;
    partnerGender?: Gender;
    accountType?: ProfileType;
    theme?: Theme;
    // Propiedades específicas para parejas
    couple_name?: string;
    partner1_first_name?: string;
    partner1_age?: number;
    partner2_first_name?: string;
    partner2_age?: number;
  };
  onLike?: (id: string) => void;
  onSuperLike?: (profile: ProfileCardProps['profile']) => void;
  onOpenModal?: () => void;
  // Props de configuración
  useThemeBackground?: boolean;
  variant?: 'single' | 'couple' | 'discover' | 'animated';
  showQuickActions?: boolean;
  showViewProfile?: boolean;
}

const MainProfileCardComponent = ({ 
  profile, 
  onLike, 
  onSuperLike, 
  onOpenModal, 
  useThemeBackground = false,
  variant = 'single',
  showQuickActions: _showQuickActions = true,
  showViewProfile = true 
}: ProfileCardProps) => {
  // Validar props con Zod
  try {
    validateProfileCard(profile);
  } catch (__error) {
    logger.error('âŒ Error validando ProfileCard:', { error: __error });
  }
  const { getUserOnlineStatus, getLastSeenTime } = useUserOnlineStatus();
  const profileId = String(profile.id);
  const _isOnline = profile.isOnline ?? getUserOnlineStatus(profileId);
  const _lastSeen = profile.lastSeen ?? getLastSeenTime(profileId);
  const { id, name, age, location, interests, image, rating, isOnline: _onlineStatus = false, gender = 'male', partnerGender, accountType = 'single', theme } = profile;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [_imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(image);

  // Configurar géneros para el hook de tema - memoizado
  const genders: Gender[] = useMemo(() => 
    accountType === 'couple' && partnerGender 
      ? [gender, partnerGender] 
      : [gender],
    [accountType, gender, partnerGender]
  );
  
  // Obtener configuración de tema
  const themeConfig = useProfileTheme(accountType, genders, theme);

  const handleViewProfile = useCallback(() => {
    navigate(`/profile/${id}`);
  }, [navigate, id]);

  const handleLike = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onLike) onLike(String(id));
    if (onOpenModal) onOpenModal();
  }, [onLike, onOpenModal, id]);

  const handleSuperLike = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onSuperLike) onSuperLike(profile);
    if (onOpenModal) onOpenModal();
  }, [onSuperLike, onOpenModal, profile]);

  const handleDislike = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onOpenModal) onOpenModal();
    toast({
      title: "Perfil omitido",
      description: `Has pasado el perfil de ${variant === 'couple' ? profile.couple_name || name : name}`,
    });
  }, [onOpenModal, variant, profile.couple_name, name]);

  return (
    <div 
      className={cn(
        "group relative rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 transform hover:scale-105 cursor-pointer border border-white/20 backdrop-blur-sm bg-black/10",
        useThemeBackground 
          ? `${themeConfig.backgroundClass} ${themeConfig.textClass}` 
          : "bg-card-gradient"
      )}
      onClick={showViewProfile ? handleViewProfile : undefined}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!_imageError && currentImageSrc && currentImageSrc.startsWith('http') ? (
          <img 
            src={currentImageSrc} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            crossOrigin="anonymous"
            onError={(e) => {
              // Silenciar errores de CORS/OpaqueResponseBlocking
              const target = e.target as HTMLImageElement;
              const error = e.nativeEvent as any;
              
              // Verificar si es un error de CORS/OpaqueResponseBlocking
              const isCorsError = error?.message?.includes('OpaqueResponseBlocking') || 
                                error?.message?.includes('CORS') ||
                                target.src.includes('unsplash.com');
              
              if (!isCorsError) {
                logger.warn('Image failed to load, trying fallback:', { image: currentImageSrc });
              }
              
              // Intentar con imagen de respaldo
              const fallbackImages = [
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&h=700&fit=crop&crop=face&q=80&auto=format',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop&crop=face&q=80&auto=format',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=700&fit=crop&crop=face&q=80&auto=format'
              ];
              
              const currentIndex = fallbackImages.indexOf(currentImageSrc);
              const nextIndex = (currentIndex + 1) % fallbackImages.length;
              
              if (currentIndex === -1 || nextIndex === 0) {
                // Si no es una imagen de respaldo o ya probamos todas, usar fallback visual
                setImageError(true);
              } else {
                // Intentar con la siguiente imagen de respaldo
                setCurrentImageSrc(fallbackImages[nextIndex]);
              }
            }}
            onLoad={() => logger.info('Image loaded successfully:', { image: currentImageSrc })}
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            useThemeBackground 
              ? themeConfig.backgroundClass 
              : "bg-gradient-to-br from-purple-400 to-pink-400"
          )}>
            <div className={cn(
              "text-center",
              useThemeBackground ? themeConfig.textClass : "text-white"
            )}>
              {/* Silueta 3D profesional como en la imagen */}
              <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-sm opacity-80">Imagen actualizada</p>
            </div>
          </div>
        )}
        
        {/* Online Status */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-md rounded-full px-2 sm:px-3 py-1 border border-white/30">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm" />
          <span className="text-[10px] sm:text-xs font-semibold text-white">En línea</span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center space-x-1 bg-white/20 backdrop-blur-md rounded-full px-2 sm:px-3 py-1 border border-white/30">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-current" />
          <span className="text-[10px] sm:text-xs font-semibold text-white">{rating || 4.9}</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-center items-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex space-x-2 sm:space-x-3">
            <Button 
              size="icon" 
              variant="glass" 
              className="w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300"
              onClick={handleDislike}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="glass" 
              className="w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300"
              onClick={handleSuperLike}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="glass" 
              className="w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300 animate-heart-beat"
              onClick={handleLike}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} fill="currentColor" />
            </Button>
          </div>
        </div>

        {/* Verification Badge - Corregido para coincidir con imagen */}
        {profile.verified && (
          <div className="absolute bottom-14 sm:bottom-16 left-3 sm:left-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 shadow-sm">
            <Verified className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Verificado</span>
            <span className="sm:hidden">âœ“</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-5 sm:p-6 bg-black/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            "text-lg sm:text-xl font-heading font-bold group-hover:text-primary transition-colors truncate",
            useThemeBackground ? themeConfig.textClass : "text-white"
          )}>
            {name}, {age}
          </h3>
          <div className={cn(
            "flex items-center space-x-1",
            useThemeBackground ? themeConfig.accentClass : "text-white"
          )}>
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate font-medium">{location}</span>
          </div>
        </div>

        {/* Interests - Corregido para coincidir con imagen */}
        <div className="flex flex-wrap gap-2 sm:gap-2 mb-5">
          {interests?.slice(0, 3).map((interest: string, index: number) => {
            const colors = [
              'bg-gradient-to-r from-pink-500 to-pink-600 text-white border border-pink-400', // Rosa sólido
              'bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-400', // Naranja sólido
              'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border border-amber-400', // Ámbar sólido
            ];
            return (
              <span 
                key={index}
                className={`px-3 py-1.5 ${colors[index % colors.length]} text-[11px] sm:text-xs rounded-full font-medium truncate max-w-[100px] sm:max-w-none`}
              >
                {interest}
              </span>
            );
          })}
          {interests && interests.length > 3 && (
            <span className="px-3 py-1.5 bg-white/20 text-white text-[11px] sm:text-xs rounded-full font-medium border border-white/30">
              +{interests.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons - Alineados y centrados */}
        <div className="flex justify-center items-center space-x-3 px-2">
          <Button 
            variant="outline" 
            size="action" 
            className="flex-1 max-w-[140px] bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-pink-400 text-white hover:from-pink-600 hover:to-purple-700 hover:border-pink-500 font-semibold transition-all duration-300 min-h-[44px] flex items-center justify-center"
            onClick={handleDislike}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" strokeWidth={2.5} />
            <span className="hidden sm:inline text-sm">Pasar</span>
            <span className="sm:hidden text-sm">âœ•</span>
          </Button>
          <Button 
            variant="love" 
            size="action" 
            className="flex-1 max-w-[140px] font-bold min-h-[44px] flex items-center justify-center" 
            onClick={handleLike} 
            disabled={!onLike}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" strokeWidth={2.5} fill="currentColor" />
            <span className="hidden sm:inline text-sm">Me Gusta</span>
            <span className="sm:hidden text-sm">â™¥</span>
          </Button>
        </div>
        
        {/* View Profile Button */}
        <button
          onClick={(_e) => {
            _e.stopPropagation();
            handleViewProfile();
          }}
          className="w-full mt-3 text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-sm py-2 rounded-lg font-semibold border border-purple-500 hover:border-purple-600 shadow-md hover:shadow-lg"
        >
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};

// Export con memo para optimización de performance
export const MainProfileCard = memo(MainProfileCardComponent);

// Export alias for backward compatibility
export { MainProfileCard as ProfileCard };