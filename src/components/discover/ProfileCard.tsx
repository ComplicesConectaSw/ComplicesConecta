import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Flame, CheckCircle, Crown, Star, MapPin, MessageCircle } from 'lucide-react';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face';

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
    verified?: boolean;
    type?: 'single' | 'couple';
    rating?: number;
    likes?: number;
    messages?: number;
    isVerified?: boolean;
    isPremium?: boolean;
  };
  onLike: (id: string) => void;
  onSuperLike: (profile: ProfileCardProps['profile']) => void;
}

export const ProfileCard = ({ profile, onLike, onSuperLike }: ProfileCardProps) => {
  const [imgSrc, setImgSrc] = useState(profile.image || FALLBACK_IMAGE_URL);

  const handleError = () => {
    setImgSrc(FALLBACK_IMAGE_URL);
  };

  const handleProfileClick = () => {
    if (profile.type === 'couple') {
      window.open('/profile-couple', '_blank');
    } else {
      window.open('/profile-single', '_blank');
    }
  };

  return (
    <Card className="group cursor-pointer overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={handleProfileClick}>
      <div className="relative h-80 overflow-hidden">
        <img 
          src={imgSrc}
          alt={profile.name || 'Perfil'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full text-xs text-white">
          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
          {profile.rating && <span className="font-bold">{profile.rating}</span>}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-3 w-full">
            <div className="flex items-center justify-between text-white overlay-text">
              <div className="flex items-center space-x-2 text-sm overlay-text">
                <Heart className="h-4 w-4" />
                <span className="overlay-text">{profile.likes || 0}</span>
                <MessageCircle className="h-4 w-4" />
                <span className="overlay-text">{profile.messages || 0}</span>
              </div>
              <div className="flex gap-4">
                <Button size="icon" variant="outline" className="rounded-full h-14 w-14 bg-transparent border-white text-white hover:bg-white/20" onClick={() => onLike(profile?.id)}>
                  <Heart className="w-7 h-7" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full h-16 w-16 bg-transparent border-accent text-accent hover:bg-accent/20" onClick={() => onSuperLike(profile)}>
                  <Flame className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info at the bottom of the image */}
        <div className="absolute bottom-0 left-0 p-3 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate overlay-text">{profile.name}</h3>
            {profile.isVerified && <CheckCircle className="w-4 h-4 text-blue-400" fill="currentColor" />}
            {profile.isPremium && <Crown className="w-4 h-4 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-2 text-sm overlay-text">
            <span className="overlay-text">{profile.age} años</span>
            <span className="overlay-text">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate overlay-text">{profile.location}</span>
            </div>
          </div>
          <p className="text-xs overlay-text mt-1 line-clamp-2">{profile.bio}</p>
        </div>
      </div>
    </Card>
  );
};
