-- =====================================================
-- MIGRACIÓN: Corrección de tabla gallery_permissions
-- Fecha: 28 de Enero 2025
-- Descripción: Añadir campos faltantes a gallery_permissions
-- =====================================================

-- Añadir columnas faltantes si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_permissions' 
        AND column_name = 'gallery_owner_id'
    ) THEN
        ALTER TABLE gallery_permissions ADD COLUMN gallery_owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_permissions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE gallery_permissions ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_permissions' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE gallery_permissions ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_permissions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE gallery_permissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_gallery_owner_id ON gallery_permissions(gallery_owner_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status ON gallery_permissions(status);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_gallery_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gallery_permissions_updated_at ON gallery_permissions;
CREATE TRIGGER gallery_permissions_updated_at
    BEFORE UPDATE ON gallery_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_gallery_permissions_updated_at();

-- Sincronizar gallery_owner_id con profile_id para registros existentes
UPDATE gallery_permissions 
SET gallery_owner_id = profile_id 
WHERE gallery_owner_id IS NULL 
  AND profile_id IS NOT NULL;

