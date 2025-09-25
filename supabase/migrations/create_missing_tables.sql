-- Script para crear tablas faltantes en Supabase
-- Fecha: 2025-09-13
-- Propósito: Resolver errores 404 en AdminProduction

-- 1. Tabla FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla App Metrics
CREATE TABLE IF NOT EXISTS app_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL UNIQUE,
    metric_value BIGINT DEFAULT 0,
    metric_type TEXT DEFAULT 'counter', -- counter, gauge, histogram
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla APK Downloads
CREATE TABLE IF NOT EXISTS apk_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version TEXT NOT NULL,
    download_count BIGINT DEFAULT 0,
    file_size BIGINT, -- en bytes
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla User Token Balances
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT DEFAULT 0,
    gtk_balance BIGINT DEFAULT 0,
    last_claim_date TIMESTAMP WITH TIME ZONE,
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Insertar datos iniciales para FAQ (solo si no existen)
INSERT INTO faq_items (question, answer, display_order, is_active) 
SELECT * FROM (VALUES
    ('¿Qué es ComplicesConecta?', 'ComplicesConecta es una plataforma social para conectar personas afines en un entorno seguro.', 1, true),
    ('¿Cómo funciona el sistema de tokens?', 'Los tokens CMPX/GTK se utilizan para acceder a funciones premium de la aplicación.', 2, true),
    ('¿Es segura la plataforma?', 'Sí, implementamos las mejores prácticas de seguridad y privacidad para proteger tus datos.', 3, true),
    ('¿Cómo puedo contactar soporte?', 'Puedes contactarnos a través del email complicesconectasw@outlook.es', 4, true)
) AS v(question, answer, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM faq_items WHERE faq_items.question = v.question);

-- Insertar métricas iniciales (solo si no existen)
INSERT INTO app_metrics (metric_name, metric_value, metric_type, description)
SELECT * FROM (VALUES
    ('total_users', 0, 'counter', 'Número total de usuarios registrados'),
    ('premium_users', 0, 'counter', 'Usuarios con suscripción premium'),
    ('verified_users', 0, 'counter', 'Usuarios verificados'),
    ('daily_active_users', 0, 'gauge', 'Usuarios activos diarios'),
    ('monthly_active_users', 0, 'gauge', 'Usuarios activos mensuales'),
    ('total_matches', 0, 'counter', 'Total de matches realizados'),
    ('total_messages', 0, 'counter', 'Total de mensajes enviados')
) AS v(metric_name, metric_value, metric_type, description)
WHERE NOT EXISTS (SELECT 1 FROM app_metrics WHERE app_metrics.metric_name = v.metric_name);

-- Insertar datos iniciales para APK Downloads (solo si no existen)
INSERT INTO apk_downloads (version, download_count, file_size, download_url, is_active)
SELECT * FROM (VALUES
    ('1.3.3', 0, 25600000, '/downloads/complices-conecta-v1.3.3.apk', true),
    ('1.3.2', 15, 24800000, '/downloads/complices-conecta-v1.3.2.apk', false),
    ('1.3.1', 8, 24500000, '/downloads/complices-conecta-v1.3.1.apk', false)
) AS v(version, download_count, file_size, download_url, is_active)
WHERE NOT EXISTS (SELECT 1 FROM apk_downloads WHERE apk_downloads.version = v.version);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_faq_items_active_order ON faq_items(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_app_metrics_name ON app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_apk_downloads_active ON apk_downloads(is_active, version);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user ON user_token_balances(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE apk_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para FAQ Items (solo lectura pública)
CREATE POLICY "FAQ items are viewable by everyone" ON faq_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "FAQ items are manageable by admins" ON faq_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas RLS para App Metrics (solo admins)
CREATE POLICY "App metrics are viewable by admins" ON app_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "App metrics are manageable by admins" ON app_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas RLS para APK Downloads (lectura pública, gestión admin)
CREATE POLICY "APK downloads are viewable by everyone" ON apk_downloads
    FOR SELECT USING (is_active = true);

CREATE POLICY "APK downloads are manageable by admins" ON apk_downloads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas RLS para User Token Balances (usuarios ven solo sus datos)
CREATE POLICY "Users can view their own token balance" ON user_token_balances
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own token balance" ON user_token_balances
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all token balances" ON user_token_balances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_metrics_updated_at BEFORE UPDATE ON app_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apk_downloads_updated_at BEFORE UPDATE ON apk_downloads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_token_balances_updated_at BEFORE UPDATE ON user_token_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
