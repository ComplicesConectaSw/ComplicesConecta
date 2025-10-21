-- =====================================================
-- INVITATIONS SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the Invitations service
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. INVITATIONS TABLE (USING EXISTING TABLE)
-- =====================================================
-- Note: This table already exists in the database as 'invitations'
-- We'll just add any missing columns if they don't exist

-- Add missing columns to existing invitations table if they don't exist
DO $$ 
BEGIN
    -- Check if invitations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations') THEN
        -- Add invitation_type column if it doesn't exist (rename from type)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'invitations' AND column_name = 'invitation_type') THEN
            ALTER TABLE invitations ADD COLUMN invitation_type VARCHAR(20) CHECK (invitation_type IN ('profile', 'gallery', 'chat', 'event', 'meetup'));
        END IF;
        
        -- Add expires_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'invitations' AND column_name = 'expires_at') THEN
            ALTER TABLE invitations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Add metadata column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'invitations' AND column_name = 'metadata') THEN
            ALTER TABLE invitations ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
        
        -- Add status column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'invitations' AND column_name = 'status') THEN
            ALTER TABLE invitations ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired'));
        END IF;
        
        -- Update existing NULL status values to 'pending'
        UPDATE invitations SET status = 'pending' WHERE status IS NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_from_profile ON invitations(from_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile ON invitations(to_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_invitation_type ON invitations(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at DESC);

-- =====================================================
-- 2. GALLERY PERMISSIONS TABLE
-- =====================================================
-- Table for storing gallery access permissions
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    granted_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    granted_to UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'download', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES profiles(user_id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure profiles are different
    CHECK (granted_by != granted_to),
    -- Ensure one permission per granted_by-granted_to pair per type
    UNIQUE(granted_by, granted_to, permission_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_by ON gallery_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_to ON gallery_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_permission_type ON gallery_permissions(permission_type);

-- =====================================================
-- 3. INVITATION RESPONSES TABLE
-- =====================================================
-- Table for storing invitation responses and feedback
CREATE TABLE IF NOT EXISTS invitation_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('accept', 'decline', 'counter_invite')),
    message TEXT,
    counter_invitation_id UUID REFERENCES invitations(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one response per invitation
    UNIQUE(invitation_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitation_responses_invitation_id ON invitation_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_responses_response_type ON invitation_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_invitation_responses_created_at ON invitation_responses(created_at);

-- =====================================================
-- 4. INVITATION TEMPLATES TABLE
-- =====================================================
-- Table for storing invitation templates
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    invitation_type VARCHAR(20) NOT NULL CHECK (invitation_type IN ('profile', 'gallery', 'chat', 'event', 'meetup')),
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitation_templates_invitation_type ON invitation_templates(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_is_active ON invitation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_created_by ON invitation_templates(created_by);

-- =====================================================
-- 5. INVITATION ANALYTICS TABLE
-- =====================================================
-- Table for storing invitation analytics
CREATE TABLE IF NOT EXISTS invitation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('sent', 'viewed', 'responded', 'expired', 'reminder_sent')),
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_invitation_id ON invitation_analytics(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_event_type ON invitation_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_created_at ON invitation_analytics(created_at);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_analytics ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "invitations_own_data" ON invitations
    FOR ALL USING (
        from_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
        to_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "invitations_admin_read" ON invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Gallery Permissions policies
CREATE POLICY "gallery_permissions_own_data" ON gallery_permissions
    FOR ALL USING (
        granted_by IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
        granted_to IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "gallery_permissions_admin_read" ON gallery_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Invitation Responses policies
CREATE POLICY "invitation_responses_own_data" ON invitation_responses
    FOR ALL USING (
        invitation_id IN (
            SELECT id FROM invitations 
            WHERE from_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Invitation Templates policies
CREATE POLICY "invitation_templates_public_read" ON invitation_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "invitation_templates_admin_all" ON invitation_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Invitation Analytics policies
CREATE POLICY "invitation_analytics_own_data" ON invitation_analytics
    FOR ALL USING (
        invitation_id IN (
            SELECT id FROM invitations 
            WHERE from_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "invitation_analytics_admin_read" ON invitation_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_invitations_updated_at 
    BEFORE UPDATE ON invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_permissions_updated_at 
    BEFORE UPDATE ON gallery_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_templates_updated_at 
    BEFORE UPDATE ON invitation_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark invitations as expired if they've passed their expiry date
    -- Only if expires_at column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invitations' AND column_name = 'expires_at') THEN
        UPDATE invitations 
        SET status = 'expired', decided_at = NOW()
        WHERE expires_at < NOW() 
        AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for invitation expiration
CREATE TRIGGER expire_old_invitations_trigger
    AFTER INSERT ON invitations
    FOR EACH ROW EXECUTE FUNCTION expire_old_invitations();

-- Function to automatically create gallery permission when invitation is accepted
CREATE OR REPLACE FUNCTION create_gallery_permission_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    -- If invitation is accepted and type is gallery, create permission
    IF NEW.status = 'accepted' AND (NEW.invitation_type = 'gallery' OR NEW.type = 'gallery') THEN
        INSERT INTO gallery_permissions (granted_by, granted_to, permission_type)
        VALUES (NEW.from_profile, NEW.to_profile, 'view')
        ON CONFLICT (granted_by, granted_to, permission_type) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic gallery permission creation
CREATE TRIGGER create_gallery_permission_trigger
    AFTER UPDATE ON invitations
    FOR EACH ROW EXECUTE FUNCTION create_gallery_permission_on_accept();

-- =====================================================
-- 8. VIEWS FOR ANALYTICS
-- =====================================================

-- View for invitation statistics
CREATE OR REPLACE VIEW invitation_statistics AS
SELECT 
    i.from_profile,
    COALESCE(i.invitation_type, i.type) as invitation_type,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN COALESCE(i.status, 'pending') = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN COALESCE(i.status, 'pending') = 'declined' THEN 1 END) as declined_count,
    COUNT(CASE WHEN COALESCE(i.status, 'pending') = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN COALESCE(i.status, 'pending') = 'expired' THEN 1 END) as expired_count,
    ROUND(
        COUNT(CASE WHEN COALESCE(i.status, 'pending') = 'accepted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN COALESCE(i.status, 'pending') IN ('accepted', 'declined') THEN 1 END), 0) * 100, 
        2
    ) as acceptance_rate,
    MAX(i.created_at) as last_sent_date
FROM invitations i
GROUP BY i.from_profile, COALESCE(i.invitation_type, i.type);

-- View for gallery permission summary
CREATE OR REPLACE VIEW gallery_permission_summary AS
SELECT 
    gp.granted_by as owner_profile,
    gp.permission_type,
    COUNT(*) as total_permissions,
    COUNT(CASE WHEN COALESCE(gp.status, 'active') = 'active' THEN 1 END) as active_permissions,
    COUNT(CASE WHEN COALESCE(gp.status, 'active') = 'revoked' THEN 1 END) as revoked_permissions,
    COUNT(CASE WHEN COALESCE(gp.status, 'active') = 'expired' THEN 1 END) as expired_permissions,
    MAX(gp.granted_at) as last_granted_date
FROM gallery_permissions gp
GROUP BY gp.granted_by, gp.permission_type;

-- View for invitation performance by type
CREATE OR REPLACE VIEW invitation_performance AS
SELECT 
    COALESCE(invitation_type, type) as invitation_type,
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN COALESCE(status, 'pending') = 'accepted' THEN 1 END) as accepted,
    COUNT(CASE WHEN COALESCE(status, 'pending') = 'declined' THEN 1 END) as declined,
    COUNT(CASE WHEN COALESCE(status, 'pending') = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN COALESCE(status, 'pending') = 'expired' THEN 1 END) as expired,
    ROUND(
        COUNT(CASE WHEN COALESCE(status, 'pending') = 'accepted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN COALESCE(status, 'pending') IN ('accepted', 'declined') THEN 1 END), 0) * 100, 
        2
    ) as acceptance_rate,
    AVG(EXTRACT(EPOCH FROM (decided_at - created_at))/3600) as avg_response_hours
FROM invitations
GROUP BY COALESCE(invitation_type, type)
ORDER BY total_invitations DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The Invitations service can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - invitations: Main invitations data
-- - gallery_permissions: Gallery access permissions
-- - invitation_responses: Invitation responses and feedback
-- - invitation_templates: Reusable invitation templates
-- - invitation_analytics: Invitation analytics and tracking
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic invitation expiration
-- - Automatic gallery permission creation
-- - Performance indexes
-- - Analytics views
-- =====================================================
