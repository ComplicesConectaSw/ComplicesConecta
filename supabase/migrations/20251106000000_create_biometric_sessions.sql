-- Migration: Create biometric_sessions table
-- Created: 2025-11-06
-- Description: Tabla para gestionar sesiones de autenticación biométrica usando WebAuthn

CREATE TABLE IF NOT EXISTS public.biometric_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    session_type TEXT NOT NULL, -- 'fingerprint', 'face', 'biometric'
    device_id TEXT,
    credential_id TEXT,
    public_key TEXT,
    confidence NUMERIC(3, 2), -- 0.00 a 1.00
    success BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT biometric_sessions_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_user_id ON public.biometric_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_session_id ON public.biometric_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_is_active ON public.biometric_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_expires_at ON public.biometric_sessions(expires_at);

-- RLS (Row Level Security)
ALTER TABLE public.biometric_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propias sesiones biométricas
CREATE POLICY "Users can view their own biometric sessions"
    ON public.biometric_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric sessions"
    ON public.biometric_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biometric sessions"
    ON public.biometric_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biometric sessions"
    ON public.biometric_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE public.biometric_sessions IS 'Sesiones de autenticación biométrica usando WebAuthn API';
COMMENT ON COLUMN public.biometric_sessions.session_id IS 'ID único de la sesión biométrica';
COMMENT ON COLUMN public.biometric_sessions.session_type IS 'Tipo de autenticación: fingerprint, face, biometric';
COMMENT ON COLUMN public.biometric_sessions.credential_id IS 'ID de la credencial WebAuthn';
COMMENT ON COLUMN public.biometric_sessions.confidence IS 'Nivel de confianza de la autenticación (0.00 a 1.00)';
COMMENT ON COLUMN public.biometric_sessions.expires_at IS 'Fecha de expiración de la sesión';

