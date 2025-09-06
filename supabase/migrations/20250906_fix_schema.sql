-- ==========================================
-- MIGRACIÓN CORRECTIVA COMPLETA - ComplicesConecta v2.1.1
-- Fecha: 2025-09-06
-- Propósito: Corrección integral de esquema y sistemas críticos
-- ==========================================

-- FUNCIÓN UTILITARIA OBLIGATORIA
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- PASO 1: ELIMINAR TABLA INCORRECTA
DROP TABLE IF EXISTS "public"."police complicesconecta" CASCADE;

-- PASO 2: RECREAR TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PASO 3: TABLA PROFILES COMPLETA CON TODOS LOS CAMPOS
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "email" text,
    "first_name" text,
    "last_name" text,
    "full_name" text,
    "avatar_url" text,
    "bio" text,
    "age" integer,
    "location" text,
    "profile_type" text DEFAULT 'single',
    "partner_name" text,
    "partner_age" integer,
    "is_verified" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    -- Campos para matching system
    "interests" text[],
    "age_range_min" integer DEFAULT 18,
    "age_range_max" integer DEFAULT 65,
    "max_distance" integer DEFAULT 50,
    "looking_for" text[],
    "swinger_experience" text,
    "verification_status" text DEFAULT 'pending',
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "profiles_age_check" CHECK (("age" >= 18) AND ("age" <= 100)),
    CONSTRAINT "profiles_verification_status_check" CHECK ("verification_status" IN ('pending', 'verified', 'rejected'))
);

-- PASO 4: TABLA USER_ROLES
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "role" app_role NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role")
);

-- PASO 5: TABLA INVITATIONS
CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "sender_id" uuid NOT NULL,
    "receiver_id" uuid NOT NULL,
    "type" text NOT NULL DEFAULT 'gallery',
    "status" text NOT NULL DEFAULT 'pending',
    "message" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_type_check" CHECK ("type" IN ('gallery', 'chat', 'connection')),
    CONSTRAINT "invitations_status_check" CHECK ("status" IN ('pending', 'accepted', 'declined'))
);

-- PASO 6: TABLA GALLERY_PERMISSIONS
CREATE TABLE IF NOT EXISTS "public"."gallery_permissions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "owner_id" uuid NOT NULL,
    "viewer_id" uuid NOT NULL,
    "permission_type" text NOT NULL DEFAULT 'view',
    "granted_at" timestamp with time zone DEFAULT now(),
    "expires_at" timestamp with time zone,
    CONSTRAINT "gallery_permissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gallery_permissions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_permissions_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_permissions_permission_type_check" CHECK ("permission_type" IN ('view', 'download')),
    CONSTRAINT "gallery_permissions_unique_permission" UNIQUE ("owner_id", "viewer_id", "permission_type")
);

-- PASO 7: TABLA IMAGES
CREATE TABLE IF NOT EXISTS "public"."images" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "url" text NOT NULL,
    "type" text NOT NULL DEFAULT 'profile',
    "is_private" boolean DEFAULT false,
    "caption" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "images_type_check" CHECK ("type" IN ('profile', 'gallery'))
);

-- PASO 8: TABLA IMAGE_PERMISSIONS
CREATE TABLE IF NOT EXISTS "public"."image_permissions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "image_id" uuid NOT NULL,
    "granted_to" uuid NOT NULL,
    "granted_by" uuid NOT NULL,
    "granted_at" timestamp with time zone DEFAULT now(),
    "revoked_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    CONSTRAINT "image_permissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "image_permissions_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE CASCADE,
    CONSTRAINT "image_permissions_granted_to_fkey" FOREIGN KEY ("granted_to") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "image_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "image_permissions_unique" UNIQUE ("image_id", "granted_to")
);

-- PASO 9: TABLA GALLERY_ACCESS_REQUESTS
CREATE TABLE IF NOT EXISTS "public"."gallery_access_requests" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "requester_id" uuid NOT NULL,
    "gallery_owner_id" uuid NOT NULL,
    "message" text,
    "status" text DEFAULT 'pending',
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "gallery_access_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gallery_access_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_access_requests_gallery_owner_id_fkey" FOREIGN KEY ("gallery_owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_access_requests_status_check" CHECK ("status" IN ('pending', 'approved', 'denied'))
);

-- PASO 10: TABLAS DE CHAT (si no existen)
CREATE TABLE IF NOT EXISTS "public"."chat_rooms" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "is_public" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "public"."chat_members" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "room_id" uuid NOT NULL,
    "profile_id" uuid NOT NULL,
    "role" text DEFAULT 'member',
    "is_muted" boolean DEFAULT false,
    "joined_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_members_role_check" CHECK ("role" IN ('admin', 'member')),
    CONSTRAINT "chat_members_unique" UNIQUE ("room_id", "profile_id")
);

CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "room_id" uuid NOT NULL,
    "sender_id" uuid NOT NULL,
    "content" text NOT NULL,
    "message_type" text DEFAULT 'text',
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "messages_message_type_check" CHECK ("message_type" IN ('text', 'image', 'file'))
);

CREATE TABLE IF NOT EXISTS "public"."chat_invitations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "room_id" uuid NOT NULL,
    "from_profile" uuid NOT NULL,
    "to_profile" uuid NOT NULL,
    "status" text DEFAULT 'pending',
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "chat_invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_invitations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_invitations_from_profile_fkey" FOREIGN KEY ("from_profile") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_invitations_to_profile_fkey" FOREIGN KEY ("to_profile") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_invitations_status_check" CHECK ("status" IN ('pending', 'accepted', 'declined')),
    CONSTRAINT "chat_invitations_unique" UNIQUE ("room_id", "from_profile", "to_profile")
);

-- PASO 11: FUNCIONES CRÍTICAS
CREATE OR REPLACE FUNCTION "public"."has_role"(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- PASO 12: TRIGGERS
DROP TRIGGER IF EXISTS "trg_profiles_updated_at" ON "public"."profiles";
CREATE TRIGGER "trg_profiles_updated_at"
    BEFORE UPDATE ON "public"."profiles"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

DROP TRIGGER IF EXISTS "trg_invitations_updated_at" ON "public"."invitations";
CREATE TRIGGER "trg_invitations_updated_at"
    BEFORE UPDATE ON "public"."invitations"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

DROP TRIGGER IF EXISTS "trg_images_updated_at" ON "public"."images";
CREATE TRIGGER "trg_images_updated_at"
    BEFORE UPDATE ON "public"."images"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."handle_new_user"();

-- PASO 13: HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."image_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_access_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_invitations" ENABLE ROW LEVEL SECURITY;

-- PASO 14: POLÍTICAS RLS COMPLETAS

-- === PROFILES ===
DROP POLICY IF EXISTS "profiles_select_own" ON "public"."profiles";
CREATE POLICY "profiles_select_own"
    ON "public"."profiles" FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_public" ON "public"."profiles";
CREATE POLICY "profiles_select_public"
    ON "public"."profiles" FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON "public"."profiles";
CREATE POLICY "profiles_insert_own"
    ON "public"."profiles" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON "public"."profiles";
CREATE POLICY "profiles_update_own"
    ON "public"."profiles" FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON "public"."profiles";
CREATE POLICY "profiles_delete_own"
    ON "public"."profiles" FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON "public"."profiles";
CREATE POLICY "profiles_admin_all"
    ON "public"."profiles" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === USER_ROLES ===
DROP POLICY IF EXISTS "user_roles_select_own" ON "public"."user_roles";
CREATE POLICY "user_roles_select_own"
    ON "public"."user_roles" FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roles_admin_all" ON "public"."user_roles";
CREATE POLICY "user_roles_admin_all"
    ON "public"."user_roles" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === INVITATIONS ===
DROP POLICY IF EXISTS "invitations_select_involved" ON "public"."invitations";
CREATE POLICY "invitations_select_involved"
    ON "public"."invitations" FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "invitations_insert_sender" ON "public"."invitations";
CREATE POLICY "invitations_insert_sender"
    ON "public"."invitations" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "invitations_update_involved" ON "public"."invitations";
CREATE POLICY "invitations_update_involved"
    ON "public"."invitations" FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- === GALLERY_PERMISSIONS ===
DROP POLICY IF EXISTS "gallery_permissions_select_involved" ON "public"."gallery_permissions";
CREATE POLICY "gallery_permissions_select_involved"
    ON "public"."gallery_permissions" FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "gallery_permissions_manage_owner" ON "public"."gallery_permissions";
CREATE POLICY "gallery_permissions_manage_owner"
    ON "public"."gallery_permissions" FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- === IMAGES ===
DROP POLICY IF EXISTS "images_select_public" ON "public"."images";
CREATE POLICY "images_select_public"
    ON "public"."images" FOR SELECT
    TO authenticated
    USING (NOT is_private OR auth.uid() = user_id);

DROP POLICY IF EXISTS "images_select_private_with_permission" ON "public"."images";
CREATE POLICY "images_select_private_with_permission"
    ON "public"."images" FOR SELECT
    TO authenticated
    USING (
        is_private AND 
        EXISTS (
            SELECT 1 FROM gallery_permissions 
            WHERE owner_id = images.user_id 
            AND viewer_id = auth.uid()
            AND (expires_at IS NULL OR expires_at > now())
        )
    );

DROP POLICY IF EXISTS "images_manage_own" ON "public"."images";
CREATE POLICY "images_manage_own"
    ON "public"."images" FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === CHAT_ROOMS ===
DROP POLICY IF EXISTS "chat_rooms_select_public" ON "public"."chat_rooms";
CREATE POLICY "chat_rooms_select_public"
    ON "public"."chat_rooms" FOR SELECT
    TO authenticated
    USING (is_public = true AND is_active = true);

DROP POLICY IF EXISTS "chat_rooms_select_member" ON "public"."chat_rooms";
CREATE POLICY "chat_rooms_select_member"
    ON "public"."chat_rooms" FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        id IN (
            SELECT room_id FROM chat_members 
            WHERE profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "chat_rooms_insert_authenticated" ON "public"."chat_rooms";
CREATE POLICY "chat_rooms_insert_authenticated"
    ON "public"."chat_rooms" FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "chat_rooms_update_creator" ON "public"."chat_rooms";
CREATE POLICY "chat_rooms_update_creator"
    ON "public"."chat_rooms" FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- === CHAT_MEMBERS ===
DROP POLICY IF EXISTS "chat_members_select_room_members" ON "public"."chat_members";
CREATE POLICY "chat_members_select_room_members"
    ON "public"."chat_members" FOR SELECT
    TO authenticated
    USING (
        profile_id = auth.uid() OR
        room_id IN (
            SELECT room_id FROM chat_members 
            WHERE profile_id = auth.uid()
        ) OR
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE created_by = auth.uid()
        )
    );

-- === MESSAGES ===
DROP POLICY IF EXISTS "messages_select_room_members" ON "public"."messages";
CREATE POLICY "messages_select_room_members"
    ON "public"."messages" FOR SELECT
    TO authenticated
    USING (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE is_public = true AND is_active = true
        ) OR
        room_id IN (
            SELECT room_id FROM chat_members 
            WHERE profile_id = auth.uid()
        ) OR
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "messages_insert_room_members" ON "public"."messages";
CREATE POLICY "messages_insert_room_members"
    ON "public"."messages" FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND (
            room_id IN (
                SELECT id FROM chat_rooms 
                WHERE is_public = true AND is_active = true
            ) OR
            room_id IN (
                SELECT room_id FROM chat_members 
                WHERE profile_id = auth.uid()
            ) OR
            room_id IN (
                SELECT id FROM chat_rooms 
                WHERE created_by = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "messages_update_sender" ON "public"."messages";
CREATE POLICY "messages_update_sender"
    ON "public"."messages" FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid());

-- PASO 15: ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS "idx_profiles_profile_type" ON "public"."profiles" ("profile_type");
CREATE INDEX IF NOT EXISTS "idx_profiles_is_active" ON "public"."profiles" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_profiles_verification_status" ON "public"."profiles" ("verification_status");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "public"."profiles" ("email");
CREATE INDEX IF NOT EXISTS "idx_user_roles_user_id" ON "public"."user_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_sender_receiver" ON "public"."invitations" ("sender_id", "receiver_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_status" ON "public"."invitations" ("status");
CREATE INDEX IF NOT EXISTS "idx_gallery_permissions_owner_viewer" ON "public"."gallery_permissions" ("owner_id", "viewer_id");
CREATE INDEX IF NOT EXISTS "idx_images_user_type" ON "public"."images" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_images_is_private" ON "public"."images" ("is_private");
CREATE INDEX IF NOT EXISTS "idx_chat_rooms_public" ON "public"."chat_rooms" ("is_public", "is_active");
CREATE INDEX IF NOT EXISTS "idx_chat_members_room" ON "public"."chat_members" ("room_id");
CREATE INDEX IF NOT EXISTS "idx_messages_room" ON "public"."messages" ("room_id", "created_at" DESC);

-- PASO 16: OTORGAR PERMISOS
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."profiles" TO authenticated;
GRANT SELECT ON TABLE "public"."profiles" TO anon;
GRANT SELECT ON TABLE "public"."user_roles" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."invitations" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."gallery_permissions" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."images" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."image_permissions" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."gallery_access_requests" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."chat_rooms" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."chat_members" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."messages" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."chat_invitations" TO authenticated;

-- PASO 17: COMENTARIOS DE DOCUMENTACIÓN
COMMENT ON TABLE "public"."profiles" IS 'Perfiles de usuarios con información completa y preferencias';
COMMENT ON TABLE "public"."user_roles" IS 'Roles de usuario (admin/client) para control de acceso';
COMMENT ON TABLE "public"."invitations" IS 'Sistema de invitaciones para galería, chat y conexiones';
COMMENT ON TABLE "public"."gallery_permissions" IS 'Permisos granulares para acceso a galerías privadas';
COMMENT ON TABLE "public"."images" IS 'Almacenamiento de imágenes con control de privacidad';
COMMENT ON TABLE "public"."image_permissions" IS 'Permisos específicos para imágenes privadas';
COMMENT ON TABLE "public"."gallery_access_requests" IS 'Solicitudes de acceso a galerías privadas';
COMMENT ON TABLE "public"."chat_rooms" IS 'Salas de chat públicas y privadas';
COMMENT ON TABLE "public"."chat_members" IS 'Membresías de usuarios en salas de chat';
COMMENT ON TABLE "public"."messages" IS 'Mensajes de chat con tipos y metadatos';
COMMENT ON TABLE "public"."chat_invitations" IS 'Invitaciones a salas de chat privadas';

-- ==========================================
-- MIGRACIÓN CORRECTIVA COMPLETADA
-- ==========================================
