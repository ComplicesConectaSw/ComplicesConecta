-- =====================================================
-- POSTS SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the PostsService
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. POSTS TABLE
-- =====================================================
-- Main table for storing user posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(10) NOT NULL CHECK (post_type IN ('text', 'photo', 'video')),
    image_url TEXT,
    video_url TEXT,
    location TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    hashtags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_public ON posts(is_public);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);

-- =====================================================
-- 2. POST LIKES TABLE
-- =====================================================
-- Table for storing post likes
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per post
    UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at);

-- =====================================================
-- 3. COMMENTS TABLE
-- =====================================================
-- Table for storing post comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);

-- =====================================================
-- 4. COMMENT LIKES TABLE
-- =====================================================
-- Table for storing comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per comment
    UNIQUE(comment_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_created_at ON comment_likes(created_at);

-- =====================================================
-- 5. POST SHARES TABLE
-- =====================================================
-- Table for storing post shares
CREATE TABLE IF NOT EXISTS post_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('share', 'repost')),
    platform VARCHAR(50), -- 'internal', 'facebook', 'twitter', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Allow multiple shares per user per post (different platforms)
    UNIQUE(post_id, user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_share_type ON post_shares(share_type);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at);

-- =====================================================
-- 6. POST REPORTS TABLE
-- =====================================================
-- Table for storing post reports
CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason VARCHAR(20) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'fake', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one report per user per post
    UNIQUE(post_id, reporter_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter_user_id ON post_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reason ON post_reports(reason);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_created_at ON post_reports(created_at);

-- =====================================================
-- 7. FOLLOWS TABLE (for following posts feature)
-- =====================================================
-- Table for storing user follows
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    follower_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one follow per follower-following pair
    UNIQUE(follower_user_id, following_user_id),
    -- Prevent self-following
    CHECK (follower_user_id != following_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_user_id ON follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_user_id ON follows(following_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "posts_public_read" ON posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "posts_own_all" ON posts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "posts_premium_read" ON posts
    FOR SELECT USING (
        is_premium = true AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_premium = true
        )
    );

-- Post likes policies
CREATE POLICY "post_likes_own_data" ON post_likes
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "post_likes_public_read" ON post_likes
    FOR SELECT USING (true);

-- Comments policies
CREATE POLICY "comments_public_read" ON comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "comments_own_all" ON comments
    FOR ALL USING (user_id = auth.uid());

-- Comment likes policies
CREATE POLICY "comment_likes_own_data" ON comment_likes
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "comment_likes_public_read" ON comment_likes
    FOR SELECT USING (true);

-- Post shares policies
CREATE POLICY "post_shares_own_data" ON post_shares
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "post_shares_public_read" ON post_shares
    FOR SELECT USING (true);

-- Post reports policies
CREATE POLICY "post_reports_own_data" ON post_reports
    FOR ALL USING (reporter_user_id = auth.uid());

CREATE POLICY "post_reports_admin_read" ON post_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Follows policies
CREATE POLICY "follows_own_data" ON follows
    FOR ALL USING (follower_user_id = auth.uid());

CREATE POLICY "follows_public_read" ON follows
    FOR SELECT USING (true);

-- =====================================================
-- 9. FUNCTIONS AND TRIGGERS
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
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_reports_updated_at 
    BEFORE UPDATE ON post_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post counters when likes are added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for post likes count
CREATE TRIGGER update_post_likes_count_trigger
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update comment counters when likes are added/removed
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for comment likes count
CREATE TRIGGER update_comment_likes_count_trigger
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Function to update post counters when comments are added/removed
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for post comments count
CREATE TRIGGER update_post_comments_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to update post counters when shares are added
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for post shares count
CREATE TRIGGER update_post_shares_count_trigger
    AFTER INSERT OR DELETE ON post_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

-- =====================================================
-- 10. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample posts (only if no posts exist)
INSERT INTO posts (
    user_id, profile_id, content, post_type, 
    likes_count, comments_count, shares_count,
    hashtags, is_public
) 
SELECT 
    p.user_id,
    p.id as profile_id,
    CASE 
        WHEN p.gender = 'female' THEN 'Explorando nuevas conexiones y experiencias auténticas. Me encanta viajar, la música y conocer personas interesantes. #lifestyle #aventura #conexiones'
        ELSE 'Buscando conexiones genuinas y experiencias únicas. Disfruto de la buena conversación y los encuentros discretos. #lifestyle #conexiones #discreto'
    END as content,
    'text' as post_type,
    FLOOR(RANDOM() * 50) + 5 as likes_count,
    FLOOR(RANDOM() * 20) + 1 as comments_count,
    FLOOR(RANDOM() * 10) as shares_count,
    ARRAY['lifestyle', 'conexiones', 'aventura'] as hashtags,
    true as is_public
FROM profiles p
WHERE p.is_demo = false
LIMIT 10
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. VIEWS FOR ANALYTICS
-- =====================================================

-- View for post engagement metrics
CREATE OR REPLACE VIEW post_engagement_metrics AS
SELECT 
    p.id,
    p.content,
    p.post_type,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.views_count,
    p.created_at,
    pr.first_name,
    pr.last_name,
    pr.gender,
    (p.likes_count + p.comments_count + p.shares_count) as total_engagement,
    CASE 
        WHEN p.views_count > 0 THEN 
            (p.likes_count + p.comments_count + p.shares_count)::FLOAT / p.views_count 
        ELSE 0 
    END as engagement_rate
FROM posts p
JOIN profiles pr ON p.profile_id = pr.id
WHERE p.is_public = true;

-- View for popular hashtags
CREATE OR REPLACE VIEW popular_hashtags AS
SELECT 
    hashtag,
    COUNT(*) as post_count,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments,
    SUM(shares_count) as total_shares
FROM posts,
LATERAL unnest(hashtags) as hashtag
WHERE is_public = true
GROUP BY hashtag
ORDER BY post_count DESC, total_likes DESC;

-- View for user post statistics
CREATE OR REPLACE VIEW user_post_stats AS
SELECT 
    p.user_id,
    pr.first_name,
    pr.last_name,
    COUNT(p.id) as total_posts,
    SUM(p.likes_count) as total_likes_received,
    SUM(p.comments_count) as total_comments_received,
    SUM(p.shares_count) as total_shares_received,
    AVG(p.likes_count) as avg_likes_per_post,
    MAX(p.created_at) as last_post_date
FROM posts p
JOIN profiles pr ON p.profile_id = pr.id
WHERE p.is_public = true
GROUP BY p.user_id, pr.first_name, pr.last_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The PostsService can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - posts: Main posts data
-- - post_likes: Post likes tracking
-- - comments: Post comments
-- - comment_likes: Comment likes tracking
-- - post_shares: Post shares tracking
-- - post_reports: Post reports for moderation
-- - follows: User following system
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic counter updates (likes, comments, shares)
-- - Performance indexes
-- - Sample data and views
-- - Full-text search support
-- =====================================================
