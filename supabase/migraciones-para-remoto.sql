-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: 2025-11-08 16:44:15
-- Version: 3.6.3
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que las tablas se crearon correctamente
-- 
-- =====================================================

-- =====================================================
-- MIGRACION: 20251106_09_create_cmpx_shop_system.sql
-- =====================================================

-- Migración: Shop CMPX Tokens + Comisión Galerías
-- Feature: Compra de tokens CMPX (1000 CMPX = 300 MXN), Comisión galerías 10%
-- Versión: 3.5.0
-- Fecha: 06 Nov 2025

-- =====================================================
-- 1. TABLA: cmpx_shop_packages (Paquetes de tokens)
-- =====================================================
CREATE TABLE IF NOT EXISTS cmpx_shop_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cmpx_amount INTEGER NOT NULL CHECK (cmpx_amount > 0),
  price_mxn NUMERIC(10,2) NOT NULL CHECK (price_mxn > 0),
  price_usd NUMERIC(10,2),
  bonus_cmpx INTEGER DEFAULT 0 CHECK (bonus_cmpx >= 0),
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar paquetes por defecto
INSERT INTO cmpx_shop_packages (name, cmpx_amount, price_mxn, bonus_cmpx, is_popular, display_order, description) VALUES
('Paquete Básico', 1000, 300.00, 0, false, 1, '1000 CMPX tokens'),
('Paquete Popular', 5000, 1400.00, 500, true, 2, '5000 CMPX + 500 bonus = 5500 CMPX'),
('Paquete Premium', 10000, 2500.00, 1500, false, 3, '10000 CMPX + 1500 bonus = 11500 CMPX'),
('Paquete VIP', 25000, 5500.00, 5000, false, 4, '25000 CMPX + 5000 bonus = 30000 CMPX')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_cmpx_shop_packages_active ON cmpx_shop_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cmpx_shop_packages_order ON cmpx_shop_packages(display_order);

-- =====================================================
-- 2. TABLA: cmpx_purchases (Compras de tokens)
-- =====================================================
CREATE TABLE IF NOT EXISTS cmpx_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES cmpx_shop_packages(id),
  
  -- Detalles de compra
  cmpx_amount INTEGER NOT NULL CHECK (cmpx_amount > 0),
  bonus_cmpx INTEGER DEFAULT 0 CHECK (bonus_cmpx >= 0),
  total_cmpx INTEGER NOT NULL CHECK (total_cmpx > 0), -- cmpx_amount + bonus_cmpx
  price_mxn NUMERIC(10,2) NOT NULL CHECK (price_mxn > 0),
  
  -- Stripe Payment
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  payment_method TEXT,
  
  -- Tokens otorgados
  tokens_awarded BOOLEAN DEFAULT false,
  tokens_awarded_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cmpx_purchases_user_id ON cmpx_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_cmpx_purchases_status ON cmpx_purchases(status);
CREATE INDEX IF NOT EXISTS idx_cmpx_purchases_payment_status ON cmpx_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_cmpx_purchases_stripe_payment_intent ON cmpx_purchases(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cmpx_purchases_created_at ON cmpx_purchases(created_at DESC);

-- =====================================================
-- 3. TABLA: gallery_commissions (Comisión galerías 10%)
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL, -- ID de la galería (puede ser post, photo, etc.)
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transacción
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('view', 'like', 'super_like', 'purchase', 'tip')),
  amount_cmpx INTEGER NOT NULL CHECK (amount_cmpx > 0),
  
  -- Comisión
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  commission_amount_cmpx INTEGER NOT NULL CHECK (commission_amount_cmpx >= 0),
  creator_amount_cmpx INTEGER NOT NULL CHECK (creator_amount_cmpx >= 0), -- 90% para el creador
  
  -- Pago
  creator_paid BOOLEAN DEFAULT false,
  creator_paid_at TIMESTAMPTZ,
  platform_received BOOLEAN DEFAULT false,
  platform_received_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_commissions_creator_id ON gallery_commissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_gallery_commissions_gallery_id ON gallery_commissions(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_commissions_creator_paid ON gallery_commissions(creator_paid) WHERE creator_paid = false;
CREATE INDEX IF NOT EXISTS idx_gallery_commissions_created_at ON gallery_commissions(created_at DESC);

-- =====================================================
-- FUNCIONES: Cálculo automático de comisiones
-- =====================================================

-- Función para calcular comisión de galería (10% plataforma, 90% creador)
CREATE OR REPLACE FUNCTION calculate_gallery_commission(
  p_amount_cmpx INTEGER,
  p_commission_percentage NUMERIC DEFAULT 10.00
) RETURNS TABLE (
  commission_amount INTEGER,
  creator_amount INTEGER
) AS $$
DECLARE
  commission INTEGER;
  creator_amount INTEGER;
BEGIN
  commission := FLOOR(p_amount_cmpx * (p_commission_percentage / 100.0));
  creator_amount := p_amount_cmpx - commission;
  
  RETURN QUERY SELECT commission, creator_amount;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar comisión de galería
CREATE OR REPLACE FUNCTION record_gallery_commission(
  p_gallery_id UUID,
  p_creator_id UUID,
  p_transaction_type TEXT,
  p_amount_cmpx INTEGER,
  p_commission_percentage NUMERIC DEFAULT 10.00
) RETURNS UUID AS $$
DECLARE
  commission_result RECORD;
  commission_id UUID;
BEGIN
  -- Calcular comisión
  SELECT * INTO commission_result
  FROM calculate_gallery_commission(p_amount_cmpx, p_commission_percentage);
  
  -- Crear registro de comisión
  INSERT INTO gallery_commissions (
    gallery_id,
    creator_id,
    transaction_type,
    amount_cmpx,
    commission_percentage,
    commission_amount_cmpx,
    creator_amount_cmpx
  ) VALUES (
    p_gallery_id,
    p_creator_id,
    p_transaction_type,
    p_amount_cmpx,
    p_commission_percentage,
    commission_result.commission_amount,
    commission_result.creator_amount
  )
  RETURNING id INTO commission_id;
  
  -- Otorgar tokens al creador (90%)
  UPDATE user_token_balances
  SET cmpx_balance = cmpx_balance + commission_result.creator_amount,
      updated_at = NOW()
  WHERE user_id = p_creator_id;
  
  -- Registrar transacción para el creador
  INSERT INTO token_transactions (
    user_id,
    transaction_type,
    token_type,
    amount,
    balance_after,
    description,
    metadata
  ) VALUES (
    p_creator_id,
    'earn',
    'cmpx',
    commission_result.creator_amount,
    (SELECT cmpx_balance FROM user_token_balances WHERE user_id = p_creator_id),
    'Comisión de galería (90%)',
    jsonb_build_object('gallery_id', p_gallery_id, 'transaction_type', p_transaction_type)
  );
  
  RETURN commission_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Otorgar tokens automáticamente
-- =====================================================

-- Trigger para otorgar tokens cuando se completa una compra
CREATE OR REPLACE FUNCTION award_cmpx_tokens_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el pago se completó y los tokens aún no se han otorgado
  IF NEW.payment_status = 'succeeded' AND NEW.status = 'completed' 
     AND OLD.payment_status != 'succeeded' 
     AND NEW.tokens_awarded = false THEN
    
    -- Otorgar tokens al usuario
    UPDATE user_token_balances
    SET cmpx_balance = cmpx_balance + NEW.total_cmpx,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Registrar transacción
    INSERT INTO token_transactions (
      user_id,
      transaction_type,
      token_type,
      amount,
      balance_after,
      description,
      metadata
    ) VALUES (
      NEW.user_id,
      'purchase',
      'cmpx',
      NEW.total_cmpx,
      (SELECT cmpx_balance FROM user_token_balances WHERE user_id = NEW.user_id),
      'Compra de tokens CMPX',
      jsonb_build_object('purchase_id', NEW.id, 'package_id', NEW.package_id)
    );
    
    -- Marcar tokens como otorgados
    NEW.tokens_awarded := true;
    NEW.tokens_awarded_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_cmpx_tokens_on_purchase
BEFORE UPDATE ON cmpx_purchases
FOR EACH ROW
EXECUTE FUNCTION award_cmpx_tokens_on_purchase();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- CMPX Shop Packages: Todos pueden ver paquetes activos
ALTER TABLE cmpx_shop_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active packages" ON cmpx_shop_packages;
CREATE POLICY "Anyone can view active packages"
  ON cmpx_shop_packages FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage packages" ON cmpx_shop_packages;
CREATE POLICY "Admins can manage packages"
  ON cmpx_shop_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- CMPX Purchases: Usuarios pueden ver sus propias compras
ALTER TABLE cmpx_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON cmpx_purchases;
CREATE POLICY "Users can view own purchases"
  ON cmpx_purchases FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own purchases" ON cmpx_purchases;
CREATE POLICY "Users can create own purchases"
  ON cmpx_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all purchases" ON cmpx_purchases;
CREATE POLICY "Admins can view all purchases"
  ON cmpx_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Gallery Commissions: Creadores pueden ver sus propias comisiones
ALTER TABLE gallery_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators can view own commissions" ON gallery_commissions;
CREATE POLICY "Creators can view own commissions"
  ON gallery_commissions FOR SELECT
  USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all commissions" ON gallery_commissions;
CREATE POLICY "Admins can view all commissions"
  ON gallery_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE cmpx_shop_packages IS 'Paquetes de tokens CMPX disponibles para compra (1000 CMPX = 300 MXN)';
COMMENT ON TABLE cmpx_purchases IS 'Compras de tokens CMPX con integración Stripe';
COMMENT ON TABLE gallery_commissions IS 'Comisiones de galerías: 10% plataforma, 90% creador';
COMMENT ON COLUMN gallery_commissions.commission_percentage IS 'Porcentaje de comisión para la plataforma (default 10%)';
COMMENT ON COLUMN gallery_commissions.creator_amount_cmpx IS 'Cantidad de tokens CMPX que recibe el creador (90%)';
COMMENT ON FUNCTION calculate_gallery_commission IS 'Calcula comisión de galería: 10% plataforma, 90% creador';
COMMENT ON FUNCTION record_gallery_commission IS 'Registra comisión y otorga tokens automáticamente al creador';



-- =====================================================
-- FIN MIGRACION: 20251106_09_create_cmpx_shop_system.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251106000000_create_biometric_sessions.sql
-- =====================================================

-- Migration: Create biometric_sessions table
-- Created: 2025-11-06
-- Description: Tabla para gestionar sesiones de autenticación biométrica usando WebAuthn

CREATE TABLE IF NOT EXISTS public.biometric_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar foreign key constraint solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'biometric_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE public.biometric_sessions
        ADD CONSTRAINT biometric_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_user_id ON public.biometric_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_session_id ON public.biometric_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_is_active ON public.biometric_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_expires_at ON public.biometric_sessions(expires_at);

-- RLS (Row Level Security)
ALTER TABLE public.biometric_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propias sesiones biométricas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'biometric_sessions' 
        AND policyname = 'Users can view their own biometric sessions'
    ) THEN
        CREATE POLICY "Users can view their own biometric sessions"
            ON public.biometric_sessions
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'biometric_sessions' 
        AND policyname = 'Users can insert their own biometric sessions'
    ) THEN
        CREATE POLICY "Users can insert their own biometric sessions"
            ON public.biometric_sessions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'biometric_sessions' 
        AND policyname = 'Users can update their own biometric sessions'
    ) THEN
        CREATE POLICY "Users can update their own biometric sessions"
            ON public.biometric_sessions
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'biometric_sessions' 
        AND policyname = 'Users can delete their own biometric sessions'
    ) THEN
        CREATE POLICY "Users can delete their own biometric sessions"
            ON public.biometric_sessions
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON TABLE public.biometric_sessions IS 'Sesiones de autenticación biométrica usando WebAuthn API';
COMMENT ON COLUMN public.biometric_sessions.session_id IS 'ID único de la sesión biométrica';
COMMENT ON COLUMN public.biometric_sessions.session_type IS 'Tipo de autenticación: fingerprint, face, biometric';
COMMENT ON COLUMN public.biometric_sessions.credential_id IS 'ID de la credencial WebAuthn';
COMMENT ON COLUMN public.biometric_sessions.confidence IS 'Nivel de confianza de la autenticación (0.00 a 1.00)';
COMMENT ON COLUMN public.biometric_sessions.expires_at IS 'Fecha de expiración de la sesión';



-- =====================================================
-- FIN MIGRACION: 20251106000000_create_biometric_sessions.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251106000001_create_app_logs.sql
-- =====================================================

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



-- =====================================================
-- FIN MIGRACION: 20251106000001_create_app_logs.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251106043953_add_first_last_name_to_profiles.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN: Agregar first_name y last_name a profiles
-- Fecha: 2025-11-06
-- Descripción: Agregar campos first_name y last_name necesarios para el registro
-- =====================================================

-- Agregar columna first_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100);
    END IF;
END $$;

-- Agregar columna last_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100);
    END IF;
END $$;

-- Migrar datos existentes: extraer first_name y last_name de name si existe
UPDATE profiles 
SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SPLIT_PART(name, ' ', 2)
        ELSE ''
    END
WHERE (first_name IS NULL OR first_name = '') 
  AND name IS NOT NULL 
  AND name != '';

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- Comentarios de las columnas
COMMENT ON COLUMN profiles.first_name IS 'Nombre del usuario (requerido para registro)';
COMMENT ON COLUMN profiles.last_name IS 'Apellido del usuario (requerido para registro)';

DO $$
BEGIN
    RAISE NOTICE '✅ Campos first_name y last_name agregados exitosamente a profiles';
    RAISE NOTICE '📊 Datos migrados desde name → first_name + last_name';
END $$;



-- =====================================================
-- FIN MIGRACION: 20251106043953_add_first_last_name_to_profiles.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251106043954_add_preferences_to_couple_profiles.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN: Agregar preferences a couple_profiles
-- Fecha: 2025-11-06
-- Descripción: Agregar campo preferences (JSONB) para almacenar preferencias de género,
--              orientación sexual, etc. necesarias para el registro de parejas
-- =====================================================

-- Agregar columna preferences si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'couple_profiles' 
        AND column_name = 'preferences'
    ) THEN
        ALTER TABLE couple_profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Crear índice GIN para búsquedas eficientes en JSONB
CREATE INDEX IF NOT EXISTS idx_couple_profiles_preferences ON couple_profiles USING GIN (preferences);

-- Comentario de la columna
COMMENT ON COLUMN couple_profiles.preferences IS 'Preferencias de la pareja (género, orientación sexual, etc.) almacenadas como JSON';

-- Estructura esperada del JSON preferences:
-- {
--   "partner1": {
--     "gender": "male" | "female",
--     "sexual_orientation": "heterosexual" | "gay" | "bisexual" | "lesbian" | "trans" | "other",
--     "interested_in": ["men", "women", "couples", "trans"]
--   },
--   "partner2": {
--     "gender": "male" | "female",
--     "sexual_orientation": "heterosexual" | "gay" | "bisexual" | "lesbian" | "trans" | "other",
--     "interested_in": ["men", "women", "couples", "trans"]
--   },
--   "couple_preferences": {
--     "interested_in": ["men", "women", "couples", "trans"],
--     "age_range": { "min": 18, "max": 65 },
--     "location_preferences": { "max_distance": 50 }
--   }
-- }

DO $$
BEGIN
    RAISE NOTICE '✅ Campo preferences agregado exitosamente a couple_profiles';
    RAISE NOTICE '📊 Índice GIN creado para búsquedas eficientes en preferences';
END $$;



-- =====================================================
-- FIN MIGRACION: 20251106043954_add_preferences_to_couple_profiles.sql
-- =====================================================

