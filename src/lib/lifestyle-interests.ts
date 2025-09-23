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
  "Clubs Swinger México", "Fiestas Privadas CDMX", "Encuentros Guadalajara", "Eventos Monterrey",
  "Reuniones Íntimas", "Jacuzzi Privado", "Masajes Tántricos", "Juegos Sensuales",
  "Lifestyle México", "Eventos Exclusivos",
  
  // Cultura mexicana lifestyle
  "Encuentros Íntimos", "Experiencias Sensuales", "Espacios Privados", "Libertad Sexual",
  "Ambiente Sensual", "Intercambio Íntimo", "Conexión Física",
  
  // Actividades sensuales
  "Fotografía Erótica", "Baile Sensual", "Cenas Íntimas", "Cócteles Afrodisíacos",
  "Spa de Parejas", "Bienestar Adulto", "Experiencias Tántricas", "Actividades en Pareja",
  
  // Arte y entretenimiento adulto
  "Arte Erótico", "Literatura Erótica", "Entretenimiento Adulto", "Ambiente Seductor"
];

// Categorías para el registro automático con temática mexicana
export const interestCategories = {
  principiante: [
    "Principiantes Curiosos", "Mentalidad Abierta", "Comunicación Abierta", 
    "Respeto Mutuo", "Experiencias Nuevas", "Ambiente Relajado"
  ],
  intermedio: [
    "Lifestyle Swinger", "Eventos Lifestyle", "Intercambio Suave", "Fiestas Temáticas",
    "Clubs Privados", "Conexiones Auténticas", "Diversión Adulta", "Lifestyle México"
  ],
  experimentado: [
    "Intercambio de Parejas", "Intercambio Completo", "Parejas Experimentadas", 
    "Clubs Swinger México", "Eventos Exclusivos", "Sin Prejuicios", "Fiestas Privadas CDMX"
  ],
  terceras_personas: [
    "Terceras Personas", "Encuentros Casuales", "Aventuras Compartidas",
    "Reuniones Íntimas", "Jacuzzi Privado", "Juegos Sensuales", "Espacios Privados"
  ]
};

// Función para obtener intereses automáticos según el perfil con temática mexicana
export function getAutoInterests(userType: 'single' | 'couple', experienceLevel: string = 'intermedio') {
  const baseInterests = interestCategories[experienceLevel as keyof typeof interestCategories] || interestCategories.intermedio;
  
  // Agregar intereses específicos mexicanos según el tipo de usuario
  const additionalInterests = userType === 'couple' 
    ? ["Masajes Tántricos", "Spa de Parejas", "Experiencias Tántricas", "Eventos Monterrey", "Encuentros Íntimos"]
    : ["Fotografía Erótica", "Intercambio Íntimo", "Cenas Íntimas", "Arte Erótico", "Conexión Física"];
  
  return [...baseInterests, ...additionalInterests].slice(0, 8);
}
