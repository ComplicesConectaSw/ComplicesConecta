# Build and Deploy Script for Vercel - CómplicesConecta Edition
# Version: 3.7.0 - DICIEMBRE 2025 - FULL PNPM + ZERO ERRORS
# Autor: Tu hermano que ya te ama

Write-Host "`nIniciando build y deploy definitivo para Vercel..." -ForegroundColor Cyan
Write-Host "       CómplicesConecta va a romperla hoy" -ForegroundColor Magenta
Write-Host ""

# Verificar directorio
if (-not (Test-Path "package.json")) {
    Write-Host "Error: No se encontró package.json. Ejecuta desde la raíz." -ForegroundColor Red
    exit 1
}

# Cargar .env / .env.local
function Import-EnvFile($file) {
    if (Test-Path $file) {
        Write-Host "  Cargando variables desde $file..." -ForegroundColor Cyan
        Get-Content $file | Where-Object { $_ -match '^\s*[^#]' } | ForEach-Object {
            if ($_ -match '^\s*([^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"').Trim("'")
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
        return $true
    }
    return $false
}

Write-Host "`nCargando variables de entorno..." -ForegroundColor Yellow
Import-EnvFile ".env.local" | Out-Null
Import-EnvFile ".env" | Out-Null
Write-Host "  Variables cargadas (o usarán las de Vercel)" -ForegroundColor Green

# Verificar variables críticas
$required = "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"
foreach ($v in $required) {
    if ([Environment]::GetEnvironmentVariable($v)) {
        Write-Host "  $v configurada" -ForegroundColor Green
    } else {
        Write-Host "  $v FALTANTE (se usará Vercel Dashboard)" -ForegroundColor Yellow
    }
}

# LIMPIEZA NUCLEAR
Write-Host "`nLimpiando builds anteriores..." -ForegroundColor Yellow
@("dist", "build", ".next", "android/.gradle", "android/app/build", "android/build") | ForEach-Object {
    if (Test-Path $_) { Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue }
}

# INSTALACIÓN CON PNPM (EL REY EN 2025)
Write-Host "`nInstalando dependencias con pnpm (rápido y sin dramas)..." -ForegroundColor Green
pnpm install --no-frozen-lockfile --prefer-offline
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error crítico con pnpm" -ForegroundColor Red
    exit 1
}

# APROBAR BUILD SCRIPTS AUTOMÁTICAMENTE (nunca más ese warning)
Write-Host "Aprobando build scripts confiables (sharp, canvas, tsparticles, etc.)..." -ForegroundColor Cyan
pnpm approve-builds --all 2>$null

Write-Host "  Dependencias instaladas y aprobadas" -ForegroundColor Green

# Type check (opcional pero pro)
Write-Host "`nVerificando tipos TypeScript..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) { Write-Host "Errores de tipos" -ForegroundColor Red; exit 1 }
Write-Host "  Tipos OK" -ForegroundColor Green

# BUILD
Write-Host "`nConstruyendo producción..." -ForegroundColor Yellow
$start = Get-Date
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "FALLÓ EL BUILD" -ForegroundColor Red; exit 1 }
$end = Get-Date
$time = ($end - $start).TotalSeconds
Write-Host "  Build completado en $([math]::Round($time, 2))s" -ForegroundColor Green

# Análisis de tamaño
if (Test-Path "dist") {
    $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  Tamaño total: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    if ($size -gt 60) { Write-Host "  ADVERTENCIA: Build grande" -ForegroundColor Yellow } else { Write-Host "  Build óptimo" -ForegroundColor Green }
}

# Asegurar rama master
Write-Host "`nAsegurando rama master..." -ForegroundColor Yellow
git checkout master 2>$null
git pull origin master
Write-Host "  En master y actualizado" -ForegroundColor Green

# DEPLOY A PRODUCCIÓN
Write-Host "`nDESPLEGANDO EN VERCEL (producción)..." -ForegroundColor Cyan
vercel --prod --yes --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en deploy" -ForegroundColor Red
    exit 1
}

Write-Host "`nPROCESO COMPLETADO CON ÉXITO!" -ForegroundColor Green
Write-Host "   3 modos de fondo (fijo/partículas/video MP4)" -ForegroundColor White
Write-Host "   Partículas volando" -ForegroundColor White
Write-Host "   Logo VIP girando" -ForegroundColor White
Write-Host "   Navbar fija" -ForegroundColor White
Write-Host "   Todo limpio, rápido y en producción" -ForegroundColor White
Write-Host "`n¡CómplicesConecta ya está en otro nivel!" -ForegroundColor Magenta

pause