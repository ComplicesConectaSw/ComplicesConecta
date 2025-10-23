-- Agregar campos adicionales a la tabla profiles para funcionalidades avanzadas
-- Ejecutar en Supabase via Docker

-- Agregar campos para funcionalidades swinger y premium
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS premium_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_failed BOOLEAN DEFAULT FALSE;

-- Campos para experiencia swinger
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS swinger_experience VARCHAR(50) DEFAULT 'beginner' CHECK (swinger_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS interested_in VARCHAR(50) DEFAULT 'couples' CHECK (interested_in IN ('singles', 'couples', 'both')),
ADD COLUMN IF NOT EXISTS looking_for VARCHAR(50) DEFAULT 'friendship' CHECK (looking_for IN ('friendship', 'dating', 'casual', 'serious', 'swinger')),
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65;

-- Campos para ubicación avanzada
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Campos para personalización
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(20) DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS navbar_style VARCHAR(20) DEFAULT 'default' CHECK (navbar_style IN ('default', 'minimal', 'compact')),
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20) DEFAULT 'single' CHECK (profile_type IN ('single', 'couple', 'group')),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced'));

-- Campos para seguridad y biometría
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_last_used TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS biometric_public_key TEXT,
ADD COLUMN IF NOT EXISTS webauthn_registered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Campos para parejas (si es perfil de pareja)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS partner_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS partner_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS partner_age INTEGER,
ADD COLUMN IF NOT EXISTS couple_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(20) CHECK (relationship_type IN ('man-woman', 'man-man', 'woman-woman', 'other'));

-- Campos para timestamps adicionales
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_swinger_experience ON profiles(swinger_experience);
CREATE INDEX IF NOT EXISTS idx_profiles_interested_in ON profiles(interested_in);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);

-- Actualizar la función de updated_at para incluir los nuevos campos
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at();

-- Insertar datos de ejemplo para testing
INSERT INTO profiles (
    id, first_name, last_name, age, bio, avatar_url, email, gender, 
    interests, is_admin, is_online, is_verified, last_seen, location, 
    role, username, is_demo, is_premium, swinger_experience, 
    interested_in, looking_for, latitude, longitude, city, 
    display_name, preferred_theme, profile_type, experience_level
) VALUES (
    'demo-single-1', 'Sofía', 'Demo', 28, 
    'Explorando conexiones auténticas en el lifestyle swinger. Disfruto de experiencias discretas, respeto mutuo y encuentros sofisticados. Me encanta viajar, la música y conocer parejas interesantes.',
    '/placeholder.svg', 'sofia.demo@example.com', 'female',
    ARRAY['Lifestyle Swinger', 'Encuentros Discretos', 'Viajes', 'Música', 'Gastronomía', 'Arte', 'Fotografía', 'Eventos Sofisticados'],
    false, false, true, NOW(), 'CDMX, México', 'user', 'sofia_demo',
    true, false, 'intermediate', 'couples', 'swinger', 
    19.4326, -99.1332, 'Ciudad de México', 'Sofía Demo', 'dark', 'single', 'intermediate'
) ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    bio = EXCLUDED.bio,
    interests = EXCLUDED.interests,
    updated_at = NOW();

-- Crear vista para perfiles completos con información swinger
CREATE OR REPLACE VIEW profiles_swinger_info AS
SELECT 
    p.*,
    CASE 
        WHEN p.is_premium THEN 'Premium'
        WHEN p.is_demo THEN 'Demo'
        ELSE 'Free'
    END as account_status,
    CASE 
        WHEN p.swinger_experience = 'beginner' THEN 'Principiante'
        WHEN p.swinger_experience = 'intermediate' THEN 'Intermedio'
        WHEN p.swinger_experience = 'advanced' THEN 'Avanzado'
        WHEN p.swinger_experience = 'expert' THEN 'Experto'
        ELSE 'No especificado'
    END as experience_level_text,
    CASE 
        WHEN p.interested_in = 'singles' THEN 'Solteros'
        WHEN p.interested_in = 'couples' THEN 'Parejas'
        WHEN p.interested_in = 'both' THEN 'Ambos'
        ELSE 'No especificado'
    END as interested_in_text,
    CASE 
        WHEN p.looking_for = 'friendship' THEN 'Amistad'
        WHEN p.looking_for = 'dating' THEN 'Citas'
        WHEN p.looking_for = 'casual' THEN 'Casual'
        WHEN p.looking_for = 'serious' THEN 'Serio'
        WHEN p.looking_for = 'swinger' THEN 'Swinger'
        ELSE 'No especificado'
    END as looking_for_text,
    CASE 
        WHEN p.profile_type = 'single' THEN 'Soltero/a'
        WHEN p.profile_type = 'couple' THEN 'Pareja'
        WHEN p.profile_type = 'group' THEN 'Grupo'
        ELSE 'No especificado'
    END as profile_type_text
FROM profiles p;

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN profiles.is_demo IS 'Indica si es un perfil de demostración';
COMMENT ON COLUMN profiles.is_premium IS 'Indica si el usuario tiene suscripción premium';
COMMENT ON COLUMN profiles.swinger_experience IS 'Nivel de experiencia en el lifestyle swinger';
COMMENT ON COLUMN profiles.interested_in IS 'Tipo de personas que le interesan (singles, couples, both)';
COMMENT ON COLUMN profiles.looking_for IS 'Qué está buscando (friendship, dating, casual, serious, swinger)';
COMMENT ON COLUMN profiles.max_distance IS 'Distancia máxima en kilómetros para matches';
COMMENT ON COLUMN profiles.age_range_min IS 'Edad mínima para matches';
COMMENT ON COLUMN profiles.age_range_max IS 'Edad máxima para matches';
COMMENT ON COLUMN profiles.latitude IS 'Latitud de ubicación del usuario';
COMMENT ON COLUMN profiles.longitude IS 'Longitud de ubicación del usuario';
COMMENT ON COLUMN profiles.display_name IS 'Nombre para mostrar (puede ser diferente al nombre real)';
COMMENT ON COLUMN profiles.preferred_theme IS 'Tema preferido de la interfaz';
COMMENT ON COLUMN profiles.profile_type IS 'Tipo de perfil (single, couple, group)';
COMMENT ON COLUMN profiles.experience_level IS 'Nivel de experiencia general en la plataforma';
COMMENT ON COLUMN profiles.biometric_enabled IS 'Si tiene autenticación biométrica habilitada';
COMMENT ON COLUMN profiles.is_public IS 'Si el perfil es público o privado';
COMMENT ON COLUMN profiles.privacy_settings IS 'Configuraciones de privacidad en formato JSON';
