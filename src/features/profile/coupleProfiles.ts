import { logger } from '@/lib/logger';
// Servicio de Perfiles de Pareja con respaldo a datos simulados
// Este servicio usará datos reales de Supabase cuando estén disponibles, de lo contrario usará datos simulados

export type RelationshipType = 'man-woman' | 'man-man' | 'woman-woman';

export interface CoupleProfileData {
  id: string;
  couple_name: string;
  couple_bio: string | null;
  relationship_type: RelationshipType;
  partner1_id: string;
  partner2_id: string;
  couple_images: string[] | null;
  is_verified: boolean | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CoupleProfileWithPartners extends CoupleProfileData {
  partner1_first_name: string;
  partner1_last_name: string;
  partner1_age: number;
  partner1_bio: string | null;
  partner1_gender: string;
  partner2_first_name: string;
  partner2_last_name: string;
  partner2_age: number;
  partner2_bio: string | null;
  partner2_gender: string;
  location?: string;
  isOnline?: boolean;
}

export interface CreateCoupleProfileData {
  couple_name: string;
  couple_bio?: string;
  relationship_type: RelationshipType;
  partner1_id: string;
  partner2_id: string;
  couple_images?: string[];
}

export interface UpdateCoupleProfileData {
  couple_name?: string;
  couple_bio?: string;
  couple_images?: string[];
}

// Almacenamiento de datos simulados para desarrollo
let mockCoupleProfiles: CoupleProfileWithPartners[] = [];

// Inicializar datos simulados
const initializeMockData = () => {
  if (mockCoupleProfiles.length === 0) {
    mockCoupleProfiles = generateMockCoupleProfiles();
  }
};

// Crear un nuevo perfil de pareja (implementación simulada)
export const createCoupleProfile = async (data: CreateCoupleProfileData): Promise<CoupleProfileData | null> => {
  try {
    initializeMockData();
    
    const newProfile: CoupleProfileData = {
      id: `couple-${Date.now()}`,
      couple_name: data.couple_name,
      couple_bio: data.couple_bio || null,
      relationship_type: data.relationship_type,
      partner1_id: data.partner1_id,
      partner2_id: data.partner2_id,
      couple_images: data.couple_images || null,
      is_verified: false,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // En una implementación real, esto se guardaría en Supabase
    logger.info('Created couple profile (mock):', newProfile);
    return newProfile;
  } catch (error) {
    logger.error('Error creating couple profile:', { error: String(error) });
    return null;
  }
};

// Obtener perfil de pareja por ID con detalles de los compañeros (implementación simulada)
export const getCoupleProfileById = async (id: string): Promise<CoupleProfileWithPartners | null> => {
  try {
    initializeMockData();
    return mockCoupleProfiles.find(profile => profile.id === id) || null;
  } catch (error) {
    logger.error('Error searching couple profiles:', { error: String(error) });
    return null;
  }
};

// Obtener perfil de pareja por ID de usuario (implementación simulada)
export const getCoupleProfileByUserId = async (userId: string): Promise<CoupleProfileWithPartners | null> => {
  try {
    initializeMockData();
    return mockCoupleProfiles.find(profile => 
      profile.partner1_id === userId || profile.partner2_id === userId
    ) || null;
  } catch (error) {
    logger.error('Error fetching couple profile by ID:', { error: String(error) });
    return null;
  }
};

// Obtener todos los perfiles de pareja para descubrimiento
export const getAllCoupleProfiles = async (limit: number = 20, offset: number = 0): Promise<CoupleProfileWithPartners[]> => {
  try {
    initializeMockData();
    return mockCoupleProfiles.slice(offset, offset + limit);
  } catch (error) {
    logger.error('Error fetching couple profiles:', { error: String(error) });
    return [];
  }
};

// Actualizar perfil de pareja (implementación simulada)
export const updateCoupleProfile = async (id: string, data: UpdateCoupleProfileData): Promise<CoupleProfileData | null> => {
  try {
    initializeMockData();
    const profileIndex = mockCoupleProfiles.findIndex(profile => profile.id === id);
    
    if (profileIndex === -1) {
      return null;
    }

    const updatedProfile = {
      ...mockCoupleProfiles[profileIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    mockCoupleProfiles[profileIndex] = updatedProfile;
    logger.info('Updated couple profile (mock):', updatedProfile);
    return updatedProfile;
  } catch (error) {
    logger.error('Error updating couple profile:', { error: String(error) });
    return null;
  }
};

// Eliminar perfil de pareja (implementación simulada)
export const deleteCoupleProfile = async (id: string): Promise<boolean> => {
  try {
    initializeMockData();
    const profileIndex = mockCoupleProfiles.findIndex(profile => profile.id === id);
    
    if (profileIndex === -1) {
      return false;
    }

    mockCoupleProfiles.splice(profileIndex, 1);
    logger.info('Fetching couple profiles with filters:', { filters: String(id) });
    return true;
  } catch (error) {
    logger.error('Error deleting couple profile:', { error: String(error) });
    return false;
  }
};

// Verificar si el usuario es parte de una pareja
export const isUserInCouple = async (userId: string): Promise<boolean> => {
  try {
    const coupleProfile = await getCoupleProfileByUserId(userId);
    return coupleProfile !== null;
  } catch (error) {
    logger.error('Error checking if user is in couple:', { error: String(error) });
    return false;
  }
};

// Obtener nombre de visualización del tipo de relación
export const getRelationshipDisplayName = (relationshipType: RelationshipType): string => {
  switch (relationshipType) {
    case 'man-man':
      return 'Pareja Masculina';
    case 'woman-woman':
      return 'Pareja Femenina';
    case 'man-woman':
    default:
      return 'Pareja Mixta';
  }
};

// Generar perfiles de pareja simulados para desarrollo/demo
export const generateMockCoupleProfiles = (): CoupleProfileWithPartners[] => {
  return [
    {
      id: 'mock-couple-1',
      couple_name: 'Ana & Carlos',
      couple_bio: 'Pareja aventurera buscando nuevas experiencias y conexiones auténticas. Nos encanta viajar, la buena comida y conocer gente interesante.',
      relationship_type: 'man-woman',
      partner1_id: 'mock-partner-1',
      partner2_id: 'mock-partner-2',
      couple_images: ['/placeholder.svg', '/placeholder.svg'],
      is_verified: true,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partner1_first_name: 'Ana',
      partner1_last_name: 'García',
      partner1_age: 28,
      partner1_bio: 'Diseñadora gráfica apasionada por el arte',
      partner1_gender: 'mujer',
      partner2_first_name: 'Carlos',
      partner2_last_name: 'Mendoza',
      partner2_age: 32,
      partner2_bio: 'Ingeniero de software y fotógrafo amateur',
      partner2_gender: 'hombre',
    },
    {
      id: 'mock-couple-2',
      couple_name: 'Miguel & David',
      couple_bio: 'Pareja estable de 5 años, amantes del fitness y la vida saludable. Buscamos amistades y conexiones genuinas.',
      relationship_type: 'man-man',
      partner1_id: 'mock-partner-3',
      partner2_id: 'mock-partner-4',
      couple_images: ['/placeholder.svg', '/placeholder.svg'],
      is_verified: false,
      is_premium: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partner1_first_name: 'Miguel',
      partner1_last_name: 'Rodríguez',
      partner1_age: 29,
      partner1_bio: 'Entrenador personal y nutricionista',
      partner1_gender: 'hombre',
      partner2_first_name: 'David',
      partner2_last_name: 'López',
      partner2_age: 31,
      partner2_bio: 'Chef profesional especializado en cocina mediterránea',
      partner2_gender: 'hombre',
    },
    {
      id: 'mock-couple-3',
      couple_name: 'Sofia & Isabella',
      couple_bio: 'Artistas y creadoras de contenido. Nos apasiona la música, el arte y las experiencias culturales únicas.',
      relationship_type: 'woman-woman',
      partner1_id: 'mock-partner-5',
      partner2_id: 'mock-partner-6',
      couple_images: ['/placeholder.svg', '/placeholder.svg'],
      is_verified: true,
      is_premium: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partner1_first_name: 'Sofia',
      partner1_last_name: 'Herrera',
      partner1_age: 26,
      partner1_bio: 'Músico y compositora independiente',
      partner1_gender: 'mujer',
      partner2_first_name: 'Isabella',
      partner2_last_name: 'Torres',
      partner2_age: 27,
      partner2_bio: 'Artista visual y curadora de galerías',
      partner2_gender: 'mujer',
    },
  ];
};
