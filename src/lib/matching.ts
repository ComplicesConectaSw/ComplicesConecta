// Sistema de compatibilidad y matching basado en intereses
// Tipo Profile local para matching
interface Profile {
  id: string;
  interests?: string[];
  name?: string;
  age?: number;
  location?: string;
  bio?: string;
  verified?: boolean;
  type?: 'single' | 'couple';
  preferences?: {
    ageRange?: [number, number];
    distance?: number;
    lookingFor?: string[];
  };
}

export interface MatchScore {
  profileId: string;
  compatibilityScore: number;
  sharedInterests: string[];
  matchReasons: string[];
}

// Calcular compatibilidad entre dos perfiles basado en intereses
export function calculateCompatibility(userInterests: string[], profileInterests: string[]): number {
  if (!userInterests.length || !profileInterests.length) return 0;
  
  const sharedInterests = userInterests.filter(interest => 
    profileInterests.includes(interest)
  );
  
  // Fórmula de compatibilidad: (intereses compartidos / total de intereses únicos) * 100
  const totalUniqueInterests = new Set([...userInterests, ...profileInterests]).size;
  const compatibilityScore = (sharedInterests.length / totalUniqueInterests) * 100;
  
  return Math.round(compatibilityScore);
}

// Obtener intereses compartidos entre dos perfiles
export function getSharedInterests(userInterests: string[], profileInterests: string[]): string[] {
  return userInterests.filter(interest => profileInterests.includes(interest));
}

// Generar razones de match basadas en intereses compartidos
export function generateMatchReasons(sharedInterests: string[]): string[] {
  const reasons: string[] = [];
  
  if (sharedInterests.includes("Lifestyle Swinger")) {
    reasons.push("Ambos están en el lifestyle swinger");
  }
  
  if (sharedInterests.includes("Principiantes Curiosos")) {
    reasons.push("Perfectos para explorar juntos como principiantes");
  }
  
  if (sharedInterests.includes("Parejas Experimentadas")) {
    reasons.push("Experiencia compartida en el lifestyle");
  }
  
  if (sharedInterests.includes("Comunicación Abierta")) {
    reasons.push("Valoran la comunicación honesta");
  }
  
  if (sharedInterests.includes("Respeto Mutuo")) {
    reasons.push("Comparten valores de respeto");
  }
  
  if (sharedInterests.includes("Discreción Total")) {
    reasons.push("Priorizan la privacidad y discreción");
  }
  
  if (sharedInterests.some(i => ["Fiestas Privadas", "Clubs Privados", "Eventos Lifestyle"].includes(i))) {
    reasons.push("Les gustan los eventos sociales del lifestyle");
  }
  
  if (sharedInterests.some(i => ["Hoteles Temáticos", "Cruceros Swinger", "Resorts Lifestyle"].includes(i))) {
    reasons.push("Disfrutan de vacaciones lifestyle");
  }
  
  if (sharedInterests.some(i => ["Intercambio Suave", "Intercambio Completo"].includes(i))) {
    reasons.push("Compatibles en preferencias de intercambio");
  }
  
  // Si no hay razones específicas, usar intereses generales
  if (reasons.length === 0 && sharedInterests.length > 0) {
    reasons.push(`Comparten interés en: ${sharedInterests.slice(0, 2).join(", ")}`);
  }
  
  return reasons;
}

// Calcular score completo de match
export function calculateMatchScore(
  userInterests: string[], 
  profile: Profile
): MatchScore {
  const profileInterests = profile.interests || [];
  const compatibilityScore = calculateCompatibility(userInterests, profileInterests);
  const sharedInterests = getSharedInterests(userInterests, profileInterests);
  const matchReasons = generateMatchReasons(sharedInterests);
  
  return {
    profileId: profile.id,
    compatibilityScore,
    sharedInterests,
    matchReasons
  };
}

// Filtrar y ordenar perfiles por compatibilidad
export function filterAndSortByCompatibility(
  userInterests: string[], 
  profiles: Profile[], 
  minCompatibility: number = 20
): Profile[] {
  return profiles
    .map(profile => ({
      ...profile,
      matchScore: calculateMatchScore(userInterests, profile)
    }))
    .filter(profile => profile.matchScore.compatibilityScore >= minCompatibility)
    .sort((a, b) => b.matchScore.compatibilityScore - a.matchScore.compatibilityScore);
}

// Obtener matches recomendados
export function getRecommendedMatches(
  userInterests: string[], 
  profiles: Profile[], 
  limit: number = 10
): Profile[] {
  const sortedProfiles = filterAndSortByCompatibility(userInterests, profiles);
  return sortedProfiles.slice(0, limit);
}
