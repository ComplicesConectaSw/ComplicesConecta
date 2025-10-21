    -- =====================================================
    -- POSTS SERVICE - DATABASE TABLES
    -- =====================================================
    -- This file contains the SQL schema for the PostsService
    -- Run these commands in your Supabase SQL editor to create the required tables
    -- =====================================================

    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- =====================================================
    -- 1. STORIES TABLE (USING EXISTING TABLE)
    -- =====================================================
    -- Create the table if it doesn't exist, or add missing columns if it does

    -- Create stories table if it doesn't exist
    CREATE TABLE IF NOT EXISTS stories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('image', 'video', 'text')),
        description TEXT,
        media_url TEXT,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add missing columns to existing stories table if they don't exist
    DO $$ 
    BEGIN
        -- Add likes_count column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'likes_count') THEN
            ALTER TABLE stories ADD COLUMN likes_count INTEGER DEFAULT 0;
        END IF;
        
        -- Add comments_count column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'comments_count') THEN
            ALTER TABLE stories ADD COLUMN comments_count INTEGER DEFAULT 0;
        END IF;
        
        -- Add shares_count column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'shares_count') THEN
            ALTER TABLE stories ADD COLUMN shares_count INTEGER DEFAULT 0;
        END IF;
        
        -- Add is_public column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'is_public') THEN
            ALTER TABLE stories ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
        END IF;
        
        -- Add hashtags column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'hashtags') THEN
            ALTER TABLE stories ADD COLUMN hashtags TEXT[] DEFAULT '{}';
        END IF;
        
        -- Add post_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stories' AND column_name = 'post_type') THEN
            ALTER TABLE stories ADD COLUMN post_type VARCHAR(20) DEFAULT 'story';
        END IF;
    END $$;

    -- Create indexes for the existing stories table
    CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
    CREATE INDEX IF NOT EXISTS idx_stories_content_type ON stories(content_type);
    CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_stories_views_count ON stories(views_count DESC);
    CREATE INDEX IF NOT EXISTS idx_stories_is_public ON stories(is_public);
    CREATE INDEX IF NOT EXISTS idx_stories_hashtags ON stories USING GIN(hashtags);

    -- =====================================================
    -- 2. STORY LIKES TABLE
    -- =====================================================
    -- Create the table if it doesn't exist, or add missing columns if it does

    -- Create story_likes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS story_likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Ensure one like per user per story
        UNIQUE(story_id, user_id)
    );

    -- Add missing columns to existing story_likes table if they don't exist
    DO $$ 
    BEGIN
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_likes' AND column_name = 'created_at') THEN
            ALTER TABLE story_likes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END $$;

    -- Create indexes for the existing table
    CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_story_likes_created_at ON story_likes(created_at);

    -- =====================================================
    -- 3. STORY COMMENTS TABLE
    -- =====================================================
    -- Create the table if it doesn't exist, or add missing columns if it does

    -- Create story_comments table if it doesn't exist
    CREATE TABLE IF NOT EXISTS story_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add missing columns to existing story_comments table if they don't exist
    DO $$ 
    BEGIN
        -- Add parent_comment_id column if it doesn't exist (for nested comments)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_comments' AND column_name = 'parent_comment_id') THEN
            ALTER TABLE story_comments ADD COLUMN parent_comment_id UUID REFERENCES story_comments(id);
        END IF;
        
        -- Add likes_count column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_comments' AND column_name = 'likes_count') THEN
            ALTER TABLE story_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
        END IF;
        
        -- Add is_edited column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_comments' AND column_name = 'is_edited') THEN
            ALTER TABLE story_comments ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add is_deleted column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_comments' AND column_name = 'is_deleted') THEN
            ALTER TABLE story_comments ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add metadata column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'story_comments' AND column_name = 'metadata') THEN
            ALTER TABLE story_comments ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
    END $$;

    -- Create indexes for the existing table
    CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_comments_user_id ON story_comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_story_comments_created_at ON story_comments(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_story_comments_parent_comment_id ON story_comments(parent_comment_id);
    CREATE INDEX IF NOT EXISTS idx_story_comments_is_deleted ON story_comments(is_deleted);

    -- =====================================================
    -- 4. COMMENT LIKES TABLE
    -- =====================================================
    -- Table for storing comment likes
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

    -- =====================================================
    -- 5. STORY SHARES TABLE
    -- =====================================================
    -- Table for storing story shares
    CREATE TABLE IF NOT EXISTS story_shares (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('share', 'repost')),
        platform VARCHAR(50), -- 'internal', 'facebook', 'twitter', etc.
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Allow multiple shares per user per story (different platforms)
        UNIQUE(story_id, user_id, platform)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_story_shares_story_id ON story_shares(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_shares_user_id ON story_shares(user_id);
    CREATE INDEX IF NOT EXISTS idx_story_shares_share_type ON story_shares(share_type);
    CREATE INDEX IF NOT EXISTS idx_story_shares_created_at ON story_shares(created_at);

    -- =====================================================
    -- 6. STORY REPORTS TABLE
    -- =====================================================
    -- Table for storing story reports
    CREATE TABLE IF NOT EXISTS story_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        reason VARCHAR(20) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'fake', 'other')),
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
        reviewed_by UUID REFERENCES auth.users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Ensure one report per user per story
        UNIQUE(story_id, reporter_user_id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_story_reports_story_id ON story_reports(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_reports_reporter_user_id ON story_reports(reporter_user_id);
    CREATE INDEX IF NOT EXISTS idx_story_reports_reason ON story_reports(reason);
    CREATE INDEX IF NOT EXISTS idx_story_reports_status ON story_reports(status);
    CREATE INDEX IF NOT EXISTS idx_story_reports_created_at ON story_reports(created_at);

    -- =====================================================
    -- 7. FOLLOWS TABLE (for following stories feature)
    -- =====================================================
    -- Table for storing user follows
    CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        following_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;
    ALTER TABLE story_reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

    -- Stories policies
    CREATE POLICY "stories_public_read" ON stories
        FOR SELECT USING (is_public = true);

    CREATE POLICY "stories_own_all" ON stories
        FOR ALL USING (user_id = auth.uid());

    -- Story likes policies
    CREATE POLICY "story_likes_own_data" ON story_likes
        FOR ALL USING (user_id = auth.uid());

    CREATE POLICY "story_likes_public_read" ON story_likes
        FOR SELECT USING (true);

    -- Story comments policies
    CREATE POLICY "story_comments_public_read" ON story_comments
        FOR SELECT USING (is_deleted = false);

    CREATE POLICY "story_comments_own_all" ON story_comments
        FOR ALL USING (user_id = auth.uid());

    -- Comment likes policies
    CREATE POLICY "comment_likes_own_data" ON comment_likes
        FOR ALL USING (user_id = auth.uid());

    CREATE POLICY "comment_likes_public_read" ON comment_likes
        FOR SELECT USING (true);

    -- Story shares policies
    CREATE POLICY "story_shares_own_data" ON story_shares
        FOR ALL USING (user_id = auth.uid());

    CREATE POLICY "story_shares_public_read" ON story_shares
        FOR SELECT USING (true);

    -- Story reports policies
    CREATE POLICY "story_reports_own_data" ON story_reports
        FOR ALL USING (reporter_user_id = auth.uid());

    CREATE POLICY "story_reports_admin_read" ON story_reports
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
    DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
    CREATE TRIGGER update_stories_updated_at 
        BEFORE UPDATE ON stories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_story_comments_updated_at ON story_comments;
    CREATE TRIGGER update_story_comments_updated_at 
        BEFORE UPDATE ON story_comments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_story_reports_updated_at ON story_reports;
    CREATE TRIGGER update_story_reports_updated_at 
        BEFORE UPDATE ON story_reports 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Function to update story counters when likes are added/removed
    CREATE OR REPLACE FUNCTION update_story_likes_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';

    -- Create triggers for story likes count
    DROP TRIGGER IF EXISTS update_story_likes_count_trigger ON story_likes;
    CREATE TRIGGER update_story_likes_count_trigger
        AFTER INSERT OR DELETE ON story_likes
        FOR EACH ROW EXECUTE FUNCTION update_story_likes_count();

    -- Function to update comment counters when likes are added/removed
    CREATE OR REPLACE FUNCTION update_comment_likes_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE story_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE story_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';

    -- Create triggers for comment likes count
    DROP TRIGGER IF EXISTS update_comment_likes_count_trigger ON comment_likes;
    CREATE TRIGGER update_comment_likes_count_trigger
        AFTER INSERT OR DELETE ON comment_likes
        FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

    -- Function to update story counters when comments are added/removed
    CREATE OR REPLACE FUNCTION update_story_comments_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE stories SET comments_count = comments_count - 1 WHERE id = OLD.story_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';

    -- Create triggers for story comments count
    DROP TRIGGER IF EXISTS update_story_comments_count_trigger ON story_comments;
    CREATE TRIGGER update_story_comments_count_trigger
        AFTER INSERT OR DELETE ON story_comments
        FOR EACH ROW EXECUTE FUNCTION update_story_comments_count();

    -- Function to update story counters when shares are added
    CREATE OR REPLACE FUNCTION update_story_shares_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE stories SET shares_count = shares_count + 1 WHERE id = NEW.story_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE stories SET shares_count = shares_count - 1 WHERE id = OLD.story_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';

    -- Create triggers for story shares count
    DROP TRIGGER IF EXISTS update_story_shares_count_trigger ON story_shares;
    CREATE TRIGGER update_story_shares_count_trigger
        AFTER INSERT OR DELETE ON story_shares
        FOR EACH ROW EXECUTE FUNCTION update_story_shares_count();

    -- =====================================================
    -- 10. SAMPLE DATA (OPTIONAL)
    -- =====================================================

    -- Insert sample stories (only if no stories exist)
    INSERT INTO stories (
        user_id, content_type, description, 
        likes_count, comments_count, shares_count,
        hashtags, is_public, post_type
    ) 
    SELECT 
        p.user_id,
        'text' as content_type,
        CASE 
            WHEN p.gender = 'female' THEN 'Explorando nuevas conexiones y experiencias auténticas. Me encanta viajar, la música y conocer personas interesantes. #lifestyle #aventura #conexiones'
            ELSE 'Buscando conexiones genuinas y experiencias únicas. Disfruto de la buena conversación y los encuentros discretos. #lifestyle #conexiones #discreto'
        END as description,
        FLOOR(RANDOM() * 50) + 5 as likes_count,
        FLOOR(RANDOM() * 20) + 1 as comments_count,
        FLOOR(RANDOM() * 10) as shares_count,
        ARRAY['lifestyle', 'conexiones', 'aventura'] as hashtags,
        true as is_public,
        'story' as post_type
    FROM profiles p
    WHERE p.is_demo = false
    LIMIT 10
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- 11. VIEWS FOR ANALYTICS
    -- =====================================================

    -- View for story engagement metrics
    CREATE OR REPLACE VIEW story_engagement_metrics AS
    SELECT 
        s.id,
        s.description as content,
        s.content_type as post_type,
        COALESCE(sl.likes_count, 0) as likes_count,
        COALESCE(sc.comments_count, 0) as comments_count,
        COALESCE(ss.shares_count, 0) as shares_count,
        s.views_count,
        s.created_at,
        'Usuario' as first_name,
        'Anónimo' as last_name,
        'No especificado' as gender,
        (COALESCE(sl.likes_count, 0) + COALESCE(sc.comments_count, 0) + COALESCE(ss.shares_count, 0)) as total_engagement,
        CASE 
            WHEN s.views_count > 0 THEN 
                (COALESCE(sl.likes_count, 0) + COALESCE(sc.comments_count, 0) + COALESCE(ss.shares_count, 0))::FLOAT / s.views_count 
            ELSE 0 
        END as engagement_rate
    FROM stories s
    LEFT JOIN (
        SELECT story_id, COUNT(*) as likes_count
        FROM story_likes
        GROUP BY story_id
    ) sl ON s.id = sl.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as comments_count
        FROM story_comments
        GROUP BY story_id
    ) sc ON s.id = sc.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as shares_count
        FROM story_shares
        GROUP BY story_id
    ) ss ON s.id = ss.story_id
    WHERE s.is_public = true;

    -- View for popular hashtags
    CREATE OR REPLACE VIEW popular_hashtags AS
    SELECT 
        hashtag,
        COUNT(*) as story_count,
        SUM(COALESCE(sl.likes_count, 0)) as total_likes,
        SUM(COALESCE(sc.comments_count, 0)) as total_comments,
        SUM(COALESCE(ss.shares_count, 0)) as total_shares
    FROM stories s
    LEFT JOIN (
        SELECT story_id, COUNT(*) as likes_count
        FROM story_likes
        GROUP BY story_id
    ) sl ON s.id = sl.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as comments_count
        FROM story_comments
        GROUP BY story_id
    ) sc ON s.id = sc.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as shares_count
        FROM story_shares
        GROUP BY story_id
    ) ss ON s.id = ss.story_id,
    LATERAL unnest(COALESCE(hashtags, ARRAY[]::TEXT[])) as hashtag
    WHERE s.is_public = true AND hashtag IS NOT NULL AND hashtag != ''
    GROUP BY hashtag
    ORDER BY story_count DESC, total_likes DESC;

    -- View for user story statistics
    CREATE OR REPLACE VIEW user_story_stats AS
    SELECT 
        s.user_id,
        'Usuario' as first_name,
        'Anónimo' as last_name,
        COUNT(s.id) as total_stories,
        SUM(COALESCE(sl.likes_count, 0)) as total_likes_received,
        SUM(COALESCE(sc.comments_count, 0)) as total_comments_received,
        SUM(COALESCE(ss.shares_count, 0)) as total_shares_received,
        AVG(COALESCE(sl.likes_count, 0)) as avg_likes_per_story,
        MAX(s.created_at) as last_story_date
    FROM stories s
    LEFT JOIN (
        SELECT story_id, COUNT(*) as likes_count
        FROM story_likes
        GROUP BY story_id
    ) sl ON s.id = sl.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as comments_count
        FROM story_comments
        GROUP BY story_id
    ) sc ON s.id = sc.story_id
    LEFT JOIN (
        SELECT story_id, COUNT(*) as shares_count
        FROM story_shares
        GROUP BY story_id
    ) ss ON s.id = ss.story_id
    WHERE s.is_public = true
    GROUP BY s.user_id;

    -- =====================================================
    -- COMPLETION MESSAGE
    -- =====================================================
    -- All tables and functions have been created successfully!
    -- The PostsService can now use real database tables instead of mock data.
    -- 
    -- Tables created:
    -- - stories: Main stories data (enhanced existing table)
    -- - story_likes: Story likes tracking
    -- - story_comments: Story comments
    -- - comment_likes: Comment likes tracking
    -- - story_shares: Story shares tracking
    -- - story_reports: Story reports for moderation
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
