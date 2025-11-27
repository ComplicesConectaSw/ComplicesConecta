-- =====================================================
-- SCRIPT FINAL PARA SUPABASE - EJECUTAR EN SQL EDITOR
-- ComplicesConecta v3.7.0 - Blockchain Tables
-- =====================================================

-- PASO 1: Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS trigger_update_club_ratings ON club_reviews;

-- PASO 2: Crear tablas básicas sin conflictos
CREATE TABLE IF NOT EXISTS couple_nft_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id BIGINT NOT NULL,
    partner1_address TEXT NOT NULL,
    partner2_address TEXT NOT NULL,
    initiator_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    consent1_timestamp TIMESTAMPTZ,
    consent2_timestamp TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id BIGINT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    is_couple BOOLEAN NOT NULL DEFAULT FALSE,
    partner_address TEXT,
    contract_address TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    network TEXT NOT NULL DEFAULT 'mumbai',
    name TEXT,
    description TEXT,
    image_url TEXT,
    is_staked BOOLEAN DEFAULT FALSE,
    staked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PASO 3: Actualizar daily_token_claims existente
DO $$ 
BEGIN
    -- Agregar token_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'daily_token_claims' AND column_name = 'token_type') THEN
        ALTER TABLE daily_token_claims ADD COLUMN token_type TEXT DEFAULT 'CMPX';
    END IF;
    
    -- Agregar network si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'daily_token_claims' AND column_name = 'network') THEN
        ALTER TABLE daily_token_claims ADD COLUMN network TEXT DEFAULT 'mumbai';
    END IF;
END $$;

-- PASO 4: Actualizar testnet_token_claims existente
DO $$ 
BEGIN
    -- Agregar wallet_address si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'wallet_address') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN wallet_address TEXT;
    END IF;
    
    -- Agregar network si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'network') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN network TEXT DEFAULT 'mumbai';
    END IF;
    
    -- Agregar token_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'token_type') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN token_type TEXT DEFAULT 'CMPX';
    END IF;
END $$;

-- PASO 5: Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_partner1 ON couple_nft_requests(partner1_address);
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_partner2 ON couple_nft_requests(partner2_address);
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_status ON couple_nft_requests(status);

CREATE INDEX IF NOT EXISTS idx_user_nfts_owner ON user_nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_user_nfts_token_id ON user_nfts(token_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_couple ON user_nfts(is_couple);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);

CREATE INDEX IF NOT EXISTS idx_daily_token_claims_user_date ON daily_token_claims(user_id, claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_user ON testnet_token_claims(user_id);

-- PASO 6: Habilitar RLS
ALTER TABLE couple_nft_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE testnet_token_claims ENABLE ROW LEVEL SECURITY;

-- PASO 7: Crear políticas básicas
DROP POLICY IF EXISTS "Users can manage their own wallets" ON user_wallets;
CREATE POLICY "Users can manage their own wallets" ON user_wallets
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their daily claims" ON daily_token_claims;
CREATE POLICY "Users can view their daily claims" ON daily_token_claims
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their testnet claims" ON testnet_token_claims;
CREATE POLICY "Users can view their testnet claims" ON testnet_token_claims
    FOR SELECT USING (auth.uid() = user_id);

-- PASO 8: Crear función básica para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Crear triggers básicos
DROP TRIGGER IF EXISTS trigger_couple_nft_requests_updated_at ON couple_nft_requests;
CREATE TRIGGER trigger_couple_nft_requests_updated_at
    BEFORE UPDATE ON couple_nft_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_nfts_updated_at ON user_nfts;
CREATE TRIGGER trigger_user_nfts_updated_at
    BEFORE UPDATE ON user_nfts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER trigger_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- VERIFICACIÓN FINAL
SELECT 'SCRIPT EJECUTADO EXITOSAMENTE - TABLAS BLOCKCHAIN LISTAS' as resultado;
