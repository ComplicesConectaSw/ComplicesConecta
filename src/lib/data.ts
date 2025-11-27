import { Heart, Users, Shield, Calendar, MessageCircle, Search, UserPlus, Crown, BarChart3, Settings, Bell } from "lucide-react";

export const mainNavItems = [
  { title: 'Descubrir', url: '/discover', icon: Search, badge: 'Nuevo' },
  { title: 'Perfiles', url: '/profiles', icon: Users },
  { title: 'Matches', url: '/matches', icon: Heart, badge: '3' },
  { title: 'Chat', url: '/chat', icon: MessageCircle, badge: '5' },
  { title: 'Solicitudes', url: '/requests', icon: UserPlus, badge: '2' },
  { title: 'Eventos', url: '/events', icon: Calendar },
];

export const premiumItems = [
  { title: 'Premium', url: '/premium', icon: Crown },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

export const settingsItems = [
  { title: 'Configuración', url: '/settings', icon: Settings },
  { title: 'Notificaciones', url: '/notifications', icon: Bell },
  { title: 'Privacidad', url: '/privacy', icon: Shield },
];

export const mockUser = {
  name: 'María González',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  subscription: 'Premium',
  notifications: 8,
};

// Funciones compatibles con archivos del zip
export function getRandomSingleProfile() {
  return generateMockSingle();
}

export function getRandomCoupleProfile() {
  return generateMockCouple();
}

import { getRandomProfileImage, getRandomMexicanCoordinates, getRandomProfileImages } from './imageService';

// Generador de perfiles mock aleatorios
export const generateMockSingle = (includeOnlineStatus = true) => {
  const nombresF = ["Sofía", "Valentina", "Isabella", "Camila", "Lucía", "Daniela", "Gabriela", "Andrea"];
  const nombresM = ["Raúl", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"];
  
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const _ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro", "Cancún", "Playa del Carmen", "Mérida"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = [
    // Categorías principales del lifestyle
    "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Fiestas Temáticas", 
    "Clubs Privados", "Eventos Lifestyle", "Intercambio Suave", "Intercambio Completo", "Terceras Personas", 
    
    // Niveles de experiencia
    "Parejas Experimentadas", "Principiantes Curiosos", "Mentalidad Abierta", "Sin Prejuicios", 
    
    // Valores importantes
    "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado", 
    "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
    
    // Lugares y eventos mexicanos
    "Clubs Swinger México", "Fiestas Privadas CDMX", "Encuentros Guadalajara", "Eventos Monterrey",
    "Reuniones Íntimas", "Jacuzzi Privado", "Masajes Tántricos", "Juegos Sensuales",
    "Lifestyle México", "Eventos Exclusivos",
    
    // Cultura mexicana lifestyle
    "Encuentros Íntimos", "Experiencias Sensuales", "Espacios Privados", "Libertad Sexual",
    "Ambiente Sensual", "Intercambio Íntimo", "Conexión Física",
    
    // Actividades sensuales
    "Fotografía Erótica", "Baile Sensual", "Cenas Íntimas", "Cócteles Afrodisíacos",
    "Spa de Parejas", "Bienestar Adulto", "Experiencias Tántricas", "Actividades en Pareja",
    
    // Arte y entretenimiento adulto
    "Arte Erótico", "Literatura Erótica", "Entretenimiento Adulto", "Ambiente Seductor"
  ];
  
  // Determinar género aleatoriamente con más entropía
  const randomSeed = Math.random() * Date.now();
  const esMujer = randomSeed % 2 > 1;
  const nombre = esMujer 
    ? nombresF[Math.floor((Math.random() * Date.now()) % nombresF.length)]
    : nombresM[Math.floor((Math.random() * Date.now()) % nombresM.length)];
  const apellido = apellidos[Math.floor((Math.random() * Date.now()) % apellidos.length)];
  
  // Generar coordenadas aleatorias para ciudades mexicanas
  const coordinates = getRandomMexicanCoordinates();
  
  // Generar imágenes dinámicas
  const gender = esMujer ? 'female' : 'male';
  const avatarImage = getRandomProfileImage(gender);
  const additionalImages = getRandomProfileImages(gender, 2);
  
  const profile = {
    id: Math.random().toString(36).substring(2, 11),
    name: `${nombre} ${apellido}`,
    first_name: nombre,
    last_name: apellido,
    age: Math.floor(Math.random() * 20) + 25,
    bio: `Soy ${nombre}, me encanta explorar nuevas experiencias y conocer gente interesante del lifestyle. Siempre busco aventuras y momentos únicos con mentalidad abierta.`,
    gender: esMujer ? 'female' : 'male',
    interested_in: 'both',
    is_premium: Math.random() > 0.7,
    is_verified: Math.random() > 0.3,
    relationship_type: 'single' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: Math.random().toString(36).substring(2, 11),
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    share_location: Math.random() > 0.5,
    // Propiedades adicionales para compatibilidad con UI
    location: coordinates.city,
    profession: profesiones[Math.floor(Math.random() * profesiones.length)],
    interests: intereses.slice(0, 3 + Math.floor(Math.random() * 3)),
    avatar: avatarImage,
    verified: Math.random() > 0.3,
    photos: additionalImages,
    stats: {
      matches: Math.floor(Math.random() * 50) + 10,
      likes: Math.floor(Math.random() * 200) + 50,
      views: Math.floor(Math.random() * 500) + 100
    },
    ...(includeOnlineStatus && { isOnline: Math.random() > 0.5 })
  };
  
  return profile;
};

export const generateMockCouple = (_includeOnlineStatus = true) => {
  const nombresM = ["Julio", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"];
  const nombresF = ["Anabella", "María", "Carmen", "Elena", "Sofía", "Laura", "Patricia", "Isabel"];
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const _ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro", "Cancún", "Playa del Carmen", "Mérida"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = [
    // Categorías principales del lifestyle
    "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Fiestas Temáticas", 
    "Clubs Privados", "Eventos Lifestyle", "Intercambio Suave", "Intercambio Completo", "Terceras Personas", 
    
    // Niveles de experiencia
    "Parejas Experimentadas", "Principiantes Curiosos", "Mentalidad Abierta", "Sin Prejuicios", 
    
    // Valores importantes
    "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado", 
    "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
    
    // Lugares y eventos mexicanos
    "Clubs Swinger México", "Fiestas Privadas CDMX", "Encuentros Guadalajara", "Eventos Monterrey",
    "Reuniones Íntimas", "Jacuzzi Privado", "Masajes Tántricos", "Juegos Sensuales",
    "Lifestyle México", "Eventos Exclusivos",
    
    // Cultura mexicana lifestyle
    "Encuentros Íntimos", "Experiencias Sensuales", "Espacios Privados", "Libertad Sexual",
    "Ambiente Sensual", "Intercambio Íntimo", "Conexión Física",
    
    // Actividades sensuales
    "Fotografía Erótica", "Baile Sensual", "Cenas Íntimas", "Cócteles Afrodisíacos",
    "Spa de Parejas", "Bienestar Adulto", "Experiencias Tántricas", "Actividades en Pareja",
    
    // Arte y entretenimiento adulto
    "Arte Erótico", "Literatura Erótica", "Entretenimiento Adulto", "Ambiente Seductor"
  ];
  
  const nombreM = nombresM[Math.floor(Math.random() * nombresM.length)];
  const nombreF = nombresF[Math.floor(Math.random() * nombresF.length)];
  const _apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  // Imágenes reales de Unsplash para parejas demo
  const coupleImages = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  ];
  
  const femaleImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
  ];
  
  const maleImages = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  ];
  
  const age1 = Math.floor(Math.random() * 20) + 25;
  const age2 = Math.floor(Math.random() * 20) + 25;
  
  return {
    id: Math.floor(Math.random() * 10000),
    coupleName: `${nombreF} & ${nombreM}`,
    ages: [age1, age2],
    ageRange: `${age1}-${age2}`,
    location: _ubicaciones[Math.floor(Math.random() * _ubicaciones.length)],
    bio: "Pareja experimentada en el lifestyle swinger. Buscamos nuevas experiencias y conexiones auténticas con otras parejas y singles en México.",
    lookingFor: "Conexiones auténticas y experiencias únicas",
    lifestyle: "Aventurero y espontáneo",
    experienceLevel: "Intermedio",
    interests: intereses.slice(0, 5 + Math.floor(Math.random() * 4)),
    avatar: coupleImages[Math.floor(Math.random() * coupleImages.length)],
    photos: [
      coupleImages[Math.floor(Math.random() * coupleImages.length)],
      coupleImages[Math.floor(Math.random() * coupleImages.length)]
    ],
    isOnline: Math.random() > 0.5,
    isVerified: Math.random() > 0.3,
    isPremium: Math.random() > 0.7,
    partner1: {
      name: nombreF,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      bio: `Me encanta explorar nuevas experiencias junto a mi pareja. Soy ${profesiones[Math.floor(Math.random() * profesiones.length)].toLowerCase()} y disfruto de la vida al máximo.`,
      avatar: femaleImages[Math.floor(Math.random() * femaleImages.length)],
      interests: intereses.slice(0, 3 + Math.floor(Math.random() * 3)), // 3-5 intereses
    },
    partner2: {
      name: nombreM,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      bio: `Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas. Trabajo como ${profesiones[Math.floor(Math.random() * profesiones.length)].toLowerCase()}.`,
      avatar: maleImages[Math.floor(Math.random() * maleImages.length)],
      interests: intereses.slice(5, 8 + Math.floor(Math.random() * 3)), // 3-5 intereses diferentes
    },
    stats: {
      likes: Math.floor(Math.random() * 800) + 100,
      matches: Math.floor(Math.random() * 80) + 10,
      visits: Math.floor(Math.random() * 300) + 50
    }
  };
};

// ===== NUEVAS FUNCIONALIDADES SOCIALES =====

// NOTA: ConnectionRequest eliminado - usar tipos de Supabase desde @/integrations/supabase/types
// Los tipos correctos están en Database['public']['Tables']['invitations']['Row']
// con relaciones a Database['public']['Tables']['profiles']['Row']

// Configuración de privacidad de perfil
export interface ProfilePrivacySettings {
  userId: number;
  profileVisibility: 'public' | 'connections_only' | 'hidden';
  allowMessages: 'everyone' | 'connections_only' | 'none';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowProfileViews: 'everyone' | 'connections_only';
}

// Galería de imágenes
export interface GalleryImage {
  id: number;
  userId: string;
  url: string;
  caption?: string;
  isPublic: boolean;
  createdAt: string;
  likes: number;
  comments: number;
}

// Eventos VIP (función premium)
export interface VIPEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  isVIPOnly: boolean;
  organizer: {
    name: string;
    avatar: string;
  };
  images: string[];
}

// Regalos virtuales (función premium)
export interface VirtualGift {
  id: number;
  name: string;
  icon: string;
  price: number;
  description: string;
  category: 'romantic' | 'fun' | 'luxury' | 'special';
}

// Historias efímeras (función premium)
export interface Story {
  id: number;
  userId: number;
  user: {
    name: string;
    avatar: string;
  };
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
  };
  createdAt: string;
  expiresAt: string;
  views: number;
  isViewed: boolean;
}

// NOTA: Mock data eliminado - usar datos reales de Supabase
// Las solicitudes se obtienen desde la tabla 'invitations' con relaciones a 'profiles'

// Mock data para configuración de privacidad
export const mockPrivacySettings: ProfilePrivacySettings = {
  userId: 1,
  profileVisibility: 'public',
  allowMessages: 'everyone',
  showOnlineStatus: true,
  showLastSeen: true,
  allowProfileViews: 'everyone'
};

// Mock data para galería
export const mockGalleryImages: GalleryImage[] = [
  {
    id: 1,
    userId: "1",
    url: "https://randomuser.me/api/portraits/women/30.jpg",
    caption: "Disfrutando el atardecer en la playa",
    isPublic: true,
    createdAt: "2024-01-10T18:30:00Z",
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    userId: "1",
    url: "https://randomuser.me/api/portraits/women/31.jpg",
    caption: "Noche de fiesta con amigos",
    isPublic: false,
    createdAt: "2024-01-08T22:15:00Z",
    likes: 18,
    comments: 3
  }
];

// Mock data para eventos VIP
export const mockVIPEvents: VIPEvent[] = [
  {
    id: 1,
    title: "Fiesta VIP Lifestyle CDMX",
    description: "Evento exclusivo para parejas y singles del lifestyle. Ambiente elegante, música en vivo y experiencias únicas.",
    date: "2024-02-14T20:00:00Z",
    location: "Hotel Boutique Polanco, CDMX",
    price: 2500,
    maxAttendees: 50,
    currentAttendees: 32,
    isVIPOnly: true,
    organizer: {
      name: "ComplicesConecta Events",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
    ]
  }
];

// Mock data para regalos virtuales
export const mockVirtualGifts: VirtualGift[] = [
  {
    id: 1,
    name: "Rosa Roja",
    icon: "🌹",
    price: 50,
    description: "Un gesto romántico clásico",
    category: 'romantic'
  },
  {
    id: 2,
    name: "Champagne",
    icon: "🍾",
    price: 200,
    description: "Para celebrar momentos especiales",
    category: 'luxury'
  },
  {
    id: 3,
    name: "Corazón de Fuego",
    icon: "💖",
    price: 100,
    description: "Muestra tu pasión",
    category: 'romantic'
  }
];

// Mock data para historias
export const mockStories: Story[] = [
  {
    id: 1,
    userId: 101,
    user: {
      name: "Sofía García",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg"
    },
    content: {
      type: 'image',
      url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400"
    },
    createdAt: "2024-01-15T14:30:00Z",
    expiresAt: "2024-01-16T14:30:00Z",
    views: 12,
    isViewed: false
  }
];
