// src/lib/imageService.ts
/**
 * Servicio de imágenes dinámicas para perfiles
 * Reemplaza URLs hardcodeadas con generación dinámica
 */

export interface ImageConfig {
  width: number;
  height: number;
  fit: 'crop' | 'fill' | 'scale-down';
  crop?: 'face' | 'center' | 'top' | 'bottom';
  quality?: number;
}

export interface CityCoordinates {
  name: string;
  lat: number;
  lng: number;
  range: number;
}

// Base de datos de imágenes por género
const MALE_IMAGE_IDS = [
  '1568602471122-7832951cc4c5', // Hombre sonriendo
  '1507003211169-0a1dd7228f2d', // Hombre profesional
  '1472099645785-5658abf4ff4e', // Hombre casual
  '1500648767791-00dcc994a43e', // Hombre joven
  '1507003211169-0a1dd7228f2d', // Hombre maduro (reemplazada - la anterior devolvía 404, usando profesional como fallback)
];

const FEMALE_IMAGE_IDS = [
  '1544005313-94ddf0286df2', // Mujer sonriendo
  '1580489944761-15a19d654956', // Mujer profesional
  '1599566150163-29194dcaad36', // Mujer casual (reemplazada - la anterior devolvía 404)
  '1508214751196-bcfd4ca60f91', // Mujer joven
  '1534528741775-53994a69daeb', // Mujer madura
];

const COUPLE_IMAGE_IDS = [
  '1511795409834-ef04bbd61622', // Pareja abrazada
  '1516589178581-6cd7833ae3b2', // Pareja sonriendo
  '1551218808-94e220e084d2', // Pareja elegante
  '1571019613454-1cb2f99b2d8b', // Pareja casual
];

// Coordenadas de ciudades mexicanas
export const MEXICAN_CITIES: CityCoordinates[] = [
  { name: 'CDMX', lat: 19.4326, lng: -99.1332, range: 0.1 },
  { name: 'Guadalajara', lat: 20.6597, lng: -103.3496, range: 0.1 },
  { name: 'Monterrey', lat: 25.6866, lng: -100.3161, range: 0.1 },
  { name: 'Puebla', lat: 19.0414, lng: -98.2063, range: 0.1 },
  { name: 'Tijuana', lat: 32.5149, lng: -117.0382, range: 0.1 },
  { name: 'León', lat: 21.1220, lng: -101.6869, range: 0.1 },
  { name: 'Querétaro', lat: 20.5881, lng: -100.3881, range: 0.1 },
  { name: 'Cancún', lat: 21.1619, lng: -86.8515, range: 0.1 },
  { name: 'Playa del Carmen', lat: 20.6296, lng: -87.0739, range: 0.1 },
  { name: 'Mérida', lat: 20.9674, lng: -89.5926, range: 0.1 },
  { name: 'Toluca', lat: 19.2921, lng: -99.6539, range: 0.1 },
  { name: 'Acapulco', lat: 16.8531, lng: -99.8237, range: 0.1 },
  { name: 'Cuernavaca', lat: 18.9218, lng: -99.2302, range: 0.1 },
  { name: 'Saltillo', lat: 25.4232, lng: -101.0053, range: 0.1 },
  { name: 'Aguascalientes', lat: 21.8853, lng: -102.2916, range: 0.1 },
];

/**
 * Genera una imagen aleatoria para un perfil
 */
export const getRandomProfileImage = (
  gender: 'male' | 'female' | 'couple',
  config: Partial<ImageConfig> = {}
): string => {
  const defaultConfig: ImageConfig = {
    width: 400,
    height: 600,
    fit: 'crop',
    crop: 'face',
    quality: 80,
    ...config
  };

  let imageIds: string[];
  switch (gender) {
    case 'male':
      imageIds = MALE_IMAGE_IDS;
      break;
    case 'female':
      imageIds = FEMALE_IMAGE_IDS;
      break;
    case 'couple':
      imageIds = COUPLE_IMAGE_IDS;
      break;
    default:
      imageIds = [...MALE_IMAGE_IDS, ...FEMALE_IMAGE_IDS];
  }

  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  const baseUrl = 'https://images.unsplash.com/photo-';
  
  const params = new URLSearchParams({
    w: defaultConfig.width.toString(),
    h: defaultConfig.height.toString(),
    fit: defaultConfig.fit,
    ...(defaultConfig.crop && { crop: defaultConfig.crop }),
    ...(defaultConfig.quality && { q: defaultConfig.quality.toString() }),
    auto: 'format'
  });

  return `${baseUrl}${randomId}?${params.toString()}`;
};

/**
 * Genera coordenadas aleatorias para una ciudad mexicana
 */
export const getRandomMexicanCoordinates = (): { lat: number; lng: number; city: string } => {
  const randomCity = MEXICAN_CITIES[Math.floor(Math.random() * MEXICAN_CITIES.length)];
  
  const lat = Math.random() * randomCity.range + randomCity.lat;
  const lng = Math.random() * randomCity.range + randomCity.lng;
  
  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6)),
    city: randomCity.name
  };
};

/**
 * Genera múltiples imágenes para un perfil
 */
export const getRandomProfileImages = (
  gender: 'male' | 'female' | 'couple',
  count: number = 3,
  config: Partial<ImageConfig> = {}
): string[] => {
  const images: string[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let imageUrl: string;
    let attempts = 0;
    
    do {
      imageUrl = getRandomProfileImage(gender, config);
      attempts++;
    } while (usedIds.has(imageUrl) && attempts < 10);
    
    usedIds.add(imageUrl);
    images.push(imageUrl);
  }
  
  return images;
};

/**
 * Valida si una URL de imagen es válida
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('unsplash.com') || url.includes('ui-avatars.com');
  } catch {
    return false;
  }
};

/**
 * Obtiene una imagen de fallback si la principal falla
 */
export const getFallbackImage = (gender: 'male' | 'female' | 'couple'): string => {
  const fallbackIds = {
    male: '1507003211169-0a1dd7228f2d',
    female: '1544005313-94ddf0286df2',
    couple: '1511795409834-ef04bbd61622'
  };
  
  const id = fallbackIds[gender];
  return `https://images.unsplash.com/photo-${id}?w=400&h=600&fit=crop&crop=face&auto=format&q=80`;
};
