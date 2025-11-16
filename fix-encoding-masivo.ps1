# Fix Masivo UTF-8 Encoding para Cliente Inversor
# 16 Nov 2025 - URGENTE
# 682 archivos con encoding corrupto

Write-Host "🔧 INICIANDO FIX MASIVO DE ENCODING UTF-8..." -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$filesFixed = 0
$errors = 0

# Patterns a corregir (más comunes primero)
$replacements = @{
    'aos(?![a-zA-Z])'      = 'años'
    'das(?![a-zA-Z])'      = 'días'
    'autnticas'            = 'auténticas'
    'autntica'             = 'auténtica'
    'relacin'              = 'relación'
    'descripcin'           = 'descripción'
    'verificacin'          = 'verificación'
    'informacin'           = 'información'
    'notificacin'          = 'notificación'
    'creacin'              = 'creación'
    'conexin'              = 'conexión'
    'Mxico'                = 'México'
    'nmero'                = 'número'
    'cdigo'                = 'código'
    'autenticacin'         = 'autenticación'
    'contrasea'            = 'contraseña'
    'clasificacin'         = 'clasificación'
    'navegacin'            = 'navegación'
    'historial'            = 'historial'
    'perfil'               = 'perfil'
}

# Directorios a procesar
$directories = @(
    "src\app",
    "src\components",
    "src\pages",
    "src\profiles",
    "src\demo",
    "src\lib"
)

Write-Host "📁 Procesando directorios principales..." -ForegroundColor Yellow
Write-Host ""

foreach ($dir in $directories) {
    $fullPath = Join-Path $PSScriptRoot $dir
    if (Test-Path $fullPath) {
        Write-Host "  ► $dir" -ForegroundColor White
        
        Get-ChildItem -Path $fullPath -Recurse -Include *.tsx,*.ts,*.js,*.jsx -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                $file = $_
                $content = Get-Content $file.FullName -Raw -Encoding UTF8
                $originalContent = $content
                
                # Aplicar todos los reemplazos
                foreach ($pattern in $replacements.Keys) {
                    $replacement = $replacements[$pattern]
                    $content = $content -replace $pattern, $replacement
                }
                
                # Solo guardar si hubo cambios
                if ($content -ne $originalContent) {
                    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
                    $filesFixed++
                    Write-Host "    ✅ $($file.Name)" -ForegroundColor Green
                }
            }
            catch {
                $errors++
                Write-Host "    ❌ Error: $($file.Name)" -ForegroundColor Red
            }
        }
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RESUMEN FIX ENCODING UTF-8" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Archivos corregidos: $filesFixed" -ForegroundColor Green
Write-Host "  ❌ Errores: $errors" -ForegroundColor Red
Write-Host "  ⏱️  Tiempo: $([math]::Round($duration, 2)) segundos" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($filesFixed -gt 0) {
    Write-Host "🎯 SIGUIENTE PASO:" -ForegroundColor Yellow
    Write-Host "   git add -A" -ForegroundColor White
    Write-Host "   git commit -m 'fix: Encoding UTF-8 masivo para cliente inversor'" -ForegroundColor White
    Write-Host "   git push origin master" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ℹ️  No se encontraron archivos para corregir." -ForegroundColor Cyan
}

Write-Host "✅ FIX COMPLETADO" -ForegroundColor Green
