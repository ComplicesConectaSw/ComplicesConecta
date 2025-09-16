import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, Users, UserPlus } from "lucide-react";
import { InvitationDialog } from "@/components/invitations/InvitationDialog";
import { Tables } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

// Extended interface for couple profiles with database integration
interface CoupleProfileWithPartners {
  id: string;
  couple_name: string;
  couple_bio: string | null;
  relationship_type: 'man-woman' | 'man-man' | 'woman-woman';
  partner1_id: string;
  partner2_id: string;
  couple_images: string[] | null;
  is_verified: boolean | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
  partner1_first_name: string;
  partner1_last_name: string;
  partner1_age: number;
  partner1_bio: string | null;
  partner1_gender: string;
  partner2_first_name: string;
  partner2_last_name: string;
  partner2_age: number;
  partner2_bio: string | null;
  partner2_gender: string;
  location?: string;
  isOnline?: boolean;
}

interface CoupleProfileCardProps {
  profile: CoupleProfileWithPartners;
  onLike?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
  showInviteButton?: boolean;
}

// Get theme colors based on relationship type
const getRelationshipTheme = (relationshipType: 'man-woman' | 'man-man' | 'woman-woman') => {
  switch (relationshipType) {
    case 'man-man':
      return {
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-500',
        border: 'border-blue-300',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-50',
        accent: 'bg-gradient-to-r from-blue-400 to-indigo-500'
      };
    case 'woman-woman':
      return {
        gradient: 'from-pink-500 to-purple-600',
        badge: 'bg-pink-500',
        border: 'border-pink-300',
        text: 'text-pink-600',
        hover: 'hover:bg-pink-50',
        accent: 'bg-gradient-to-r from-pink-400 to-purple-500'
      };
    case 'man-woman':
    default:
      return {
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-500',
        border: 'border-purple-300',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50',
        accent: 'bg-gradient-to-r from-purple-400 to-pink-500'
      };
  }
};

// Get relationship type display name
const getRelationshipDisplayName = (relationshipType: 'man-woman' | 'man-man' | 'woman-woman') => {
  switch (relationshipType) {
    case 'man-man':
      return 'Pareja Masculina';
    case 'woman-woman':
      return 'Pareja Femenina';
    case 'man-woman':
    default:
      return 'Pareja Mixta';
  }
};

const CoupleProfileCard = ({ 
  profile, 
  onLike, 
  onMessage, 
  showActions = true, 
  showInviteButton = true 
}: CoupleProfileCardProps) => {
  const theme = getRelationshipTheme(profile.relationship_type);
  const relationshipDisplayName = getRelationshipDisplayName(profile.relationship_type);
  
  // Use couple images if available, otherwise use placeholder
  const partner1Avatar = profile.couple_images?.[0] || '/placeholder.svg';
  const partner2Avatar = profile.couple_images?.[1] || '/placeholder.svg';

  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200">
      <div className="relative">
        {/* Partner Images Grid */}
        <div className="grid grid-cols-2 h-64">
          <div className="relative overflow-hidden">
            <img 
              src={partner1Avatar} 
              alt={`${profile.partner1_first_name} ${profile.partner1_last_name}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="relative overflow-hidden">
            <img 
              src={partner2Avatar} 
              alt={`${profile.partner2_first_name} ${profile.partner2_last_name}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Status Badges - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {profile.isOnline && (
            <Badge className="bg-green-500 text-white shadow-lg">
              En línea
            </Badge>
          )}
          {profile.is_verified && (
            <Badge className="bg-blue-500 text-white shadow-lg">
              <Verified className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
          {profile.is_premium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Relationship Type Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge className={`${theme.badge} text-white shadow-lg`}>
            <Users className="h-3 w-3 mr-1" />
            {relationshipDisplayName}
          </Badge>
        </div>

        {/* Couple Name Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {profile.couple_name}
          </h3>
          {profile.location && (
            <div className="flex items-center text-white/90 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Partner Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-sm text-gray-800">
              {profile.partner1_first_name} {profile.partner1_last_name}
            </p>
            <p className="text-xs text-gray-600 mt-1">{profile.partner1_age} años</p>
            <p className="text-xs text-gray-600 capitalize">{profile.partner1_gender}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-sm text-gray-800">
              {profile.partner2_first_name} {profile.partner2_last_name}
            </p>
            <p className="text-xs text-gray-600 mt-1">{profile.partner2_age} años</p>
            <p className="text-xs text-gray-600 capitalize">{profile.partner2_gender}</p>
          </div>
        </div>
        
        {/* Couple Bio */}
        {profile.couple_bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {profile.couple_bio}
          </p>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  logger.info('Me gusta', { couple_name: profile.couple_name });
                  if (onLike) onLike();
                }}
                className={`flex-1 ${theme.accent} hover:opacity-90 text-white shadow-md transition-all duration-200 hover:shadow-lg`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Me gusta
              </Button>
              <Button 
                onClick={() => {
                  logger.info('Enviando mensaje a', { couple_name: profile.couple_name });
                  if (onMessage) onMessage();
                }}
                variant="outline" 
                className={`flex-1 ${theme.border} ${theme.text} ${theme.hover} transition-all duration-200`}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensaje
              </Button>
            </div>
            {showInviteButton && (
              <InvitationDialog 
                targetProfileId={profile.id}
                targetProfileName={profile.couple_name}
              >
                <Button 
                  variant="outline" 
                  className={`w-full ${theme.border} ${theme.text} ${theme.hover} transition-all duration-200`}
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

export default CoupleProfileCard;
