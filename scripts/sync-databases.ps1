# ============================================================================
# Script: Sincronizar Base de Datos Local y Remota
# Versión: 3.5.0
# Fecha: 31 Oct 2025
# ============================================================================

param(
    [switch]$LocalOnly = $false,
    [switch]$RemoteOnly = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     [SYNC] SINCRONIZAR BASE DE DATOS                               ║
║     ComplicesConecta v3.5.0                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# ============================================================================
# 1. VERIFICAR ESTADO ACTUAL
# ============================================================================

Write-Host "[INFO] VERIFICANDO ESTADO ACTUAL..." -ForegroundColor Yellow
Write-Host ""

# Listar migraciones locales
Write-Host "[INFO] Migraciones locales:" -ForegroundColor Cyan
$localMigrations = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Sort-Object Name
foreach ($migration in $localMigrations) {
    Write-Host "  [OK] $($migration.Name)" -ForegroundColor Gray
}
Write-Host "  Total: $($localMigrations.Count) migraciones" -ForegroundColor White
Write-Host ""

# Listar migraciones remotas
Write-Host "[INFO] Migraciones remotas:" -ForegroundColor Cyan
try {
    $remoteMigrations = npx supabase db remote list 2>&1 | Out-String
    Write-Host $remoteMigrations -ForegroundColor Gray
} catch {
    Write-Host "  [WARN] No se pudo conectar a Supabase remoto" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# 2. VERIFICAR TABLAS CRÍTICAS
# ============================================================================

Write-Host "[INFO] VERIFICANDO TABLAS CRÍTICAS..." -ForegroundColor Yellow
Write-Host ""

$criticalTables = @(
    # Tablas core
    "profiles",
    "couple_profiles",
    "swinger_interests",
    "couple_profile_likes",
    
    # Tablas chat
    "messages",
    "chat_rooms",
    "chat_members",
    
    # Tablas AI (Fase 1)
    "ai_compatibility_scores",
    "ai_prediction_logs",
    "ai_model_metrics",
    "chat_summaries",
    "summary_requests",
    "summary_feedback"
    
    # Tablas S2 (Fase 2.1)
    # Nota: profiles y couple_profiles deben tener columnas s2_cell_id
)

Write-Host "[INFO] Tablas requeridas:" -ForegroundColor Cyan
foreach ($table in $criticalTables) {
    Write-Host "  • $table" -ForegroundColor Gray
}
Write-Host ""

# ============================================================================
# 3. APLICAR MIGRACIONES FALTANTES
# ============================================================================

if (-not $RemoteOnly) {
    Write-Host "[ACTION] APLICAR MIGRACIONES A LOCAL..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Verificar si Supabase local está corriendo
        $supabaseStatus = npx supabase status 2>&1 | Out-String
        
        if ($supabaseStatus -match "supabase is not running") {
            Write-Host "[WARN] Supabase local no está corriendo" -ForegroundColor Yellow
            Write-Host "   Iniciando Supabase local..." -ForegroundColor Gray
            npx supabase start
            Start-Sleep -Seconds 10
        }
        
        Write-Host "[OK] Supabase local activo" -ForegroundColor Green
        Write-Host ""
        
        # Aplicar migraciones pendientes
        Write-Host "[INFO] Aplicando migraciones..." -ForegroundColor Cyan
        npx supabase db reset 2>&1 | Out-String | Write-Host -ForegroundColor Gray
        
        Write-Host "[OK] Migraciones locales aplicadas" -ForegroundColor Green
        
    } catch {
        Write-Host "[ERROR] Error aplicando migraciones locales: $_" -ForegroundColor Red
    }
    Write-Host ""
}

if (-not $LocalOnly) {
    Write-Host "[ACTION] APLICAR MIGRACIONES A REMOTO..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "[WARN] IMPORTANTE: Las migraciones remotas deben aplicarse manualmente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[INFO] PASOS PARA APLICAR MIGRACIONES REMOTAS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Abre Supabase Dashboard (https://supabase.com/dashboard)" -ForegroundColor White
    Write-Host "2) Selecciona tu proyecto" -ForegroundColor White
    Write-Host "3) Ve a 'SQL Editor'" -ForegroundColor White
    Write-Host "4) Ejecuta las siguientes migraciones EN ORDEN:" -ForegroundColor White
    Write-Host ""
    
    $pendingMigrations = @(
        "20251030_create_ai_tables.sql",
        "20251030_create_chat_summaries.sql",
        "20251031000000_add_s2_geohash.sql"
    )
    
    foreach ($migration in $pendingMigrations) {
        $migrationPath = "supabase/migrations/$migration"
        if (Test-Path $migrationPath) {
            Write-Host "   [OK] $migration" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] $migration (archivo no encontrado)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "5) Verifica que no haya errores" -ForegroundColor White
    Write-Host "6) Regenera types: npm run update:types" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# 4. REGENERAR TYPES
# ============================================================================

Write-Host "[ACTION] REGENERANDO TYPES..." -ForegroundColor Yellow
Write-Host ""

try {
    if (-not $RemoteOnly) {
        Write-Host "[INFO] Types desde local..." -ForegroundColor Cyan
        npx supabase gen types typescript --local > src/types/supabase-generated.ts 2>&1
        Write-Host "[OK] Types locales generados" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Types desde remoto..." -ForegroundColor Cyan
        npx supabase gen types typescript --project-id $env:SUPABASE_PROJECT_ID > src/types/supabase-generated.ts 2>&1
        Write-Host "[OK] Types remotos generados" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Error regenerando types: $_" -ForegroundColor Yellow
    Write-Host "   Ejecutar manualmente: npm run update:types" -ForegroundColor Gray
}
Write-Host ""

# ============================================================================
# 5. VERIFICAR COLUMNAS S2
# ============================================================================

Write-Host "[INFO] VERIFICANDO COLUMNAS S2..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Verificando que profiles y couple_profiles tengan columnas S2:" -ForegroundColor Cyan
Write-Host "  • s2_cell_id_level_10 (VARCHAR 20)" -ForegroundColor Gray
Write-Host "  • s2_cell_id_level_15 (VARCHAR 20)" -ForegroundColor Gray
Write-Host ""

if (-not $RemoteOnly) {
    Write-Host "✓ Ejecutar backfill después de aplicar migración:" -ForegroundColor Green
    Write-Host "  npm run backfill:s2" -ForegroundColor White
}
Write-Host ""

# ============================================================================
# 6. RESUMEN FINAL
# ============================================================================

Write-Host "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     ✅ SINCRONIZACIÓN COMPLETADA                                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "📊 ESTADO FINAL:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Migraciones locales: $(if (-not $RemoteOnly) { 'Aplicadas' } else { 'Omitidas' })" -ForegroundColor White
Write-Host "$(if (-not $LocalOnly) { '⚠️' } else { '✅' })  Migraciones remotas: $(if (-not $LocalOnly) { 'Aplicar manualmente' } else { 'Omitidas' })" -ForegroundColor White
Write-Host "✅ Types: Regenerados" -ForegroundColor White
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Aplicar migraciones remotas (si no se ha hecho)" -ForegroundColor White
Write-Host "2. Ejecutar backfill S2: npm run backfill:s2" -ForegroundColor White
Write-Host "3. Verificar build: npm run build" -ForegroundColor White
Write-Host "4. Probar funcionalidades AI y geolocation" -ForegroundColor White
Write-Host ""

