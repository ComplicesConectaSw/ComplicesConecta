# Script para aplicar migración de campos extendidos a couple_profiles
# ComplicesConecta v3.4.1
# Windows PowerShell

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 APLICAR MIGRACIÓN: Campos Extendidos Couple Profiles ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe el archivo de migración
$migrationFile = "supabase\migrations\20250128_add_couple_profile_extended_fields.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ ERROR: No se encuentra el archivo de migración" -ForegroundColor Red
    Write-Host "   Buscando: $migrationFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo de migración encontrado" -ForegroundColor Green
Write-Host ""

# Mostrar opciones
Write-Host "📋 OPCIONES DE APLICACIÓN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Supabase CLI (Recomendado)" -ForegroundColor White
Write-Host "2️⃣  Dashboard Web de Supabase" -ForegroundColor White
Write-Host "3️⃣  Docker (Si usas Supabase local)" -ForegroundColor White
Write-Host "4️⃣  Copiar SQL al portapapeles" -ForegroundColor White
Write-Host "5️⃣  Ver contenido de la migración" -ForegroundColor White
Write-Host "6️⃣  Salir" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔧 OPCIÓN 1: Supabase CLI" -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si Supabase CLI está instalado
        try {
            $supabaseVersion = supabase --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Supabase CLI instalado: $supabaseVersion" -ForegroundColor Green
                Write-Host ""
                Write-Host "Ejecutando: supabase migration up..." -ForegroundColor Yellow
                supabase migration up
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "✅ ¡Migración aplicada exitosamente!" -ForegroundColor Green
                } else {
                    Write-Host ""
                    Write-Host "❌ Error aplicando migración" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "❌ Supabase CLI no está instalado" -ForegroundColor Red
            Write-Host ""
            Write-Host "📦 Para instalar:" -ForegroundColor Yellow
            Write-Host "   npm install -g supabase" -ForegroundColor White
            Write-Host ""
            Write-Host "📚 Documentación: https://supabase.com/docs/guides/cli" -ForegroundColor Cyan
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🌐 OPCIÓN 2: Dashboard Web de Supabase" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Yellow
        Write-Host "1. Abre: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Selecciona tu proyecto ComplicesConecta" -ForegroundColor White
        Write-Host "3. Ve a: SQL Editor → New Query" -ForegroundColor White
        Write-Host "4. Copia el contenido del archivo:" -ForegroundColor White
        Write-Host "   $migrationFile" -ForegroundColor Cyan
        Write-Host "5. Pega en el editor y ejecuta (Run)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 TIP: El script ya está en tu portapapeles (presiona 4 para copiarlo)" -ForegroundColor Yellow
        Write-Host ""
        $openBrowser = Read-Host "¿Abrir dashboard en navegador? (S/N)"
        if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
            Start-Process "https://supabase.com/dashboard"
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🐳 OPCIÓN 3: Docker (Supabase Local)" -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si Docker está corriendo
        try {
            $null = docker ps 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker está corriendo" -ForegroundColor Green
                Write-Host ""
                
                # Buscar contenedor de Supabase
                $supabaseContainer = docker ps --filter "name=supabase" --format "{{.Names}}" | Select-Object -First 1
                
                if ($supabaseContainer) {
                    Write-Host "📦 Contenedor encontrado: $supabaseContainer" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Ejecutando migración en Docker..." -ForegroundColor Yellow
                    
                    $fullPath = (Get-Item $migrationFile).FullName
                    Get-Content $fullPath | docker exec -i $supabaseContainer psql -U postgres -d postgres
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host ""
                        Write-Host "✅ ¡Migración aplicada exitosamente!" -ForegroundColor Green
                    } else {
                        Write-Host ""
                        Write-Host "❌ Error aplicando migración" -ForegroundColor Red
                    }
                } else {
                    Write-Host "❌ No se encontró contenedor de Supabase" -ForegroundColor Red
                    Write-Host ""
                    Write-Host "💡 Inicia Supabase con:" -ForegroundColor Yellow
                    Write-Host "   supabase start" -ForegroundColor White
                }
            }
        } catch {
            Write-Host "❌ Docker no está instalado o no está corriendo" -ForegroundColor Red
            Write-Host ""
            Write-Host "📦 Instala Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📋 OPCIÓN 4: Copiar SQL al Portapapeles" -ForegroundColor Cyan
        Write-Host ""
        
        $sqlContent = Get-Content $migrationFile -Raw
        Set-Clipboard $sqlContent
        
        Write-Host "✅ ¡SQL copiado al portapapeles!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Ahora puedes:" -ForegroundColor Yellow
        Write-Host "   1. Abrir Supabase Dashboard" -ForegroundColor White
        Write-Host "   2. SQL Editor → New Query" -ForegroundColor White
        Write-Host "   3. Pegar (Ctrl+V) y ejecutar" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Abrir dashboard?" -ForegroundColor Cyan
        $openBrowser = Read-Host "(S/N)"
        if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
            Start-Process "https://supabase.com/dashboard"
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📄 CONTENIDO DE LA MIGRACIÓN:" -ForegroundColor Cyan
        Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
        Get-Content $migrationFile | ForEach-Object {
            if ($_ -match "^--") {
                Write-Host $_ -ForegroundColor Green
            } elseif ($_ -match "ALTER TABLE|CREATE") {
                Write-Host $_ -ForegroundColor Yellow
            } else {
                Write-Host $_
            }
        }
        Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📊 Estadísticas:" -ForegroundColor Cyan
        $lines = (Get-Content $migrationFile).Count
        Write-Host "   - Líneas: $lines" -ForegroundColor White
        Write-Host "   - Campos nuevos: 29" -ForegroundColor White
        Write-Host "   - Índices: 8" -ForegroundColor White
        Write-Host "   - Triggers: 1" -ForegroundColor White
    }
    
    "6" {
        Write-Host ""
        Write-Host "👋 Saliendo..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "📚 DOCUMENTACIÓN COMPLETA:" -ForegroundColor Cyan
Write-Host "   Ver: MIGRACIONES_PENDIENTES.md" -ForegroundColor White
Write-Host ""
Write-Host "🔍 VERIFICAR DESPUÉS:" -ForegroundColor Cyan
Write-Host "   1. npm run lint" -ForegroundColor White
Write-Host "   2. npm test -- --run" -ForegroundColor White
Write-Host "   3. npx supabase gen types typescript --local > src/types/supabase.ts" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

