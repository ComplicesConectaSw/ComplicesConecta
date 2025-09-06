-- ==========================================
-- MIGRACIÓN CORRECTIVA COMPLICESCONECTA v2.1.1
-- Fecha: 2025-09-06
-- Propósito: Resolver conflictos críticos de migraciones destructivas
-- ==========================================

-- PASO 1: ELIMINAR TABLA INCORRECTA CREADA POR MIGRACIÓN PROBLEMÁTICA
DROP TABLE IF EXISTS "public"."police complicesconecta" CASCADE;

-- PASO 2: RECREAR TIPOS ENUM NECESARIOS
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PASO 3: RECREAR TABLAS CRÍTICAS CON VALIDACIÓN DE EXISTENCIA

-- Tabla profiles (núcleo del sistema)
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "email" text,
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
    -- Campos adicionales para matching system
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

-- Tabla user_roles (sistema de permisos)
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "role" app_role NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role")
);

-- Tabla invitations (sistema de solicitudes)
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

-- Tabla gallery_permissions (permisos de galería)
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

-- Tabla images (sistema de imágenes)
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

-- PASO 4: RECREAR FUNCIONES CRÍTICAS DE SEGURIDAD

-- Función has_role (crítica para RLS)
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

-- Función handle_new_user (trigger para nuevos usuarios)
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

-- Función update_updated_at_column (timestamps automáticos)
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- PASO 5: RECREAR TRIGGERS CRÍTICOS

-- Trigger para profiles updated_at
DROP TRIGGER IF EXISTS "trg_profiles_updated_at" ON "public"."profiles";
CREATE TRIGGER "trg_profiles_updated_at"
    BEFORE UPDATE ON "public"."profiles"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Trigger para invitations updated_at
DROP TRIGGER IF EXISTS "trg_invitations_updated_at" ON "public"."invitations";
CREATE TRIGGER "trg_invitations_updated_at"
    BEFORE UPDATE ON "public"."invitations"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Trigger para images updated_at
DROP TRIGGER IF EXISTS "trg_images_updated_at" ON "public"."images";
CREATE TRIGGER "trg_images_updated_at"
    BEFORE UPDATE ON "public"."images"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Trigger para handle_new_user
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."handle_new_user"();

-- PASO 6: HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."images" ENABLE ROW LEVEL SECURITY;

-- PASO 7: POLÍTICAS RLS COMPLETAS Y SEGURAS

-- === POLÍTICAS PARA PROFILES ===
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON "public"."profiles";
CREATE POLICY "Profiles are viewable by authenticated users"
    ON "public"."profiles" FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON "public"."profiles";
CREATE POLICY "Users can insert their own profile"
    ON "public"."profiles" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."profiles";
CREATE POLICY "Users can update their own profile"
    ON "public"."profiles" FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON "public"."profiles";
CREATE POLICY "Users can delete their own profile"
    ON "public"."profiles" FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage any profile" ON "public"."profiles";
CREATE POLICY "Admins can manage any profile"
    ON "public"."profiles" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === POLÍTICAS PARA USER_ROLES ===
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
CREATE POLICY "Users can view their own roles"
    ON "public"."user_roles" FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON "public"."user_roles";
CREATE POLICY "Admins can manage all roles"
    ON "public"."user_roles" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === POLÍTICAS PARA INVITATIONS ===
DROP POLICY IF EXISTS "Users can view their invitations" ON "public"."invitations";
CREATE POLICY "Users can view their invitations"
    ON "public"."invitations" FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send invitations" ON "public"."invitations";
CREATE POLICY "Users can send invitations"
    ON "public"."invitations" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their invitations" ON "public"."invitations";
CREATE POLICY "Users can update their invitations"
    ON "public"."invitations" FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Admins can manage all invitations" ON "public"."invitations";
CREATE POLICY "Admins can manage all invitations"
    ON "public"."invitations" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === POLÍTICAS PARA GALLERY_PERMISSIONS ===
DROP POLICY IF EXISTS "Users can view their gallery permissions" ON "public"."gallery_permissions";
CREATE POLICY "Users can view their gallery permissions"
    ON "public"."gallery_permissions" FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Users can manage their gallery permissions" ON "public"."gallery_permissions";
CREATE POLICY "Users can manage their gallery permissions"
    ON "public"."gallery_permissions" FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can manage all gallery permissions" ON "public"."gallery_permissions";
CREATE POLICY "Admins can manage all gallery permissions"
    ON "public"."gallery_permissions" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- === POLÍTICAS PARA IMAGES ===
DROP POLICY IF EXISTS "Users can view public images" ON "public"."images";
CREATE POLICY "Users can view public images"
    ON "public"."images" FOR SELECT
    TO authenticated
    USING (NOT is_private OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view private images with permission" ON "public"."images";
CREATE POLICY "Users can view private images with permission"
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

DROP POLICY IF EXISTS "Users can manage their own images" ON "public"."images";
CREATE POLICY "Users can manage their own images"
    ON "public"."images" FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all images" ON "public"."images";
CREATE POLICY "Admins can manage all images"
    ON "public"."images" FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- PASO 8: CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS "idx_profiles_profile_type" ON "public"."profiles" ("profile_type");
CREATE INDEX IF NOT EXISTS "idx_profiles_is_active" ON "public"."profiles" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_profiles_verification_status" ON "public"."profiles" ("verification_status");
CREATE INDEX IF NOT EXISTS "idx_user_roles_user_id" ON "public"."user_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_sender_receiver" ON "public"."invitations" ("sender_id", "receiver_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_status" ON "public"."invitations" ("status");
CREATE INDEX IF NOT EXISTS "idx_gallery_permissions_owner_viewer" ON "public"."gallery_permissions" ("owner_id", "viewer_id");
CREATE INDEX IF NOT EXISTS "idx_images_user_type" ON "public"."images" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_images_is_private" ON "public"."images" ("is_private");

-- PASO 9: OTORGAR PERMISOS NECESARIOS
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."profiles" TO authenticated;
GRANT SELECT ON TABLE "public"."profiles" TO anon;
GRANT SELECT ON TABLE "public"."user_roles" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."invitations" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."gallery_permissions" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."images" TO authenticated;

-- PASO 10: COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE "public"."profiles" IS 'Perfiles de usuarios con información básica y preferencias de matching';
COMMENT ON TABLE "public"."user_roles" IS 'Roles de usuario (admin/client) para control de acceso';
COMMENT ON TABLE "public"."invitations" IS 'Sistema de invitaciones para galería, chat y conexiones';
COMMENT ON TABLE "public"."gallery_permissions" IS 'Permisos granulares para acceso a galerías privadas';
COMMENT ON TABLE "public"."images" IS 'Almacenamiento de imágenes de perfil y galería con privacidad';

-- ==========================================
-- MIGRACIÓN CORRECTIVA COMPLETADA
-- ==========================================
