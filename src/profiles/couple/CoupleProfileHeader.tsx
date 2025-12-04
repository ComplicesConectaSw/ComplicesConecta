import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { MapPin, CheckCircle, Crown, Heart, MessageCircle, Edit, Users } from 'lucide-react';
import { CoupleProfileWithPartners, RelationshipType } from '@/features/profile/coupleProfiles';

interface CoupleProfileHeaderProps {
  profile: CoupleProfileWithPartners;
  onEdit?: () => void;
  onMessage?: () => void;
  onLike?: () => void;
}

// Get theme colors based on relationship type (consistent with CoupleProfileCard)
const getRelationshipTheme = (relationshipType: RelationshipType) => {
  switch (relationshipType) {
    case 'man-man':
      return {
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-500',
        border: 'border-blue-300',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-50',
        accent: 'bg-gradient-to-r from-blue-400 to-indigo-500',
        avatarBg: 'from-blue-400 to-indigo-600'
      };
    case 'woman-woman':
      return {
        gradient: 'from-pink-500 to-purple-600',
        badge: 'bg-pink-500',
        border: 'border-pink-300',
        text: 'text-pink-600',
        hover: 'hover:bg-pink-50',
        accent: 'bg-gradient-to-r from-pink-400 to-purple-500',
        avatarBg: 'from-pink-400 to-purple-600'
      };
    case 'man-woman':
    default:
      return {
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-500',
        border: 'border-purple-300',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50',
        accent: 'bg-gradient-to-r from-purple-400 to-pink-500',
        avatarBg: 'from-purple-400 to-pink-600'
      };
  }
};

const getRelationshipDisplayName = (relationshipType: RelationshipType) => {
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

const CoupleProfileHeader: React.FC<CoupleProfileHeaderProps> = ({
  profile,
  onEdit,
  onMessage,
  onLike
}) => {
  const theme = getRelationshipTheme(profile.relationship_type);
  const relationshipDisplayName = getRelationshipDisplayName(profile.relationship_type);

  return (
    <div className="bg-white/10 backdrop-blur-md border-white/20 text-white rounded-lg p-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        {/* Dual Avatar Section */}
        <div className="relative">
          {/* Main couple avatar container */}
          <div className="flex -space-x-4 mb-2">
            {/* Partner 1 Avatar */}
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.avatarBg} flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20 shadow-lg`}>
              {profile.partner1_first_name?.[0]?.toUpperCase() || 'P'}
            </div>
            {/* Partner 2 Avatar */}
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.avatarBg} flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20 shadow-lg`}>
              {profile.partner2_first_name?.[0]?.toUpperCase() || 'P'}
            </div>
          </div>

          {/* Union Symbol */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className={`${theme.badge} rounded-full p-2 shadow-lg border-2 border-white/30`}>
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute -top-2 -right-2 flex flex-col gap-1">
            {profile.is_verified && (
              <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
            {profile.is_premium && (
              <div className="bg-yellow-500 rounded-full p-1 shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="flex-1 text-center lg:text-left">
          {/* Couple Name & Type */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent stable-element">
              {profile.couple_name}
            </h1>
            <Badge className={`${theme.badge} text-white mb-2`}>
              <Users className="w-3 h-3 mr-1" />
              {relationshipDisplayName}
            </Badge>
          </div>

          {/* Partner Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <h3 className="font-semibold text-lg">
                {profile.partner1_first_name} {profile.partner1_last_name}
              </h3>
              <p className="text-white/80 text-sm">
                {profile.partner1_age} años • {profile.partner1_gender}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <h3 className="font-semibold text-lg">
                {profile.partner2_first_name} {profile.partner2_last_name}
              </h3>
              <p className="text-white/80 text-sm">
                {profile.partner2_age} años • {profile.partner2_gender}
              </p>
            </div>
          </div>

          {/* Location & Status Badges */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
            {profile.location && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </Badge>
            )}
            {profile.isOnline && (
              <Badge className="bg-green-500 text-white">
                En línea
              </Badge>
            )}
          </div>

          {/* Couple Bio */}
          {profile.couple_bio && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2 text-white/90">Sobre nosotros</h4>
              <p className="text-white/80 leading-relaxed bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                {profile.couple_bio}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {onEdit && (
              <Button 
                onClick={onEdit}
                className={`${theme.accent} hover:opacity-90 text-white shadow-md transition-all duration-200`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
            {onMessage && (
              <Button 
                onClick={onMessage}
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Mensaje
              </Button>
            )}
            {onLike && (
              <Button 
                onClick={onLike}
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 mr-2" />
                Me gusta
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleProfileHeader;

