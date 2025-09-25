-- Crear usuario administrador completo en Supabase
-- Email: complicesconectasw@outlook.es
-- Password: Magy_Wacko_nala28

-- 1. Verificar usuarios existentes
SELECT 'Usuarios existentes en auth.users:' as paso;
SELECT id, email, created_at FROM auth.users;

-- 2. Crear usuario en auth.users (esto normalmente se hace via signup)
-- NOTA: Este INSERT directo puede no funcionar debido a triggers de Supabase
-- Es mejor usar la función de signup de Supabase

-- 3. Verificar si el usuario fue creado
SELECT 'Usuario después de creación:' as paso;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'complicesconectasw@outlook.es';

-- 4. Si el usuario existe, obtener su UUID para crear el perfil
-- Reemplazar 'USER_UUID_AQUI' con el UUID real del usuario creado
/*
INSERT INTO profiles (
    id,
    user_id,
    first_name,
    last_name,
    display_name,
    role,
    email,
    is_active,
    is_public,
    is_demo
) VALUES (
    gen_random_uuid(),
    'USER_UUID_AQUI',  -- Reemplazar con UUID real
    'Administrador',
    'ComplicesConecta',
    'Administrador ComplicesConecta',
    'admin',
    'complicesconectasw@outlook.es',
    true,
    false,
    false
);
*/
