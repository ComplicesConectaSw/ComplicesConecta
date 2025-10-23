-- Crear tabla images para gestión de imágenes
-- Ejecutar en Supabase via Docker

CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_images_profile_id ON images(profile_id);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_is_verified ON images(is_verified);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_images_sort_order ON images(sort_order);

-- Políticas RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Políticas para images
CREATE POLICY "Users can view public images" ON images
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own images" ON images
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own images" ON images
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own images" ON images
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own images" ON images
    FOR DELETE USING (auth.uid() = profile_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_images_updated_at();

-- Insertar datos de ejemplo
INSERT INTO images (profile_id, url, is_public, is_verified, is_featured, alt_text, tags) VALUES
    ('demo-single-1', '/placeholder.svg', TRUE, TRUE, TRUE, 'Foto de perfil principal', ARRAY['perfil', 'principal']),
    ('demo-single-1', '/placeholder.svg', TRUE, FALSE, FALSE, 'Foto adicional 1', ARRAY['adicional']),
    ('demo-single-1', '/placeholder.svg', FALSE, FALSE, FALSE, 'Foto privada 1', ARRAY['privada'])
ON CONFLICT DO NOTHING;

-- Comentarios para documentar la tabla
COMMENT ON TABLE images IS 'Tabla para gestionar imágenes de perfiles';
COMMENT ON COLUMN images.profile_id IS 'ID del usuario propietario de la imagen';
COMMENT ON COLUMN images.url IS 'URL de la imagen';
COMMENT ON COLUMN images.is_public IS 'Si la imagen es pública o privada';
COMMENT ON COLUMN images.is_verified IS 'Si la imagen ha sido verificada por moderadores';
COMMENT ON COLUMN images.is_featured IS 'Si es la imagen destacada del perfil';
COMMENT ON COLUMN images.metadata IS 'Metadatos adicionales en formato JSON';
COMMENT ON COLUMN images.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN images.mime_type IS 'Tipo MIME de la imagen';
COMMENT ON COLUMN images.width IS 'Ancho de la imagen en píxeles';
COMMENT ON COLUMN images.height IS 'Alto de la imagen en píxeles';
COMMENT ON COLUMN images.alt_text IS 'Texto alternativo para accesibilidad';
COMMENT ON COLUMN images.tags IS 'Array de etiquetas para categorizar la imagen';
COMMENT ON COLUMN images.sort_order IS 'Orden de visualización de las imágenes';
