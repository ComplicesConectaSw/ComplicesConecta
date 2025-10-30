# Build y Análisis de Chunks - ComplicesConecta v3.4.1
# Fecha: 30 de Octubre, 2025

Write-Host "🚀 BUILD Y ANÁLISIS DE CHUNKS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar dist anterior
if (Test-Path "dist") {
    Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force dist
}

# Ejecutar build
Write-Host "🏗️  Ejecutando build optimizado..." -ForegroundColor Cyan
$buildStart = Get-Date
npm run build
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds

Write-Host ""
Write-Host "✅ Build completado en $([math]::Round($buildTime, 2))s" -ForegroundColor Green
Write-Host ""

# Analizar chunks
Write-Host "📊 ANÁLISIS DE CHUNKS GENERADOS:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

$jsFiles = Get-ChildItem dist/assets/*.js | Sort-Object Length -Descending

Write-Host "Chunks JavaScript:" -ForegroundColor Cyan
$jsFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length/1KB, 2)
    $sizeMB = [math]::Round($_.Length/1MB, 3)
    $name = $_.Name
    
    # Color según tamaño
    if ($sizeKB -gt 800) {
        Write-Host "  ❌ $name : $sizeKB KB ($sizeMB MB)" -ForegroundColor Red
    } elseif ($sizeKB -gt 500) {
        Write-Host "  ⚠️  $name : $sizeKB KB ($sizeMB MB)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ $name : $sizeKB KB ($sizeMB MB)" -ForegroundColor Green
    }
}

Write-Host ""
$totalJS = ($jsFiles | Measure-Object -Property Length -Sum).Sum
$totalJSMB = [math]::Round($totalJS/1MB, 2)
Write-Host "Total JS: $totalJSMB MB" -ForegroundColor Cyan

# CSS
Write-Host ""
Write-Host "Archivos CSS:" -ForegroundColor Cyan
$cssFiles = Get-ChildItem dist/assets/*.css | Sort-Object Length -Descending
$cssFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length/1KB, 2)
    Write-Host "  ✅ $($_.Name) : $sizeKB KB" -ForegroundColor Green
}

# Total
Write-Host ""
$totalCSS = ($cssFiles | Measure-Object -Property Length -Sum).Sum
$totalCSSKB = [math]::Round($totalCSS/1KB, 2)
Write-Host "Total CSS: $totalCSSKB KB" -ForegroundColor Cyan

# Resumen
Write-Host ""
Write-Host "📈 RESUMEN:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "Total archivos JS: $($jsFiles.Count)" -ForegroundColor White
Write-Host "Total archivos CSS: $($cssFiles.Count)" -ForegroundColor White
Write-Host "Tamaño total: $([math]::Round(($totalJS + $totalCSS)/1MB, 2)) MB" -ForegroundColor White
Write-Host ""

# Verificar warnings
$largeChunks = $jsFiles | Where-Object { $_.Length -gt 800KB }
if ($largeChunks.Count -eq 0) {
    Write-Host "✅ ¡Todos los chunks son < 800 KB!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Chunks > 800 KB: $($largeChunks.Count)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Análisis completado" -ForegroundColor Green

