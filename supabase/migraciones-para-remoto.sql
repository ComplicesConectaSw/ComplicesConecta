-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: 2025-11-26 20:21:27
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
-- MIGRACION: 20251121_create_user_consents_evidence.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN: Sistema de Consentimiento Dinámico + Protocolo de Divorcio Digital
-- Versión: v3.7.2 - Legal Tech Implementation
-- Fecha: 21 Noviembre 2025
-- Propósito: Evidencia legal + Protección de activos digitales
-- =====================================================

-- 1. TABLA DE CONSENTIMIENTOS POR CAPAS
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Identificación del documento/consentimiento
    document_path TEXT NOT NULL, -- ej: 'docs/legal/TERMS_OF_SERVICE.md'
    consent_type TEXT NOT NULL, -- 'TERMS', 'PRIVACY', 'LEY_OLIMPIA', 'WALLET_RISK', 'COUPLE_AGREEMENT'
    
    -- Evidencia legal
    ip_address INET NOT NULL,
    user_agent TEXT,
    consent_text_hash TEXT NOT NULL, -- Hash del texto exacto que aceptó
    
    -- Timestamps críticos
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = permanente
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    revoked_at TIMESTAMPTZ,
    
    -- Metadatos
    version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE ACUERDOS PRENUPCIALES DIGITALES
CREATE TABLE IF NOT EXISTS couple_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    
    -- Firmas duales requeridas
    partner_1_id UUID NOT NULL REFERENCES profiles(id),
    partner_2_id UUID NOT NULL REFERENCES profiles(id),
    partner_1_signature BOOLEAN NOT NULL DEFAULT false,
    partner_2_signature BOOLEAN NOT NULL DEFAULT false,
    
    -- Evidencia legal de cada firma
    partner_1_ip INET,
    partner_2_ip INET,
    partner_1_signed_at TIMESTAMPTZ,
    partner_2_signed_at TIMESTAMPTZ,
    
    -- Cláusulas de protección de activos
    asset_disposition_clause TEXT NOT NULL DEFAULT 'ADMIN_FORFEIT' 
        CHECK (asset_disposition_clause IN ('SPLIT_50_50', 'ADMIN_FORFEIT', 'CUSTOM')),
    
    -- Texto de la cláusula de muerte súbita
    death_clause_text TEXT NOT NULL DEFAULT 
        'En caso de disolución de la cuenta de pareja por conflicto no resuelto en 30 días, los activos digitales (Tokens/NFTs) no reclamados serán transferidos a la plataforma por concepto de "Gastos Administrativos de Cancelación" y la cuenta será eliminada.',
    
    -- Estados del acuerdo
    status TEXT NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'ACTIVE', 'DISPUTED', 'DISSOLVED', 'FORFEITED')),
    
    -- Fechas críticas para disputas
    signed_at TIMESTAMPTZ, -- Cuando ambos firmaron
    dispute_started_at TIMESTAMPTZ,
    dispute_deadline TIMESTAMPTZ, -- signed_at + 30 días
    
    -- Hash del acuerdo completo para evidencia
    agreement_hash TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE DISPUTAS Y RESOLUCIONES
CREATE TABLE IF NOT EXISTS couple_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_agreement_id UUID NOT NULL REFERENCES couple_agreements(id) ON DELETE CASCADE,
    
    -- Quién inició la disputa
    initiated_by UUID NOT NULL REFERENCES profiles(id),
    dispute_reason TEXT NOT NULL,
    
    -- Activos en disputa
    tokens_in_dispute JSONB, -- {cmpx: 1000, gtk: 500}
    nfts_in_dispute JSONB,   -- [nft_id1, nft_id2]
    
    -- Resolución
    resolution_type TEXT CHECK (resolution_type IN ('AGREEMENT', 'ADMIN_FORFEIT', 'MANUAL')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id), -- NULL = sistema automático
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ÍNDICES PARA PERFORMANCE Y CONSULTAS LEGALES
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type 
    ON user_consents(user_id, consent_type) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_consents_document 
    ON user_consents(document_path, consented_at DESC);

CREATE INDEX IF NOT EXISTS idx_couple_agreements_status 
    ON couple_agreements(status, dispute_deadline) 
    WHERE status IN ('ACTIVE', 'DISPUTED');

CREATE INDEX IF NOT EXISTS idx_couple_agreements_partners 
    ON couple_agreements(partner_1_id, partner_2_id);

CREATE INDEX IF NOT EXISTS idx_couple_disputes_deadline 
    ON couple_disputes(created_at) 
    WHERE resolution_type IS NULL;

-- 5. TRIGGERS PARA AUTOMATIZACIÓN LEGAL

-- Trigger: Auto-completar acuerdo cuando ambos firman
CREATE OR REPLACE FUNCTION complete_couple_agreement()
RETURNS TRIGGER AS $$
BEGIN
    -- Si ambos partners han firmado, activar el acuerdo
    IF NEW.partner_1_signature = true AND NEW.partner_2_signature = true THEN
        NEW.status = 'ACTIVE';
        NEW.signed_at = NOW();
        NEW.dispute_deadline = NOW() + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_complete_couple_agreement
    BEFORE UPDATE ON couple_agreements
    FOR EACH ROW
    EXECUTE FUNCTION complete_couple_agreement();

-- Trigger: Auto-forfeit después de 30 días de disputa
CREATE OR REPLACE FUNCTION auto_forfeit_expired_disputes()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la disputa expiró sin resolución, aplicar forfeit automático
    IF NEW.dispute_deadline < NOW() AND OLD.status = 'DISPUTED' THEN
        NEW.status = 'FORFEITED';
        
        -- Crear registro de disputa resuelta automáticamente
        INSERT INTO couple_disputes (
            couple_agreement_id,
            initiated_by,
            dispute_reason,
            resolution_type,
            resolved_at
        ) VALUES (
            NEW.id,
            NEW.partner_1_id, -- Arbitrario, fue resolución automática
            'Auto-forfeit por expiración de plazo (30 días)',
            'ADMIN_FORFEIT',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_forfeit_disputes
    BEFORE UPDATE ON couple_agreements
    FOR EACH ROW
    EXECUTE FUNCTION auto_forfeit_expired_disputes();

-- 6. FUNCIONES DE UTILIDAD LEGAL

-- Función: Obtener consentimientos activos de un usuario
CREATE OR REPLACE FUNCTION get_user_active_consents(p_user_id UUID)
RETURNS TABLE (
    consent_type TEXT,
    document_path TEXT,
    consented_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.consent_type,
        uc.document_path,
        uc.consented_at,
        uc.expires_at
    FROM user_consents uc
    WHERE uc.user_id = p_user_id 
      AND uc.is_active = true
      AND (uc.expires_at IS NULL OR uc.expires_at > NOW())
    ORDER BY uc.consented_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar si una pareja tiene acuerdo activo
CREATE OR REPLACE FUNCTION has_active_couple_agreement(p_couple_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    agreement_exists BOOLEAN := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM couple_agreements 
        WHERE couple_id = p_couple_id 
          AND status = 'ACTIVE'
          AND partner_1_signature = true 
          AND partner_2_signature = true
    ) INTO agreement_exists;
    
    RETURN agreement_exists;
END;
$$ LANGUAGE plpgsql;

-- 7. POLÍTICAS RLS PARA SEGURIDAD

-- RLS para user_consents: Solo el usuario puede ver sus consentimientos
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents" ON user_consents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" ON user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para couple_agreements: Solo los partners pueden ver sus acuerdos
ALTER TABLE couple_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own agreements" ON couple_agreements
    FOR SELECT USING (
        auth.uid() = partner_1_id OR 
        auth.uid() = partner_2_id
    );

CREATE POLICY "Partners can update own agreements" ON couple_agreements
    FOR UPDATE USING (
        auth.uid() = partner_1_id OR 
        auth.uid() = partner_2_id
    );

-- RLS para couple_disputes: Solo partners involucrados
ALTER TABLE couple_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own disputes" ON couple_disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM couple_agreements ca 
            WHERE ca.id = couple_agreement_id 
              AND (ca.partner_1_id = auth.uid() OR ca.partner_2_id = auth.uid())
        )
    );

-- 8. COMENTARIOS PARA DOCUMENTACIÓN LEGAL
COMMENT ON TABLE user_consents IS 'Registro de consentimientos informados por capas con evidencia legal (IP, timestamp, hash)';
COMMENT ON TABLE couple_agreements IS 'Acuerdos prenupciales digitales con cláusula de muerte súbita para protección de activos';
COMMENT ON TABLE couple_disputes IS 'Registro de disputas entre parejas con resolución automática después de 30 días';

COMMENT ON COLUMN couple_agreements.death_clause_text IS 'Cláusula de muerte súbita: activos no reclamados en 30 días se transfieren a la plataforma';
COMMENT ON COLUMN couple_agreements.asset_disposition_clause IS 'ADMIN_FORFEIT = activos a la plataforma, SPLIT_50_50 = división equitativa';
COMMENT ON COLUMN couple_agreements.dispute_deadline IS 'Fecha límite para resolver disputa antes de forfeit automático';

-- =====================================================
-- FIN DE MIGRACIÓN - SISTEMA LEGAL IMPLEMENTADO
-- =====================================================


-- =====================================================
-- FIN MIGRACION: 20251121_create_user_consents_evidence.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251123_fix_rls_infinite_recursion.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN CRÍTICA: Corregir Recursión Infinita en RLS
-- Fecha: 23 Noviembre 2025 02:26 AM
-- Problema: Políticas RLS causan recursión infinita al consultar profiles dentro de profiles
-- Solución: Usar auth.jwt() para determinar tipo de usuario sin consultar profiles
-- =====================================================

-- 1. Eliminar políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Crear función auxiliar para determinar si usuario es demo sin recursión
CREATE OR REPLACE FUNCTION auth.is_demo_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Usar metadata del JWT para determinar si es demo
  -- Esto evita consultar la tabla profiles y previene recursión
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata' ->> 'is_demo')::boolean,
    false
  );
$$;

-- 3. Política simplificada para usuarios DEMO - Sin recursión
CREATE POLICY "Demo users see demo profiles only"
ON profiles
FOR SELECT
USING (
  -- Solo mostrar perfiles demo si el usuario es demo
  (auth.is_demo_user() = true AND is_demo = true)
  OR
  -- O si es el propio perfil del usuario
  (user_id = auth.uid())
);

-- 4. Política simplificada para usuarios REALES - Sin recursión  
CREATE POLICY "Real users see real profiles only"
ON profiles
FOR SELECT
USING (
  -- Solo mostrar perfiles reales si el usuario NO es demo
  (auth.is_demo_user() = false AND is_demo = false)
  OR
  -- O si es el propio perfil del usuario
  (user_id = auth.uid())
);

-- 5. Política para INSERT - Usuarios pueden crear su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 6. Política para UPDATE - Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Crear índices para optimizar las consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_user_id ON profiles(is_demo, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_demo ON profiles(user_id, is_demo);

-- 8. Verificar que RLS esté habilitado
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado en tabla profiles';
  ELSE
    RAISE NOTICE 'RLS ya estaba habilitado en tabla profiles';
  END IF;
END $$;

-- 9. Verificar que las políticas se crearon correctamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles' 
  AND schemaname = 'public';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE 'Políticas RLS creadas correctamente: % políticas encontradas', policy_count;
  ELSE
    RAISE WARNING 'Problema con políticas RLS: solo % políticas encontradas', policy_count;
  END IF;
END $$;

-- 10. Comentarios para documentación
COMMENT ON FUNCTION auth.is_demo_user() IS 'Determina si el usuario actual es demo usando JWT metadata, evitando recursión RLS';
COMMENT ON POLICY "Demo users see demo profiles only" ON profiles IS 'Usuarios demo solo ven perfiles demo, sin recursión';
COMMENT ON POLICY "Real users see real profiles only" ON profiles IS 'Usuarios reales solo ven perfiles reales, sin recursión';


-- =====================================================
-- FIN MIGRACION: 20251123_fix_rls_infinite_recursion.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251123_fix_rls_simple.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN SIMPLE: Deshabilitar RLS temporalmente para desarrollo
-- Fecha: 23 Noviembre 2025 02:33 AM
-- Problema: Error de permisos en schema auth
-- Solución: Deshabilitar RLS completamente para desarrollo
-- =====================================================

-- 1. Deshabilitar RLS en tabla profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;

-- 3. Verificar que RLS esté deshabilitado
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    RAISE WARNING 'RLS sigue habilitado en tabla profiles';
  ELSE
    RAISE NOTICE 'RLS deshabilitado correctamente en tabla profiles';
  END IF;
END $$;

-- 4. Comentario para producción
COMMENT ON TABLE profiles IS 'RLS deshabilitado temporalmente para desarrollo - REACTIVAR EN PRODUCCIÓN';


-- =====================================================
-- FIN MIGRACION: 20251123_fix_rls_simple.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251123_rls_production_ready.sql
-- =====================================================

-- =====================================================
-- MIGRACIÓN RLS PARA PRODUCCIÓN - Sin schema auth
-- Fecha: 23 Noviembre 2025 02:37 AM
-- Solución: RLS usando solo funciones públicas y metadata JWT
-- =====================================================

-- 1. Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;

-- 2. Habilitar RLS en tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política para usuarios DEMO - Sin recursión usando metadata
CREATE POLICY "Demo users access demo profiles"
ON profiles
FOR ALL
USING (
  -- Permitir acceso si es el propio perfil
  user_id = auth.uid()
  OR
  -- O si ambos (usuario actual y perfil consultado) son demo
  (
    is_demo = true 
    AND 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true
  )
);

-- 4. Política para usuarios REALES - Sin recursión usando metadata
CREATE POLICY "Real users access real profiles"
ON profiles
FOR ALL
USING (
  -- Permitir acceso si es el propio perfil
  user_id = auth.uid()
  OR
  -- O si ambos (usuario actual y perfil consultado) son reales
  (
    is_demo = false 
    AND 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false
  )
);

-- 5. Crear índices para optimizar las consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_rls_demo_user ON profiles(is_demo, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rls_user_demo ON profiles(user_id, is_demo);

-- 6. Verificar que RLS esté habilitado
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    RAISE NOTICE 'RLS habilitado correctamente en tabla profiles';
  ELSE
    RAISE WARNING 'RLS NO está habilitado en tabla profiles';
  END IF;
END $$;

-- 7. Verificar que las políticas se crearon correctamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles' 
  AND schemaname = 'public';
  
  IF policy_count >= 2 THEN
    RAISE NOTICE 'Políticas RLS creadas correctamente: % políticas encontradas', policy_count;
  ELSE
    RAISE WARNING 'Problema con políticas RLS: solo % políticas encontradas', policy_count;
  END IF;
END $$;

-- 8. Comentarios para documentación
COMMENT ON POLICY "Demo users access demo profiles" ON profiles IS 'Usuarios demo acceden a perfiles demo usando JWT metadata, sin recursión';
COMMENT ON POLICY "Real users access real profiles" ON profiles IS 'Usuarios reales acceden a perfiles reales usando JWT metadata, sin recursión';
COMMENT ON TABLE profiles IS 'RLS habilitado con políticas que usan JWT metadata para evitar recursión infinita';


-- =====================================================
-- FIN MIGRACION: 20251123_rls_production_ready.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251126_create_global_search.sql
-- =====================================================

-- 1. Extensión pg_trgm para búsqueda difusa
create extension if not exists pg_trgm;

-- 2. Índice GIN para perfiles usando email (campo seguro)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'email'
  ) then
    execute 'create index if not exists idx_profiles_email_trgm on public.profiles using gin (email gin_trgm_ops)';
  end if;
end $$;

-- Índices para events (si la tabla existe)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name   = 'events'
  ) then
    execute 'create index if not exists idx_events_title_trgm on public.events using gin (title gin_trgm_ops)';
    execute 'create index if not exists idx_events_description_trgm on public.events using gin (description gin_trgm_ops)';
  end if;
end $$;

-- 3. Función RPC search_unified usando solo email para evitar errores de columnas inexistentes
create or replace function public.search_unified(query_text text)
returns table (
  id uuid,
  type text,
  title text,
  subtitle text,
  image_url text
) as $$
begin
  return query
    select
      p.id,
      'profile'::text as type,
      coalesce(p.email, '') as title,
      ''::text as subtitle,
      coalesce(p.avatar_url, '') as image_url
    from public.profiles p
    where
      query_text is not null
      and query_text <> ''
      and p.email ilike '%' || query_text || '%'
    order by similarity(coalesce(p.email, ''), query_text) desc
    limit 10;
end;
$$ language plpgsql security definer;

grant execute on function public.search_unified(text) to anon, authenticated;

-- =====================================================
-- FIN MIGRACION: 20251126_create_global_search.sql
-- =====================================================

