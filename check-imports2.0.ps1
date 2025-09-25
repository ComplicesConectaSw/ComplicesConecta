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
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }

        # Extraer imports
        $imports = Select-String -InputObject $content -Pattern "import\s+.*\s+from\s+[`"'](.+)[`"']" -AllMatches | ForEach-Object {
            $_.Matches.Groups[0].Value
        }

        foreach ($imp in $imports) {
            # Detectar ruta y símbolos
            if ($imp -match "import\s+(?<symbols>\{?.*?\}?)\s+from\s+[`"'](?<path>.+)[`"']") {
                $symbols = $matches['symbols']
                $path = $matches['path']

                # Si es ruta relativa, comprobar existencia
                if ($path.StartsWith(".")) {
                    $resolved = Resolve-Path -Path (Join-Path $file.DirectoryName $path) -ErrorAction SilentlyContinue
                    if (-not $resolved) {
                        Write-Host "❌ Import roto: '$path' en $($file.Name)" -ForegroundColor Red
                        $brokenImports++
                    }
                }

                # Separar variables importadas
                $vars = $symbols -replace '[\{\}]', '' -split ',' | ForEach-Object { $_.Trim() }

                foreach ($v in $vars) {
                    if (-not $v -or $v -eq "") { continue }

                    # Si tiene alias (ej: X as Y), usar solo la parte derecha
                    if ($v -match "as\s+(\w+)$") {
                        $v = $matches[1]
                    }

                    # Verificar si la variable se usa en el archivo
                    if ($content -notmatch "\b$([regex]::Escape($v))\b") {
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
