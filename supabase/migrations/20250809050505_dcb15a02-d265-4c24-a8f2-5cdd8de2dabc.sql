-- Enable required extension for UUID generation (safe if already enabled)
create extension if not exists pgcrypto;

-- 1) Roles enum (robust creation without IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('administrador', 'cliente');
  END IF;
END$$;

-- 2) user_roles table (store user -> role associations)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 3) Security definer helper to check roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 4) RLS policies for user_roles
-- Users can see their own roles
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

-- Admins can view all roles
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

-- Only admins can insert roles
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

-- Only admins can update roles
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

-- Only admins can delete roles
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

-- 5) profiles table (user-owned information)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  bio text,
  age int check (age is null or age >= 13),
  gender text,
  latitude double precision,
  longitude double precision,
  is_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 6) Utility: auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 7) RLS policies for profiles
-- Everyone authenticated can view profiles
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

-- Users can create their own profile
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

-- Users can update their own profile
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

-- Users can delete their own profile (for account deletion)
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

-- Admins can manage all profiles
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

-- 8) Initialize helper: create minimal profile and default 'cliente' role for current user
create or replace function public.initialize_current_user_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create role 'cliente' if missing for current user
  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'cliente')
  on conflict (user_id, role) do nothing;

  -- Create minimal profile if it doesn't exist yet
  insert into public.profiles (id)
  values (auth.uid())
  on conflict (id) do nothing;
end;
$$;

-- 9) Account deletion (irreversible): deletes profile then the auth user itself
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Delete user-owned data first
  delete from public.profiles where id = auth.uid();
  -- Deleting the auth user will cascade to user_roles due to FK ON DELETE CASCADE
  delete from auth.users where id = auth.uid();
end;
$$;

-- Grant execute to authenticated users for the helper functions
grant execute on function public.initialize_current_user_profile() to authenticated;
grant execute on function public.delete_current_user() to authenticated;