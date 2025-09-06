-- =====================================================
-- 🗂️ SISTEMA COMPLETO DE STORAGE BUCKETS
-- ComplicesConecta v2.1.2 - Configuración Completa de Almacenamiento
-- Fecha: 06 de septiembre, 2025 - 05:32 hrs
-- =====================================================

-- 🤖 AUDITOR Y REPARADOR AUTOMÁTICO DE STORAGE
-- Crea buckets y políticas de almacenamiento seguras
-- Scripts idempotentes - seguros para ejecutar múltiples veces

DO $$
BEGIN
    RAISE NOTICE '🗂️ INICIANDO SISTEMA AUTOMÁTICO DE STORAGE BUCKETS';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '📁 Creando buckets de almacenamiento seguros...';
END $$;

-- 📷 BUCKET: profile-images
-- =====================================================

-- Crear bucket para imágenes de perfil (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de seguridad para profile-images
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;

CREATE POLICY "Users can upload own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 🖼️ BUCKET: gallery-images
-- =====================================================

-- Crear bucket para imágenes de galería (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-images',
    'gallery-images',
    false, -- Privado por defecto
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de seguridad para gallery-images
DROP POLICY IF EXISTS "Users can upload own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view permitted gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own gallery images" ON storage.objects;

CREATE POLICY "Users can upload own gallery images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gallery-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own gallery images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gallery-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view permitted gallery images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gallery-images' AND 
        EXISTS (
            SELECT 1 FROM public.gallery_permissions gp
            WHERE gp.profile_id::text = (storage.foldername(name))[1]
            AND gp.granted_to = auth.uid()
        )
    );

CREATE POLICY "Users can manage own gallery images" ON storage.objects
    FOR ALL USING (
        bucket_id = 'gallery-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 💬 BUCKET: chat-media
-- =====================================================

-- Crear bucket para archivos de chat (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-media',
    'chat-media',
    false, -- Privado
    20971520, -- 20MB
    ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'text/plain'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de seguridad para chat-media
DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Chat members can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own chat media" ON storage.objects;

CREATE POLICY "Users can upload chat media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-media' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Chat members can view media" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat-media' AND 
        (
            -- Propietario del archivo
            auth.uid()::text = (storage.foldername(name))[1] OR
            -- Miembro del chat donde se subió el archivo
            EXISTS (
                SELECT 1 FROM public.chat_members cm
                JOIN public.messages m ON m.room_id = cm.room_id
                WHERE cm.profile_id = auth.uid()
                AND m.content LIKE '%' || name || '%'
            )
        )
    );

CREATE POLICY "Users can manage own chat media" ON storage.objects
    FOR ALL USING (
        bucket_id = 'chat-media' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 🔧 FUNCIONES AUXILIARES PARA STORAGE
-- =====================================================

-- Función para limpiar archivos huérfanos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Limpiar imágenes de perfil huérfanas (más de 7 días sin referencia)
    DELETE FROM storage.objects 
    WHERE bucket_id = 'profile-images'
    AND created_at < NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.avatar_url LIKE '%' || name || '%'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Limpiar imágenes de galería huérfanas (más de 30 días sin referencia)
    DELETE FROM storage.objects 
    WHERE bucket_id = 'gallery-images'
    AND created_at < NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM public.images i 
        WHERE i.url LIKE '%' || name || '%'
    );
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Función para obtener estadísticas de storage
CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS TABLE (
    bucket_name TEXT,
    file_count BIGINT,
    total_size_mb NUMERIC,
    avg_file_size_kb NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bucket_id as bucket_name,
        COUNT(*) as file_count,
        ROUND(SUM(metadata->>'size')::NUMERIC / 1048576, 2) as total_size_mb,
        ROUND(AVG((metadata->>'size')::NUMERIC) / 1024, 2) as avg_file_size_kb
    FROM storage.objects 
    WHERE bucket_id IN ('profile-images', 'gallery-images', 'chat-media')
    GROUP BY bucket_id
    ORDER BY bucket_id;
END;
$$;

-- Función para validar tipo de archivo
CREATE OR REPLACE FUNCTION public.validate_file_type(file_name TEXT, bucket_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    file_extension TEXT;
    allowed_types TEXT[];
BEGIN
    -- Extraer extensión del archivo
    file_extension := lower(split_part(file_name, '.', -1));
    
    -- Definir tipos permitidos por bucket
    CASE bucket_name
        WHEN 'profile-images' THEN
            allowed_types := ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif'];
        WHEN 'gallery-images' THEN
            allowed_types := ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif'];
        WHEN 'chat-media' THEN
            allowed_types := ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'pdf', 'txt'];
        ELSE
            RETURN false;
    END CASE;
    
    -- Verificar si la extensión está permitida
    RETURN file_extension = ANY(allowed_types);
END;
$$;

DO $$
BEGIN
    RAISE NOTICE '✅ SISTEMA DE STORAGE BUCKETS COMPLETADO EXITOSAMENTE';
    RAISE NOTICE '🗂️ Buckets configurados: profile-images, gallery-images, chat-media';
    RAISE NOTICE '🔒 Políticas de seguridad implementadas';
    RAISE NOTICE '🧹 Funciones de limpieza y validación creadas';
END $$;
