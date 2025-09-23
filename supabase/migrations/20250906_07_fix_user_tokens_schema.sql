-- Migración: Corregir esquema de user_tokens para sistema CMPX/GTK
-- Fecha: 23/09/2025
-- Descripción: Agregar columnas faltantes para tokens CMPX/GTK según especificación

-- Agregar columnas faltantes para el sistema de tokens CMPX/GTK
ALTER TABLE public.user_tokens 
ADD COLUMN IF NOT EXISTS cmpx_balance INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS gtk_balance INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS cmpx_staked INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS monthly_earned INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS monthly_limit INTEGER DEFAULT 500 NOT NULL,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS world_id_verified BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS world_id_claimed BOOLEAN DEFAULT FALSE NOT NULL;

-- Agregar constraints para validar balances (solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_cmpx_balances') THEN
        ALTER TABLE public.user_tokens 
        ADD CONSTRAINT valid_cmpx_balances CHECK (cmpx_balance >= 0 AND gtk_balance >= 0 AND cmpx_staked >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_monthly_limits') THEN
        ALTER TABLE public.user_tokens 
        ADD CONSTRAINT valid_monthly_limits CHECK (monthly_earned >= 0 AND monthly_earned <= monthly_limit);
    END IF;
END $$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_tokens_cmpx_balance ON public.user_tokens(cmpx_balance);
CREATE INDEX IF NOT EXISTS idx_user_tokens_gtk_balance ON public.user_tokens(gtk_balance);
CREATE INDEX IF NOT EXISTS idx_user_tokens_monthly_reset ON public.user_tokens(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_user_tokens_world_id ON public.user_tokens(world_id_verified);

-- Función para reset mensual de límites
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
    UPDATE public.user_tokens 
    SET 
        monthly_earned = 0,
        last_reset_date = NOW()
    WHERE last_reset_date < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_tokens_updated_at_trigger') THEN
        CREATE TRIGGER update_user_tokens_updated_at_trigger
            BEFORE UPDATE ON public.user_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_user_tokens_updated_at();
    END IF;
END $$;

COMMENT ON COLUMN public.user_tokens.cmpx_balance IS 'Balance de tokens CMPX (internos)';
COMMENT ON COLUMN public.user_tokens.gtk_balance IS 'Balance de tokens GTK (blockchain)';
COMMENT ON COLUMN public.user_tokens.cmpx_staked IS 'Tokens CMPX en staking';
COMMENT ON COLUMN public.user_tokens.monthly_earned IS 'Tokens ganados este mes (máx 500)';
COMMENT ON COLUMN public.user_tokens.monthly_limit IS 'Límite mensual de tokens por referidos';
COMMENT ON COLUMN public.user_tokens.total_referrals IS 'Total de referidos exitosos';
COMMENT ON COLUMN public.user_tokens.world_id_verified IS 'Usuario verificado con World ID';
COMMENT ON COLUMN public.user_tokens.world_id_claimed IS 'Bonus de World ID reclamado';
