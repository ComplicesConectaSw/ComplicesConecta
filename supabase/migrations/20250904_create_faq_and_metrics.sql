-- Crear tabla FAQ para preguntas frecuentes
-- Migration: 20250904_create_faq_and_metrics.sql

-- 1. Crear tabla FAQ
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Crear tabla de métricas de la aplicación
CREATE TABLE IF NOT EXISTS public.app_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value integer DEFAULT 0,
  metric_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_name, metric_date)
);

-- 3. Crear tabla de descargas APK
CREATE TABLE IF NOT EXISTS public.apk_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text,
  ip_address inet,
  download_date timestamptz DEFAULT now(),
  version text DEFAULT '1.0.0'
);

-- 4. Insertar FAQs iniciales
INSERT INTO public.faq_items (question, answer, category, display_order) VALUES
('¿Cómo funciona ComplicesConecta?', 'ComplicesConecta es una plataforma que conecta personas con intereses similares en el lifestyle swinger de manera segura y discreta.', 'general', 1),
('¿Es segura la plataforma?', 'Sí, utilizamos verificación WorldID, encriptación de extremo a extremo y medidas de seguridad avanzadas para proteger tu privacidad.', 'seguridad', 2),
('¿Qué son los tokens CMPX?', 'Los tokens CMPX son nuestra moneda digital que puedes ganar por referidos y usar para acceder a funciones premium.', 'tokens', 3),
('¿Cómo puedo verificar mi cuenta?', 'Puedes verificar tu cuenta usando WorldID para obtener mayor credibilidad y acceso a funciones adicionales.', 'verificacion', 4),
('¿Qué incluye la membresía Premium?', 'La membresía Premium incluye chat ilimitado, acceso a galerías privadas, filtros avanzados y soporte prioritario.', 'premium', 5);

-- 5. Insertar métricas iniciales
INSERT INTO public.app_metrics (metric_name, metric_value) VALUES
('daily_visits', 0),
('total_matches', 0),
('apk_downloads', 0),
('total_tokens_distributed', 0),
('staked_tokens', 0),
('rewards_distributed', 0)
ON CONFLICT (metric_name, metric_date) DO NOTHING;

-- 6. Habilitar RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS para FAQ (solo lectura pública)
CREATE POLICY "FAQ items are viewable by everyone" ON public.faq_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage FAQ items" ON public.faq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 8. Crear políticas RLS para métricas (solo admins)
CREATE POLICY "Only admins can view metrics" ON public.app_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage metrics" ON public.app_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 9. Crear políticas RLS para descargas APK (solo admins pueden ver)
CREATE POLICY "Only admins can view APK downloads" ON public.apk_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 10. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON public.faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON public.faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_items_display_order ON public.faq_items(display_order);
CREATE INDEX IF NOT EXISTS idx_app_metrics_name ON public.app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_app_metrics_date ON public.app_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_apk_downloads_date ON public.apk_downloads(download_date);

-- 11. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Crear triggers para updated_at
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_metrics_updated_at BEFORE UPDATE ON public.app_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
