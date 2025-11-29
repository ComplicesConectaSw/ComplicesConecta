-- =====================================================
-- FIX: Agregar columnas media_url y media_urls si no existen
-- =====================================================
-- Este script asegura que la tabla stories tenga ambas columnas
-- para compatibilidad con diferentes versiones del código
-- =====================================================

-- Verificar y agregar media_url si no existe (solo si existe la tabla stories)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'stories'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'media_url'
    ) THEN
        ALTER TABLE stories ADD COLUMN media_url TEXT;
        RAISE NOTICE 'Columna media_url agregada a stories';
    END IF;
END $$;

-- Verificar y agregar media_urls si no existe (solo si existe la tabla stories)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'stories'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'media_urls'
    ) THEN
        ALTER TABLE stories ADD COLUMN media_urls TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna media_urls agregada a stories';
    END IF;
END $$;

-- Función para sincronizar media_url y media_urls
-- Si media_urls tiene valores, copiar el primero a media_url
CREATE OR REPLACE FUNCTION sync_stories_media_url()
RETURNS TRIGGER AS $$
BEGIN
    -- Si media_urls tiene valores y media_url está vacío, usar el primero
    IF NEW.media_urls IS NOT NULL AND array_length(NEW.media_urls, 1) > 0 AND 
       (NEW.media_url IS NULL OR NEW.media_url = '') THEN
        NEW.media_url := NEW.media_urls[1];
    END IF;
    
    -- Si media_url tiene valor y media_urls está vacío, crear array
    IF NEW.media_url IS NOT NULL AND NEW.media_url != '' AND 
       (NEW.media_urls IS NULL OR array_length(NEW.media_urls, 1) = 0) THEN
        NEW.media_urls := ARRAY[NEW.media_url];
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronizar automáticamente (solo si existe stories)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'stories'
    ) THEN
        DROP TRIGGER IF EXISTS sync_stories_media_url_trigger ON stories;
        CREATE TRIGGER sync_stories_media_url_trigger
            BEFORE INSERT OR UPDATE ON stories
            FOR EACH ROW
            EXECUTE FUNCTION sync_stories_media_url();
    END IF;
END $$;

-- Sincronizar datos existentes (una sola vez)
-- Solo si existe la tabla stories y ambas columnas existen
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'stories'
    ) THEN
        -- Sincronizar media_urls -> media_url (solo si media_urls existe)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'media_urls'
        ) THEN
            UPDATE stories 
            SET media_url = media_urls[1]
            WHERE (media_url IS NULL OR media_url = '') 
              AND media_urls IS NOT NULL 
              AND array_length(media_urls, 1) > 0;
            
            RAISE NOTICE 'Datos sincronizados de media_urls a media_url';
        END IF;
        
        -- Sincronizar media_url -> media_urls (solo si media_urls y media_url existen)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'media_urls'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'media_url'
        ) THEN
            UPDATE stories 
            SET media_urls = ARRAY[media_url]
            WHERE (media_urls IS NULL OR array_length(media_urls, 1) = 0)
              AND media_url IS NOT NULL 
              AND media_url != '';
            
            RAISE NOTICE 'Datos sincronizados de media_url a media_urls';
        END IF;
    END IF;
END $$;

