-- =====================================================
-- CREAR TABLAS DE INTERACCIÓN
-- =====================================================
-- Este script crea las tablas de interacción que dependen de las tablas base
-- =====================================================

-- =====================================================
-- 1. STORY INTERACTION TABLES
-- =====================================================

-- Story Likes Table
CREATE TABLE IF NOT EXISTS story_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Story Comments Table
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story Shares Table
CREATE TABLE IF NOT EXISTS story_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL DEFAULT 'share' CHECK (share_type IN ('share', 'repost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES story_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- 2. COUPLE PROFILES INTERACTION TABLES
-- =====================================================

-- Couple Profile Likes Table
CREATE TABLE IF NOT EXISTS couple_profile_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    liker_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(couple_profile_id, liker_profile_id)
);

-- Couple Profile Views Table
CREATE TABLE IF NOT EXISTS couple_profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    viewer_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Couple Profile Reports Table
CREATE TABLE IF NOT EXISTS couple_profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INVITATION RELATED TABLES
-- =====================================================

-- Gallery Permissions Table
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitation Templates Table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitation Statistics Table
CREATE TABLE IF NOT EXISTS invitation_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_invitations INTEGER NOT NULL DEFAULT 0,
    pending_invitations INTEGER NOT NULL DEFAULT 0,
    accepted_invitations INTEGER NOT NULL DEFAULT 0,
    declined_invitations INTEGER NOT NULL DEFAULT 0,
    expired_invitations INTEGER NOT NULL DEFAULT 0,
    acceptance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Story Interaction Indexes
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_user_id ON story_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_story_shares_story_id ON story_shares(story_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Couple Profile Interaction Indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_profile_id ON couple_profile_likes(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liker_id ON couple_profile_likes(liker_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_profile_id ON couple_profile_views(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_profile_id ON couple_profile_reports(couple_profile_id);

-- Invitation Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_id ON gallery_permissions(gallery_owner_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_to ON gallery_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_type ON invitation_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_active ON invitation_templates(is_active);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_statistics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR TABLAS CREADAS
-- =====================================================

SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'story_likes',
        'story_comments',
        'story_shares',
        'comment_likes',
        'couple_profile_likes',
        'couple_profile_views',
        'couple_profile_reports',
        'gallery_permissions',
        'invitation_templates',
        'invitation_statistics'
    )
ORDER BY table_name;
