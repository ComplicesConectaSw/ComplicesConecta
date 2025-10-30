-- ============================================================================
-- Migration: Verificar y Crear Tablas Faltantes
-- Version: 3.5.0
-- Date: 2025-10-31
-- Purpose: Alinear BD local/remota - asegurar que todas las tablas existan
-- ============================================================================

-- Este script verifica y crea (si no existen) todas las tablas críticas
-- del sistema ComplicesConecta v3.5.0

-- ============================================================================
-- 1. VERIFICAR TABLAS CORE (ya deberían existir)
-- ============================================================================

-- Verificar que profiles existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'FATAL: Tabla profiles no existe. Ejecutar migraciones base primero.';
  END IF;
  RAISE NOTICE '✓ Tabla profiles existe';
END $$;

-- Verificar que couple_profiles existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_profiles') THEN
    RAISE EXCEPTION 'FATAL: Tabla couple_profiles no existe. Ejecutar migraciones base primero.';
  END IF;
  RAISE NOTICE '✓ Tabla couple_profiles existe';
END $$;

-- ============================================================================
-- 2. TABLAS AI (Fase 1.2 - Predictive Matching)
-- ============================================================================

-- Tabla: ai_compatibility_scores
CREATE TABLE IF NOT EXISTS ai_compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_score DECIMAL(3,2) CHECK (ai_score >= 0 AND ai_score <= 1),
  legacy_score DECIMAL(3,2) CHECK (legacy_score >= 0 AND legacy_score <= 1),
  final_score DECIMAL(3,2) NOT NULL CHECK (final_score >= 0 AND final_score <= 1),
  model_version VARCHAR(50) NOT NULL,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para par de usuarios (bidireccional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_scores_unique_pair
ON ai_compatibility_scores (
  LEAST(user1_id, user2_id),
  GREATEST(user1_id, user2_id)
);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_ai_scores_user1 ON ai_compatibility_scores(user1_id);
CREATE INDEX IF NOT EXISTS idx_ai_scores_user2 ON ai_compatibility_scores(user2_id);
CREATE INDEX IF NOT EXISTS idx_ai_scores_final ON ai_compatibility_scores(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_scores_created ON ai_compatibility_scores(created_at DESC);

-- RLS
ALTER TABLE ai_compatibility_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_scores_select_own ON ai_compatibility_scores;
CREATE POLICY ai_scores_select_own
ON ai_compatibility_scores FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Tabla: ai_prediction_logs
CREATE TABLE IF NOT EXISTS ai_prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_version VARCHAR(50) NOT NULL,
  input_features JSONB NOT NULL,
  predicted_score DECIMAL(3,2) NOT NULL,
  actual_outcome VARCHAR(50),
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediction_logs_created ON ai_prediction_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_model ON ai_prediction_logs(model_version);

ALTER TABLE ai_prediction_logs ENABLE ROW LEVEL SECURITY;

-- Tabla: ai_model_metrics
CREATE TABLE IF NOT EXISTS ai_model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  sample_size INTEGER,
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON ai_model_metrics(model_version);
CREATE INDEX IF NOT EXISTS idx_model_metrics_recorded ON ai_model_metrics(recorded_at DESC);

-- ============================================================================
-- 3. TABLAS CHAT SUMMARIES (Fase 1.3)
-- ============================================================================

-- Tabla: chat_summaries
CREATE TABLE IF NOT EXISTS chat_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  summary TEXT NOT NULL,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  topics TEXT[],
  message_count INTEGER NOT NULL,
  method VARCHAR(20) CHECK (method IN ('gpt4', 'bart', 'fallback')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_summaries_chat ON chat_summaries(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_created ON chat_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_method ON chat_summaries(method);

ALTER TABLE chat_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_summaries_select_own ON chat_summaries;
CREATE POLICY chat_summaries_select_own
ON chat_summaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_members.room_id = chat_summaries.chat_id
    AND chat_members.profile_id = auth.uid()
  )
);

-- Tabla: summary_requests
CREATE TABLE IF NOT EXISTS summary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summary_requests_user ON summary_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_requests_created ON summary_requests(created_at DESC);

ALTER TABLE summary_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS summary_requests_select_own ON summary_requests;
CREATE POLICY summary_requests_select_own
ON summary_requests FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS summary_requests_insert_own ON summary_requests;
CREATE POLICY summary_requests_insert_own
ON summary_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Tabla: summary_feedback
CREATE TABLE IF NOT EXISTS summary_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID NOT NULL REFERENCES chat_summaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summary_feedback_summary ON summary_feedback(summary_id);
CREATE INDEX IF NOT EXISTS idx_summary_feedback_user ON summary_feedback(user_id);

ALTER TABLE summary_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS summary_feedback_insert_own ON summary_feedback;
CREATE POLICY summary_feedback_insert_own
ON summary_feedback FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. COLUMNAS S2 GEOSHARDING (Fase 2.1)
-- ============================================================================

-- Agregar columnas S2 a profiles (si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 's2_cell_id_level_10'
  ) THEN
    ALTER TABLE profiles ADD COLUMN s2_cell_id_level_10 VARCHAR(20);
    RAISE NOTICE '✓ Columna s2_cell_id_level_10 agregada a profiles';
  ELSE
    RAISE NOTICE '✓ Columna s2_cell_id_level_10 ya existe en profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 's2_cell_id_level_15'
  ) THEN
    ALTER TABLE profiles ADD COLUMN s2_cell_id_level_15 VARCHAR(20);
    RAISE NOTICE '✓ Columna s2_cell_id_level_15 agregada a profiles';
  ELSE
    RAISE NOTICE '✓ Columna s2_cell_id_level_15 ya existe en profiles';
  END IF;
END $$;

-- Crear índices S2 en profiles
CREATE INDEX IF NOT EXISTS idx_profiles_s2_level_10 ON profiles(s2_cell_id_level_10);
CREATE INDEX IF NOT EXISTS idx_profiles_s2_level_15 ON profiles(s2_cell_id_level_15);

-- Agregar columnas S2 a couple_profiles (si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'couple_profiles' AND column_name = 's2_cell_id_level_10'
  ) THEN
    ALTER TABLE couple_profiles ADD COLUMN s2_cell_id_level_10 VARCHAR(20);
    RAISE NOTICE '✓ Columna s2_cell_id_level_10 agregada a couple_profiles';
  ELSE
    RAISE NOTICE '✓ Columna s2_cell_id_level_10 ya existe en couple_profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'couple_profiles' AND column_name = 's2_cell_id_level_15'
  ) THEN
    ALTER TABLE couple_profiles ADD COLUMN s2_cell_id_level_15 VARCHAR(20);
    RAISE NOTICE '✓ Columna s2_cell_id_level_15 agregada a couple_profiles';
  ELSE
    RAISE NOTICE '✓ Columna s2_cell_id_level_15 ya existe en couple_profiles';
  END IF;
END $$;

-- Crear índices S2 en couple_profiles
CREATE INDEX IF NOT EXISTS idx_couple_profiles_s2_level_10 ON couple_profiles(s2_cell_id_level_10);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_s2_level_15 ON couple_profiles(s2_cell_id_level_15);

-- ============================================================================
-- 5. FUNCIONES HELPER PARA S2
-- ============================================================================

-- Función para obtener perfiles en celdas específicas
CREATE OR REPLACE FUNCTION get_profiles_in_s2_cells(
  cell_ids TEXT[],
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  s2_cell_id VARCHAR(20),
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.latitude,
    p.longitude,
    p.s2_cell_id_level_15 as s2_cell_id,
    p.updated_at
  FROM profiles p
  WHERE p.s2_cell_id_level_15 = ANY(cell_ids)
    AND p.updated_at >= NOW() - INTERVAL '7 days'
  ORDER BY p.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar resumen de tablas creadas
DO $$ 
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICACIÓN COMPLETADA';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Total de tablas en BD: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Tablas AI creadas/verificadas:';
  RAISE NOTICE '  • ai_compatibility_scores ✓';
  RAISE NOTICE '  • ai_prediction_logs ✓';
  RAISE NOTICE '  • ai_model_metrics ✓';
  RAISE NOTICE '';
  RAISE NOTICE 'Tablas Chat Summaries creadas/verificadas:';
  RAISE NOTICE '  • chat_summaries ✓';
  RAISE NOTICE '  • summary_requests ✓';
  RAISE NOTICE '  • summary_feedback ✓';
  RAISE NOTICE '';
  RAISE NOTICE 'Columnas S2 Geosharding creadas/verificadas:';
  RAISE NOTICE '  • profiles.s2_cell_id_level_10 ✓';
  RAISE NOTICE '  • profiles.s2_cell_id_level_15 ✓';
  RAISE NOTICE '  • couple_profiles.s2_cell_id_level_10 ✓';
  RAISE NOTICE '  • couple_profiles.s2_cell_id_level_15 ✓';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '🚀 BD LISTA PARA v3.5.0';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

