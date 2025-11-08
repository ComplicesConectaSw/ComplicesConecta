# AUDITORÍA COMPLETA v3.6.3 - FINAL FUNCIONAL - 08 Nov 2025
$root = Get-Location
$report = @()
$startTime = Get-Date

Write-Host "INICIANDO AUDITORÍA..." -ForegroundColor White -BackgroundColor DarkBlue

# Excluir directorios que no necesitan auditoría
$excludeDirs = @('node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'android', 'ios', '.vite', 'bck', '..\bck')

# 1. ESTRUCTURA
$allItems = Get-ChildItem -Path $root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {
    $fullPath = $_.FullName
    $shouldExclude = $false
    foreach ($exclude in $excludeDirs) {
        if ($fullPath -like "*\$exclude\*" -or $fullPath -like "*\$exclude") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

$dirs = $allItems | Where-Object { $_.PSIsContainer }
$files = $allItems | Where-Object { -not $_.PSIsContainer }

$report += "# AUDITORÍA COMPLETA v3.6.3"
$report += "- Fecha: $(Get-Date -Format 'dd MMM yyyy HH:mm')"
$report += "- Ruta: $root`n"

$report += "## 1. ESTRUCTURA"
$report += "- Directorios: $($dirs.Count)"
$report += "- Archivos: $($files.Count)`n"

# DIRECTORIOS VACÍOS
$emptyDirs = @()
foreach ($d in $dirs) {
    try {
        $children = Get-ChildItem $d.FullName -Force -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -notmatch '^\.' -and $_.Name -ne '.gitkeep'
        }
        if ($children.Count -eq 0) {
            $emptyDirs += $d
        }
    } catch {
        # Ignorar errores al acceder a directorios
    }
}
$report += "## DIRECTORIOS VACÍOS ($($emptyDirs.Count))"
if ($emptyDirs.Count -gt 0) {
    foreach ($d in $emptyDirs) {
        $relativePath = $d.FullName.Replace($root.Path, '').TrimStart('\')
        $report += "- $relativePath"
    }
} else {
    $report += "- Ninguno"
}

# DUPLICADOS
$dupes = @()
$fileGroups = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }
foreach ($group in $fileGroups) {
    $sizes = $group.Group | ForEach-Object { $_.Length } | Sort-Object -Unique
    if ($sizes.Count -eq 1) {
        $dupes += $group.Name
    }
}
$report += "`n## DUPLICADOS ($($dupes.Count))"
if ($dupes.Count -gt 0) {
    foreach ($n in $dupes) {
        $group = $files | Where-Object Name -eq $n
        $report += "- $n ($($group[0].Length) bytes)"
        foreach ($f in $group) {
            $relativePath = $f.FullName.Replace($root.Path, '').TrimStart('\')
            $report += "  → $relativePath"
        }
    }
} else {
    $report += "- Ninguno"
}

# IMPORTS ROTOS
$importErrors = @()
$tsFiles = $files | Where-Object { $_.Extension -match '^\.(ts|tsx|js|jsx)$' }
$processed = 0
foreach ($f in $tsFiles) {
    $processed++
    if ($processed % 100 -eq 0) {
        Write-Host "Procesando archivos: $processed/$($tsFiles.Count)" -ForegroundColor Gray
    }
    
    try {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if (!$content) { continue }
        
        $lines = $content -split "`n"
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            
            # Detectar imports: import ... from '...' o import '...'
            if ($line -match "(?:import|from)\s+['""](.+?)['""]") {
                $importPath = $matches[1]
                
                # Solo verificar imports relativos o con alias @
                if ($importPath -match '^(\./|\.\./|@/)' -and $importPath -notmatch '^(react|react-dom|next|@supabase|@tanstack)') {
                    $resolvedPath = $null
                    
                    # Resolver ruta
                    if ($importPath -match '^@/') {
                        # Alias @ apunta a src/
                        $srcPath = Join-Path $root.Path "src"
                        $relativePath = $importPath -replace '^@/', ''
                        $resolvedPath = Join-Path $srcPath $relativePath
                    } elseif ($importPath -match '^\.\.?/') {
                        # Ruta relativa
                        $resolvedPath = Join-Path $f.DirectoryName $importPath
                    }
                    
                    if ($resolvedPath) {
                        # Normalizar ruta
                        $resolvedPath = [IO.Path]::GetFullPath($resolvedPath)
                        
                        # Verificar si existe el archivo (con o sin extensión)
                        $found = $false
                        $extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.css')
                        foreach ($ext in $extensions) {
                            if (Test-Path ($resolvedPath + $ext)) {
                                $found = $true
                                break
                            }
                        }
                        # También verificar si es un directorio con index
                        if (-not $found -and (Test-Path $resolvedPath -PathType Container)) {
                            foreach ($ext in @('.ts', '.tsx', '.js', '.jsx')) {
                                if (Test-Path (Join-Path $resolvedPath "index$ext")) {
                                    $found = $true
                                    break
                                }
                            }
                        }
                        
                        if (-not $found) {
                            $relativeFile = $f.FullName.Replace($root.Path, '').TrimStart('\')
                            $importErrors += "- $relativeFile`:$($i+1) → '$importPath'"
                        }
                    }
                }
            }
        }
    } catch {
        # Ignorar errores al procesar archivos
    }
}
$report += "`n## IMPORTS ROTOS ($($importErrors.Count))"
if ($importErrors.Count -gt 0) {
    $report += $importErrors[0..[Math]::Min(100, $importErrors.Count - 1)]
    if ($importErrors.Count -gt 100) {
        $report += "... y $($importErrors.Count - 100) más"
    }
} else {
    $report += "- Ninguno"
}

# DEPENDENCIAS
$missing = @()
if (Test-Path "package.json") {
    try {
        $json = Get-Content "package.json" -Raw | ConvertFrom-Json
        $required = @()
        if ($json.dependencies) {
            $required += $json.dependencies.PSObject.Properties.Name
        }
        if ($json.devDependencies) {
            $required += $json.devDependencies.PSObject.Properties.Name
        }
        
        $installed = @()
        if (Test-Path "node_modules") {
            $installed = (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Name
        }
        
        $missing = $required | Where-Object { $installed -notcontains $_ }
    } catch {
        $missing = @("Error al leer package.json")
    }
}
$report += "`n## DEPENDENCIAS FALTANTES ($($missing.Count))"
if ($missing.Count -gt 0) {
    $report += $missing
} else {
    $report += "- Ninguna"
}

# ANDROID
$androidIssues = @()
if (-not (Test-Path "android")) {
    $androidIssues += "FALTA android/"
}
if (-not (Test-Path "capacitor.config.ts")) {
    $androidIssues += "FALTA capacitor.config.ts"
}
$report += "`n## ANDROID ($($androidIssues.Count))"
if ($androidIssues.Count -gt 0) {
    $report += $androidIssues
} else {
    $report += "- Todo correcto"
}

# FINAL
$endTime = Get-Date
$duration = ($endTime - $startTime).ToString("mm\:ss")
$report += "`n## RESUMEN"
$report += "- Duración: $duration"
$report += "- Vacíos: $($emptyDirs.Count)"
$report += "- Duplicados: $($dupes.Count)"
$report += "- Imports rotos: $($importErrors.Count)"
$report += "- Deps faltantes: $($missing.Count)"

# GUARDAR
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$path = "AUDITORIA_v3.6.3_$timestamp.md"
$report | Out-File -FilePath $path -Encoding UTF8
Write-Host "`nREPORTE GUARDADO: $path" -ForegroundColor Green -BackgroundColor Black
Write-Host "DURACIÓN: $duration" -ForegroundColor White -BackgroundColor DarkGreen
