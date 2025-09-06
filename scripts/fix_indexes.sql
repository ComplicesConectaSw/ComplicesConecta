-- =====================================================
-- SCRIPT DE ÍNDICES DE PERFORMANCE
-- ComplicesConecta v2.1.2 - Optimización de Consultas Supabase
-- Fecha: 06 de septiembre, 2025 - 05:09 hrs
-- =====================================================

-- PASO 1: ÍNDICES PARA TABLA PROFILES
-- =====================================================

-- Índices básicos para búsquedas frecuentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Índices para filtros de matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_age_range ON profiles(age_range_min, age_range_max);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_max_distance ON profiles(max_distance);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_swinger_experience ON profiles(swinger_experience);

-- Índices GIN para arrays
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_interests_gin ON profiles USING GIN(interests);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_looking_for_gin ON profiles USING GIN(looking_for);

-- Índice compuesto para búsquedas de matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_matching_composite ON profiles(age_range_min, age_range_max, max_distance, swinger_experience);

-- PASO 2: ÍNDICES PARA TABLA USER_LIKES
-- =====================================================

-- Índices básicos para likes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_liker_id ON user_likes(liker_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_liked_id ON user_likes(liked_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_like_type ON user_likes(like_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_created_at ON user_likes(created_at);

-- Índice compuesto para detección de matches mutuos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_mutual_match ON user_likes(liker_id, liked_id, like_type);

-- Índice único para evitar likes duplicados
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_unique ON user_likes(liker_id, liked_id);

-- PASO 3: ÍNDICES PARA TABLA MATCHES
-- =====================================================

-- Índices básicos para matches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_is_active ON matches(is_active);

-- Índice compuesto para búsquedas de matches de usuario
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user_composite ON matches(user1_id, user2_id, is_active);

-- Índice para ordenar matches por fecha
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_active_by_date ON matches(matched_at DESC) WHERE is_active = true;

-- PASO 4: ÍNDICES PARA TABLA INVITATIONS
-- =====================================================

-- Índices básicos para invitaciones
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_receiver_id ON invitations(receiver_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_type ON invitations(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);

-- Índice compuesto para búsquedas por usuario y estado
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_receiver_status ON invitations(receiver_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_sender_status ON invitations(sender_id, status);

-- Índice único para evitar invitaciones duplicadas
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_invitations_unique ON invitations(sender_id, receiver_id, type);

-- PASO 5: ÍNDICES PARA TABLA IMAGES
-- =====================================================

-- Índices básicos para imágenes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_bucket_name ON images(bucket_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_is_profile_image ON images(is_profile_image);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Índice compuesto para búsquedas de imágenes públicas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_public_user ON images(user_id, is_public);

-- Índice para imágenes de perfil
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_profile_user ON images(user_id, is_profile_image) WHERE is_profile_image = true;

-- PASO 6: ÍNDICES PARA TABLA CHAT_ROOMS
-- =====================================================

-- Índices básicos para chat rooms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_is_public ON chat_rooms(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_created_at ON chat_rooms(created_at);

-- Índice para salas públicas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_public ON chat_rooms(created_at DESC) WHERE is_public = true;

-- PASO 7: ÍNDICES PARA TABLA CHAT_MEMBERS
-- =====================================================

-- Índices básicos para chat members
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_room_id ON chat_members(room_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_role ON chat_members(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_joined_at ON chat_members(joined_at);

-- Índice único para evitar membresías duplicadas
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_unique ON chat_members(room_id, user_id);

-- Índice compuesto para búsquedas de salas por usuario
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_user_rooms ON chat_members(user_id, joined_at DESC);

-- PASO 8: ÍNDICES PARA TABLA MESSAGES
-- =====================================================

-- Índices básicos para mensajes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Índice compuesto para mensajes por sala ordenados por fecha
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_room_date ON messages(room_id, created_at DESC);

-- Índice para mensajes recientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recent ON messages(created_at DESC);

-- PASO 9: ÍNDICES PARA TABLA GALLERY_PERMISSIONS
-- =====================================================

-- Índices básicos para permisos de galería
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_permissions_owner_id ON gallery_permissions(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_permissions_viewer_id ON gallery_permissions(viewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_permissions_type ON gallery_permissions(permission_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_permissions_granted_at ON gallery_permissions(granted_at);

-- Índice único para evitar permisos duplicados
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_permissions_unique ON gallery_permissions(owner_id, viewer_id);

-- PASO 10: ÍNDICES PARA TABLA USER_ROLES
-- =====================================================

-- Índices básicos para roles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_created_at ON user_roles(created_at);

-- Índice único para evitar roles duplicados por usuario
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id);

-- PASO 11: ÍNDICES PARA TABLA MATCH_INTERACTIONS
-- =====================================================

-- Índices básicos para interacciones de match
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_interactions_match_id ON match_interactions(match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_interactions_user_id ON match_interactions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_interactions_type ON match_interactions(interaction_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_interactions_created_at ON match_interactions(created_at);

-- Índice compuesto para interacciones por match
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_interactions_match_date ON match_interactions(match_id, created_at DESC);

-- PASO 12: ÍNDICES PARA TABLA GALLERY_ACCESS_REQUESTS
-- =====================================================

-- Índices básicos para solicitudes de acceso a galería
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_access_requests_requester_id ON gallery_access_requests(requester_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_access_requests_owner_id ON gallery_access_requests(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_access_requests_status ON gallery_access_requests(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_access_requests_created_at ON gallery_access_requests(created_at);

-- Índice único para evitar solicitudes duplicadas
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_access_requests_unique ON gallery_access_requests(requester_id, owner_id);

-- PASO 13: ÍNDICES PARA TABLA IMAGE_PERMISSIONS
-- =====================================================

-- Índices básicos para permisos de imagen
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_permissions_image_id ON image_permissions(image_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_permissions_user_id ON image_permissions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_permissions_type ON image_permissions(permission_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_permissions_granted_at ON image_permissions(granted_at);

-- Índice único para evitar permisos duplicados
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_image_permissions_unique ON image_permissions(image_id, user_id);

-- PASO 14: ÍNDICES PARA TABLA CHAT_INVITATIONS
-- =====================================================

-- Índices básicos para invitaciones de chat
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_room_id ON chat_invitations(room_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_inviter_id ON chat_invitations(inviter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_invitee_id ON chat_invitations(invitee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_status ON chat_invitations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_created_at ON chat_invitations(created_at);

-- Índice único para evitar invitaciones duplicadas
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_invitations_unique ON chat_invitations(room_id, invitee_id);

-- PASO 15: ÍNDICES ESPECIALES PARA PERFORMANCE
-- =====================================================

-- Índice parcial para usuarios activos (con perfil completo)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_users ON profiles(id, created_at) 
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- Índice parcial para matches activos recientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_recent_active ON matches(matched_at DESC) 
WHERE is_active = true AND matched_at > NOW() - INTERVAL '30 days';

-- Índice parcial para likes recientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_recent ON user_likes(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Índice parcial para mensajes recientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recent_text ON messages(room_id, created_at DESC) 
WHERE message_type = 'text' AND created_at > NOW() - INTERVAL '24 hours';

-- =====================================================
-- ANÁLISIS Y ESTADÍSTICAS DE ÍNDICES
-- =====================================================

-- Función para analizar el uso de índices
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexname::TEXT,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch
    FROM pg_stat_user_indexes s
    ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de tablas
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    n_tup_ins BIGINT,
    n_tup_upd BIGINT,
    n_tup_del BIGINT,
    n_live_tup BIGINT,
    n_dead_tup BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.n_tup_ins,
        s.n_tup_upd,
        s.n_tup_del,
        s.n_live_tup,
        s.n_dead_tup
    FROM pg_stat_user_tables s
    ORDER BY s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DEL SCRIPT DE ÍNDICES DE PERFORMANCE
-- =====================================================

-- Actualizar estadísticas de todas las tablas
ANALYZE profiles;
ANALYZE user_roles;
ANALYZE invitations;
ANALYZE gallery_permissions;
ANALYZE images;
ANALYZE image_permissions;
ANALYZE gallery_access_requests;
ANALYZE chat_rooms;
ANALYZE chat_members;
ANALYZE messages;
ANALYZE chat_invitations;
ANALYZE user_likes;
ANALYZE matches;
ANALYZE match_interactions;

-- Mensaje de finalización
SELECT 'ÍNDICES DE PERFORMANCE CREADOS CORRECTAMENTE - ComplicesConecta v2.1.2' as resultado;
