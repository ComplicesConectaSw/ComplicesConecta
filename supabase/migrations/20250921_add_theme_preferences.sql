-- =====================================================
-- 🎨 MIGRACIÓN: Agregar Preferencias de Tema a Perfiles
-- ComplicesConecta v3.0.0 - Sistema de Temas
-- Fecha: 21 de septiembre, 2025
-- =====================================================

-- Agregar columnas de tema a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark', 'elegant', 'modern', 'vibrant')),
ADD COLUMN IF NOT EXISTS navbar_style TEXT DEFAULT 'solid' CHECK (navbar_style IN ('transparent', 'solid')),
ADD COLUMN IF NOT EXISTS theme_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear índice para búsquedas por tema
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_theme ON public.profiles(preferred_theme);
CREATE INDEX IF NOT EXISTS idx_profiles_navbar_style ON public.profiles(navbar_style);

-- Función para actualizar theme_updated_at automáticamente
CREATE OR REPLACE FUNCTION update_theme_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.preferred_theme IS DISTINCT FROM NEW.preferred_theme OR 
       OLD.navbar_style IS DISTINCT FROM NEW.navbar_style THEN
        NEW.theme_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp cuando cambie el tema
DROP TRIGGER IF EXISTS trigger_update_theme_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_theme_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_timestamp();

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.preferred_theme IS 'Tema visual preferido del usuario: light, dark, elegant, modern, vibrant';
COMMENT ON COLUMN public.profiles.navbar_style IS 'Estilo de navegación preferido: transparent, solid';
COMMENT ON COLUMN public.profiles.theme_updated_at IS 'Timestamp de la última actualización de preferencias de tema';
