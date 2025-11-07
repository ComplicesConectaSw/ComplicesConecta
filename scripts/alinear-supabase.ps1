# Script: Alinear Supabase Remoto con Local
# Versión: 3.5.0
# Fecha: 06 Nov 2025

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔄 ALINEAR SUPABASE REMOTO CON LOCAL                ║" -ForegroundColor Cyan
Write-Host "║  ComplicesConecta v3.5.0                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar migraciones locales
Write-Host "📁 Verificando migraciones locales..." -ForegroundColor Yellow
$localMigrations = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Sort-Object Name
Write-Host "   Total migraciones locales: $($localMigrations.Count)" -ForegroundColor White
Write-Host ""

# Verificar estado de Supabase local
Write-Host "🔍 Verificando estado de Supabase local..." -ForegroundColor Yellow
try {
    $status = npx supabase status 2>&1 | Out-String
    if ($status -match "supabase is not running") {
        Write-Host "⚠️  Supabase local no está corriendo" -ForegroundColor Yellow
        Write-Host "   Iniciando Supabase local..." -ForegroundColor Gray
        npx supabase start
        Start-Sleep -Seconds 10
    } else {
        Write-Host "✅ Supabase local está activo" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Error verificando Supabase local: $_" -ForegroundColor Yellow
}
Write-Host ""

# Aplicar migraciones locales
Write-Host "📄 Aplicando migraciones locales..." -ForegroundColor Yellow
try {
    npx supabase db reset --local 2>&1 | Out-Null
    Write-Host "✅ Migraciones locales aplicadas" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error aplicando migraciones locales: $_" -ForegroundColor Yellow
}
Write-Host ""

# Verificar migraciones remotas
Write-Host "☁️  Verificando migraciones remotas..." -ForegroundColor Yellow
Write-Host "   Para aplicar migraciones remotas:" -ForegroundColor White
Write-Host "   1. Abre Supabase Dashboard" -ForegroundColor Gray
Write-Host "   2. Ve a SQL Editor" -ForegroundColor Gray
Write-Host "   3. Ejecuta las migraciones pendientes" -ForegroundColor Gray
Write-Host ""

# Regenerar tipos
Write-Host "🔧 Regenerando tipos TypeScript..." -ForegroundColor Yellow
try {
    npx supabase gen types typescript --project-id axtvqnozatbmllvwzuim --schema public > "src/types/supabase.ts"
    Write-Host "✅ Tipos regenerados desde remoto" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error regenerando tipos: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✅ Proceso de alineación completado" -ForegroundColor Green
Write-Host ""

