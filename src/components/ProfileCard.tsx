import { useState } from 'react';
import { Heart, MapPin, Star, X, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  profile: any; // Can be tightened later
  onLike?: (id: string) => void;
  onSuperLike?: (profile: any) => void;
}

export const ProfileCard = ({ profile, onLike, onSuperLike }: ProfileCardProps) => {
  const { id, name, age, location, interests, image, rating, isOnline = false } = profile;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${id}`);
  };

      const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(id);
  };

      const handleSuperLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSuperLike?.(profile);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        {!imageError && (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Online Status */}
        {isOnline && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-foreground">En línea</span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-3 h-3 text-accent fill-current" />
          <span className="text-xs font-medium text-foreground">{rating}</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-white">
            <h3 className="text-xl font-bold">{name}, {age}</h3>
            <div className="flex items-center space-x-1 text-white/80">
              <MapPin className="w-3 h-3" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleDislike}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleSuperLike}
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4" />
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
          {interests.slice(0, 3).map((interest: string, index: number) => (
            <span 
              key={index}
              className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {interest}
            </span>
          ))}
          {interests.length > 3 && (
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
            <X className="w-4 h-4 mr-2" />
            Pasar
          </Button>
                  <Button variant="love" size="sm" className="flex-1" onClick={handleLike} disabled={!onLike}>
            <Heart className="w-4 h-4 mr-2" />
            Me Gusta
          </Button>
        </div>
        
        {/* View Profile Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            handleViewProfile();
          }}
        >
          Ver Perfil Completo
        </Button>
      </div>
    </div>
  );
};