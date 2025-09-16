// Intereses específicos para la temática swinger/lifestyle mexicana
export const lifestyleInterests = [
  // Categorías principales del lifestyle
  "Lifestyle Swinger", "Intercambio de Parejas", "Encuentros Casuales", "Fiestas Temáticas", 
  "Clubs Privados", "Eventos Lifestyle", "Intercambio Suave", "Intercambio Completo", "Terceras Personas", 
  
  // Niveles de experiencia
  "Parejas Experimentadas", "Principiantes Curiosos", "Mentalidad Abierta", "Sin Prejuicios", 
  
  // Valores importantes
  "Comunicación Abierta", "Respeto Mutuo", "Discreción Total", "Ambiente Relajado", 
  "Experiencias Nuevas", "Conexiones Auténticas", "Diversión Adulta", "Aventuras Compartidas",
  
  // Lugares y eventos mexicanos
  "Hoteles Boutique", "Resorts Playa del Carmen", "Cruceros Riviera Maya", "Viajes Cancún",
  "Fiestas Alberca", "Jacuzzi Privado", "Masajes Tántricos", "Juegos Sensuales",
  "Tulum Lifestyle", "Puerto Vallarta", "Acapulco Nights", "Cabo San Lucas",
  
  // Cultura mexicana lifestyle
  "Mezcal y Conexión", "Tequila Experiences", "Cenotes Privados", "Playas Nudistas",
  "Noches Mexicanas", "Música Latina", "Baile Latino", "Salsa Sensual",
  
  // Actividades sensuales
  "Fotografía Sensual", "Baile Sensual", "Cenas Íntimas", "Cócteles Exclusivos",
  "Spa de Parejas", "Wellness Adulto", "Yoga Tántrico", "Fitness en Pareja",
  
  // Arte y entretenimiento adulto
  "Arte Sensual", "Literatura Romántica", "Cine de Arte", "Música Ambiente"
];

// Categorías para el registro automático con temática mexicana
export const interestCategories = {
  principiante: [
    "Principiantes Curiosos", "Mentalidad Abierta", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Ambiente Relajado"
  ],
  intermedio: [
    "Lifestyle Swinger", "Eventos Lifestyle", "Intercambio Suave", "Fiestas Temáticas",
    "Clubs Privados", "Conexiones Auténticas", "Diversión Adulta", "Tulum Lifestyle"
  ],
  experimentado: [
    "Intercambio de Parejas", "Intercambio Completo", "Parejas Experimentadas", 
    "Hoteles Boutique", "Cruceros Riviera Maya", "Sin Prejuicios", "Puerto Vallarta"
  ],
  terceras_personas: [
    "Terceras Personas", "Encuentros Casuales", "Aventuras Compartidas",
    "Fiestas Alberca", "Jacuzzi Privado", "Juegos Sensuales", "Cenotes Privados"
  ]
};

// Función para obtener intereses automáticos según el perfil con temática mexicana
export function getAutoInterests(userType: 'single' | 'couple', experienceLevel: string = 'intermedio') {
  const baseInterests = interestCategories[experienceLevel as keyof typeof interestCategories] || interestCategories.intermedio;
  
  // Agregar intereses específicos mexicanos según el tipo de usuario
  const additionalInterests = userType === 'couple' 
    ? ["Masajes Tántricos", "Spa de Parejas", "Yoga Tántrico", "Viajes Cancún", "Mezcal y Conexión"]
    : ["Fotografía Sensual", "Baile Latino", "Cenas Íntimas", "Arte Sensual", "Salsa Sensual"];
  
  return [...baseInterests, ...additionalInterests].slice(0, 8);
}
