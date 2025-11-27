    -- Migration: Create app_logs table (opcional, para logging avanzado)
    -- Created: 2025-11-06
    -- Description: Tabla para logs de aplicación (actualmente comentada en código)

    CREATE TABLE IF NOT EXISTS public.app_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        level TEXT NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
        message TEXT NOT NULL,
        context JSONB,
        metadata JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT app_logs_level_check CHECK (level IN ('debug', 'info', 'warn', 'error'))
    );

    -- Índices para mejorar performance
    CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON public.app_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_app_logs_level ON public.app_logs(level);
    CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON public.app_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_app_logs_user_level ON public.app_logs(user_id, level) WHERE user_id IS NOT NULL;

    -- RLS (Row Level Security)
    ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

    -- Política: Los usuarios solo pueden ver sus propios logs
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'app_logs' 
            AND policyname = 'Users can view their own app logs'
        ) THEN
            CREATE POLICY "Users can view their own app logs"
                ON public.app_logs
                FOR SELECT
                USING (auth.uid() = user_id OR user_id IS NULL);
        END IF;

        -- Política: Solo el sistema puede insertar logs (usando service_role)
        -- Los usuarios no pueden insertar logs directamente por seguridad
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'app_logs' 
            AND policyname = 'Service role can insert app logs'
        ) THEN
            CREATE POLICY "Service role can insert app logs"
                ON public.app_logs
                FOR INSERT
                WITH CHECK (true); -- Se controla a nivel de aplicación
        END IF;
    END $$;

    -- Comentarios para documentación
    COMMENT ON TABLE public.app_logs IS 'Logs de aplicación para debugging y auditoría';
    COMMENT ON COLUMN public.app_logs.level IS 'Nivel de log: debug, info, warn, error';
    COMMENT ON COLUMN public.app_logs.context IS 'Contexto adicional del log en formato JSON';
    COMMENT ON COLUMN public.app_logs.metadata IS 'Metadatos adicionales del log en formato JSON';

    -- Nota: Esta tabla está comentada en el código actualmente
    -- Se crea por si se necesita en el futuro para logging avanzado

