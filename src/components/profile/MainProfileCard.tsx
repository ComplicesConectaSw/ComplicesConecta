import { useState } from 'react';
import { Heart, MessageCircle, MapPin, Verified, Star, Wifi, WifiOff, X, Zap } from "lucide-react";
import { useUserOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  profile: {
    id: string;
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
  };
  onLike?: (id: string) => void;
  onSuperLike?: (profile: ProfileCardProps['profile']) => void;
  onOpenModal: () => void;
}

export const ProfileCard = ({ profile, onLike, onSuperLike, onOpenModal }: ProfileCardProps) => {
  const { getUserOnlineStatus, getLastSeenTime } = useUserOnlineStatus();
  const profileId = String(profile.id);
  const isOnline = profile.isOnline ?? getUserOnlineStatus(profileId);
  const lastSeen = profile.lastSeen ?? getLastSeenTime(profileId);
  const { id, name, age, location, interests, image, rating, isOnline: onlineStatus = false } = profile;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenModal();
  };

  const handleSuperLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenModal();
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenModal();
    toast({
      title: "Perfil omitido",
      description: `Has pasado el perfil de ${name}`,
    });
  };

  return (
    <div 
      className="group relative bg-card-gradient rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 transform hover:scale-105 cursor-pointer"
      onClick={handleViewProfile}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageError && image ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              console.log('Error loading image:', image);
              setImageError(true);
            }}
            onLoad={() => console.log('Image loaded successfully:', image)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-2">👤</div>
              <p className="text-sm opacity-80">Imagen no disponible</p>
            </div>
          </div>
        )}
        
        {/* Online Status */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-1 sm:space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-medium text-white">En línea</span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
          <span className="text-[10px] sm:text-xs font-medium text-white">{rating || 4.9}</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-center items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-1 sm:space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleDislike}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleSuperLike}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Verification Badge */}
        {profile.verified && (
          <div className="absolute bottom-12 sm:bottom-16 left-2 sm:left-4 bg-blue-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1">
            <Verified className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Verificado</span>
            <span className="sm:hidden">✓</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors truncate">
            {name}, {age}
          </h3>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{location}</span>
          </div>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
          {interests?.slice(0, 3).map((interest: string, index: number) => (
            <span 
              key={index}
              className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full transition-colors hover:bg-purple-200 truncate max-w-[80px] sm:max-w-none"
            >
              {interest}
            </span>
          ))}
          {interests && interests.length > 3 && (
            <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-full">
              +{interests.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-background border-border text-gray-600 hover:bg-muted hover:text-gray-800 font-semibold"
            onClick={handleDislike}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" strokeWidth={2.5} />
            <span className="hidden sm:inline">Pasar</span>
            <span className="sm:hidden">✕</span>
          </Button>
          <Button variant="love" size="sm" className="flex-1" onClick={handleLike} disabled={!onLike}>
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" strokeWidth={2.5} />
            <span className="hidden sm:inline">Me Gusta</span>
            <span className="sm:hidden">♥</span>
          </Button>
        </div>
        
        {/* View Profile Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewProfile();
          }}
          className="w-full mt-2 text-gray-600 hover:text-gray-800 transition-colors text-xs sm:text-sm py-2 hover:bg-gray-100 rounded-md font-medium"
        >
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};