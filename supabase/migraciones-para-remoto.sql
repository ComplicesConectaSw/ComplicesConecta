-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: 2025-11-06 22:34:07
-- Version: 3.5.0
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que las tablas se crearon correctamente
-- 
-- =====================================================

-- =====================================================
-- MIGRACION: 20251104000000_create_missing_admin_tables.sql
-- =====================================================

-- Migration: Create Missing Admin Tables
-- Description: Creates tables for admin functionality (comment_likes, user_roles, career_applications, moderator_requests)
-- Date: 04 de Noviembre, 2025
-- Version: 3.5.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMMENT LIKES TABLE
-- =====================================================
-- Table for storing likes on comments
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES story_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per comment
    UNIQUE(comment_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_created_at ON comment_likes(created_at);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view all comment likes" ON comment_likes;
CREATE POLICY "Users can view all comment likes" ON comment_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comment likes" ON comment_likes;
CREATE POLICY "Users can create their own comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comment likes" ON comment_likes;
CREATE POLICY "Users can delete their own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. USER ROLES TABLE
-- =====================================================
-- Table for managing user roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- =====================================================
-- 3. CAREER APPLICATIONS TABLE
-- =====================================================
-- Table for career/job applications
CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_career_applications_user_id ON career_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);

-- Enable RLS
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own career applications" ON career_applications;
CREATE POLICY "Users can view their own career applications" ON career_applications
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all career applications" ON career_applications;
CREATE POLICY "Admins can view all career applications" ON career_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- =====================================================
-- 4. MODERATOR REQUESTS TABLE
-- =====================================================
-- Table for moderator application requests
CREATE TABLE IF NOT EXISTS moderator_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation TEXT NOT NULL,
    experience TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderator_requests_user_id ON moderator_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_moderator_requests_status ON moderator_requests(status);
CREATE INDEX IF NOT EXISTS idx_moderator_requests_created_at ON moderator_requests(created_at);

-- Enable RLS
ALTER TABLE moderator_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own moderator requests" ON moderator_requests;
CREATE POLICY "Users can view their own moderator requests" ON moderator_requests
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all moderator requests" ON moderator_requests;
CREATE POLICY "Admins can view all moderator requests" ON moderator_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_applications_updated_at ON career_applications;
CREATE TRIGGER update_career_applications_updated_at 
    BEFORE UPDATE ON career_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_moderator_requests_updated_at ON moderator_requests;
CREATE TRIGGER update_moderator_requests_updated_at 
    BEFORE UPDATE ON moderator_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE comment_likes IS 'Likes de comentarios en stories';
COMMENT ON TABLE user_roles IS 'Roles de usuarios (admin, moderator, user)';
COMMENT ON TABLE career_applications IS 'Solicitudes de carrera/trabajo';
COMMENT ON TABLE moderator_requests IS 'Solicitudes para ser moderador';



-- =====================================================
-- FIN MIGRACION: 20251104000000_create_missing_admin_tables.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251104000001_create_moderation_tables.sql
-- =====================================================

-- Migration: Create Moderation Tables
-- Description: Creates tables for moderation functionality (moderators, moderation_logs, user_suspensions)
-- Date: 04 de Noviembre, 2025
-- Version: 3.5.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MODERATORS TABLE
-- =====================================================
-- Table for storing moderator information
CREATE TABLE IF NOT EXISTS moderators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    moderator_id VARCHAR(50) UNIQUE,
    level VARCHAR(20) NOT NULL DEFAULT 'junior' CHECK (level IN ('junior', 'senior', 'lead')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderators_user_id ON moderators(user_id);
CREATE INDEX IF NOT EXISTS idx_moderators_moderator_id ON moderators(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderators_is_active ON moderators(is_active);
CREATE INDEX IF NOT EXISTS idx_moderators_level ON moderators(level);

-- Enable RLS
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own moderator record" ON moderators;
CREATE POLICY "Users can view their own moderator record" ON moderators
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all moderators" ON moderators;
CREATE POLICY "Admins can manage all moderators" ON moderators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- =====================================================
-- 2. MODERATION LOGS TABLE
-- =====================================================
-- Table for logging moderation actions
CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('warn', 'suspend', 'ban', 'delete', 'approve', 'reject', 'edit')),
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('user', 'post', 'comment', 'report', 'content')),
    target_id UUID NOT NULL,
    reason TEXT,
    details JSONB DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action_type ON moderation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_type ON moderation_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_id ON moderation_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_severity ON moderation_logs(severity);

-- Enable RLS
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Moderators can view their own logs" ON moderation_logs;
CREATE POLICY "Moderators can view their own logs" ON moderation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM moderators m 
            WHERE m.id = moderation_logs.moderator_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all moderation logs" ON moderation_logs;
CREATE POLICY "Admins can view all moderation logs" ON moderation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

DROP POLICY IF EXISTS "Moderators can create logs" ON moderation_logs;
CREATE POLICY "Moderators can create logs" ON moderation_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM moderators m 
            WHERE m.id = moderation_logs.moderator_id 
            AND m.user_id = auth.uid()
            AND m.is_active = true
        )
    );

-- =====================================================
-- 3. USER SUSPENSIONS TABLE
-- =====================================================
-- Table for managing user suspensions
CREATE TABLE IF NOT EXISTS user_suspensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES moderators(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    suspension_type VARCHAR(20) NOT NULL DEFAULT 'temporary' CHECK (suspension_type IN ('temporary', 'permanent')),
    duration_days INTEGER,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_moderator_id ON user_suspensions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_is_active ON user_suspensions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_starts_at ON user_suspensions(starts_at);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_ends_at ON user_suspensions(ends_at);

-- Enable RLS
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own suspensions" ON user_suspensions;
CREATE POLICY "Users can view their own suspensions" ON user_suspensions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Moderators can view all suspensions" ON user_suspensions;
CREATE POLICY "Moderators can view all suspensions" ON user_suspensions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM moderators m 
            WHERE m.user_id = auth.uid()
            AND m.is_active = true
        )
    );

DROP POLICY IF EXISTS "Moderators can manage suspensions" ON user_suspensions;
CREATE POLICY "Moderators can manage suspensions" ON user_suspensions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM moderators m 
            WHERE m.user_id = auth.uid()
            AND m.is_active = true
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_moderators_updated_at ON moderators;
CREATE TRIGGER update_moderators_updated_at 
    BEFORE UPDATE ON moderators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_suspensions_updated_at ON user_suspensions;
CREATE TRIGGER update_user_suspensions_updated_at 
    BEFORE UPDATE ON user_suspensions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE moderators IS 'Información de moderadores';
COMMENT ON TABLE moderation_logs IS 'Logs de acciones de moderación';
COMMENT ON TABLE user_suspensions IS 'Suspensiones de usuarios';



-- =====================================================
-- FIN MIGRACION: 20251104000001_create_moderation_tables.sql
-- =====================================================

-- =====================================================
-- MIGRACION: 20251104000002_create_media_tables.sql
-- =====================================================

-- Migration: Create Media Tables
-- Description: Creates tables for media management (media, images, media_access_logs)
-- Date: 04 de Noviembre, 2025
-- Version: 3.5.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MEDIA TABLE
-- =====================================================
-- Table for storing media files (images, videos, etc.)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document', 'other')),
    mime_type VARCHAR(100),
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- For video/audio in seconds
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON media(is_public);
CREATE INDEX IF NOT EXISTS idx_media_is_verified ON media(is_verified);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view public media" ON media;
CREATE POLICY "Users can view public media" ON media
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own media" ON media;
CREATE POLICY "Users can view their own media" ON media
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own media" ON media;
CREATE POLICY "Users can create their own media" ON media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own media" ON media;
CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own media" ON media;
CREATE POLICY "Users can delete their own media" ON media
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. IMAGES TABLE (if not exists from create_images_table.sql)
-- =====================================================
-- Table for storing image-specific data
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_images_profile_id ON images(profile_id);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_is_verified ON images(is_verified);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_images_sort_order ON images(sort_order);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view public images" ON images;
CREATE POLICY "Users can view public images" ON images
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own images" ON images;
CREATE POLICY "Users can view their own images" ON images
    FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can create their own images" ON images;
CREATE POLICY "Users can create their own images" ON images
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own images" ON images;
CREATE POLICY "Users can update their own images" ON images
    FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own images" ON images;
CREATE POLICY "Users can delete their own images" ON images
    FOR DELETE USING (auth.uid() = profile_id);

-- =====================================================
-- 3. MEDIA ACCESS LOGS TABLE
-- =====================================================
-- Table for logging media access
CREATE TABLE IF NOT EXISTS media_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE SET NULL,
    media_path TEXT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download', 'denied', 'upload', 'delete')),
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_access_logs_user_id ON media_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_media_id ON media_access_logs(media_id);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_action ON media_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_created_at ON media_access_logs(created_at);

-- Enable RLS
ALTER TABLE media_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own access logs" ON media_access_logs;
CREATE POLICY "Users can view their own access logs" ON media_access_logs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can log access" ON media_access_logs;
CREATE POLICY "System can log access" ON media_access_logs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all access logs" ON media_access_logs;
CREATE POLICY "Admins can view all access logs" ON media_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for images updated_at
CREATE OR REPLACE FUNCTION update_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at 
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_images_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE media IS 'Archivos multimedia (imágenes, videos, etc.)';
COMMENT ON TABLE images IS 'Imágenes de perfiles';
COMMENT ON TABLE media_access_logs IS 'Logs de acceso a medios';



-- =====================================================
-- FIN MIGRACION: 20251104000002_create_media_tables.sql
-- =====================================================

-- =====================================================
-- VERIFICACION DE TABLAS CREADAS
-- =====================================================

-- Verificar tablas creadas
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN '✓ Existe'
        ELSE '✗ No existe'
    END as estado
FROM (VALUES
    ('comment_likes'),
    ('user_roles'),
    ('career_applications'),
    ('moderator_requests'),
    ('moderators'),
    ('moderation_logs'),
    ('user_suspensions'),
    ('media'),
    ('images'),
    ('media_access_logs')
) AS t(table_name);

-- Contar total de tablas
SELECT 
    COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

