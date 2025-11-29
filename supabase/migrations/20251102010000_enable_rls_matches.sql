-- =====================================================
-- HABILITAR RLS EN TABLA matches
-- =====================================================
-- Fecha: 02 de Noviembre, 2025
-- Versión: 3.5.0
-- Descripción: Habilita Row Level Security (RLS) en la tabla matches
--              y crea las políticas necesarias para seguridad
-- =====================================================

-- Asegurar que la tabla base exista en entornos locales mínimos
CREATE TABLE IF NOT EXISTS public.matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en tabla matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "System can create matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON matches;

-- Política para SELECT: Usuarios pueden ver sus propios matches
-- Nota: user1_id y user2_id son UUID, no TEXT
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT 
    USING (
        auth.uid() = user1_id::uuid OR 
        auth.uid() = user2_id::uuid
    );

-- Política para INSERT: Sistema puede crear matches automáticamente
-- Usuarios también pueden crear matches si son user1_id
CREATE POLICY "Users can create matches" ON matches
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user1_id::uuid OR
        -- Permitir que el sistema cree matches automáticamente
        -- (por ejemplo, desde triggers o funciones)
        EXISTS (
            SELECT 1 FROM pg_roles 
            WHERE rolname = current_user 
            AND rolname IN ('postgres', 'service_role')
        )
    );

-- Política para UPDATE: Usuarios pueden actualizar sus propios matches
CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE 
    USING (
        auth.uid() = user1_id::uuid OR 
        auth.uid() = user2_id::uuid
    )
    WITH CHECK (
        auth.uid() = user1_id::uuid OR 
        auth.uid() = user2_id::uuid
    );

-- Política para DELETE: Usuarios pueden eliminar sus propios matches
CREATE POLICY "Users can delete their own matches" ON matches
    FOR DELETE 
    USING (
        auth.uid() = user1_id::uuid OR 
        auth.uid() = user2_id::uuid
    );

-- Verificar que RLS está habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'matches' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS no se pudo habilitar en tabla matches';
    END IF;
    RAISE NOTICE 'RLS habilitado exitosamente en tabla matches';
END $$;

