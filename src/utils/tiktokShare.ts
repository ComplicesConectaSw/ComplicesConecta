/**
 * TikTok Share Utility
 * 
 * Comparte contenido en TikTok usando su API de sharing
 * 
 * @version 3.5.1
 */

import { logger } from '@/lib/logger';

export interface TikTokShareOptions {
  url?: string;
  text?: string;
  hashtags?: string[];
}

/**
 * Comparte contenido en TikTok
 */
export async function shareToTikTok(options: TikTokShareOptions): Promise<boolean> {
  try {
    const { url, text, hashtags = [] } = options;
    
    // Construir URL de TikTok
    const shareUrl = new URL('https://www.tiktok.com/upload');
    
    // Agregar parámetros si están disponibles
    if (url) {
      shareUrl.searchParams.set('referer', url);
    }
    
    // TikTok no soporta parámetros directos en la URL de upload
    // En su lugar, abrimos la página de upload y el usuario puede pegar el contenido
    const shareText = [
      text,
      ...hashtags.map(tag => `#${tag.replace('#', '')}`)
    ].filter(Boolean).join(' ');

    // Abrir TikTok en nueva ventana
    window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer');
    
    // Copiar texto al portapapeles para facilitar el proceso
    if (shareText && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        logger.info('✅ Texto copiado al portapapeles para TikTok');
      } catch (error) {
        logger.warn('No se pudo copiar al portapapeles', { error });
      }
    }

    logger.info('📱 TikTok share iniciado', { url, text });
    return true;
  } catch (error) {
    logger.error('Error compartiendo en TikTok', { error });
    return false;
  }
}

/**
 * Verifica si TikTok está disponible en el dispositivo
 */
export function isTikTokAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // TikTok siempre está disponible vía web
  return true;
}

/**
 * Hook para compartir perfil en TikTok
 */
export async function shareProfileToTikTok(profileId: string, profileName: string): Promise<boolean> {
  const profileUrl = `${window.location.origin}/profile/${profileId}`;
  
  return shareToTikTok({
    url: profileUrl,
    text: `Conoce a ${profileName} en ComplicesConecta 🔥`,
    hashtags: ['ComplicesConecta', 'Swinger', 'Mexico', 'Dating']
  });
}

/**
 * Hook para compartir evento en TikTok
 */
export async function shareEventToTikTok(eventId: string, eventTitle: string): Promise<boolean> {
  const eventUrl = `${window.location.origin}/events/${eventId}`;
  
  return shareToTikTok({
    url: eventUrl,
    text: `Únete a ${eventTitle} en ComplicesConecta 🎉`,
    hashtags: ['ComplicesConecta', 'Eventos', 'Swinger', 'Mexico']
  });
}

