-- =====================================================
-- INVITATIONS SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the Invitations service
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. INVITATIONS TABLE
-- =====================================================
-- Main table for storing invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    invitation_type VARCHAR(20) NOT NULL CHECK (invitation_type IN ('profile', 'gallery', 'chat', 'event', 'meetup')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decided_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure profiles are different
    CHECK (from_profile != to_profile),
    -- Ensure one invitation per from-to pair per type
    UNIQUE(from_profile, to_profile, invitation_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_from_profile ON invitations(from_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile ON invitations(to_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_invitation_type ON invitations(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at DESC);

-- =====================================================
-- 2. GALLERY PERMISSIONS TABLE
-- =====================================================
-- Table for storing gallery access permissions
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    grantee_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'download', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure profiles are different
    CHECK (owner_profile != grantee_profile),
    -- Ensure one permission per owner-grantee pair per type
    UNIQUE(owner_profile, grantee_profile, permission_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_profile ON gallery_permissions(owner_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_grantee_profile ON gallery_permissions(grantee_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_permission_type ON gallery_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status ON gallery_permissions(status);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_expires_at ON gallery_permissions(expires_at);

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
    created_by UUID REFERENCES profiles(id),
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
        from_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        to_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
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
        owner_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        grantee_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
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
            WHERE from_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
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
            WHERE from_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
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
    UPDATE invitations 
    SET status = 'expired', decided_at = NOW()
    WHERE expires_at < NOW() 
    AND status = 'pending';
    
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
    IF NEW.status = 'accepted' AND NEW.invitation_type = 'gallery' THEN
        INSERT INTO gallery_permissions (owner_profile, grantee_profile, permission_type)
        VALUES (NEW.from_profile, NEW.to_profile, 'view')
        ON CONFLICT (owner_profile, grantee_profile, permission_type) DO NOTHING;
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
    i.invitation_type,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN i.status = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN i.status = 'declined' THEN 1 END) as declined_count,
    COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN i.status = 'expired' THEN 1 END) as expired_count,
    ROUND(
        COUNT(CASE WHEN i.status = 'accepted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN i.status IN ('accepted', 'declined') THEN 1 END), 0) * 100, 
        2
    ) as acceptance_rate,
    MAX(i.created_at) as last_sent_date
FROM invitations i
GROUP BY i.from_profile, i.invitation_type;

-- View for gallery permission summary
CREATE OR REPLACE VIEW gallery_permission_summary AS
SELECT 
    gp.owner_profile,
    gp.permission_type,
    COUNT(*) as total_permissions,
    COUNT(CASE WHEN gp.status = 'active' THEN 1 END) as active_permissions,
    COUNT(CASE WHEN gp.status = 'revoked' THEN 1 END) as revoked_permissions,
    COUNT(CASE WHEN gp.status = 'expired' THEN 1 END) as expired_permissions,
    MAX(gp.granted_at) as last_granted_date
FROM gallery_permissions gp
GROUP BY gp.owner_profile, gp.permission_type;

-- View for invitation performance by type
CREATE OR REPLACE VIEW invitation_performance AS
SELECT 
    invitation_type,
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
    COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
    ROUND(
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN status IN ('accepted', 'declined') THEN 1 END), 0) * 100, 
        2
    ) as acceptance_rate,
    AVG(EXTRACT(EPOCH FROM (decided_at - created_at))/3600) as avg_response_hours
FROM invitations
GROUP BY invitation_type
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
