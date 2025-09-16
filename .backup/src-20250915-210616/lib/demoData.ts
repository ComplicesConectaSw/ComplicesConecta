import { v4 as uuidv4 } from 'uuid';
import { pickProfileImage, inferProfileKind, resetImageCounters, type ProfileType, type Gender } from '@/lib/media';
import { Theme } from '@/hooks/useProfileTheme';

export interface DemoProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: number;
  interests: string[];
  image: string;
  bio: string;
  isOnline: boolean;
  lastActive: string;
  isVerified: boolean;
  isPremium: boolean;
  rating: number;
  matchScore: number;
  profileType: ProfileType;
  gender?: Gender;
  partnerGender?: Gender;
  theme?: Theme;
  isDemo: true;
}

export const generateDemoProfiles = (count: number = 20): DemoProfile[] => {
  const nombres = [
    'Alejandro', 'María', 'Carlos', 'Ana', 'José', 'Laura', 'Miguel', 'Carmen',
    'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco', 'Dolores', 'David',
    'Cristina', 'Javier', 'Rosa', 'Daniel', 'Antonia', 'Rafael', 'Francisca',
    'José Luis', 'Lucía', 'Jesús', 'Mercedes', 'Ángel', 'Josefa', 'Marcos',
    'Elena', 'Pedro', 'Teresa', 'Sergio', 'Raquel', 'Pablo', 'Manuela'
  ];

  const ubicaciones = [
    'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
    'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí',
    'Mérida', 'Mexicali', 'Aguascalientes', 'Cuernavaca', 'Saltillo'
  ];

  const bios = [
    'Aventurero en busca de nuevas experiencias y conexiones auténticas.',
    'Amante de la vida, los viajes y las buenas conversaciones.',
    'Explorando el mundo del lifestyle swinger con mente abierta.',
    'Buscando parejas y personas afines para compartir momentos únicos.',
    'Discreto, respetuoso y con ganas de conocer gente interesante.',
    'Pareja liberal en busca de otras parejas para intercambios.',
    'Nuevo en esto, pero con muchas ganas de aprender y disfrutar.',
    'Experiencia y diversión garantizada. Siempre con respeto.',
    'Mente abierta, corazón libre. Buscando conexiones reales.',
    'Lifestyle swinger desde hace años. Conocemos el ambiente.'
  ];

  const interestsPool = [
    'Lifestyle', 'Swinger', 'Parejas', 'Intercambio', 'Liberal', 
    'Aventura', 'Diversión', 'Respeto', 'Discreción', 'Experiencia',
    'Viajes', 'Música', 'Baile', 'Cocina', 'Deportes'
  ];

  resetImageCounters();
  const usedImages = new Set<string>();
  const themes: (Theme | undefined)[] = ['elegant', 'modern', 'vibrant', undefined];

  return Array.from({ length: count }, (_, index) => {
    const name = nombres[Math.floor(Math.random() * nombres.length)];
    const profileKind = inferProfileKind({ name });
    const profileType: ProfileType = profileKind.kind === 'couple' ? 'couple' : 'single';
    const gender: Gender = profileKind.gender;
    const id = uuidv4();
    
    // Para parejas, generar género del compañero
    let partnerGender: Gender | undefined;
    if (profileType === 'couple') {
      const genderOptions: Gender[] = ['male', 'female'];
      partnerGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
    }
    
    // Asignar tema aleatorio (30% probabilidad de tener tema personalizado)
    const theme = Math.random() > 0.7 ? themes[Math.floor(Math.random() * themes.length)] : undefined;
    
    return {
      id,
      name,
      age: Math.floor(Math.random() * (45 - 22 + 1)) + 22,
      location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
      distance: Math.floor(Math.random() * 100) + 1,
      interests: interestsPool
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 2),
      image: pickProfileImage({ id, name, type: profileType, gender }, usedImages),
      bio: bios[Math.floor(Math.random() * bios.length)],
      isOnline: Math.random() > 0.6,
      lastActive: Math.random() > 0.5 ? 'Hace 1 hora' : 'Hace 2 días',
      isVerified: Math.random() > 0.7,
      isPremium: Math.random() > 0.8,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      matchScore: Math.floor(Math.random() * 40) + 60,
      profileType,
      gender,
      partnerGender,
      theme,
      isDemo: true as const
    };
  });
};

export const demoStats = {
  likes: 12,
  superLikes: 5,
  matches: 0,
  views: 48,
  messages: 3
};
