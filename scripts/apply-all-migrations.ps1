# ============================================================================
# Script: Aplicar Todas las Migraciones y Alinear BD
# Versión: 3.5.0
# Fecha: 30 Oct 2025
# ============================================================================

param(
    [switch]$SkipAI = $false,
    [switch]$SkipChat = $false
)

$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🗄️ APLICAR MIGRACIONES Y ALINEAR BD                          ║
║     ComplicesConecta v3.5.0                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Verificar si Docker está corriendo
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está corriendo"
    }
    Write-Host "✅ Docker activo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible" -ForegroundColor Red
    Write-Host "   Iniciando Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "   Esperando 30 segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "📋 MIGRACIONES A APLICAR:" -ForegroundColor Cyan
Write-Host "  1. 20251030_create_ai_tables.sql (AI-Native Layer)" -ForegroundColor White
Write-Host "  2. 20251030_create_chat_summaries.sql (Chat Summaries ML)" -ForegroundColor White
Write-Host ""

# Función para aplicar migración SQL
function Invoke-Migration {
    param(
        [string]$MigrationFile,
        [string]$Description
    )
    
    Write-Host "📄 Aplicando: $Description" -ForegroundColor Yellow
    
    if (-not (Test-Path $MigrationFile)) {
        Write-Host "   ❌ Archivo no encontrado: $MigrationFile" -ForegroundColor Red
        return $false
    }
    
    try {
        # Leer contenido
        $sql = Get-Content $MigrationFile -Raw -Encoding UTF8
        
        # Guardar en archivo temporal
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        $sql | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
        
        # Aplicar usando psql (si está disponible) o supabase CLI
        $supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
        
        if ($supabaseCli) {
            Write-Host "   Usando Supabase CLI..." -ForegroundColor Gray
            supabase db execute -f $tempFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Aplicada exitosamente" -ForegroundColor Green
                Remove-Item $tempFile -Force
                return $true
            } else {
                Write-Host "   ❌ Error aplicando migración" -ForegroundColor Red
                Remove-Item $tempFile -Force
                return $false
            }
        } else {
            Write-Host "   ⚠️  Supabase CLI no disponible" -ForegroundColor Yellow
            Write-Host "   Aplicar manualmente desde Supabase Dashboard" -ForegroundColor Yellow
            Remove-Item $tempFile -Force
            return $false
        }
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

# Aplicar migraciones
$success = @()

if (-not $SkipAI) {
    $result = Invoke-Migration `
        -MigrationFile "supabase/migrations/20251030_create_ai_tables.sql" `
        -Description "AI-Native Layer Tables"
    $success += $result
}

if (-not $SkipChat) {
    $result = Invoke-Migration `
        -MigrationFile "supabase/migrations/20251030_create_chat_summaries.sql" `
        -Description "Chat Summaries ML Tables"
    $success += $result
}

Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
$successCount = ($success | Where-Object { $_ -eq $true }).Count
$totalCount = $success.Count

Write-Host "  Aplicadas: $successCount / $totalCount" -ForegroundColor White

if ($successCount -eq $totalCount) {
    Write-Host "  ✅ Todas las migraciones aplicadas" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Algunas migraciones fallaron" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 APLICACIÓN MANUAL:" -ForegroundColor Yellow
    Write-Host "  1. Abre Supabase Dashboard" -ForegroundColor White
    Write-Host "  2. Ve a SQL Editor" -ForegroundColor White
    Write-Host "  3. Copia y pega el contenido de:" -ForegroundColor White
    Write-Host "     - supabase/migrations/20251030_create_ai_tables.sql" -ForegroundColor Gray
    Write-Host "     - supabase/migrations/20251030_create_chat_summaries.sql" -ForegroundColor Gray
    Write-Host "  4. Ejecuta cada query" -ForegroundColor White
}

Write-Host ""
Write-Host "🔄 REGENERANDO TYPES DE SUPABASE..." -ForegroundColor Cyan
try {
    npx supabase gen types typescript --local > src/types/supabase-generated.ts
    Write-Host "✅ Types regenerados" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error regenerando types (ejecutar manualmente)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host ""

