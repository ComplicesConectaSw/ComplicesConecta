-- =====================================================
-- 🔧 CORRECCIÓN CRÍTICA DE ESQUEMA DE BASE DE DATOS
-- ComplicesConecta v2.6.1 - Reparación de Enlaces Rotos
-- Fecha: 14 de septiembre, 2025 - 06:33 hrs
-- =====================================================

-- 1. CORREGIR TABLA gallery_permissions
-- El código busca 'owner_profile_id' pero la tabla tiene 'profile_id'
ALTER TABLE public.gallery_permissions 
ADD COLUMN IF NOT EXISTS owner_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrar datos existentes si los hay
UPDATE public.gallery_permissions 
SET owner_profile_id = profile_id 
WHERE owner_profile_id IS NULL;

-- Agregar columna 'status' que el código espera
ALTER TABLE public.gallery_permissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired'));

-- Agregar columna 'grantee_profile_id' que el código espera
ALTER TABLE public.gallery_permissions 
ADD COLUMN IF NOT EXISTS grantee_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrar datos existentes
UPDATE public.gallery_permissions 
SET grantee_profile_id = granted_to 
WHERE grantee_profile_id IS NULL;

-- 2. CORREGIR TABLA invitations
-- El código busca relaciones con 'profiles' pero las referencias van a 'auth.users'
-- Necesitamos cambiar las referencias para que apunten a la tabla 'profiles'

-- Primero, eliminar las foreign keys existentes
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_from_profile_fkey;
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_to_profile_fkey;

-- Cambiar las columnas para que sean compatibles con profiles
ALTER TABLE public.invitations 
ALTER COLUMN from_profile TYPE UUID,
ALTER COLUMN to_profile TYPE UUID;

-- Agregar las columnas que el código espera
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS from_profile_id UUID,
ADD COLUMN IF NOT EXISTS to_profile_id UUID,
ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP WITH TIME ZONE;

-- Migrar datos existentes
UPDATE public.invitations 
SET from_profile_id = from_profile,
    to_profile_id = to_profile
WHERE from_profile_id IS NULL OR to_profile_id IS NULL;

-- Crear las foreign keys correctas hacia profiles
ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_from_profile_fkey 
FOREIGN KEY (from_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_to_profile_fkey 
FOREIGN KEY (to_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Agregar tipo 'chat' que el código usa
ALTER TABLE public.invitations 
DROP CONSTRAINT IF EXISTS invitations_type_check;

ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_type_check 
CHECK (type IN ('connection', 'event', 'group', 'chat', 'gallery'));

-- 3. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_grantee 
ON public.gallery_permissions(owner_profile_id, grantee_profile_id);

CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status 
ON public.gallery_permissions(status);

CREATE INDEX IF NOT EXISTS idx_invitations_from_to 
ON public.invitations(from_profile_id, to_profile_id);

CREATE INDEX IF NOT EXISTS idx_invitations_type_status 
ON public.invitations(type, status);

-- 4. ACTUALIZAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view own permissions" ON gallery_permissions;
CREATE POLICY "Users can view own permissions" ON gallery_permissions 
FOR SELECT USING (
    owner_profile_id = auth.uid() OR 
    grantee_profile_id = auth.uid() OR
    granted_by = auth.uid() OR 
    granted_to = auth.uid()
);

DROP POLICY IF EXISTS "Users can view own invitations" ON invitations;
CREATE POLICY "Users can view own invitations" ON invitations 
FOR SELECT USING (
    from_profile_id = auth.uid() OR 
    to_profile_id = auth.uid() OR
    from_profile = auth.uid() OR 
    to_profile = auth.uid()
);

-- 5. VERIFICAR INTEGRIDAD DE DATOS
-- Limpiar registros huérfanos que puedan causar errores
DELETE FROM public.gallery_permissions 
WHERE owner_profile_id IS NULL OR grantee_profile_id IS NULL;

DELETE FROM public.invitations 
WHERE from_profile_id IS NULL OR to_profile_id IS NULL;

-- =====================================================
-- ✅ ESQUEMA CORREGIDO Y SINCRONIZADO CON EL CÓDIGO
-- =====================================================
