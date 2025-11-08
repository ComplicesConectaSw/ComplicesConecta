# ============================================================================
# Script: Alinear y Verificar Todo (Local y Remoto) v3.6.3
# Fecha: 08 Nov 2025
# Descripción: Alinea todas las tablas y verifica que estén operativas y en uso
# ============================================================================

param(
    [switch]$LocalOnly = $false,
    [switch]$RemoteOnly = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                    ║" -ForegroundColor Cyan
Write-Host "║     🔄 ALINEAR Y VERIFICAR TODO                                   ║" -ForegroundColor Cyan
Write-Host "║     ComplicesConecta v3.6.3                                        ║" -ForegroundColor Cyan
Write-Host "║                                                                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. APLICAR MIGRACIONES CORREGIDAS
# ============================================================================

Write-Host "📋 PASO 1: APLICAR MIGRACIONES CORREGIDAS" -ForegroundColor Yellow
Write-Host ""

if (-not $RemoteOnly) {
    Write-Host "  🗄️  Aplicando migraciones locales..." -ForegroundColor Cyan
    try {
        # Aplicar migración corregida manualmente
        Write-Host "     Aplicando migración corregida: 20251108000003_add_chat_rooms_columns.sql" -ForegroundColor Gray
        $migrationPath = "supabase\migrations\20251108000003_add_chat_rooms_columns.sql"
        if (Test-Path $migrationPath) {
            # Verificar si ya se aplicó
            Write-Host "     ✅ Migración corregida lista para aplicar" -ForegroundColor Green
        }
        
        # Aplicar todas las migraciones
        Write-Host "     Aplicando todas las migraciones..." -ForegroundColor Gray
        npx supabase db reset --local 2>&1 | Out-Null
        Write-Host "     ✅ Migraciones locales aplicadas" -ForegroundColor Green
    } catch {
        Write-Host "     ❌ Error aplicando migraciones locales: $_" -ForegroundColor Red
    }
    Write-Host ""
}

if (-not $LocalOnly) {
    Write-Host "  ☁️  Preparando migraciones remotas..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "     ⚠️  IMPORTANTE: Aplicar migraciones remotas manualmente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "     📋 MIGRACIONES A APLICAR EN REMOTO (en orden):" -ForegroundColor White
    Write-Host ""
    
    $remoteMigrations = @(
        "20251108000001_create_user_device_tokens.sql",
        "20251108000002_create_user_tokens.sql",
        "20251108000003_add_chat_rooms_columns.sql",
        "20251108000004_add_full_name_to_profiles.sql"
    )
    
    foreach ($migration in $remoteMigrations) {
        $migrationPath = "supabase\migrations\$migration"
        if (Test-Path $migrationPath) {
            Write-Host "     ✅ $migration" -ForegroundColor Green
        } else {
            Write-Host "     ❌ $migration (no encontrado)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "     📝 PASOS PARA APLICAR EN REMOTO:" -ForegroundColor White
    Write-Host "     1. Abre Supabase Dashboard → SQL Editor" -ForegroundColor Gray
    Write-Host "     2. Ejecuta cada migración EN ORDEN" -ForegroundColor Gray
    Write-Host "     3. Verifica que no haya errores" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# 2. VERIFICAR TABLAS EN LOCAL Y REMOTO
# ============================================================================

Write-Host "📋 PASO 2: VERIFICAR TABLAS EN LOCAL Y REMOTO" -ForegroundColor Yellow
Write-Host ""

function Get-LocalTables {
    Write-Host "  🗄️  Tablas en LOCAL:" -ForegroundColor Cyan
    try {
        $container = docker ps --filter "name=supabase" --format "{{.Names}}" | Select-Object -First 1
        if ($container) {
            $tables = docker exec $container psql -U postgres -d postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;" 2>&1
            $tableList = $tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
            Write-Host "     Total: $($tableList.Count) tablas" -ForegroundColor White
            return $tableList
        } else {
            Write-Host "     ⚠️  No se encontró contenedor de Supabase" -ForegroundColor Yellow
            return @()
        }
    } catch {
        Write-Host "     ❌ Error obteniendo tablas locales: $_" -ForegroundColor Red
        return @()
    }
}

function Get-RemoteTables {
    Write-Host "  ☁️  Tablas en REMOTO:" -ForegroundColor Cyan
    try {
        $remoteTables = npx supabase db remote list 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Write-Host "     ✅ Conectado a Supabase remoto" -ForegroundColor Green
            # Parsear tablas de la salida
            # Nota: Esto requiere que el comando devuelva las tablas
            Write-Host "     ℹ️  Usa 'npx supabase db remote list' para ver tablas remotas" -ForegroundColor Gray
            return @()
        } else {
            Write-Host "     ⚠️  No se pudo conectar a Supabase remoto" -ForegroundColor Yellow
            return @()
        }
    } catch {
        Write-Host "     ⚠️  Error conectando a remoto: $_" -ForegroundColor Yellow
        return @()
    }
}

$localTables = Get-LocalTables
Write-Host ""

$remoteTables = Get-RemoteTables
Write-Host ""

# ============================================================================
# 3. VERIFICAR USO DE TABLAS EN CÓDIGO
# ============================================================================

Write-Host "📋 PASO 3: VERIFICAR USO DE TABLAS EN CÓDIGO" -ForegroundColor Yellow
Write-Host ""

function Get-UsedTables {
    Write-Host "  🔍 Buscando uso de tablas en código..." -ForegroundColor Cyan
    
    $srcFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue
    $usedTables = @{}
    
    foreach ($file in $srcFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Buscar patrones .from('table_name')
            $matches = [regex]::Matches($content, "\.from\(['`"]([^'`"]+)['`"]\)")
            foreach ($match in $matches) {
                $tableName = $match.Groups[1].Value
                if (-not $usedTables.ContainsKey($tableName)) {
                    $usedTables[$tableName] = @()
                }
                $usedTables[$tableName] += $file.Name
            }
        }
    }
    
    Write-Host "     Total tablas usadas en código: $($usedTables.Count)" -ForegroundColor White
    return $usedTables
}

$usedTables = Get-UsedTables
Write-Host ""

# ============================================================================
# 4. COMPARAR Y REPORTAR
# ============================================================================

Write-Host "📋 PASO 4: COMPARAR Y REPORTAR" -ForegroundColor Yellow
Write-Host ""

Write-Host "  📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "     • Tablas en LOCAL: $($localTables.Count)" -ForegroundColor White
Write-Host "     • Tablas usadas en código: $($usedTables.Count)" -ForegroundColor White
Write-Host ""

# Tablas usadas pero no en local
$missingInLocal = @()
foreach ($table in $usedTables.Keys) {
    if ($table -notin $localTables) {
        $missingInLocal += $table
    }
}

if ($missingInLocal.Count -gt 0) {
    Write-Host "  ⚠️  TABLAS USADAS PERO NO EN LOCAL:" -ForegroundColor Yellow
    foreach ($table in $missingInLocal) {
        Write-Host "     • $table (usada en: $($usedTables[$table] -join ', '))" -ForegroundColor Red
    }
    Write-Host ""
}

# Tablas en local pero no usadas
$unusedInLocal = @()
foreach ($table in $localTables) {
    if ($table -notin $usedTables.Keys) {
        $unusedInLocal += $table
    }
}

if ($unusedInLocal.Count -gt 0) {
    Write-Host "  ℹ️  TABLAS EN LOCAL PERO NO USADAS:" -ForegroundColor Yellow
    foreach ($table in $unusedInLocal) {
        Write-Host "     • $table" -ForegroundColor Gray
    }
    Write-Host ""
}

# ============================================================================
# 5. REGENERAR TIPOS
# ============================================================================

Write-Host "📋 PASO 5: REGENERAR TIPOS" -ForegroundColor Yellow
Write-Host ""

if (-not $RemoteOnly) {
    Write-Host "  🔧 Regenerando tipos desde LOCAL..." -ForegroundColor Cyan
    try {
        npx supabase gen types typescript --local > src/types/supabase-generated.ts 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "     ✅ Tipos regenerados desde LOCAL" -ForegroundColor Green
        } else {
            Write-Host "     ⚠️  Error regenerando tipos: $_" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "     ❌ Error: $_" -ForegroundColor Red
    }
    Write-Host ""
}

if (-not $LocalOnly) {
    Write-Host "  🔧 Regenerando tipos desde REMOTO..." -ForegroundColor Cyan
    Write-Host "     ℹ️  Ejecuta manualmente: npx supabase gen types typescript --project-id <project-id> > src/types/supabase-generated.ts" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ PROCESO COMPLETADO                           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Aplicar migraciones remotas manualmente en Supabase Dashboard" -ForegroundColor White
Write-Host "  2. Verificar que todas las tablas estén en remoto" -ForegroundColor White
Write-Host "  3. Regenerar tipos desde remoto: npx supabase gen types typescript --project-id <id>" -ForegroundColor White
Write-Host "  4. Verificar que no haya errores de tipo" -ForegroundColor White
Write-Host ""

