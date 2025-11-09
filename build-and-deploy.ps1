# Build and Deploy Script for Vercel
# Version: 3.6.3
# Purpose: Build optimized production bundle and deploy to Vercel

Write-Host "🚀 Iniciando build y deploy para Vercel..." -ForegroundColor Cyan

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
                if (-not [string]::IsNullOrEmpty($key) -and -not [string]::IsNullOrEmpty($value)) {
                    # Solo establecer si no existe en el sistema
                    if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($key))) {
                        [Environment]::SetEnvironmentVariable($key, $value, "Process")
                    }
                }
            }
        }
        return $true
    }
    return $false
}

# Cargar variables de entorno desde archivos .env
Write-Host "`n📋 Cargando variables de entorno..." -ForegroundColor Yellow
$envLoaded = $false

# Intentar cargar desde .env.local primero (tiene prioridad)
if (Import-EnvFile ".env.local") {
    $envLoaded = $true
}

# Intentar cargar desde .env si .env.local no existe
if (-not $envLoaded) {
    if (Import-EnvFile ".env") {
        $envLoaded = $true
    }
}

if ($envLoaded) {
    Write-Host "  ✅ Variables cargadas desde archivo .env" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No se encontró archivo .env o .env.local" -ForegroundColor Yellow
    Write-Host "     Las variables deben estar en el sistema o en Vercel Dashboard" -ForegroundColor Yellow
}

# Verificar variables de entorno críticas
Write-Host "`n🔍 Verificando variables de entorno críticas..." -ForegroundColor Yellow
$requiredVars = @(
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    $envValue = [Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($envValue)) {
        $missingVars += $var
        Write-Host "  ⚠️  $var no está configurada" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ $var configurada" -ForegroundColor Green
    }
}

# Advertencia pero no error fatal (Vite puede leer del .env durante build)
if ($missingVars.Count -gt 0) {
    Write-Host "`n⚠️  Advertencia: Variables de entorno faltantes:" -ForegroundColor Yellow
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`n💡 Nota: Vite puede leer variables desde .env durante el build" -ForegroundColor Cyan
    Write-Host "   Para producción, configura las variables en Vercel Dashboard" -ForegroundColor Cyan
    Write-Host "`n⏭️  Continuando con el build..." -ForegroundColor Cyan
}

# Limpiar build anterior
Write-Host "`n🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✅ Directorio dist eliminado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green

# Type check
Write-Host "`n🔍 Verificando tipos TypeScript..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en verificación de tipos" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Tipos verificados" -ForegroundColor Green

# Build
Write-Host "`n🔨 Construyendo aplicación..." -ForegroundColor Yellow
$buildStart = Get-Date
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en build" -ForegroundColor Red
    exit 1
}
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds
Write-Host "  ✅ Build completado en $([math]::Round($buildTime, 2))s" -ForegroundColor Green

# Verificar tamaño del build
Write-Host "`n📊 Analizando tamaño del build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  📦 Tamaño total: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
    
    if ($distSize -gt 60) {
        Write-Host "  ⚠️  Advertencia: Build > 60MB ($([math]::Round($distSize, 2)) MB)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Build < 60MB" -ForegroundColor Green
    }
    
    # Verificar chunks
    $jsFiles = @()
    $cssFiles = @()
    if (Test-Path "dist/assets/js") {
        $jsFiles = Get-ChildItem -Path "dist/assets/js" -Filter "*.js" -ErrorAction SilentlyContinue
    }
    if (Test-Path "dist/assets/css") {
        $cssFiles = Get-ChildItem -Path "dist/assets/css" -Filter "*.css" -ErrorAction SilentlyContinue
    }
    
    Write-Host "`n  📄 Archivos generados:" -ForegroundColor Cyan
    Write-Host "    - JS chunks: $($jsFiles.Count)" -ForegroundColor White
    Write-Host "    - CSS files: $($cssFiles.Count)" -ForegroundColor White
    
    # Verificar que index.html existe
    if (Test-Path "dist/index.html") {
        Write-Host "    - ✅ index.html" -ForegroundColor Green
    } else {
        Write-Host "    - ❌ index.html NO encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ❌ Directorio dist no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar errores en consola (simulación)
Write-Host "`n🔍 Verificando errores potenciales..." -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    $indexHtml = Get-Content "dist/index.html" -Raw -ErrorAction SilentlyContinue
    if ($indexHtml) {
        if ($indexHtml -match "src=['\""]/src/main\.tsx['\""]") {
            Write-Host "  ✅ Ruta de main.tsx correcta" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Advertencia: Ruta de main.tsx puede ser incorrecta" -ForegroundColor Yellow
        }
        
        # Verificar que los assets tienen rutas correctas
        if ($indexHtml -match "/assets/") {
            Write-Host "  ✅ Assets referenciados correctamente" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Advertencia: No se encontraron referencias a /assets/" -ForegroundColor Yellow
        }
    }
}

# Deploy a Vercel (opcional)
Write-Host "`n🚀 ¿Deseas desplegar a Vercel? (S/N)" -ForegroundColor Cyan
$deploy = Read-Host
if ($deploy -eq "S" -or $deploy -eq "s" -or $deploy -eq "Y" -or $deploy -eq "y") {
    Write-Host "`n📤 Desplegando a Vercel..." -ForegroundColor Yellow
    
    # Verificar que Vercel CLI está instalado
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercelInstalled) {
        Write-Host "  ⚠️  Vercel CLI no está instalado. Instalando..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    # Deploy
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Error al desplegar" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Deploy completado" -ForegroundColor Green
} else {
    Write-Host "`n💡 Para desplegar manualmente, ejecuta: vercel --prod" -ForegroundColor Yellow
}

Write-Host "`n✅ Proceso completado exitosamente!" -ForegroundColor Green
Write-Host "`n📋 Resumen:" -ForegroundColor Cyan
Write-Host "  - Build: ✅ Completado" -ForegroundColor Green
if ($distSize) {
    Write-Host "  - Tamaño: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
}
if ($jsFiles) {
    Write-Host "  - JS chunks: $($jsFiles.Count)" -ForegroundColor Cyan
}
if ($cssFiles) {
    Write-Host "  - CSS files: $($cssFiles.Count)" -ForegroundColor Cyan
}
if ($buildTime) {
    Write-Host "  - Tiempo: $([math]::Round($buildTime, 2))s" -ForegroundColor Cyan
}

