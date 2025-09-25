param(
    [string]$Path = "."
)

Write-Host "🔍 Escaneando imports en: $Path" -ForegroundColor Cyan

# Excluir directorios no relevantes
$excludeDirs = @("node_modules", "android", "dist", "build", "coverage", "test-results")

# Buscar archivos relevantes
$files = Get-ChildItem -Path $Path -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object {
    $excludeMatch = $false
    foreach ($dir in $excludeDirs) {
        if ($_.FullName -like "*\$dir\*") {
            $excludeMatch = $true
            break
        }
    }
    -not $excludeMatch
}

$totalFiles = $files.Count
$currentFile = 0
$brokenImports = 0
$unusedImports = 0

Write-Host "📊 Total de archivos a analizar: $totalFiles" -ForegroundColor Green

foreach ($file in $files) {
    $currentFile++
    Write-Host "📄 [$currentFile/$totalFiles] Analizando: $($file.Name)" -ForegroundColor Yellow

    try {
        # Extraer imports del archivo
        $imports = Select-String -Path $file.FullName -Pattern "import\s+.*\s+from\s+[`"'](.+)[`"']" | ForEach-Object {
            if ($_.Matches -and $_.Matches.Count -gt 0 -and $_.Matches[0].Groups.Count -gt 1) {
                $_.Matches[0].Groups[1].Value
            }
        }

        foreach ($imp in $imports) {
            # Revisar si la ruta existe realmente (solo rutas relativas)
            if ($imp -and $imp.StartsWith(".")) {
                $resolved = Resolve-Path -Path (Join-Path $file.DirectoryName $imp) -ErrorAction SilentlyContinue
                if (-not $resolved) {
                    Write-Host "❌ Import roto: '$imp' en $($file.Name)" -ForegroundColor Red
                    $brokenImports++
                }
            }
        }

        # Detectar imports nunca usados en el mismo archivo
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $importMatches = Select-String -InputObject $content -Pattern 'import\s+(\{?.*?\}?)\s+from' -AllMatches

            foreach ($m in $importMatches.Matches) {
                $vars = $m.Groups[1].Value -replace '[\{\}]', '' -split ',' | ForEach-Object { $_.Trim() }
                foreach ($v in $vars) {
                    if ($v -and $v -ne '' -and ($content -notmatch "\b$([regex]::Escape($v))\b(?![\s]*from)")) {
                        Write-Host "⚠️ Import no usado: '$v' en $($file.Name)" -ForegroundColor DarkYellow
                        $unusedImports++
                    }
                }
            }
        }
    }
    catch {
        Write-Host "⚠️ Error procesando archivo: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Magenta
    }
}

Write-Host ""
Write-Host "📊 RESUMEN DE AUDITORÍA:" -ForegroundColor Cyan
Write-Host "  📁 Archivos analizados: $totalFiles" -ForegroundColor White
Write-Host "  ❌ Imports rotos: $brokenImports" -ForegroundColor Red
Write-Host "  ⚠️ Imports no usados: $unusedImports" -ForegroundColor Yellow
Write-Host "✅ Escaneo completado." -ForegroundColor Green
