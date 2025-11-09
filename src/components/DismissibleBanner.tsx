import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { safeGetItem, safeSetItem } from '@/utils/safeLocalStorage';

interface DismissibleBannerProps {
  children: React.ReactNode;
  className?: string;
  storageKey?: string;
  showCloseButton?: boolean;
}

export const DismissibleBanner = ({ 
  children, 
  className = '', 
  storageKey,
  showCloseButton = true 
}: DismissibleBannerProps) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (!storageKey) return true;
    return safeGetItem<string>(`dismissed_${storageKey}`, { validate: true, defaultValue: 'false' }) !== 'true';
  });

  const handleDismiss = () => {
    setIsVisible(false);
    if (storageKey) {
      safeSetItem(`dismissed_${storageKey}`, 'true', { validate: true });
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`relative ${className}`}>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {children}
    </div>
  );
};
