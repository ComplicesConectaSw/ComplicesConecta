-- =====================================================
-- SCRIPT DE CREACIÓN Y CONFIGURACIÓN DE STORAGE BUCKETS
-- ComplicesConecta v2.1.2 - Sistema de Storage Supabase
-- Fecha: 06 de septiembre, 2025 - 05:09 hrs
-- =====================================================

-- PASO 1: CREAR BUCKETS DE STORAGE SI NO EXISTEN
-- =====================================================

-- Bucket para imágenes de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de galería
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-images',
    'gallery-images',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para media de chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-media',
    'chat-media',
    false,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- PASO 2: POLÍTICAS RLS PARA BUCKET PROFILE-IMAGES
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Crear políticas para profile-images
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- PASO 3: POLÍTICAS RLS PARA BUCKET GALLERY-IMAGES
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Gallery images viewable by owner" ON storage.objects;
DROP POLICY IF EXISTS "Gallery images viewable with permission" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all gallery images" ON storage.objects;

-- Crear políticas para gallery-images
CREATE POLICY "Gallery images viewable by owner" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gallery-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Gallery images viewable with permission" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gallery-images' AND
        (
            -- Owner can always view
            auth.uid()::text = (storage.foldername(name))[1] OR
            -- Users with gallery permission can view
            EXISTS (
                SELECT 1 FROM gallery_permissions gp
                WHERE gp.owner_id::text = (storage.foldername(name))[1]
                  AND gp.viewer_id = auth.uid()
                  AND gp.permission_type = 'private'
            ) OR
            -- Public images can be viewed by anyone
            EXISTS (
                SELECT 1 FROM images i
                WHERE i.file_path = name
                  AND i.is_public = true
            ) OR
            -- Admins can view all
            has_role(auth.uid(), 'admin')
        )
    );

CREATE POLICY "Users can upload gallery images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gallery-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own gallery images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'gallery-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own gallery images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gallery-images' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            has_role(auth.uid(), 'admin')
        )
    );

-- PASO 4: POLÍTICAS RLS PARA BUCKET CHAT-MEDIA
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Chat media viewable by room members" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all chat media" ON storage.objects;

-- Crear políticas para chat-media
CREATE POLICY "Chat media viewable by room members" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat-media' AND
        (
            -- Uploader can always view
            auth.uid()::text = (storage.foldername(name))[1] OR
            -- Room members can view media in their rooms
            EXISTS (
                SELECT 1 FROM messages m
                JOIN chat_members cm ON cm.room_id = m.room_id
                WHERE m.content LIKE '%' || name || '%'
                  AND cm.user_id = auth.uid()
            ) OR
            -- Admins can view all
            has_role(auth.uid(), 'admin')
        )
    );

CREATE POLICY "Users can upload chat media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own chat media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'chat-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own chat media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'chat-media' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            has_role(auth.uid(), 'admin')
        )
    );

-- PASO 5: CONFIGURACIONES ADICIONALES DE SEGURIDAD
-- =====================================================

-- Función helper para obtener el folder name
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
BEGIN
    RETURN string_to_array(name, '/');
END;
$$ LANGUAGE plpgsql;

-- Función para verificar permisos de galería
CREATE OR REPLACE FUNCTION check_gallery_permission(owner_uuid UUID, viewer_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM gallery_permissions
        WHERE owner_id = owner_uuid 
          AND viewer_id = viewer_uuid
          AND permission_type = 'private'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 6: CONFIGURAR LÍMITES Y RESTRICCIONES
-- =====================================================

-- Actualizar configuraciones de buckets si es necesario
UPDATE storage.buckets 
SET 
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'profile-images';

UPDATE storage.buckets 
SET 
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'gallery-images';

UPDATE storage.buckets 
SET 
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
WHERE id = 'chat-media';

-- PASO 7: CREAR TRIGGERS PARA LIMPIEZA AUTOMÁTICA
-- =====================================================

-- Función para limpiar archivos huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpiar archivos de imágenes cuando se borra una imagen de la BD
    IF TG_TABLE_NAME = 'images' THEN
        DELETE FROM storage.objects 
        WHERE bucket_id IN ('profile-images', 'gallery-images', 'chat-media')
          AND name = OLD.file_path;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para limpiar archivos cuando se borran imágenes
DROP TRIGGER IF EXISTS cleanup_image_files ON images;
CREATE TRIGGER cleanup_image_files
    AFTER DELETE ON images
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_orphaned_files();

-- =====================================================
-- FIN DEL SCRIPT DE STORAGE BUCKETS
-- =====================================================

-- Mensaje de finalización
SELECT 'STORAGE BUCKETS CONFIGURADOS CORRECTAMENTE - ComplicesConecta v2.1.2' as resultado;
