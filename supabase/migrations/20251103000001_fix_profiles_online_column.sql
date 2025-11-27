-- =====================================================
-- FIX: Agregar columna is_online si no existe
-- =====================================================
-- Este script asegura que la tabla profiles tenga la columna is_online
-- para compatibilidad con diferentes versiones del código
-- =====================================================

-- Verificar y agregar is_online si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_online'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna is_online agregada a profiles';
        
        -- Si existe last_active, usar eso para inicializar is_online
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'last_active'
        ) THEN
            -- Considerar online si last_active fue en las últimas 24 horas
            UPDATE profiles 
            SET is_online = COALESCE(
                last_active > NOW() - INTERVAL '24 hours',
                FALSE
            )
            WHERE is_online IS NULL;
            
            RAISE NOTICE 'Datos inicializados para is_online basados en last_active';
        END IF;
    END IF;
END $$;

