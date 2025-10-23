# 📋 TABLAS FALTANTES Y PLAN DE ACCIÓN

## 🔍 **ANÁLISIS DE TABLAS**

### ✅ **TABLAS QUE EXISTEN EN DATABASE.TS:**
```typescript
✅ audit_logs
✅ comment_likes
✅ couple_profile_likes
✅ couple_profile_reports
✅ couple_profile_views
✅ couple_profiles
✅ gallery_permissions
✅ invitation_statistics
✅ invitation_templates
✅ invitations
✅ profiles
✅ referral_leaderboard
✅ referral_rewards
✅ referral_statistics
✅ referral_transactions
✅ staking_records
✅ stories
✅ story_comments
✅ story_likes
✅ story_shares
✅ token_analytics
✅ token_transactions
✅ two_factor_auth
```

### ❌ **TABLAS QUE FALTAN EN DATABASE.TS:**
```typescript
❌ user_referral_balances    // Usada en ReferralTokensService
❌ user_token_balances       // Usada en TokenAnalyticsService
❌ notifications             // Usada en NotificationService
❌ reports                   // Usada en ReportsService
❌ system_metrics            // Usada en MonitoringService
❌ tokens                    // Usada en TokenService
❌ transactions              // Usada en TransactionService
```

## 🎯 **PLAN DE ACCIÓN PARA CREAR TABLAS FALTANTES**

### **FASE 1: TABLAS CRÍTICAS** (Prioridad Alta)

#### **1.1. user_referral_balances**
```sql
-- Tabla para balances de referidos de usuarios
CREATE TABLE IF NOT EXISTS user_referral_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referral_code ON user_referral_balances(referral_code);

-- RLS Policies
ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral balance" ON user_referral_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referral balance" ON user_referral_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_referral_balances_updated_at
    BEFORE UPDATE ON user_referral_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### **1.2. user_token_balances**
```sql
-- Tabla para balances de tokens de usuarios
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    locked_cmpx BIGINT NOT NULL DEFAULT 0,
    locked_gtk BIGINT NOT NULL DEFAULT 0,
    total_earned_cmpx BIGINT NOT NULL DEFAULT 0,
    total_earned_gtk BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);

-- RLS Policies
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own token balance" ON user_token_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own token balance" ON user_token_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_token_balances_updated_at
    BEFORE UPDATE ON user_token_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### **FASE 2: TABLAS DE SERVICIOS** (Prioridad Media)

#### **2.1. notifications**
```sql
-- Tabla para notificaciones del sistema
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'invitation', 'like', 'comment', 'message')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
```

#### **2.2. reports**
```sql
-- Tabla para reportes de usuarios
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_content_id UUID,
    content_type VARCHAR(50) CHECK (content_type IN ('profile', 'post', 'comment', 'message', 'couple_profile')),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON reports(content_type);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
```

### **FASE 3: TABLAS DE MONITOREO** (Prioridad Baja)

#### **3.1. system_metrics**
```sql
-- Tabla para métricas del sistema
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

-- RLS Policies
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System metrics are readable by all" ON system_metrics
    FOR SELECT USING (true);

CREATE POLICY "System can insert metrics" ON system_metrics
    FOR INSERT WITH CHECK (true);
```

#### **3.2. tokens**
```sql
-- Tabla para tokens del sistema
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_type VARCHAR(50) NOT NULL CHECK (token_type IN ('access', 'refresh', 'verification', 'password_reset', 'api')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_is_revoked ON tokens(is_revoked);

-- RLS Policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens" ON tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage tokens" ON tokens
    FOR ALL USING (true);
```

#### **3.3. transactions**
```sql
-- Tabla para transacciones del sistema
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'reward', 'purchase', 'refund')),
    amount DECIMAL(15,4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CMPX',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage transactions" ON transactions
    FOR ALL USING (true);
```

## 🚀 **SCRIPT DE CREACIÓN COMPLETO**

### **Archivo: `database/create_missing_tables_final.sql`**

```sql
-- =====================================================
-- CREACIÓN DE TABLAS FALTANTES - SCRIPT COMPLETO
-- =====================================================
-- Este script crea todas las tablas que faltan en la base de datos
-- de manera segura usando IF NOT EXISTS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FASE 1: TABLAS CRÍTICAS
-- =====================================================

-- 1.1. user_referral_balances
CREATE TABLE IF NOT EXISTS user_referral_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_referral_balances
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referral_code ON user_referral_balances(referral_code);

-- RLS para user_referral_balances
ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referral balance" ON user_referral_balances;
CREATE POLICY "Users can view own referral balance" ON user_referral_balances
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own referral balance" ON user_referral_balances;
CREATE POLICY "Users can update own referral balance" ON user_referral_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para user_referral_balances
DROP TRIGGER IF EXISTS update_user_referral_balances_updated_at ON user_referral_balances;
CREATE TRIGGER update_user_referral_balances_updated_at
    BEFORE UPDATE ON user_referral_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.2. user_token_balances
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    locked_cmpx BIGINT NOT NULL DEFAULT 0,
    locked_gtk BIGINT NOT NULL DEFAULT 0,
    total_earned_cmpx BIGINT NOT NULL DEFAULT 0,
    total_earned_gtk BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_token_balances
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);

-- RLS para user_token_balances
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own token balance" ON user_token_balances;
CREATE POLICY "Users can view own token balance" ON user_token_balances
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own token balance" ON user_token_balances;
CREATE POLICY "Users can update own token balance" ON user_token_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para user_token_balances
DROP TRIGGER IF EXISTS update_user_token_balances_updated_at ON user_token_balances;
CREATE TRIGGER update_user_token_balances_updated_at
    BEFORE UPDATE ON user_token_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FASE 2: TABLAS DE SERVICIOS
-- =====================================================

-- 2.1. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'invitation', 'like', 'comment', 'message')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- 2.2. reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_content_id UUID,
    content_type VARCHAR(50) CHECK (content_type IN ('profile', 'post', 'comment', 'message', 'couple_profile')),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON reports(content_type);

-- RLS para reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Trigger para reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FASE 3: TABLAS DE MONITOREO
-- =====================================================

-- 3.1. system_metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

-- RLS para system_metrics
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System metrics are readable by all" ON system_metrics;
CREATE POLICY "System metrics are readable by all" ON system_metrics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert metrics" ON system_metrics;
CREATE POLICY "System can insert metrics" ON system_metrics
    FOR INSERT WITH CHECK (true);

-- 3.2. tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_type VARCHAR(50) NOT NULL CHECK (token_type IN ('access', 'refresh', 'verification', 'password_reset', 'api')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tokens
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_is_revoked ON tokens(is_revoked);

-- RLS para tokens
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tokens" ON tokens;
CREATE POLICY "Users can view own tokens" ON tokens
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage tokens" ON tokens;
CREATE POLICY "System can manage tokens" ON tokens
    FOR ALL USING (true);

-- 3.3. transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'reward', 'purchase', 'refund')),
    amount DECIMAL(15,4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CMPX',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- RLS para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage transactions" ON transactions;
CREATE POLICY "System can manage transactions" ON transactions
    FOR ALL USING (true);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'user_referral_balances',
        'user_token_balances',
        'notifications',
        'reports',
        'system_metrics',
        'tokens',
        'transactions'
    )
ORDER BY table_name;
```

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **DÍA 1: FASE 1 (Tablas Críticas)**
- [ ] Crear `user_referral_balances`
- [ ] Crear `user_token_balances`
- [ ] Probar servicios que usan estas tablas
- [ ] Verificar que no hay errores de linting

### **DÍA 2: FASE 2 (Tablas de Servicios)**
- [ ] Crear `notifications`
- [ ] Crear `reports`
- [ ] Probar servicios de notificaciones y reportes
- [ ] Verificar funcionalidad completa

### **DÍA 3: FASE 3 (Tablas de Monitoreo)**
- [ ] Crear `system_metrics`
- [ ] Crear `tokens`
- [ ] Crear `transactions`
- [ ] Probar servicios de monitoreo
- [ ] Verificar métricas del sistema

### **DÍA 4: INTEGRACIÓN Y PRUEBAS**
- [ ] Regenerar tipos de Supabase
- [ ] Actualizar servicios para usar tipado correcto
- [ ] Probar integración completa
- [ ] Documentar cambios

## 🔧 **COMANDOS DE EJECUCIÓN**

```bash
# 1. Ejecutar script de creación
docker exec -i supabase_db_axtvqnozatbmllvwzuim psql -U postgres -d postgres < database/create_missing_tables_final.sql

# 2. Verificar creación
docker exec -it supabase_db_axtvqnozatbmllvwzuim psql -U postgres -d postgres -c "\dt"

# 3. Regenerar tipos
supabase gen types typescript --local > src/types/database.ts

# 4. Verificar linting
npm run lint

# 5. Probar servicios
npm run dev
```

## 📊 **MÉTRICAS DE ÉXITO**

- ✅ **0 errores de linting** relacionados con tablas faltantes
- ✅ **100% de servicios** usando tipado correcto
- ✅ **Todas las tablas** creadas y funcionando
- ✅ **RLS policies** implementadas correctamente
- ✅ **Índices** optimizados para performance
- ✅ **Triggers** funcionando correctamente

---

**Fecha**: $(date)  
**Estado**: Plan de acción creado  
**Próximo paso**: Ejecutar Fase 1 del plan
