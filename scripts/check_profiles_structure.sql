-- Script para verificar la estructura real de la tabla profiles
-- y crear perfil para apoyofinancieromexicano@gmail.com

-- 1. Verificar estructura de la tabla profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver usuarios existentes en auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'apoyofinancieromexicano@gmail.com';

-- 3. Ver si ya existe perfil para este usuario
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    created_at
FROM profiles 
WHERE first_name ILIKE '%apoyo%' 
   OR first_name ILIKE '%financiero%';
