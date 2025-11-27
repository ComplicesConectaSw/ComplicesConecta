import { useState, useRef } from "react";
import { Heart, X, Zap, Flag, Ban } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { ReportDialog } from "@/components/swipe/ReportDialog";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { MatchScore } from "@/components/discover/MatchScore";

interface SwipeCardProps {
  profile: {
    id: number;
    name: string;
    age: number;
    location: string;
    interests: string[];
    image: string;
    rating: number;
    isOnline?: boolean;
    bio?: string;
    profession?: string;
    isVerified?: boolean;
    matchScore?: number;
  };
  onLike: (profileId: number) => void;
  onDislike: (profileId: number) => void;
  onSuperLike: (profileId: number) => void;
  onReport: (profileId: number, reason: string) => void;
  onBlock: (profileId: number) => void;
}

export const SwipeCard = ({
  profile,
  onLike,
  onDislike,
  onSuperLike,
  onReport,
  onBlock
}: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Determine action based on swipe distance
      if (Math.abs(dragOffset.x) > 100) {
        setIsAnimating(true);
        setTimeout(() => {
          if (dragOffset.x > 0) {
            handleLike();
          } else {
            handleDislike();
          }
        }, 300);
      } else if (dragOffset.y < -100) {
        setIsAnimating(true);
        setTimeout(() => {
          handleSuperLike();
        }, 300);
      } else {
        // Return to center
        setDragOffset({ x: 0, y: 0 });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleLike = () => {
    onLike(profile.id);
    toast({
      title: "¡Like enviado!",
      description: `Te gusta ${profile.name}`,
    });
    resetCard();
  };

  const handleDislike = () => {
    onDislike(profile.id);
    resetCard();
  };

  const handleSuperLike = () => {
    onSuperLike(profile.id);
    toast({
      title: "🌟 ¡Super Like enviado!",
      description: `Has enviado un Super Like a ${profile.name}`,
    });
    resetCard();
  };

  const handleReport = (reason: string) => {
    onReport(profile.id, reason);
    toast({
      title: "Reporte enviado",
      description: "Gracias por mantener la comunidad segura",
    });
    setShowReportDialog(false);
  };

  const handleBlock = () => {
    onBlock(profile.id);
    toast({
      title: "Usuario bloqueado",
      description: `${profile.name} ha sido bloqueado`,
    });
    resetCard();
  };

  const resetCard = () => {
    setDragOffset({ x: 0, y: 0 });
    setIsAnimating(false);
  };

  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset.x) > 50) {
      return dragOffset.x > 0 ? 'LIKE' : 'NOPE';
    }
    if (dragOffset.y < -50) {
      return 'SUPER LIKE';
    }
    return null;
  };

  const getCardStyle = () => {
    // Asegurar que dragOffset siempre tenga valores numéricos válidos
    const x = typeof dragOffset.x === 'number' && !isNaN(dragOffset.x) ? dragOffset.x : 0;
    const y = typeof dragOffset.y === 'number' && !isNaN(dragOffset.y) ? dragOffset.y : 0;
    
    if (isAnimating) {
      return {
        transform: `translate(${x > 0 ? '400px' : '-400px'}, ${y}px) rotate(${x > 0 ? '30deg' : '-30deg'})`,
        transition: 'transform 0.3s ease-out',
        opacity: 0
      };
    }
    
    const rotation = x * 0.1;
    return {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out'
    };
  };

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto">
        <Card
          ref={cardRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing shadow-glow"
          style={getCardStyle()}
          onMouseDown={handleMouseDown}
        >
          {/* Swipe Indicator */}
          {getSwipeIndicator() && (
            <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/50 ${
              getSwipeIndicator() === 'LIKE' ? 'text-green-500' : 
              getSwipeIndicator() === 'SUPER LIKE' ? 'text-blue-500' : 'text-red-500'
            }`}>
              <div className={`text-4xl font-bold border-4 rounded-lg px-6 py-3 ${
                getSwipeIndicator() === 'LIKE' ? 'border-green-500' : 
                getSwipeIndicator() === 'SUPER LIKE' ? 'border-blue-500' : 'border-red-500'
              }`}>
                {getSwipeIndicator()}
              </div>
            </div>
          )}

          {/* Profile Image */}
          <div className="relative overflow-hidden">
            <img 
              src={profile.image}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/compliceslogo.png';
              }} 
              alt={profile.name}
              className="w-full object-cover"
              draggable={false}
            />
            
            {/* Online Status */}
            {profile.isOnline && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-foreground">En línea</span>
              </div>
            )}

            {/* Report/Block Menu */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90 text-foreground w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportDialog(true);
                }}
              >
                <Flag className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90 text-destructive w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlock();
                }}
              >
                <Ban className="w-4 h-4" />
              </Button>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Profile Info */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
                {profile.isVerified && <VerificationBadge type="verified" size="md" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white/80 text-sm">{profile.profession}</p>
                {profile.matchScore && (
                  <MatchScore score={profile.matchScore} showLabel={false} />
                )}
              </div>
              <p className="text-white/70 text-sm line-clamp-2">{profile.bio}</p>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Interests */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(profile.interests || []).slice(0, 4).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {(profile.interests?.length || 0) > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{(profile.interests?.length || 0) - 4}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button
            size="icon"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-110"
            onClick={handleDislike}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 relative overflow-hidden"
            onClick={handleSuperLike}
          >
            <Zap className="w-7 h-7" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/40 opacity-0 hover:opacity-100 transition-opacity" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
            onClick={handleLike}
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {showReportDialog && (
        <ReportDialog
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          profileId={profile.id.toString()}
          profileName={profile.name}
          onReport={handleReport}
        />
      )}
    </>
  );
};