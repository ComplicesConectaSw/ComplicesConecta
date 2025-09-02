import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Star, MapPin, CheckCircle, Crown } from 'lucide-react';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face';

export const ProfileCard = ({ profile, onLike, onSuperLike }: { profile: any, onLike: (id: number) => void, onSuperLike: (profile: any) => void }) => {
  const [imgSrc, setImgSrc] = useState(profile.image || FALLBACK_IMAGE_URL);

  const handleError = () => {
    setImgSrc(FALLBACK_IMAGE_URL);
  };

  return (
    <Card className="overflow-hidden relative group border-primary/10 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <div className="relative">
        <img 
          src={imgSrc}
          alt={profile.name || 'Perfil'} 
          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full text-xs text-white">
          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
          {profile.rating && <span className="font-bold">{profile.rating}</span>}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-4">
            <Button size="icon" variant="outline" className="rounded-full h-14 w-14 bg-transparent border-white text-white hover:bg-white/20" onClick={() => onLike(profile?.id)}>
              <Heart className="w-7 h-7" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full h-16 w-16 bg-transparent border-accent text-accent hover:bg-accent/20" onClick={() => onSuperLike(profile)}>
              <Flame className="w-8 h-8" />
            </Button>
          </div>
        </div>

        {/* Profile Info at the bottom of the image */}
        <div className="absolute bottom-0 left-0 p-3 text-white w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate">{profile.name}</h3>
            {profile.isVerified && <CheckCircle className="w-4 h-4 text-blue-400" fill="currentColor" />}
            {profile.isPremium && <Crown className="w-4 h-4 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {profile.age && <span>{profile.age} años</span>}
            {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>}
          </div>
        </div>
      </div>
      
      {/* Bio Section */}
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground flex-grow">{profile.bio}</p>
      </div>
    </Card>
  );
};
