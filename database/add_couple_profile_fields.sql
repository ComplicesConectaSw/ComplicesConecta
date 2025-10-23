-- Agregar campos faltantes a la tabla couple_profiles
-- Ejecutar en Supabase via Docker

-- Agregar campos para funcionalidades swinger específicas de parejas
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS looking_for VARCHAR(50) DEFAULT 'friendship' CHECK (looking_for IN ('friendship', 'dating', 'casual', 'serious', 'swinger', 'threesome', 'group')),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS swinger_experience VARCHAR(50) DEFAULT 'beginner' CHECK (swinger_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS interested_in VARCHAR(50) DEFAULT 'couples' CHECK (interested_in IN ('singles', 'couples', 'both', 'groups')),
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65;

-- Campos para ubicación de la pareja
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Campos para personalización de la pareja
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(20) DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Campos para seguridad y verificación
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Campos para estadísticas de la pareja
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100);

-- Campos para preferencias específicas de parejas swinger
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS couple_interests TEXT[],
ADD COLUMN IF NOT EXISTS activities_interested TEXT[],
ADD COLUMN IF NOT EXISTS event_types TEXT[],
ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(20) DEFAULT 'both' CHECK (communication_preference IN ('both', 'male_only', 'female_only'));

-- Campos para información adicional de la pareja
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS couple_age_range VARCHAR(20) DEFAULT '25-45',
ADD COLUMN IF NOT EXISTS couple_height_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS couple_body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_lifestyle VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_availability VARCHAR(50);

-- Índices para optimizar consultas de parejas
CREATE INDEX IF NOT EXISTS idx_couple_profiles_looking_for ON couple_profiles(looking_for);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_experience_level ON couple_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_swinger_experience ON couple_profiles(swinger_experience);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_interested_in ON couple_profiles(interested_in);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_location ON couple_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_age_range ON couple_profiles(age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_public ON couple_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_premium ON couple_profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_verified ON couple_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_last_active ON couple_profiles(last_active);

-- Actualizar la función de updated_at para incluir los nuevos campos
CREATE OR REPLACE FUNCTION update_couple_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_couple_profiles_updated_at ON couple_profiles;
CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_couple_profiles_updated_at();

-- Insertar datos de ejemplo para parejas
INSERT INTO couple_profiles (
    id, couple_name, couple_bio, relationship_type, partner1_id, partner2_id,
    couple_images, is_verified, is_premium, preferences, looking_for, 
    experience_level, swinger_experience, interested_in, max_distance,
    age_range_min, age_range_max, latitude, longitude, city, state, country,
    display_name, preferred_theme, is_public, privacy_settings, is_demo,
    verification_level, couple_interests, activities_interested, event_types,
    communication_preference, couple_age_range, couple_lifestyle
) VALUES (
    'demo-couple-1', 'Sofía y Carlos', 
    'Pareja experimentada en el lifestyle swinger. Buscamos conexiones auténticas, respeto mutuo y experiencias sofisticadas. Disfrutamos de viajes, gastronomía y eventos exclusivos.',
    'man-woman', 'demo-single-1', 'demo-single-2',
    ARRAY['/placeholder.svg', '/placeholder.svg'], true, false, '{}',
    'swinger', 'intermediate', 'advanced', 'couples', 50,
    25, 45, 19.4326, -99.1332, 'Ciudad de México', 'CDMX', 'México',
    'Sofía y Carlos Demo', 'dark', true, '{}', true,
    2, 
    ARRAY['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Gastronomía', 'Arte', 'Eventos Sofisticados'],
    ARRAY['Cenas románticas', 'Eventos privados', 'Viajes en pareja', 'Actividades culturales'],
    ARRAY['Eventos exclusivos', 'Cenas privadas', 'Viajes discretos'],
    'both', '25-45', 'sofisticado'
) ON CONFLICT (id) DO UPDATE SET
    couple_name = EXCLUDED.couple_name,
    couple_bio = EXCLUDED.couple_bio,
    looking_for = EXCLUDED.looking_for,
    experience_level = EXCLUDED.experience_level,
    swinger_experience = EXCLUDED.swinger_experience,
    couple_interests = EXCLUDED.couple_interests,
    updated_at = NOW();

-- Crear vista mejorada para perfiles de pareja con información completa
CREATE OR REPLACE VIEW couple_profiles_complete AS
SELECT 
    cp.*,
    p1.first_name as partner1_first_name,
    p1.last_name as partner1_last_name,
    p1.age as partner1_age,
    p1.gender as partner1_gender,
    p1.avatar_url as partner1_avatar_url,
    p2.first_name as partner2_first_name,
    p2.last_name as partner2_last_name,
    p2.age as partner2_age,
    p2.gender as partner2_gender,
    p2.avatar_url as partner2_avatar_url,
    CASE 
        WHEN cp.is_premium THEN 'Premium'
        WHEN cp.is_demo THEN 'Demo'
        ELSE 'Free'
    END as account_status,
    CASE 
        WHEN cp.swinger_experience = 'beginner' THEN 'Principiante'
        WHEN cp.swinger_experience = 'intermediate' THEN 'Intermedio'
        WHEN cp.swinger_experience = 'advanced' THEN 'Avanzado'
        WHEN cp.swinger_experience = 'expert' THEN 'Experto'
        ELSE 'No especificado'
    END as experience_level_text,
    CASE 
        WHEN cp.interested_in = 'singles' THEN 'Solteros'
        WHEN cp.interested_in = 'couples' THEN 'Parejas'
        WHEN cp.interested_in = 'both' THEN 'Ambos'
        WHEN cp.interested_in = 'groups' THEN 'Grupos'
        ELSE 'No especificado'
    END as interested_in_text,
    CASE 
        WHEN cp.looking_for = 'friendship' THEN 'Amistad'
        WHEN cp.looking_for = 'dating' THEN 'Citas'
        WHEN cp.looking_for = 'casual' THEN 'Casual'
        WHEN cp.looking_for = 'serious' THEN 'Serio'
        WHEN cp.looking_for = 'swinger' THEN 'Swinger'
        WHEN cp.looking_for = 'threesome' THEN 'Tríos'
        WHEN cp.looking_for = 'group' THEN 'Grupos'
        ELSE 'No especificado'
    END as looking_for_text,
    CASE 
        WHEN cp.relationship_type = 'man-woman' THEN 'Hombre-Mujer'
        WHEN cp.relationship_type = 'man-man' THEN 'Hombre-Hombre'
        WHEN cp.relationship_type = 'woman-woman' THEN 'Mujer-Mujer'
        ELSE 'Otro'
    END as relationship_type_text
FROM couple_profiles cp
LEFT JOIN profiles p1 ON cp.partner1_id = p1.id
LEFT JOIN profiles p2 ON cp.partner2_id = p2.id;

-- Comentarios para documentar los nuevos campos
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
