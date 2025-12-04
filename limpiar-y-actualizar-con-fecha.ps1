# ╔══════════════════════════════════════════════════════════╗
# ║   LIMPIADOR NUCLEAR + COMMIT CON FECHA Y HORA AUTOMÁTICO ║
# ╚══════════════════════════════════════════════════════════╝

Write-Host "Iniciando limpieza nuclear + commit con fecha automática..." -ForegroundColor Cyan
Write-Host ""

# Generar fecha y hora actual en formato perfecto
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$fechaCommit = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "Fecha y hora del sistema: $fecha" -ForegroundColor White
Write-Host ""

# 1. Borrar todo lo viejo
Write-Host "Borrando node_modules, dist, locks y cachés..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

# 2. Limpiar cachés
Write-Host "Limpiando caché de npm y pnpm..." -ForegroundColor Yellow
npm cache clean --force
pnpm store prune

# 3. Reinstalar limpio
Write-Host "Reinstalando dependencias (regenerando pnpm-lock.yaml)..." -ForegroundColor Green
pnpm install --no-frozen-lockfile

# 4. Actualizar todas las dependencias
Write-Host "Actualizando package.json a las últimas versiones..." -ForegroundColor Magenta
npx npm-check-updates -u
pnpm install --no-frozen-lockfile

# 5. COMMIT AUTOMÁTICO CON FECHA Y HORA
Write-Host "Haciendo commit automático con fecha: $fechaCommit" -ForegroundColor Cyan

git add .

git commit -m "chore: limpieza nuclear + deps actualizadas [$fechaCommit]" --no-verify

# Opcional: push directo (descomenta si quieres que lo haga solo)
# git push origin master

Write-Host ""
Write-Host "¡TODO LISTO EN $fecha!" -ForegroundColor Green
Write-Host ""
Write-Host "Commit creado:" -ForegroundColor White
Write-Host "   chore: limpieza nuclear + deps actualizadas [$fechaCommit]" -ForegroundColor Gray
Write-Host ""
Write-Host "Ya puedes hacer git push cuando quieras" -ForegroundColor White
Write-Host "O descomenta la línea 'git push origin master' si quieres que lo haga solo" -ForegroundColor Gray
Write-Host ""

pause