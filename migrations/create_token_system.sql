-- =====================================================
-- MIGRACIÓN: Sistema completo de tokens
-- =====================================================

-- TABLE: tokens (catálogo de tipos de tokens)
CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_code VARCHAR(50) UNIQUE NOT NULL,
    token_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_value DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: user_tokens (tokens que posee cada usuario)
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    last_earned_at TIMESTAMPTZ,
    last_spent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

-- TABLE: user_token_balances (vista materializada de balances)
CREATE TABLE IF NOT EXISTS public.user_token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_code VARCHAR(50) NOT NULL,
    current_balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, token_code)
);

-- Triggers para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at_tokens()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tokens
DROP TRIGGER IF EXISTS trg_set_updated_at_tokens ON public.tokens;
CREATE TRIGGER trg_set_updated_at_tokens
BEFORE UPDATE ON public.tokens
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_tokens();

-- Triggers para user_tokens
DROP TRIGGER IF EXISTS trg_set_updated_at_user_tokens ON public.user_tokens;
CREATE TRIGGER trg_set_updated_at_user_tokens
BEFORE UPDATE ON public.user_tokens
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_tokens();

-- Triggers para user_token_balances
DROP TRIGGER IF EXISTS trg_set_updated_at_user_token_balances ON public.user_token_balances;
CREATE TRIGGER trg_set_updated_at_user_token_balances
BEFORE UPDATE ON public.user_token_balances
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_tokens();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tokens_token_code ON public.tokens(token_code);
CREATE INDEX IF NOT EXISTS idx_tokens_is_active ON public.tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token_id ON public.user_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_quantity ON public.user_tokens(quantity);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON public.user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_token_code ON public.user_token_balances(token_code);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_current_balance ON public.user_token_balances(current_balance);

-- RLS (Row Level Security)
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;

-- Políticas para tokens (solo lectura para usuarios)
CREATE POLICY "Users can view active tokens" ON public.tokens
    FOR SELECT USING (is_active = TRUE);

-- Políticas para user_tokens
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_token_balances
CREATE POLICY "Users can view their own token balances" ON public.user_token_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own token balances" ON public.user_token_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Insertar tokens básicos del sistema
INSERT INTO public.tokens (token_code, token_name, description, base_value, is_active) VALUES
('CMPXSINGLE01', 'Tokens Single', 'Tokens para usuarios individuales', 1.00, TRUE),
('CMPXPAIR01', 'Tokens Pareja', 'Tokens para parejas', 1.50, TRUE)
ON CONFLICT (token_code) DO NOTHING;

COMMIT;
