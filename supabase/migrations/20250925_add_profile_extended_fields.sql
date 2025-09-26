-- Agregar campos faltantes a la tabla profiles para compatibilidad con advancedFeatures.ts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_preferences JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_preferences JSONB DEFAULT '{}';

-- Índices para optimizar consultas en los nuevos campos JSONB
CREATE INDEX IF NOT EXISTS idx_profiles_personality_traits ON profiles USING GIN (personality_traits);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_preferences ON profiles USING GIN (lifestyle_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_location_preferences ON profiles USING GIN (location_preferences);

-- Comentarios para documentar los campos
COMMENT ON COLUMN profiles.personality_traits IS 'JSONB field storing personality traits like openness, conscientiousness, extraversion, agreeableness, neuroticism (0-100 scale)';
COMMENT ON COLUMN profiles.lifestyle_preferences IS 'JSONB field storing lifestyle preferences like activity_level, social_preference, work_life_balance, travel_frequency';
COMMENT ON COLUMN profiles.location_preferences IS 'JSONB field storing location preferences and coordinates for matching purposes';

-- Datos de ejemplo para perfiles existentes (opcional)
UPDATE profiles SET 
  personality_traits = '{
    "openness": 70,
    "conscientiousness": 65,
    "extraversion": 75,
    "agreeableness": 80,
    "neuroticism": 30
  }'::jsonb,
  lifestyle_preferences = '{
    "activity_level": "moderate",
    "social_preference": "balanced",
    "work_life_balance": "important",
    "travel_frequency": "occasional"
  }'::jsonb,
  location_preferences = '{
    "max_distance": 50,
    "preferred_areas": [],
    "coordinates": null
  }'::jsonb
WHERE personality_traits IS NULL OR personality_traits = '{}'::jsonb;
