import { MessageCircle, MapPin, Calendar, Share2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/pages/Matches";
import { ShareProfile } from "@/components/social/ShareProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface MatchCardProps {
  match: Match;
  onSuperLike: (matchId: number) => void;
  onStartChat: (matchId: number) => void;
  onShare?: (matchId: number) => void;
}

export const MatchCard = ({ match, onSuperLike, onStartChat, onShare }: MatchCardProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-accent text-accent-foreground';
      case 'chatting':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nuevo';
      case 'chatting':
        return 'Chateando';
      default:
        return 'Visto';
    }
  };

  return (
    <div className="group relative bg-card-gradient rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 transform hover:scale-105">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={match.image} 
          alt={match.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(match.status)} text-xs font-medium`}>
            {getStatusText(match.status)}
          </Badge>
        </div>

        {/* Compatibility Score */}
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-3 h-3 text-accent fill-current" />
          <span className="text-xs font-bold text-accent">{match.compatibility}%</span>
        </div>

        {/* Unread Message Indicator */}
        {match.hasUnreadMessage && (
          <div className="absolute top-16 right-4 w-3 h-3 bg-primary rounded-full animate-pulse border-2 border-background" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Match Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold mb-1">{match.name}, {match.age}</h3>
          <div className="flex items-center space-x-3 text-white/80 text-sm mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{match.distance} km</span>
            </div>
            <span className="text-white/60">•</span>
            <span>{match.matchedAt}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4">
        {/* Mutual Interests */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Intereses en común:</p>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(match.mutualInterests) && match.mutualInterests.slice(0, 3).map((interest, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
            {match.mutualInterests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{match.mutualInterests.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-white"
              onClick={() => setShowSuperLikeModal(true)}
            >
              <Zap className="w-4 h-4 mr-2 text-accent" />
              Super Like
            </Button>
            <Button 
              variant="love" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => window.location.href = `/chat?user=${match.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {match.hasUnreadMessage ? 'Responder' : 'Chatear'}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir perfil
          </Button>
        </div>
      </div>

      <ShareProfile
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        profileName={match.name}
        profileId={match.id.toString()}
      />

      {/* Super Like Modal */}
      <Dialog open={showSuperLikeModal} onOpenChange={setShowSuperLikeModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              ¿Qué es Super Like?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-white">
            <p className="text-sm leading-relaxed">
              El <strong className="text-yellow-400">Super Like</strong> es una función premium que te permite destacar tu interés de manera especial.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">¿Cómo funciona?</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-white/90">
                <li>Tu perfil aparecerá destacado para esa persona</li>
                <li>Recibirán una notificación especial</li>
                <li>Aumenta significativamente las posibilidades de match</li>
                <li>Muestra un interés genuino y serio</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-200">
                💡 <strong>Tip:</strong> Úsalo con personas que realmente te interesen, ya que tienes un límite diario.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button 
                onClick={() => {
                  setShowSuperLikeModal(false);
                  onSuperLike(match.id);
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Enviar Super Like
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSuperLikeModal(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};