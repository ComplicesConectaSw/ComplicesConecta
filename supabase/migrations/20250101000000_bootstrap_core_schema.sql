-- =====================================================
-- MIGRACIÓN MAESTRA: Bootstrap de tablas y columnas críticas
-- Fecha: 2025-11-29 09:00:00
-- Objetivo: Garantizar que todos los entornos locales/minimales tengan
--           las tablas, columnas, índices y RLS básicos antes de las
--           migraciones incrementales.
-- =====================================================

-- 0. Extensiones indispensables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================
-- 1. Tablas base de configuración y roles
-- =====================================================

CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin', 'moderator', 'support')),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- Helper para verificar roles de staff (admin / superadmin / moderator)
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin','superadmin','moderator')
    );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- 2. Ajustes sobre profiles y couple_profiles
-- =====================================================

-- Crear tabla profiles si no existe (estructura mínima compatible)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles
            ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

        CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
    ELSE
        RAISE NOTICE '⚠️ Tabla profiles no existe; se omite ajuste de is_demo en bootstrap.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'couple_profiles'
        ) THEN
            ALTER TABLE couple_profiles
                ADD COLUMN IF NOT EXISTS partner_1_id UUID REFERENCES profiles(id),
                ADD COLUMN IF NOT EXISTS partner_2_id UUID REFERENCES profiles(id),
                ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'FROZEN_DISPUTE', 'DISSOLVED')),
                ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();
        ELSE
            CREATE TABLE couple_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES auth.users(id),
                partner_1_id UUID REFERENCES profiles(id),
                partner_2_id UUID REFERENCES profiles(id),
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                is_demo BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabla profiles no existe; se omite bootstrap de couple_profiles.';
    END IF;
END $$;

-- =====================================================
-- 3. Tablas blockchain (wallets, claims, NFTs, staking, transacciones)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address VARCHAR(42) NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_wallet UNIQUE(user_id, network)
);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network);

CREATE TABLE IF NOT EXISTS testnet_token_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_claimed BIGINT NOT NULL DEFAULT 0,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_hash VARCHAR(66)
);
ALTER TABLE testnet_token_claims
    ADD COLUMN IF NOT EXISTS wallet_address TEXT,
    ADD COLUMN IF NOT EXISTS network TEXT DEFAULT 'mumbai',
    ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'CMPX';
CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_user ON testnet_token_claims(user_id);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testnet_token_claims'
          AND column_name = 'wallet_address'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_wallet ON testnet_token_claims(wallet_address);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS daily_token_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_date DATE NOT NULL,
    amount_claimed BIGINT NOT NULL DEFAULT 0,
    wallet_address TEXT,
    transaction_hash VARCHAR(66),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_daily_claim UNIQUE(user_id, claim_date)
);
ALTER TABLE daily_token_claims
    ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'CMPX';
CREATE INDEX IF NOT EXISTS idx_daily_token_claims_user_date ON daily_token_claims(user_id, claim_date);
CREATE INDEX IF NOT EXISTS idx_daily_token_claims_wallet ON daily_token_claims(wallet_address);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'daily_token_claims'
          AND column_name = 'token_type'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_daily_token_claims_token_type ON daily_token_claims(token_type);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id BIGINT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
    is_couple BOOLEAN NOT NULL DEFAULT FALSE,
    partner_address TEXT,
    contract_address TEXT DEFAULT '0x0000000000000000000000000000000000000000',
    network TEXT NOT NULL DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_nfts
    ADD COLUMN IF NOT EXISTS is_staked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS staked_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS couple_nft_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id BIGINT NOT NULL,
    partner1_address TEXT NOT NULL,
    partner2_address TEXT NOT NULL,
    initiator_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    consent1_timestamp TIMESTAMPTZ,
    consent2_timestamp TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','minted','cancelled','expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    blockchain_status TEXT DEFAULT 'pending' CHECK (blockchain_status IN ('pending','minting','minted','failed')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nft_staking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL,
    nft_token_id BIGINT NOT NULL,
    staking_contract TEXT NOT NULL,
    staked_at TIMESTAMPTZ DEFAULT NOW(),
    vesting_period_days INTEGER NOT NULL,
    rarity_multiplier INTEGER NOT NULL DEFAULT 100,
    last_claim_at TIMESTAMPTZ,
    total_rewards_claimed BIGINT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    network TEXT NOT NULL DEFAULT 'mumbai'
);
ALTER TABLE nft_staking
    ADD COLUMN IF NOT EXISTS is_staked BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS token_staking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL,
    amount_staked BIGINT NOT NULL,
    staking_contract TEXT NOT NULL,
    staked_at TIMESTAMPTZ DEFAULT NOW(),
    vesting_period_days INTEGER NOT NULL,
    last_claim_at TIMESTAMPTZ,
    total_rewards_claimed BIGINT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    network TEXT NOT NULL DEFAULT 'mumbai'
);
ALTER TABLE token_staking
    ADD COLUMN IF NOT EXISTS is_staked BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    amount BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
    network TEXT NOT NULL DEFAULT 'mumbai',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- RLS para tablas blockchain
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testnet_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_nft_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Tablas legales y de consentimiento
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        CREATE TABLE IF NOT EXISTS user_consents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            document_path TEXT NOT NULL,
            consent_type TEXT NOT NULL,
            ip_address INET NOT NULL,
            user_agent TEXT,
            consent_text_hash TEXT NOT NULL,
            consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            revoked_at TIMESTAMPTZ,
            version TEXT NOT NULL DEFAULT '1.0',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON user_consents(user_id, consent_type) WHERE is_active = TRUE;
    ELSE
        RAISE NOTICE '⚠️ Tabla profiles no existe; se omite tabla user_consents en bootstrap.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'couple_profiles'
    ) THEN
        CREATE TABLE IF NOT EXISTS couple_agreements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            couple_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
            partner_1_id UUID NOT NULL REFERENCES profiles(id),
            partner_2_id UUID NOT NULL REFERENCES profiles(id),
            partner_1_signature BOOLEAN NOT NULL DEFAULT FALSE,
            partner_2_signature BOOLEAN NOT NULL DEFAULT FALSE,
            status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','DISPUTED','DISSOLVED','FORFEITED')),
            agreement_hash TEXT NOT NULL,
            signed_at TIMESTAMPTZ,
            dispute_deadline TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_couple_agreements_status ON couple_agreements(status, dispute_deadline);
    ELSE
        RAISE NOTICE '⚠️ Tablas profiles/couple_profiles no existen; se omite couple_agreements en bootstrap.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'couple_agreements'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'couple_disputes'
        ) THEN
            ALTER TABLE couple_disputes
                ADD COLUMN IF NOT EXISTS couple_agreement_id UUID REFERENCES couple_agreements(id) ON DELETE CASCADE,
                ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couple_profiles(id) ON DELETE CASCADE,
                ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES profiles(id),
                ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
                ADD COLUMN IF NOT EXISTS tokens_in_dispute JSONB,
                ADD COLUMN IF NOT EXISTS nfts_in_dispute JSONB,
                ADD COLUMN IF NOT EXISTS resolution_type TEXT,
                ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS status TEXT,
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

            ALTER TABLE couple_disputes
                ALTER COLUMN initiated_by SET NOT NULL,
                ALTER COLUMN dispute_reason SET NOT NULL;
        ELSE
            CREATE TABLE couple_disputes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                couple_agreement_id UUID NOT NULL REFERENCES couple_agreements(id) ON DELETE CASCADE,
                couple_id UUID REFERENCES couple_profiles(id) ON DELETE CASCADE,
                initiated_by UUID NOT NULL REFERENCES profiles(id),
                dispute_reason TEXT NOT NULL,
                tokens_in_dispute JSONB,
                nfts_in_dispute JSONB,
                resolution_type TEXT CHECK (resolution_type IN ('AGREEMENT','ADMIN_FORFEIT','MANUAL')),
                deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
                status TEXT NOT NULL DEFAULT 'PENDING_AGREEMENT'
                    CHECK (status IN ('PENDING_AGREEMENT','RESOLVED_TRANSFERRED','EXPIRED_FORFEITED')),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabla couple_agreements no existe; se omite bootstrap de couple_disputes.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'couple_disputes'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_couple_disputes_couple ON couple_disputes(couple_id, status);
        CREATE INDEX IF NOT EXISTS idx_couple_disputes_deadline ON couple_disputes(deadline_at, status);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'couple_disputes'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        CREATE TABLE IF NOT EXISTS frozen_assets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            dispute_id UUID NOT NULL REFERENCES couple_disputes(id) ON DELETE CASCADE,
            asset_type TEXT NOT NULL,
            asset_id TEXT,
            amount NUMERIC,
            is_frozen BOOLEAN NOT NULL DEFAULT TRUE,
            frozen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            unfrozen_at TIMESTAMPTZ,
            original_owner_id UUID NOT NULL REFERENCES profiles(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_frozen_assets_owner ON frozen_assets(original_owner_id, asset_type);
    ELSE
        RAISE NOTICE '⚠️ Tablas couple_disputes/profiles no existen; se omite frozen_assets en bootstrap.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_consents'
    ) THEN
        EXECUTE 'ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_agreements'
    ) THEN
        EXECUTE 'ALTER TABLE couple_agreements ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_disputes'
    ) THEN
        EXECUTE 'ALTER TABLE couple_disputes ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'frozen_assets'
    ) THEN
        EXECUTE 'ALTER TABLE frozen_assets ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- =====================================================
-- 5. Invitaciones, galerías y configuración
-- =====================================================

CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT,
    template_content TEXT,
    invitation_type TEXT,
    name TEXT,
    content TEXT,
    type TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID,
    gallery_owner_id UUID,
    status TEXT DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner ON gallery_permissions(gallery_owner_id);

-- =====================================================
-- 6. Analytics y tablas de stories
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'user_behavior',
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'System can insert analytics events') THEN
        CREATE POLICY "System can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (TRUE);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS story_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS avanzadas (propietarios + staff)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_wallets'
    ) THEN
        DROP POLICY IF EXISTS own_user_wallets ON user_wallets;
        CREATE POLICY own_user_wallets ON user_wallets
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testnet_token_claims'
    ) THEN
        DROP POLICY IF EXISTS own_testnet_token_claims ON testnet_token_claims;
        CREATE POLICY own_testnet_token_claims ON testnet_token_claims
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_token_claims'
    ) THEN
        DROP POLICY IF EXISTS own_daily_token_claims ON daily_token_claims;
        CREATE POLICY own_daily_token_claims ON daily_token_claims
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blockchain_transactions'
    ) THEN
        DROP POLICY IF EXISTS own_blockchain_transactions ON blockchain_transactions;
        CREATE POLICY own_blockchain_transactions ON blockchain_transactions
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_events'
    ) THEN
        DROP POLICY IF EXISTS own_analytics_events ON analytics_events;
        CREATE POLICY own_analytics_events ON analytics_events
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_consents'
    ) THEN
        DROP POLICY IF EXISTS own_user_consents ON user_consents;
        CREATE POLICY own_user_consents ON user_consents
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_nfts'
    ) THEN
        DROP POLICY IF EXISTS own_user_nfts ON user_nfts;
        CREATE POLICY own_user_nfts ON user_nfts
            FOR ALL USING (
                owner_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
            )
            WITH CHECK (
                owner_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
            );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_nft_requests'
    ) THEN
        DROP POLICY IF EXISTS own_couple_nft_requests ON couple_nft_requests;
        CREATE POLICY own_couple_nft_requests ON couple_nft_requests
            FOR ALL USING (
                initiator_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
                OR partner1_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
                OR partner2_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
            )
            WITH CHECK (
                initiator_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
                OR partner1_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
                OR partner2_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
            );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'nft_staking'
    ) THEN
        DROP POLICY IF EXISTS own_nft_staking ON nft_staking;
        CREATE POLICY own_nft_staking ON nft_staking
            FOR ALL USING (user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()))
            WITH CHECK (user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'token_staking'
    ) THEN
        DROP POLICY IF EXISTS own_token_staking ON token_staking;
        CREATE POLICY own_token_staking ON token_staking
            FOR ALL USING (user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()))
            WITH CHECK (user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_agreements'
    ) THEN
        DROP POLICY IF EXISTS own_couple_agreements ON couple_agreements;
        CREATE POLICY own_couple_agreements ON couple_agreements
            FOR ALL USING (partner_1_id = auth.uid() OR partner_2_id = auth.uid())
            WITH CHECK (partner_1_id = auth.uid() OR partner_2_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_disputes'
    ) THEN
        DROP POLICY IF EXISTS own_couple_disputes ON couple_disputes;
        CREATE POLICY own_couple_disputes ON couple_disputes
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM couple_agreements ca
                    WHERE ca.id = couple_disputes.couple_agreement_id
                      AND (ca.partner_1_id = auth.uid() OR ca.partner_2_id = auth.uid())
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'couple_disputes'
    ) THEN
        DROP POLICY IF EXISTS staff_couple_disputes ON couple_disputes;
        CREATE POLICY staff_couple_disputes ON couple_disputes
            FOR ALL USING (is_admin_or_moderator())
            WITH CHECK (is_admin_or_moderator());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'frozen_assets'
    ) THEN
        DROP POLICY IF EXISTS own_frozen_assets ON frozen_assets;
        CREATE POLICY own_frozen_assets ON frozen_assets
            FOR ALL USING (original_owner_id = auth.uid())
            WITH CHECK (original_owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'frozen_assets'
    ) THEN
        DROP POLICY IF EXISTS staff_frozen_assets ON frozen_assets;
        CREATE POLICY staff_frozen_assets ON frozen_assets
            FOR ALL USING (is_admin_or_moderator())
            WITH CHECK (is_admin_or_moderator());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gallery_permissions'
    ) THEN
        DROP POLICY IF EXISTS own_gallery_permissions ON gallery_permissions;
        CREATE POLICY own_gallery_permissions ON gallery_permissions
            FOR ALL USING (gallery_owner_id = auth.uid())
            WITH CHECK (gallery_owner_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'story_likes') THEN
        DROP POLICY IF EXISTS story_likes_access ON story_likes;
        CREATE POLICY story_likes_access ON story_likes
            FOR ALL USING (TRUE)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'story_comments') THEN
        DROP POLICY IF EXISTS story_comments_access ON story_comments;
        CREATE POLICY story_comments_access ON story_comments
            FOR ALL USING (TRUE)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'story_shares') THEN
        DROP POLICY IF EXISTS story_shares_access ON story_shares;
        CREATE POLICY story_shares_access ON story_shares
            FOR ALL USING (TRUE)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'user_wallets','blockchain_transactions','couple_agreements','couple_disputes',
        'frozen_assets','user_consents','user_nfts','couple_nft_requests','analytics_events'
    ] LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('DROP POLICY IF EXISTS staff_full_%1$I ON %1$I;', tbl);
            EXECUTE format('
                CREATE POLICY staff_full_%1$I ON %1$I
                    FOR ALL USING (is_admin_or_moderator())
                    WITH CHECK (is_admin_or_moderator());
            ', tbl);
        END IF;
    END LOOP;
END $$;


-- =====================================================
-- 7. Seeds mínimos para app_config
-- =====================================================

INSERT INTO app_config(key, value, description)
VALUES
    ('DISSOLUTION_GRACE_PERIOD_HOURS', '72', 'Horas de gracia para resolver disputas de pareja'),
    ('DISSOLUTION_CRON_ENABLED', 'true', 'Procesamiento automático de disputas expiradas')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- =====================================================
-- 8. Verificación final
-- =====================================================

DO $$
DECLARE
    total_tables INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'user_wallets','testnet_token_claims','daily_token_claims','user_nfts','couple_nft_requests',
        'nft_staking','token_staking','blockchain_transactions','user_consents','couple_agreements',
        'couple_disputes','frozen_assets','invitation_templates','gallery_permissions','analytics_events',
        'story_likes','story_comments','story_shares','app_config','user_roles'
      );

    RAISE NOTICE '✅ Bootstrap ejecutado. Tablas presentes: %', total_tables;
END $$;
