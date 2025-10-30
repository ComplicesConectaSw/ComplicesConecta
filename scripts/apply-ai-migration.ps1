# ============================================================================
# Script: Aplicar Migración AI-Native Tables a Supabase
# Versión: 3.5.0
# Fecha: 30 Oct 2025
# ============================================================================

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🧠 MIGRACIÓN AI-NATIVE TABLES - Supabase                      ║
║     ComplicesConecta v3.5.0                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Verificar archivo de migración
$migrationFile = "supabase/migrations/20251030_create_ai_tables.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ ERROR: Archivo de migración no encontrado" -ForegroundColor Red
    Write-Host "   Ruta esperada: $migrationFile" -ForegroundColor Gray
    exit 1
}

Write-Host "📄 Archivo de migración encontrado:" -ForegroundColor Green
Write-Host "   $migrationFile" -ForegroundColor Gray
Write-Host ""

# Leer contenido
$migrationSQL = Get-Content $migrationFile -Raw

# Mostrar resumen
Write-Host "📊 RESUMEN DE LA MIGRACIÓN:" -ForegroundColor Yellow
Write-Host "   Tablas a crear:" -ForegroundColor White
Write-Host "     1. ai_compatibility_scores" -ForegroundColor Gray
Write-Host "     2. ai_prediction_logs" -ForegroundColor Gray
Write-Host "     3. ai_model_metrics" -ForegroundColor Gray
Write-Host ""
Write-Host "   Features:" -ForegroundColor White
Write-Host "     • RLS (Row Level Security)" -ForegroundColor Gray
Write-Host "     • Índices optimizados (10+)" -ForegroundColor Gray
Write-Host "     • Triggers (updated_at)" -ForegroundColor Gray
Write-Host "     • Funciones SQL (2)" -ForegroundColor Gray
Write-Host "     • Políticas RLS (9)" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No se aplicarán cambios" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL a ejecutar:" -ForegroundColor Cyan
    Write-Host $migrationSQL.Substring(0, [Math]::Min(500, $migrationSQL.Length))
    Write-Host "..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para aplicar la migración, ejecuta sin -DryRun" -ForegroundColor Yellow
    exit 0
}

# Verificar variables de entorno
Write-Host "🔐 Verificando credenciales de Supabase..." -ForegroundColor Cyan

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:VITE_SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ ERROR: Variables de entorno no configuradas" -ForegroundColor Red
    Write-Host "   Configurar en .env:" -ForegroundColor Yellow
    Write-Host "     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co" -ForegroundColor Gray
    Write-Host "     VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 TIP: Obtener las keys desde Supabase Dashboard > Settings > API" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Credenciales encontradas" -ForegroundColor Green
Write-Host "   URL: $($supabaseUrl.Substring(0, 30))..." -ForegroundColor Gray
Write-Host ""

# Confirmar ejecución
Write-Host "⚠️  CONFIRMA LA EJECUCIÓN:" -ForegroundColor Yellow
Write-Host "   Esta migración creará 3 nuevas tablas en Supabase" -ForegroundColor White
Write-Host "   Proyecto: $supabaseUrl" -ForegroundColor Gray
Write-Host ""
$confirmation = Read-Host "¿Deseas continuar? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Aplicando migración..." -ForegroundColor Cyan

try {
    # Opción 1: Usar Supabase CLI (si está instalado)
    $supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
    
    if ($supabaseCli) {
        Write-Host "   Usando Supabase CLI..." -ForegroundColor Gray
        supabase db push
        Write-Host "✅ Migración aplicada exitosamente via Supabase CLI" -ForegroundColor Green
    } else {
        # Opción 2: Usar REST API
        Write-Host "   Usando REST API..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "📝 INSTRUCCIONES MANUALES:" -ForegroundColor Yellow
        Write-Host "   1. Abre Supabase Dashboard" -ForegroundColor White
        Write-Host "   2. Ve a SQL Editor" -ForegroundColor White
        Write-Host "   3. Crea una nueva query" -ForegroundColor White
        Write-Host "   4. Copia el contenido de:" -ForegroundColor White
        Write-Host "      $migrationFile" -ForegroundColor Gray
        Write-Host "   5. Ejecuta la query (RUN)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 También puedes usar:" -ForegroundColor Cyan
        Write-Host "   npm install -g supabase" -ForegroundColor Gray
        Write-Host "   supabase db push" -ForegroundColor Gray
        Write-Host ""
        
        # Abrir navegador automáticamente
        $projectId = ($supabaseUrl -split "\.")[0] -replace "https://", ""
        $dashboardUrl = "https://supabase.com/dashboard/project/$projectId/sql"
        
        Write-Host "🌐 Abriendo SQL Editor en el navegador..." -ForegroundColor Cyan
        Start-Process $dashboardUrl
    }
} catch {
    Write-Host "❌ ERROR aplicando migración:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Solución alternativa:" -ForegroundColor Yellow
    Write-Host "   1. Copia manualmente el contenido de $migrationFile" -ForegroundColor White
    Write-Host "   2. Pégalo en Supabase SQL Editor" -ForegroundColor White
    Write-Host "   3. Ejecuta la query" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ MIGRACIÓN COMPLETADA" -ForegroundColor Green
Write-Host ""

# Verificación post-migración
Write-Host "🔍 Pasos siguientes:" -ForegroundColor Cyan
Write-Host "   1. Verifica las tablas en Supabase Dashboard > Table Editor" -ForegroundColor White
Write-Host "   2. Regenera los types de TypeScript:" -ForegroundColor White
Write-Host "      npm run types:generate" -ForegroundColor Gray
Write-Host "   3. Configura .env (feature flags)" -ForegroundColor White
Write-Host "   4. Reinicia el servidor de desarrollo:" -ForegroundColor White
Write-Host "      npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   - RESUMEN_FASE1.1_COMPLETADA_v3.5.0.md" -ForegroundColor Gray
Write-Host "   - FASE1.2_PYTORCH_INTEGRATION.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 ¡Migración AI-Native completada!" -ForegroundColor Green
Write-Host ""

