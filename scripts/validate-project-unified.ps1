#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script unificado de validación completa del proyecto ComplicesConecta
.DESCRIPTION
    Consolida todas las validaciones: linting, type-check, seguridad, tipos Supabase, null checks y validación de tablas
    Analiza desde la raíz del proyecto o desde src/, omitiendo dependencias y android
.PARAMETER SourcePath
    Ruta base para análisis (default: "src")
.PARAMETER SkipLint
    Omitir validación de linting
.PARAMETER SkipTypeCheck
    Omitir validación de tipos TypeScript
.PARAMETER SkipSecurity
    Omitir validación de seguridad
.PARAMETER SkipSupabase
    Omitir validación de tipos Supabase
.PARAMETER SkipNullChecks
    Omitir verificación de null checks
.PARAMETER SkipTableValidation
    Omitir validación de tablas
.EXAMPLE
    .\scripts\validate-project-unified.ps1
.EXAMPLE
    .\scripts\validate-project-unified.ps1 -SourcePath "src" -SkipLint
#>

param(
    [string]$SourcePath = "src",
    [switch]$SkipLint,
    [switch]$SkipTypeCheck,
    [switch]$SkipSecurity,
    [switch]$SkipSupabase,
    [switch]$SkipNullChecks,
    [switch]$SkipTableValidation
)

$ErrorActionPreference = "Stop"
$script:ReportDir = "reports"
$script:Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$script:ReportFile = Join-Path $script:ReportDir "validation-report-$script:Timestamp.json"
$script:Results = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    lint = @{}
    typeCheck = @{}
    security = @{}
    supabase = @{}
    nullChecks = @{}
    tableValidation = @{}
    summary = @{
        totalChecks = 0
        passedChecks = 0
        failedChecks = 0
        warnings = 0
    }
}

# Colores para output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $colorMap = @{
        "Green" = "Green"
        "Red" = "Red"
        "Yellow" = "Yellow"
        "Blue" = "Cyan"
        "Bold" = "White"
    }
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

# Crear directorio de reportes
if (-not (Test-Path $script:ReportDir)) {
    New-Item -ItemType Directory -Path $script:ReportDir -Force | Out-Null
}

Write-ColorOutput "🔍 VALIDACIÓN UNIFICADA DEL PROYECTO - ComplicesConecta v3.5.0" "Bold"
Write-ColorOutput "=" * 70 "Blue"
Write-ColorOutput "📅 Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Blue"
Write-ColorOutput "📁 Ruta de análisis: $SourcePath" "Blue"
Write-ColorOutput ""

# 1. VALIDACIÓN DE LINTING
if (-not $SkipLint) {
    Write-ColorOutput "1️⃣ VALIDANDO LINTING..." "Blue"
    try {
        $lintOutput = npm run lint 2>&1 | Out-String
        $lintLines = $lintOutput -split "`n"
        $warnings = ($lintLines | Where-Object { $_ -match "warning" }).Count
        $errors = ($lintLines | Where-Object { $_ -match "error" -and $_ -notmatch "warning" }).Count
        
        $script:Results.lint = @{
            status = if ($errors -gt 0) { "failed" } elseif ($warnings -gt 0) { "warning" } else { "success" }
            warnings = $warnings
            errors = $errors
            total = $warnings + $errors
            output = $lintOutput
        }
        
        if ($errors -gt 0) {
            Write-ColorOutput "   ❌ Errores de linting: $errors" "Red"
            $script:Results.summary.failedChecks++
        } elseif ($warnings -gt 0) {
            Write-ColorOutput "   ⚠️  Warnings de linting: $warnings" "Yellow"
            $script:Results.summary.warnings++
        } else {
            Write-ColorOutput "   ✅ Sin errores ni warnings de linting" "Green"
            $script:Results.summary.passedChecks++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando linting: $($_.Exception.Message)" "Red"
        $script:Results.lint = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# 2. VALIDACIÓN DE TYPE-CHECK
if (-not $SkipTypeCheck) {
    Write-ColorOutput "2️⃣ VALIDANDO TYPE-CHECK..." "Blue"
    try {
        $typeCheckOutput = npm run type-check 2>&1 | Out-String
        $typeCheckLines = $typeCheckOutput -split "`n"
        $errors = ($typeCheckLines | Where-Object { 
            $_ -match "error TS" -or 
            $_ -match "Type error" -or 
            $_ -match "Cannot find" -or 
            ($_ -match "Property" -and $_ -match "does not exist")
        }).Count
        
        $script:Results.typeCheck = @{
            status = if ($errors -gt 0) { "failed" } else { "success" }
            errors = $errors
            output = $typeCheckOutput
        }
        
        if ($errors -gt 0) {
            Write-ColorOutput "   ❌ Errores de TypeScript: $errors" "Red"
            $script:Results.summary.failedChecks++
        } else {
            Write-ColorOutput "   ✅ Sin errores de TypeScript" "Green"
            $script:Results.summary.passedChecks++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando type-check: $($_.Exception.Message)" "Red"
        $script:Results.typeCheck = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# 3. VALIDACIÓN DE SEGURIDAD
if (-not $SkipSecurity) {
    Write-ColorOutput "3️⃣ VALIDANDO SEGURIDAD..." "Blue"
    try {
        # Verificar .gitignore
        $gitignorePath = ".gitignore"
        $gitignoreOk = $false
        if (Test-Path $gitignorePath) {
            $gitignoreContent = Get-Content $gitignorePath -Raw
            $requiredPatterns = @(".env", ".env.*", ".env.production", ".env.circleci")
            $allPatternsFound = $true
            foreach ($pattern in $requiredPatterns) {
                if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
                    $allPatternsFound = $false
                    break
                }
            }
            $gitignoreOk = $allPatternsFound
        }
        
        # Buscar tokens expuestos
        $tokenPatterns = @("github_pat_", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "sk-", "AKIA", "AIza")
        $exposedTokens = @()
        
        $filesToScan = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Exclude "node_modules", "android" -ErrorAction SilentlyContinue
        foreach ($file in $filesToScan) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                foreach ($pattern in $tokenPatterns) {
                    if ($content -match [regex]::Escape($pattern)) {
                        $exposedTokens += @{
                            file = $file.FullName
                            pattern = $pattern
                        }
                    }
                }
            }
        }
        
        $script:Results.security = @{
            gitignoreOk = $gitignoreOk
            exposedTokens = $exposedTokens
            status = if ($exposedTokens.Count -gt 0 -or -not $gitignoreOk) { "failed" } else { "success" }
        }
        
        if ($exposedTokens.Count -gt 0) {
            Write-ColorOutput "   ❌ Tokens expuestos encontrados: $($exposedTokens.Count)" "Red"
            foreach ($token in $exposedTokens) {
                Write-ColorOutput "      - $($token.file): $($token.pattern)" "Yellow"
            }
            $script:Results.summary.failedChecks++
        } elseif (-not $gitignoreOk) {
            Write-ColorOutput "   ⚠️  .gitignore no está completamente configurado" "Yellow"
            $script:Results.summary.warnings++
        } else {
            Write-ColorOutput "   ✅ Sin problemas de seguridad detectados" "Green"
            $script:Results.summary.passedChecks++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando validación de seguridad: $($_.Exception.Message)" "Red"
        $script:Results.security = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# 4. VALIDACIÓN DE TIPOS SUPABASE
if (-not $SkipSupabase) {
    Write-ColorOutput "4️⃣ VALIDANDO TIPOS SUPABASE..." "Blue"
    try {
        $supabaseTypesPath = "src/types/supabase.ts"
        $supabaseGeneratedPath = "src/types/supabase-generated.ts"
        
        $supabaseExists = Test-Path $supabaseTypesPath
        $generatedExists = Test-Path $supabaseGeneratedPath
        
        $supabaseInfo = $null
        $generatedInfo = $null
        
        if ($supabaseExists) {
            $supabaseFile = Get-Item $supabaseTypesPath
            $supabaseContent = Get-Content $supabaseTypesPath -Raw
            $tableMatches = [regex]::Matches($supabaseContent, "Tables:\s*\{([^}]+)\}")
            $tables = @()
            if ($tableMatches.Count -gt 0) {
                $tableRegex = [regex]::new("(\w+):\s*\{")
                $tableMatches = $tableRegex.Matches($tableMatches[0].Value)
                foreach ($match in $tableMatches) {
                    $tables += $match.Groups[1].Value
                }
            }
            $supabaseInfo = @{
                exists = $true
                size = $supabaseFile.Length
                modified = $supabaseFile.LastWriteTime
                tableCount = $tables.Count
                tables = $tables[0..([Math]::Min(10, $tables.Count - 1))]
            }
        }
        
        if ($generatedExists) {
            $generatedFile = Get-Item $supabaseGeneratedPath
            $generatedContent = Get-Content $supabaseGeneratedPath -Raw
            $tableMatches = [regex]::Matches($generatedContent, "Tables:\s*\{([^}]+)\}")
            $tables = @()
            if ($tableMatches.Count -gt 0) {
                $tableRegex = [regex]::new("(\w+):\s*\{")
                $tableMatches = $tableRegex.Matches($tableMatches[0].Value)
                foreach ($match in $tableMatches) {
                    $tables += $match.Groups[1].Value
                }
            }
            $generatedInfo = @{
                exists = $true
                size = $generatedFile.Length
                modified = $generatedFile.LastWriteTime
                tableCount = $tables.Count
                tables = $tables[0..([Math]::Min(10, $tables.Count - 1))]
            }
        }
        
        $script:Results.supabase = @{
            supabase = $supabaseInfo
            generated = $generatedInfo
            status = if ($supabaseExists) { "success" } else { "failed" }
        }
        
        if ($supabaseExists) {
            Write-ColorOutput "   ✅ supabase.ts encontrado ($($supabaseInfo.tableCount) tablas)" "Green"
            if ($generatedExists) {
                if ($generatedInfo.modified -gt $supabaseInfo.modified) {
                    Write-ColorOutput "   ⚠️  supabase-generated.ts es más reciente" "Yellow"
                }
            }
            $script:Results.summary.passedChecks++
        } else {
            Write-ColorOutput "   ❌ supabase.ts no encontrado" "Red"
            $script:Results.summary.failedChecks++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando validación de Supabase: $($_.Exception.Message)" "Red"
        $script:Results.supabase = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# 5. VERIFICACIÓN DE NULL CHECKS
if (-not $SkipNullChecks) {
    Write-ColorOutput "5️⃣ VERIFICANDO NULL CHECKS..." "Blue"
    try {
        $filesWithSupabase = @()
        $filesWithoutNullChecks = @()
        
        $sourceFiles = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx" -Exclude "*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx", "node_modules", "android" -ErrorAction SilentlyContinue
        
        foreach ($file in $sourceFiles) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match "supabase\.") {
                $filesWithSupabase += $file.FullName
                
                # Verificar si tiene null checks
                $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
                $hasNullCheck = $false
                
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match "supabase\.") {
                        # Buscar null check en las 30 líneas anteriores
                        $hasNullCheck = $false
                        $startIndex = [Math]::Max(0, $i - 30)
                        for ($j = $startIndex; $j -lt $i; $j++) {
                            if ($lines[$j] -match "if\s*\(!\s*supabase\)") {
                                $hasNullCheck = $true
                                break
                            }
                        }
                        
                        if (-not $hasNullCheck -and 
                            $lines[$i] -notmatch "^\s*//" -and 
                            $lines[$i] -notmatch "import.*supabase" -and 
                            $lines[$i] -notmatch "from.*supabase") {
                            $filesWithoutNullChecks += @{
                                file = $file.FullName
                                line = $i + 1
                                content = $lines[$i].Trim()
                            }
                        }
                    }
                }
            }
        }
        
        $script:Results.nullChecks = @{
            filesWithSupabase = $filesWithSupabase.Count
            filesWithoutNullChecks = $filesWithoutNullChecks.Count
            issues = $filesWithoutNullChecks
            status = if ($filesWithoutNullChecks.Count -eq 0) { "success" } else { "warning" }
        }
        
        if ($filesWithoutNullChecks.Count -eq 0) {
            Write-ColorOutput "   ✅ Todos los archivos con supabase tienen null checks" "Green"
            $script:Results.summary.passedChecks++
        } else {
            Write-ColorOutput "   ⚠️  Archivos sin null checks: $($filesWithoutNullChecks.Count)" "Yellow"
            foreach ($issue in $filesWithoutNullChecks[0..([Math]::Min(10, $filesWithoutNullChecks.Count - 1))]) {
                Write-ColorOutput "      - $($issue.file):$($issue.line)" "Yellow"
            }
            $script:Results.summary.warnings++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando verificación de null checks: $($_.Exception.Message)" "Red"
        $script:Results.nullChecks = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# 6. VALIDACIÓN DE TABLAS
if (-not $SkipTableValidation) {
    Write-ColorOutput "6️⃣ VALIDANDO TABLAS DE BASE DE DATOS..." "Blue"
    try {
        # Leer tipos de Supabase para obtener lista de tablas
        $supabaseTypesPath = "src/types/supabase.ts"
        $tablesInTypes = @()
        
        if (Test-Path $supabaseTypesPath) {
            $supabaseContent = Get-Content $supabaseTypesPath -Raw
            $tableMatches = [regex]::Matches($supabaseContent, "Tables:\s*\{([^}]+)\}")
            if ($tableMatches.Count -gt 0) {
                $tableRegex = [regex]::new("(\w+):\s*\{")
                $tableMatches = $tableRegex.Matches($tableMatches[0].Value)
                foreach ($match in $tableMatches) {
                    $tablesInTypes += $match.Groups[1].Value
                }
            }
        }
        
        # Buscar referencias a tablas en el código
        $tableReferences = @{}
        $sourceFiles = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx" -Exclude "*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx", "node_modules", "android" -ErrorAction SilentlyContinue
        
        foreach ($file in $sourceFiles) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Buscar patrones como supabase.from('table_name')
                $fromMatches = [regex]::Matches($content, "\.from\(['""]([^'""]+)['""]\)")
                foreach ($match in $fromMatches) {
                    $tableName = $match.Groups[1].Value
                    if (-not $tableReferences.ContainsKey($tableName)) {
                        $tableReferences[$tableName] = @()
                    }
                    $tableReferences[$tableName] += $file.FullName
                }
            }
        }
        
        # Comparar tablas referenciadas vs tablas en tipos
        $missingTables = @()
        $unusedTables = @()
        
        foreach ($table in $tableReferences.Keys) {
            if ($table -notin $tablesInTypes) {
                $missingTables += $table
            }
        }
        
        foreach ($table in $tablesInTypes) {
            if ($table -notin $tableReferences.Keys) {
                $unusedTables += $table
            }
        }
        
        $script:Results.tableValidation = @{
            tablesInTypes = $tablesInTypes.Count
            tablesReferenced = $tableReferences.Keys.Count
            missingTables = $missingTables
            unusedTables = $unusedTables
            status = if ($missingTables.Count -eq 0) { "success" } else { "warning" }
        }
        
        if ($missingTables.Count -eq 0) {
            Write-ColorOutput "   ✅ Todas las tablas referenciadas existen en tipos" "Green"
            $script:Results.summary.passedChecks++
        } else {
            Write-ColorOutput "   ⚠️  Tablas referenciadas pero no en tipos: $($missingTables.Count)" "Yellow"
            foreach ($table in $missingTables) {
                Write-ColorOutput "      - $table" "Yellow"
            }
            $script:Results.summary.warnings++
        }
        $script:Results.summary.totalChecks++
    } catch {
        Write-ColorOutput "   ❌ Error ejecutando validación de tablas: $($_.Exception.Message)" "Red"
        $script:Results.tableValidation = @{
            status = "failed"
            error = $_.Exception.Message
        }
        $script:Results.summary.failedChecks++
        $script:Results.summary.totalChecks++
    }
    Write-ColorOutput ""
}

# Guardar reporte
$script:Results | ConvertTo-Json -Depth 10 | Set-Content $script:ReportFile -Encoding UTF8

# Resumen final
Write-ColorOutput "📊 RESUMEN FINAL" "Bold"
Write-ColorOutput "=" * 70 "Blue"
Write-ColorOutput "Total de checks: $($script:Results.summary.totalChecks)" "Blue"
Write-ColorOutput "✅ Pasados: $($script:Results.summary.passedChecks)" "Green"
Write-ColorOutput "❌ Fallidos: $($script:Results.summary.failedChecks)" "Red"
Write-ColorOutput "⚠️  Warnings: $($script:Results.summary.warnings)" "Yellow"
Write-ColorOutput ""
Write-ColorOutput "📄 Reporte guardado en: $script:ReportFile" "Blue"
Write-ColorOutput ""

# Exit code
if ($script:Results.summary.failedChecks -gt 0) {
    Write-ColorOutput "❌ VALIDACIÓN FALLIDA - REQUIERE ATENCIÓN" "Red"
    exit 1
} elseif ($script:Results.summary.warnings -gt 0) {
    Write-ColorOutput "⚠️  VALIDACIÓN COMPLETADA CON WARNINGS" "Yellow"
    exit 0
} else {
    Write-ColorOutput "✅ VALIDACIÓN EXITOSA - PROYECTO LISTO" "Green"
    exit 0
}

