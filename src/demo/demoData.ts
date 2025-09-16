/**
 * Datos demo para ComplicesConecta
 * Perfiles mock para desarrollo y testing
 */

export const demoProfiles = [
  {
    id: 'demo-1',
    first_name: 'Ana',
    last_name: 'García',
    display_name: 'Ana G.',
    age: 28,
    bio: 'Amante de los viajes y la fotografía. Buscando conexiones auténticas.',
    email: 'ana.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: true,
    is_premium: false,
    role: 'user',
    location: 'Madrid, España',
    interests: ['viajes', 'fotografía', 'arte', 'música'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'demo-2',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    display_name: 'Carlos R.',
    age: 32,
    bio: 'Desarrollador apasionado por la tecnología y los deportes.',
    email: 'carlos.demo@complicesconecta.com',
    profile_type: 'single',
    is_demo: true,
    is_verified: false,
    is_premium: true,
    role: 'user',
    location: 'Barcelona, España',
    interests: ['tecnología', 'deportes', 'cine', 'lectura'],
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
    location: 'Valencia, España',
    interests: ['aventura', 'naturaleza', 'cocina', 'baile'],
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
    location: 'Sevilla, España',
    interests: ['arte', 'diseño', 'música', 'teatro'],
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
    location: 'Bilbao, España',
    interests: ['cocina', 'gastronomía', 'vinos', 'cultura'],
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
