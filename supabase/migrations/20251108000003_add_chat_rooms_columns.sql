-- =====================================================
-- MIGRACIÓN: Agregar columnas a chat_rooms
-- Fecha: 2025-11-08
-- Descripción: Agregar columnas description, is_public, is_active a chat_rooms
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'chat_rooms'
    ) THEN
        -- Agregar columna description si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_rooms' 
            AND column_name = 'description'
        ) THEN
            ALTER TABLE chat_rooms ADD COLUMN description TEXT;
        END IF;

        -- Agregar columna is_public si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_rooms' 
            AND column_name = 'is_public'
        ) THEN
            ALTER TABLE chat_rooms ADD COLUMN is_public BOOLEAN DEFAULT false;
        END IF;

        -- Agregar columna is_active si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_rooms' 
            AND column_name = 'is_active'
        ) THEN
            ALTER TABLE chat_rooms ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;

        -- Crear índices para optimización
        CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_public ON chat_rooms(is_public);
        CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);

        -- Actualizar valores por defecto
        UPDATE chat_rooms 
        SET is_public = false
        WHERE is_public IS NULL;

        UPDATE chat_rooms 
        SET is_active = true
        WHERE is_active IS NULL;

        -- Comentarios
        COMMENT ON COLUMN chat_rooms.description IS 'Descripción de la sala de chat';
        COMMENT ON COLUMN chat_rooms.is_public IS 'Indica si la sala es pública (true) o privada (false)';
        COMMENT ON COLUMN chat_rooms.is_active IS 'Indica si la sala está activa';

        RAISE NOTICE '✅ Columnas description, is_public, is_active agregadas a chat_rooms';
    ELSE
        RAISE NOTICE 'Tabla chat_rooms no existe en este entorno; se omite migración.';
    END IF;
END $$;

