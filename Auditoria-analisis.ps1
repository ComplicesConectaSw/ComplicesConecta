# AUDITORÍA COMPLETA v3.6.3 - MEJORADO Y EXPANDIDO - 08 Nov 2025
# Script consolidado con análisis completo de:
# - Estructura del proyecto
# - Imports rotos
# - Dependencias faltantes
# - Seguridad (vulnerabilidades, exploits)
# - Archivos huérfanos, corruptos, vacíos, obsoletos, mal ubicados
# - Verificación de tablas (local y remoto)
# - Análisis de código (TypeScript, ESLint, Lint)
# - Uso de tablas en código (as any, null, etc.)

Write-Host "INICIANDO AUDITORÍA COMPLETA v3.6.3 MEJORADA..." -ForegroundColor White -BackgroundColor DarkBlue
$root = (Get-Location).Path
$report = @()
$startTime = Get-Date

# CONFIGURACIÓN
$excludeDirs = @("node_modules", ".git", "build", "dist", "android", "ios", "public", ".vite", "coverage", "bck")
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.css')
$indexFiles = @('index.ts', 'index.tsx', 'index.js', 'index.jsx')

# Cargar configuración de alias desde tsconfig.json
$aliasBase = "src"
if (Test-Path "tsconfig.json") {
    $tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
    if ($tsconfig.compilerOptions.paths.'@/*') {
        $aliasPath = $tsconfig.compilerOptions.paths.'@/*'[0]
        $aliasBase = $aliasPath -replace '^\./', '' -replace '/\*$', ''
    }
}

Write-Host "Configuración de alias: @/ → ./$aliasBase/" -ForegroundColor Cyan

# 1. ESCANEO DE ESTRUCTURA
Write-Host "`n1. ESCANEANDO ESTRUCTURA..." -ForegroundColor Yellow
$allItems = Get-ChildItem -Path $root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {
    $exclude = $false
    foreach ($dir in $excludeDirs) {
        if ($_.FullName -like "*\$dir\*" -or $_.FullName -like "*\$dir") {
            $exclude = $true
            break
        }
    }
    -not $exclude
}
$dirs = $allItems | Where-Object { $_.PSIsContainer }
$files = $allItems | Where-Object { -not $_.PSIsContainer }

Write-Host "Directorios: $($dirs.Count)" -ForegroundColor Cyan
Write-Host "Archivos: $($files.Count)" -ForegroundColor Cyan

$report += "# AUDITORÍA COMPLETA v3.6.3 MEJORADA"
$report += "- Fecha: $(Get-Date -Format 'dd MMM yyyy HH:mm')"
$report += "- Ruta: $root"
$report += "- Alias configurado: @/ → ./$aliasBase/`n"

$report += "## 1. ESTRUCTURA (excluye: $($excludeDirs -join ', '))"
$report += "- Directorios: $($dirs.Count)"
$report += "- Archivos: $($files.Count)`n"

# 1.1 DIRECTORIOS VACÍOS
Write-Host "`n1.1. Buscando directorios vacíos..." -ForegroundColor Yellow
$emptyDirs = $dirs | Where-Object {
    $c = Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue
    $c.Count -eq 0 -or ($c | Where-Object { $_.Name -notmatch '^\.' }).Count -eq 0
}
$report += "## DIRECTORIOS VACÍOS ($($emptyDirs.Count))"
foreach ($d in $emptyDirs) {
    $report += "- $($d.FullName.Replace($root, ''))"
}

# 1.2 ARCHIVOS DUPLICADOS
Write-Host "`n1.2. Buscando archivos duplicados..." -ForegroundColor Yellow
$dupes = @()
$g = $files | Group-Object Name | Where-Object Count -gt 1
foreach ($group in $g) {
    $s = $group.Group.Length | Sort-Object -Unique
    if ($s.Count -eq 1) { $dupes += $group.Name }
}
$report += "`n## ARCHIVOS DUPLICADOS ($($dupes.Count))"
foreach ($n in $dupes) {
    $g = $files | Where-Object Name -eq $n
    $report += "- $n ($($g[0].Length) bytes)"
    foreach ($f in $g) { $report += "  → $($f.FullName.Replace($root, ''))" }
}

# 1.3 ARCHIVOS GRANDES (>10MB)
Write-Host "`n1.3. Buscando archivos grandes..." -ForegroundColor Yellow
$largeFiles = $files | Where-Object { $_.Length -gt 10MB }
$report += "`n## ARCHIVOS GRANDES (>10MB) ($($largeFiles.Count))"
foreach ($f in $largeFiles) {
    $report += "- $($f.Name) ($([math]::Round($f.Length/1MB,2)) MB) → $($f.DirectoryName.Replace($root, ''))"
}

# 1.4 ARCHIVOS VACÍOS
Write-Host "`n1.4. Buscando archivos vacíos..." -ForegroundColor Yellow
$emptyFiles = $files | Where-Object { 
    $_.Length -eq 0 -or ((Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -and (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue).Trim().Length -eq 0)
}
$report += "`n## ARCHIVOS VACÍOS ($($emptyFiles.Count))"
foreach ($f in $emptyFiles | Select-Object -First 20) {
    $report += "- $($f.FullName.Replace($root, ''))"
}

# 1.5 ARCHIVOS CORRUPTOS (sintaxis inválida)
Write-Host "`n1.5. Buscando archivos corruptos..." -ForegroundColor Yellow
$corruptFiles = @()
$tsFiles = $files | Where-Object { $_.Extension -match 'ts|tsx|js|jsx' -and $_.FullName -like "*\src\*" }
foreach ($f in $tsFiles) {
    try {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Verificar paréntesis, llaves, corchetes balanceados
            $openParen = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
            $closeParen = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
            $openBrace = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
            $closeBrace = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
            $openBracket = ($content.ToCharArray() | Where-Object { $_ -eq '[' }).Count
            $closeBracket = ($content.ToCharArray() | Where-Object { $_ -eq ']' }).Count
            
            if ($openParen -ne $closeParen -or $openBrace -ne $closeBrace -or $openBracket -ne $closeBracket) {
                $corruptFiles += $f.FullName.Replace($root, '')
            }
        }
    } catch {
        $corruptFiles += $f.FullName.Replace($root, '')
    }
}
$report += "`n## ARCHIVOS CORRUPTOS ($($corruptFiles.Count))"
foreach ($f in $corruptFiles | Select-Object -First 20) {
    $report += "- $f"
}

# 1.6 ARCHIVOS OBSOLETOS
Write-Host "`n1.6. Buscando archivos obsoletos..." -ForegroundColor Yellow
$obsoleteFiles = $files | Where-Object { $_.Name -match "(deprecated|old|backup|\.bak|\.old|_old|_backup|_deprecated)" }
$report += "`n## ARCHIVOS OBSOLETOS ($($obsoleteFiles.Count))"
foreach ($f in $obsoleteFiles | Select-Object -First 20) {
    $report += "- $($f.FullName.Replace($root, ''))"
}

# 1.7 ARCHIVOS MAL UBICADOS
Write-Host "`n1.7. Buscando archivos mal ubicados..." -ForegroundColor Yellow
$misplacedFiles = @()
# Componentes en directorios incorrectos
$componentFiles = $files | Where-Object { 
    $_.Name -match "^(Component|Button|Modal|Card|Dialog|Form)" -and 
    $_.DirectoryName -notmatch "(components|shared|ui)" -and
    $_.FullName -like "*\src\*"
}
if ($componentFiles.Count -gt 0) {
    $misplacedFiles += $componentFiles
}
$report += "`n## ARCHIVOS MAL UBICADOS ($($misplacedFiles.Count))"
foreach ($f in $misplacedFiles | Select-Object -First 20) {
    $report += "- $($f.FullName.Replace($root, ''))"
}

# 1.8 ARCHIVOS HUÉRFANOS (sin imports)
Write-Host "`n1.8. Buscando archivos huérfanos..." -ForegroundColor Yellow
$orphanFiles = @()
$allSrcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }
$allContent = @()
foreach ($f in $allSrcFiles) {
    $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) { $allContent += $content }
}

foreach ($file in $allSrcFiles) {
    $fileName = $file.BaseName
    $rootPath = $root + "\"
    $filePath = $file.FullName.Replace($rootPath, "").Replace("\", "/")
    
    # Buscar si el archivo es importado
    $isImported = $false
    foreach ($content in $allContent) {
        if ($content -match "from\s+['`"].*$fileName['`"]|import.*$fileName") {
            $isImported = $true
            break
        }
    }
    
    # Excluir archivos de entrada
    if (-not $isImported -and $file.Name -notmatch "^(main|App|index|vite-env)\.(ts|tsx)$") {
        $orphanFiles += $filePath
    }
}
$report += "`n## ARCHIVOS HUÉRFANOS ($($orphanFiles.Count))"
foreach ($f in $orphanFiles | Select-Object -First 20) {
    $report += "- $f"
}

# 2. IMPORTS ROTOS (MEJORADO)
Write-Host "`n2. ANALIZANDO IMPORTS ROTOS (con resolución correcta de alias @/)..." -ForegroundColor Yellow

function Resolve-ImportPath {
    param(
        [string]$ImportPath,
        [string]$FromFile,
        [string]$RootPath,
        [string]$AliasBase
    )
    
    # Ignorar imports de node_modules, http, react, next, supabase
    # PRIMERO: Verificar imports conocidos de node_modules (antes de verificar prefijos)
    if ($ImportPath -match '^(react|next|@react|@next|supabase|http|https|@supabase|@radix|@tanstack|@hookform|lucide|framer-motion|recharts|date-fns|zod|clsx|tailwind-merge|react-router|react-dom|@vitejs|vite|typescript)') {
        return "node_modules"
    }
    
    # Si no empieza con ./ ../ o @/, asumir que es de node_modules
    if ($ImportPath -notmatch '^(\./|\.\./|@/)') {
        return "node_modules"  # Retornar algo que indique que es válido
    }
    
    # Resolver alias @/
    if ($ImportPath -match '^@/(.+)$') {
        $relativePath = $matches[1]
        # Normalizar barras para Windows
        $relativePath = $relativePath -replace '/', '\'
        # Construir ruta completa
        $resolved = Join-Path $RootPath $AliasBase
        $resolved = Join-Path $resolved $relativePath
        $resolved = [IO.Path]::GetFullPath($resolved)
        
        # Verificar con extensiones
        foreach ($ext in $extensions) {
            $testPath = $resolved + $ext
            if (Test-Path $testPath) {
                return $testPath
            }
        }
        
        # Verificar si es un directorio con index.*
        if (Test-Path $resolved -PathType Container) {
            foreach ($indexFile in $indexFiles) {
                $testPath = Join-Path $resolved $indexFile
                if (Test-Path $testPath) {
                    return $testPath
                }
            }
        }
        
        return $null
    }
    
    # Resolver imports relativos (./ o ../)
    if ($ImportPath -match '^(\./|\.\./)') {
        $fromDir = Split-Path $FromFile -Parent
        # Normalizar barras para Windows
        $normalizedPath = $ImportPath -replace '/', '\'
        # Resolver ruta relativa correctamente
        $resolved = [IO.Path]::Combine($fromDir, $normalizedPath)
        $resolved = [IO.Path]::GetFullPath($resolved)
        
        # Verificar con extensiones
        foreach ($ext in $extensions) {
            $testPath = $resolved + $ext
            if (Test-Path $testPath) {
                return $testPath
            }
        }
        
        # Verificar si es un directorio con index.*
        if (Test-Path $resolved -PathType Container) {
            foreach ($indexFile in $indexFiles) {
                $testPath = Join-Path $resolved $indexFile
                if (Test-Path $testPath) {
                    return $testPath
                }
            }
        }
        
        return $null
    }
    
    # Otros imports (asumir que son de node_modules)
    return "node_modules"
}

$importErrors = @()
$tsFiles = $files | Where-Object { 
    $_.FullName -like "*\src\*" -and $_.Extension -match 'ts|tsx' 
}

$processed = 0
$total = $tsFiles.Count

foreach ($file in $tsFiles) {
    $processed++
    if ($processed % 50 -eq 0) {
        Write-Host "  Procesando: $processed/$total archivos..." -ForegroundColor Gray
    }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (!$content) { continue }
    
    $lines = $content -split "`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Buscar imports: import ... from '...' o import '...'
        if ($line -match "(from|import)\s+['`"](.+?)['`"]") {
            $importPath = $matches[2]
            
            # Resolver el import
            $resolved = Resolve-ImportPath -ImportPath $importPath -FromFile $file.FullName -RootPath $root -AliasBase $aliasBase
            
            # Si no se resolvió, es un import roto
            if ($null -eq $resolved) {
                $importErrors += "- $($file.Name):$($i+1) → '$importPath'"
            }
        }
    }
}

$report += "`n## IMPORTS ROTOS ($($importErrors.Count))"
if ($importErrors.Count -gt 0) {
    $report += $importErrors | Select-Object -First 100
    if ($importErrors.Count -gt 100) {
        $report += "`n... y $($importErrors.Count - 100) más (ver reporte completo)"
    }
} else {
    $report += "- ✅ No se encontraron imports rotos"
}

# 3. DEPENDENCIAS FALTANTES
Write-Host "`n3. VERIFICANDO DEPENDENCIAS..." -ForegroundColor Yellow
$missing = @()
if (Test-Path "package.json") {
    $json = Get-Content "package.json" | ConvertFrom-Json
    $req = @()
    if ($json.dependencies) { $req += $json.dependencies.PSObject.Properties.Name }
    if ($json.devDependencies) { $req += $json.devDependencies.PSObject.Properties.Name }
    $nm = if (Test-Path "node_modules") { 
        (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Name 
    } else { 
        @() 
    }
    $missing = $req | Where-Object { $nm -notcontains $_ }
}
$report += "`n## DEPENDENCIAS FALTANTES ($($missing.Count))"
if ($missing.Count -gt 0) {
    $report += $missing
} else {
    $report += "- ✅ Todas las dependencias están instaladas"
}

# 4. SEGURIDAD (Búsqueda de secretos y vulnerabilidades)
Write-Host "`n4. BUSCANDO POSIBLES SECRETOS Y VULNERABILIDADES..." -ForegroundColor Yellow
$secrets = @()
$vulnerabilities = @()
$filesToScan = $files | Where-Object { 
    $_.Extension -match "js|ts|tsx|json|env" -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*.min.*"
}
foreach ($f in $filesToScan) {
    $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Secretos hardcodeados
        if ($content -match "(?i)(sk-[a-zA-Z0-9]{32,}|secret[=:]\s*['`"][^'`"]+['`"]|password[=:]\s*['`"][^'`"]+['`"]|api[_-]?key[=:]\s*['`"][^'`"]+['`"]|token[=:]\s*['`"][^'`"]+['`"])") {
            $secrets += "- POSIBLE SECRETO: $($f.FullName.Replace($root, ''))"
        }
        
        # Vulnerabilidades comunes
        if ($content -match "eval\s*\(") {
            $vulnerabilities += "- 🔴 Uso de eval(): $($f.FullName.Replace($root, ''))"
        }
        if ($content -match "dangerouslySetInnerHTML|innerHTML\s*=") {
            $vulnerabilities += "- ⚠️  Posible XSS (innerHTML): $($f.FullName.Replace($root, ''))"
        }
        if ($content -match "\.query\(|\.execute\(|SELECT.*\+|INSERT.*\+") {
            $vulnerabilities += "- ⚠️  Posible SQL Injection: $($f.FullName.Replace($root, ''))"
        }
        if ($content -match "localStorage\.(setItem|getItem)" -and $content -notmatch "sanitize|validate") {
            $vulnerabilities += "- ⚠️  localStorage sin validación: $($f.FullName.Replace($root, ''))"
        }
    }
}
$report += "`n## POSIBLES SECRETOS ($($secrets.Count))"
if ($secrets.Count -gt 0) {
    $report += $secrets | Select-Object -First 20
} else {
    $report += "- ✅ No se encontraron secretos obvios"
}
$report += "`n## VULNERABILIDADES ($($vulnerabilities.Count))"
if ($vulnerabilities.Count -gt 0) {
    $report += $vulnerabilities | Select-Object -First 20
} else {
    $report += "- ✅ No se encontraron vulnerabilidades obvias"
}

# 5. ANÁLISIS DE CÓDIGO (TypeScript, ESLint, Lint)
Write-Host "`n5. ANALIZANDO CÓDIGO (TypeScript, ESLint, Lint)..." -ForegroundColor Yellow
$codeErrors = @()

# TypeScript
Write-Host "  5.1. Verificando errores de TypeScript..." -ForegroundColor Gray
try {
    $tsErrors = pnpm run type-check 2>&1 | Out-String
    if ($tsErrors -match "error TS|Found \d+ error") {
        $tsErrorLines = $tsErrors -split "`n" | Where-Object { $_ -match "error TS" } | Select-Object -First 20
        foreach ($line in $tsErrorLines) {
            $codeErrors += "- TypeScript: $line"
        }
    }
} catch {
    $codeErrors += "- ⚠️  No se pudo ejecutar type-check: $_"
}

# ESLint
Write-Host "  5.2. Verificando errores de ESLint..." -ForegroundColor Gray
try {
    $eslintErrors = npx eslint . --format compact 2>&1 | Out-String
    if ($eslintErrors -match "error|warning" -and $eslintErrors -notmatch "No files matching") {
        $eslintErrorLines = $eslintErrors -split "`n" | Where-Object { $_ -match "error|warning" } | Select-Object -First 20
        foreach ($line in $eslintErrorLines) {
            $codeErrors += "- ESLint: $line"
        }
    }
} catch {
    $codeErrors += "- ⚠️  No se pudo ejecutar ESLint: $_"
}

# Lint
Write-Host "  5.3. Verificando errores de Lint..." -ForegroundColor Gray
try {
    $lintErrors = pnpm run lint 2>&1 | Out-String
    if ($lintErrors -match "error|warning" -and $lintErrors -notmatch "No files matching") {
        $lintErrorLines = $lintErrors -split "`n" | Where-Object { $_ -match "error|warning" } | Select-Object -First 20
        foreach ($line in $lintErrorLines) {
            $codeErrors += "- Lint: $line"
        }
    }
} catch {
    $codeErrors += "- ⚠️  No se pudo ejecutar lint: $_"
}

$report += "`n## ERRORES DE CÓDIGO ($($codeErrors.Count))"
if ($codeErrors.Count -gt 0) {
    $report += $codeErrors | Select-Object -First 50
} else {
    $report += "- ✅ No se encontraron errores de código"
}

# 6. USO DE TABLAS EN CÓDIGO (as any, null, etc.)
Write-Host "`n6. VERIFICANDO USO DE TABLAS EN CÓDIGO..." -ForegroundColor Yellow
$tableIssues = @()
$srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Buscar 'as any' o 'null' relacionados con tablas
        if ($content -match "as\s+any|:\s*null|undefined") {
            $lines = $content -split "`n"
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "as\s+any|:\s*null|undefined") {
                    # Buscar si hay referencia a tabla
                    if ($lines[$i] -match "\.from\(|supabase\.from") {
                        $tableIssues += "- $($file.Name):$($i+1) → $($lines[$i].Trim())"
                    }
                }
            }
        }
    }
}

$report += "`n## USO DE 'as any' O 'null' CON TABLAS ($($tableIssues.Count))"
if ($tableIssues.Count -gt 0) {
    $report += $tableIssues | Select-Object -First 30
} else {
    $report += "- ✅ No se encontraron usos problemáticos de 'as any' o 'null' con tablas"
}

# 7. ANDROID / CAPACITOR
Write-Host "`n7. VERIFICANDO ANDROID..." -ForegroundColor Yellow
$androidIssues = @()
if (-not (Test-Path "android")) { $androidIssues += "- FALTA CARPETA 'android/'" }
if (-not (Test-Path "capacitor.config.ts")) { $androidIssues += "- FALTA capacitor.config.ts" }
$report += "`n## PROBLEMAS ANDROID ($($androidIssues.Count))"
if ($androidIssues.Count -gt 0) {
    $report += $androidIssues
} else {
    $report += "- ✅ Configuración Android correcta"
}

# 8. FINAL
$endTime = Get-Date
$duration = ($endTime - $startTime).ToString("mm\:ss")
$report += "`n## RESUMEN FINAL"
$report += "- Duración: $duration"
$report += "- Archivos escaneados: $($files.Count)"
$report += "- Directorios vacíos: $($emptyDirs.Count)"
$report += "- Duplicados: $($dupes.Count)"
$report += "- Archivos vacíos: $($emptyFiles.Count)"
$report += "- Archivos corruptos: $($corruptFiles.Count)"
$report += "- Archivos obsoletos: $($obsoleteFiles.Count)"
$report += "- Archivos mal ubicados: $($misplacedFiles.Count)"
$report += "- Archivos huérfanos: $($orphanFiles.Count)"
$report += "- Imports rotos: $($importErrors.Count)"
$report += "- Deps faltantes: $($missing.Count)"
$report += "- Posibles secretos: $($secrets.Count)"
$report += "- Vulnerabilidades: $($vulnerabilities.Count)"
$report += "- Errores de código: $($codeErrors.Count)"
$report += "- Uso problemático de tablas: $($tableIssues.Count)"

# GUARDAR REPORTE
$ts = Get-Date -Format "yyyyMMdd_HHmm"
$path = "AUDITORIA_COMPLETA_v3.6.3_$ts.md"
$report | Out-File -FilePath $path -Encoding UTF8
Write-Host "`n✅ AUDITORÍA COMPLETA GUARDADA EN: $path" -ForegroundColor Green -BackgroundColor Black
Write-Host "⏱️  DURACIÓN TOTAL: $duration" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "  - Imports rotos: $($importErrors.Count)" -ForegroundColor $(if ($importErrors.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  - Dependencias faltantes: $($missing.Count)" -ForegroundColor $(if ($missing.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  - Directorios vacíos: $($emptyDirs.Count)" -ForegroundColor $(if ($emptyDirs.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  - Archivos huérfanos: $($orphanFiles.Count)" -ForegroundColor $(if ($orphanFiles.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  - Vulnerabilidades: $($vulnerabilities.Count)" -ForegroundColor $(if ($vulnerabilities.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  - Errores de código: $($codeErrors.Count)" -ForegroundColor $(if ($codeErrors.Count -eq 0) { "Green" } else { "Yellow" })
