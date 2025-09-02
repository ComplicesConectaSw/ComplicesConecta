export type ProfileType = 'single' | 'couple';
export type Gender = 'male' | 'female' | 'unknown';

export function inferProfileKind(p: { name: string; type?: ProfileType; gender?: Gender }): { kind: 'couple' | 'single', gender: Gender } {
  const normalized = (p.name || '').toLowerCase();
  if (p.type === 'couple' || normalized.includes('&')) return { kind: 'couple', gender: 'unknown' };
  if (p.gender && p.gender !== 'unknown') return { kind: 'single', gender: p.gender };
  
  // Heurística básica por nombre (lista extendida)
  const male = ['raul','alejandro','eduardo','carlos','luis','miguel','jose','juan','pedro','antonio','francisco','manuel','david','daniel','rafael','fernando','javier','sergio','alberto','ricardo','mario','oscar','victor','pablo','jorge','roberto','angel','adrian','ivan','diego','gabriel','andres','ruben','marco','cesar','guillermo','enrique','gerardo','arturo','armando','mauricio','rodrigo','emilio','jaime','hector','leonardo','salvador','ignacio','lorenzo','benjamin','samuel','abraham','isaac','moises','jesus','cristian','sebastian','mateo','lucas','santiago','nicolas','alejandro','maximiliano','emmanuel','leonardo','valentino','gael','ian','iker','thiago','matias','dylan','bruno','alan','erick','axel','adrian','angel','diego','carlos','daniel','david','fernando','francisco','gabriel','ivan','javier','jorge','jose','juan','leonardo','luis','manuel','mario','miguel','oscar','pablo','pedro','rafael','ricardo','roberto','sergio','victor'];
  
  const female = ['laura','valentina','sofia','maría','maria','ana','paola','carmen','rosa','elena','patricia','lucia','isabel','cristina','alejandra','monica','andrea','claudia','leticia','gabriela','veronica','silvia','adriana','beatriz','teresa','martha','gloria','esperanza','dolores','pilar','amparo','concepcion','mercedes','josefa','antonia','francisca','dolores','rosario','encarnacion','manuela','juana','trinidad','remedios','milagros','soledad','angeles','asuncion','inmaculada','montserrat','nieves','rocio','marisol','consuelo','aurora','blanca','estrella','paloma','azucena','margarita','violeta','jazmín','camila','isabella','natalia','mariana','fernanda','regina','daniela','paulina','carolina','alejandra','michelle','stephanie','kimberly','ashley','jennifer','jessica','amanda','melissa','nicole','samantha','vanessa','brittany','christina','elizabeth','rebecca','rachel','sarah','emily','hannah','madison','taylor','megan','lauren','kayla','amber','danielle','jasmine','alexis','destiny','sydney','victoria','morgan','katherine','chelsea','miranda','courtney','crystal','angela','maria','lisa','nancy','karen','betty','helen','sandra','donna','carol','ruth','sharon','michelle','laura','sarah','kimberly','deborah','dorothy','lisa','nancy','karen','betty','helen','sandra','donna','carol','ruth','sharon'];
  
  const first = normalized.split(/[ &,-]+/)[0] || '';
  if (male.includes(first)) return { kind: 'single', gender: 'male' };
  if (female.includes(first)) return { kind: 'single', gender: 'female' };
  return { kind: 'single', gender: 'unknown' };
}

// Pools de imágenes separados por categoría
const IMAGE_POOLS = {
  male: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face'
  ],
  female: [
    'https://images.unsplash.com/photo-1494790108755-2616c96d2e9c?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face'
  ],
  couple: [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop'
  ]
};

// Contadores globales para cada pool
let poolCounters = {
  male: 0,
  female: 0,
  couple: 0
};

export function pickProfileImage(p: { id: string; name: string; type?: ProfileType; gender?: Gender }, used: Set<string>): string {
  const info = inferProfileKind(p);
  
  let poolKey: keyof typeof IMAGE_POOLS;
  if (info.kind === 'couple') {
    poolKey = 'couple';
  } else if (info.gender === 'male') {
    poolKey = 'male';
  } else if (info.gender === 'female') {
    poolKey = 'female';
  } else {
    // Fallback para género desconocido
    poolKey = Math.random() > 0.5 ? 'male' : 'female';
  }
  
  const pool = IMAGE_POOLS[poolKey];
  let selectedImage: string;
  let attempts = 0;
  const maxAttempts = pool.length * 2; // Evitar bucles infinitos
  
  do {
    // Usar contador circular para garantizar distribución equitativa
    const index = poolCounters[poolKey] % pool.length;
    selectedImage = pool[index];
    poolCounters[poolKey]++;
    attempts++;
    
    // Si hemos intentado todas las imágenes del pool y aún hay duplicados,
    // permitir la repetición (significa que hay más perfiles que imágenes disponibles)
    if (attempts >= maxAttempts) {
      break;
    }
  } while (used.has(selectedImage));
  
  used.add(selectedImage);
  return selectedImage;
}

// Función para resetear contadores (útil para testing o regeneración)
export function resetImageCounters() {
  poolCounters = {
    male: 0,
    female: 0,
    couple: 0
  };
}

// Función para obtener imagen con fallback
export function getProfileImageWithFallback(imagePath: string): string {
  // En producción, aquí podrías verificar si la imagen existe
  // Por ahora, usar fallbacks conocidos
  const fallbacks = [
    '/public/placeholder.svg',
    '/public/compliceslogo.png'
  ];
  
  try {
    return imagePath;
  } catch {
    return fallbacks[0];
  }
}

// Función para obtener estadísticas de uso de imágenes
export function getImageUsageStats() {
  return {
    counters: { ...poolCounters },
    poolSizes: {
      male: IMAGE_POOLS.male.length,
      female: IMAGE_POOLS.female.length,
      couple: IMAGE_POOLS.couple.length
    }
  };
}
