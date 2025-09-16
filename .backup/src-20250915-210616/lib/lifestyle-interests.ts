// Intereses específicos para la temática swinger/lifestyle
export const lifestyleInterests = [
  // Categorías principales del lifestyle
  "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Fiestas Temáticas", 
  "Clubs Privados", "Eventos Lifestyle", "Soft Swap", "Full Swap", "Unicornios", 
  
  // Niveles de experiencia
  "Parejas Experimentadas", "Principiantes Curiosos", "Mentalidad Abierta", "Sin Tabúes", 
  
  // Valores importantes
  "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado", 
  "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
  
  // Lugares y eventos
  "Hoteles Temáticos", "Resorts Lifestyle", "Cruceros Swinger", "Viajes en Grupo",
  "Pool Parties", "Jacuzzi Sessions", "Masajes en Pareja", "Juegos de Rol",
  
  // Actividades sensuales
  "Fotografía Sensual", "Baile Sensual", "Cenas Íntimas", "Cócteles Exclusivos",
  "Spa Couples", "Wellness Adulto", "Yoga en Pareja", "Fitness Compartido",
  
  // Arte y entretenimiento adulto
  "Arte Erótico", "Literatura Adulta", "Cine para Adultos", "Música Sensual"
];

// Categorías para el registro automático
export const interestCategories = {
  principiante: [
    "Principiantes Curiosos", "Mentalidad Abierta", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Ambiente Relajado"
  ],
  intermedio: [
    "Lifestyle Swinger", "Eventos Lifestyle", "Soft Swap", "Fiestas Temáticas",
    "Clubs Privados", "Conexiones Auténticas", "Diversión Adulta"
  ],
  experimentado: [
    "Intercambio de Parejas", "Full Swap", "Parejas Experimentadas", 
    "Hoteles Temáticos", "Cruceros Swinger", "Sin Tabúes"
  ],
  unicornio: [
    "Unicornios", "Encuentros Casuales", "Aventuras Compartidas",
    "Pool Parties", "Jacuzzi Sessions", "Juegos de Rol"
  ]
};

// Función para obtener intereses automáticos según el perfil
export function getAutoInterests(userType: 'single' | 'couple', experienceLevel: string = 'intermedio') {
  const baseInterests = interestCategories[experienceLevel as keyof typeof interestCategories] || interestCategories.intermedio;
  
  // Agregar intereses específicos según el tipo de usuario
  const additionalInterests = userType === 'couple' 
    ? ["Masajes en Pareja", "Spa Couples", "Yoga en Pareja", "Viajes en Grupo"]
    : ["Fotografía Sensual", "Baile Sensual", "Cenas Íntimas", "Arte Erótico"];
  
  return [...baseInterests, ...additionalInterests].slice(0, 6);
}
