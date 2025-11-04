/**
 * Datos demo para ComplicesConecta
 * Perfiles mock para desarrollo y testing
 */

import { v4 as uuidv4 } from 'uuid';
import { pickProfileImage, resetImageCounters, type ProfileType, type Gender } from '@/lib/media';
import { getAutoInterests } from '@/lib/lifestyle-interests';

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
  theme?: 'romantic' | 'adventurous';
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
    'Explorando el lifestyle swinger con mente abierta y respeto. Busco conexiones auténticas y experiencias compartidas.',
    'Pareja liberal en busca de otras parejas afines para intercambios. Discreción y comunicación abierta son clave.',
    'Nuevo en el lifestyle swinger, pero con muchas ganas de conocer gente interesante y vivir nuevas experiencias.',
    'Experiencia en el lifestyle, buscando parejas y singles para momentos únicos. Siempre con respeto mutuo.',
    'Discreto y respetuoso. Me encanta la vida social del lifestyle y conocer personas afines.',
    'Pareja experimentada buscando conexiones reales en el lifestyle swinger. Comunicación y límites claros.',
    'Aventurero del lifestyle swinger en busca de parejas y personas para compartir diversión adulta.',
    'Buscando explorar el lifestyle con parejas de mente abierta. Discreción total y ambiente relajado.'
  ];

  resetImageCounters();

  return Array.from({ length: count }, (_, _i) => {
    const profileType: ProfileType = Math.random() > 0.7 ? 'couple' : 'single';
    const gender: Gender = Math.random() > 0.5 ? 'male' : 'female';
    const partnerGender: Gender = gender === 'male' ? 'female' : 'male';
    
    // Nivel de experiencia aleatorio para intereses más variados
    const experienceLevels = ['principiante', 'intermedio', 'experimentado'];
    const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    
    // Generar intereses automáticos apropiados para el lifestyle swinger
    const interests = getAutoInterests(profileType, experienceLevel, gender);
    
    return {
      id: uuidv4(),
      name: nombres[Math.floor(Math.random() * nombres.length)],
      age: Math.floor(Math.random() * 20) + 25,
      location: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
      distance: Math.floor(Math.random() * 50) + 1,
      interests,
      image: pickProfileImage({ id: uuidv4(), name: nombres[Math.floor(Math.random() * nombres.length)], type: profileType, gender }, new Set()),
      bio: bios[Math.floor(Math.random() * bios.length)],
      isOnline: Math.random() > 0.3,
      lastActive: `Hace ${Math.floor(Math.random() * 60)} min`,
      isVerified: Math.random() > 0.4,
      isPremium: Math.random() > 0.7,
      rating: Math.floor(Math.random() * 2) + 4,
      matchScore: Math.floor(Math.random() * 30) + 70,
      profileType,
      gender,
      partnerGender: profileType === 'couple' ? partnerGender : undefined,
      theme: Math.random() > 0.5 ? 'romantic' : 'adventurous',
      isDemo: true as const
    };
  });
};

export const demoStats = {
  totalUsers: 15420,
  activeToday: 2341,
  newThisWeek: 187,
  premiumUsers: 892,
  verifiedProfiles: 7234,
  successfulMatches: 3456,
  averageAge: 32,
  topLocation: 'Ciudad de México'
};

export const demoProfiles = [
  {
    id: 'demo-1',
    first_name: 'Ana',
    last_name: 'García',
    display_name: 'Ana & Carlos',
    // NFT Gallery example
    nft_galleries: [
      {
        id: 'nft-demo-1',
        gallery_name: 'Mi Verano 2025',
        is_verified: true,
        nft_network: 'polygon',
        nft_token_id: '#12345',
        minted_at: '2025-06-15T10:30:00Z',
        images_count: 12
      }
    ]
  },
  {
    id: 'demo-6',
    first_name: 'Javier',
    last_name: 'Morales',
    display_name: 'Javier M.',
    age: 31,
    bio: 'Emprendedor de Tijuana con éxito en los negocios y mente abierta para nuevas experiencias. Busco conexiones auténticas y momentos especiales.',
    email: 'javier.morales@demo.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: false,
    is_premium: false,
    role: 'user',
    latitude: 32.5149,
    longitude: -117.0382,
    created_at: '2024-02-20T13:10:00Z',
    updated_at: '2024-02-20T13:10:00Z',
    avatar_url: '/profile-2.jpg',
    interests: ['negocios', 'networking', 'lujo', 'experiencias_exclusivas', 'vida_social'],
    location: 'Tijuana, Baja California',
    // NFT Gallery example
    nft_galleries: [
      {
        id: 'nft-demo-6',
        gallery_name: 'Experiencias VIP',
        is_verified: true,
        nft_network: 'polygon',
        nft_token_id: '#67890',
        minted_at: '2025-07-20T14:15:00Z',
        images_count: 8
      }
    ]
  },
  {
    id: 'demo-2',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    display_name: 'Carlos R.',
    age: 32,
    bio: 'Soltero de Guadalajara con mente abierta. Disfruto de la buena compañía, eventos sociales y experiencias nuevas. Busco conexiones genuinas.',
    email: 'carlos.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: false,
    is_premium: true,
    role: 'user',
    location: 'Ciudad de México, México',
    interests: ['Lifestyle Swinger', 'Intercambio de Parejas', 'Eventos Lifestyle', 'Mentalidad Abierta'],
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'demo-couple-1',
    first_name: 'María & Juan',
    last_name: 'López',
    display_name: 'María & Juan',
    age: 29,
    bio: 'Pareja aventurera buscando nuevas experiencias y amistades.',
    email: 'pareja.demo@complicesconecta.com',
    profile_type: 'couple',
    is_demo: true,
    is_verified: true,
    is_premium: true,
    role: 'user',
    location: 'Guadalajara, México',
    interests: ['Intercambio de Parejas', 'Fiestas Temáticas', 'Clubs Privados', 'Experiencias Nuevas'],
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
    // NFT Gallery example - Premium couple with verified NFT
    nft_galleries: [
      {
        id: 'nft-demo-couple-1',
        gallery_name: 'Aventuras Compartidas',
        is_verified: true,
        nft_network: 'polygon',
        nft_token_id: '#11111',
        minted_at: '2025-08-10T16:45:00Z',
        images_count: 20
      },
      {
        id: 'nft-demo-couple-2',
        gallery_name: 'Momentos Especiales',
        is_verified: true,
        nft_network: 'polygon',
        nft_token_id: '#22222',
        minted_at: '2025-09-05T11:20:00Z',
        images_count: 15
      }
    ]
  },
  {
    id: 'demo-3',
    first_name: 'Laura',
    last_name: 'Martínez',
    display_name: 'Laura M.',
    age: 26,
    bio: 'Artista y diseñadora. Me encanta crear y conectar con personas creativas.',
    email: 'laura.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: true,
    is_premium: false,
    role: 'user',
    location: 'Monterrey, México',
    interests: ['Arte Erótico', 'Fotografía Erótica', 'Ambiente Sensual', 'Conexiones Auténticas'],
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    // NFT Gallery example - Artist with verified NFT portfolio
    nft_galleries: [
      {
        id: 'nft-demo-3',
        gallery_name: 'Portafolio Artístico',
        is_verified: true,
        nft_network: 'polygon',
        nft_token_id: '#33333',
        minted_at: '2025-05-12T09:00:00Z',
        images_count: 25
      }
    ]
  },
  {
    id: 'demo-4',
    first_name: 'Miguel',
    last_name: 'Fernández',
    display_name: 'Miguel F.',
    age: 35,
    bio: 'Chef profesional y amante de la buena comida. Siempre experimentando.',
    email: 'miguel.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: false,
    is_premium: false,
    role: 'user',
    location: 'Puebla, México',
    interests: ['Cenas Íntimas', 'Cócteles Afrodisíacos', 'Experiencias Sensuales', 'Diversión Adulta'],
    created_at: '2024-01-19T11:20:00Z',
    updated_at: '2024-01-19T11:20:00Z'
  }
];

export const demoMessages = [
  {
    id: 'msg-1',
    content: '¡Hola! Me encanta tu perfil, tenemos muchos intereses en común.',
    sender_id: 'demo-1',
    receiver_id: 'demo-2',
    created_at: '2024-01-20T10:30:00Z',
    read: false
  },
  {
    id: 'msg-2',
    content: 'Gracias Ana! También me llamó la atención tu pasión por la fotografía.',
    sender_id: 'demo-2',
    receiver_id: 'demo-1',
    created_at: '2024-01-20T10:45:00Z',
    read: true
  },
  {
    id: 'msg-3',
    content: '¿Te gustaría quedar para tomar un café y hablar de viajes?',
    sender_id: 'demo-1',
    receiver_id: 'demo-2',
    created_at: '2024-01-20T11:00:00Z',
    read: false
  }
];

export const demoInvitations = [
  {
    id: 'inv-1',
    from_profile: 'demo-3',
    to_profile: 'demo-1',
    type: 'profile',
    message: 'Me encantaría conocerte mejor, ¿te interesa conectar?',
    status: 'pending',
    created_at: '2024-01-20T09:00:00Z'
  },
  {
    id: 'inv-2',
    from_profile: 'demo-4',
    to_profile: 'demo-couple-1',
    type: 'gallery',
    message: 'Hola! Me gustaría ver más fotos de vuestras aventuras.',
    status: 'accepted',
    created_at: '2024-01-19T15:30:00Z'
  }
];

export const demoEvents = [
  {
    id: 'event-1',
    title: 'Noche de Fotografía',
    description: 'Encuentro para amantes de la fotografía nocturna',
    date: '2024-02-15T20:00:00Z',
    location: 'Parque del Retiro, Madrid',
    organizer: 'demo-1',
    attendees: ['demo-2', 'demo-3'],
    max_attendees: 10,
    is_premium: false
  },
  {
    id: 'event-2',
    title: 'Cena Gastronómica',
    description: 'Experiencia culinaria con chef profesional',
    date: '2024-02-20T19:30:00Z',
    location: 'Restaurante Demo, Barcelona',
    organizer: 'demo-4',
    attendees: ['demo-couple-1'],
    max_attendees: 8,
    is_premium: true
  }
];

export const demoMatches = [
  {
    id: 'match-1',
    profile1: 'demo-1',
    profile2: 'demo-2',
    compatibility_score: 85,
    matched_at: '2024-01-20T08:00:00Z',
    status: 'active'
  },
  {
    id: 'match-2',
    profile1: 'demo-3',
    profile2: 'demo-4',
    compatibility_score: 72,
    matched_at: '2024-01-19T14:20:00Z',
    status: 'pending'
  }
];
