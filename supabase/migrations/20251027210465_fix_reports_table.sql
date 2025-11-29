-- =====================================================
-- MIGRACIÓN: Corrección de tabla reports
-- Fecha: 28 de Enero 2025
-- Descripción: Añade campo content_type a reports (alias de report_type)
-- =====================================================

-- Asegurar que la tabla base exista antes de aplicar correcciones
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text,
  created_at timestamptz DEFAULT now()
);

-- Añadir columna content_type como alias de report_type para compatibilidad
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'content_type'
    ) THEN
        ALTER TABLE reports ADD COLUMN content_type TEXT;
    END IF;
END $$;

-- Crear trigger para mantener content_type sincronizado con report_type
CREATE OR REPLACE FUNCTION sync_reports_content_type()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza report_type, actualizar content_type
    IF NEW.report_type IS NOT NULL THEN
        NEW.content_type := NEW.report_type;
    END IF;
    
    -- Si se actualiza content_type, actualizar report_type
    IF NEW.content_type IS NOT NULL THEN
        NEW.report_type := NEW.content_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_reports_content_type_trigger
    BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION sync_reports_content_type();

-- Actualizar registros existentes (solo si existen las columnas)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reports'
          AND column_name = 'report_type'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reports'
          AND column_name = 'content_type'
    ) THEN
        UPDATE reports
        SET content_type = report_type
        WHERE content_type IS NULL;
    END IF;
END $$;

