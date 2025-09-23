-- Agregar campo cv_url a la tabla career_applications
-- Fecha: 2025-09-22 23:27:00
-- Propósito: Almacenar URL del CV subido por el solicitante

-- Agregar columna cv_url si no existe
ALTER TABLE career_applications 
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Agregar comentario para documentación
COMMENT ON COLUMN career_applications.cv_url IS 'URL del archivo CV subido por el solicitante en Supabase Storage';

-- Crear bucket para archivos de carrera si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-files',
  'career-files',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de storage para career-files bucket
-- Permitir inserción pública para subir CVs
CREATE POLICY IF NOT EXISTS "Allow public upload of career files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'career-files');

-- Solo admins pueden ver los archivos
CREATE POLICY IF NOT EXISTS "Allow admin access to career files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'career-files' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@complicesconecta.com', 'ComplicesConectaSw@outlook.es')
    )
  );

-- Solo admins pueden eliminar archivos
CREATE POLICY IF NOT EXISTS "Allow admin delete of career files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'career-files' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@complicesconecta.com', 'ComplicesConectaSw@outlook.es')
    )
  );
