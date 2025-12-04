import { NavLink } from 'react-router-dom';
import { Crown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';

// Definimos el tipo para el usuario para mejorar la seguridad de tipos
interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
    subscription: string;
    notifications: number;
  };
}

export const UserProfile = ({ user }: UserProfileProps) => (
  <div className="p-4 border-b border-border">
    <div className="flex items-center space-x-3 mb-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {user.name}
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            <Crown className="h-3 w-3 mr-1" />
            {user.subscription}
          </Badge>
          {user.notifications > 0 && (
            <Badge variant="destructive" className="text-xs">
              {user.notifications}
            </Badge>
          )}
        </div>
      </div>
    </div>
    <Button variant="outline" size="sm" className="w-full" asChild>
      <NavLink to="/profile/me">
        <User className="h-4 w-4 mr-2" />
        Ver Perfil
      </NavLink>
    </Button>
  </div>
);

