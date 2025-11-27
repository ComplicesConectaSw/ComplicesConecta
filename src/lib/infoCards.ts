// Cards que explican cómo funcionan los filtros para usuarios no autenticados
export interface FilterDemoCard {
  id: string;
  title: string;
  description: string;
  filterType: 'age' | 'distance' | 'interests' | 'verified' | 'premium' | 'online';
  demoValue: string;
  explanation: string;
  benefits: string[];
  ctaText: string;
  ctaAction: 'register' | 'login';
}

// Tipo para InfoCard usado en InfoCard.tsx
export interface InfoCard {
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaAction: 'register' | 'login' | 'premium';
}

export const generateFilterDemoCards = (): FilterDemoCard[] => {
  return [
    {
      id: 'filter-age',
      title: 'Filtro por Edad',
      description: 'Encuentra personas en tu rango de edad preferido para conexiones más compatibles.',
      filterType: 'age',
      demoValue: '25-35 años',
      explanation: 'Ajusta el rango de edad para ver solo perfiles que coincidan con tus preferencias.',
      benefits: [
        'Conexiones más compatibles',
        'Ahorra tiempo en búsquedas',
        'Mayor probabilidad de match'
      ],
      ctaText: 'Probar Filtros',
      ctaAction: 'register'
    },
    {
      id: 'filter-distance',
      title: 'Filtro por Distancia',
      description: 'Conecta con personas cerca de ti o amplía tu búsqueda según prefieras.',
      filterType: 'distance',
      demoValue: 'Hasta 25 km',
      explanation: 'Define qué tan lejos estás dispuesto a buscar para encuentros más convenientes.',
      benefits: [
        'Encuentros más fáciles',
        'Conexiones locales',
        'Flexibilidad geográfica'
      ],
      ctaText: 'Ver Cercanos',
      ctaAction: 'register'
    },
    {
      id: 'filter-interests',
      title: 'Filtro por Intereses',
      description: 'Encuentra personas que comparten tus gustos y estilo de vida.',
      filterType: 'interests',
      demoValue: 'Lifestyle, Liberal, Aventura',
      explanation: 'Selecciona intereses específicos para encontrar personas afines a ti.',
      benefits: [
        'Conexiones más profundas',
        'Intereses compartidos',
        'Conversaciones naturales'
      ],
      ctaText: 'Explorar Intereses',
      ctaAction: 'register'
    },
    {
      id: 'filter-verified',
      title: 'Perfiles Verificados',
      description: 'Conecta solo con usuarios que han verificado su identidad para mayor seguridad.',
      filterType: 'verified',
      demoValue: 'Solo verificados',
      explanation: 'Filtra para ver únicamente perfiles que han pasado nuestro proceso de verificación.',
      benefits: [
        'Mayor seguridad',
        'Perfiles auténticos',
        'Confianza garantizada'
      ],
      ctaText: 'Ver Verificados',
      ctaAction: 'register'
    },
    {
      id: 'filter-premium',
      title: 'Usuarios Premium',
      description: 'Conecta con usuarios premium que tienen acceso a funciones exclusivas.',
      filterType: 'premium',
      demoValue: 'Solo Premium',
      explanation: 'Los usuarios premium suelen estar más comprometidos con encontrar conexiones reales.',
      benefits: [
        'Usuarios más activos',
        'Funciones exclusivas',
        'Experiencia mejorada'
      ],
      ctaText: 'Conocer Premium',
      ctaAction: 'login'
    },
    {
      id: 'filter-online',
      title: 'Estado en Línea',
      description: 'Ve quién está activo ahora para conversaciones inmediatas.',
      filterType: 'online',
      demoValue: 'Activos ahora',
      explanation: 'Filtra por usuarios que están conectados para respuestas más rápidas.',
      benefits: [
        'Respuestas inmediatas',
        'Conversaciones en vivo',
        'Mayor engagement'
      ],
      ctaText: 'Chat en Vivo',
      ctaAction: 'register'
    }
  ];
};
