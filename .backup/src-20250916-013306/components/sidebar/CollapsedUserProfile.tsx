import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollapsedUserProfileProps {
  user: {
    name: string;
    avatar: string;
    notifications: number;
  };
}

export const CollapsedUserProfile = ({ user }: CollapsedUserProfileProps) => (
  <div className="p-2 border-b border-border">
    <Avatar className="h-10 w-10 mx-auto relative">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
      {user.notifications > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
          {user.notifications > 9 ? '9+' : user.notifications}
        </div>
      )}
    </Avatar>
  </div>
);
