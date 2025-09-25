-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A TABLAS
-- Resolver errores: column "is_active" y "user_id" does not exist
-- =====================================================

-- Agregar columna is_active a tabla matches
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Verificar estructura de match_interactions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_interactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Si match_interactions no tiene user_id, agregarlo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'match_interactions' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.match_interactions 
        ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar que todas las columnas necesarias existen
SELECT 'Verificando tabla matches...' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Verificando tabla match_interactions...' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_interactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Columnas faltantes agregadas exitosamente' as status;
