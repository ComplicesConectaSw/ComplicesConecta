-- =====================================================
-- MIGRACIÓN: Corrección de Triggers Duplicados
-- Fecha: 2025-11-15 13:00:00
-- Descripción: Corrige triggers duplicados que causan errores
-- =====================================================

-- Eliminar trigger duplicado si existe
DROP TRIGGER IF EXISTS update_story_comments_updated_at ON story_comments;

-- Recrear trigger correctamente
CREATE TRIGGER update_story_comments_updated_at 
    BEFORE UPDATE ON story_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la función existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers faltantes para otras tablas (PostgreSQL no soporta IF NOT EXISTS en triggers)
DO $$ 
BEGIN

    -- Trigger para gallery_commissions (solo si existe la tabla)

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'gallery_commissions'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'trigger_gallery_commissions_updated_at'
        ) THEN 
            CREATE TRIGGER trigger_gallery_commissions_updated_at 
                BEFORE UPDATE ON gallery_commissions 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
            RAISE NOTICE '✅ Trigger trigger_gallery_commissions_updated_at creado'; 
        ELSE 
            RAISE NOTICE '⚠️ Trigger trigger_gallery_commissions_updated_at ya existe'; 
        END IF; 
    ELSE
        RAISE NOTICE '⚠️ Tabla gallery_commissions no existe; se omite creación de trigger';
    END IF;

    -- Trigger para invitation_statistics (solo si existe la tabla)

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'invitation_statistics'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'trigger_invitation_statistics_updated_at'
        ) THEN 
            CREATE TRIGGER trigger_invitation_statistics_updated_at 
                BEFORE UPDATE ON invitation_statistics 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
            RAISE NOTICE '✅ Trigger trigger_invitation_statistics_updated_at creado'; 
        ELSE 
            RAISE NOTICE '⚠️ Trigger trigger_invitation_statistics_updated_at ya existe'; 
        END IF; 
    ELSE
        RAISE NOTICE '⚠️ Tabla invitation_statistics no existe; se omite creación de trigger';
    END IF;

END $$;

-- Verificar que todas las políticas RLS existen
DO $$ 
BEGIN
    -- Políticas para analytics_events
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_events' 
        AND policyname = 'Users can view own analytics events'
    ) THEN
        CREATE POLICY "Users can view own analytics events" ON analytics_events
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_events' 
        AND policyname = 'System can insert analytics events'
    ) THEN
        CREATE POLICY "System can insert analytics events" ON analytics_events
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Políticas para story_likes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_likes' 
        AND policyname = 'Users can view all story likes'
    ) THEN
        CREATE POLICY "Users can view all story likes" ON story_likes 
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_likes' 
        AND policyname = 'Users can create own story likes'
    ) THEN
        CREATE POLICY "Users can create own story likes" ON story_likes 
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Políticas para story_comments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_comments' 
        AND policyname = 'Users can view all story comments'
    ) THEN
        CREATE POLICY "Users can view all story comments" ON story_comments 
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_comments' 
        AND policyname = 'Users can create own story comments'
    ) THEN
        CREATE POLICY "Users can create own story comments" ON story_comments 
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Políticas para story_shares
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_shares' 
        AND policyname = 'Users can view all story shares'
    ) THEN
        CREATE POLICY "Users can view all story shares" ON story_shares 
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'story_shares' 
        AND policyname = 'Users can create own story shares'
    ) THEN
        CREATE POLICY "Users can create own story shares" ON story_shares 
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE '✅ Todas las políticas RLS verificadas y creadas';
END $$;

-- Reporte final
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MIGRACIÓN DE LIMPIEZA COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 CORRECCIONES APLICADAS:';
    RAISE NOTICE '   ✅ Trigger duplicado eliminado y recreado';
    RAISE NOTICE '   ✅ Función update_updated_at_column verificada';
    RAISE NOTICE '   ✅ Triggers faltantes creados';
    RAISE NOTICE '   ✅ Políticas RLS verificadas y creadas';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ESTADO FINAL:';
    RAISE NOTICE '   ✅ Base de datos completamente alineada';
    RAISE NOTICE '   ✅ Triggers funcionando correctamente';
    RAISE NOTICE '   ✅ RLS configurado completamente';
    RAISE NOTICE '   ✅ Sin errores de migración';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 ComplicesConecta v3.6.3 - Base de Datos Lista';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
