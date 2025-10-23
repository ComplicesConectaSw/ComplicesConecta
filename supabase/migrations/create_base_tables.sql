-- =====================================================
-- CREAR TABLAS BASE NECESARIAS
-- =====================================================
-- Este script crea las tablas base que necesitan las otras tablas
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    age INTEGER,
    gender VARCHAR(20),
    location VARCHAR(255),
    interests TEXT[],
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user',
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. STORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    content_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video')),
    content_url TEXT,
    media_urls TEXT[],
    location VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. COUPLE PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_name VARCHAR(100) NOT NULL,
    couple_bio TEXT,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('man-woman', 'man-man', 'woman-woman')),
    partner1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    couple_images TEXT[],
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_type VARCHAR(50) DEFAULT 'friend_request' CHECK (invitation_type IN ('friend_request', 'gallery_access', 'event_invite')),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_content_type ON stories(content_type);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

-- Couple profiles indexes
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner1_id ON couple_profiles(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner2_id ON couple_profiles(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_relationship_type ON couple_profiles(relationship_type);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_verified ON couple_profiles(is_verified);

-- Invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_user_id ON invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_type ON invitations(type);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR TABLAS CREADAS
-- =====================================================

SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles',
        'stories',
        'couple_profiles',
        'invitations'
    )
ORDER BY table_name;
