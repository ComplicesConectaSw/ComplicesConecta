-- =====================================================
-- 🚨 CORRECCIÓN DE EMERGENCIA - RESOLVER ERRORES CRÍTICOS
-- ComplicesConecta v2.6.1 - Reparación de Base de Datos
-- =====================================================

-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS RLS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view own invitations v2" ON public.invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can create invitations v2" ON public.invitations;
DROP POLICY IF EXISTS "Users can update own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can update own invitations v2" ON public.invitations;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.gallery_permissions;
DROP POLICY IF EXISTS "Users can view own gallery permissions v2" ON public.gallery_permissions;
DROP POLICY IF EXISTS "Users can create permissions" ON public.gallery_permissions;
DROP POLICY IF EXISTS "Users can create gallery permissions v2" ON public.gallery_permissions;
DROP POLICY IF EXISTS "Users can update own permissions" ON public.gallery_permissions;
DROP POLICY IF EXISTS "Users can update own gallery permissions v2" ON public.gallery_permissions;

-- PASO 2: DESHABILITAR RLS TEMPORALMENTE
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_permissions DISABLE ROW LEVEL SECURITY;

-- PASO 3: ELIMINAR CONSTRAINTS DUPLICADOS/PROBLEMÁTICOS
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_from_profile_fkey;
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_to_profile_fkey;
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_from_profile_id_fkey;
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_to_profile_id_fkey;
ALTER TABLE public.gallery_permissions DROP CONSTRAINT IF EXISTS gallery_permissions_profile_id_fkey;
ALTER TABLE public.gallery_permissions DROP CONSTRAINT IF EXISTS gallery_permissions_granted_to_fkey;
ALTER TABLE public.gallery_permissions DROP CONSTRAINT IF EXISTS gallery_permissions_owner_profile_id_fkey;
ALTER TABLE public.gallery_permissions DROP CONSTRAINT IF EXISTS gallery_permissions_grantee_profile_id_fkey;

-- PASO 4: AGREGAR COLUMNAS NECESARIAS (SIN MODIFICAR EXISTENTES)
-- Para invitations - agregar columnas nuevas sin tocar las existentes
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS from_profile_id UUID,
ADD COLUMN IF NOT EXISTS to_profile_id UUID,
ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP WITH TIME ZONE;

-- Para gallery_permissions - agregar columnas nuevas
ALTER TABLE public.gallery_permissions 
ADD COLUMN IF NOT EXISTS owner_profile_id UUID,
ADD COLUMN IF NOT EXISTS grantee_profile_id UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- PASO 5: MIGRAR DATOS A LAS NUEVAS COLUMNAS
UPDATE public.invitations 
SET from_profile_id = from_profile::UUID,
    to_profile_id = to_profile::UUID
WHERE from_profile_id IS NULL AND from_profile IS NOT NULL;

UPDATE public.gallery_permissions 
SET owner_profile_id = profile_id,
    grantee_profile_id = granted_to
WHERE owner_profile_id IS NULL AND profile_id IS NOT NULL;

-- PASO 6: CREAR FOREIGN KEYS HACIA PROFILES (NO AUTH.USERS)
ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_from_profile_id_fkey 
FOREIGN KEY (from_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_to_profile_id_fkey 
FOREIGN KEY (to_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.gallery_permissions 
ADD CONSTRAINT gallery_permissions_owner_profile_id_fkey 
FOREIGN KEY (owner_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.gallery_permissions 
ADD CONSTRAINT gallery_permissions_grantee_profile_id_fkey 
FOREIGN KEY (grantee_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- PASO 7: AGREGAR CONSTRAINTS DE VALIDACIÓN
ALTER TABLE public.invitations 
DROP CONSTRAINT IF EXISTS invitations_type_check;

ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_type_check 
CHECK (type IN ('connection', 'event', 'group', 'chat', 'gallery', 'profile'));

ALTER TABLE public.gallery_permissions 
DROP CONSTRAINT IF EXISTS gallery_permissions_status_check;

ALTER TABLE public.gallery_permissions 
ADD CONSTRAINT gallery_permissions_status_check 
CHECK (status IN ('active', 'revoked', 'expired'));

-- PASO 8: CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_invitations_from_profile_id ON public.invitations(from_profile_id);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile_id ON public.invitations(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_invitations_type_status ON public.invitations(type, status);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_grantee ON public.gallery_permissions(owner_profile_id, grantee_profile_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status ON public.gallery_permissions(status);

-- PASO 9: HABILITAR RLS NUEVAMENTE
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

-- PASO 10: CREAR POLÍTICAS RLS SIMPLES Y FUNCIONALES
-- Políticas para invitations (usando SOLO las nuevas columnas)
CREATE POLICY "invitations_select_policy" ON public.invitations 
FOR SELECT USING (
    from_profile_id = auth.uid() OR 
    to_profile_id = auth.uid()
);

CREATE POLICY "invitations_insert_policy" ON public.invitations 
FOR INSERT WITH CHECK (from_profile_id = auth.uid());

CREATE POLICY "invitations_update_policy" ON public.invitations 
FOR UPDATE USING (
    from_profile_id = auth.uid() OR 
    to_profile_id = auth.uid()
);

-- Políticas para gallery_permissions (usando SOLO las nuevas columnas)
CREATE POLICY "gallery_permissions_select_policy" ON public.gallery_permissions 
FOR SELECT USING (
    owner_profile_id = auth.uid() OR 
    grantee_profile_id = auth.uid()
);

CREATE POLICY "gallery_permissions_insert_policy" ON public.gallery_permissions 
FOR INSERT WITH CHECK (owner_profile_id = auth.uid());

CREATE POLICY "gallery_permissions_update_policy" ON public.gallery_permissions 
FOR UPDATE USING (
    owner_profile_id = auth.uid() OR 
    grantee_profile_id = auth.uid()
);

-- PASO 11: LIMPIAR DATOS INCONSISTENTES
DELETE FROM public.invitations 
WHERE from_profile_id IS NULL OR to_profile_id IS NULL;

DELETE FROM public.gallery_permissions 
WHERE owner_profile_id IS NULL OR grantee_profile_id IS NULL;

-- =====================================================
-- ✅ BASE DE DATOS REPARADA Y FUNCIONAL
-- - Políticas RLS simples y sin conflictos
-- - Nuevas columnas compatibles con el código
-- - Foreign keys correctos hacia profiles
-- - Datos migrados y limpiados
-- =====================================================
