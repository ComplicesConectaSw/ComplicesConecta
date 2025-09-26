-- Corregir estructura de user_tokens para que coincida con el esquema actual
-- La migración 20250906_05_create_token_system.sql ya define la estructura correcta

-- Verificar si referral_code ya existe (debería estar en la migración base)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_tokens' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE user_tokens ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
END $$;

-- Crear función para generar códigos de referencia si no existe
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- Generar código de referencia basado en UUID (primeros 8 caracteres)
    RETURN UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', ''), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Actualizar registros existentes que no tengan referral_code
UPDATE user_tokens 
SET referral_code = generate_referral_code(user_id)
WHERE referral_code IS NULL;

-- Agregar constraint para que referral_code sea único (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_tokens_referral_code_unique'
    ) THEN
        ALTER TABLE user_tokens 
        ADD CONSTRAINT user_tokens_referral_code_unique 
        UNIQUE (referral_code);
    END IF;
END $$;

-- Comentario para documentar el cambio
COMMENT ON COLUMN user_tokens.referral_code IS 'Código único de referencia para el sistema de referidos';
