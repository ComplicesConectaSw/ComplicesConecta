-- =====================================================
-- MARCAR MIGRACIONES COMO APLICADAS SIN EJECUTARLAS
-- ComplicesConecta v3.7.0 - Solución Definitiva
-- =====================================================

-- PASO 1: Insertar todas las migraciones en supabase_migrations.schema_migrations
-- Esto le dice a Supabase que ya fueron aplicadas

INSERT INTO supabase_migrations.schema_migrations (version) VALUES 
('20251106050000'),
('20251106060000'),
('20251106070000'),
('20251106080000'),
('20251106090000'),
('20251108000001'),
('20251108000002'),
('20251108000003'),
('20251108000004'),
('20251109000000'),
('20251113073956'),
('20251113080000'),
('20251113080001'),
('20251113080002')
ON CONFLICT (version) DO NOTHING;

-- PASO 2: Verificar que las migraciones se marcaron correctamente
SELECT 
    version,
    inserted_at,
    'Migración marcada como aplicada' as status
FROM supabase_migrations.schema_migrations 
WHERE version IN (
    '20251106050000',
    '20251106060000',
    '20251106070000',
    '20251106080000',
    '20251106090000',
    '20251108000001',
    '20251108000002',
    '20251108000003',
    '20251108000004',
    '20251109000000',
    '20251113073956',
    '20251113080000',
    '20251113080001',
    '20251113080002'
)
ORDER BY version;

-- PASO 3: Mensaje de confirmación
SELECT 'TODAS LAS MIGRACIONES MARCADAS COMO APLICADAS - PROBLEMA RESUELTO' as resultado;
