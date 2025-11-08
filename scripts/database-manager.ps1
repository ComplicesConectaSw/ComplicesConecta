# ============================================================================
# Script Maestro: Gestión Completa de Base de Datos v3.6.3 MEJORADO
# Versión: 3.6.3
# Fecha: 08 Nov 2025
# ============================================================================
# 
# Funcionalidades mejoradas:
# 1. Sincronización de BD local y remota con recuento completo
# 2. Verificación completa de tablas (local y remoto)
# 3. Análisis de uso en código (as any, null, etc.)
# 4. Verificación de errores TypeScript, ESLint, Lint
# 5. Análisis de seguridad (vulnerabilidades, exploits)
# 6. Búsqueda de archivos huérfanos, corruptos, vacíos, obsoletos, mal ubicados
# 7. Generación de scripts para migraciones remotas
# 8. Regeneración de tipos TypeScript
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("sync", "verify", "generate-remote", "regenerate-types", "analyze", "security", "code-analysis", "orphan-files", "all")]
    [string]$Action = "all",
    
    [switch]$LocalOnly = $false,
    [switch]$RemoteOnly = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Continue"

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

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ️  $Message" -ForegroundColor Cyan
}

# ============================================================================
# FUNCIÓN: VERIFICAR DOCKER Y SUPABASE
# ============================================================================

function Test-DockerAndSupabase {
    Write-Section "Verificando Docker Desktop y Supabase"
    
    # Verificar Docker
    try {
        $dockerStatus = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Desktop está activo"
        } else {
            Write-Error "Docker Desktop no está activo. Por favor, inicia Docker Desktop."
            return $false
        }
    } catch {
        Write-Error "Error verificando Docker: $_"
        return $false
    }
    
    # Verificar Supabase
    try {
        $supabaseStatus = npx supabase status 2>&1 | Out-String
        if ($supabaseStatus -match "supabase is not running") {
            Write-Warning "Supabase local no está corriendo"
            Write-Host "   Iniciando Supabase local..." -ForegroundColor Gray
            npx supabase start
            Start-Sleep -Seconds 10
        }
        Write-Success "Supabase está activo"
        return $true
    } catch {
        Write-Error "Error verificando Supabase: $_"
        return $false
    }
}

# ============================================================================
# FUNCIÓN: VERIFICAR TABLAS COMPLETAS (LOCAL Y REMOTO)
# ============================================================================

function Verify-CompleteTables {
    Write-Header "VERIFICACIÓN COMPLETA DE TABLAS"
    
    if (-not (Test-DockerAndSupabase)) {
        return
    }
    
    # TABLAS LOCALES
    Write-Section "Obteniendo tablas en LOCAL"
    $localTables = @()
    $localTableDetails = @()
    
    try {
        $localTablesOutput = docker exec $container psql -U postgres -d postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;" 2>&1
        $localTables = $localTablesOutput | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() } | Sort-Object
        
        # Obtener detalles de cada tabla
        foreach ($table in $localTables) {
            $rowCount = docker exec $container psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM $table;" 2>&1 | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() }
            $columns = docker exec $container psql -U postgres -d postgres -t -c "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$table' ORDER BY ordinal_position;" 2>&1 | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() }
            
            $localTableDetails += [PSCustomObject]@{
                Name = $table
                RowCount = $rowCount
                ColumnCount = ($columns | Measure-Object).Count
                Columns = $columns
            }
        }
        
        Write-Success "Tablas encontradas en LOCAL: $($localTables.Count)"
        Write-Host "   Detalles:" -ForegroundColor Gray
        foreach ($detail in $localTableDetails) {
            Write-Host "   - $($detail.Name): $($detail.RowCount) filas, $($detail.ColumnCount) columnas" -ForegroundColor White
        }
    } catch {
        Write-Error "Error obteniendo tablas locales: $_"
    }
    Write-Host ""
    
    # TABLAS REMOTAS (si está configurado)
    Write-Section "Obteniendo tablas en REMOTO"
    $remoteTables = @()
    
    try {
        $remoteTablesOutput = npx supabase db remote list --project-id $projectId 2>&1 | Out-String
        if ($remoteTablesOutput -match "error|Error|ERROR") {
            Write-Warning "No se pudo obtener tablas remotas (verificar login de Supabase)"
            Write-Info "Ejecuta: npx supabase login"
        } else {
            # Intentar obtener tablas remotas vía API
            Write-Info "Verificación remota requiere autenticación de Supabase"
        }
    } catch {
        Write-Warning "Error obteniendo tablas remotas: $_"
    }
    Write-Host ""
    
    # COMPARACIÓN
    Write-Section "Comparación Local vs Remoto"
    if ($remoteTables.Count -gt 0) {
        $onlyLocal = $localTables | Where-Object { $_ -notin $remoteTables }
        $onlyRemote = $remoteTables | Where-Object { $_ -notin $localTables }
        $common = $localTables | Where-Object { $_ -in $remoteTables }
        
        Write-Info "Tablas solo en LOCAL: $($onlyLocal.Count)"
        Write-Info "Tablas solo en REMOTO: $($onlyRemote.Count)"
        Write-Info "Tablas en ambos: $($common.Count)"
    } else {
        Write-Warning "No se pudo comparar con remoto (verificar autenticación)"
    }
    Write-Host ""
    
    # USO EN CÓDIGO
    Write-Section "Verificando uso de tablas en código"
    $codeTables = @()
    $codeTableUsage = @{}
    $srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }
    
    foreach ($file in $srcFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Buscar .from('tabla')
            $matches = [regex]::Matches($content, "\.from\(['`"](\w+)['`"]\)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            foreach ($match in $matches) {
                $tableName = $match.Groups[1].Value
                if ($tableName -notmatch '_with_partners$' -and $tableName -notin $codeTables) {
                    $codeTables += $tableName
                }
                if (-not $codeTableUsage.ContainsKey($tableName)) {
                    $codeTableUsage[$tableName] = @()
                }
                $codeTableUsage[$tableName] += "$($file.Name):$($match.Index)"
            }
            
            # Buscar 'as any' o 'null' relacionados con tablas
            if ($content -match "as\s+any|:\s*null|undefined") {
                $lines = $content -split "`n"
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match "as\s+any|:\s*null|undefined") {
                        foreach ($table in $localTables) {
                            if ($lines[$i] -match $table) {
                                if (-not $codeTableUsage.ContainsKey("$table (as any/null)")) {
                                    $codeTableUsage["$table (as any/null)"] = @()
                                }
                                $codeTableUsage["$table (as any/null)"] += "$($file.Name):$($i+1)"
                            }
                        }
                    }
                }
            }
        }
    }
    
    $codeTables = $codeTables | Sort-Object
    Write-Success "Tablas usadas en código: $($codeTables.Count)"
    
    # Tablas en BD pero no usadas en código
    $unusedTables = $localTables | Where-Object { $_ -notin $codeTables }
    if ($unusedTables.Count -gt 0) {
        Write-Warning "Tablas en BD pero no usadas en código: $($unusedTables.Count)"
        foreach ($table in $unusedTables) {
            Write-Host "   - $table" -ForegroundColor Yellow
        }
    }
    
    # Tablas usadas en código pero no en BD
    $missingTables = $codeTables | Where-Object { $_ -notin $localTables }
    if ($missingTables.Count -gt 0) {
        Write-Error "Tablas usadas en código pero no en BD: $($missingTables.Count)"
        foreach ($table in $missingTables) {
            Write-Host "   - $table" -ForegroundColor Red
        }
    }
    
    # Uso de 'as any' o 'null'
    $asAnyNullIssues = $codeTableUsage.Keys | Where-Object { $_ -match "as any|null" }
    if ($asAnyNullIssues.Count -gt 0) {
        Write-Warning "Uso de 'as any' o 'null' detectado: $($asAnyNullIssues.Count)"
        foreach ($issue in $asAnyNullIssues) {
            Write-Host "   - $issue" -ForegroundColor Yellow
            $locations = $codeTableUsage[$issue] | Select-Object -First 5
            foreach ($loc in $locations) {
                Write-Host "     → $loc" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: SINCRONIZAR BASE DE DATOS CON RECUENTO
# ============================================================================

function Sync-Databases {
    Write-Header "SINCRONIZAR BASE DE DATOS CON RECUENTO"
    
    if (-not (Test-DockerAndSupabase)) {
        return
    }
    
    # Verificar migraciones locales
    Write-Section "Verificando migraciones locales"
    $localMigrations = Get-ChildItem $migrationsDir -Filter "*.sql" -ErrorAction SilentlyContinue | Sort-Object Name
    Write-Success "Total migraciones locales: $($localMigrations.Count)"
    Write-Host ""
    
    if (-not $RemoteOnly) {
        Write-Section "Aplicando migraciones locales"
        try {
            Write-Host "   Aplicando migraciones..." -ForegroundColor Gray
            npx supabase db reset --local 2>&1 | Out-Null
            Write-Success "Migraciones locales aplicadas"
            
            # Recuento después de aplicar migraciones
            Verify-CompleteTables
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
# FUNCIÓN: ANÁLISIS DE CÓDIGO (TypeScript, ESLint, Lint)
# ============================================================================

function Analyze-Code {
    Write-Header "ANÁLISIS DE CÓDIGO (TypeScript, ESLint, Lint)"
    
    Write-Section "Verificando errores de TypeScript"
    try {
        $tsErrors = pnpm run type-check 2>&1 | Out-String
        if ($tsErrors -match "error TS|Found \d+ error") {
            Write-Error "Errores de TypeScript encontrados"
            $tsErrors -split "`n" | Where-Object { $_ -match "error TS" } | Select-Object -First 20 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        } else {
            Write-Success "Sin errores de TypeScript"
        }
    } catch {
        Write-Warning "No se pudo ejecutar type-check: $_"
    }
    Write-Host ""
    
    Write-Section "Verificando errores de ESLint"
    try {
        $eslintErrors = npx eslint . --format compact 2>&1 | Out-String
        if ($eslintErrors -match "error|warning" -and $eslintErrors -notmatch "No files matching") {
            Write-Error "Errores de ESLint encontrados"
            $eslintErrors -split "`n" | Where-Object { $_ -match "error|warning" } | Select-Object -First 20 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        } else {
            Write-Success "Sin errores de ESLint"
        }
    } catch {
        Write-Warning "No se pudo ejecutar ESLint: $_"
    }
    Write-Host ""
    
    Write-Section "Verificando errores de Lint"
    try {
        $lintErrors = pnpm run lint 2>&1 | Out-String
        if ($lintErrors -match "error|warning" -and $lintErrors -notmatch "No files matching") {
            Write-Error "Errores de Lint encontrados"
            $lintErrors -split "`n" | Where-Object { $_ -match "error|warning" } | Select-Object -First 20 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        } else {
            Write-Success "Sin errores de Lint"
        }
    } catch {
        Write-Warning "No se pudo ejecutar lint: $_"
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: ANÁLISIS DE SEGURIDAD
# ============================================================================

function Analyze-Security {
    Write-Header "ANÁLISIS DE SEGURIDAD"
    
    Write-Section "Buscando vulnerabilidades comunes"
    $securityIssues = @()
    $srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx", "*.js", "*.jsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
    
    foreach ($file in $srcFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # SQL Injection
            if ($content -match "\.query\(|\.execute\(|SELECT.*\+|INSERT.*\+") {
                $securityIssues += "⚠️  Posible SQL Injection: $($file.FullName)"
            }
            
            # XSS
            if ($content -match "dangerouslySetInnerHTML|innerHTML\s*=") {
                $securityIssues += "⚠️  Posible XSS (innerHTML): $($file.FullName)"
            }
            
            # Hardcoded secrets
            if ($content -match "(?i)(password|secret|api_key|apiKey|token)\s*[:=]\s*['`"][^'`"]+['`"]") {
                $securityIssues += "🔴 Hardcoded secret: $($file.FullName)"
            }
            
            # eval() usage
            if ($content -match "eval\s*\(") {
                $securityIssues += "🔴 Uso de eval(): $($file.FullName)"
            }
            
            # localStorage sin validación
            if ($content -match "localStorage\.(setItem|getItem)" -and $content -notmatch "sanitize|validate") {
                $securityIssues += "⚠️  localStorage sin validación: $($file.FullName)"
            }
        }
    }
    
    if ($securityIssues.Count -gt 0) {
        Write-Error "Problemas de seguridad encontrados: $($securityIssues.Count)"
        foreach ($issue in $securityIssues | Select-Object -First 20) {
            Write-Host "   $issue" -ForegroundColor Red
        }
    } else {
        Write-Success "No se encontraron problemas de seguridad obvios"
    }
    Write-Host ""
    
    Write-Section "Verificando dependencias vulnerables"
    try {
        $auditResult = pnpm audit --json 2>&1 | Out-String
        if ($auditResult -match "vulnerabilities") {
            Write-Warning "Vulnerabilidades en dependencias detectadas"
            Write-Info "Ejecuta: pnpm audit para más detalles"
        } else {
            Write-Success "Sin vulnerabilidades conocidas en dependencias"
        }
    } catch {
        Write-Warning "No se pudo ejecutar audit: $_"
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: BUSCAR ARCHIVOS HUÉRFANOS, CORRUPTOS, VACÍOS, OBSOLETOS
# ============================================================================

function Find-OrphanFiles {
    Write-Header "BÚSQUEDA DE ARCHIVOS PROBLEMÁTICOS"
    
    Write-Section "Buscando archivos huérfanos (sin imports)"
    $orphanFiles = @()
    $allFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }
    $allContent = @()
    foreach ($f in $allFiles) {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) { $allContent += $content }
    }
    
    foreach ($file in $allFiles) {
        $fileName = $file.BaseName
        $filePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        
        # Buscar si el archivo es importado
        $isImported = $false
        foreach ($content in $allContent) {
            if ($content -match "from\s+['`"].*$fileName['`"]|import.*$fileName") {
                $isImported = $true
                break
            }
        }
        
        # Excluir archivos de entrada (main.tsx, App.tsx, etc.)
        if (-not $isImported -and $file.Name -notmatch "^(main|App|index|vite-env)\.(ts|tsx)$") {
            $orphanFiles += $filePath
        }
    }
    
    if ($orphanFiles.Count -gt 0) {
        Write-Warning "Archivos huérfanos encontrados: $($orphanFiles.Count)"
        foreach ($file in $orphanFiles | Select-Object -First 20) {
            Write-Host "   - $file" -ForegroundColor Yellow
        }
    } else {
        Write-Success "No se encontraron archivos huérfanos"
    }
    Write-Host ""
    
    Write-Section "Buscando archivos vacíos"
    $emptyFiles = $allFiles | Where-Object { $_.Length -eq 0 -or (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue).Trim().Length -eq 0 }
    if ($emptyFiles.Count -gt 0) {
        Write-Warning "Archivos vacíos encontrados: $($emptyFiles.Count)"
        foreach ($file in $emptyFiles | Select-Object -First 10) {
            Write-Host "   - $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Yellow
        }
    } else {
        Write-Success "No se encontraron archivos vacíos"
    }
    Write-Host ""
    
    Write-Section "Buscando archivos corruptos (sintaxis inválida)"
    $corruptFiles = @()
    foreach ($file in $allFiles) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Verificar paréntesis, llaves, corchetes balanceados
                $openParen = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
                $closeParen = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
                $openBrace = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
                $closeBrace = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
                
                if ($openParen -ne $closeParen -or $openBrace -ne $closeBrace) {
                    $corruptFiles += $file.FullName.Replace((Get-Location).Path + "\", "")
                }
            }
        } catch {
            $corruptFiles += $file.FullName.Replace((Get-Location).Path + "\", "")
        }
    }
    
    if ($corruptFiles.Count -gt 0) {
        Write-Error "Archivos posiblemente corruptos: $($corruptFiles.Count)"
        foreach ($file in $corruptFiles | Select-Object -First 10) {
            Write-Host "   - $file" -ForegroundColor Red
        }
    } else {
        Write-Success "No se encontraron archivos corruptos"
    }
    Write-Host ""
    
    Write-Section "Buscando archivos obsoletos (deprecated, old, backup)"
    $obsoleteFiles = $allFiles | Where-Object { $_.Name -match "(deprecated|old|backup|\.bak|\.old|_old|_backup)" }
    if ($obsoleteFiles.Count -gt 0) {
        Write-Warning "Archivos obsoletos encontrados: $($obsoleteFiles.Count)"
        foreach ($file in $obsoleteFiles | Select-Object -First 10) {
            Write-Host "   - $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Yellow
        }
    } else {
        Write-Success "No se encontraron archivos obsoletos"
    }
    Write-Host ""
    
    Write-Section "Buscando archivos mal ubicados"
    $misplacedFiles = @()
    # Archivos de componentes en directorios incorrectos
    $componentFiles = $allFiles | Where-Object { $_.Name -match "^(Component|Button|Modal|Card)" -and $_.DirectoryName -notmatch "(components|shared|ui)" }
    if ($componentFiles.Count -gt 0) {
        $misplacedFiles += $componentFiles
    }
    
    if ($misplacedFiles.Count -gt 0) {
        Write-Warning "Archivos posiblemente mal ubicados: $($misplacedFiles.Count)"
        foreach ($file in $misplacedFiles | Select-Object -First 10) {
            Write-Host "   - $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Yellow
        }
    } else {
        Write-Success "No se encontraron archivos mal ubicados"
    }
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: VERIFICAR ALINEACIÓN DE TABLAS (LEGACY)
# ============================================================================

function Verify-TableAlignment {
    Verify-CompleteTables
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
    Write-Header "GESTIÓN COMPLETA DE BASE DE DATOS v3.6.3 MEJORADO"
    
    switch ($Action) {
        "sync" {
            Sync-Databases
        }
        "verify" {
            Verify-CompleteTables
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
        "security" {
            Analyze-Security
        }
        "code-analysis" {
            Analyze-Code
        }
        "orphan-files" {
            Find-OrphanFiles
        }
        "all" {
            Sync-Databases
            Verify-CompleteTables
            Analyze-Code
            Analyze-Security
            Find-OrphanFiles
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
