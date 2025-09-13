-- Verificar si el perfil existe para el usuario autenticado
-- UUID: 10b2fa75-5a62-4299-921c-9a1cc99c765b

-- 1. Verificar usuario en auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- 2. Verificar perfil en public.profiles
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

-- 3. Contar total de perfiles existentes
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. Ver estructura de la tabla profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
