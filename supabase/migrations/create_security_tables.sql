-- Tablas para el sistema de seguridad y auditoría
-- Este script crea todas las tablas necesarias para el SecurityAuditService

-- Tabla para eventos de seguridad
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'suspicious_activity', 'failed_login', 'data_access', 'admin_action')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Tabla para IPs bloqueadas
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  duration TEXT NOT NULL,
  reason TEXT NOT NULL,
  blocked_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabla para amenazas detectadas
CREATE TABLE IF NOT EXISTS threat_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  threat_id TEXT UNIQUE NOT NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('brute_force', 'data_breach', 'suspicious_pattern', 'unauthorized_access', 'malware')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  affected_users UUID[] DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  mitigation_actions TEXT[] DEFAULT '{}',
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Tabla para métricas de seguridad
CREATE TABLE IF NOT EXISTS security_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_events INTEGER DEFAULT 0,
  critical_events INTEGER DEFAULT 0,
  resolved_events INTEGER DEFAULT 0,
  average_response_time DECIMAL(10,2) DEFAULT 0,
  threat_detection_rate DECIMAL(5,2) DEFAULT 0,
  false_positive_rate DECIMAL(5,2) DEFAULT 0,
  security_score DECIMAL(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para configuraciones de seguridad
CREATE TABLE IF NOT EXISTS security_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla para alertas de seguridad
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON blocked_ips(is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON blocked_ips(expires_at);

CREATE INDEX IF NOT EXISTS idx_threat_detections_threat_id ON threat_detections(threat_id);
CREATE INDEX IF NOT EXISTS idx_threat_detections_status ON threat_detections(status);
CREATE INDEX IF NOT EXISTS idx_threat_detections_severity ON threat_detections(severity);
CREATE INDEX IF NOT EXISTS idx_threat_detections_detected_at ON threat_detections(detected_at);

CREATE INDEX IF NOT EXISTS idx_security_metrics_period ON security_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

-- Políticas RLS para seguridad
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para security_events
CREATE POLICY "security_events_admin_access" ON security_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "security_events_own_data" ON security_events
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para blocked_ips
CREATE POLICY "blocked_ips_admin_access" ON blocked_ips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Políticas para threat_detections
CREATE POLICY "threat_detections_admin_access" ON threat_detections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Políticas para security_metrics
CREATE POLICY "security_metrics_admin_access" ON security_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Políticas para security_configurations
CREATE POLICY "security_configurations_admin_access" ON security_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Políticas para security_alerts
CREATE POLICY "security_alerts_admin_access" ON security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Función para limpiar eventos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos resueltos de más de 30 días
  DELETE FROM security_events 
  WHERE resolved = true 
  AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar eventos no resueltos de más de 90 días
  DELETE FROM security_events 
  WHERE resolved = false 
  AND timestamp < NOW() - INTERVAL '90 days';
  
  -- Eliminar IPs bloqueadas expiradas
  DELETE FROM blocked_ips 
  WHERE expires_at < NOW() 
  AND is_active = true;
  
  -- Actualizar estado de IPs bloqueadas expiradas
  UPDATE blocked_ips 
  SET is_active = false 
  WHERE expires_at < NOW() 
  AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Función para generar métricas de seguridad
CREATE OR REPLACE FUNCTION generate_security_metrics()
RETURNS void AS $$
DECLARE
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
  total_events INTEGER;
  critical_events INTEGER;
  resolved_events INTEGER;
  avg_response_time DECIMAL(10,2);
  threat_detection_rate DECIMAL(5,2);
  false_positive_rate DECIMAL(5,2);
  security_score DECIMAL(5,2);
BEGIN
  -- Calcular período de la última semana
  period_end := NOW();
  period_start := period_end - INTERVAL '7 days';
  
  -- Contar eventos totales
  SELECT COUNT(*) INTO total_events
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end;
  
  -- Contar eventos críticos
  SELECT COUNT(*) INTO critical_events
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end
  AND severity = 'critical';
  
  -- Contar eventos resueltos
  SELECT COUNT(*) INTO resolved_events
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end
  AND resolved = true;
  
  -- Calcular tiempo promedio de respuesta
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - timestamp))/60), 0) INTO avg_response_time
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end
  AND resolved = true AND resolved_at IS NOT NULL;
  
  -- Calcular tasa de detección de amenazas
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE event_type = 'suspicious_activity') * 100.0 / NULLIF(COUNT(*), 0)), 
    0
  ) INTO threat_detection_rate
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end;
  
  -- Calcular tasa de falsos positivos
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE metadata->>'falsePositive' = 'true') * 100.0 / NULLIF(COUNT(*), 0)), 
    0
  ) INTO false_positive_rate
  FROM security_events
  WHERE timestamp >= period_start AND timestamp <= period_end;
  
  -- Calcular score de seguridad
  security_score := CASE 
    WHEN total_events = 0 THEN 100
    ELSE GREATEST(0, 100 - (critical_events * 50.0 / total_events) + (resolved_events * 30.0 / total_events))
  END;
  
  -- Insertar métricas
  INSERT INTO security_metrics (
    period_start, period_end, total_events, critical_events, 
    resolved_events, average_response_time, threat_detection_rate, 
    false_positive_rate, security_score
  ) VALUES (
    period_start, period_end, total_events, critical_events,
    resolved_events, avg_response_time, threat_detection_rate,
    false_positive_rate, security_score
  );
END;
$$ LANGUAGE plpgsql;

-- Función para detectar amenazas automáticamente
CREATE OR REPLACE FUNCTION detect_security_threats()
RETURNS void AS $$
DECLARE
  threat_record RECORD;
  affected_users UUID[];
BEGIN
  -- Detectar intentos de fuerza bruta
  FOR threat_record IN
    SELECT ip_address, COUNT(*) as attempt_count
    FROM security_events
    WHERE event_type = 'failed_login'
    AND timestamp >= NOW() - INTERVAL '1 hour'
    GROUP BY ip_address
    HAVING COUNT(*) >= 5
  LOOP
    -- Obtener usuarios afectados
    SELECT ARRAY_AGG(DISTINCT user_id) INTO affected_users
    FROM security_events
    WHERE ip_address = threat_record.ip_address
    AND event_type = 'failed_login'
    AND timestamp >= NOW() - INTERVAL '1 hour';
    
    -- Insertar amenaza si no existe
    INSERT INTO threat_detections (
      threat_id, threat_type, severity, description, 
      affected_users, status, confidence
    ) VALUES (
      'brute_force_' || threat_record.ip_address || '_' || EXTRACT(EPOCH FROM NOW()),
      'brute_force',
      'high',
      'Multiple failed login attempts from IP: ' || threat_record.ip_address,
      affected_users,
      'active',
      0.9
    ) ON CONFLICT (threat_id) DO NOTHING;
  END LOOP;
  
  -- Detectar acceso excesivo a datos
  FOR threat_record IN
    SELECT user_id, COUNT(*) as access_count
    FROM security_events
    WHERE event_type = 'data_access'
    AND timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY user_id
    HAVING COUNT(*) >= 100
  LOOP
    -- Insertar amenaza si no existe
    INSERT INTO threat_detections (
      threat_id, threat_type, severity, description, 
      affected_users, status, confidence
    ) VALUES (
      'excessive_access_' || threat_record.user_id || '_' || EXTRACT(EPOCH FROM NOW()),
      'suspicious_pattern',
      'medium',
      'Excessive data access detected for user',
      ARRAY[threat_record.user_id],
      'active',
      0.7
    ) ON CONFLICT (threat_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp de configuración
CREATE OR REPLACE FUNCTION update_security_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_configurations_updated_at
  BEFORE UPDATE ON security_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_security_config_timestamp();

-- Insertar configuraciones por defecto
INSERT INTO security_configurations (config_key, config_value, description) VALUES
('threat_thresholds', '{"brute_force_attempts": 5, "suspicious_login_hours": 2, "data_access_frequency": 100, "admin_action_frequency": 50}', 'Umbrales para detección de amenazas'),
('monitoring_intervals', '{"security_scan": 300, "threat_analysis": 3600, "metrics_generation": 86400}', 'Intervalos de monitoreo en segundos'),
('retention_policies', '{"resolved_events": 30, "unresolved_events": 90, "blocked_ips": 7}', 'Políticas de retención en días'),
('alert_settings', '{"email_notifications": true, "webhook_url": "", "severity_threshold": "medium"}', 'Configuración de alertas')
ON CONFLICT (config_key) DO NOTHING;

-- Crear vista para métricas de seguridad en tiempo real
CREATE OR REPLACE VIEW security_metrics_realtime AS
SELECT 
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_events,
  COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - timestamp))/60), 0) as avg_response_time,
  COALESCE(COUNT(*) FILTER (WHERE event_type = 'suspicious_activity') * 100.0 / NULLIF(COUNT(*), 0), 0) as threat_detection_rate,
  COALESCE(COUNT(*) FILTER (WHERE metadata->>'falsePositive' = 'true') * 100.0 / NULLIF(COUNT(*), 0), 0) as false_positive_rate,
  CASE 
    WHEN COUNT(*) = 0 THEN 100
    ELSE GREATEST(0, 100 - (COUNT(*) FILTER (WHERE severity = 'critical') * 50.0 / NULLIF(COUNT(*), 0)) + (COUNT(*) FILTER (WHERE resolved = true) * 30.0 / NULLIF(COUNT(*), 0)))
  END as security_score
FROM security_events
WHERE timestamp >= NOW() - INTERVAL '7 days';

-- Comentarios en las tablas
COMMENT ON TABLE security_events IS 'Registro de todos los eventos de seguridad del sistema';
COMMENT ON TABLE blocked_ips IS 'Direcciones IP bloqueadas por actividad sospechosa';
COMMENT ON TABLE threat_detections IS 'Amenazas de seguridad detectadas automáticamente';
COMMENT ON TABLE security_metrics IS 'Métricas agregadas de seguridad por período';
COMMENT ON TABLE security_configurations IS 'Configuraciones del sistema de seguridad';
COMMENT ON TABLE security_alerts IS 'Alertas de seguridad generadas por el sistema';

COMMENT ON COLUMN security_events.event_type IS 'Tipo de evento de seguridad';
COMMENT ON COLUMN security_events.severity IS 'Nivel de severidad del evento';
COMMENT ON COLUMN security_events.metadata IS 'Datos adicionales del evento en formato JSON';
COMMENT ON COLUMN threat_detections.confidence IS 'Nivel de confianza en la detección (0-1)';
COMMENT ON COLUMN security_metrics.security_score IS 'Score de seguridad calculado (0-100)';
