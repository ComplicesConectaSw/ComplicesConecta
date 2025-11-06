/**
 * TikTokShareButton - Botón para compartir en TikTok
 * 
 * @version 3.5.1
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { shareToTikTok, isTikTokAvailable } from '@/utils/tiktokShare';
import { logger } from '@/lib/logger';
import { trackEvent } from '@/config/posthog.config';

interface TikTokShareButtonProps {
  url?: string;
  text?: string;
  hashtags?: string[];
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const TikTokShareButton: React.FC<TikTokShareButtonProps> = ({
  url,
  text,
  hashtags,
  className,
  variant = 'outline',
  size = 'md',
}) => {
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareToTikTok({
        url: url || window.location.href,
        text,
        hashtags,
      });

      if (success) {
        logger.info('✅ Contenido compartido en TikTok');
        // Track en PostHog
        trackEvent('tiktok_share', {
          url: url || window.location.href,
          hasText: !!text,
          hashtagsCount: hashtags?.length || 0
        });
      }
    } catch (error) {
      logger.error('Error compartiendo en TikTok', { error });
    } finally {
      setIsSharing(false);
    }
  };

  if (!isTikTokAvailable()) {
    return null;
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      variant={variant}
      size={size}
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {isSharing ? 'Compartiendo...' : 'Compartir en TikTok'}
    </Button>
  );
};

export default TikTokShareButton;

