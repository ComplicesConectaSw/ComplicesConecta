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
        "White" = "White"
    }
    
    # Obtener color del mapa o usar White por defecto
    $selectedColor = if ($colorMap.ContainsKey($Color)) {
        $colorMap[$Color]
    } else {
        "White"
    }
    
    Write-Host $Message -ForegroundColor $selectedColor
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
            
            # Extraer y mostrar detalles de errores
            $errorLines = $lintLines | Where-Object { 
                $_ -match "error" -and $_ -notmatch "warning" -and $_ -match "\.(ts|tsx|js|jsx):"
            }
            
            if ($errorLines.Count -gt 0) {
                Write-ColorOutput "   📋 Detalles de errores:" "Yellow"
                $errorFiles = @{}
                foreach ($line in $errorLines) {
                    # Extraer archivo y línea del error
                    if ($line -match "([^\\\/]+\.(ts|tsx|js|jsx)):(\d+):(\d+)") {
                        $fileName = $matches[1]
                        $lineNum = $matches[3]
                        $colNum = $matches[4]
                        
                        if (-not $errorFiles.ContainsKey($fileName)) {
                            $errorFiles[$fileName] = @()
                        }
                        $errorFiles[$fileName] += "${lineNum}:${colNum}"
                    } elseif ($line -match "([^\\\/]+\.(ts|tsx|js|jsx))") {
                        $fileName = $matches[1]
                        if (-not $errorFiles.ContainsKey($fileName)) {
                            $errorFiles[$fileName] = @()
                        }
                    }
                }
                
                foreach ($file in $errorFiles.Keys) {
                    $filePath = Get-ChildItem -Path $SourcePath -Recurse -Filter $file -ErrorAction SilentlyContinue | Select-Object -First 1
                    if ($filePath) {
                        Write-ColorOutput "      - $($filePath.FullName)" "Red"
                        if ($errorFiles[$file].Count -gt 0) {
                            Write-ColorOutput "        Líneas: $($errorFiles[$file] -join ', ')" "Gray"
                        }
                    } else {
                        Write-ColorOutput "      - $file" "Red"
                    }
                }
            }
            
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
        
        # Buscar tokens expuestos (con validación para evitar falsos positivos)
        $exposedTokens = @()
        
        $filesToScan = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Exclude "node_modules", "android" -ErrorAction SilentlyContinue
        foreach ($file in $filesToScan) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Buscar github_pat_ seguido de caracteres alfanuméricos (token real)
                if ($content -match "github_pat_[A-Za-z0-9_]{20,}") {
                    # Verificar que no sea solo una referencia de formato (como en verify-token.js)
                    if ($file.Name -notmatch "verify-token" -and $content -notmatch "PLACEHOLDER|YOUR_|example|test") {
                        $exposedTokens += @{
                            file = $file.FullName
                            pattern = "github_pat_"
                            reason = "Token GitHub encontrado"
                        }
                    }
                }
                
                # Buscar sk- seguido de caracteres (API key real)
                if ($content -match "sk-[A-Za-z0-9]{20,}") {
                    # Verificar que no sea parte de otra palabra (como "mask-user-input")
                    if ($content -notmatch "mask-user-input|mask|task|risk|disk|desk") {
                        $exposedTokens += @{
                            file = $file.FullName
                            pattern = "sk-"
                            reason = "API key encontrada"
                        }
                    }
                }
                
                # Buscar JWT tokens completos
                if ($content -match "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+") {
                    $exposedTokens += @{
                        file = $file.FullName
                        pattern = "JWT"
                        reason = "JWT token completo encontrado"
                    }
                }
                
                # Buscar AWS keys (AKIA seguido de 16 caracteres)
                if ($content -match "AKIA[0-9A-Z]{16}") {
                    $exposedTokens += @{
                        file = $file.FullName
                        pattern = "AKIA"
                        reason = "AWS access key encontrada"
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
            
            # Buscar todas las definiciones de tablas dentro del bloque Tables de public
            # Patrón: public: { Tables: { nombre_tabla: { Row:
            $tableRegex = [regex]::new("public:\s*\{[\s\S]*?Tables:\s*\{([\s\S]*?)\}\s*(Views|Functions):", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $tablesMatch = $tableRegex.Match($supabaseContent)
            $tables = @()
            
            if ($tablesMatch.Success) {
                $tablesBlock = $tablesMatch.Groups[1].Value
                # Buscar todas las definiciones de tabla: nombre: { seguido de Row:
                $tableNameRegex = [regex]::new("^\s+(\w+):\s*\{[\s\S]*?Row:", [System.Text.RegularExpressions.RegexOptions]::Multiline)
                $tableNameMatches = $tableNameRegex.Matches($tablesBlock)
                foreach ($match in $tableNameMatches) {
                    $tableName = $match.Groups[1].Value
                    # Excluir palabras clave como "Tables", "Views", "Functions", etc.
                    if ($tableName -notmatch "^(Tables|Views|Functions|Enums|CompositeTypes|Row|Insert|Update|Relationships)$" -and $tableName -notmatch "^_") {
                        $tables += $tableName
                    }
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
            
            # Buscar todas las definiciones de tablas dentro del bloque Tables de public
            $tableRegex = [regex]::new("public:\s*\{[\s\S]*?Tables:\s*\{([\s\S]*?)\}\s*(Views|Functions):", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $tablesMatch = $tableRegex.Match($generatedContent)
            $tables = @()
            
            if ($tablesMatch.Success) {
                $tablesBlock = $tablesMatch.Groups[1].Value
                # Buscar todas las definiciones de tabla: nombre: { seguido de Row:
                $tableNameRegex = [regex]::new("^\s+(\w+):\s*\{[\s\S]*?Row:", [System.Text.RegularExpressions.RegexOptions]::Multiline)
                $tableNameMatches = $tableNameRegex.Matches($tablesBlock)
                foreach ($match in $tableNameMatches) {
                    $tableName = $match.Groups[1].Value
                    # Excluir palabras clave como "Tables", "Views", "Functions", etc.
                    if ($tableName -notmatch "^(Tables|Views|Functions|Enums|CompositeTypes|Row|Insert|Update|Relationships)$" -and $tableName -notmatch "^_") {
                        $tables += $tableName
                    }
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
            
            $needsRegeneration = $false
            $regenerationReason = ""
            
            if ($generatedExists) {
                if ($generatedInfo.modified -gt $supabaseInfo.modified) {
                    $needsRegeneration = $true
                    $regenerationReason = "supabase-generated.ts es más reciente"
                }
            }
            
            # Verificar si hay menos de 100 tablas (probablemente desactualizado)
            if ($supabaseInfo.tableCount -lt 100) {
                $needsRegeneration = $true
                $regenerationReason = "Pocas tablas detectadas ($($supabaseInfo.tableCount))"
            }
            
            # Ejecutar regeneración automática si es necesario
            if ($needsRegeneration) {
                Write-ColorOutput "   ⚠️  $regenerationReason" "Yellow"
                Write-ColorOutput "   🔄 Ejecutando regeneración automática de tipos..." "Cyan"
                
                try {
                    $regenerateScript = "scripts\regenerate-supabase-types.ps1"
                    if (Test-Path $regenerateScript) {
                        $regenerateOutput = & pwsh -ExecutionPolicy Bypass -File $regenerateScript -UpdateMain 2>&1 | Out-String
                        
                        if ($LASTEXITCODE -eq 0) {
                            Write-ColorOutput "   ✅ Tipos regenerados exitosamente" "Green"
                            
                            # Recargar información después de regenerar
                            if (Test-Path $supabaseTypesPath) {
                                $supabaseFile = Get-Item $supabaseTypesPath
                                $supabaseContent = Get-Content $supabaseTypesPath -Raw
                                
                                $tableRegex = [regex]::new("public:\s*\{[\s\S]*?Tables:\s*\{([\s\S]*?)\}\s*(Views|Functions):", [System.Text.RegularExpressions.RegexOptions]::Singleline)
                                $tablesMatch = $tableRegex.Match($supabaseContent)
                                $tables = @()
                                
                                if ($tablesMatch.Success) {
                                    $tablesBlock = $tablesMatch.Groups[1].Value
                                    $tableNameRegex = [regex]::new("^\s+(\w+):\s*\{", [System.Text.RegularExpressions.RegexOptions]::Multiline)
                                    $tableNameMatches = $tableNameRegex.Matches($tablesBlock)
                                    foreach ($match in $tableNameMatches) {
                                        $tableName = $match.Groups[1].Value
                                        # Verificar que después del nombre hay un bloque con Row: (es una tabla real)
                                        $matchEnd = $match.Index + $match.Length
                                        $nextPart = $tablesBlock.Substring($matchEnd, [Math]::Min(200, $tablesBlock.Length - $matchEnd))
                                        if ($nextPart -match "Row:" -and 
                                            $tableName -notmatch "^(Tables|Views|Functions|Enums|CompositeTypes|Row|Insert|Update|Relationships)$" -and 
                                            $tableName -notmatch "^_") {
                                            $tables += $tableName
                                        }
                                    }
                                }
                                
                                $supabaseInfo.tableCount = $tables.Count
                                Write-ColorOutput "   📊 Tablas detectadas después de regeneración: $($supabaseInfo.tableCount)" "Cyan"
                            }
                        } else {
                            Write-ColorOutput "   ❌ Error regenerando tipos:" "Red"
                            Write-ColorOutput "      $regenerateOutput" "Yellow"
                            Write-ColorOutput "      Continuando con validación..." "Yellow"
                        }
                    } else {
                        Write-ColorOutput "   ⚠️  Script de regeneración no encontrado: $regenerateScript" "Yellow"
                        Write-ColorOutput "      💡 Ejecutar manualmente: .\scripts\regenerate-supabase-types.ps1 -UpdateMain" "Yellow"
                    }
                } catch {
                    Write-ColorOutput "   ❌ Error ejecutando regeneración: $($_.Exception.Message)" "Red"
                    Write-ColorOutput "      Continuando con validación..." "Yellow"
                }
            }
            
            $script:Results.summary.passedChecks++
        } else {
            Write-ColorOutput "   ❌ supabase.ts no encontrado" "Red"
            Write-ColorOutput "      💡 Ejecutar: .\scripts\regenerate-supabase-types.ps1 -UpdateMain" "Yellow"
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
                    $line = $lines[$i]
                    # Buscar uso de supabase (excluyendo comentarios, imports, definiciones, localStorage y logs)
                    if ($line -match "supabase\." -and 
                        $line -notmatch "^\s*//" -and 
                        $line -notmatch "import.*supabase" -and 
                        $line -notmatch "from.*supabase" -and
                        $line -notmatch "const.*supabase\s*=" -and
                        $line -notmatch "let.*supabase\s*=" -and
                        $line -notmatch "var.*supabase\s*=" -and
                        $line -notmatch "localStorage.*supabase" -and
                        $line -notmatch "sessionStorage.*supabase" -and
                        $line -notmatch "createClient.*supabase" -and
                        $line -notmatch "placeholder\.supabase" -and
                        $line -notmatch "PLACEHOLDER" -and
                        $line -notmatch "logger\.(info|warn|error|debug).*supabase" -and
                        $line -notmatch "console\.(log|info|warn|error).*supabase" -and
                        $line -notmatch "Cargando.*desde Supabase" -and
                        $line -notmatch "Iniciando.*con Supabase") {
                        
                        # Verificar null check en las 10 líneas anteriores, en la misma línea, o al inicio de la función
                        $hasNullCheckInContext = $false
                        $checkRange = [Math]::Max(0, $i - 10)..$i
                        
                        # Primero buscar en el contexto inmediato
                        foreach ($checkLineIdx in $checkRange) {
                            $checkLine = $lines[$checkLineIdx]
                            # Verificar patrones de null check más completos (incluyendo optional chaining y checks en la misma línea)
                            if ($checkLine -match "(if\s*\([^)]*!supabase|if\s*\([^)]*supabase\s*===?\s*null|if\s*\([^)]*supabase\s*!==?\s*null|if\s*\([^)]*supabase\s*\|\||if\s*\([^)]*supabase\s*&&|if\s*\([^)]*supabase\s*\?\.|supabase\s*\?\.|!supabase|supabase\s*===?\s*null|supabase\s*!==?\s*null|supabase\s*&&|supabase\s*\|\|)" -and
                                $checkLine -notmatch "^\s*//") {
                                # Verificar que haya un return/throw después del null check (dentro de 5 líneas)
                                $hasReturnAfter = $false
                                for ($k = $checkLineIdx + 1; $k -lt [Math]::Min($checkLineIdx + 6, $i + 1); $k++) {
                                    if ($lines[$k] -match "return|throw|continue") {
                                        $hasReturnAfter = $true
                                        break
                                    }
                                }
                                # Si hay return/throw después del null check, está protegido
                                if ($hasReturnAfter) {
                                    $hasNullCheckInContext = $true
                                    break
                                }
                                # También considerar si el null check está en un if que protege el código siguiente
                                if ($checkLineIdx -lt $i -and $checkLine -match "if\s*\([^)]*!supabase") {
                                    $hasNullCheckInContext = $true
                                    break
                                }
                            }
                        }
                        
                        # Si no se encontró en el contexto inmediato, buscar al inicio de la función
                        if (-not $hasNullCheckInContext) {
                            # Buscar inicio de función (async function, const function =, function name, arrow function)
                            $functionStart = -1
                            for ($j = $i; $j -ge 0; $j--) {
                                $prevLine = $lines[$j]
                                # Detectar inicio de función
                                if ($prevLine -match "^\s*(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*(async\s+)?\(|const\s+\w+\s*=\s*(async\s+)?function|^\s*\w+\s*:\s*(async\s+)?\(|^\s*\w+\s*=\s*(async\s+)?\()") {
                                    $functionStart = $j
                                    break
                                }
                                # Detectar inicio de método de clase
                                if ($prevLine -match "^\s*(async\s+)?\w+\s*\([^)]*\)\s*\{") {
                                    $functionStart = $j
                                    break
                                }
                                # Si encontramos una llave de cierre de función anterior, detener
                                if ($prevLine -match "^\s*\}\s*$" -and $j -lt $i - 5) {
                                    break
                                }
                            }
                            
                            # Si encontramos inicio de función, buscar null check en las primeras 20 líneas
                            if ($functionStart -ge 0) {
                                $functionCheckRange = $functionStart..[Math]::Min($functionStart + 20, $i)
                                foreach ($checkLineIdx in $functionCheckRange) {
                                    $checkLine = $lines[$checkLineIdx]
                                    if ($checkLine -match "(if\s*\([^)]*!supabase|if\s*\([^)]*supabase\s*===?\s*null|if\s*\([^)]*supabase\s*!==?\s*null|if\s*\([^)]*supabase\s*\|\||if\s*\([^)]*supabase\s*&&|if\s*\([^)]*supabase\s*\?\.|!supabase|supabase\s*===?\s*null|supabase\s*!==?\s*null)" -and
                                        $checkLine -notmatch "^\s*//") {
                                        # Verificar que haya un return/throw después del null check
                                        for ($k = $checkLineIdx + 1; $k -lt [Math]::Min($checkLineIdx + 5, $i); $k++) {
                                            if ($lines[$k] -match "return|throw|continue") {
                                                $hasNullCheckInContext = $true
                                                break
                                            }
                                        }
                                        if ($hasNullCheckInContext) { break }
                                    }
                                }
                            }
                        }
                        
                        # También verificar si está dentro de un bloque try-catch que tiene null check al inicio
                        if (-not $hasNullCheckInContext) {
                            # Buscar bloque try anterior
                            $tryStart = -1
                            for ($j = [Math]::Max(0, $i - 50); $j -lt $i; $j++) {
                                if ($lines[$j] -match "^\s*try\s*\{") {
                                    $tryStart = $j
                                    break
                                }
                            }
                            
                            # Si está en un try, buscar null check en las primeras líneas del try
                            if ($tryStart -ge 0) {
                                # Buscar null check en las primeras 15 líneas del try
                                for ($j = $tryStart + 1; $j -lt [Math]::Min($tryStart + 16, $i); $j++) {
                                    $tryLine = $lines[$j]
                                    if ($tryLine -match "(if\s*\([^)]*!supabase|if\s*\([^)]*supabase\s*===?\s*null|if\s*\([^)]*supabase\s*!==?\s*null)" -and
                                        $tryLine -notmatch "^\s*//") {
                                        # Verificar que haya return/throw después
                                        for ($k = $j + 1; $k -lt [Math]::Min($j + 6, $i); $k++) {
                                            if ($lines[$k] -match "return|throw|continue") {
                                                $hasNullCheckInContext = $true
                                                break
                                            }
                                        }
                                        if ($hasNullCheckInContext) { break }
                                    }
                                }
                                
                                # Si no se encontró null check pero hay catch, considerar protegido
                                if (-not $hasNullCheckInContext) {
                                    for ($j = $i; $j -lt [Math]::Min($lines.Count, $i + 30); $j++) {
                                        if ($lines[$j] -match "^\s*catch\s*\(|^\s*\}\s*catch") {
                                            $hasNullCheckInContext = $true
                                            break
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (-not $hasNullCheckInContext) {
                            $filesWithoutNullChecks += @{
                                file = $file.FullName
                                line = $i + 1
                                content = $line.Trim()
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
            
            # Buscar todas las definiciones de tablas dentro del bloque Tables de public
            $tableRegex = [regex]::new("public:\s*\{[\s\S]*?Tables:\s*\{([\s\S]*?)\}\s*(Views|Functions):", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $tablesMatch = $tableRegex.Match($supabaseContent)
            
            if ($tablesMatch.Success) {
                $tablesBlock = $tablesMatch.Groups[1].Value
                # Buscar todas las definiciones de tabla: nombre: { seguido de Row:
                $tableNameRegex = [regex]::new("^\s+(\w+):\s*\{", [System.Text.RegularExpressions.RegexOptions]::Multiline)
                $tableNameMatches = $tableNameRegex.Matches($tablesBlock)
                foreach ($match in $tableNameMatches) {
                    $tableName = $match.Groups[1].Value
                    # Verificar que después del nombre hay un bloque con Row: (es una tabla real)
                    $matchEnd = $match.Index + $match.Length
                    $nextPart = $tablesBlock.Substring($matchEnd, [Math]::Min(200, $tablesBlock.Length - $matchEnd))
                    if ($nextPart -match "Row:" -and 
                        $tableName -notmatch "^(Tables|Views|Functions|Enums|CompositeTypes|Row|Insert|Update|Relationships)$" -and 
                        $tableName -notmatch "^_") {
                        $tablesInTypes += $tableName
                    }
                }
            }
        }
        
        # Buscar referencias a tablas en el código
        $tableReferences = @{}
        $sourceFiles = Get-ChildItem -Path $SourcePath -Recurse -Include "*.ts", "*.tsx" -Exclude "*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx", "node_modules", "android" -ErrorAction SilentlyContinue
        
        # Buckets de Storage conocidos (no son tablas)
        $storageBuckets = @("profile-images", "gallery-images", "career-files", "media", "avatars", "couple-photos")
        
        foreach ($file in $sourceFiles) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Buscar patrones como supabase.from('table_name') pero NO storage.from()
                # Excluir líneas que contengan .storage.from() ya que son buckets, no tablas
                $fromMatches = [regex]::Matches($content, "\.from\(['""]([^'""]+)['""]\)")
                foreach ($match in $fromMatches) {
                    $tableName = $match.Groups[1].Value
                    
                    # Obtener contexto alrededor del match para verificar si es storage
                    $matchIndex = $match.Index
                    $contextStart = [Math]::Max(0, $matchIndex - 50)
                    $contextEnd = [Math]::Min($content.Length, $matchIndex + $match.Length + 50)
                    $context = $content.Substring($contextStart, $contextEnd - $contextStart)
                    
                    # Excluir si es un bucket de storage o si está en contexto de storage
                    if ($storageBuckets -contains $tableName -or $context -match "\.storage\.from\(") {
                        continue
                    }
                    
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
        
        # Obtener también vistas de los tipos
        $viewsInTypes = @()
        if (Test-Path $supabaseTypesPath) {
            $supabaseContent = Get-Content $supabaseTypesPath -Raw
            
            # Buscar vistas dentro del bloque Views de public
            $viewsRegex = [regex]::new("public:\s*\{[\s\S]*?Views:\s*\{([\s\S]*?)\}\s*(Functions|Enums):", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $viewsMatch = $viewsRegex.Match($supabaseContent)
            
            if ($viewsMatch.Success) {
                $viewsBlock = $viewsMatch.Groups[1].Value
                $viewNameRegex = [regex]::new("^\s+(\w+):\s*\{", [System.Text.RegularExpressions.RegexOptions]::Multiline)
                $viewNameMatches = $viewNameRegex.Matches($viewsBlock)
                foreach ($match in $viewNameMatches) {
                    $viewName = $match.Groups[1].Value
                    if ($viewName -notmatch "^(Views|Functions|Enums|CompositeTypes|Row|Insert|Update|Relationships)$" -and $viewName -notmatch "^_") {
                        $viewsInTypes += $viewName
                    }
                }
            }
        }
        
        # Combinar tablas y vistas para comparación
        $allTypesInDatabase = $tablesInTypes + $viewsInTypes
        
        foreach ($table in $tableReferences.Keys) {
            if ($table -notin $allTypesInDatabase) {
                $missingTables += $table
            }
        }
        
        foreach ($table in $allTypesInDatabase) {
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

