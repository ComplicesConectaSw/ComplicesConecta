import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, Users, UserPlus } from "lucide-react";
import { InvitationDialog } from "@/components/invitations/InvitationDialog";
import { logger } from '@/lib/logger';

interface CoupleProfile {
  id: number;
  coupleName: string;
  location: string;
  bio: string;
  interests: string[];
  isOnline: boolean;
  isVerified: boolean;
  isPremium: boolean;
  partner1: {
    name: string;
    age: number;
    profession: string;
    bio: string;
    avatar: string;
  };
  partner2: {
    name: string;
    age: number;
    profession: string;
    bio: string;
    avatar: string;
  };
}

interface CoupleCardProps {
  profile: CoupleProfile;
  onLike?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
  showInviteButton?: boolean;
}

const CoupleCard = ({ profile, onLike, onMessage, showActions = true, showInviteButton = true }: CoupleCardProps) => {
  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div className="grid grid-cols-2 h-64">
          <img 
            src={profile.partner1.avatar} 
            alt={profile.partner1.name}
            className="w-full h-full object-cover"
          />
          <img 
            src={profile.partner2.avatar} 
            alt={profile.partner2.name}
            className="w-full h-full object-cover"
          />
        </div>
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
        <div className="absolute top-3 left-3">
          <Badge className="bg-purple-500 text-white">
            <Users className="h-3 w-3 mr-1" />
            Pareja
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {profile.coupleName}
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{profile.location}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center">
            <p className="font-semibold text-sm text-gray-800">{profile.partner1.name}</p>
            <p className="text-xs text-gray-600">{profile.partner1.age} años</p>
            <p className="text-xs text-gray-600">{profile.partner1.profession}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm text-gray-800">{profile.partner2.name}</p>
            <p className="text-xs text-gray-600">{profile.partner2.age} años</p>
            <p className="text-xs text-gray-600">{profile.partner2.profession}</p>
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  logger.info('Me gusta', { coupleName: profile.coupleName });
                  alert(`¡Has dado like a ${profile.coupleName}!`);
                  if (onLike) onLike();
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Me gusta
              </Button>
              <Button 
                onClick={() => {
                  logger.info('Enviando mensaje a', { coupleName: profile.coupleName });
                  alert(`Mensaje enviado a ${profile.coupleName}`);
                  if (onMessage) onMessage();
                }}
                variant="outline" 
                className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensaje
              </Button>
            </div>
            {showInviteButton && (
              <InvitationDialog 
                targetProfileId={profile.id.toString()}
                targetProfileName={profile.coupleName}
              >
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </Button>
              </InvitationDialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoupleCard;
