-- Script para agregar columnas faltantes y corregir perfil admin

-- PASO 1: Agregar columnas faltantes a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- PASO 2: Actualizar perfil completo con todos los campos necesarios
UPDATE profiles 
SET 
    role = 'admin',
    email = 'complicesconectasw@outlook.es',
    first_name = 'Administrador',
    last_name = 'ComplicesConecta',
    display_name = 'Admin ComplicesConecta',
    bio = 'Administrador principal del sistema'
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- PASO 3: Verificar el perfil actualizado
SELECT 
    id,
    email,
    first_name,
    last_name,
    display_name,
    role,
    bio
FROM profiles 
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- PASO 4: Verificar que el usuario existe en user_roles
SELECT * FROM user_roles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
