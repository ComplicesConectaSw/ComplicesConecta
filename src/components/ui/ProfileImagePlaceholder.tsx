import React from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileImagePlaceholderProps {
  type?: 'single' | 'couple';
  name?: string;
  className?: string;
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
}

export const ProfileImagePlaceholder: React.FC<ProfileImagePlaceholderProps> = ({
  type = 'single',
  name = 'Usuario',
  className = '',
  showIcon = true,
  iconSize = 'md'
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn(
      "flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white",
      className
    )}>
      <div className="text-center">
        {showIcon && (
          <div className="flex justify-center mb-2">
            {type === 'couple' ? (
              <Users className={cn("text-white/90", iconSizes[iconSize])} />
            ) : (
              <User className={cn("text-white/90", iconSizes[iconSize])} />
            )}
          </div>
        )}
        <div className="text-lg font-semibold text-white/95">
          {getInitials(name)}
        </div>
        <p className="text-xs text-white/80 mt-1">
          {type === 'couple' ? 'Pareja' : 'Perfil'}
        </p>
      </div>
    </div>
  );
};

export default ProfileImagePlaceholder;
