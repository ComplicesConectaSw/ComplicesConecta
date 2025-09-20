/**
 * Datos demo para ComplicesConecta
 * Perfiles mock para desarrollo y testing
 */

export const demoProfiles = [
  {
    id: 'demo-single-outlook',
    first_name: 'Sofía',
    last_name: 'Mendoza',
    display_name: 'Sofía M.',
    age: 28,
    bio: 'Profesional independiente y aventurera. Me gusta conocer gente nueva y vivir experiencias únicas. Busco conexiones auténticas y momentos especiales.',
    email: 'single@outlook.es',
    profile_type: 'single',
    is_demo: true,
    is_verified: true,
    is_premium: false,
    role: 'user',
    gender: 'female',
    relationship_status: 'single',
    location: 'Ciudad de México, México',
    latitude: 19.4326,
    longitude: -99.1332,
    interests: ['lifestyle', 'aventuras', 'nuevas_experiencias', 'conexiones_autenticas', 'vida_social'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    avatar_url: '/profile-sofia.jpg'
  },
  {
    id: 'demo-pareja-outlook',
    first_name: 'Carmen',
    last_name: 'Ruiz',
    display_name: 'Carmen & Roberto',
    age: 32,
    bio: 'Pareja liberal y experimentada. Buscamos otras parejas y personas especiales para compartir experiencias únicas. Somos discretos y respetuosos.',
    email: 'pareja@outlook.es',
    profile_type: 'couple',
    is_demo: true,
    is_verified: true,
    is_premium: true,
    role: 'user',
    gender: 'couple',
    relationship_status: 'couple',
    location: 'Guadalajara, México',
    latitude: 20.6597,
    longitude: -103.3496,
    interests: ['intercambio_parejas', 'lifestyle', 'parejas', 'experiencias_compartidas', 'discrecion'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    avatar_url: '/profile-couple.jpg'
  },
  {
    id: 'demo-1',
    first_name: 'Ana',
    last_name: 'García',
    display_name: 'Ana & Carlos'
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
    location: 'Tijuana, Baja California'
  },
  {
    id: 'demo-2',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    display_name: 'Carlos R.',
    age: 32,
    bio: 'Hombre experimentado de Guadalajara. Discreto, respetuoso y con mucha energía. Me especializo en hacer sentir especiales a las parejas.',
    email: 'carlos.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: false,
    is_premium: true,
    role: 'user',
    location: 'Ciudad de México, México',
    interests: ['hotwife', 'bull', 'intercambio_parejas', 'trios', 'orgias', 'cuckold'],
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'demo-couple-1',
    first_name: 'María & Juan',
    last_name: 'López',
    display_name: 'María & Juan',
    age: 29,
    bio: 'Pareja liberal de CDMX. Ella disfruta la atención, él comparte las experiencias. Buscamos conexiones auténticas con parejas y personas especiales.',
    email: 'pareja.demo@complicesconecta.com',
    profile_type: 'couple',
    is_demo: true,
    is_verified: true,
    is_premium: true,
    role: 'user',
    location: 'Guadalajara, México',
    interests: ['lifestyle', 'intercambio', 'parejas', 'nuevas_experiencias'],
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
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
    interests: ['tercera_persona', 'bisexual', 'parejas', 'sensualidad'],
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z'
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
    interests: ['encuentros_grupales', 'experiencias_intensas', 'exhibicionismo', 'aventuras'],
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
    title: 'Encuentro Privado del Lifestyle',
    description: 'Reunión íntima para parejas y personas del ambiente liberal',
    date: '2024-02-15T20:00:00Z',
    location: 'Chapultepec, Ciudad de México',
    organizer: 'demo-1',
    attendees: ['demo-2', 'demo-3'],
    max_attendees: 10,
    is_premium: false
  },
  {
    id: 'event-2',
    title: 'Evento VIP Exclusivo',
    description: 'Encuentro especial para miembros premium del club liberal',
    date: '2024-02-20T19:30:00Z',
    location: 'Restaurante Demo, Polanco CDMX',
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
