-- ==========================================
-- CREAR BUCKETS DE STORAGE FALTANTES
-- Fecha: 2025-09-06 04:50 UTC-6
-- Propósito: Crear buckets críticos si no existen
-- ==========================================

-- Crear buckets de storage si no existen
DO $$
DECLARE
    bucket_exists BOOLEAN;
    bucket_name TEXT;
    critical_buckets TEXT[] := ARRAY['profile-images', 'gallery-images', 'chat-media'];
BEGIN
    RAISE NOTICE '🔍 CREANDO BUCKETS DE STORAGE...';
    
    FOREACH bucket_name IN ARRAY critical_buckets
    LOOP
        -- Verificar si el bucket existe
        SELECT EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = bucket_name
        ) INTO bucket_exists;
        
        IF NOT bucket_exists THEN
            -- Crear bucket
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
                bucket_name,
                bucket_name,
                false,
                52428800, -- 50MB limit
                ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
            );
            
            RAISE NOTICE '✅ BUCKET CREADO: %', bucket_name;
            
            -- Crear políticas básicas para el bucket
            EXECUTE format('
                CREATE POLICY "Users can view own %1$s" ON storage.objects
                FOR SELECT USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
            ', bucket_name, bucket_name);
            
            EXECUTE format('
                CREATE POLICY "Users can upload own %1$s" ON storage.objects
                FOR INSERT WITH CHECK (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
            ', bucket_name, bucket_name);
            
            EXECUTE format('
                CREATE POLICY "Users can update own %1$s" ON storage.objects
                FOR UPDATE USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
            ', bucket_name, bucket_name);
            
            EXECUTE format('
                CREATE POLICY "Users can delete own %1$s" ON storage.objects
                FOR DELETE USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
            ', bucket_name, bucket_name);
            
            RAISE NOTICE '🛡️ POLÍTICAS CREADAS PARA: %', bucket_name;
        ELSE
            RAISE NOTICE '✅ BUCKET YA EXISTE: %', bucket_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ VERIFICACIÓN DE BUCKETS COMPLETADA';
END $$;
