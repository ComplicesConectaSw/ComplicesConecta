-- Restaurar estructura de base de datos y agregar tablas de invitaciones
-- Migration: 20250101_120000_restore_and_add_invitations.sql

-- 1. Eliminar tabla incorrecta creada por migración destructiva
DROP TABLE IF EXISTS "public"."police complicesconecta";

-- 2. Recrear tipo app_role si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('administrador', 'cliente');
    END IF;
END $$;

-- 3. Recrear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  bio text,
  age int CHECK (age IS NULL OR age >= 18),
  gender text,
  latitude double precision,
  longitude double precision,
  is_online boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Campos premium agregados
  stripe_customer_id text,
  stripe_subscription_id text,
  is_premium boolean DEFAULT false,
  premium_plan text,
  premium_expires_at timestamptz,
  payment_failed boolean DEFAULT false
);

-- 4. Recrear tabla user_roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. Habilitar RLS en tablas existentes
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Recrear función has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 7. Recrear función update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Recrear trigger para updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Recrear función initialize_current_user_profile
CREATE OR REPLACE FUNCTION public.initialize_current_user_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create role 'cliente' if missing for current user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'cliente')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create minimal profile if it doesn't exist yet
  INSERT INTO public.profiles (id)
  VALUES (auth.uid())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- 10. Recrear función delete_current_user
CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Delete user-owned data first
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- Deleting the auth user will cascade to user_roles due to FK ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 11. Recrear políticas RLS para profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles are viewable by authenticated users' AND tablename = 'profiles') THEN
        CREATE POLICY "Profiles are viewable by authenticated users"
          ON public.profiles
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can insert their own profile"
          ON public.profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile"
          ON public.profiles
          FOR UPDATE
          TO authenticated
          USING (id = auth.uid())
          WITH CHECK (id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can delete their own profile"
          ON public.profiles
          FOR DELETE
          TO authenticated
          USING (id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert any profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can insert any profile"
          ON public.profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can update any profile"
          ON public.profiles
          FOR UPDATE
          TO authenticated
          USING (public.has_role(auth.uid(), 'administrador'))
          WITH CHECK (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete any profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can delete any profile"
          ON public.profiles
          FOR DELETE
          TO authenticated
          USING (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

-- 12. Recrear políticas RLS para user_roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Users can view their own roles"
          ON public.user_roles
          FOR SELECT
          TO authenticated
          USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can view all roles"
          ON public.user_roles
          FOR SELECT
          TO authenticated
          USING (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can insert roles"
          ON public.user_roles
          FOR INSERT
          TO authenticated
          WITH CHECK (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can update roles"
          ON public.user_roles
          FOR UPDATE
          TO authenticated
          USING (public.has_role(auth.uid(), 'administrador'))
          WITH CHECK (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can delete roles"
          ON public.user_roles
          FOR DELETE
          TO authenticated
          USING (public.has_role(auth.uid(), 'administrador'));
    END IF;
END $$;

-- 13. Crear tipos enum para invitaciones
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_type') THEN
        CREATE TYPE public.invitation_type AS ENUM ('profile', 'gallery', 'chat');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_scope') THEN
        CREATE TYPE public.gallery_scope AS ENUM ('private_gallery', 'album');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_status') THEN
        CREATE TYPE public.permission_status AS ENUM ('active', 'revoked');
    END IF;
END $$;

-- 14. Crear tabla invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text,
  type public.invitation_type DEFAULT 'profile',
  status public.invitation_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  decided_at timestamptz
);

-- 15. Crear tabla gallery_permissions
CREATE TABLE IF NOT EXISTS public.gallery_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grantee_profile uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scope public.gallery_scope DEFAULT 'private_gallery',
  source_invitation uuid REFERENCES public.invitations(id) ON DELETE SET NULL,
  status public.permission_status DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 16. Habilitar RLS en nuevas tablas
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

-- 17. Crear políticas RLS para invitations
-- Solo el emisor, receptor o administradores pueden leer invitaciones
CREATE POLICY "Users can view their own invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (
    from_profile = auth.uid() OR 
    to_profile = auth.uid() OR 
    public.has_role(auth.uid(), 'administrador')
  );

-- Solo usuarios autenticados pueden crear invitaciones
CREATE POLICY "Users can create invitations"
  ON public.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (from_profile = auth.uid());

-- Solo el receptor puede actualizar el estado de la invitación
CREATE POLICY "Recipients can update invitation status"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (to_profile = auth.uid())
  WITH CHECK (to_profile = auth.uid());

-- Solo el emisor puede revocar sus invitaciones
CREATE POLICY "Senders can revoke their invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (from_profile = auth.uid())
  WITH CHECK (from_profile = auth.uid());

-- Administradores pueden gestionar todas las invitaciones
CREATE POLICY "Admins can manage all invitations"
  ON public.invitations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));

-- 18. Crear políticas RLS para gallery_permissions
-- Solo el propietario, beneficiario o administradores pueden leer permisos
CREATE POLICY "Users can view their gallery permissions"
  ON public.gallery_permissions
  FOR SELECT
  TO authenticated
  USING (
    owner_profile = auth.uid() OR 
    grantee_profile = auth.uid() OR 
    public.has_role(auth.uid(), 'administrador')
  );

-- Solo el propietario puede crear permisos
CREATE POLICY "Owners can create gallery permissions"
  ON public.gallery_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_profile = auth.uid());

-- Solo el propietario puede actualizar/revocar permisos
CREATE POLICY "Owners can manage their gallery permissions"
  ON public.gallery_permissions
  FOR UPDATE
  TO authenticated
  USING (owner_profile = auth.uid())
  WITH CHECK (owner_profile = auth.uid());

-- Administradores pueden gestionar todos los permisos
CREATE POLICY "Admins can manage all gallery permissions"
  ON public.gallery_permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));

-- 19. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_invitations_from_profile ON public.invitations(from_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile ON public.invitations(to_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_type ON public.invitations(type);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON public.invitations(created_at);

CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner ON public.gallery_permissions(owner_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_grantee ON public.gallery_permissions(grantee_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status ON public.gallery_permissions(status);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_scope ON public.gallery_permissions(scope);

-- 20. Crear función para manejar aceptación de invitaciones de galería
CREATE OR REPLACE FUNCTION public.accept_gallery_invitation(invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record public.invitations%ROWTYPE;
BEGIN
  -- Obtener la invitación
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE id = invitation_id AND to_profile = auth.uid() AND status = 'pending';
  
  -- Verificar que la invitación existe y es de tipo gallery
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitación no encontrada o no autorizada';
  END IF;
  
  IF invitation_record.type != 'gallery' THEN
    RAISE EXCEPTION 'Esta función solo maneja invitaciones de galería';
  END IF;
  
  -- Actualizar el estado de la invitación
  UPDATE public.invitations
  SET status = 'accepted', decided_at = now()
  WHERE id = invitation_id;
  
  -- Crear permiso de galería
  INSERT INTO public.gallery_permissions (
    owner_profile,
    grantee_profile,
    scope,
    source_invitation
  ) VALUES (
    invitation_record.from_profile,
    invitation_record.to_profile,
    'private_gallery',
    invitation_id
  );
END;
$$;

-- 21. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.initialize_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_gallery_invitation(uuid) TO authenticated;

-- 22. Agregar comentarios para documentación
COMMENT ON TABLE public.invitations IS 'Sistema de invitaciones para perfiles, galerías y chat privado';
COMMENT ON TABLE public.gallery_permissions IS 'Permisos de acceso a galerías privadas';
COMMENT ON COLUMN public.invitations.type IS 'Tipo de invitación: profile, gallery, chat';
COMMENT ON COLUMN public.invitations.status IS 'Estado de la invitación: pending, accepted, declined, revoked';
COMMENT ON COLUMN public.gallery_permissions.scope IS 'Alcance del permiso: private_gallery, album';
COMMENT ON COLUMN public.gallery_permissions.status IS 'Estado del permiso: active, revoked';
