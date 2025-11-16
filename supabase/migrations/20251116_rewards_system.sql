-- =====================================================
-- SISTEMA DE RECOMPENSAS PARA BETA-TESTERS
-- Fecha: 16 Nov 2025
-- Versión: 1.0
-- =====================================================

-- Tabla: user_points (Puntos acumulados por usuario)
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Puntos por categoría
  daily_activity_points INTEGER DEFAULT 0,
  referral_points INTEGER DEFAULT 0,
  content_points INTEGER DEFAULT 0,
  engagement_points INTEGER DEFAULT 0,
  mission_points INTEGER DEFAULT 0,
  
  -- Total
  total_points INTEGER GENERATED ALWAYS AS (
    daily_activity_points + referral_points + content_points + 
    engagement_points + mission_points
  ) STORED,
  
  -- Nivel alcanzado
  level VARCHAR(20) DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'diamond')),
  
  -- Racha de días
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Índices para user_points
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX idx_user_points_level ON user_points(level);

-- =====================================================

-- Tabla: daily_activities (Actividad diaria del usuario)
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Métricas del día
  minutes_active INTEGER DEFAULT 0,
  login_count INTEGER DEFAULT 1,
  points_earned INTEGER DEFAULT 0,
  
  -- Bonus aplicados
  streak_bonus INTEGER DEFAULT 0,
  first_login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, activity_date)
);

-- Índices para daily_activities
CREATE INDEX idx_daily_activities_user_date ON daily_activities(user_id, activity_date DESC);
CREATE INDEX idx_daily_activities_date ON daily_activities(activity_date DESC);

-- =====================================================

-- Tabla: referrals (Sistema de referidos)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estado del referido
  status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'registered', 'verified', 'active')),
  
  -- Código de referido
  referral_code VARCHAR(50) NOT NULL,
  
  -- Puntos ganados por el referrer
  points_earned INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registered_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(referred_id),
  UNIQUE(referrer_id, referred_id)
);

-- Índices para referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- =====================================================

-- Tabla: content_activities (Contenido creado por usuario)
CREATE TABLE IF NOT EXISTS content_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de contenido
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('post', 'photo', 'video', 'bio', 'comment')),
  content_id UUID, -- ID del contenido (si aplica)
  
  -- Engagement recibido
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Puntos ganados
  base_points INTEGER DEFAULT 0,
  viral_bonus INTEGER DEFAULT 0,
  total_points INTEGER GENERATED ALWAYS AS (base_points + viral_bonus) STORED,
  
  -- Estado
  is_viral BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para content_activities
CREATE INDEX idx_content_activities_user ON content_activities(user_id);
CREATE INDEX idx_content_activities_type ON content_activities(content_type);
CREATE INDEX idx_content_activities_viral ON content_activities(is_viral);

-- =====================================================

-- Tabla: engagement_activities (Interacciones del usuario)
CREATE TABLE IF NOT EXISTS engagement_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Contadores diarios
  likes_given INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  shares_made INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  public_room_participation BOOLEAN DEFAULT FALSE,
  
  -- Puntos del día
  points_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, activity_date)
);

-- Índices para engagement_activities
CREATE INDEX idx_engagement_user_date ON engagement_activities(user_id, activity_date DESC);

-- =====================================================

-- Tabla: missions (Misiones disponibles)
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación de misión
  mission_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo y duración
  mission_type VARCHAR(20) DEFAULT 'weekly' CHECK (mission_type IN ('daily', 'weekly', 'monthly', 'special')),
  week_number INTEGER, -- Para misiones semanales
  
  -- Requisitos
  requirements JSONB NOT NULL,
  -- Ejemplo: {"complete_profile": true, "min_posts": 5, "min_photos": 3}
  
  -- Recompensas
  points_reward INTEGER NOT NULL,
  token_reward INTEGER DEFAULT 0, -- CMPX tokens
  special_reward TEXT, -- "1 mes Premium", etc.
  
  -- Vigencia
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para missions
CREATE INDEX idx_missions_active ON missions(is_active, start_date, end_date);
CREATE INDEX idx_missions_type ON missions(mission_type);

-- =====================================================

-- Tabla: user_missions (Progreso de misiones por usuario)
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'claimed')),
  
  -- Progreso
  progress JSONB DEFAULT '{}',
  -- Ejemplo: {"complete_profile": true, "posts_created": 3, "photos_uploaded": 2}
  
  -- Fechas
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recompensas recibidas
  points_received INTEGER DEFAULT 0,
  tokens_received INTEGER DEFAULT 0,
  
  UNIQUE(user_id, mission_id)
);

-- Índices para user_missions
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_status ON user_missions(status);

-- =====================================================

-- Tabla: beta_rewards (Recompensas finales de beta)
CREATE TABLE IF NOT EXISTS beta_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nivel alcanzado
  final_level VARCHAR(20) NOT NULL CHECK (final_level IN ('bronze', 'silver', 'gold', 'diamond')),
  final_points INTEGER NOT NULL,
  
  -- Recompensas otorgadas
  cmpx_tokens INTEGER NOT NULL,
  premium_months INTEGER DEFAULT 0,
  vip_months INTEGER DEFAULT 0,
  lifetime_discount NUMERIC(3,2) DEFAULT 0, -- 0.10 = 10%
  badge VARCHAR(100) NOT NULL,
  
  -- Perks especiales
  special_perks JSONB DEFAULT '[]',
  -- Ejemplo: ["revenue_share_2%", "early_access", "priority_support"]
  
  -- Estado
  rewards_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Índices para beta_rewards
CREATE INDEX idx_beta_rewards_user ON beta_rewards(user_id);
CREATE INDEX idx_beta_rewards_level ON beta_rewards(final_level);

-- =====================================================

-- Tabla: points_transactions (Historial de cambios en puntos)
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de transacción
  transaction_type VARCHAR(50) NOT NULL,
  -- 'daily_login', 'referral_bonus', 'post_created', 'mission_completed', etc.
  
  -- Puntos
  points_change INTEGER NOT NULL, -- Puede ser negativo (penalización)
  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  
  -- Contexto
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para points_transactions
CREATE INDEX idx_points_transactions_user ON points_transactions(user_id, created_at DESC);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);

-- =====================================================

-- Tabla: anti_cheat_log (Detección de trampas)
CREATE TABLE IF NOT EXISTS anti_cheat_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Patrones sospechosos
  suspicious_patterns JSONB NOT NULL,
  -- Ejemplo: ["excessive_likes", "fake_referrals", "spam_content"]
  
  risk_score INTEGER NOT NULL, -- 0-100
  
  -- Acciones tomadas
  actions_taken JSONB DEFAULT '[]',
  -- Ejemplo: ["warning", "points_reset", "ban_7_days"]
  
  -- Estado
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para anti_cheat_log
CREATE INDEX idx_anti_cheat_user ON anti_cheat_log(user_id);
CREATE INDEX idx_anti_cheat_risk ON anti_cheat_log(risk_score DESC);
CREATE INDEX idx_anti_cheat_resolved ON anti_cheat_log(resolved);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: Actualizar last_active_date y streak
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar last_active_date
  UPDATE user_points
  SET last_active_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Actualizar racha si es necesario
  -- (La lógica de racha se manejará en el servicio)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar actividad en daily_activities
CREATE TRIGGER trigger_update_user_activity
AFTER INSERT OR UPDATE ON daily_activities
FOR EACH ROW
EXECUTE FUNCTION update_user_activity();

-- =====================================================

-- Función: Actualizar nivel automáticamente
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level VARCHAR(20);
  calculated_points INTEGER;
BEGIN
  -- Calcular total_points manualmente (porque es columna generada)
  calculated_points := NEW.daily_activity_points + NEW.referral_points + 
                       NEW.content_points + NEW.engagement_points + NEW.mission_points;
  
  -- Determinar nivel según puntos totales
  IF calculated_points >= 10000 THEN
    new_level := 'diamond';
  ELSIF calculated_points >= 3000 THEN
    new_level := 'gold';
  ELSIF calculated_points >= 1000 THEN
    new_level := 'silver';
  ELSE
    new_level := 'bronze';
  END IF;
  
  -- Actualizar solo si cambió
  IF NEW.level != new_level THEN
    NEW.level := new_level;
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar nivel en user_points (sin WHEN - se ejecuta siempre)
CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE ON user_points
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON daily_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can view own content" ON content_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own engagement" ON engagement_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rewards" ON beta_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas de INSERT (solo servicio backend puede insertar)
CREATE POLICY "Service can insert points" ON user_points
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert activities" ON daily_activities
  FOR INSERT WITH CHECK (true);

-- (Agregar más políticas según necesidades)

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE user_points IS 'Puntos acumulados por usuario en el sistema de recompensas beta';
COMMENT ON TABLE daily_activities IS 'Registro de actividad diaria del usuario';
COMMENT ON TABLE referrals IS 'Sistema de referidos y códigos de invitación';
COMMENT ON TABLE content_activities IS 'Contenido creado por el usuario (posts, fotos, videos)';
COMMENT ON TABLE engagement_activities IS 'Interacciones del usuario (likes, comentarios, shares)';
COMMENT ON TABLE missions IS 'Misiones y desafíos disponibles';
COMMENT ON TABLE user_missions IS 'Progreso de misiones por usuario';
COMMENT ON TABLE beta_rewards IS 'Recompensas finales otorgadas al terminar la beta';
COMMENT ON TABLE points_transactions IS 'Historial completo de cambios en puntos';
COMMENT ON TABLE anti_cheat_log IS 'Log de detección de actividades sospechosas';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
