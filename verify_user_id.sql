-- Verificar el UUID real del usuario autenticado
SELECT 'Usuarios en auth.users:' as paso;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'complicesconectasw@outlook.es';

-- Verificar si ya existe perfil para este usuario
SELECT 'Perfiles existentes:' as paso;
SELECT user_id, first_name, last_name, email 
FROM profiles 
WHERE email = 'complicesconectasw@outlook.es';

-- Mostrar estructura de foreign key
SELECT 'Constraints de profiles:' as paso;
SELECT conname, confrelid::regclass, conkey, confkey
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';
