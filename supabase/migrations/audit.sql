BEGIN; -- Iniciamos una transacción de prueba (todo se revierte al final para no ensuciar)

-- ---------------------------------------------------------
-- 1. VERIFICACIÓN DE "CANDADOS" (RLS ENABLED)
-- ---------------------------------------------------------
DO $$
DECLARE
    r record;
    vulnerable_tables text := '';
BEGIN
    RAISE NOTICE '🔍 [1/3] AUDITANDO ACTIVACIÓN DE RLS...';
    
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = false -- Busca las que NO tienen seguridad
    LOOP
        vulnerable_tables := vulnerable_tables || ' ❌ ' || r.tablename || ' NO tiene RLS activado. ';
    END LOOP;

    IF vulnerable_tables = '' THEN
        RAISE NOTICE '   ✅ PERFECTO: Todas las tablas públicas tienen RLS activado.';
    ELSE
        RAISE NOTICE '   ⚠️ ALERTA: Tablas vulnerables encontradas: %', vulnerable_tables;
    END IF;
END $$;

-- ---------------------------------------------------------
-- 2. SIMULACIÓN DE ATAQUE: DEMO INTENTA VER REAL
-- ---------------------------------------------------------
DO $$
DECLARE
    -- IDs temporales para la prueba
    id_real uuid := '11111111-1111-1111-1111-111111111111';
    id_demo uuid := '22222222-2222-2222-2222-222222222222';
    count_result int;
BEGIN
    RAISE NOTICE '🕵️ [2/3] SIMULANDO INTENTO DE ACCESO NO AUTORIZADO...';

    -- A) Preparar el escenario: Crear un usuario REAL y uno DEMO en memoria
    -- (Borramos previos para evitar conflictos en este test)
    DELETE FROM public.profiles WHERE user_id IN (id_real, id_demo);
    DELETE FROM auth.users WHERE id IN (id_real, id_demo);

    -- Insertar Usuario REAL
    INSERT INTO auth.users (id, email, role) VALUES (id_real, 'real@test.com', 'authenticated');
    INSERT INTO public.profiles (id, user_id, name, is_demo) VALUES (gen_random_uuid(), id_real, 'Usuario Real', false);

    -- Insertar Usuario DEMO
    INSERT INTO auth.users (id, email, role) VALUES (id_demo, 'demo@test.com', 'authenticated');
    INSERT INTO public.profiles (id, user_id, name, is_demo) VALUES (gen_random_uuid(), id_demo, 'Usuario Demo', true);

    -- B) ACTUAR COMO USUARIO DEMO (Impersonate)
    -- Simulamos que somos el usuario Demo logueado
    EXECUTE 'SET LOCAL ROLE authenticated';
    EXECUTE 'SET LOCAL request.jwt.claim.sub = ''' || id_demo || '''';

    -- C) EL ATAQUE DE LECTURA
    -- El usuario Demo intenta contar cuántos perfiles REALES (is_demo=false) puede ver
    SELECT count(*) INTO count_result FROM public.profiles WHERE is_demo = false;

    IF count_result = 0 THEN
        RAISE NOTICE '   ✅ PRUEBA DE LECTURA PASADA: El usuario Demo ve 0 perfiles reales.';
    ELSE
        RAISE NOTICE '   ❌ FALLO DE SEGURIDAD: El usuario Demo pudo ver % perfiles reales.', count_result;
    END IF;

    -- D) EL ATAQUE DE ESCRITURA
    -- El usuario Demo intenta cambiar el nombre del Usuario Real
    UPDATE public.profiles SET name = 'HACKED' WHERE user_id = id_real;
    
    -- Verificamos si tuvo éxito (mirando como superusuario)
    RESET ROLE; -- Volvemos a ser admin para verificar
    
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = id_real AND name = 'HACKED') THEN
        RAISE NOTICE '   ❌ FALLO CRÍTICO: El usuario Demo pudo modificar un perfil Real.';
    ELSE
        RAISE NOTICE '   ✅ PRUEBA DE ESCRITURA PASADA: El usuario Demo NO pudo modificar al Real.';
    END IF;

END $$;

-- ---------------------------------------------------------
-- 3. VERIFICACIÓN DE POLÍTICAS PÚBLICAS (ANON)
-- ---------------------------------------------------------
DO $$
DECLARE
    count_result int;
BEGIN
    RAISE NOTICE '👻 [3/3] VERIFICANDO ACCESO VISITANTE (ANON)...';
    
    -- Cambiar a rol anónimo (visitante sin login)
    SET LOCAL ROLE anon;
    
    -- Intentar leer perfiles reales
    SELECT count(*) INTO count_result FROM public.profiles WHERE is_demo = false;
    
    IF count_result = 0 THEN
        RAISE NOTICE '   ✅ PRUEBA ANON PASADA: Visitantes no ven perfiles reales.';
    ELSE
        RAISE NOTICE '   ❌ FALLO ANON: Los visitantes pueden ver % perfiles reales.', count_result;
    END IF;
END $$;

ROLLBACK; -- Deshacemos todo lo creado en la prueba para dejar la BD limpia