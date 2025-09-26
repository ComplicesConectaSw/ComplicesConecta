/* Limpiar y recrear tabla user_tokens con estructura correcta
   Esta migración elimina la tabla existente y la recrea sin token_id */

-- Eliminar trigger existente (buscar todos los posibles nombres)
DROP TRIGGER IF EXISTS create_user_tokens_trigger ON auth.users;
DROP TRIGGER IF EXISTS trigger_create_user_tokens ON auth.users;

-- Eliminar función existente con CASCADE para eliminar dependencias
DROP FUNCTION IF EXISTS create_user_tokens() CASCADE;

-- Eliminar tabla existente (esto eliminará todos los datos)
DROP TABLE IF EXISTS public.user_tokens CASCADE;

-- Recrear tabla con estructura correcta (sin token_id)
CREATE TABLE public.user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance INTEGER DEFAULT 0 NOT NULL,
    gtk_balance INTEGER DEFAULT 0 NOT NULL,
    cmpx_staked INTEGER DEFAULT 0 NOT NULL,
    monthly_earned INTEGER DEFAULT 0 NOT NULL,
    monthly_limit INTEGER DEFAULT 500 NOT NULL,
    last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES auth.users(id),
    total_referrals INTEGER DEFAULT 0 NOT NULL,
    world_id_verified BOOLEAN DEFAULT FALSE NOT NULL,
    world_id_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_user_tokens UNIQUE(user_id),
    CONSTRAINT valid_balances CHECK (cmpx_balance >= 0 AND gtk_balance >= 0 AND cmpx_staked >= 0),
    CONSTRAINT valid_monthly CHECK (monthly_earned >= 0 AND monthly_earned <= monthly_limit)
);

-- Recrear función generate_referral_code con mejor lógica de unicidad
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    counter INTEGER := 0;
    base_code TEXT;
BEGIN
    -- Generar código base de 8 caracteres del UUID
    base_code := UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', ''), 1, 8));
    
    LOOP
        -- En la primera iteración usar el código base, después agregar sufijo
        IF counter = 0 THEN
            code := base_code;
        ELSE
            code := base_code || LPAD(counter::TEXT, 2, '0');
        END IF;
        
        -- Verificar si ya existe
        IF NOT EXISTS (SELECT 1 FROM user_tokens WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        IF counter > 99 THEN
            -- Si llegamos aquí, usar timestamp para garantizar unicidad
            code := base_code || TO_CHAR(NOW(), 'SSMS');
            IF NOT EXISTS (SELECT 1 FROM user_tokens WHERE referral_code = code) THEN
                RETURN code;
            END IF;
            RAISE EXCEPTION 'No se pudo generar código de referido único después de 99 intentos';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Recrear función trigger
CREATE OR REPLACE FUNCTION create_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_tokens (
        user_id,
        referral_code,
        cmpx_balance,
        gtk_balance
    ) VALUES (
        NEW.id,
        generate_referral_code(NEW.id),
        0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear trigger
CREATE TRIGGER create_user_tokens_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_tokens();

-- Habilitar RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own tokens" ON public.user_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON public.user_tokens
    FOR UPDATE USING (auth.uid() = user_id);

-- Índices para rendimiento
CREATE INDEX idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX idx_user_tokens_referral_code ON public.user_tokens(referral_code);
CREATE INDEX idx_user_tokens_referred_by ON public.user_tokens(referred_by);

-- Comentarios
COMMENT ON TABLE public.user_tokens IS 'Tabla de tokens por usuario con balances CMPX y GTK';
COMMENT ON COLUMN public.user_tokens.referral_code IS 'Código único de referencia para el sistema de referidos';
