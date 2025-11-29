-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: 2025-11-26 21:41:20
-- Version: 3.5.0
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que las tablas se crearon correctamente
-- 
-- =====================================================

-- =====================================================
-- MIGRACION: 20251126_create_global_search.sql
-- =====================================================

-- 1. Extensión pg_trgm para búsqueda difusa
create extension if not exists pg_trgm;

-- 2. Índice GIN para perfiles usando email (campo seguro)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'email'
  ) then
    execute 'create index if not exists idx_profiles_email_trgm on public.profiles using gin (email gin_trgm_ops)';
  end if;
end $$;

-- Índices para events (si la tabla existe)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name   = 'events'
  ) then
    execute 'create index if not exists idx_events_title_trgm on public.events using gin (title gin_trgm_ops)';
    execute 'create index if not exists idx_events_description_trgm on public.events using gin (description gin_trgm_ops)';
  end if;
end $$;

-- 3. Función RPC search_unified usando solo email para evitar errores de columnas inexistentes
create or replace function public.search_unified(query_text text)
returns table (
  id uuid,
  type text,
  title text,
  subtitle text,
  image_url text
) as $$
begin
  return query
    select
      p.id,
      'profile'::text as type,
      coalesce(p.email, '') as title,
      ''::text as subtitle,
      coalesce(p.avatar_url, '') as image_url
    from public.profiles p
    where
      query_text is not null
      and query_text <> ''
      and p.email ilike '%' || query_text || '%'
    order by similarity(coalesce(p.email, ''), query_text) desc
    limit 10;
end;
$$ language plpgsql security definer;

grant execute on function public.search_unified(text) to anon, authenticated;

-- =====================================================
-- FIN MIGRACION: 20251126_create_global_search.sql
-- =====================================================

-- =====================================================
-- VERIFICACION DE TABLAS CREADAS
-- =====================================================

-- Verificar tablas creadas
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN '✓ Existe'
        ELSE '✗ No existe'
    END as estado
FROM (VALUES
    ('comment_likes'),
    ('user_roles'),
    ('career_applications'),
    ('moderator_requests'),
    ('moderators'),
    ('moderation_logs'),
    ('user_suspensions'),
    ('media'),
    ('images'),
    ('media_access_logs')
) AS t(table_name);

-- Contar total de tablas
SELECT 
    COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

