-- Script combinado para aplicar todas las migraciones en Supabase
-- ComplicesConecta v3.4.0 - Migraciones críticas combinadas
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- MIGRACIÓN 1: Intereses Swinger
-- =====================================================

-- Crear tabla de intereses swinger
CREATE TABLE IF NOT EXISTS public.swinger_interests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_explicit BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de preferencias explícitas
CREATE TABLE IF NOT EXISTS public.explicit_preferences (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  requires_verification BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de relación usuario-intereses
CREATE TABLE IF NOT EXISTS public.user_interests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_id INTEGER REFERENCES public.swinger_interests(id) ON DELETE CASCADE,
  privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest_id)
);

-- Crear tabla de relación usuario-preferencias explícitas
CREATE TABLE IF NOT EXISTS public.user_explicit_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_id INTEGER REFERENCES public.explicit_preferences(id) ON DELETE CASCADE,
  privacy_level VARCHAR(20) DEFAULT 'private' CHECK (privacy_level IN ('public', 'friends', 'private', 'hidden')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_id)
);

-- Crear tabla de compatibilidad calculada
CREATE TABLE IF NOT EXISTS public.compatibility_scores (
  id SERIAL PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(3,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  shared_interests INTEGER DEFAULT 0,
  total_interests INTEGER DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- =====================================================
-- MIGRACIÓN 2: Tablas Faltantes
-- =====================================================

-- Tabla FAQ Items (mencionada en AdminProduction.tsx)
CREATE TABLE IF NOT EXISTS public.faq_items (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas de aplicación (mencionada en PerformancePanel.tsx)
CREATE TABLE IF NOT EXISTS public.app_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_type VARCHAR(50) DEFAULT 'counter',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla de descargas de APK (mencionada en AdminProduction.tsx)
CREATE TABLE IF NOT EXISTS public.apk_downloads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  download_source VARCHAR(50) DEFAULT 'direct',
  version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones (mencionada en AdminProduction.tsx)
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de reportes (mencionada en AdminDashboard.tsx)
CREATE TABLE IF NOT EXISTS public.reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles de usuario (mencionada en AdminDashboard.tsx)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Tabla de solicitudes de carrera (mencionada en AdminDashboard.tsx)
CREATE TABLE IF NOT EXISTS public.career_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  experience_years INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de moderador (mencionada en AdminDashboard.tsx)
CREATE TABLE IF NOT EXISTS public.moderator_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  experience TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscriptores (mencionada en funciones de Supabase)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  subscribed BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50) DEFAULT 'basic',
  subscription_end TIMESTAMP WITH TIME ZONE,
  is_trialing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular compatibilidad entre usuarios
CREATE OR REPLACE FUNCTION calculate_compatibility(user1_uuid UUID, user2_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  shared_count INTEGER;
  total_user1 INTEGER;
  total_user2 INTEGER;
  compatibility DECIMAL(3,2);
BEGIN
  -- Contar intereses compartidos
  SELECT COUNT(*) INTO shared_count
  FROM public.user_interests ui1
  JOIN public.user_interests ui2 ON ui1.interest_id = ui2.interest_id
  WHERE ui1.user_id = user1_uuid 
    AND ui2.user_id = user2_uuid
    AND ui1.privacy_level IN ('public', 'friends')
    AND ui2.privacy_level IN ('public', 'friends');
  
  -- Contar total de intereses del usuario 1
  SELECT COUNT(*) INTO total_user1
  FROM public.user_interests
  WHERE user_id = user1_uuid AND privacy_level IN ('public', 'friends');
  
  -- Contar total de intereses del usuario 2
  SELECT COUNT(*) INTO total_user2
  FROM public.user_interests
  WHERE user_id = user2_uuid AND privacy_level IN ('public', 'friends');
  
  -- Calcular compatibilidad (Jaccard similarity)
  IF (total_user1 + total_user2 - shared_count) > 0 THEN
    compatibility := shared_count::DECIMAL / (total_user1 + total_user2 - shared_count);
  ELSE
    compatibility := 0;
  END IF;
  
  -- Insertar o actualizar el score
  INSERT INTO public.compatibility_scores (user1_id, user2_id, compatibility_score, shared_interests, total_interests)
  VALUES (user1_uuid, user2_uuid, compatibility, shared_count, total_user1 + total_user2 - shared_count)
  ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET 
    compatibility_score = compatibility,
    shared_interests = shared_count,
    total_interests = total_user1 + total_user2 - shared_count,
    last_calculated = NOW();
  
  RETURN compatibility;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.swinger_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explicit_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_explicit_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para intereses públicos (todos pueden leer)
CREATE POLICY "Los intereses son públicos para lectura" ON public.swinger_interests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Las preferencias explícitas son públicas para lectura" ON public.explicit_preferences
  FOR SELECT USING (is_active = true);

-- Políticas RLS para relaciones usuario-intereses
CREATE POLICY "Los usuarios pueden ver sus propios intereses" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver intereses públicos de otros" ON public.user_interests
  FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Los usuarios pueden insertar sus propios intereses" ON public.user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios intereses" ON public.user_interests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios intereses" ON public.user_interests
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para preferencias explícitas (más restrictivas)
CREATE POLICY "Los usuarios pueden ver sus propias preferencias explícitas" ON public.user_explicit_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver preferencias explícitas públicas verificadas" ON public.user_explicit_preferences
  FOR SELECT USING (privacy_level = 'public' AND is_verified = true);

CREATE POLICY "Los usuarios pueden insertar sus propias preferencias explícitas" ON public.user_explicit_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias preferencias explícitas" ON public.user_explicit_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias preferencias explícitas" ON public.user_explicit_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para scores de compatibilidad
CREATE POLICY "Los usuarios pueden ver scores donde participan" ON public.compatibility_scores
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Solo el sistema puede insertar scores de compatibilidad" ON public.compatibility_scores
  FOR INSERT WITH CHECK (false); -- Solo funciones del sistema pueden insertar

CREATE POLICY "Solo el sistema puede actualizar scores de compatibilidad" ON public.compatibility_scores
  FOR UPDATE USING (false); -- Solo funciones del sistema pueden actualizar

-- Políticas RLS para FAQ Items (públicas para lectura)
CREATE POLICY "FAQ items are public for reading" ON public.faq_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage FAQ items" ON public.faq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para App Metrics (solo admins)
CREATE POLICY "Only admins can access app metrics" ON public.app_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para APK Downloads (solo admins)
CREATE POLICY "Only admins can access APK downloads" ON public.apk_downloads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para Notifications (usuarios ven solo las suyas)
CREATE POLICY "Users can see their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para Reports (usuarios ven solo los suyos, admins todos)
CREATE POLICY "Users can see their own reports" ON public.reports
  FOR ALL USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can see all reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para User Roles (solo admins)
CREATE POLICY "Only admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para Career Applications (usuarios ven solo las suyas)
CREATE POLICY "Users can see their own career applications" ON public.career_applications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all career applications" ON public.career_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para Moderator Requests (usuarios ven solo las suyas)
CREATE POLICY "Users can see their own moderator requests" ON public.moderator_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all moderator requests" ON public.moderator_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- Políticas RLS para Subscribers (usuarios ven solo los suyos)
CREATE POLICY "Users can see their own subscription" ON public.subscribers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all subscriptions" ON public.subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON public.user_interests(interest_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_privacy ON public.user_interests(privacy_level);
CREATE INDEX IF NOT EXISTS idx_user_explicit_preferences_user_id ON public.user_explicit_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_users ON public.compatibility_scores(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_swinger_interests_category ON public.swinger_interests(category);
CREATE INDEX IF NOT EXISTS idx_swinger_interests_active ON public.swinger_interests(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON public.faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON public.faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_app_metrics_name ON public.app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_app_metrics_recorded_at ON public.app_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_apk_downloads_user_id ON public.apk_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_apk_downloads_created_at ON public.apk_downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_career_applications_user_id ON public.career_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON public.career_applications(status);
CREATE INDEX IF NOT EXISTS idx_moderator_requests_user_id ON public.moderator_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_moderator_requests_status ON public.moderator_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para actualizar timestamps
CREATE TRIGGER update_swinger_interests_updated_at 
  BEFORE UPDATE ON public.swinger_interests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_explicit_preferences_updated_at 
  BEFORE UPDATE ON public.explicit_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at 
  BEFORE UPDATE ON public.faq_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON public.reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at 
  BEFORE UPDATE ON public.career_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderator_requests_updated_at 
  BEFORE UPDATE ON public.moderator_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at 
  BEFORE UPDATE ON public.subscribers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar intereses swinger básicos
INSERT INTO public.swinger_interests (name, category, description, is_explicit) VALUES
-- Encuentros Swinger
('Intercambio de parejas', 'encuentros_swinger', 'Intercambio consensual entre parejas establecidas', false),
('Soft swap', 'encuentros_swinger', 'Intercambio sin penetración completa', false),
('Full swap', 'encuentros_swinger', 'Intercambio completo entre parejas', true),
('Tríos MHM', 'encuentros_swinger', 'Encuentros de tres personas (mujer-hombre-mujer)', false),
('Tríos HMH', 'encuentros_swinger', 'Encuentros de tres personas (hombre-mujer-hombre)', false),
('Orgías', 'encuentros_swinger', 'Encuentros grupales con múltiples participantes', true),
('Fiestas swinger', 'encuentros_swinger', 'Eventos sociales del ambiente swinger', false),
('Clubs swinger', 'encuentros_swinger', 'Lugares especializados para el intercambio', false),

-- Dinámicas de Pareja
('Hotwife', 'dinamicas_pareja', 'Esposa con libertad sexual supervisada por su pareja', false),
('Cuckold', 'dinamicas_pareja', 'Pareja que disfruta viendo a su compañera con otros', false),
('Stag and vixen', 'dinamicas_pareja', 'Pareja donde ambos disfrutan que ella esté con otros', false),
('Poliamor', 'dinamicas_pareja', 'Relaciones amorosas múltiples consensuales', false),
('Relación abierta', 'dinamicas_pareja', 'Pareja con acuerdos de libertad sexual', false),
('Unicornio', 'dinamicas_pareja', 'Persona soltera que se une a parejas', false),
('Bull', 'dinamicas_pareja', 'Hombre que participa con parejas hotwife/cuckold', false),

-- Preferencias Sexuales
('Voyeurismo', 'preferencias_sexuales', 'Placer observando a otros en intimidad', false),
('Exhibicionismo', 'preferencias_sexuales', 'Placer siendo observado en intimidad', false),
('BDSM ligero', 'preferencias_sexuales', 'Prácticas de dominación suaves', false),
('Juegos de rol', 'preferencias_sexuales', 'Interpretación de personajes en intimidad', false),
('Fetichismo', 'preferencias_sexuales', 'Atracción hacia objetos o situaciones específicas', true),
('Dogging', 'preferencias_sexuales', 'Encuentros en lugares públicos o semi-públicos', true),
('Gangbang', 'preferencias_sexuales', 'Una persona con múltiples parejas simultáneamente', true),

-- Comunidad Swinger
('Networking swinger', 'comunidad_swinger', 'Construcción de redes sociales en el ambiente', false),
('Eventos temáticos', 'comunidad_swinger', 'Fiestas con temáticas específicas', false),
('Viajes swinger', 'comunidad_swinger', 'Vacaciones y viajes en grupo', false),
('Respeto y consentimiento', 'comunidad_swinger', 'Valores fundamentales del lifestyle', false),
('Discreción', 'comunidad_swinger', 'Privacidad y confidencialidad en el ambiente', false),
('Lifestyle México', 'comunidad_swinger', 'Comunidad swinger específica de México', false),
('Parejas verificadas', 'comunidad_swinger', 'Preferencia por perfiles con verificación', false),
('Ambiente liberal', 'comunidad_swinger', 'Entorno de libertad sexual y mental', false)
ON CONFLICT (name) DO NOTHING;

-- Insertar preferencias explícitas
INSERT INTO public.explicit_preferences (name, category, description, requires_verification) VALUES
-- Prácticas Específicas
('Anal', 'practicas_especificas', 'Sexo anal consensual', true),
('Doble penetración', 'practicas_especificas', 'Penetración simultánea en dos orificios', true),
('Fisting', 'practicas_especificas', 'Penetración con puño', true),
('Squirting', 'practicas_especificas', 'Eyaculación femenina', true),
('Creampie', 'practicas_especificas', 'Eyaculación interna', true),
('Facial', 'practicas_especificas', 'Eyaculación facial', true),

-- BDSM Avanzado
('Bondage', 'bdsm_avanzado', 'Restricción física consensual', true),
('Dominación', 'bdsm_avanzado', 'Ejercer control sobre la pareja', true),
('Sumisión', 'bdsm_avanzado', 'Entregar control a la pareja', true),
('Sadomasoquismo', 'bdsm_avanzado', 'Placer a través del dolor consensual', true),
('Humillación', 'bdsm_avanzado', 'Degradación consensual', true),

-- Fetiches Específicos
('Pies', 'fetiches_especificos', 'Atracción hacia los pies', true),
('Latex/Cuero', 'fetiches_especificos', 'Atracción hacia materiales específicos', true),
('Uniformes', 'fetiches_especificos', 'Atracción hacia vestimentas específicas', true),
('Edad (roleplay)', 'fetiches_especificos', 'Juegos de rol de diferencia de edad (solo adultos)', true),
('Lactancia', 'fetiches_especificos', 'Fetiche relacionado con lactancia', true)
ON CONFLICT (name) DO NOTHING;

-- Insertar algunos FAQ items de ejemplo
INSERT INTO public.faq_items (question, answer, category, order_index) VALUES
('¿Qué es ComplicesConecta?', 'ComplicesConecta es una plataforma social para adultos que busca conectar personas con intereses similares en un ambiente seguro y discreto.', 'general', 1),
('¿Cómo funciona el sistema de verificación?', 'Utilizamos múltiples métodos de verificación incluyendo verificación de identidad, verificación de parejas y verificación de intereses para garantizar la autenticidad de los perfiles.', 'verification', 2),
('¿Es seguro compartir información personal?', 'Sí, utilizamos encriptación de extremo a extremo y políticas de privacidad estrictas. Nunca compartimos información personal con terceros sin tu consentimiento explícito.', 'privacy', 3),
('¿Cómo funciona el sistema de tokens?', 'Los tokens CMPX y GTK te permiten acceder a funciones premium, participar en eventos especiales y obtener beneficios exclusivos en la plataforma.', 'tokens', 4),
('¿Puedo usar la plataforma de forma anónima?', 'Sí, respetamos tu privacidad. Puedes configurar tu nivel de privacidad y compartir solo la información que te sientas cómodo compartiendo.', 'privacy', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS
-- =====================================================

-- Comentarios en las tablas
COMMENT ON TABLE public.swinger_interests IS 'Catálogo de intereses del lifestyle swinger para registro público';
COMMENT ON TABLE public.explicit_preferences IS 'Catálogo de preferencias explícitas para perfiles privados verificados';
COMMENT ON TABLE public.user_interests IS 'Relación entre usuarios e intereses swinger con niveles de privacidad';
COMMENT ON TABLE public.user_explicit_preferences IS 'Relación entre usuarios y preferencias explícitas con verificación';
COMMENT ON TABLE public.compatibility_scores IS 'Scores de compatibilidad calculados entre usuarios basados en intereses compartidos';
COMMENT ON TABLE public.faq_items IS 'Preguntas frecuentes de la plataforma';
COMMENT ON TABLE public.app_metrics IS 'Métricas de rendimiento y uso de la aplicación';
COMMENT ON TABLE public.apk_downloads IS 'Registro de descargas de la aplicación móvil';
COMMENT ON TABLE public.notifications IS 'Sistema de notificaciones para usuarios';
COMMENT ON TABLE public.reports IS 'Reportes de usuarios y contenido';
COMMENT ON TABLE public.user_roles IS 'Roles y permisos de usuarios';
COMMENT ON TABLE public.career_applications IS 'Solicitudes de trabajo en la plataforma';
COMMENT ON TABLE public.moderator_requests IS 'Solicitudes para convertirse en moderador';
COMMENT ON TABLE public.subscribers IS 'Información de suscripciones premium';

-- Mensaje de confirmación
SELECT 'Migraciones aplicadas exitosamente - ComplicesConecta v3.4.0' as status;
