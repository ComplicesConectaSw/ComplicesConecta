-- =====================================================
-- PARCHE: Eliminar seeding conflictivo de user_tokens
-- =====================================================

-- Verificamos si la tabla existe antes de intentar borrar
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_tokens' AND table_schema = 'public') THEN
        -- Borramos las filas problemáticas de user_tokens si llegaron a insertarse
        DELETE FROM public.user_tokens
        WHERE user_id IN (
          '6d2b2442-b3c1-43bc-a350-6270ea7e563c',
          'fd1eb03f-5c0b-42f2-9022-6fc891b72f58',
          '2859e1ee-83d3-4ae4-ad05-d90fd40db3e4'
        );
        RAISE NOTICE 'Filas problemáticas eliminadas de user_tokens';
    ELSE
        RAISE NOTICE 'Tabla user_tokens no existe, no hay nada que limpiar';
    END IF;
END $$;

-- Opcional: Si quieres limpiar la migración para que no vuelva a intentar insertar
-- (esto depende de cómo gestiones tus migraciones, en Supabase se recomienda hacer un parche aparte)
-- Básicamente quitamos el bloque de INSERT en user_tokens en el archivo:
--   migrations/20250906_05_create_token_system.sql
-- Deja solo la creación de tablas/índices, elimina los INSERT de seed inicial.

COMMIT;
