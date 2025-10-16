-- Script final para aplicar migraciones en Supabase
-- ComplicesConecta v3.4.0 - Solo tablas que realmente faltan
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR TABLAS EXISTENTES
-- =====================================================

-- Verificar qué tablas ya existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'faq_items',
  'app_metrics', 
  'apk_downloads',
  'notifications',
  'reports',
  'user_roles',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY table_name;

-- =====================================================
-- CREAR SOLO TABLAS QUE FALTAN
-- =====================================================

-- Tabla FAQ Items (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faq_items' AND table_schema = 'public') THEN
    CREATE TABLE public.faq_items (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      is_active BOOLEAN DEFAULT true,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Habilitar RLS
    ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "FAQ items are public for reading" ON public.faq_items
      FOR SELECT USING (is_active = true);
    
    -- Índices
    CREATE INDEX idx_faq_items_category ON public.faq_items(category);
    CREATE INDEX idx_faq_items_active ON public.faq_items(is_active);
    
    -- Datos iniciales
    INSERT INTO public.faq_items (question, answer, category, order_index) VALUES
    ('¿Qué es ComplicesConecta?', 'ComplicesConecta es una plataforma social para adultos que busca conectar personas con intereses similares en un ambiente seguro y discreto.', 'general', 1),
    ('¿Cómo funciona el sistema de verificación?', 'Utilizamos múltiples métodos de verificación incluyendo verificación de identidad, verificación de parejas y verificación de intereses para garantizar la autenticidad de los perfiles.', 'verification', 2),
    ('¿Es seguro compartir información personal?', 'Sí, utilizamos encriptación de extremo a extremo y políticas de privacidad estrictas. Nunca compartimos información personal con terceros sin tu consentimiento explícito.', 'privacy', 3),
    ('¿Cómo funciona el sistema de tokens?', 'Los tokens CMPX y GTK te permiten acceder a funciones premium, participar en eventos especiales y obtener beneficios exclusivos en la plataforma.', 'tokens', 4),
    ('¿Puedo usar la plataforma de forma anónima?', 'Sí, respetamos tu privacidad. Puedes configurar tu nivel de privacidad y compartir solo la información que te sientas cómodo compartiendo.', 'privacy', 5);
    
    RAISE NOTICE 'Tabla faq_items creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla faq_items ya existe';
  END IF;
END $$;

-- Tabla App Metrics (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_metrics' AND table_schema = 'public') THEN
    CREATE TABLE public.app_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      metric_value DECIMAL(10,4) NOT NULL,
      metric_type VARCHAR(50) DEFAULT 'counter',
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
    
    -- Habilitar RLS
    ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
    
    -- Índices
    CREATE INDEX idx_app_metrics_name ON public.app_metrics(metric_name);
    CREATE INDEX idx_app_metrics_recorded_at ON public.app_metrics(recorded_at);
    
    RAISE NOTICE 'Tabla app_metrics creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla app_metrics ya existe';
  END IF;
END $$;

-- Tabla APK Downloads (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apk_downloads' AND table_schema = 'public') THEN
    CREATE TABLE public.apk_downloads (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ip_address INET,
      user_agent TEXT,
      download_source VARCHAR(50) DEFAULT 'direct',
      version VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Habilitar RLS
    ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;
    
    -- Índices
    CREATE INDEX idx_apk_downloads_user_id ON public.apk_downloads(user_id);
    CREATE INDEX idx_apk_downloads_created_at ON public.apk_downloads(created_at);
    
    RAISE NOTICE 'Tabla apk_downloads creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla apk_downloads ya existe';
  END IF;
END $$;

-- Tabla Notifications (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    CREATE TABLE public.notifications (
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
    
    -- Habilitar RLS
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "Users can see their own notifications" ON public.notifications
      FOR ALL USING (auth.uid() = user_id);
    
    -- Índices
    CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
    CREATE INDEX idx_notifications_read ON public.notifications(is_read);
    
    RAISE NOTICE 'Tabla notifications creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla notifications ya existe';
  END IF;
END $$;

-- Tabla Reports (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public') THEN
    CREATE TABLE public.reports (
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
    
    -- Habilitar RLS
    ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "Users can see their own reports" ON public.reports
      FOR ALL USING (auth.uid() = reporter_id);
    
    -- Índices
    CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
    CREATE INDEX idx_reports_status ON public.reports(status);
    
    RAISE NOTICE 'Tabla reports creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla reports ya existe';
  END IF;
END $$;

-- Tabla User Roles (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    CREATE TABLE public.user_roles (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
      granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      UNIQUE(user_id, role)
    );
    
    -- Habilitar RLS
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Índices
    CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
    CREATE INDEX idx_user_roles_role ON public.user_roles(role);
    
    RAISE NOTICE 'Tabla user_roles creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla user_roles ya existe';
  END IF;
END $$;

-- Tabla Career Applications (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'career_applications' AND table_schema = 'public') THEN
    CREATE TABLE public.career_applications (
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
    
    -- Habilitar RLS
    ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "Users can see their own career applications" ON public.career_applications
      FOR ALL USING (auth.uid() = user_id);
    
    -- Índices
    CREATE INDEX idx_career_applications_user_id ON public.career_applications(user_id);
    CREATE INDEX idx_career_applications_status ON public.career_applications(status);
    
    RAISE NOTICE 'Tabla career_applications creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla career_applications ya existe';
  END IF;
END $$;

-- Tabla Moderator Requests (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'moderator_requests' AND table_schema = 'public') THEN
    CREATE TABLE public.moderator_requests (
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
    
    -- Habilitar RLS
    ALTER TABLE public.moderator_requests ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "Users can see their own moderator requests" ON public.moderator_requests
      FOR ALL USING (auth.uid() = user_id);
    
    -- Índices
    CREATE INDEX idx_moderator_requests_user_id ON public.moderator_requests(user_id);
    CREATE INDEX idx_moderator_requests_status ON public.moderator_requests(status);
    
    RAISE NOTICE 'Tabla moderator_requests creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla moderator_requests ya existe';
  END IF;
END $$;

-- Tabla Subscribers (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers' AND table_schema = 'public') THEN
    CREATE TABLE public.subscribers (
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
    
    -- Habilitar RLS
    ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
    
    -- Política básica
    CREATE POLICY "Users can see their own subscription" ON public.subscribers
      FOR ALL USING (auth.uid() = user_id);
    
    -- Índices
    CREATE INDEX idx_subscribers_email ON public.subscribers(email);
    CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
    
    RAISE NOTICE 'Tabla subscribers creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla subscribers ya existe';
  END IF;
END $$;

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Crear función para actualizar timestamps (solo si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA TIMESTAMPS
-- =====================================================

-- Triggers para actualizar timestamps (solo si no existen)
DO $$
BEGIN
  -- Trigger para reports
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_reports_updated_at') THEN
    CREATE TRIGGER update_reports_updated_at 
      BEFORE UPDATE ON public.reports 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger para career_applications
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_career_applications_updated_at') THEN
    CREATE TRIGGER update_career_applications_updated_at 
      BEFORE UPDATE ON public.career_applications 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger para moderator_requests
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_moderator_requests_updated_at') THEN
    CREATE TRIGGER update_moderator_requests_updated_at 
      BEFORE UPDATE ON public.moderator_requests 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger para subscribers
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_subscribers_updated_at') THEN
    CREATE TRIGGER update_subscribers_updated_at 
      BEFORE UPDATE ON public.subscribers 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'faq_items',
  'app_metrics',
  'apk_downloads',
  'notifications',
  'reports',
  'user_roles',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY table_name;

-- Mensaje de confirmación
SELECT 'Migraciones finales aplicadas exitosamente - ComplicesConecta v3.4.0' as status;
