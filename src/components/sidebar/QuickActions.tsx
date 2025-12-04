import { Button } from '@/components/ui/Button';
import { Heart, Zap } from 'lucide-react';

export const QuickActions = () => (
  <div className="mt-auto p-4 border-t border-border">
    <div className="space-y-2">
      <Button variant="love" size="sm" className="w-full">
        <Zap className="h-4 w-4 mr-2" />
        Boost Perfil
      </Button>
      <Button variant="outline" size="sm" className="w-full text-white">
        <Heart className="h-4 w-4 mr-2" fill="currentColor" />
        Super Like
      </Button>
    </div>
  </div>
);

