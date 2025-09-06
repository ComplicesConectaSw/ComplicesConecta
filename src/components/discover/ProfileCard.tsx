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
      <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden">
        <img 
          src={imgSrc}
          alt={profile.name || 'Perfil'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Rating Badge */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs text-white">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" fill="currentColor" />
          {profile.rating && <span className="font-bold text-xs">{profile.rating}</span>}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-2 sm:p-3 w-full">
            <div className="flex items-center justify-between text-white overlay-text">
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overlay-text">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="overlay-text">{profile.likes || 0}</span>
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="overlay-text">{profile.messages || 0}</span>
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 sm:h-14 sm:w-14 bg-transparent border-white text-white hover:bg-white/20" onClick={() => onLike(profile?.id)}>
                  <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full h-12 w-12 sm:h-16 sm:w-16 bg-transparent border-accent text-accent hover:bg-accent/20" onClick={() => onSuperLike(profile)}>
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info at the bottom of the image */}
        <div className="absolute bottom-0 left-0 p-2 sm:p-3 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className="text-sm sm:text-lg font-bold truncate overlay-text">{profile.name}</h3>
            {profile.isVerified && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="currentColor" />}
            {profile.isPremium && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overlay-text">
            <span className="overlay-text">{profile.age} años</span>
            <span className="overlay-text">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="truncate overlay-text">{profile.location}</span>
            </div>
          </div>
          <p className="text-xs overlay-text mt-1 line-clamp-2 hidden sm:block">{profile.bio}</p>
        </div>
      </div>
    </Card>
  );
};
