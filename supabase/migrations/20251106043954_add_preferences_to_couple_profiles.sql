-- =====================================================
-- MIGRACIÓN: Agregar preferences a couple_profiles
-- Fecha: 2025-11-06
-- Descripción: Agregar campo preferences (JSONB) para almacenar preferencias de género,
--              orientación sexual, etc. necesarias para el registro de parejas
-- =====================================================

-- Agregar columna preferences si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'couple_profiles' 
        AND column_name = 'preferences'
    ) THEN
        ALTER TABLE couple_profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Crear índice GIN para búsquedas eficientes en JSONB
CREATE INDEX IF NOT EXISTS idx_couple_profiles_preferences ON couple_profiles USING GIN (preferences);

-- Comentario de la columna
COMMENT ON COLUMN couple_profiles.preferences IS 'Preferencias de la pareja (género, orientación sexual, etc.) almacenadas como JSON';

-- Estructura esperada del JSON preferences:
-- {
--   "partner1": {
--     "gender": "male" | "female",
--     "sexual_orientation": "heterosexual" | "gay" | "bisexual" | "lesbian" | "trans" | "other",
--     "interested_in": ["men", "women", "couples", "trans"]
--   },
--   "partner2": {
--     "gender": "male" | "female",
--     "sexual_orientation": "heterosexual" | "gay" | "bisexual" | "lesbian" | "trans" | "other",
--     "interested_in": ["men", "women", "couples", "trans"]
--   },
--   "couple_preferences": {
--     "interested_in": ["men", "women", "couples", "trans"],
--     "age_range": { "min": 18, "max": 65 },
--     "location_preferences": { "max_distance": 50 }
--   }
-- }

DO $$
BEGIN
    RAISE NOTICE '✅ Campo preferences agregado exitosamente a couple_profiles';
    RAISE NOTICE '📊 Índice GIN creado para búsquedas eficientes en preferences';
END $$;

