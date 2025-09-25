-- Verificar si la tabla 'reports' existe en Supabase
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura actual de la tabla reports
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'reports' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Agregar columna reporter_user_id si no existe (para compatibilidad)
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS reporter_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reports_reporter_user_id ON public.reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON public.reports(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

-- Habilitar RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Las políticas RLS ya existen, no es necesario crearlas de nuevo

-- Verificar que la tabla profiles tiene las columnas necesarias
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('is_blocked', 'blocked_reason', 'blocked_at', 'suspension_end_date')
ORDER BY column_name;

-- Si no existen las columnas de bloqueo en profiles, agregarlas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_reason text,
ADD COLUMN IF NOT EXISTS blocked_at timestamptz,
ADD COLUMN IF NOT EXISTS suspension_end_date timestamptz;
