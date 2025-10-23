-- Agregar campos faltantes para perfiles de pareja - Demo y Producción
-- Ejecutar en Supabase via Docker

-- =====================================================
-- CAMPOS DE UBICACIÓN
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- =====================================================
-- CAMPOS DE PERSONALIZACIÓN
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(20) DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- =====================================================
-- CAMPOS DE SEGURIDAD Y VERIFICACIÓN
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- CAMPOS DE ESTADÍSTICAS
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100);

-- =====================================================
-- CAMPOS DE PREFERENCIAS ESPECÍFICAS
-- =====================================================

ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS activities_interested TEXT[],
ADD COLUMN IF NOT EXISTS event_types TEXT[],
ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(20) DEFAULT 'both' CHECK (communication_preference IN ('both', 'male_only', 'female_only')),
ADD COLUMN IF NOT EXISTS couple_age_range VARCHAR(20) DEFAULT '25-45',
ADD COLUMN IF NOT EXISTS couple_height_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS couple_body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_lifestyle VARCHAR(50),
ADD COLUMN IF NOT EXISTS couple_availability VARCHAR(50);

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para campos de ubicación
CREATE INDEX IF NOT EXISTS idx_couple_profiles_latitude ON couple_profiles(latitude);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_longitude ON couple_profiles(longitude);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_city ON couple_profiles(city);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_state ON couple_profiles(state);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_country ON couple_profiles(country);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_location ON couple_profiles(location);

-- Índices para campos de personalización
CREATE INDEX IF NOT EXISTS idx_couple_profiles_display_name ON couple_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_preferred_theme ON couple_profiles(preferred_theme);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_public ON couple_profiles(is_public);

-- Índices para campos de seguridad
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_demo ON couple_profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_verification_level ON couple_profiles(verification_level);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_last_active ON couple_profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_profile_completed_at ON couple_profiles(profile_completed_at);

-- Índices para campos de estadísticas
CREATE INDEX IF NOT EXISTS idx_couple_profiles_total_views ON couple_profiles(total_views);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_total_likes ON couple_profiles(total_likes);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_total_matches ON couple_profiles(total_matches);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_profile_completeness ON couple_profiles(profile_completeness);

-- Índices para campos de preferencias
CREATE INDEX IF NOT EXISTS idx_couple_profiles_activities_interested ON couple_profiles USING GIN(activities_interested);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_event_types ON couple_profiles USING GIN(event_types);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_communication_preference ON couple_profiles(communication_preference);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_couple_age_range ON couple_profiles(couple_age_range);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_couple_lifestyle ON couple_profiles(couple_lifestyle);

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_couple_profiles_location_public ON couple_profiles(latitude, longitude, is_public);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_demo_verified ON couple_profiles(is_demo, is_verified);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_active_public ON couple_profiles(is_public, last_active);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_completeness_verified ON couple_profiles(profile_completeness, is_verified);

-- =====================================================
-- VISTA OPTIMIZADA PARA PERFILES DE PAREJA
-- =====================================================

CREATE OR REPLACE VIEW couple_profiles_complete AS
SELECT 
    cp.*,
    p1.first_name as partner1_first_name,
    p1.last_name as partner1_last_name,
    p1.age as partner1_age,
    p1.gender as partner1_gender,
    p1.avatar_url as partner1_avatar_url,
    p1.is_online as partner1_is_online,
    p2.first_name as partner2_first_name,
    p2.last_name as partner2_last_name,
    p2.age as partner2_age,
    p2.gender as partner2_gender,
    p2.avatar_url as partner2_avatar_url,
    p2.is_online as partner2_is_online,
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
    END as relationship_type_text,
    CASE 
        WHEN cp.communication_preference = 'both' THEN 'Ambos'
        WHEN cp.communication_preference = 'male_only' THEN 'Solo Hombre'
        WHEN cp.communication_preference = 'female_only' THEN 'Solo Mujer'
        ELSE 'No especificado'
    END as communication_preference_text,
    -- Campos calculados
    COALESCE(cp.total_views, 0) as views_count,
    COALESCE(cp.total_likes, 0) as likes_count,
    COALESCE(cp.total_matches, 0) as matches_count,
    COALESCE(cp.profile_completeness, 0) as completeness_percentage,
    -- Campos de ubicación formateados
    CASE 
        WHEN cp.city IS NOT NULL AND cp.state IS NOT NULL AND cp.country IS NOT NULL 
        THEN CONCAT(cp.city, ', ', cp.state, ', ', cp.country)
        WHEN cp.city IS NOT NULL AND cp.state IS NOT NULL 
        THEN CONCAT(cp.city, ', ', cp.state)
        WHEN cp.city IS NOT NULL 
        THEN cp.city
        ELSE cp.location
    END as formatted_location,
    -- Campos de disponibilidad
    CASE 
        WHEN cp.last_active > NOW() - INTERVAL '1 hour' THEN 'En línea'
        WHEN cp.last_active > NOW() - INTERVAL '24 hours' THEN 'Activo hoy'
        WHEN cp.last_active > NOW() - INTERVAL '7 days' THEN 'Activo esta semana'
        ELSE 'Inactivo'
    END as activity_status
FROM couple_profiles cp
LEFT JOIN profiles p1 ON cp.partner1_id = p1.id
LEFT JOIN profiles p2 ON cp.partner2_id = p2.id;

-- =====================================================
-- FUNCIONES PARA PERFILES DEMO
-- =====================================================

-- Función para crear perfil demo de pareja
CREATE OR REPLACE FUNCTION create_demo_couple_profile(
    couple_name TEXT,
    partner1_id UUID,
    partner2_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_profile_id UUID;
BEGIN
    INSERT INTO couple_profiles (
        couple_name,
        couple_bio,
        relationship_type,
        partner1_id,
        partner2_id,
        couple_images,
        is_verified,
        is_premium,
        preferences,
        looking_for,
        experience_level,
        swinger_experience,
        interested_in,
        couple_interests,
        activities_interested,
        event_types,
        communication_preference,
        couple_age_range,
        couple_lifestyle,
        is_demo,
        verification_level,
        is_public,
        privacy_settings,
        profile_completeness,
        display_name,
        preferred_theme,
        city,
        state,
        country,
        latitude,
        longitude
    ) VALUES (
        couple_name,
        'Pareja demo explorando conexiones auténticas en el lifestyle swinger. Buscamos experiencias discretas, respeto mutuo y encuentros sofisticados.',
        'man-woman',
        partner1_id,
        partner2_id,
        ARRAY['/placeholder.svg', '/placeholder.svg'],
        TRUE,
        FALSE,
        '{"demo": true, "theme": "swinger"}'::JSONB,
        'swinger',
        'intermediate',
        'advanced',
        'couples',
        ARRAY['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Gastronomía', 'Arte', 'Eventos Sofisticados'],
        ARRAY['Cenas románticas', 'Eventos privados', 'Viajes en pareja', 'Actividades culturales'],
        ARRAY['Eventos exclusivos', 'Cenas privadas', 'Viajes discretos'],
        'both',
        '25-45',
        'sofisticado',
        TRUE,
        2,
        TRUE,
        '{"demo": true}'::JSONB,
        85,
        couple_name || ' Demo',
        'dark',
        'Ciudad de México',
        'CDMX',
        'México',
        19.4326,
        -99.1332
    ) RETURNING id INTO new_profile_id;
    
    RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener perfiles demo
CREATE OR REPLACE FUNCTION get_demo_couple_profiles(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    couple_name TEXT,
    couple_bio TEXT,
    relationship_type TEXT,
    partner1_first_name TEXT,
    partner1_last_name TEXT,
    partner1_age INTEGER,
    partner1_gender TEXT,
    partner2_first_name TEXT,
    partner2_last_name TEXT,
    partner2_age INTEGER,
    partner2_gender TEXT,
    looking_for TEXT,
    swinger_experience TEXT,
    interested_in TEXT,
    couple_interests TEXT[],
    activities_interested TEXT[],
    couple_lifestyle TEXT,
    formatted_location TEXT,
    activity_status TEXT,
    views_count INTEGER,
    likes_count INTEGER,
    matches_count INTEGER,
    completeness_percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cpc.id,
        cpc.couple_name,
        cpc.couple_bio,
        cpc.relationship_type_text,
        cpc.partner1_first_name,
        cpc.partner1_last_name,
        cpc.partner1_age,
        cpc.partner1_gender,
        cpc.partner2_first_name,
        cpc.partner2_last_name,
        cpc.partner2_age,
        cpc.partner2_gender,
        cpc.looking_for_text,
        cpc.experience_level_text,
        cpc.interested_in_text,
        cpc.couple_interests,
        cpc.activities_interested,
        cpc.couple_lifestyle,
        cpc.formatted_location,
        cpc.activity_status,
        cpc.views_count,
        cpc.likes_count,
        cpc.matches_count,
        cpc.completeness_percentage
    FROM couple_profiles_complete cpc
    WHERE cpc.is_demo = TRUE
    AND cpc.is_public = TRUE
    ORDER BY cpc.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES PARA PRODUCCIÓN
-- =====================================================

-- Función para buscar parejas por proximidad
CREATE OR REPLACE FUNCTION find_couples_by_proximity(
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    max_distance_km INTEGER DEFAULT 50,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    couple_name TEXT,
    couple_bio TEXT,
    relationship_type TEXT,
    looking_for TEXT,
    swinger_experience TEXT,
    interested_in TEXT,
    couple_interests TEXT[],
    activities_interested TEXT[],
    couple_lifestyle TEXT,
    formatted_location TEXT,
    distance_km DECIMAL(10, 2),
    views_count INTEGER,
    likes_count INTEGER,
    matches_count INTEGER,
    completeness_percentage INTEGER,
    activity_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cpc.id,
        cpc.couple_name,
        cpc.couple_bio,
        cpc.relationship_type_text,
        cpc.looking_for_text,
        cpc.experience_level_text,
        cpc.interested_in_text,
        cpc.couple_interests,
        cpc.activities_interested,
        cpc.couple_lifestyle,
        cpc.formatted_location,
        ROUND(
            6371 * acos(
                cos(radians(user_latitude)) * 
                cos(radians(cpc.latitude)) * 
                cos(radians(cpc.longitude) - radians(user_longitude)) + 
                sin(radians(user_latitude)) * 
                sin(radians(cpc.latitude))
            )::DECIMAL, 2
        ) as distance_km,
        cpc.views_count,
        cpc.likes_count,
        cpc.matches_count,
        cpc.completeness_percentage,
        cpc.activity_status
    FROM couple_profiles_complete cpc
    WHERE cpc.is_demo = FALSE
    AND cpc.is_public = TRUE
    AND cpc.latitude IS NOT NULL
    AND cpc.longitude IS NOT NULL
    AND (
        6371 * acos(
            cos(radians(user_latitude)) * 
            cos(radians(cpc.latitude)) * 
            cos(radians(cpc.longitude) - radians(user_longitude)) + 
            sin(radians(user_latitude)) * 
            sin(radians(cpc.latitude))
        )
    ) <= max_distance_km
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar parejas por compatibilidad
CREATE OR REPLACE FUNCTION find_couples_by_compatibility(
    user_interests TEXT[],
    user_looking_for TEXT DEFAULT 'swinger',
    user_experience_level TEXT DEFAULT 'intermediate',
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    couple_name TEXT,
    couple_bio TEXT,
    relationship_type TEXT,
    looking_for TEXT,
    swinger_experience TEXT,
    interested_in TEXT,
    couple_interests TEXT[],
    activities_interested TEXT[],
    couple_lifestyle TEXT,
    formatted_location TEXT,
    compatibility_score INTEGER,
    shared_interests TEXT[],
    views_count INTEGER,
    likes_count INTEGER,
    matches_count INTEGER,
    completeness_percentage INTEGER,
    activity_status TEXT
) AS $$
DECLARE
    interest TEXT;
    shared_count INTEGER;
BEGIN
    RETURN QUERY
    SELECT 
        cpc.id,
        cpc.couple_name,
        cpc.couple_bio,
        cpc.relationship_type_text,
        cpc.looking_for_text,
        cpc.experience_level_text,
        cpc.interested_in_text,
        cpc.couple_interests,
        cpc.activities_interested,
        cpc.couple_lifestyle,
        cpc.formatted_location,
        CASE 
            WHEN cpc.couple_interests IS NULL THEN 0
            ELSE (
                SELECT COUNT(*)::INTEGER
                FROM unnest(cpc.couple_interests) AS couple_interest
                WHERE couple_interest = ANY(user_interests)
            ) * 20
        END as compatibility_score,
        CASE 
            WHEN cpc.couple_interests IS NULL THEN ARRAY[]::TEXT[]
            ELSE (
                SELECT ARRAY_AGG(couple_interest)
                FROM unnest(cpc.couple_interests) AS couple_interest
                WHERE couple_interest = ANY(user_interests)
            )
        END as shared_interests,
        cpc.views_count,
        cpc.likes_count,
        cpc.matches_count,
        cpc.completeness_percentage,
        cpc.activity_status
    FROM couple_profiles_complete cpc
    WHERE cpc.is_demo = FALSE
    AND cpc.is_public = TRUE
    AND cpc.looking_for = user_looking_for
    AND cpc.swinger_experience = user_experience_level
    ORDER BY compatibility_score DESC, cpc.total_likes DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION update_couple_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar last_active
    NEW.last_active = NOW();
    
    -- Calcular profile_completeness
    NEW.profile_completeness = (
        CASE WHEN NEW.couple_name IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN NEW.couple_bio IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN NEW.couple_images IS NOT NULL AND array_length(NEW.couple_images, 1) > 0 THEN 20 ELSE 0 END +
        CASE WHEN NEW.looking_for IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN NEW.swinger_experience IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN NEW.interested_in IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN NEW.couple_interests IS NOT NULL AND array_length(NEW.couple_interests, 1) > 0 THEN 15 ELSE 0 END +
        CASE WHEN NEW.activities_interested IS NOT NULL AND array_length(NEW.activities_interested, 1) > 0 THEN 10 ELSE 0 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas
DROP TRIGGER IF EXISTS trigger_update_couple_profile_stats ON couple_profiles;
CREATE TRIGGER trigger_update_couple_profile_stats
    BEFORE UPDATE ON couple_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_couple_profile_stats();

-- =====================================================
-- DATOS DE EJEMPLO PARA DEMO
-- =====================================================

-- Insertar perfiles demo de parejas
INSERT INTO couple_profiles (
    id, couple_name, couple_bio, relationship_type, partner1_id, partner2_id,
    couple_images, is_verified, is_premium, preferences, looking_for, 
    experience_level, swinger_experience, interested_in, couple_interests,
    activities_interested, event_types, communication_preference, 
    couple_age_range, couple_lifestyle, is_demo, verification_level,
    is_public, privacy_settings, profile_completeness, display_name,
    preferred_theme, city, state, country, latitude, longitude,
    total_views, total_likes, total_matches
) VALUES 
(
    'demo-couple-1', 'Sofía y Carlos', 
    'Pareja experimentada en el lifestyle swinger. Buscamos conexiones auténticas, respeto mutuo y experiencias sofisticadas. Disfrutamos de viajes, gastronomía y eventos exclusivos.',
    'man-woman', 'demo-single-1', 'demo-single-2',
    ARRAY['/placeholder.svg', '/placeholder.svg'], TRUE, FALSE, '{"demo": true}'::JSONB,
    'swinger', 'intermediate', 'advanced', 'couples', 
    ARRAY['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Gastronomía', 'Arte', 'Eventos Sofisticados'],
    ARRAY['Cenas románticas', 'Eventos privados', 'Viajes en pareja', 'Actividades culturales'],
    ARRAY['Eventos exclusivos', 'Cenas privadas', 'Viajes discretos'],
    'both', '25-45', 'sofisticado', TRUE, 2,
    TRUE, '{"demo": true}'::JSONB, 85, 'Sofía y Carlos Demo',
    'dark', 'Ciudad de México', 'CDMX', 'México', 19.4326, -99.1332,
    150, 45, 12
),
(
    'demo-couple-2', 'Ana y Luis', 
    'Pareja joven explorando el mundo swinger. Buscamos amistades genuinas y experiencias nuevas en un ambiente seguro y respetuoso.',
    'man-woman', 'demo-single-3', 'demo-single-4',
    ARRAY['/placeholder.svg', '/placeholder.svg'], TRUE, FALSE, '{"demo": true}'::JSONB,
    'friendship', 'beginner', 'beginner', 'both',
    ARRAY['Amistad', 'Conversación', 'Cine', 'Música', 'Deportes', 'Naturaleza'],
    ARRAY['Cafés', 'Caminatas', 'Cine', 'Conciertos'],
    ARRAY['Eventos casuales', 'Actividades al aire libre'],
    'both', '22-35', 'activo', TRUE, 1,
    TRUE, '{"demo": true}'::JSONB, 70, 'Ana y Luis Demo',
    'light', 'Guadalajara', 'Jalisco', 'México', 20.6597, -103.3496,
    89, 23, 8
),
(
    'demo-couple-3', 'María y Roberto', 
    'Pareja madura con experiencia en el lifestyle. Valoramos la discreción, el respeto y las conexiones profundas.',
    'man-woman', 'demo-single-5', 'demo-single-6',
    ARRAY['/placeholder.svg', '/placeholder.svg'], TRUE, TRUE, '{"demo": true, "premium": true}'::JSONB,
    'serious', 'advanced', 'expert', 'couples',
    ARRAY['Lifestyle Swinger', 'Relaciones Serias', 'Viajes de Lujo', 'Gastronomía Fina', 'Arte', 'Cultura'],
    ARRAY['Cenas elegantes', 'Eventos exclusivos', 'Viajes internacionales', 'Galas'],
    ARRAY['Eventos premium', 'Cenas privadas', 'Viajes discretos'],
    'both', '35-50', 'elegante', TRUE, 3,
    TRUE, '{"demo": true, "premium": true}'::JSONB, 95, 'María y Roberto Demo',
    'dark', 'Monterrey', 'Nuevo León', 'México', 25.6866, -100.3161,
    234, 67, 18
)
ON CONFLICT (id) DO UPDATE SET
    couple_name = EXCLUDED.couple_name,
    couple_bio = EXCLUDED.couple_bio,
    looking_for = EXCLUDED.looking_for,
    swinger_experience = EXCLUDED.swinger_experience,
    couple_interests = EXCLUDED.couple_interests,
    activities_interested = EXCLUDED.activities_interested,
    updated_at = NOW();

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN couple_profiles.latitude IS 'Latitud de ubicación de la pareja para matching por proximidad';
COMMENT ON COLUMN couple_profiles.longitude IS 'Longitud de ubicación de la pareja para matching por proximidad';
COMMENT ON COLUMN couple_profiles.city IS 'Ciudad donde reside la pareja';
COMMENT ON COLUMN couple_profiles.state IS 'Estado/Provincia donde reside la pareja';
COMMENT ON COLUMN couple_profiles.country IS 'País donde reside la pareja';
COMMENT ON COLUMN couple_profiles.location IS 'Ubicación completa como string';
COMMENT ON COLUMN couple_profiles.display_name IS 'Nombre para mostrar de la pareja';
COMMENT ON COLUMN couple_profiles.preferred_theme IS 'Tema preferido de la interfaz (light, dark, auto)';
COMMENT ON COLUMN couple_profiles.is_public IS 'Si el perfil de pareja es público o privado';
COMMENT ON COLUMN couple_profiles.privacy_settings IS 'Configuraciones de privacidad en formato JSON';
COMMENT ON COLUMN couple_profiles.is_demo IS 'Indica si es un perfil de pareja de demostración';
COMMENT ON COLUMN couple_profiles.verification_level IS 'Nivel de verificación de la pareja (0-3)';
COMMENT ON COLUMN couple_profiles.last_active IS 'Última actividad de la pareja';
COMMENT ON COLUMN couple_profiles.profile_completed_at IS 'Fecha de completado del perfil';
COMMENT ON COLUMN couple_profiles.total_views IS 'Total de visitas al perfil';
COMMENT ON COLUMN couple_profiles.total_likes IS 'Total de likes recibidos';
COMMENT ON COLUMN couple_profiles.total_matches IS 'Total de matches realizados';
COMMENT ON COLUMN couple_profiles.profile_completeness IS 'Porcentaje de completitud del perfil (0-100)';
COMMENT ON COLUMN couple_profiles.activities_interested IS 'Actividades que les interesan a la pareja';
COMMENT ON COLUMN couple_profiles.event_types IS 'Tipos de eventos que prefieren';
COMMENT ON COLUMN couple_profiles.communication_preference IS 'Preferencia de comunicación (both, male_only, female_only)';
COMMENT ON COLUMN couple_profiles.couple_age_range IS 'Rango de edad de la pareja';
COMMENT ON COLUMN couple_profiles.couple_height_range IS 'Rango de altura de la pareja';
COMMENT ON COLUMN couple_profiles.couple_body_type IS 'Tipo de cuerpo de la pareja';
COMMENT ON COLUMN couple_profiles.couple_lifestyle IS 'Estilo de vida de la pareja';
COMMENT ON COLUMN couple_profiles.couple_availability IS 'Disponibilidad de la pareja';

COMMENT ON VIEW couple_profiles_complete IS 'Vista optimizada con información completa de perfiles de pareja';
COMMENT ON FUNCTION create_demo_couple_profile IS 'Función para crear perfiles demo de parejas';
COMMENT ON FUNCTION get_demo_couple_profiles IS 'Función para obtener perfiles demo de parejas';
COMMENT ON FUNCTION find_couples_by_proximity IS 'Función para buscar parejas por proximidad geográfica';
COMMENT ON FUNCTION find_couples_by_compatibility IS 'Función para buscar parejas por compatibilidad de intereses';
