-- =====================================================
-- CREATE PUSH NOTIFICATIONS TABLES
-- ComplicesConecta v2.7.0 - Push Notifications System
-- =====================================================

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    UNIQUE(user_id, endpoint)
);

-- Create notification_logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.push_subscriptions(id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    delivery_status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    messages_enabled BOOLEAN DEFAULT true,
    matches_enabled BOOLEAN DEFAULT true,
    likes_enabled BOOLEAN DEFAULT true,
    invitations_enabled BOOLEAN DEFAULT true,
    profile_views_enabled BOOLEAN DEFAULT false,
    marketing_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Push subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Push subscriptions policies
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Notification logs policies
CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notification logs" ON public.notification_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update notification logs" ON public.notification_logs
    FOR UPDATE USING (true);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get active subscriptions for a user
CREATE OR REPLACE FUNCTION public.get_user_push_subscriptions(target_user_id UUID)
RETURNS TABLE (
    id UUID,
    endpoint TEXT,
    p256dh_key TEXT,
    auth_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.endpoint,
        ps.p256dh_key,
        ps.auth_key,
        ps.created_at
    FROM public.push_subscriptions ps
    WHERE ps.user_id = target_user_id 
    AND ps.is_active = true
    ORDER BY ps.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification preferences for a user
CREATE OR REPLACE FUNCTION public.get_notification_preferences(target_user_id UUID)
RETURNS TABLE (
    messages_enabled BOOLEAN,
    matches_enabled BOOLEAN,
    likes_enabled BOOLEAN,
    invitations_enabled BOOLEAN,
    profile_views_enabled BOOLEAN,
    marketing_enabled BOOLEAN,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        np.messages_enabled,
        np.matches_enabled,
        np.likes_enabled,
        np.invitations_enabled,
        np.profile_views_enabled,
        np.marketing_enabled,
        np.quiet_hours_start,
        np.quiet_hours_end,
        np.timezone
    FROM public.notification_preferences np
    WHERE np.user_id = target_user_id;
    
    -- If no preferences exist, return defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            true::BOOLEAN,  -- messages_enabled
            true::BOOLEAN,  -- matches_enabled
            true::BOOLEAN,  -- likes_enabled
            true::BOOLEAN,  -- invitations_enabled
            false::BOOLEAN, -- profile_views_enabled
            false::BOOLEAN, -- marketing_enabled
            NULL::TIME,     -- quiet_hours_start
            NULL::TIME,     -- quiet_hours_end
            'UTC'::VARCHAR(50) -- timezone
    ;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log notification delivery
CREATE OR REPLACE FUNCTION public.log_notification_delivery(
    target_user_id UUID,
    target_subscription_id UUID,
    notification_type VARCHAR(50),
    notification_title TEXT,
    notification_body TEXT,
    notification_data JSONB DEFAULT NULL,
    delivery_status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.notification_logs (
        user_id,
        subscription_id,
        notification_type,
        title,
        body,
        data,
        delivery_status,
        error_message
    ) VALUES (
        target_user_id,
        target_subscription_id,
        notification_type,
        notification_title,
        notification_body,
        notification_data,
        delivery_status,
        error_message
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DEFAULT NOTIFICATION PREFERENCES
-- =====================================================

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
CREATE TRIGGER create_notification_preferences_for_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_push_subscriptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_notification_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_notification_delivery(UUID, UUID, VARCHAR(50), TEXT, TEXT, JSONB, VARCHAR(20), TEXT) TO authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample notification preferences for existing users (uncomment if needed)
/*
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('push_subscriptions', 'notification_logs', 'notification_preferences');

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('push_subscriptions', 'notification_logs', 'notification_preferences');

-- Verify functions exist
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_user_push_subscriptions',
    'get_notification_preferences',
    'log_notification_delivery',
    'create_default_notification_preferences'
);

COMMENT ON TABLE public.push_subscriptions IS 'Stores push notification subscriptions for users';
COMMENT ON TABLE public.notification_logs IS 'Logs all sent push notifications for tracking and debugging';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for different types of notifications';

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

SELECT 'Push Notifications tables created successfully! 🔔' as status;
