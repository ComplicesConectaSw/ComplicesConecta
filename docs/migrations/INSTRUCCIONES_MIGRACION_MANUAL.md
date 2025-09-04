# Instrucciones para Aplicar Migraciones Manualmente

## Problema Actual
El CLI de Supabase falla al aplicar migraciones debido a un trigger duplicado. Las siguientes tablas faltan en la base de datos remota:
- `faq_items` (FAQ del panel admin)
- `app_metrics` (métricas de la aplicación)
- `apk_downloads` (descargas del APK)

## Solución: Aplicar SQL Manualmente

### Paso 1: Acceder al Dashboard de Supabase
1. Ir a https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim
2. Navegar a SQL Editor

### Paso 2: Ejecutar el siguiente SQL

```sql
-- 1. Resolver trigger duplicado primero
DROP TRIGGER IF EXISTS update_user_token_balances_updated_at ON user_token_balances;
CREATE TRIGGER update_user_token_balances_updated_at 
    BEFORE UPDATE ON user_token_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Crear tabla FAQ
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

-- 3. Crear tabla de métricas
CREATE TABLE IF NOT EXISTS public.app_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value integer DEFAULT 0,
  metric_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_name, metric_date)
);

-- 4. Crear tabla de descargas APK
CREATE TABLE IF NOT EXISTS public.apk_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text,
  ip_address inet,
  download_date timestamptz DEFAULT now(),
  version text DEFAULT '1.0.0'
);

-- 5. Insertar datos iniciales
INSERT INTO public.faq_items (question, answer, category, display_order) VALUES
('¿Cómo funciona ComplicesConecta?', 'ComplicesConecta es una plataforma que conecta personas con intereses similares en el lifestyle swinger de manera segura y discreta.', 'general', 1),
('¿Es segura la plataforma?', 'Sí, utilizamos verificación WorldID, encriptación de extremo a extremo y medidas de seguridad avanzadas para proteger tu privacidad.', 'seguridad', 2),
('¿Qué son los tokens CMPX?', 'Los tokens CMPX son nuestra moneda digital que puedes ganar por referidos y usar para acceder a funciones premium.', 'tokens', 3),
('¿Cómo puedo verificar mi cuenta?', 'Puedes verificar tu cuenta usando WorldID para obtener mayor credibilidad y acceso a funciones adicionales.', 'verificacion', 4),
('¿Qué incluye la membresía Premium?', 'La membresía Premium incluye chat ilimitado, acceso a galerías privadas, filtros avanzados y soporte prioritario.', 'premium', 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.app_metrics (metric_name, metric_value) VALUES
('daily_visits', 0),
('total_matches', 0),
('apk_downloads', 0),
('total_tokens_distributed', 0),
('staked_tokens', 0),
('rewards_distributed', 0)
ON CONFLICT (metric_name, metric_date) DO NOTHING;

-- 6. Configurar RLS y políticas
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;

-- Políticas para FAQ
DROP POLICY IF EXISTS "FAQ items are viewable by everyone" ON public.faq_items;
CREATE POLICY "FAQ items are viewable by everyone" ON public.faq_items
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can manage FAQ items" ON public.faq_items;
CREATE POLICY "Only admins can manage FAQ items" ON public.faq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Políticas para métricas
DROP POLICY IF EXISTS "Only admins can view metrics" ON public.app_metrics;
CREATE POLICY "Only admins can view metrics" ON public.app_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can manage metrics" ON public.app_metrics;
CREATE POLICY "Only admins can manage metrics" ON public.app_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Políticas para descargas APK
DROP POLICY IF EXISTS "Only admins can view APK downloads" ON public.apk_downloads;
CREATE POLICY "Only admins can view APK downloads" ON public.apk_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 7. Crear índices
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON public.faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON public.faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_items_display_order ON public.faq_items(display_order);
CREATE INDEX IF NOT EXISTS idx_app_metrics_name ON public.app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_app_metrics_date ON public.app_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_apk_downloads_date ON public.apk_downloads(download_date);

-- 8. Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_faq_items_updated_at ON public.faq_items;
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_metrics_updated_at ON public.app_metrics;
CREATE TRIGGER update_app_metrics_updated_at BEFORE UPDATE ON public.app_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Paso 3: Después de ejecutar el SQL
1. Regenerar tipos: `supabase gen types typescript --project-id axtvqnozatbmllvwzuim > src/integrations/supabase/types.ts`
2. Actualizar código en AdminProduction.tsx para usar datos reales

## Estado Actual
- ✅ Tablas de tokens creadas (con trigger corregido)
- ❌ Tablas FAQ, métricas y descargas APK pendientes
- ❌ Tipos de TypeScript desactualizados
- ❌ AdminProduction usando datos mock temporales
