-- =====================================================
-- COUPLE PROFILES SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the CoupleProfiles service
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COUPLE PROFILES TABLE
-- =====================================================
-- Main table for storing couple profiles
CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_name VARCHAR(255) NOT NULL,
    couple_bio TEXT,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('man-woman', 'man-man', 'woman-woman')),
    partner1_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    partner2_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    couple_images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    looking_for TEXT,
    experience_level VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure partners are different
    CHECK (partner1_id != partner2_id),
    -- Ensure one couple profile per partner pair
    UNIQUE(partner1_id, partner2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner1_id ON couple_profiles(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner2_id ON couple_profiles(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_relationship_type ON couple_profiles(relationship_type);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_verified ON couple_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_premium ON couple_profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_created_at ON couple_profiles(created_at DESC);

-- =====================================================
-- 2. COUPLE PROFILE VIEWS TABLE
-- =====================================================
-- Table for tracking couple profile views
CREATE TABLE IF NOT EXISTS couple_profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    viewer_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_date DATE DEFAULT CURRENT_DATE,
    
    -- Ensure one view per viewer per couple profile per day
    UNIQUE(couple_profile_id, viewer_profile_id, viewed_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_couple_profile_id ON couple_profile_views(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewer_profile_id ON couple_profile_views(viewer_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewed_at ON couple_profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewed_date ON couple_profile_views(viewed_date);

-- Function to update viewed_date when viewed_at changes
CREATE OR REPLACE FUNCTION update_viewed_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.viewed_date = DATE(NEW.viewed_at);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic viewed_date updates
DROP TRIGGER IF EXISTS update_couple_profile_views_viewed_date ON couple_profile_views;
CREATE TRIGGER update_couple_profile_views_viewed_date
    BEFORE INSERT OR UPDATE ON couple_profile_views
    FOR EACH ROW EXECUTE FUNCTION update_viewed_date();

-- =====================================================
-- 3. COUPLE PROFILE LIKES TABLE
-- =====================================================
-- Table for storing couple profile likes
CREATE TABLE IF NOT EXISTS couple_profile_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    liker_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per liker per couple profile
    UNIQUE(couple_profile_id, liker_profile_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_couple_profile_id ON couple_profile_likes(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liker_profile_id ON couple_profile_likes(liker_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liked_at ON couple_profile_likes(liked_at);

-- =====================================================
-- 4. COUPLE PROFILE MATCHES TABLE
-- =====================================================
-- Table for storing couple profile matches
CREATE TABLE IF NOT EXISTS couple_profile_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile1_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    couple_profile2_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_interaction TIMESTAMP WITH TIME ZONE,
    
    -- Ensure couples are different
    CHECK (couple_profile1_id != couple_profile2_id),
    -- Ensure one match per couple pair
    UNIQUE(couple_profile1_id, couple_profile2_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_couple_profile1_id ON couple_profile_matches(couple_profile1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_couple_profile2_id ON couple_profile_matches(couple_profile2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_is_active ON couple_profile_matches(is_active);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_matched_at ON couple_profile_matches(matched_at);

-- =====================================================
-- 5. COUPLE PROFILE REPORTS TABLE
-- =====================================================
-- Table for storing couple profile reports
CREATE TABLE IF NOT EXISTS couple_profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('fake', 'inappropriate', 'harassment', 'spam', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES profiles(user_id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one report per reporter per couple profile
    UNIQUE(couple_profile_id, reporter_profile_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_couple_profile_id ON couple_profile_reports(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_reporter_profile_id ON couple_profile_reports(reporter_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_reason ON couple_profile_reports(reason);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_status ON couple_profile_reports(status);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_created_at ON couple_profile_reports(created_at);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_reports ENABLE ROW LEVEL SECURITY;

-- Couple Profiles policies
DROP POLICY IF EXISTS "couple_profiles_public_read" ON couple_profiles;
CREATE POLICY "couple_profiles_public_read" ON couple_profiles
    FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "couple_profiles_own_all" ON couple_profiles;
CREATE POLICY "couple_profiles_own_all" ON couple_profiles
    FOR ALL USING (
        partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
        partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "couple_profiles_premium_read" ON couple_profiles;
CREATE POLICY "couple_profiles_premium_read" ON couple_profiles
    FOR SELECT USING (
        is_premium = true AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_premium = true
        )
    );

-- Couple Profile Views policies
DROP POLICY IF EXISTS "couple_profile_views_own_data" ON couple_profile_views;
CREATE POLICY "couple_profile_views_own_data" ON couple_profile_views
    FOR ALL USING (viewer_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_views_public_read" ON couple_profile_views;
CREATE POLICY "couple_profile_views_public_read" ON couple_profile_views
    FOR SELECT USING (true);

-- Couple Profile Likes policies
DROP POLICY IF EXISTS "couple_profile_likes_own_data" ON couple_profile_likes;
CREATE POLICY "couple_profile_likes_own_data" ON couple_profile_likes
    FOR ALL USING (liker_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_likes_public_read" ON couple_profile_likes;
CREATE POLICY "couple_profile_likes_public_read" ON couple_profile_likes
    FOR SELECT USING (true);

-- Couple Profile Matches policies
DROP POLICY IF EXISTS "couple_profile_matches_own_data" ON couple_profile_matches;
CREATE POLICY "couple_profile_matches_own_data" ON couple_profile_matches
    FOR ALL USING (
        couple_profile1_id IN (
            SELECT id FROM couple_profiles 
            WHERE partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        ) OR
        couple_profile2_id IN (
            SELECT id FROM couple_profiles 
            WHERE partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "couple_profile_matches_public_read" ON couple_profile_matches;
CREATE POLICY "couple_profile_matches_public_read" ON couple_profile_matches
    FOR SELECT USING (true);

-- Couple Profile Reports policies
DROP POLICY IF EXISTS "couple_profile_reports_own_data" ON couple_profile_reports;
CREATE POLICY "couple_profile_reports_own_data" ON couple_profile_reports
    FOR ALL USING (reporter_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_reports_admin_read" ON couple_profile_reports;
CREATE POLICY "couple_profile_reports_admin_read" ON couple_profile_reports
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
DROP TRIGGER IF EXISTS update_couple_profiles_updated_at ON couple_profiles;
CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couple_profile_reports_updated_at ON couple_profile_reports;
CREATE TRIGGER update_couple_profile_reports_updated_at 
    BEFORE UPDATE ON couple_profile_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create mutual match when both couples like each other
CREATE OR REPLACE FUNCTION create_couple_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's a mutual like
    IF EXISTS (
        SELECT 1 FROM couple_profile_likes cpl1
        JOIN couple_profile_likes cpl2 ON cpl1.couple_profile_id = cpl2.liker_profile_id
        WHERE cpl1.liker_profile_id = NEW.couple_profile_id
        AND cpl2.couple_profile_id = NEW.liker_profile_id
    ) THEN
        -- Create match if it doesn't exist
        INSERT INTO couple_profile_matches (couple_profile1_id, couple_profile2_id)
        VALUES (NEW.couple_profile_id, NEW.liker_profile_id)
        ON CONFLICT (couple_profile1_id, couple_profile2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic matching
DROP TRIGGER IF EXISTS create_couple_match_trigger ON couple_profile_likes;
CREATE TRIGGER create_couple_match_trigger
    AFTER INSERT ON couple_profile_likes
    FOR EACH ROW EXECUTE FUNCTION create_couple_match();

-- =====================================================
-- 8. VIEWS FOR ANALYTICS
-- =====================================================

-- View for couple profile statistics
CREATE OR REPLACE VIEW couple_profile_stats AS
SELECT 
    cp.id,
    cp.couple_name,
    cp.relationship_type,
    cp.is_verified,
    cp.is_premium,
    cp.created_at,
    COUNT(DISTINCT cpv.id) as total_views,
    COUNT(DISTINCT cpl.id) as total_likes,
    COUNT(DISTINCT cpm.id) as total_matches,
    'Usuario' as partner1_first_name,
    'Anónimo' as partner1_last_name,
    NULL as partner1_age,
    'Usuario' as partner2_first_name,
    'Anónimo' as partner2_last_name,
    NULL as partner2_age
FROM couple_profiles cp
LEFT JOIN couple_profile_views cpv ON cp.id = cpv.couple_profile_id
LEFT JOIN couple_profile_likes cpl ON cp.id = cpl.couple_profile_id
LEFT JOIN couple_profile_matches cpm ON cp.id = cpm.couple_profile1_id OR cp.id = cpm.couple_profile2_id
WHERE cp.is_verified = true
GROUP BY cp.id, cp.couple_name, cp.relationship_type, cp.is_verified, cp.is_premium, cp.created_at;

-- View for popular couple profiles
CREATE OR REPLACE VIEW popular_couple_profiles AS
SELECT 
    cp.id,
    cp.couple_name,
    cp.relationship_type,
    COUNT(DISTINCT cpl.id) as likes_count,
    COUNT(DISTINCT cpv.id) as views_count,
    COUNT(DISTINCT cpm.id) as matches_count,
    (COUNT(DISTINCT cpl.id) + COUNT(DISTINCT cpv.id) + COUNT(DISTINCT cpm.id)) as engagement_score
FROM couple_profiles cp
LEFT JOIN couple_profile_likes cpl ON cp.id = cpl.couple_profile_id
LEFT JOIN couple_profile_views cpv ON cp.id = cpv.couple_profile_id
LEFT JOIN couple_profile_matches cpm ON cp.id = cpm.couple_profile1_id OR cp.id = cpm.couple_profile2_id
WHERE cp.is_verified = true
GROUP BY cp.id, cp.couple_name, cp.relationship_type
ORDER BY engagement_score DESC, likes_count DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The CoupleProfiles service can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - couple_profiles: Main couple profiles data
-- - couple_profile_views: Profile view tracking
-- - couple_profile_likes: Profile likes tracking
-- - couple_profile_matches: Couple matches
-- - couple_profile_reports: Profile reports for moderation
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic matching system
-- - Performance indexes
-- - Analytics views
-- =====================================================
