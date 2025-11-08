# ============================================================================
# Script Maestro: Gestión Completa de Base de Datos
# Versión: 3.6.3
# Fecha: 08 Nov 2025
# ============================================================================
# 
# Este script unifica las funcionalidades de:
# - alinear-supabase.ps1
# - analizar-y-alinear-bd.ps1
# - aplicar-migraciones-remoto.ps1
# - sync-databases.ps1
# - verificar-alineacion-tablas.ps1
#
# Funcionalidades:
# 1. Sincronización de BD local y remota
# 2. Verificación de alineación de tablas
# 3. Generación de scripts para migraciones remotas
# 4. Regeneración de tipos TypeScript
# 5. Análisis de migraciones y backups
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("sync", "verify", "generate-remote", "regenerate-types", "analyze", "all")]
    [string]$Action = "all",
    
    [switch]$LocalOnly = $false,
    [switch]$RemoteOnly = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

$container = "supabase_db_axtvqnozatbmllvwzuim"
$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$migrationsDir = "supabase\migrations"
$projectId = "axtvqnozatbmllvwzuim"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $($Title.PadRight(54))║" -ForegroundColor Cyan
    Write-Host "║  ComplicesConecta v3.6.3                              ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Title)
    Write-Host "📋 $Title" -ForegroundColor Yellow
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ❌ $Message" -ForegroundColor Red
}

# ============================================================================
# FUNCIÓN: SINCRONIZAR BASE DE DATOS
# ============================================================================

function Sync-Databases {
    Write-Header "SINCRONIZAR BASE DE DATOS"
    
    # Verificar migraciones locales
    Write-Section "Verificando migraciones locales"
    $localMigrations = Get-ChildItem $migrationsDir -Filter "*.sql" -ErrorAction SilentlyContinue | Sort-Object Name
    Write-Host "  Total migraciones locales: $($localMigrations.Count)" -ForegroundColor White
    Write-Host ""
    
    if (-not $RemoteOnly) {
        Write-Section "Aplicando migraciones locales"
        try {
            $status = npx supabase status 2>&1 | Out-String
            if ($status -match "supabase is not running") {
                Write-Warning "Supabase local no está corriendo"
                Write-Host "   Iniciando Supabase local..." -ForegroundColor Gray
                npx supabase start
                Start-Sleep -Seconds 10
            }
            
            Write-Success "Supabase local activo"
            Write-Host "   Aplicando migraciones..." -ForegroundColor Gray
            npx supabase db reset --local 2>&1 | Out-Null
            Write-Success "Migraciones locales aplicadas"
        } catch {
            Write-Error "Error aplicando migraciones locales: $_"
        }
        Write-Host ""
    }
    
    if (-not $LocalOnly) {
        Write-Section "Migraciones remotas"
        Write-Warning "Las migraciones remotas deben aplicarse manualmente"
        Write-Host "   1. Abre Supabase Dashboard → SQL Editor" -ForegroundColor White
        Write-Host "   2. Ejecuta las migraciones pendientes" -ForegroundColor White
        Write-Host ""
    }
}

# ============================================================================
# FUNCIÓN: VERIFICAR ALINEACIÓN DE TABLAS
# ============================================================================

function Verify-TableAlignment {
    Write-Header "VERIFICAR ALINEACIÓN DE TABLAS"
    
    Write-Section "Obteniendo tablas en local"
    try {
        $localTablesOutput = docker exec $container psql -U postgres -d postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;" 2>&1
        $localTables = $localTablesOutput | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() } | Sort-Object
        Write-Success "Tablas encontradas en local: $($localTables.Count)"
    } catch {
        Write-Error "Error obteniendo tablas: $_"
        return
    }
    Write-Host ""
    
    Write-Section "Extrayendo tablas usadas en código"
    $codeTables = @()
    $srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }
    
    foreach ($file in $srcFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $matches = [regex]::Matches($content, "\.from\(['`"](\w+)['`"]\)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            foreach ($match in $matches) {
                $tableName = $match.Groups[1].Value
                if ($tableName -notmatch '_with_partners$' -and $tableName -notin $codeTables) {
                    $codeTables += $tableName
                }
            }
        }
    }
    $codeTables = $codeTables | Sort-Object
    Write-Success "Tablas usadas en código: $($codeTables.Count)"
    Write-Host ""
    
    # Comparar
    $knownViews = @('couple_profiles_with_partners')
    $missingInLocal = $codeTables | Where-Object { $_ -notin $localTables -and $_ -notin $knownViews }
    
    Write-Section "Análisis de alineación"
    if ($missingInLocal.Count -eq 0) {
        Write-Success "Todas las tablas usadas en código existen en local"
    } else {
        Write-Warning "Tablas usadas en código pero no en local: $($missingInLocal.Count)"
        foreach ($table in $missingInLocal) {
            Write-Host "   - $table" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: GENERAR SCRIPT PARA MIGRACIONES REMOTAS
# ============================================================================

function Generate-RemoteMigrationsScript {
    Write-Header "GENERAR SCRIPT PARA MIGRACIONES REMOTAS"
    
    $outputFile = "supabase\migraciones-para-remoto.sql"
    $migrationsToApply = Get-ChildItem $migrationsDir -Filter "*.sql" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 5
    
    $scriptContent = @"
-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Version: 3.6.3
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que las tablas se crearon correctamente
-- 
-- =====================================================

"@
    
    foreach ($migration in $migrationsToApply) {
        Write-Host "  Agregando: $($migration.Name)" -ForegroundColor Yellow
        $migrationContent = Get-Content $migration.FullName -Raw
        $scriptContent += @"

-- =====================================================
-- MIGRACION: $($migration.Name)
-- =====================================================

$migrationContent

-- =====================================================
-- FIN MIGRACION: $($migration.Name)
-- =====================================================

"@
    }
    
    $scriptContent | Out-File -FilePath $outputFile -Encoding utf8
    Write-Success "Script generado: $outputFile"
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: REGENERAR TIPOS TYPESCRIPT
# ============================================================================

function Regenerate-Types {
    Write-Header "REGENERAR TIPOS TYPESCRIPT"
    
    try {
        if (-not $RemoteOnly) {
            Write-Host "  Generando tipos desde local..." -ForegroundColor Cyan
            npx supabase gen types typescript --local > "src/types/supabase-generated.ts" 2>&1
            Write-Success "Tipos locales generados"
        } else {
            Write-Host "  Generando tipos desde remoto..." -ForegroundColor Cyan
            npx supabase gen types typescript --project-id $projectId --schema public > "src/types/supabase.ts" 2>&1
            Write-Success "Tipos remotos generados"
        }
    } catch {
        Write-Error "Error regenerando tipos: $_"
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: ANALIZAR MIGRACIONES Y BACKUPS
# ============================================================================

function Analyze-Migrations {
    Write-Header "ANALIZAR MIGRACIONES Y BACKUPS"
    
    Write-Section "Analizando migraciones locales"
    $localMigrations = Get-ChildItem $migrationsDir -Filter "*.sql" -ErrorAction SilentlyContinue | Sort-Object Name
    Write-Success "Migraciones locales: $($localMigrations.Count)"
    Write-Host ""
    
    if (Test-Path $backupDir) {
        Write-Section "Analizando backups"
        $backupFiles = Get-ChildItem $backupDir -File -ErrorAction SilentlyContinue
        Write-Success "Archivos de backup: $($backupFiles.Count)"
    } else {
        Write-Warning "Directorio de backup no existe: $backupDir"
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

function Main {
    Write-Header "GESTIÓN COMPLETA DE BASE DE DATOS"
    
    switch ($Action) {
        "sync" {
            Sync-Databases
        }
        "verify" {
            Verify-TableAlignment
        }
        "generate-remote" {
            Generate-RemoteMigrationsScript
        }
        "regenerate-types" {
            Regenerate-Types
        }
        "analyze" {
            Analyze-Migrations
        }
        "all" {
            Sync-Databases
            Verify-TableAlignment
            Generate-RemoteMigrationsScript
            Regenerate-Types
            Analyze-Migrations
        }
    }
    
    Write-Header "PROCESO COMPLETADO"
    Write-Success "Todas las operaciones finalizadas"
    Write-Host ""
}

# Ejecutar
Main

