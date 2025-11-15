# Deploy Vercel SOLO - Sin Android, con Sentry gratuito
# Version: 3.6.3
# Purpose: Deploy solo a Vercel con Sentry habilitado (plan gratuito)

Write-Host "🚀 Deploy SOLO a Vercel (con Sentry gratuito)..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Función para importar variables de entorno desde archivo .env
function Import-EnvFile {
    param([string]$envFile)
    
    if (Test-Path $envFile) {
        Write-Host "  📄 Cargando variables desde $envFile..." -ForegroundColor Cyan
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#=]+)\s*=\s*(.+)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"').Trim("'")
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "    ✅ $key configurado" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  ⚠️ No se encontró $envFile" -ForegroundColor Yellow
    }
}

# Cargar variables de entorno
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Cyan
Import-EnvFile ".env.local"
Import-EnvFile ".env"

# Configurar Sentry para plan gratuito (solo si hay DSN)
$sentryDsn = $env:SENTRY_DSN
if ($sentryDsn -and $sentryDsn -ne "" -and $sentryDsn -ne "your_sentry_dsn_here") {
    Write-Host "✅ Sentry DSN encontrado: ${sentryDsn.Substring(0,30)}..." -ForegroundColor Green
    $env:VITE_SENTRY_DSN = $sentryDsn
} else {
    Write-Host "⚠️ Sentry DSN no configurado - continuando sin Sentry" -ForegroundColor Yellow
    $env:SENTRY_DSN = ""
    $env:VITE_SENTRY_DSN = ""
}

# Limpiar build anterior
Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✅ Directorio dist eliminado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green

# Type check
Write-Host "🔍 Verificando tipos TypeScript..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de TypeScript encontrados" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ TypeScript verificado" -ForegroundColor Green

# Lint
Write-Host "🔍 Ejecutando linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de linting encontrados" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Linting completado" -ForegroundColor Green

# Build para producción
Write-Host "🔨 Construyendo para producción..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build de producción" -ForegroundColor Red
    exit 1
}

# Verificar que el build se creó correctamente
if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Error: No se generó dist/index.html" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Build de producción completado" -ForegroundColor Green

# Mostrar información del build
$distSize = (Get-ChildItem -Recurse "dist" | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Tamaño del build: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan

# Verificar si Vercel CLI está instalado
Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = $false
try {
    vercel --version | Out-Null
    $vercelInstalled = $true
    Write-Host "  ✅ Vercel CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Vercel CLI no encontrado" -ForegroundColor Yellow
}

if ($vercelInstalled) {
    # Deploy automático a Vercel
    Write-Host "🚀 Desplegando a Vercel..." -ForegroundColor Cyan
    
    # Deploy a producción
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deploy a Vercel completado exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error en el deploy a Vercel" -ForegroundColor Red
        Write-Host "💡 Intenta ejecutar manualmente: vercel --prod" -ForegroundColor Yellow
    }
} else {
    Write-Host "📋 Para desplegar manualmente:" -ForegroundColor Cyan
    Write-Host "   1. Instala Vercel CLI: npm i -g vercel" -ForegroundColor White
    Write-Host "   2. Ejecuta: vercel --prod" -ForegroundColor White
    Write-Host "   3. O sube la carpeta 'dist' a tu hosting" -ForegroundColor White
}

Write-Host "🎉 Proceso completado!" -ForegroundColor Green
Write-Host "📁 Archivos listos en: ./dist/" -ForegroundColor Cyan

if ($sentryDsn -and $sentryDsn -ne "" -and $sentryDsn -ne "your_sentry_dsn_here") {
    Write-Host "📊 Sentry configurado para error tracking" -ForegroundColor Cyan
} else {
    Write-Host "💡 Para habilitar Sentry: configura SENTRY_DSN en .env.local" -ForegroundColor Yellow
}
