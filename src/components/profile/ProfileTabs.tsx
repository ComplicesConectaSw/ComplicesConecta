import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users, 
  Heart, 
  MessageCircle, 
  Image as ImageIcon, 
  Settings, 
  MapPin,
  Star,
  Eye,
  Calendar,
  Grid3X3,
  Play,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MainProfileCard } from '@/components/profile/MainProfileCard';
import type { Database } from '@/integrations/supabase/types';

type ProfileType = 'single' | 'couple';

interface SingleProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  bio?: string;
  gender?: string;
  location?: string;
  likes?: number;
  matches?: number;
  views?: number;
  interests?: string[] | null;
}

interface CoupleProfile {
  id: string;
  couple_name: string;
  partner1_first_name: string;
  partner1_last_name: string;
  partner1_age: number;
  partner1_bio: string;
  partner1_gender: string;
  partner2_first_name: string;
  partner2_last_name: string;
  partner2_age: number;
  partner2_bio: string;
  partner2_gender: string;
  location?: string;
  interests?: string[];
  couple_bio?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  couple_images?: any[];
  likes?: number;
  matches?: number;
  views?: number;
}

interface ProfileTabsProps {
  profileType: ProfileType;
  profile: SingleProfile | CoupleProfile;
  onEditProfile?: () => void;
  onMessage?: () => void;
  onLike?: () => void;
  isOwnProfile?: boolean;
  className?: string;
}

type TabType = 'overview' | 'gallery' | 'stats' | 'individual';

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profileType,
  profile,
  onEditProfile,
  onMessage,
  onLike,
  isOwnProfile = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Información',
      icon: profileType === 'single' ? User : Users,
      available: true
    },
    {
      id: 'gallery' as TabType,
      label: 'Galería',
      icon: ImageIcon,
      available: true
    },
    {
      id: 'stats' as TabType,
      label: 'Estadísticas',
      icon: Star,
      available: true
    },
    {
      id: 'individual' as TabType,
      label: 'Individual',
      icon: User,
      available: profileType === 'couple'
    }
  ].filter(tab => tab.available);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'gallery':
        return renderGalleryTab();
      case 'stats':
        return renderStatsTab();
      case 'individual':
        return renderIndividualTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    if (profileType === 'single') {
      const singleProfile = profile as SingleProfile;
      return (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70">Nombre</p>
                  <p className="font-medium">{singleProfile.first_name} {singleProfile.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Edad</p>
                  <p className="font-medium">{singleProfile.age} años</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Género</p>
                  <p className="font-medium capitalize">{(singleProfile as any).gender || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Ubicación</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {singleProfile.location || 'No especificada'}
                  </p>
                </div>
              </div>
              
              {singleProfile.bio && (
                <div>
                  <p className="text-sm text-white/70 mb-2">Biografía</p>
                  <p className="text-white/90 leading-relaxed">{singleProfile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          {singleProfile.interests && singleProfile.interests.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Intereses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {singleProfile.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white border-pink-400/30"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    } else {
      const coupleProfile = profile as CoupleProfile;
      return (
        <div className="space-y-6">
          {/* Couple Info */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información de Pareja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{coupleProfile.couple_name}</h3>
                <p className="text-white/90 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {coupleProfile.location || 'Ubicación no especificada'}
                </p>
              </div>
              
              {coupleProfile.couple_bio && (
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/70 mb-2">Sobre nosotros</p>
                  <p className="text-white/90 leading-relaxed">{coupleProfile.couple_bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-pink-500/20 rounded-lg border border-pink-400/30">
                  <h4 className="font-semibold text-white mb-1">{coupleProfile.partner1_first_name}</h4>
                  <p className="text-sm text-white/80">{coupleProfile.partner1_age} años</p>
                  <p className="text-xs text-white/70 capitalize">{coupleProfile.partner1_gender}</p>
                </div>
                <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-white mb-1">{coupleProfile.partner2_first_name}</h4>
                  <p className="text-sm text-white/80">{coupleProfile.partner2_age} años</p>
                  <p className="text-xs text-white/70 capitalize">{coupleProfile.partner2_gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          {coupleProfile.interests && coupleProfile.interests.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Intereses Compartidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coupleProfile.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white border-purple-400/30"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
  };

  const renderGalleryTab = () => {
    const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
    
    if (profileType === 'single') {
      const singleProfile = profile as SingleProfile;
      return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Mi Galería
              </CardTitle>
              {(isOwnProfile || isDemoMode) && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isDemoMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="aspect-square bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg overflow-hidden relative group">
                    <img src="/placeholder.svg" alt="Foto demo 1" className="w-full h-full object-cover" />
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive" className="opacity-90">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg overflow-hidden relative group">
                    <img src="/placeholder.svg" alt="Foto demo 2" className="w-full h-full object-cover" />
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive" className="opacity-90">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-teal-600 rounded-lg overflow-hidden relative group">
                    <img src="/placeholder.svg" alt="Foto demo 3" className="w-full h-full object-cover" />
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive" className="opacity-90">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm text-center">
                    📱 Modo Demo: Las funciones de edición están simuladas
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60 mb-4">No hay posts aún</p>
                {isOwnProfile && (
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primera foto
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    } else {
      const coupleProfile = profile as CoupleProfile;
      return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Galería de Pareja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">Pareja Foto 1</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">Pareja Foto 2</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-pink-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">Pareja Foto 3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  const renderStatsTab = () => {
    const stats = [
      {
        icon: Heart,
        label: 'Likes',
        value: profile.likes || 0,
        color: 'text-pink-400'
      },
      {
        icon: MessageCircle,
        label: 'Conversaciones',
        value: profile.matches || 0,
        color: 'text-purple-400'
      },
      {
        icon: Eye,
        label: 'Visitas',
        value: profile.views || 0,
        color: 'text-blue-400'
      },
      {
        icon: Calendar,
        label: 'Compatibilidad',
        value: '95%',
        color: 'text-green-400'
      }
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 text-center">
              <stat.icon className={cn("w-8 h-8 mx-auto mb-2", stat.color)} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderIndividualTab = () => {
    if (profileType !== 'couple') return null;
    
    const coupleProfile = profile as CoupleProfile;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Partner 1 */}
        <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-md border-pink-400/30 text-white">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {coupleProfile.partner1_first_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {coupleProfile.partner1_first_name?.[0]?.toUpperCase()}
              </div>
              <p className="text-white/90 font-medium">{coupleProfile.partner1_age} años</p>
              <p className="text-sm text-white/80 capitalize">{coupleProfile.partner1_gender}</p>
            </div>
            
            {coupleProfile.partner1_bio && (
              <div>
                <h4 className="font-semibold text-white mb-2">Sobre {coupleProfile.partner1_first_name}:</h4>
                <p className="text-sm text-white/90 leading-relaxed">{coupleProfile.partner1_bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner 2 */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md border-purple-400/30 text-white">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {coupleProfile.partner2_first_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {coupleProfile.partner2_first_name?.[0]?.toUpperCase()}
              </div>
              <p className="text-white/90 font-medium">{coupleProfile.partner2_age} años</p>
              <p className="text-sm text-white/80 capitalize">{coupleProfile.partner2_gender}</p>
            </div>
            
            {coupleProfile.partner2_bio && (
              <div>
                <h4 className="font-semibold text-white mb-2">Sobre {coupleProfile.partner2_first_name}:</h4>
                <p className="text-sm text-white/90 leading-relaxed">{coupleProfile.partner2_bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              activeTab === tab.id
                ? "bg-white/20 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <div className="flex gap-3">
          {onLike && (
            <Button 
              onClick={onLike}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Me Gusta
            </Button>
          )}
          {onMessage && (
            <Button 
              onClick={onMessage}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mensaje
            </Button>
          )}
        </div>
      )}

      {/* Edit Button for Own Profile */}
      {isOwnProfile && onEditProfile && (
        <div className="text-center">
          <Button 
            onClick={onEditProfile}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Editar Perfil
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;
