import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, UserPlus } from "lucide-react";
import { InvitationDialog } from "@/components/invitations/InvitationDialog";
import { logger } from '@/lib/logger';

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
  showInviteButton?: boolean;
}

const SingleCard = ({ profile, onLike, onMessage, showActions = true, showInviteButton = true }: SingleCardProps) => {
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  logger.info('Me gusta', { profileName: profile.name });
                  alert(`¡Has dado like a ${profile.name}!`);
                  if (onLike) onLike();
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Me gusta
              </Button>
              <Button 
                onClick={() => {
                  logger.info('Enviando mensaje a', { profileName: profile.name });
                  alert(`Mensaje enviado a ${profile.name}`);
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
                targetProfileName={profile.name}
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

export default SingleCard;

