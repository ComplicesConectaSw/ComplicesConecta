-- =====================================================
-- 🚀 SISTEMA AUTOMÁTICO DE ÍNDICES OPTIMIZADOS
-- ComplicesConecta v2.1.2 - Optimización de Performance
-- Fecha: 06 de septiembre, 2025 - 05:32 hrs
-- =====================================================

-- 🤖 AUDITOR Y REPARADOR AUTOMÁTICO DE ÍNDICES
-- Crea índices optimizados para máxima performance
-- Scripts idempotentes - seguros para ejecutar múltiples veces

DO $$
BEGIN
    RAISE NOTICE '🚀 INICIANDO SISTEMA AUTOMÁTICO DE ÍNDICES OPTIMIZADOS';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '📊 Creando índices de performance...';
END $$;

-- 📊 ÍNDICES PARA TABLA PROFILES
-- =====================================================

-- Índice único para email
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON public.profiles(email) WHERE email IS NOT NULL;

-- Índice compuesto para búsquedas activas
CREATE INDEX IF NOT EXISTS idx_profiles_active_search 
ON public.profiles(is_active, is_demo, age) WHERE is_active = true AND is_demo = false;

-- Índice GIN para intereses (búsquedas de array)
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
ON public.profiles USING GIN(interests);

-- Índice GIN para looking_for (búsquedas de array)
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for_gin 
ON public.profiles USING GIN(looking_for);

-- Índice para tipo de perfil
CREATE INDEX IF NOT EXISTS idx_profiles_type 
ON public.profiles(profile_type) WHERE profile_type IS NOT NULL;

-- Índice para experiencia swinger
CREATE INDEX IF NOT EXISTS idx_profiles_experience 
ON public.profiles(swinger_experience) WHERE swinger_experience IS NOT NULL;

-- 🔐 ÍNDICES PARA TABLA USER_ROLES
-- =====================================================

-- Índice único para user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_id_unique 
ON public.user_roles(user_id);

-- Índice para rol
CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON public.user_roles(role);

-- 💌 ÍNDICES PARA TABLA INVITATIONS
-- =====================================================

-- Índice compuesto para búsquedas de invitaciones
CREATE INDEX IF NOT EXISTS idx_invitations_from_to 
ON public.invitations(from_profile, to_profile);

-- Índice para estado de invitaciones
CREATE INDEX IF NOT EXISTS idx_invitations_status 
ON public.invitations(status, created_at);

-- Índice para tipo de invitación
CREATE INDEX IF NOT EXISTS idx_invitations_type 
ON public.invitations(type, status);

-- Índice único compuesto para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_type 
ON public.invitations(from_profile, to_profile, type);

-- 🖼️ ÍNDICES PARA TABLA IMAGES
-- =====================================================

-- Índice para perfil propietario
CREATE INDEX IF NOT EXISTS idx_images_profile_id 
ON public.images(profile_id, created_at DESC);

-- Índice para imágenes públicas
CREATE INDEX IF NOT EXISTS idx_images_public 
ON public.images(is_public, type) WHERE is_public = true;

-- Índice para tipo de imagen
CREATE INDEX IF NOT EXISTS idx_images_type 
ON public.images(type, created_at DESC);

-- 🔑 ÍNDICES PARA TABLA IMAGE_PERMISSIONS
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_image_permissions_unique 
ON public.image_permissions(image_id, granted_to);

-- Índice para permisos otorgados por usuario
CREATE INDEX IF NOT EXISTS idx_image_permissions_granted_by 
ON public.image_permissions(granted_by, granted_at DESC);

-- Índice para permisos recibidos por usuario
CREATE INDEX IF NOT EXISTS idx_image_permissions_granted_to 
ON public.image_permissions(granted_to, granted_at DESC);

-- 📋 ÍNDICES PARA TABLA GALLERY_ACCESS_REQUESTS
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_requests_unique 
ON public.gallery_access_requests(requester_id, target_profile_id);

-- Índice para solicitudes por estado
CREATE INDEX IF NOT EXISTS idx_gallery_requests_status 
ON public.gallery_access_requests(status, created_at DESC);

-- Índice para solicitudes recibidas
CREATE INDEX IF NOT EXISTS idx_gallery_requests_target 
ON public.gallery_access_requests(target_profile_id, status);

-- 💬 ÍNDICES PARA TABLA CHAT_ROOMS
-- =====================================================

-- Índice para salas públicas
CREATE INDEX IF NOT EXISTS idx_chat_rooms_public 
ON public.chat_rooms(is_public, created_at DESC) WHERE is_public = true;

-- Índice para creador de sala
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by 
ON public.chat_rooms(created_by, created_at DESC);

-- 👥 ÍNDICES PARA TABLA CHAT_MEMBERS
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_members_unique 
ON public.chat_members(room_id, profile_id);

-- Índice para miembros por sala
CREATE INDEX IF NOT EXISTS idx_chat_members_room 
ON public.chat_members(room_id, joined_at DESC);

-- Índice para salas de usuario
CREATE INDEX IF NOT EXISTS idx_chat_members_profile 
ON public.chat_members(profile_id, joined_at DESC);

-- 💬 ÍNDICES PARA TABLA MESSAGES
-- =====================================================

-- Índice compuesto para mensajes de sala
CREATE INDEX IF NOT EXISTS idx_messages_room_time 
ON public.messages(room_id, created_at DESC);

-- Índice para mensajes por remitente
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON public.messages(sender_id, created_at DESC);

-- Índice para tipo de mensaje
CREATE INDEX IF NOT EXISTS idx_messages_type 
ON public.messages(message_type, created_at DESC);

-- 💕 ÍNDICES PARA TABLA USER_LIKES
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_likes_unique 
ON public.user_likes(user_id, liked_user_id);

-- Índice para likes dados
CREATE INDEX IF NOT EXISTS idx_user_likes_given 
ON public.user_likes(user_id, liked, created_at DESC);

-- Índice para likes recibidos
CREATE INDEX IF NOT EXISTS idx_user_likes_received 
ON public.user_likes(liked_user_id, liked, created_at DESC);

-- 🎯 ÍNDICES PARA TABLA MATCHES
-- =====================================================

-- Índice único para evitar duplicados (bidireccional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_users_unique 
ON public.matches(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

-- Índice para matches de usuario1
CREATE INDEX IF NOT EXISTS idx_matches_user1 
ON public.matches(user1_id, status, created_at DESC);

-- Índice para matches de usuario2
CREATE INDEX IF NOT EXISTS idx_matches_user2 
ON public.matches(user2_id, status, created_at DESC);

-- Índice para matches activos
CREATE INDEX IF NOT EXISTS idx_matches_active 
ON public.matches(status, compatibility_score DESC) WHERE status = 'active';

-- 🔄 ÍNDICES PARA TABLA MATCH_INTERACTIONS
-- =====================================================

-- Índice compuesto para interacciones de match
CREATE INDEX IF NOT EXISTS idx_match_interactions_match_user 
ON public.match_interactions(match_id, user_id, created_at DESC);

-- Índice para tipo de interacción
CREATE INDEX IF NOT EXISTS idx_match_interactions_type 
ON public.match_interactions(interaction_type, created_at DESC);

-- 🔐 ÍNDICES PARA TABLA GALLERY_PERMISSIONS
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_permissions_unique 
ON public.gallery_permissions(profile_id, granted_to);

-- Índice para permisos por perfil
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_profile 
ON public.gallery_permissions(profile_id, granted_at DESC);

-- Índice para permisos otorgados
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_by 
ON public.gallery_permissions(granted_by, granted_at DESC);

-- 📨 ÍNDICES PARA TABLA CHAT_INVITATIONS
-- =====================================================

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_invitations_unique 
ON public.chat_invitations(room_id, invited_user);

-- Índice para invitaciones por sala
CREATE INDEX IF NOT EXISTS idx_chat_invitations_room 
ON public.chat_invitations(room_id, status, created_at DESC);

-- Índice para invitaciones recibidas
CREATE INDEX IF NOT EXISTS idx_chat_invitations_user 
ON public.chat_invitations(invited_user, status, created_at DESC);

-- 🔍 ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para búsquedas por rango de edad
CREATE INDEX IF NOT EXISTS idx_profiles_age_range 
ON public.profiles(age) WHERE is_active = true AND is_demo = false;

-- Índice para fechas de creación
CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
ON public.profiles(created_at DESC);

-- Índice para fechas de actualización
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at 
ON public.profiles(updated_at DESC) WHERE is_active = true;

-- Índice para matches por score de compatibilidad
CREATE INDEX IF NOT EXISTS idx_matches_compatibility 
ON public.matches(compatibility_score DESC) WHERE status = 'active';

DO $$
BEGIN
    RAISE NOTICE '✅ ÍNDICES OPTIMIZADOS CREADOS EXITOSAMENTE';
    RAISE NOTICE '🚀 Performance de base de datos maximizada';
    RAISE NOTICE '📊 Búsquedas y consultas optimizadas';
END $$;
