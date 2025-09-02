import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown } from "lucide-react";

interface SingleProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  profession: string;
  bio: string;
  interests: string[];
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  isPremium: boolean;
}

interface SingleCardProps {
  profile: SingleProfile;
  onLike?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
}

const SingleCard = ({ profile, onLike, onMessage, showActions = true }: SingleCardProps) => {
  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img 
          src={profile.avatar} 
          alt={profile.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {profile.isOnline && (
            <Badge className="bg-green-500 text-white">
              En línea
            </Badge>
          )}
          {profile.isVerified && (
            <Badge className="bg-blue-500 text-white">
              <Verified className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
          {profile.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {profile.name}, {profile.age}
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{profile.location}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{profile.profession}</p>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {profile.bio}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.interests.slice(0, 3).map((interest, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Button 
              onClick={onLike}
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              Me gusta
            </Button>
            <Button 
              onClick={onMessage}
              variant="outline" 
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mensaje
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SingleCard;
