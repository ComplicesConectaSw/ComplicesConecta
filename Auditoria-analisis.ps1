# AUDITORÍA COMPLETA v3.6.3 - CONSOLIDADO Y MEJORADO - 08 Nov 2025
# Script consolidado que corrige la detección de imports rotos
# Resuelve correctamente alias @/ y verifica múltiples extensiones

Write-Host "INICIANDO AUDITORÍA COMPLETA v3.6.3..." -ForegroundColor White -BackgroundColor DarkBlue
$root = Get-Location
$report = @()
$startTime = Get-Date

# CONFIGURACIÓN
$excludeDirs = @("node_modules", ".git", "build", "dist", "android", "ios", "public", ".vite", "coverage")
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

$report += "# AUDITORÍA COMPLETA v3.6.3"
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

# 4. SEGURIDAD (Búsqueda de secretos)
Write-Host "`n4. BUSCANDO POSIBLES SECRETOS..." -ForegroundColor Yellow
$secrets = @()
$filesToScan = $files | Where-Object { 
    $_.Extension -match "js|ts|tsx|json|env" -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*.min.*"
}
foreach ($f in $filesToScan) {
    $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "(?i)(sk-[a-zA-Z0-9]{32,}|secret[=:]\s*['`"][^'`"]+['`"]|password[=:]\s*['`"][^'`"]+['`"])") {
        $secrets += "- POSIBLE SECRETO: $($f.FullName.Replace($root, ''))"
    }
}
$report += "`n## POSIBLES SECRETOS ($($secrets.Count))"
if ($secrets.Count -gt 0) {
    $report += $secrets | Select-Object -First 20
} else {
    $report += "- ✅ No se encontraron secretos obvios"
}

# 5. ANDROID / CAPACITOR
Write-Host "`n5. VERIFICANDO ANDROID..." -ForegroundColor Yellow
$androidIssues = @()
if (-not (Test-Path "android")) { $androidIssues += "- FALTA CARPETA 'android/'" }
if (-not (Test-Path "capacitor.config.ts")) { $androidIssues += "- FALTA capacitor.config.ts" }
$report += "`n## PROBLEMAS ANDROID ($($androidIssues.Count))"
if ($androidIssues.Count -gt 0) {
    $report += $androidIssues
} else {
    $report += "- ✅ Configuración Android correcta"
}

# 6. FINAL
$endTime = Get-Date
$duration = ($endTime - $startTime).ToString("mm\:ss")
$report += "`n## RESUMEN FINAL"
$report += "- Duración: $duration"
$report += "- Archivos escaneados: $($files.Count)"
$report += "- Directorios vacíos: $($emptyDirs.Count)"
$report += "- Duplicados: $($dupes.Count)"
$report += "- Imports rotos: $($importErrors.Count)"
$report += "- Dependencias faltantes: $($missing.Count)"
$report += "- Posibles secretos: $($secrets.Count)"

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

