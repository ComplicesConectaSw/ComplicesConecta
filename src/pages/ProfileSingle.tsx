import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Verified, Crown, Edit, Settings, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileStats from "@/components/profile/ProfileStats";
import { generateMockSingle } from "@/lib/data";

const ProfileSingle = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Por defecto es perfil propio

  useEffect(() => {
    // Generar perfil mock o cargar desde localStorage
    const mockProfile = generateMockSingle();
    setProfile(mockProfile);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Mi Perfil</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/edit-profile-single')}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-24 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Foto principal y badges */}
        <Card className="overflow-hidden bg-white shadow-xl">
          <div className="relative">
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
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
            
            {isOwnProfile && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => navigate('/edit-profile-single')}
                  className="bg-white/90 text-gray-800 hover:bg-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Información básica */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.name}, {profile.age}
              </h1>
              <div className="flex items-center justify-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profile.location}</span>
              </div>
              <p className="text-gray-600 font-medium">{profile.profession}</p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <ProfileStats stats={profile.stats} />

        {/* Intereses */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones (solo si no es perfil propio) */}
        {!isOwnProfile && (
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3"
              size="lg"
            >
              <Heart className="h-5 w-5 mr-2" />
              Me gusta
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 py-3"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Enviar mensaje
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default ProfileSingle;
