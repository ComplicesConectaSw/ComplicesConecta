-- Crear tabla de intereses
CREATE TABLE IF NOT EXISTS interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de relación usuario-intereses
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, interest_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category);
CREATE INDEX IF NOT EXISTS idx_interests_popular ON interests(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON user_interests(interest_id);

-- RLS (Row Level Security)
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Políticas para interests (lectura pública)
CREATE POLICY "Interests are viewable by everyone" ON interests
  FOR SELECT USING (true);

-- Políticas para user_interests
CREATE POLICY "Users can view their own interests" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests" ON user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" ON user_interests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" ON user_interests
  FOR DELETE USING (auth.uid() = user_id);

-- Insertar intereses predefinidos para lifestyle swinger
INSERT INTO interests (name, category, description, is_popular) VALUES
  -- Lifestyle/Swinger
  ('Lifestyle', 'Lifestyle', 'Estilo de vida swinger', true),
  ('Swinger', 'Lifestyle', 'Intercambio de parejas', true),
  ('Parejas', 'Lifestyle', 'Interacciones entre parejas', true),
  ('Intercambio', 'Lifestyle', 'Intercambio de parejas', true),
  ('Liberal', 'Lifestyle', 'Mente abierta y liberal', true),
  ('Soft Swap', 'Lifestyle', 'Intercambio suave', false),
  ('Full Swap', 'Lifestyle', 'Intercambio completo', false),
  ('Unicornio', 'Lifestyle', 'Mujer soltera para parejas', false),
  ('Bull', 'Lifestyle', 'Hombre soltero para parejas', false),
  
  -- Actividades
  ('Fiestas Privadas', 'Actividades', 'Eventos privados', true),
  ('Clubs', 'Actividades', 'Clubes swinger', true),
  ('Viajes', 'Actividades', 'Viajes y vacaciones', true),
  ('Cenas', 'Actividades', 'Cenas y encuentros sociales', false),
  ('Spa', 'Actividades', 'Relajación y spa', false),
  ('Playa', 'Actividades', 'Actividades en la playa', false),
  ('Cruceros', 'Actividades', 'Cruceros temáticos', false),
  
  -- Preferencias
  ('Discreción', 'Preferencias', 'Privacidad y discreción', true),
  ('Respeto', 'Preferencias', 'Respeto mutuo', true),
  ('Experiencia', 'Preferencias', 'Experiencia en el lifestyle', false),
  ('Principiantes', 'Preferencias', 'Abierto a principiantes', false),
  ('Solo Parejas', 'Preferencias', 'Solo interacciones con parejas', false),
  ('Singles Bienvenidos', 'Preferencias', 'Abierto a personas solteras', false),
  
  -- Intereses Generales
  ('Música', 'General', 'Música y conciertos', false),
  ('Deportes', 'General', 'Actividades deportivas', false),
  ('Arte', 'General', 'Arte y cultura', false),
  ('Gastronomía', 'General', 'Comida y bebida', false),
  ('Naturaleza', 'General', 'Actividades al aire libre', false),
  ('Tecnología', 'General', 'Tecnología e innovación', false)
ON CONFLICT (name) DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON interests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
