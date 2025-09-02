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

export function pickProfileImage(p: { id: string; name: string; type?: ProfileType; gender?: Gender }, used: Set<string>): string {
  const info = inferProfileKind(p);
  const seed = `${p.id}-${p.name.replace(/\s/g, '')}`.toLowerCase();

  let category = 'person';
  if (info.kind === 'couple') category = 'people';
  else if (info.gender === 'male') category = 'men';
  else if (info.gender === 'female') category = 'women';

  // Using a placeholder service that allows category-based images
  // The seed ensures we get a consistent image for the same profile ID, but different across profiles
  const imageUrl = `https://source.unsplash.com/400x400/?${category},portrait&sig=${seed}`;

  // The 'used' set is less critical with unique URLs, but good for preventing accidental collisions
  if (used.has(imageUrl)) {
    // If a collision happens, add a random element to the seed
    const newSeed = `${seed}-${Math.random()}`;
    const fallbackUrl = `https://source.unsplash.com/400x400/?${category},portrait&sig=${newSeed}`;
    used.add(fallbackUrl);
    return fallbackUrl;
  }

  used.add(imageUrl);
  return imageUrl;
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
