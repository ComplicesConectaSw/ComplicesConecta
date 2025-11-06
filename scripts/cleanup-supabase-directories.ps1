# Script para Limpiar Directorios Obsoletos de Supabase
# Versión: 3.5.0

$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🧹 LIMPIEZA DE DIRECTORIOS SUPABASE                           ║
║     ComplicesConecta v3.5.0                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Directorios a mantener
$keepDirectories = @(
    "migrations",  # Migraciones activas
    "functions"   # Edge Functions activas
)

# Directorios a eliminar (obsoletos o temporales)
$obsoleteDirectories = @(
    ".temp",      # Directorio temporal
    ".branches",  # Directorio de branches (temporal)
    "backups"     # Backups antiguos (ya consolidados)
)

# Archivos SQL fuera de migrations a mover o eliminar
$sqlFilesOutsideMigrations = @(
    "migraciones-para-remoto.sql",
    "execute-critical-queries.sql",
    "fix_get_profiles_in_cells.sql"
)

Write-Host "📋 Directorios a mantener:" -ForegroundColor Yellow
foreach ($dir in $keepDirectories) {
    $path = "supabase\$dir"
    if (Test-Path $path) {
        $fileCount = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "  ✅ $dir ($fileCount archivos)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $dir (no existe)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🗑️  Directorios a eliminar:" -ForegroundColor Yellow
foreach ($dir in $obsoleteDirectories) {
    $path = "supabase\$dir"
    if (Test-Path $path) {
        $fileCount = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "  ❌ $dir ($fileCount archivos)" -ForegroundColor Red
    } else {
        Write-Host "  ℹ️  $dir (ya no existe)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📄 Archivos SQL fuera de migrations:" -ForegroundColor Yellow
foreach ($file in $sqlFilesOutsideMigrations) {
    $path = "supabase\$file"
    if (Test-Path $path) {
        Write-Host "  ⚠️  $file" -ForegroundColor Yellow
    }
}

Write-Host ""
$confirm = Read-Host "¿Deseas continuar con la limpieza? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

# Eliminar directorios obsoletos
Write-Host ""
Write-Host "🗑️  Eliminando directorios obsoletos..." -ForegroundColor Yellow
foreach ($dir in $obsoleteDirectories) {
    $path = "supabase\$dir"
    if (Test-Path $path) {
        try {
            Remove-Item $path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Eliminado: $dir" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error eliminando $dir : $_" -ForegroundColor Red
        }
    }
}

# Mover archivos SQL importantes a migrations si no están
Write-Host ""
Write-Host "📦 Verificando archivos SQL..." -ForegroundColor Yellow
foreach ($file in $sqlFilesOutsideMigrations) {
    $sourcePath = "supabase\$file"
    $targetPath = "supabase\migrations\$file"
    
    if (Test-Path $sourcePath -and -not (Test-Path $targetPath)) {
        Write-Host "  ⚠️  $file está fuera de migrations" -ForegroundColor Yellow
        Write-Host "     Considerar moverlo manualmente si es necesario" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Estado final:" -ForegroundColor Cyan
$migrationsCount = (Get-ChildItem "supabase\migrations" -File -ErrorAction SilentlyContinue | Measure-Object).Count
$functionsCount = (Get-ChildItem "supabase\functions" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "  Migraciones: $migrationsCount archivos" -ForegroundColor White
Write-Host "  Functions: $functionsCount archivos" -ForegroundColor White

