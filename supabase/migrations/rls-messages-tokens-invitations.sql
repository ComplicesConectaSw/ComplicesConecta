-- RLS Policies for Messages, Tokens, Invitations
-- Fecha: 15 de Septiembre, 2025

-- =====================================================
-- CHAT_MESSAGES TABLE RLS POLICIES
-- =====================================================

-- Habilitar RLS en chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_policy" ON chat_messages;

-- SELECT: Solo sender, receiver o admin pueden leer mensajes
CREATE POLICY "chat_messages_select_policy" ON chat_messages
    FOR SELECT USING (
        auth.uid() = sender_id
        OR
        auth.uid() = receiver_id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- INSERT: Solo usuarios autenticados, no pueden enviarse mensajes a sí mismos
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND
        sender_id != receiver_id
        AND
        auth.uid() IS NOT NULL
    );

-- UPDATE: Solo sender puede editar sus mensajes (para marcar como editado)
CREATE POLICY "chat_messages_update_policy" ON chat_messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

-- DELETE: Solo sender o admin pueden eliminar mensajes
CREATE POLICY "chat_messages_delete_policy" ON chat_messages
    FOR DELETE USING (
        auth.uid() = sender_id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- USER_TOKEN_BALANCES TABLE RLS POLICIES
-- =====================================================

-- Habilitar RLS en user_token_balances
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "tokens_select_policy" ON user_token_balances;
DROP POLICY IF EXISTS "tokens_insert_policy" ON user_token_balances;
DROP POLICY IF EXISTS "tokens_update_policy" ON user_token_balances;
DROP POLICY IF EXISTS "tokens_delete_policy" ON user_token_balances;

-- SELECT: Solo dueño o admin pueden ver balances
CREATE POLICY "tokens_select_policy" ON user_token_balances
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- INSERT: Solo admin puede crear balances iniciales, usuarios pueden ganar tokens
CREATE POLICY "tokens_insert_policy" ON user_token_balances
    FOR INSERT WITH CHECK (
        -- Admin puede crear cualquier balance
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
        OR
        -- Usuario puede insertar su propio balance inicial
        (auth.uid() = user_id AND balance >= 0)
    );

-- UPDATE: Solo admin puede modificar balances directamente
CREATE POLICY "tokens_update_policy" ON user_token_balances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- DELETE: Solo admin puede eliminar balances
CREATE POLICY "tokens_delete_policy" ON user_token_balances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- INVITATIONS TABLE RLS POLICIES
-- =====================================================

-- Habilitar RLS en invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "invitations_select_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_insert_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_update_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_delete_policy" ON invitations;

-- SELECT: Solo sender, receiver o admin pueden ver invitaciones
CREATE POLICY "invitations_select_policy" ON invitations
    FOR SELECT USING (
        auth.uid() = sender_id
        OR
        auth.uid() = receiver_id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- INSERT: Solo usuarios autenticados, no pueden enviarse invitaciones a sí mismos
CREATE POLICY "invitations_insert_policy" ON invitations
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND
        sender_id != receiver_id
        AND
        auth.uid() IS NOT NULL
    );

-- UPDATE: Solo receiver puede actualizar status, sender puede cancelar
CREATE POLICY "invitations_update_policy" ON invitations
    FOR UPDATE USING (
        -- Receiver puede aceptar/rechazar
        (auth.uid() = receiver_id AND status IN ('accepted', 'rejected'))
        OR
        -- Sender puede cancelar
        (auth.uid() = sender_id AND status = 'cancelled')
        OR
        -- Admin puede modificar cualquier invitación
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- DELETE: Solo admin puede eliminar invitaciones
CREATE POLICY "invitations_delete_policy" ON invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- COUPLE_PROFILES TABLE RLS POLICIES
-- =====================================================

-- Validar si existe la tabla couple_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_profiles') THEN
        -- Habilitar RLS en couple_profiles
        ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;

        -- Eliminar políticas existentes
        DROP POLICY IF EXISTS "couple_profiles_select_policy" ON couple_profiles;
        DROP POLICY IF EXISTS "couple_profiles_insert_policy" ON couple_profiles;
        DROP POLICY IF EXISTS "couple_profiles_update_policy" ON couple_profiles;
        DROP POLICY IF EXISTS "couple_profiles_delete_policy" ON couple_profiles;

        -- SELECT: Solo partner1, partner2 o admin pueden ver
        CREATE POLICY "couple_profiles_select_policy" ON couple_profiles
            FOR SELECT USING (
                auth.uid() = partner1_id
                OR
                auth.uid() = partner2_id
                OR
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- INSERT: Solo usuarios autenticados pueden crear perfiles de pareja
        CREATE POLICY "couple_profiles_insert_policy" ON couple_profiles
            FOR INSERT WITH CHECK (
                auth.uid() = partner1_id
                OR
                auth.uid() = partner2_id
            );

        -- UPDATE: Solo partner1, partner2 o admin pueden editar
        CREATE POLICY "couple_profiles_update_policy" ON couple_profiles
            FOR UPDATE USING (
                auth.uid() = partner1_id
                OR
                auth.uid() = partner2_id
                OR
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- DELETE: Solo admin puede eliminar perfiles de pareja
        CREATE POLICY "couple_profiles_delete_policy" ON couple_profiles
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- Políticas RLS para couple_profiles creadas exitosamente
    ELSE
        -- Tabla couple_profiles no existe, saltando políticas RLS
    END IF;
END $$;

-- =====================================================
-- COUPLE_PHOTOS TABLE RLS POLICIES
-- =====================================================

-- Validar si existe la tabla couple_photos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_photos') THEN
        -- Habilitar RLS en couple_photos
        ALTER TABLE couple_photos ENABLE ROW LEVEL SECURITY;

        -- Eliminar políticas existentes
        DROP POLICY IF EXISTS "couple_photos_select_policy" ON couple_photos;
        DROP POLICY IF EXISTS "couple_photos_insert_policy" ON couple_photos;
        DROP POLICY IF EXISTS "couple_photos_update_policy" ON couple_photos;
        DROP POLICY IF EXISTS "couple_photos_delete_policy" ON couple_photos;

        -- SELECT: Solo miembros de la pareja o admin pueden ver fotos
        CREATE POLICY "couple_photos_select_policy" ON couple_photos
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                    AND (cp.partner1_id = auth.uid() OR cp.partner2_id = auth.uid())
                )
                OR
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- INSERT: Solo miembros de la pareja pueden subir fotos
        CREATE POLICY "couple_photos_insert_policy" ON couple_photos
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                    AND (cp.partner1_id = auth.uid() OR cp.partner2_id = auth.uid())
                )
            );

        -- UPDATE: Solo miembros de la pareja o admin pueden editar fotos
        CREATE POLICY "couple_photos_update_policy" ON couple_photos
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                    AND (cp.partner1_id = auth.uid() OR cp.partner2_id = auth.uid())
                )
                OR
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- DELETE: Solo miembros de la pareja o admin pueden eliminar fotos
        CREATE POLICY "couple_photos_delete_policy" ON couple_photos
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                    AND (cp.partner1_id = auth.uid() OR cp.partner2_id = auth.uid())
                )
                OR
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            );

        -- Políticas RLS para couple_photos creadas exitosamente
    ELSE
        -- Tabla couple_photos no existe, saltando políticas RLS
    END IF;
END $$;

-- Crear índices para optimizar consultas RLS
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_sender_receiver ON invitations(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);

-- Todas las políticas RLS han sido creadas exitosamente
