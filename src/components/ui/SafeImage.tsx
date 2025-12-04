import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, User, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'default' | 'avatar' | 'private' | 'cover';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackType = 'default',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    setHasError(false);
    if (!src) return;

    let finalSrc = src as string;
    if (!finalSrc.startsWith('http') && !finalSrc.startsWith('data:') && !finalSrc.startsWith('/')) {
      finalSrc = `/${finalSrc}`;
    }

    setImgSrc(finalSrc);
  }, [src]);

  if (hasError || !imgSrc) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-neutral-900/50 border border-white/5 text-white/20 w-full h-full min-h-[100px]',
          className,
        )}
      >
        {fallbackType === 'avatar' && <User className="w-1/3 h-1/3" />}
        {fallbackType === 'private' && <Lock className="w-1/3 h-1/3 text-purple-500/50" />}
        {fallbackType === 'default' && <ImageIcon className="w-1/3 h-1/3" />}
        <span className="text-[10px] mt-2 font-medium uppercase tracking-wider opacity-50">
          {fallbackType === 'private' ? 'Privado' : 'No disponible'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn('object-cover w-full h-full transition-opacity duration-300', className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};
