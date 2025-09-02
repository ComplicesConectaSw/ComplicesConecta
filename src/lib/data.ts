import { Search, Users, Heart, MessageCircle, Calendar, Crown, BarChart3, Settings, Bell, Shield, UserPlus } from 'lucide-react';

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
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400',
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

// Generador de perfiles mock aleatorios
export const generateMockSingle = () => {
  const nombresF = ["Sofía", "Valentina", "Isabella", "Camila", "Lucía", "Daniela", "Gabriela", "Andrea"];
  const nombresM = ["Raúl", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"];
  
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = ["Aventuras", "Diversión", "Experiencias Únicas", "Conexiones Reales", "Lifestyle", "Viajes", "Arte", "Música", "Fotografía", "Cocina", "Deportes", "Lectura", "Cine", "Baile", "Naturaleza", "Tecnología", "Yoga", "Fitness", "Gastronomía", "Moda"];
  
  // Determinar género aleatoriamente
  const esMujer = Math.random() > 0.5;
  const nombre = esMujer 
    ? nombresF[Math.floor(Math.random() * nombresF.length)]
    : nombresM[Math.floor(Math.random() * nombresM.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  // Avatar específico por género con ID único
  const avatarGender = esMujer ? 'women' : 'men';
  const avatarId = Math.floor(Math.random() * 99) + 1;
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  
  return {
    id: Math.floor(Math.random() * 10000),
    name: `${nombre} ${apellido}`,
    age: Math.floor(Math.random() * 27) + 18, // 18-44
    gender: esMujer ? 'female' : 'male',
    location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
    profession: profesiones[Math.floor(Math.random() * profesiones.length)],
    bio: `Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta ${intereses[Math.floor(Math.random() * intereses.length)].toLowerCase()} y conocer gente nueva.`,
    interests: intereses.slice(0, 3 + Math.floor(Math.random() * 3)),
    avatar: `https://randomuser.me/api/portraits/${esMujer ? 'women' : 'men'}/${avatarId}.jpg`,
    isOnline: Math.random() > 0.5,
    isVerified: Math.random() > 0.3,
    isPremium: Math.random() > 0.7,
    stats: {
      likes: Math.floor(Math.random() * 500) + 50,
      matches: Math.floor(Math.random() * 50) + 5,
      visits: Math.floor(Math.random() * 200) + 20
    }
  };
};

export const generateMockCouple = () => {
  const nombresM = ["Julio", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"];
  const nombresF = ["Anabella", "María", "Carmen", "Elena", "Sofía", "Laura", "Patricia", "Isabel"];
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = ["Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP", "Lifestyle", "Experiencias Nuevas", "Viajes"];
  
  const nombreM = nombresM[Math.floor(Math.random() * nombresM.length)];
  const nombreF = nombresF[Math.floor(Math.random() * nombresF.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  // IDs únicos para avatares de pareja
  const avatarIdF = Math.floor(Math.random() * 99) + 1;
  const avatarIdM = Math.floor(Math.random() * 99) + 1;
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  
  return {
    id: Math.floor(Math.random() * 10000),
    coupleName: `${nombreF} & ${nombreM}`,
    ageRange: `${Math.floor(Math.random() * 10) + 25}-${Math.floor(Math.random() * 10) + 35}`,
    location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
    bio: "Pareja experimentada en el lifestyle. Buscamos nuevas experiencias y conexiones auténticas con otras parejas y singles.",
    interests: intereses.slice(0, 3 + Math.floor(Math.random() * 3)),
    isOnline: Math.random() > 0.5,
    isVerified: Math.random() > 0.3,
    isPremium: Math.random() > 0.7,
    partner1: {
      name: nombreF,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      bio: `Me encanta explorar nuevas experiencias junto a mi pareja. Soy ${profesiones[Math.floor(Math.random() * profesiones.length)].toLowerCase()} y disfruto de la vida al máximo.`,
      avatar: `https://randomuser.me/api/portraits/women/${avatarIdF}.jpg?seed=${uniqueId}`,
    },
    partner2: {
      name: nombreM,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      bio: `Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas. Trabajo como ${profesiones[Math.floor(Math.random() * profesiones.length)].toLowerCase()}.`,
      avatar: `https://randomuser.me/api/portraits/men/${avatarIdM}.jpg?seed=${uniqueId}`,
    },
    stats: {
      likes: Math.floor(Math.random() * 800) + 100,
      matches: Math.floor(Math.random() * 80) + 10,
      visits: Math.floor(Math.random() * 300) + 50
    }
  };
};

// ===== NUEVAS FUNCIONALIDADES SOCIALES =====

// Estados de solicitudes de conexión
export type ConnectionRequestStatus = 'pending' | 'accepted' | 'declined';

// Tipo para solicitudes de conexión
export interface ConnectionRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromUser: {
    id: number;
    name: string;
    avatar: string;
    type: 'single' | 'couple';
    location: string;
  };
  toUser: {
    id: number;
    name: string;
    avatar: string;
    type: 'single' | 'couple';
    location: string;
  };
  status: ConnectionRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

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
  userId: number;
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

// Mock data para solicitudes de conexión
export const mockConnectionRequests: ConnectionRequest[] = [
  {
    id: 1,
    fromUserId: 101,
    toUserId: 1,
    fromUser: {
      id: 101,
      name: "Sofía García",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      type: 'single',
      location: "CDMX"
    },
    toUser: {
      id: 1,
      name: "María González",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
      type: 'single',
      location: "CDMX"
    },
    status: 'pending',
    message: "¡Hola! Me encantaría conocerte mejor. Tenemos muchos intereses en común.",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    fromUserId: 102,
    toUserId: 1,
    fromUser: {
      id: 102,
      name: "Carmen & Roberto",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      type: 'couple',
      location: "Guadalajara"
    },
    toUser: {
      id: 1,
      name: "María González",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
      type: 'single',
      location: "CDMX"
    },
    status: 'pending',
    message: "Somos una pareja experimentada y nos gustaría conocerte. ¿Te interesa una experiencia única?",
    createdAt: "2024-01-14T15:45:00Z"
  }
];

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
    userId: 1,
    url: "https://randomuser.me/api/portraits/women/30.jpg",
    caption: "Disfrutando el atardecer en la playa",
    isPublic: true,
    createdAt: "2024-01-10T18:30:00Z",
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    userId: 1,
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
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg"
    },
    images: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
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
