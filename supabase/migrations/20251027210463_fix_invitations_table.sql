-- =====================================================
-- MIGRACIÓN: Corrección de tabla invitations
-- Fecha: 28 de Enero 2025
-- Descripción: Asegurar que updated_at existe en invitations
-- =====================================================

-- Añadir columna updated_at si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invitations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE invitations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_updated_at ON invitations;
CREATE TRIGGER invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_invitations_updated_at();

