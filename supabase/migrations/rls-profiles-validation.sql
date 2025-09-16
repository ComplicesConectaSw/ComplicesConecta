-- RLS Profiles Validation & Fix
-- Validar y crear columnas faltantes en tabla profiles
-- Fecha: 15 de Septiembre, 2025

-- 1. Validar y crear columna is_verified si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_verified creada en tabla profiles';
    ELSE
        RAISE NOTICE 'Columna is_verified ya existe en tabla profiles';
    END IF;
END $$;

-- 2. Validar y crear columna role si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
        RAISE NOTICE 'Columna role creada en tabla profiles';
    ELSE
        RAISE NOTICE 'Columna role ya existe en tabla profiles';
    END IF;
END $$;

-- 3. Validar y crear columna is_demo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_demo'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_demo creada en tabla profiles';
    ELSE
        RAISE NOTICE 'Columna is_demo ya existe en tabla profiles';
    END IF;
END $$;

-- 4. Validar y crear columna is_premium si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_premium creada en tabla profiles';
    ELSE
        RAISE NOTICE 'Columna is_premium ya existe en tabla profiles';
    END IF;
END $$;

-- 5. Validar y crear columna profile_type si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'profile_type'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT 'single' CHECK (profile_type IN ('single', 'couple'));
        RAISE NOTICE 'Columna profile_type creada en tabla profiles';
    ELSE
        RAISE NOTICE 'Columna profile_type ya existe en tabla profiles';
    END IF;
END $$;

-- 6. Crear índices para optimizar consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);

-- 7. Políticas RLS para tabla profiles
-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Habilitar RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Solo dueño ve su perfil, admin ve todos, perfiles públicos visibles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        -- Dueño puede ver su propio perfil
        auth.uid() = id
        OR
        -- Admin puede ver todos los perfiles
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
        OR
        -- Perfiles públicos: verificados y no demo
        (is_verified = true AND is_demo = false)
    );

-- INSERT: Solo usuarios autenticados pueden crear su perfil
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- UPDATE: Solo dueño puede editar su perfil, admin puede editar todos
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- DELETE: Solo admin puede eliminar perfiles
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Políticas RLS para profiles creadas exitosamente
