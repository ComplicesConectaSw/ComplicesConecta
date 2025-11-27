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

# Limpiar build anterior y Android
Write-Host "`n🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✅ Directorio dist eliminado" -ForegroundColor Green
}

# Limpiar Android build también
Write-Host "🧹 Limpiando build de Android..." -ForegroundColor Yellow
$androidDirs = @("android\.gradle", "android\app\build", "android\build", "android\capacitor-cordova-android-plugins\build")
foreach ($dir in $androidDirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
        Write-Host "  ✅ $dir eliminado" -ForegroundColor Green
    }
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
        # Verificar que los assets tienen rutas correctas (Vite inyecta automáticamente)
        if ($indexHtml -match "/assets/" -or $indexHtml -match 'type="module"') {
            Write-Host "  ✅ Assets referenciados correctamente" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Advertencia: No se encontraron referencias a /assets/" -ForegroundColor Yellow
        }
        
        # Verificar que vercel.json no tiene conflictos
        if (Test-Path "vercel.json") {
            $vercelJson = Get-Content "vercel.json" -Raw -ErrorAction SilentlyContinue
            if ($vercelJson -match '"routes"') {
                Write-Host "  ⚠️  Advertencia: vercel.json contiene 'routes' que puede causar conflictos" -ForegroundColor Yellow
                Write-Host "     Vercel no permite 'routes' junto con 'rewrites' o 'headers'" -ForegroundColor Yellow
            } else {
                Write-Host "  ✅ vercel.json configurado correctamente" -ForegroundColor Green
            }
        }
    }
}

# Verificar branch actual antes de deploy
Write-Host "`n🔍 Verificando branch actual..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  📌 Branch actual: $currentBranch" -ForegroundColor Cyan

# Deploy a Vercel
Write-Host "`n🚀 Desplegando en Vercel..." -ForegroundColor Cyan

# Verificar branch actual antes de deploy
Write-Host "`n🔍 Verificando branch actual..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  📌 Branch actual: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "master") {
    Write-Host "  ⚠️  No estás en la rama 'master'. Intentando cambiar..." -ForegroundColor Yellow
    git checkout master
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Error al cambiar a la rama 'master'. Abortando deploy." -ForegroundColor Red
        exit 1
    }
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne "master") {
        Write-Host "  ❌ No se pudo cambiar a la rama 'master'. Abortando deploy." -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Cambiado a la rama 'master'." -ForegroundColor Green
}

# Actualizar la rama master desde el repositorio remoto
Write-Host "`n🔄 Actualizando la rama 'master' desde origin..." -ForegroundColor Yellow
git pull origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Error al actualizar la rama 'master' desde origin. Abortando deploy." -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Rama 'master' actualizada." -ForegroundColor Green

# Verificar que Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "  ⚠️  Vercel CLI no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy desde master
Write-Host "`n  📤 Desplegando desde rama 'master' a producción..." -ForegroundColor Yellow
vercel --prod --yes --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Error al desplegar" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Deploy completado desde 'master'" -ForegroundColor Green

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

