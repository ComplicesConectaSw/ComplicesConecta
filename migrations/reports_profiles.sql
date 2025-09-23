-- =====================================================
-- MIGRACIÓN: reports + profiles (alineado con TypeScript)
-- =====================================================

-- TABLE: reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('profile', 'story', 'post')),
    reported_content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
    resolution_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at_reports()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_reports ON public.reports;

CREATE TRIGGER trg_set_updated_at_reports
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_reports();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reports_reporter_user_id ON public.reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON public.reports(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

-- TABLE: profiles (campos de suspensión/bloqueo)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspension_end_date TIMESTAMPTZ;

-- Índices para campos de bloqueo
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_suspension_end_date ON public.profiles(suspension_end_date);

-- RLS (Row Level Security) para reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios reportes
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_user_id);

-- Política: Los usuarios pueden crear reportes
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

-- Política: Solo usuarios autenticados pueden actualizar reportes (simplificada)
CREATE POLICY "Authenticated users can update reports" ON public.reports
    FOR UPDATE USING (auth.uid() IS NOT NULL);

COMMIT;
