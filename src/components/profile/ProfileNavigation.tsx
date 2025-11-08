import React from 'react';
import { Button } from '@/shared/ui/Button';
import { 
  ArrowLeft, 
  Share2, 
  Crown, 
  MoreVertical,
  Edit,
  Heart,
  MessageCircle,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProfileType = 'single' | 'couple';

interface ProfileNavigationProps {
  profileType: ProfileType;
  profileName: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onLike?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  profileType,
  profileName,
  isOwnProfile = false,
  onEdit,
  onLike,
  onMessage,
  onShare,
  onReport,
  onBlock,
  showBackButton = true,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: `Perfil de ${profileName}`,
          text: `Conoce a ${profileName} en ComplicesConecta`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          // Could show a toast here
          console.log('Enlace copiado al portapapeles');
        });
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Default edit navigation
      const editPath = profileType === 'single' ? '/edit-profile-single' : '/edit-profile-couple';
      navigate(editPath);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={cn(
      "bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg flex-shrink-0",
      className
    )}>
      <div className="flex items-center justify-between gap-2">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </Button>
          )}
          
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
            {profileName}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isOwnProfile ? (
            // Own Profile Actions
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                title="Compartir perfil"
              >
                <Share2 className="h-4 w-4 text-white opacity-90" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleEdit}
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                title="Editar perfil"
              >
                <Edit className="h-4 w-4 text-white" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tokens')}
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                title="Tokens y Premium"
              >
                <Crown className="h-4 w-4 text-white" />
              </Button>
            </>
          ) : (
            // Other Profile Actions
            <>
              {/* Quick Actions */}
              <div className="hidden sm:flex gap-1">
                {onLike && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLike}
                    className="bg-pink-500/20 hover:bg-pink-500/30 p-2 transition-all duration-300 hover:scale-105"
                    title="Me gusta"
                  >
                    <Heart className="h-4 w-4 text-pink-400" />
                  </Button>
                )}
                
                {onMessage && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onMessage}
                    className="bg-blue-500/20 hover:bg-blue-500/30 p-2 transition-all duration-300 hover:scale-105"
                    title="Enviar mensaje"
                  >
                    <MessageCircle className="h-4 w-4 text-blue-400" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                  title="Compartir"
                >
                  <Share2 className="h-4 w-4 text-white opacity-90" />
                </Button>
              </div>

              {/* More Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                  >
                    <MoreVertical className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-black/90 backdrop-blur-md border-white/20 text-white"
                >
                  {/* Mobile Quick Actions */}
                  <div className="sm:hidden">
                    {onLike && (
                      <DropdownMenuItem 
                        onClick={onLike}
                        className="hover:bg-white/10 focus:bg-white/10"
                      >
                        <Heart className="h-4 w-4 mr-2 text-pink-400" />
                        Me gusta
                      </DropdownMenuItem>
                    )}
                    
                    {onMessage && (
                      <DropdownMenuItem 
                        onClick={onMessage}
                        className="hover:bg-white/10 focus:bg-white/10"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-blue-400" />
                        Enviar mensaje
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={handleShare}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-white/20" />
                  </div>

                  {/* Additional Actions */}
                  <DropdownMenuItem 
                    onClick={() => {/* Add to favorites logic */}}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Añadir a favoritos
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/20" />
                  
                  {onReport && (
                    <DropdownMenuItem 
                      onClick={onReport}
                      className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400"
                    >
                      Reportar perfil
                    </DropdownMenuItem>
                  )}
                  
                  {onBlock && (
                    <DropdownMenuItem 
                      onClick={onBlock}
                      className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400"
                    >
                      Bloquear usuario
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileNavigation;
