-- Agregar campos extendidos a la tabla couple_profiles
-- Migración para habilitar todas las funcionalidades swinger
-- Ejecutar: supabase migration up

-- =====================================================
-- CAMPOS PARA FUNCIONALIDADES SWINGER ESPECÍFICAS
-- =====================================================
-- Asegurar que la tabla base exista antes de aplicar campos extendidos
CREATE TABLE IF NOT EXISTS public.couple_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text,
  bio text,
  location text
);

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS looking_for VARCHAR(50) DEFAULT 'friendship' CHECK (looking_for IN ('friendship', 'dating', 'casual', 'serious', 'swinger', 'threesome', 'group')),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS swinger_experience VARCHAR(50) DEFAULT 'beginner' CHECK (swinger_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS interested_in VARCHAR(50) DEFAULT 'couples' CHECK (interested_in IN ('singles', 'couples', 'both', 'groups')),
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65;

-- =====================================================
-- CAMPOS PARA UBICACIÓN DE LA PAREJA
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- =====================================================
-- CAMPOS PARA PERSONALIZACIÓN DE LA PAREJA
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(20) DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- =====================================================
-- CAMPOS PARA SEGURIDAD Y VERIFICACIÓN
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- CAMPOS PARA ESTADÍSTICAS DE LA PAREJA
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100);

-- =====================================================
-- CAMPOS PARA PREFERENCIAS ESPECÍFICAS DE PAREJAS SWINGER
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS couple_interests TEXT[],
ADD COLUMN IF NOT EXISTS activities_interested TEXT[],
ADD COLUMN IF NOT EXISTS event_types TEXT[],
ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(20) DEFAULT 'both' CHECK (communication_preference IN ('both', 'male_only', 'female_only'));

-- =====================================================
-- CAMPOS PARA INFORMACIÓN ADICIONAL DE LA PAREJA
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS couple_age_range VARCHAR(20) DEFAULT '25-45',
ADD COLUMN IF NOT EXISTS couple_height_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS couple_body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_lifestyle VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_availability VARCHAR(50);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS DE PAREJAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_couple_profiles_looking_for ON couple_profiles(looking_for);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_experience_level ON couple_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_swinger_experience ON couple_profiles(swinger_experience);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_interested_in ON couple_profiles(interested_in);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_location ON couple_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_age_range ON couple_profiles(age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_public ON couple_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_last_active ON couple_profiles(last_active);

-- =====================================================
-- TRIGGER PARA ACTUALIZAR UPDATED_AT Y LAST_ACTIVE
-- =====================================================

CREATE OR REPLACE FUNCTION update_couple_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_couple_profiles_updated_at ON couple_profiles;
CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_couple_profiles_updated_at();

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN couple_profiles.looking_for IS 'Qué está buscando la pareja (friendship, dating, casual, serious, swinger, threesome, group)';
COMMENT ON COLUMN couple_profiles.experience_level IS 'Nivel de experiencia general de la pareja en la plataforma';
COMMENT ON COLUMN couple_profiles.swinger_experience IS 'Nivel de experiencia específico en el lifestyle swinger';
COMMENT ON COLUMN couple_profiles.interested_in IS 'Tipo de personas que les interesan (singles, couples, both, groups)';
COMMENT ON COLUMN couple_profiles.max_distance IS 'Distancia máxima en kilómetros para matches';
COMMENT ON COLUMN couple_profiles.age_range_min IS 'Edad mínima para matches';
COMMENT ON COLUMN couple_profiles.age_range_max IS 'Edad máxima para matches';
COMMENT ON COLUMN couple_profiles.latitude IS 'Latitud de ubicación de la pareja';
COMMENT ON COLUMN couple_profiles.longitude IS 'Longitud de ubicación de la pareja';
COMMENT ON COLUMN couple_profiles.display_name IS 'Nombre para mostrar de la pareja';
COMMENT ON COLUMN couple_profiles.is_public IS 'Si el perfil de pareja es público o privado';
COMMENT ON COLUMN couple_profiles.privacy_settings IS 'Configuraciones de privacidad en formato JSON';
COMMENT ON COLUMN couple_profiles.is_demo IS 'Indica si es un perfil de pareja de demostración';
COMMENT ON COLUMN couple_profiles.verification_level IS 'Nivel de verificación de la pareja (0-3)';
COMMENT ON COLUMN couple_profiles.couple_interests IS 'Intereses específicos de la pareja';
COMMENT ON COLUMN couple_profiles.activities_interested IS 'Actividades que les interesan';
COMMENT ON COLUMN couple_profiles.event_types IS 'Tipos de eventos que prefieren';
COMMENT ON COLUMN couple_profiles.communication_preference IS 'Preferencia de comunicación (both, male_only, female_only)';
COMMENT ON COLUMN couple_profiles.couple_age_range IS 'Rango de edad de la pareja';
COMMENT ON COLUMN couple_profiles.couple_lifestyle IS 'Estilo de vida de la pareja';

-- =====================================================
-- LOG DE MIGRACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada: Campos extendidos agregados a couple_profiles';
    RAISE NOTICE '📊 Total de campos nuevos: 29';
    RAISE NOTICE '🔍 Índices creados: 8';
END $$;

