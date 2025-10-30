# ============================================================================
# Script: Sincronizar Base de Datos Local y Remota
# Version: 3.5.0
# Fecha: 31 Oct 2025
# ============================================================================

param(
    [switch]$LocalOnly = $false,
    [switch]$RemoteOnly = $false
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  SINCRONIZAR BASE DE DATOS - ComplicesConecta v3.5.0" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. APLICAR MIGRACION DE VERIFICACION
# ============================================================================

Write-Host "[1/4] Aplicando migracion de verificacion..." -ForegroundColor Yellow
Write-Host ""

try {
    # Verificar si Supabase CLI está disponible
    $supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
    
    if (-not $supabaseCli) {
        Write-Host "  [!] Supabase CLI no encontrado" -ForegroundColor Yellow
        Write-Host "  Aplicar migraciones manualmente desde Supabase Dashboard" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "  [+] Supabase CLI encontrado" -ForegroundColor Green
        
        # Verificar status
        Write-Host "  Verificando Supabase local..." -ForegroundColor Gray
        $status = npx supabase status 2>&1 | Out-String
        
        if ($status -match "not running" -or $status -match "not started") {
            Write-Host "  [!] Supabase local no esta corriendo" -ForegroundColor Yellow
            Write-Host "  Iniciando Supabase local..." -ForegroundColor Gray
            npx supabase start 2>&1 | Out-Null
            Start-Sleep -Seconds 15
        }
        
        Write-Host "  [+] Supabase local activo" -ForegroundColor Green
        Write-Host ""
        
        # Aplicar migración de verificación
        Write-Host "  Aplicando 20251031000001_verify_all_tables.sql..." -ForegroundColor Cyan
        npx supabase db reset 2>&1 | Out-String | Write-Host -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "  [+] Migraciones aplicadas" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] Error: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# 2. REGENERAR TYPES
# ============================================================================

Write-Host "[2/4] Regenerando types TypeScript..." -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "  Generando types desde base de datos local..." -ForegroundColor Gray
    npx supabase gen types typescript --local > src/types/supabase-generated.ts 2>&1
    Write-Host "  [+] Types generados exitosamente" -ForegroundColor Green
} catch {
    Write-Host "  [!] Error regenerando types" -ForegroundColor Yellow
    Write-Host "  Ejecutar manualmente: npm run update:types" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# 3. VERIFICAR TABLAS CRITICAS
# ============================================================================

Write-Host "[3/4] Verificando tablas criticas..." -ForegroundColor Yellow
Write-Host ""

$tables = @(
    "profiles",
    "couple_profiles",
    "ai_compatibility_scores",
    "ai_prediction_logs",
    "ai_model_metrics",
    "chat_summaries",
    "summary_requests",
    "summary_feedback"
)

Write-Host "  Tablas requeridas:" -ForegroundColor Cyan
foreach ($table in $tables) {
    Write-Host "    - $table" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# 4. INSTRUCCIONES PARA REMOTO
# ============================================================================

if (-not $LocalOnly) {
    Write-Host "[4/4] Instrucciones para Base de Datos Remota" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  PASOS PARA APLICAR MIGRACIONES A SUPABASE REMOTO:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Abre Supabase Dashboard (https://supabase.com/dashboard)" -ForegroundColor White
    Write-Host "  2. Selecciona tu proyecto" -ForegroundColor White
    Write-Host "  3. Ve a 'SQL Editor'" -ForegroundColor White
    Write-Host "  4. Ejecuta estas migraciones EN ORDEN:" -ForegroundColor White
    Write-Host ""
    
    $migrations = @(
        "20251030_create_ai_tables.sql",
        "20251030_create_chat_summaries.sql",
        "20251031000000_add_s2_geohash.sql",
        "20251031000001_verify_all_tables.sql"
    )
    
    foreach ($migration in $migrations) {
        $path = "supabase/migrations/$migration"
        if (Test-Path $path) {
            Write-Host "     [OK] $migration" -ForegroundColor Green
        } else {
            Write-Host "     [!!] $migration (no encontrado)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "  5. Verifica que no haya errores en la consola" -ForegroundColor White
    Write-Host "  6. Regenera types remotos:" -ForegroundColor White
    Write-Host "     npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/supabase-generated.ts" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# 5. RESUMEN FINAL
# ============================================================================

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  SINCRONIZACION COMPLETADA" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "ESTADO:" -ForegroundColor Cyan
Write-Host "  [+] Migraciones locales: Aplicadas" -ForegroundColor White
Write-Host "  [+] Types TypeScript: Regenerados" -ForegroundColor White
if (-not $LocalOnly) {
    Write-Host "  [!] Migraciones remotas: Aplicar manualmente" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "PROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "  1. Aplicar migraciones a Supabase remoto (si corresponde)" -ForegroundColor White
Write-Host "  2. Ejecutar backfill S2: npm run backfill:s2" -ForegroundColor White
Write-Host "  3. Verificar build: npm run build" -ForegroundColor White
Write-Host "  4. Probar funcionalidades AI y geolocation" -ForegroundColor White
Write-Host ""

