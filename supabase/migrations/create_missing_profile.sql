-- Crear perfil faltante para usuario complicesconectasw@outlook.es
-- UUID: 10b2fa75-5a62-4299-921c-9a1cc99c765b

-- Insertar perfil en public.profiles
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  display_name,
  role,
  email,
  created_at,
  updated_at
) VALUES (
  '10b2fa75-5a62-4299-921c-9a1cc99c765b',
  'Administrador',
  'ComplicesConecta',
  'Administrador ComplicesConecta',
  'admin',
  'complicesconectasw@outlook.es',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verificar que se creó correctamente
SELECT 
  id,
  first_name,
  last_name,
  display_name,
  role,
  email,
  created_at
FROM public.profiles 
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
