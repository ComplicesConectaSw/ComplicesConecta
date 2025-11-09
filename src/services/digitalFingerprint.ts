// Servicio de Huella Digital (Canvas Fingerprint + Browser)
import { logger } from '@/lib/logger';

export interface BrowserFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  colorDepth: number;
  pixelRatio: number;
}

export interface CanvasFingerprint {
  hash: string;
  data: string; // Base64 encoded canvas data
}

export interface DigitalFingerprint {
  canvasHash: string;
  canvasData: string;
  browserFingerprint: BrowserFingerprint;
  combinedHash: string;
}

/**
 * Generar canvas fingerprint
 */
export const generateCanvasFingerprint = (): CanvasFingerprint => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = 200;
    canvas.height = 50;

    // Dibujar texto con diferentes fuentes y estilos
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ComplicesConecta 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ComplicesConecta 🔒', 4, 17);

    // Agregar formas geométricas
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath();
    ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Obtener datos del canvas
    const canvasData = canvas.toDataURL();
    
    // Generar hash simple (en producción, usar crypto.subtle)
    const hash = simpleHash(canvasData);

    return {
      hash,
      data: canvasData,
    };
  } catch (error) {
    logger.error('Error generando canvas fingerprint:', { error: error instanceof Error ? error.message : String(error) });
    // Fallback: usar timestamp + random
    const fallback = `${Date.now()}-${Math.random()}`;
    return {
      hash: simpleHash(fallback),
      data: fallback,
    };
  }
};

/**
 * Generar browser fingerprint
 */
export const generateBrowserFingerprint = (): BrowserFingerprint => {
  const nav = navigator;
  const screen = window.screen;

  return {
    userAgent: nav.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,
    platform: nav.platform,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack || null,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as any).deviceMemory || null,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
};

/**
 * Generar hash combinado de todas las huellas
 */
export const generateCombinedHash = (
  canvasHash: string,
  browserFingerprint: BrowserFingerprint,
  worldIdNullifierHash?: string
): string => {
  const combined = JSON.stringify({
    canvas: canvasHash,
    browser: browserFingerprint,
    worldid: worldIdNullifierHash || null,
  });

  return simpleHash(combined);
};

/**
 * Hash simple (en producción, usar crypto.subtle.digest)
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Generar huella digital completa
 */
export const generateDigitalFingerprint = async (
  worldIdNullifierHash?: string
): Promise<DigitalFingerprint> => {
  const canvas = generateCanvasFingerprint();
  const browser = generateBrowserFingerprint();
  const combinedHash = generateCombinedHash(canvas.hash, browser, worldIdNullifierHash);

  return {
    canvasHash: canvas.hash,
    canvasData: canvas.data,
    browserFingerprint: browser,
    combinedHash,
  };
};

/**
 * Verificar si la huella digital está baneada
 */
export const checkFingerprintBanned = async (
  fingerprint: DigitalFingerprint,
  worldIdNullifierHash?: string
): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return false;
    }

    const { data, error } = await supabase.rpc('check_fingerprint_banned', {
      p_canvas_hash: fingerprint.canvasHash,
      p_worldid_nullifier_hash: worldIdNullifierHash || undefined,
      p_combined_hash: fingerprint.combinedHash,
    });

    if (error) {
      logger.error('Error verificando fingerprint baneado:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }

    return data === true;
  } catch (error) {
    logger.error('Error verificando fingerprint:', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};

/**
 * Guardar huella digital en BD
 */
export const saveDigitalFingerprint = async (
  userId: string,
  fingerprint: DigitalFingerprint,
  worldIdNullifierHash?: string,
  ipAddress?: string
): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    const { error } = await supabase
      .from('digital_fingerprints')
      .upsert({
        user_id: userId,
        canvas_hash: fingerprint.canvasHash,
        canvas_data: fingerprint.canvasData,
        browser_fingerprint: JSON.stringify(fingerprint.browserFingerprint),
        worldid_nullifier_hash: worldIdNullifierHash ?? null,
        combined_hash: fingerprint.combinedHash,
        ip_address: ipAddress ?? null,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'combined_hash',
      });

    if (error) {
      logger.error('Error guardando fingerprint:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  } catch (error) {
    logger.error('Error guardando huella digital:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

