#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Compara ramas de GitHub y analiza diferencias en el directorio src
.DESCRIPTION
    Compara todas las ramas remotas entre sí, identifica cuál es más completa,
    y muestra diferencias detalladas en el directorio src
.PARAMETER BaseBranch
    Rama base para comparar (default: "master")
.PARAMETER ComparePath
    Ruta a comparar (default: "src")
.EXAMPLE
    .\scripts\compare-branches.ps1
.EXAMPLE
    .\scripts\compare-branches.ps1 -BaseBranch "production" -ComparePath "src"
#>

param(
    [string]$BaseBranch = "master",
    [string]$ComparePath = "src"
)

$ErrorActionPreference = "Stop"
$script:ReportDir = "reports"
$script:Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$script:ReportFile = Join-Path $script:ReportDir "branch-comparison-$script:Timestamp.json"
$script:Results = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    baseBranch = $BaseBranch
    comparePath = $ComparePath
    branches = @()
    comparison = @{}
    summary = @{}
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

Write-ColorOutput "🔍 COMPARACIÓN DE RAMAS - ComplicesConecta" "Bold"
Write-ColorOutput "=" * 70 "Blue"
Write-ColorOutput "📅 Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Blue"
Write-ColorOutput "📁 Ruta de comparación: $ComparePath" "Blue"
Write-ColorOutput "🌿 Rama base: $BaseBranch" "Blue"
Write-ColorOutput ""

# Obtener lista de ramas remotas
Write-ColorOutput "1️⃣ Obteniendo lista de ramas remotas..." "Blue"
try {
    $remoteBranches = git branch -r | ForEach-Object { 
        $_.Trim() -replace "origin/", "" 
    } | Where-Object { 
        $_ -ne "HEAD" -and $_ -ne $BaseBranch 
    } | Sort-Object
    
    Write-ColorOutput "   ✅ Encontradas $($remoteBranches.Count) ramas remotas" "Green"
    Write-ColorOutput ""
} catch {
    Write-ColorOutput "   ❌ Error obteniendo ramas: $($_.Exception.Message)" "Red"
    exit 1
}

# Analizar cada rama
Write-ColorOutput "2️⃣ Analizando ramas..." "Blue"
$branchStats = @()

foreach ($branch in $remoteBranches) {
    Write-ColorOutput "   📊 Analizando rama: $branch" "Yellow"
    
    try {
        # Obtener estadísticas de archivos en src
        $fileStats = git ls-tree -r --name-only "origin/$branch" -- "$ComparePath" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $files = $fileStats | Where-Object { $_ -ne "" }
            $fileCount = ($files | Measure-Object).Count
            
            # Contar líneas de código (aproximado)
            $totalLines = 0
            $tsFiles = 0
            $tsxFiles = 0
            $jsFiles = 0
            
            foreach ($file in $files) {
                if ($file -match "\.ts$" -and $file -notmatch "\.d\.ts$") {
                    $tsFiles++
                } elseif ($file -match "\.tsx$") {
                    $tsxFiles++
                } elseif ($file -match "\.js$" -and $file -notmatch "\.test\.js$") {
                    $jsFiles++
                }
            }
            
            $branchStats += @{
                name = $branch
                fileCount = $fileCount
                tsFiles = $tsFiles
                tsxFiles = $tsxFiles
                jsFiles = $jsFiles
                totalCodeFiles = $tsFiles + $tsxFiles + $jsFiles
            }
            
            Write-ColorOutput "      ✅ Archivos: $fileCount (TS: $tsFiles, TSX: $tsxFiles, JS: $jsFiles)" "Green"
        } else {
            Write-ColorOutput "      ⚠️  Rama no tiene directorio $ComparePath o no accesible" "Yellow"
            $branchStats += @{
                name = $branch
                fileCount = 0
                tsFiles = 0
                tsxFiles = 0
                jsFiles = 0
                totalCodeFiles = 0
            }
        }
    } catch {
        Write-ColorOutput "      ❌ Error analizando rama: $($_.Exception.Message)" "Red"
    }
}

Write-ColorOutput ""

# Identificar rama más completa
Write-ColorOutput "3️⃣ Identificando rama más completa..." "Blue"
$mostCompleteBranch = $branchStats | Sort-Object -Property totalCodeFiles -Descending | Select-Object -First 1

if ($mostCompleteBranch) {
    Write-ColorOutput "   🏆 Rama más completa: $($mostCompleteBranch.name)" "Green"
    Write-ColorOutput "      📁 Archivos de código: $($mostCompleteBranch.totalCodeFiles)" "Green"
    Write-ColorOutput "      📄 Total archivos: $($mostCompleteBranch.fileCount)" "Green"
    $script:Results.summary.mostCompleteBranch = $mostCompleteBranch.name
    $script:Results.summary.mostCompleteStats = $mostCompleteBranch
}

Write-ColorOutput ""

# Comparar rama base con otras ramas
Write-ColorOutput "4️⃣ Comparando rama base ($BaseBranch) con otras ramas..." "Blue"
$comparisons = @()

foreach ($branch in $remoteBranches) {
    Write-ColorOutput "   🔄 Comparando $BaseBranch vs $branch..." "Yellow"
    
    try {
        # Obtener diferencias en src
        $diffOutput = git diff --name-status "origin/$BaseBranch" "origin/$branch" -- "$ComparePath" 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $diffOutput) {
            $diffLines = $diffOutput -split "`n" | Where-Object { $_ -ne "" }
            $addedFiles = @()
            $modifiedFiles = @()
            $deletedFiles = @()
            
            foreach ($line in $diffLines) {
                if ($line -match "^A\s+(.+)") {
                    $addedFiles += $matches[1]
                } elseif ($line -match "^M\s+(.+)") {
                    $modifiedFiles += $matches[1]
                } elseif ($line -match "^D\s+(.+)") {
                    $deletedFiles += $matches[1]
                }
            }
            
            $comparison = @{
                branch = $branch
                addedFiles = $addedFiles
                modifiedFiles = $modifiedFiles
                deletedFiles = $deletedFiles
                totalChanges = $addedFiles.Count + $modifiedFiles.Count + $deletedFiles.Count
            }
            
            $comparisons += $comparison
            
            Write-ColorOutput "      ✅ Cambios: +$($addedFiles.Count) ~$($modifiedFiles.Count) -$($deletedFiles.Count)" "Green"
            
            if ($addedFiles.Count -gt 0) {
                Write-ColorOutput "      📝 Archivos nuevos (primeros 5):" "Blue"
                foreach ($file in $addedFiles[0..([Math]::Min(4, $addedFiles.Count - 1))]) {
                    Write-ColorOutput "         + $file" "Green"
                }
            }
        } else {
            Write-ColorOutput "      ℹ️  Sin diferencias o rama no accesible" "Yellow"
            $comparisons += @{
                branch = $branch
                addedFiles = @()
                modifiedFiles = @()
                deletedFiles = @()
                totalChanges = 0
            }
        }
    } catch {
        Write-ColorOutput "      ❌ Error comparando: $($_.Exception.Message)" "Red"
    }
}

$script:Results.comparison = $comparisons
Write-ColorOutput ""

# Guardar reporte
$script:Results.branches = $branchStats
$script:Results | ConvertTo-Json -Depth 10 | Set-Content $script:ReportFile -Encoding UTF8

# Resumen final
Write-ColorOutput "📊 RESUMEN FINAL" "Bold"
Write-ColorOutput "=" * 70 "Blue"
Write-ColorOutput "🌿 Rama más completa: $($mostCompleteBranch.name)" "Green"
Write-ColorOutput "📁 Archivos de código: $($mostCompleteBranch.totalCodeFiles)" "Green"
Write-ColorOutput "📄 Total archivos: $($mostCompleteBranch.fileCount)" "Green"
Write-ColorOutput ""
Write-ColorOutput "🔄 Comparaciones realizadas: $($comparisons.Count)" "Blue"
Write-ColorOutput "📄 Reporte guardado en: $script:ReportFile" "Blue"
Write-ColorOutput ""

# Mostrar top 5 ramas con más cambios
Write-ColorOutput "🏆 TOP 5 RAMAS CON MÁS CAMBIOS RESPECTO A $BaseBranch" "Bold"
$topBranches = $comparisons | Sort-Object -Property totalChanges -Descending | Select-Object -First 5
foreach ($branch in $topBranches) {
    Write-ColorOutput "   $($branch.branch): $($branch.totalChanges) cambios (+$($branch.addedFiles.Count) ~$($branch.modifiedFiles.Count) -$($branch.deletedFiles.Count))" "Yellow"
}

Write-ColorOutput ""
Write-ColorOutput "✅ Comparación completada" "Green"

