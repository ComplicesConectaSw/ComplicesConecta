// ========================================
// INTERESES SEGUROS (Para registro inicial - no explícitos)
// ========================================
export const SAFE_INTERESTS = [
  // Lifestyle y valores
  "Lifestyle Swinger", "Intercambio de Parejas", "Mentalidad Abierta", "Sin Prejuicios",
  "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado",
  "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
  
  // Niveles de experiencia
  "Parejas Experimentadas", "Principiantes Curiosos", "Explorando el Lifestyle",
  
  // Eventos y lugares (no explícitos)
  "Fiestas Temáticas", "Clubs Privados", "Eventos Lifestyle", "Lifestyle México", "Eventos Exclusivos",
  "Clubs Swinger México", "Fiestas Privadas CDMX", "Encuentros Guadalajara", "Eventos Monterrey",
  
  // Socialización y actividades
  "Reuniones Sociales", "Cenas Temáticas", "Cócteles Elegantes", "Viajes en Pareja",
  "Spa de Parejas", "Bienestar en Pareja", "Actividades en Pareja", "Conexión de Parejas",
  
  // Ambiente y experiencias lifestyle
  "Ambiente Elegante", "Música Ambiente", "Iluminación Intima", "Espacios Privados",
  "Ambiente Relajado", "Experiencias Sensuales", "Bienestar Integral", "Entretenimiento Adulto"
];

// ========================================
// INTERESES EXPLÍCITOS (Solo post-registro, en configuración)
// ========================================
export const EXPLICIT_INTERESTS = [
  // Modalidades de intercambio
  "Intercambio Suave", "Intercambio Completo", "Soft Swap", "Full Swap",
  "Terceras Personas", "Encuentros Grupales", "Encuentros Casuales",
  
  // Dinámicas específicas
  "Fotografía Sensual", "Baile Sensual", "Masajes Tántricos", "Experiencias Tántricas",
  "Juegos Sensuales", "Jacuzzi Privado", "Ambiente Sensual",
  
  // Experiencias íntimas
  "Encuentros Íntimos", "Reuniones Íntimas", "Experiencias Sensuales", "Cenas Íntimas",
  "Espacios Privados", "Libertad Sexual", "Intercambio Íntimo", "Conexión Física",
  
  // Arte y expresión adulta
  "Fotografía Erótica", "Arte Erótico", "Literatura Erótica", "Cócteles Afrodisíacos",
  "Bienestar Adulto", "Entretenimiento Adulto", "Ambiente Seductor"
];

// Lista completa (para referencia y búsqueda)
export const ALL_INTERESTS = [...SAFE_INTERESTS, ...EXPLICIT_INTERESTS];

// Mantener compatibilidad con código existente
export const lifestyleInterests = ALL_INTERESTS;

// Categorías para el registro automático con temática mexicana
export const interestCategories = {
  principiante: [
    "Principiantes Curiosos", "Mentalidad Abierta", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Ambiente Relajado"
  ],
  intermedio: [
    "Lifestyle Swinger", "Eventos Lifestyle", "Fiestas Temáticas",
    "Clubs Privados", "Conexiones Auténticas", "Diversión Adulta", "Lifestyle México"
  ],
  experimentado: [
    "Intercambio de Parejas", "Parejas Experimentadas", 
    "Clubs Swinger México", "Eventos Exclusivos", "Sin Prejuicios", "Fiestas Privadas CDMX"
  ],
  terceras_personas: [
    "Aventuras Compartidas", "Reuniones Sociales", "Espacios Privados",
    "Cenas Temáticas", "Viajes en Pareja", "Conexión de Parejas"
  ]
};

// Función para obtener intereses automáticos según el perfil con temática mexicana
export function getAutoInterests(
  userType: 'single' | 'couple', 
  experienceLevel: string = 'intermedio',
  gender?: 'male' | 'female'
): string[] {
  const baseInterests = interestCategories[experienceLevel as keyof typeof interestCategories] || interestCategories.intermedio;
  
  // Agregar intereses seguros según el tipo de usuario y género
  let additionalInterests: string[] = [];
  
  if (userType === 'couple') {
    // Intereses para parejas (ambos géneros)
    additionalInterests = [
      "Spa de Parejas", "Eventos Monterrey", "Viajes en Pareja",
      "Conexión de Parejas", "Bienestar en Pareja", "Cenas Temáticas"
    ];
  } else {
    // Intereses para singles según género
    if (gender === 'female') {
      additionalInterests = [
        "Ambiente Elegante", "Spa de Parejas", "Bienestar Integral",
        "Iluminación Intima", "Cócteles Elegantes", "Experiencias Sensuales"
      ];
    } else {
      additionalInterests = [
        "Eventos Lifestyle", "Clubs Swinger México", "Reuniones Sociales",
        "Música Ambiente", "Entretenimiento Adulto", "Espacios Privados"
      ];
    }
  }
  
  // Combinar y limitar a 8 intereses únicos
  const combined = [...new Set([...baseInterests, ...additionalInterests])];
  return combined.slice(0, 8);
}
