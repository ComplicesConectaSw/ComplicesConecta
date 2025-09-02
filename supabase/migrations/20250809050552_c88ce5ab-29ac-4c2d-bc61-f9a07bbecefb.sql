-- Idempotent creation of policies using DO blocks

-- user_roles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can insert roles'
  ) THEN
    CREATE POLICY "Admins can insert roles"
      ON public.user_roles
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can update roles'
  ) THEN
    CREATE POLICY "Admins can update roles"
      ON public.user_roles
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'administrador'))
      WITH CHECK (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can delete roles'
  ) THEN
    CREATE POLICY "Admins can delete roles"
      ON public.user_roles
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

-- profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Profiles are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Profiles are viewable by authenticated users"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can delete their own profile'
  ) THEN
    CREATE POLICY "Users can delete their own profile"
      ON public.profiles
      FOR DELETE
      TO authenticated
      USING (id = auth.uid());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can insert any profile'
  ) THEN
    CREATE POLICY "Admins can insert any profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'administrador'))
      WITH CHECK (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can delete any profile'
  ) THEN
    CREATE POLICY "Admins can delete any profile"
      ON public.profiles
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'administrador'));
  END IF;
END$$;