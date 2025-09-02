import { Search, Users, Heart, MessageCircle, Calendar, Crown, BarChart3, Settings, Bell, Shield } from 'lucide-react';
import profile1 from '@/assets/profile-1.jpg';

export const mainNavItems = [
  { title: 'Descubrir', url: '/discover', icon: Search, badge: 'Nuevo' },
  { title: 'Perfiles', url: '/profiles', icon: Users },
  { title: 'Matches', url: '/matches', icon: Heart, badge: '3' },
  { title: 'Chat', url: '/chat', icon: MessageCircle, badge: '5' },
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
  avatar: profile1,
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
  const nombres = [
    "Alejandra", "Valentina", "Isabella", "Camila", "Lucía", "Daniela", "Gabriela", "Andrea",
    "Carlos", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"
  ];
  
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = ["Aventuras", "Diversión", "Experiencias Únicas", "Conexiones Reales", "Lifestyle", "Viajes", "Arte", "Música"];
  
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  return {
    id: Math.floor(Math.random() * 10000),
    name: `${nombre} ${apellido}`,
    age: Math.floor(Math.random() * 27) + 18, // 18-44
    location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
    profession: profesiones[Math.floor(Math.random() * profesiones.length)],
    bio: `Persona auténtica buscando conexiones reales y experiencias memorables. Me encanta ${intereses[Math.floor(Math.random() * intereses.length)].toLowerCase()} y conocer gente nueva.`,
    interests: intereses.slice(0, 3 + Math.floor(Math.random() * 3)),
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=400&fit=crop&crop=face&auto=format&q=80&sig=${Math.random()}`,
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
  const nombresM = ["Carlos", "Miguel", "Alejandro", "Fernando", "Roberto", "Javier", "Antonio", "Pablo"];
  const nombresF = ["Ana", "María", "Carmen", "Elena", "Sofía", "Laura", "Patricia", "Isabel"];
  const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez"];
  const ubicaciones = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro"];
  const profesiones = ["Ingeniero/a", "Médico/a", "Abogado/a", "Diseñador/a", "Empresario/a", "Artista", "Profesor/a"];
  const intereses = ["Fiestas Privadas", "Intercambio de Parejas", "Eventos VIP", "Lifestyle", "Experiencias Nuevas", "Viajes"];
  
  const nombreM = nombresM[Math.floor(Math.random() * nombresM.length)];
  const nombreF = nombresF[Math.floor(Math.random() * nombresF.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  return {
    id: Math.floor(Math.random() * 10000),
    coupleName: `${nombreF} & ${nombreM}`,
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
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=400&fit=crop&crop=face&auto=format&q=80&sig=${Math.random()}`
    },
    partner2: {
      name: nombreM,
      age: Math.floor(Math.random() * 20) + 25, // 25-44
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      bio: `Aventurero y respetuoso, busco junto a mi pareja vivir experiencias únicas. Trabajo como ${profesiones[Math.floor(Math.random() * profesiones.length)].toLowerCase()}.`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=400&fit=crop&crop=face&auto=format&q=80&sig=${Math.random()}`
    },
    stats: {
      likes: Math.floor(Math.random() * 800) + 100,
      matches: Math.floor(Math.random() * 80) + 10,
      visits: Math.floor(Math.random() * 300) + 50
    }
  };
};
