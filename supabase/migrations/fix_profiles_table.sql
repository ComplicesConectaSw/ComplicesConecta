-- Script para corregir la estructura de la tabla profiles
-- Fecha: 13 de septiembre 2025

-- 1. Verificar estructura actual de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes si no existen
-- Agregar user_id (clave foránea a auth.users)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_id agregada a profiles';
    ELSE
        RAISE NOTICE 'Columna user_id ya existe en profiles';
    END IF;
END $$;

-- Agregar role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Columna role agregada a profiles';
    ELSE
        RAISE NOTICE 'Columna role ya existe en profiles';
    END IF;
END $$;

-- Agregar email
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Columna email agregada a profiles';
    ELSE
        RAISE NOTICE 'Columna email ya existe en profiles';
    END IF;
END $$;

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Verificar estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar si existen perfiles sin user_id y corregirlos
SELECT 
    id,
    email,
    first_name,
    last_name,
    user_id,
    role
FROM profiles
WHERE user_id IS NULL
LIMIT 10;
