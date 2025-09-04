-- Migración para Sistema de Tokens CMPX
-- Fecha: 2025-09-03
-- Descripción: Tablas para gestionar balances de tokens y recompensas por referidos

-- Tabla de balances de tokens por usuario
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    cmpx_balance INTEGER DEFAULT 0 CHECK (cmpx_balance >= 0),
    monthly_earned INTEGER DEFAULT 0 CHECK (monthly_earned >= 0),
    last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referral_code TEXT NOT NULL UNIQUE,
    referred_by TEXT,
    total_referrals INTEGER DEFAULT 0 CHECK (total_referrals >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de recompensas por referidos
CREATE TABLE IF NOT EXISTS referral_rewards (
    id TEXT PRIMARY KEY,
    inviter_id TEXT NOT NULL,
    invited_id TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('referral_bonus', 'welcome_bonus')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_referral_code ON user_token_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_referred_by ON user_token_balances(referred_by);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_inviter_id ON referral_rewards(inviter_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_invited_id ON referral_rewards(invited_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_timestamp ON referral_rewards(timestamp);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_token_balances_updated_at 
    BEFORE UPDATE ON user_token_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para procesar recompensas por referidos (transaccional)
CREATE OR REPLACE FUNCTION process_referral_reward(
    inviter_id TEXT,
    new_user_id TEXT,
    new_user_referral_code TEXT,
    referral_reward INTEGER,
    welcome_bonus INTEGER,
    monthly_limit INTEGER,
    current_monthly_earned INTEGER
)
RETURNS VOID AS $$
DECLARE
    new_monthly_earned INTEGER;
BEGIN
    -- Calcular nuevo monthly_earned
    new_monthly_earned := current_monthly_earned + referral_reward;
    
    -- Verificar límite mensual
    IF new_monthly_earned > monthly_limit THEN
        RAISE EXCEPTION 'Límite mensual excedido: % > %', new_monthly_earned, monthly_limit;
    END IF;
    
    -- Actualizar invitador
    UPDATE user_token_balances 
    SET 
        cmpx_balance = cmpx_balance + referral_reward,
        monthly_earned = new_monthly_earned,
        total_referrals = total_referrals + 1,
        last_reset_date = CASE 
            WHEN EXTRACT(MONTH FROM last_reset_date) != EXTRACT(MONTH FROM NOW()) 
                OR EXTRACT(YEAR FROM last_reset_date) != EXTRACT(YEAR FROM NOW())
            THEN NOW()
            ELSE last_reset_date
        END
    WHERE user_id = inviter_id;
    
    -- Insertar o actualizar nuevo usuario
    INSERT INTO user_token_balances (
        user_id, 
        cmpx_balance, 
        referral_code, 
        referred_by
    ) VALUES (
        new_user_id, 
        welcome_bonus, 
        new_user_referral_code, 
        inviter_id
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        cmpx_balance = user_token_balances.cmpx_balance + welcome_bonus,
        referred_by = COALESCE(user_token_balances.referred_by, inviter_id);
        
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION get_token_system_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', COUNT(*),
        'total_cmpx', SUM(cmpx_balance),
        'total_referrals', SUM(total_referrals),
        'active_users_this_month', COUNT(*) FILTER (
            WHERE EXTRACT(MONTH FROM last_reset_date) = EXTRACT(MONTH FROM NOW())
            AND EXTRACT(YEAR FROM last_reset_date) = EXTRACT(YEAR FROM NOW())
            AND monthly_earned > 0
        )
    ) INTO result
    FROM user_token_balances;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de prueba para desarrollo
INSERT INTO user_token_balances (
    user_id, 
    cmpx_balance, 
    monthly_earned, 
    referral_code, 
    total_referrals
) VALUES (
    'demo-user-1', 
    150, 
    100, 
    'CMPXDEMO01', 
    2
) ON CONFLICT (user_id) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE user_token_balances IS 'Balances de tokens CMPX por usuario con sistema de referidos';
COMMENT ON TABLE referral_rewards IS 'Historial de recompensas por referidos y bonos de bienvenida';
COMMENT ON FUNCTION process_referral_reward IS 'Procesa recompensas por referidos de forma transaccional';
COMMENT ON FUNCTION get_token_system_stats IS 'Obtiene estadísticas generales del sistema de tokens';
