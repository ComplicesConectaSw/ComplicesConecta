-- Script seguro para aplicar migraciones en Supabase
-- ComplicesConecta v3.4.0 - Solo crea lo que no existe
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR Y CREAR TABLAS FALTANTES
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
-- FUNCIONES Y TRIGGERS (SOLO SI NO EXISTEN)
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS (Row Level Security) - SOLO SI NO EXISTE
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para FAQ Items (públicas para lectura) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'faq_items' 
        AND policyname = 'FAQ items are public for reading'
    ) THEN
        CREATE POLICY "FAQ items are public for reading" ON public.faq_items
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'faq_items' 
        AND policyname = 'Only admins can manage FAQ items'
    ) THEN
        CREATE POLICY "Only admins can manage FAQ items" ON public.faq_items
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para App Metrics (solo admins) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'app_metrics' 
        AND policyname = 'Only admins can access app metrics'
    ) THEN
        CREATE POLICY "Only admins can access app metrics" ON public.app_metrics
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para APK Downloads (solo admins) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'apk_downloads' 
        AND policyname = 'Only admins can access APK downloads'
    ) THEN
        CREATE POLICY "Only admins can access APK downloads" ON public.apk_downloads
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para Notifications (usuarios ven solo las suyas) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can see their own notifications'
    ) THEN
        CREATE POLICY "Users can see their own notifications" ON public.notifications
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Admins can see all notifications'
    ) THEN
        CREATE POLICY "Admins can see all notifications" ON public.notifications
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para Reports (usuarios ven solo los suyos, admins todos) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports' 
        AND policyname = 'Users can see their own reports'
    ) THEN
        CREATE POLICY "Users can see their own reports" ON public.reports
          FOR ALL USING (auth.uid() = reporter_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports' 
        AND policyname = 'Admins can see all reports'
    ) THEN
        CREATE POLICY "Admins can see all reports" ON public.reports
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para User Roles (solo admins) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Only admins can manage user roles'
    ) THEN
        CREATE POLICY "Only admins can manage user roles" ON public.user_roles
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para Career Applications (usuarios ven solo las suyas) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'career_applications' 
        AND policyname = 'Users can see their own career applications'
    ) THEN
        CREATE POLICY "Users can see their own career applications" ON public.career_applications
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'career_applications' 
        AND policyname = 'Admins can see all career applications'
    ) THEN
        CREATE POLICY "Admins can see all career applications" ON public.career_applications
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para Moderator Requests (usuarios ven solo las suyas) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'moderator_requests' 
        AND policyname = 'Users can see their own moderator requests'
    ) THEN
        CREATE POLICY "Users can see their own moderator requests" ON public.moderator_requests
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'moderator_requests' 
        AND policyname = 'Admins can see all moderator requests'
    ) THEN
        CREATE POLICY "Admins can see all moderator requests" ON public.moderator_requests
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- Políticas RLS para Subscribers (usuarios ven solo los suyos) - SOLO SI NO EXISTEN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Users can see their own subscription'
    ) THEN
        CREATE POLICY "Users can see their own subscription" ON public.subscribers
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Admins can see all subscriptions'
    ) THEN
        CREATE POLICY "Admins can see all subscriptions" ON public.subscribers
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() 
              AND role IN ('admin', 'super_admin') 
              AND is_active = true
            )
          );
    END IF;
END $$;

-- =====================================================
-- ÍNDICES (SOLO SI NO EXISTEN)
-- =====================================================

-- Índices para optimizar consultas
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
-- TRIGGERS (SOLO SI NO EXISTEN)
-- =====================================================

-- Triggers para actualizar timestamps
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_faq_items_updated_at' 
        AND event_object_table = 'faq_items'
    ) THEN
        CREATE TRIGGER update_faq_items_updated_at 
          BEFORE UPDATE ON public.faq_items 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_reports_updated_at' 
        AND event_object_table = 'reports'
    ) THEN
        CREATE TRIGGER update_reports_updated_at 
          BEFORE UPDATE ON public.reports 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_career_applications_updated_at' 
        AND event_object_table = 'career_applications'
    ) THEN
        CREATE TRIGGER update_career_applications_updated_at 
          BEFORE UPDATE ON public.career_applications 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_moderator_requests_updated_at' 
        AND event_object_table = 'moderator_requests'
    ) THEN
        CREATE TRIGGER update_moderator_requests_updated_at 
          BEFORE UPDATE ON public.moderator_requests 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_subscribers_updated_at' 
        AND event_object_table = 'subscribers'
    ) THEN
        CREATE TRIGGER update_subscribers_updated_at 
          BEFORE UPDATE ON public.subscribers 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- DATOS INICIALES (SOLO SI NO EXISTEN)
-- =====================================================

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
SELECT 'Migraciones seguras aplicadas exitosamente - ComplicesConecta v3.4.0' as status;
