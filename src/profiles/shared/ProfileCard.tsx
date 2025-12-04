import { useState } from 'react';
import { Heart, MapPin, Verified, Star, Wifi, WifiOff, X, Zap } from "lucide-react";
import { useUserOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";

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

export const ProfileCard = ({ profile, onLike, onSuperLike: _onSuperLike, onOpenModal }: ProfileCardProps) => {
  const { getUserOnlineStatus, getLastSeenTime } = useUserOnlineStatus();
  const profileId = String(profile.id);
  const isOnline = profile.isOnline ?? getUserOnlineStatus(profileId);
  const lastSeen = profile.lastSeen ?? getLastSeenTime(profileId);
  const { id, name, age, location, interests, image, rating } = profile;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${id}`);
  };

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOpenModal();
  };

  const handleSuperLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOpenModal();
  };

  const handleDislike = (e: React.MouseEvent<HTMLButtonElement>) => {
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
            onError={() => {
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
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-white">En línea</span>
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-3 h-3 text-accent fill-current" />
          <span className="text-xs font-medium text-white">{rating || 4.9}</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-white">
            <div className="absolute top-3 left-3 flex gap-2">
              {profile.verified && (
                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Verified className="h-3 w-3" />
                  Verificado
                </div>
              )}
              {(interests || []).length > 3 ? (
                <>
                  {(interests || []).slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-white/20 text-white border-white/30">
                      {interest}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/20 text-white border-white/30">
                    +{(interests || []).length - 3} más
                  </Badge>
                </>
              ) : (
                (interests || []).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-white/20 text-white border-white/30">
                    {interest}
                  </Badge>
                ))
              )}
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                isOnline 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'Online' : lastSeen}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleDislike}
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleSuperLike}
            >
              <Zap className="w-5 h-5" strokeWidth={2.5} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleLike}
            >
              <Heart className="w-5 h-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {name}, {age}
          </h3>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interests?.slice(0, 3).map((interest: string, index: number) => (
            <span 
              key={index}
              className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {interest}
            </span>
          ))}
          {interests && interests.length > 3 && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              +{interests.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-background border-border text-foreground hover:bg-muted hover:text-foreground font-semibold"
            onClick={handleDislike}
          >
            <X className="w-5 h-5 mr-2" strokeWidth={2.5} />
            Pasar
          </Button>
          <Button variant="default" size="sm" className="flex-1" onClick={handleLike} disabled={!onLike}>
            <Heart className="w-5 h-5 mr-2" strokeWidth={2.5} />
            Me Gusta
          </Button>
        </div>
        
        {/* View Profile Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewProfile();
          }}
          className="w-full mt-2 text-white hover:text-white/90 transition-colors text-sm py-2 hover:bg-white/10 rounded-md font-medium"
        >
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

