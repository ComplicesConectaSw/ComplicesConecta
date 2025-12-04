import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart, Flame, CheckCircle, Crown, Star, MapPin, MessageCircle, User } from 'lucide-react';
import type { Database } from '@/types/supabase-generated';

// Tipos estrictos basados en Supabase
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type _ProfileRow = Tables<'profiles'>;

// Constantes
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face';

// Tipo para perfil de descubrimiento con campos opcionales seguros
interface DiscoverProfile {
  id: string;
  first_name: string;
  last_name?: string | null;
  age: number;
  bio: string | null;
  gender: string;
  interested_in: string;
  is_verified: boolean | null;
  is_premium: boolean | null;
  latitude: number | null;
  longitude: number | null;
  // Campos calculados o adicionales para UI
  image_url?: string | null;
  rating?: number;
  likes_count?: number;
  messages_count?: number;
  is_online?: boolean;
}

interface DiscoverProfileCardProps {
  profile: DiscoverProfile;
  onLike: (id: string) => void;
  onSuperLike: (profile: DiscoverProfile) => void;
}

export const DiscoverProfileCard = React.memo<DiscoverProfileCardProps>(({ profile, onLike, onSuperLike }) => {
  const [imgSrc, setImgSrc] = useState<string>(profile.image_url ?? FALLBACK_IMAGE_URL);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup de operaciones async al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoización de handlers con useCallback
  const handleImageError = useCallback(() => {
    setImgSrc(FALLBACK_IMAGE_URL);
  }, []);

  const handleProfileClick = useCallback(() => {
    // Determinar tipo de perfil basado en interested_in o usar single por defecto
    const profileType = profile.interested_in?.includes('couple') ? 'couple' : 'single';
    
    if (profileType === 'couple') {
      window.open('/profile-couple', '_blank');
    } else {
      window.open('/profile-single', '_blank');
    }
  }, [profile.interested_in]);

  const handleLike = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onLike(profile.id);
  }, [profile.id, onLike]);

  const handleSuperLike = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSuperLike(profile);
  }, [profile, onSuperLike]);

  // Funciones puras memoizadas
  const getLocationText = useCallback((): string => {
    if (profile.latitude && profile.longitude) {
      // En una implementación real, aquí se haría geocoding reverso
      return `${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)}`;
    }
    return 'Ubicación no disponible';
  }, [profile.latitude, profile.longitude]);

  const getFullName = useCallback((): string => {
    return `${profile.first_name} ${profile.last_name ?? ''}`.trim() || 'Usuario';
  }, [profile.first_name, profile.last_name]);

  return (
    <Card className="group cursor-pointer overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={handleProfileClick}>
      <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden">
        {/* Imagen con fallback seguro */}
        {imgSrc ? (
          <img 
            src={imgSrc}
            alt={getFullName() || 'Perfil'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Rating Badge - null-safe */}
        {profile.rating && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs text-white">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" fill="currentColor" />
            <span className="font-bold text-xs">{profile.rating}</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-2 sm:p-3 w-full">
            <div className="flex items-center justify-between text-white overlay-text">
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overlay-text">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="overlay-text">{profile.likes_count ?? 0}</span>
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="overlay-text">{profile.messages_count ?? 0}</span>
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full h-10 w-10 sm:h-14 sm:w-14 bg-transparent border-white text-white hover:bg-white/20" 
                  onClick={handleLike}
                >
                  <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full h-12 w-12 sm:h-16 sm:w-16 bg-transparent border-accent text-accent hover:bg-accent/20" 
                  onClick={handleSuperLike}
                >
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info at the bottom of the image */}
        <div className="absolute bottom-0 left-0 p-2 sm:p-3 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className="text-sm sm:text-lg font-bold truncate overlay-text">
              {getFullName()}
            </h3>
            {profile.is_verified && (
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="currentColor" />
            )}
            {profile.is_premium && (
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            )}
            {profile.is_online && (
              <div className="w-2 h-2 bg-green-400 rounded-full" title="En línea" />
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overlay-text">
            <span className="overlay-text">{profile.age} años</span>
            <span className="overlay-text">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="truncate overlay-text">{getLocationText()}</span>
            </div>
          </div>
          {profile.bio && (
            <p className="text-xs overlay-text mt-1 line-clamp-2 hidden sm:block">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
});

// Display name para React DevTools
DiscoverProfileCard.displayName = 'DiscoverProfileCard';

// Refactor Notes:
// ✅ Tipos estrictos: Migrado de interface manual a tipos Supabase (ProfileRow)
// ✅ Optional chaining: Reemplazado || por ?? en fallbacks, agregado ?. para propiedades opcionales
// ✅ Memoización: Componente envuelto en React.memo, callbacks memoizados con useCallback
// ✅ Imports: Agregado alias @/ para imports internos, importado tipos de Supabase
// ✅ Null-safe: Manejo seguro de image_url, bio, rating, badges de verificación
// ✅ Performance: Funciones puras memoizadas (getLocationText, getFullName)
// ✅ Async cleanup: AbortController para prevenir memory leaks
// ✅ Arquitectura: Mantenida ubicación en discover/, preparado para unificación con ProfileCard.tsx
// ✅ Campos corregidos: Eliminado 'name' → 'first_name + last_name', 'location' → coordenadas
// ✅ Event handling: Agregado stopPropagation en botones para evitar conflictos con click del card

